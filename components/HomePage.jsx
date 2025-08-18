import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5, Ionicons, Feather, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

const { width, height } = Dimensions.get("window");
const MAX_SPEED = 120;
const OFFLINE_THRESHOLD_MS = 120000; // 2 minutes without data = offline (since data is sent every 1 min)

const HomePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = route.params?.userId;

  const [deviceData, setDeviceData] = useState({
    speed: 0,
    temperature: 0,
    humidity: 0,
    lastSyncTime: null,
    status: "Offline"
  });

  const [tripStats, setTripStats] = useState({
    todayDistance: 0,
    weekDistance: 0,
    avgSpeed: 0,
    drivingTime: 0, // minutes
    fuelEfficiency: 0 // km/l
  });

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDataReceived, setLastDataReceived] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  // Fetch initial data and set up subscription
  useEffect(() => {
    let subscription;
    let statusCheckInterval;
    
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch most recent sensor data
        const { data, error } = await supabase
          .from('sensor_data')
          .select('speed, temperature, humidity, time')
          .eq('user_id', userId)
          .order('time', { ascending: false })
          .limit(1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const latestReading = data[0];
          const lastReadingTime = new Date(latestReading.time);
          const now = new Date();
          
          // Check if the latest reading is within the threshold
          const isCurrentlyOnline = (now - lastReadingTime) < OFFLINE_THRESHOLD_MS;
          setIsOnline(isCurrentlyOnline);
          setLastDataReceived(lastReadingTime);
          
          if (isCurrentlyOnline) {
            setDeviceData({
              speed: latestReading.speed || 0,
              temperature: latestReading.temperature || 0,
              humidity: latestReading.humidity || 0,
              lastSyncTime: lastReadingTime.toLocaleString(),
              status: "Online"
            });
          } else {
            setDeviceData({
              speed: 0,
              temperature: 0,
              humidity: 0,
              lastSyncTime: lastReadingTime.toLocaleString(),
              status: "Offline"
            });
          }
        }
        
        // Calculate trip statistics
        await calculateTripStats();
        
        // Generate some sample alerts based on data
        generateAlerts(data && data.length > 0 ? data[0] : null);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    const calculateTripStats = async () => {
      try {
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get start of week
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        // Fetch data from today
        const { data: todayData, error: todayError } = await supabase
          .from('sensor_data')
          .select('speed, time, latitude, longitude')
          .eq('user_id', userId)
          .gte('time', today.toISOString())
          .order('time', { ascending: true });
        
        if (todayError) throw todayError;
        
        // Fetch data from this week
        const { data: weekData, error: weekError } = await supabase
          .from('sensor_data')
          .select('speed, time, latitude, longitude')
          .eq('user_id', userId)
          .gte('time', startOfWeek.toISOString())
          .order('time', { ascending: true });
        
        if (weekError) throw weekError;
        
        // Calculate distance, average speed, and driving time
        const todayStats = calculateStats(todayData || []);
        const weekStats = calculateStats(weekData || []);
        
        setTripStats({
          todayDistance: todayStats.distance,
          weekDistance: weekStats.distance,
          avgSpeed: todayStats.avgSpeed,
          drivingTime: todayStats.drivingTime,
          fuelEfficiency: (Math.random() * 5 + 10).toFixed(1) // Sample fuel efficiency (would need actual fuel data)
        });
        
      } catch (err) {
        console.error("Error calculating trip stats:", err);
      }
    };
    
    const calculateStats = (data) => {
      if (!data || data.length < 2) {
        return { distance: 0, avgSpeed: 0, drivingTime: 0 };
      }
      
      let totalDistance = 0;
      let totalSpeed = 0;
      let validSpeedReadings = 0;
      
      // Calculate distance from GPS coordinates and average speed
      for (let i = 1; i < data.length; i++) {
        if (data[i].latitude && data[i].longitude && data[i-1].latitude && data[i-1].longitude) {
          totalDistance += calculateDistance(
            data[i-1].latitude, data[i-1].longitude,
            data[i].latitude, data[i].longitude
          );
        }
        
        if (data[i].speed) {
          totalSpeed += data[i].speed;
          validSpeedReadings++;
        }
      }
      
      // Estimate driving time (approx)
      const firstTimestamp = new Date(data[0].time);
      const lastTimestamp = new Date(data[data.length - 1].time);
      const timeDiffMinutes = (lastTimestamp - firstTimestamp) / (1000 * 60);
      
      // Filter out idle time (simple approximation)
      const drivingTime = Math.max(1, Math.round(timeDiffMinutes * 0.7));
      
      return {
        distance: parseFloat(totalDistance.toFixed(1)),
        avgSpeed: Math.round(validSpeedReadings > 0 ? totalSpeed / validSpeedReadings : 0),
        drivingTime: drivingTime
      };
    };
    
    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const distance = R * c; // Distance in km
      return distance;
    };
    
    const deg2rad = (deg) => {
      return deg * (Math.PI/180);
    };
    
    const generateAlerts = (data) => {
      const sampleAlerts = [];
      
      // Add system alert
      sampleAlerts.push({
        id: 1,
        type: "info",
        message: "Supabase connection established",
        time: "Just now",
        read: false
      });
      
      // Add alert based on temperature if available
      if (data && data.temperature) {
        if (data.temperature > 27) {
          sampleAlerts.push({
            id: 2,
            type: "warning",
            message: "High temperature detected: " + data.temperature.toFixed(1) + "°C",
            time: "5 min ago",
            read: false
          });
        }
      }
      
      // Add default maintenance reminder
      sampleAlerts.push({
        id: 3,
        type: "info",
        message: "Scheduled maintenance coming up next week",
        time: "Yesterday",
        read: true
      });
      
      setAlerts(sampleAlerts);
    };
    
    const setupRealtimeSubscription = async () => {
      // Subscribe to changes on the sensor_data table for this user
      subscription = supabase
        .channel('dashboard_updates')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'sensor_data',
            filter: `user_id=eq.${userId}`
          }, 
          (payload) => {
            const newReading = payload.new;
            const now = new Date();
            
            // Update last data received timestamp
            setLastDataReceived(now);
            setIsOnline(true);
            
            // Update current readings with latest data
            setDeviceData(prev => ({
              speed: newReading.speed || prev.speed,
              temperature: newReading.temperature || prev.temperature,
              humidity: newReading.humidity || prev.humidity,
              lastSyncTime: now.toLocaleString(),
              status: "Online"
            }));
            
            // Recalculate trip stats periodically (not on every update to avoid excessive calculations)
            if (Math.random() > 0.7) {
              calculateTripStats();
            }
          }
        )
        .subscribe();
    };

    // Set up interval to check online status
    statusCheckInterval = setInterval(() => {
      if (lastDataReceived) {
        const now = new Date();
        const timeSinceLastData = now - lastDataReceived;
        
        if (timeSinceLastData > OFFLINE_THRESHOLD_MS && isOnline) {
          // If no data received for threshold period, set to offline and reset values
          setIsOnline(false);
          setDeviceData(prev => ({
            speed: 0,
            temperature: 0,
            humidity: 0,
            lastSyncTime: prev.lastSyncTime,
            status: "Offline"
          }));
        }
      }
    }, 5000); // Check every 5 seconds

    fetchInitialData();
    setupRealtimeSubscription();

    // Clean up subscription and interval on unmount
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [userId]);

  // Function to format minutes into hours and minutes
  const formatDrivingTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Function to get alert icon and color
  const getAlertTypeInfo = (type) => {
    switch (type) {
      case "warning":
        return { icon: "warning", color: "#FFC107" };
      case "critical":
        return { icon: "error", color: "#F44336" };
      case "info":
        return { icon: "info", color: "#2196F3" };
      default:
        return { icon: "notifications", color: "#4f8cff" };
    }
  };

  return (
    <View style={styles.container}>
      {/* Top left gradient circle */}
      <LinearGradient
        colors={["#4f8cff", "#3358d1"]}
        style={styles.topLeftCircle}
        start={[0, 0]}
        end={[1, 1]}
      />
      {/* Bottom right gradient circle */}
      <LinearGradient
        colors={["#232946", "#4f8cff"]}
        style={styles.bottomRightCircle}
        start={[0, 1]}
        end={[1, 0]}
      />
      
      <Text style={styles.title}>Dashboard</Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4f8cff" />
            <Text style={styles.loadingText}>Loading dashboard data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={40} color="#f44336" />
            <Text style={styles.errorText}>Error loading data</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Status Card with Status Indicator */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={styles.statusIndicator}>
                  <View style={[styles.statusDot, {backgroundColor: deviceData.status === "Online" ? "#4CAF50" : "#F44336"}]} />
                  <Text style={styles.statusText}>{deviceData.status}</Text>
                </View>
                {deviceData.lastSyncTime && (
                  <Text style={styles.lastSyncText}>Last sync: {deviceData.lastSyncTime}</Text>
                )}
              </View>
              
              <View style={styles.statusRow}>
                <View style={styles.statusItem}>
                  <MaterialCommunityIcons name="speedometer" size={22} color="#4f8cff" />
                  <Text style={styles.statusItemValue}>{Math.round(deviceData.speed)}</Text>
                  <Text style={styles.statusItemLabel}>km/h</Text>
                </View>
                
                <View style={styles.statusItem}>
                  <MaterialCommunityIcons name="thermometer" size={22} color="#FFC107" />
                  <Text style={styles.statusItemValue}>{deviceData.temperature.toFixed(1)}</Text>
                  <Text style={styles.statusItemLabel}>°C</Text>
                </View>
                
                <View style={styles.statusItem}>
                  <MaterialCommunityIcons name="water-percent" size={22} color="#2196F3" />
                  <Text style={styles.statusItemValue}>{Math.round(deviceData.humidity)}</Text>
                  <Text style={styles.statusItemLabel}>%</Text>
                </View>
              </View>
            </View>
          
            {/* Trip Summary Card */}
            <View style={styles.tripSummaryCard}>
              <View style={styles.tripSummaryHeader}>
                <MaterialCommunityIcons name="car-clock" size={22} color="#4f8cff" />
                <Text style={styles.sectionTitle}>Trip Summary</Text>
              </View>
              
              <View style={styles.tripMetricsRow}>
                <View style={styles.tripMetric}>
                  <Text style={styles.tripMetricValue}>{tripStats.todayDistance} km</Text>
                  <Text style={styles.tripMetricLabel}>Today</Text>
                </View>
                <View style={styles.tripMetric}>
                  <Text style={styles.tripMetricValue}>{tripStats.weekDistance} km</Text>
                  <Text style={styles.tripMetricLabel}>This Week</Text>
                </View>
              </View>
              
              <View style={styles.tripDetailsRow}>
                <View style={styles.tripDetailItem}>
                  <MaterialCommunityIcons name="speedometer" size={16} color="#bfc9d1" />
                  <Text style={styles.tripDetailLabel}>Avg Speed:</Text>
                  <Text style={styles.tripDetailValue}>{tripStats.avgSpeed} km/h</Text>
                </View>
                <View style={styles.tripDetailItem}>
                  <MaterialIcons name="timer" size={16} color="#bfc9d1" />
                  <Text style={styles.tripDetailLabel}>Drive Time:</Text>
                  <Text style={styles.tripDetailValue}>{formatDrivingTime(tripStats.drivingTime)}</Text>
                </View>
              </View>
              
              <View style={styles.tripDetailsRow}>
                <View style={styles.tripDetailItem}>
                  <MaterialCommunityIcons name="gas-station" size={16} color="#bfc9d1" />
                  <Text style={styles.tripDetailLabel}>Efficiency:</Text>
                  <Text style={styles.tripDetailValue}>{tripStats.fuelEfficiency} km/l</Text>
                </View>
                <TouchableOpacity style={styles.viewTripDetailsButton}>
                  <Text style={styles.viewTripDetailsText}>View Details</Text>
                  <AntDesign name="right" size={12} color="#4f8cff" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Alerts and Notifications Card */}
            <View style={styles.alertsCard}>
              <View style={styles.alertsHeader}>
                <View style={styles.alertsHeaderLeft}>
                  <MaterialIcons name="notifications" size={22} color="#4f8cff" />
                  <Text style={styles.sectionTitle}>Alerts & Notifications</Text>
                </View>
                <TouchableOpacity style={styles.markAllReadButton}>
                  <Text style={styles.markAllReadText}>Mark all read</Text>
                </TouchableOpacity>
              </View>
              
              {alerts.map(alert => {
                const typeInfo = getAlertTypeInfo(alert.type);
                return (
                  <View key={alert.id} style={[styles.alertItem, alert.read ? styles.alertItemRead : null]}>
                    <View style={styles.alertIconContainer}>
                      <MaterialIcons name={typeInfo.icon} size={20} color={typeInfo.color} />
                    </View>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertMessage}>{alert.message}</Text>
                      <Text style={styles.alertTime}>{alert.time}</Text>
                    </View>
                    {!alert.read && <View style={styles.unreadIndicator} />}
                  </View>
                );
              })}
              
              <TouchableOpacity style={styles.viewAllAlertsButton}>
                <Text style={styles.viewAllAlertsText}>View All Notifications</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
      
      {/* Floating Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={[styles.navItem, styles.activeNavItem]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="home-variant" style={[styles.navIcon, styles.activeNavIcon]} />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("IMU", { userId })}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="chart-line" style={styles.navIcon} />
          <Text style={styles.navText}>IMU</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("DTH", { userId })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="thermometer" style={styles.navIcon} />
          <Text style={styles.navText}>DTH</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("GPS", { userId })}
          activeOpacity={0.7}
        >
          <Ionicons name="location-sharp" style={styles.navIcon} />
          <Text style={styles.navText}>GPS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Profile", { userId })}
          activeOpacity={0.7}
        >
          <Feather name="user" style={styles.navIcon} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const NAVBAR_HEIGHT = 100;
const NAVBAR_MARGIN = 24;

const styles = StyleSheet.create({
  container: {
    minHeight: "100%",
    width: "100%",
    backgroundColor: "#181c2f",
    flex: 1,
    alignItems: "center",
  },
  topLeftCircle: {
    position: "absolute",
    top: -width * 0.3,
    left: -width * 0.2,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    opacity: 0.7,
    zIndex: 0,
  },
  bottomRightCircle: {
    position: "absolute",
    bottom: -width * 0.25,
    right: -width * 0.15,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    opacity: 0.5,
    zIndex: 0,
  },
  card: {
    backgroundColor: "rgba(34, 40, 57, 0.95)",
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 20,
    width: "90%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#1f2687",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    marginTop: 50,
    marginBottom: 20,
    fontWeight: "700",
    fontSize: 24,
    zIndex: 1,
  },
  scrollView: {
    width: "100%",
    zIndex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: NAVBAR_HEIGHT + 20,
  },
  // Status Card Styles
  statusCard: {
    backgroundColor: "rgba(34, 40, 57, 0.95)",
    borderRadius: 24,
    width: "90%",
    maxWidth: 380,
    padding: 20,
    shadowColor: "#1f2687",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(43, 51, 73, 0.7)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(43, 51, 73, 0.5)",
    borderRadius: 16,
    padding: 15,
  },
  statusItem: {
    alignItems: "center",
  },
  statusItemValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 2,
  },
  statusItemLabel: {
    color: "#bfc9d1",
    fontSize: 12,
  },
  // Info Styles
  infoTitle: {
    color: "#4f8cff",
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 8,
    alignSelf: "center",
    width: "100%",
    textAlign: "center",
  },
  infoLabel: {
    color: "#bfc9d1",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
  },
  infoValue: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 2,
    marginLeft: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    marginTop: 2,
  },
  // Navbar Styles
  navbar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: NAVBAR_HEIGHT,
    backgroundColor: "rgba(35, 41, 70, 0.98)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    zIndex: 10,
    shadowColor: "#1f2687",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 15,
    paddingHorizontal: width * 0.04,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeNavItem: {
    backgroundColor: "rgba(79, 140, 255, 0.15)",
  },
  navIcon: {
    fontSize: Math.round(width * 0.07),
    color: "#4f8cff",
    marginBottom: 2,
  },
  activeNavIcon: {
    color: "#ffffff",
  },
  navText: {
    color: "#bfc9d1",
    fontSize: Math.round(width * 0.032),
    fontWeight: "600",
  },
  activeNavText: {
    color: "#ffffff",
  },
  // Trip Summary Card Styles
  tripSummaryCard: {
    backgroundColor: "rgba(34, 40, 57, 0.95)",
    borderRadius: 24,
    width: "90%",
    maxWidth: 380,
    padding: 20,
    shadowColor: "#1f2687",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  tripSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#4f8cff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  tripMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tripMetric: {
    backgroundColor: "rgba(43, 51, 73, 0.7)",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    alignItems: "center",
  },
  tripMetricValue: {
    color: "#4f8cff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tripMetricLabel: {
    color: "#bfc9d1",
    fontSize: 12,
  },
  tripDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  tripDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  tripDetailLabel: {
    color: "#bfc9d1",
    fontSize: 13,
    marginLeft: 6,
    marginRight: 4,
  },
  tripDetailValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  viewTripDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(79, 140, 255, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  viewTripDetailsText: {
    color: "#4f8cff",
    fontSize: 12,
    marginRight: 4,
  },
  
  // Alerts Card Styles
  alertsCard: {
    backgroundColor: "rgba(34, 40, 57, 0.95)",
    borderRadius: 24,
    width: "90%",
    maxWidth: 380,
    padding: 20,
    shadowColor: "#1f2687",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  alertsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  alertsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  markAllReadButton: {
    backgroundColor: "rgba(79, 140, 255, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  markAllReadText: {
    color: "#4f8cff",
    fontSize: 11,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(43, 51, 73, 0.7)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  alertItemRead: {
    opacity: 0.7,
  },
  alertIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(35, 41, 70, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    color: "#fff",
    fontSize: 13,
    marginBottom: 2,
  },
  alertTime: {
    color: "#bfc9d1",
    fontSize: 11,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4f8cff",
    marginLeft: 8,
  },
  viewAllAlertsButton: {
    backgroundColor: "rgba(79, 140, 255, 0.1)",
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 6,
  },
  viewAllAlertsText: {
    color: "#4f8cff",
    fontSize: 13,
    fontWeight: "500",
  },
  lastSyncText: {
    color: "#bfc9d1",
    fontSize: 12,
  },
  loadingContainer: {
    backgroundColor: "rgba(34, 40, 57, 0.95)",
    borderRadius: 24,
    width: "90%",
    maxWidth: 380,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  loadingText: {
    color: "#bfc9d1",
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: "rgba(34, 40, 57, 0.95)",
    borderRadius: 24,
    width: "90%",
    maxWidth: 380,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  errorText: {
    color: "#f44336",
    marginTop: 12,
    fontSize: 18,
    fontWeight: "bold",
  },
  errorSubtext: {
    color: "#bfc9d1",
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
});

export default HomePage;