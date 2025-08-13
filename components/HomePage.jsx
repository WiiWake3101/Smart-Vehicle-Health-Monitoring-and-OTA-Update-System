import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5, Ionicons, Feather, MaterialIcons, AntDesign } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const MAX_SPEED = 120; // Adjust as needed

const HomePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = route.params?.userId;

  const [deviceData, setDeviceData] = useState({
    speed: 0,
    temperature: 24.5,
    humidity: 58,
    batteryLevel: 82,
    lastSyncTime: "2025-08-10 15:30",
    firmware: "v1.2.3",
    status: "Online"
  });

  // Add trip statistics state
  const [tripStats, setTripStats] = useState({
    todayDistance: 45.7,
    weekDistance: 187.3,
    avgSpeed: 57,
    drivingTime: 126, // minutes
    fuelEfficiency: 14.2 // km/l
  });

  // Add alerts state
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "warning",
      message: "Engine temperature slightly elevated",
      time: "1 hour ago",
      read: false
    },
    {
      id: 2,
      type: "info",
      message: "Firmware update available (v1.2.4)",
      time: "5 hours ago",
      read: true
    },
    {
      id: 3,
      type: "critical",
      message: "Low tire pressure detected (front-right)",
      time: "Today, 10:30 AM",
      read: false
    }
  ]);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceData(prev => ({
        ...prev,
        speed: Math.floor(Math.random() * 121),
        temperature: parseFloat((Math.random() * 5 + 22).toFixed(1)),
        humidity: Math.floor(Math.random() * 20 + 50),
        batteryLevel: prev.batteryLevel > 20 ? prev.batteryLevel - 1 : 100
      }));
      
      // Occasionally update trip stats
      if (Math.random() > 0.7) {
        setTripStats(prev => ({
          ...prev,
          todayDistance: parseFloat((prev.todayDistance + Math.random() * 0.3).toFixed(1)),
          avgSpeed: Math.max(40, Math.min(80, prev.avgSpeed + (Math.random() > 0.5 ? 1 : -1))),
          drivingTime: prev.drivingTime + 1
        }));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Function to determine battery status color
  const getBatteryColor = (level) => {
    if (level > 50) return "#4CAF50"; // Good - green
    if (level > 20) return "#FFC107"; // Warning - yellow
    return "#F44336"; // Critical - red
  };

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
        {/* Status Card with Status Indicator */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, {backgroundColor: "#4CAF50"}]} />
              <Text style={styles.statusText}>{deviceData.status}</Text>
            </View>
            {/* Battery container removed */}
          </View>
          
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <MaterialCommunityIcons name="speedometer" size={22} color="#4f8cff" />
              <Text style={styles.statusItemValue}>{deviceData.speed}</Text>
              <Text style={styles.statusItemLabel}>km/h</Text>
            </View>
            
            <View style={styles.statusItem}>
              <MaterialCommunityIcons name="thermometer" size={22} color="#FFC107" />
              <Text style={styles.statusItemValue}>{deviceData.temperature}</Text>
              <Text style={styles.statusItemLabel}>°C</Text>
            </View>
            
            <View style={styles.statusItem}>
              <MaterialCommunityIcons name="water-percent" size={22} color="#2196F3" />
              <Text style={styles.statusItemValue}>{deviceData.humidity}</Text>
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
});

export default HomePage;