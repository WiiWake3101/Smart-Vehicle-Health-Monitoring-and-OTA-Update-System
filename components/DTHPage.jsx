import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5, Ionicons, Feather, FontAwesome } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { LineChart } from "react-native-chart-kit";

const { width, height } = Dimensions.get("window");

const DTHPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = route.params?.userId;

  // State for temperature and humidity data
  const [currentReadings, setCurrentReadings] = useState({
    temperature: 0,
    humidity: 0,
    lastUpdated: null
  });

  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data and set up real-time subscription
  useEffect(() => {
    let subscription;

    const fetchCurrentData = async () => {
      try {
        setLoading(true);

        // Fetch most recent reading for this user
        const { data, error } = await supabase
          .from('sensor_data')
          .select('temperature, humidity, time')
          .eq('user_id', userId)
          .order('time', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const lastReading = data[0];
          setCurrentReadings({
            temperature: parseFloat(lastReading.temperature),
            humidity: parseFloat(lastReading.humidity),
            lastUpdated: new Date(lastReading.time).toLocaleTimeString()
          });
        }

        // Fetch historical data for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: histData, error: histError } = await supabase
          .from('sensor_data')
          .select('temperature, humidity, time')
          .eq('user_id', userId)
          .gte('time', today.toISOString())
          .order('time', { ascending: false })
          .limit(24); // Get readings for a day

        if (histError) throw histError;

        if (histData && histData.length > 0) {
          // Format historical data for display
          const formattedData = histData.map(item => ({
            time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            temperature: parseFloat(item.temperature).toFixed(1),
            humidity: Math.round(parseFloat(item.humidity))
          }));

          setHistoricalData(formattedData);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching DTH data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    const setupRealtimeSubscription = async () => {
      // Subscribe to changes on the sensor_data table for this user
      subscription = supabase
        .channel('dth_sensor_changes')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'sensor_data',
            filter: `user_id=eq.${userId}`
          }, 
          (payload) => {
            const newReading = payload.new;
            
            // Update current readings with latest data
            setCurrentReadings({
              temperature: parseFloat(newReading.temperature),
              humidity: parseFloat(newReading.humidity),
              lastUpdated: new Date(newReading.time).toLocaleTimeString()
            });
            
            // Add new reading to historical data
            const formattedTime = new Date(newReading.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setHistoricalData(prevData => [{
              time: formattedTime,
              temperature: parseFloat(newReading.temperature).toFixed(1),
              humidity: Math.round(parseFloat(newReading.humidity))
            }, ...prevData.slice(0, 5)]); // Keep only the most recent 6 readings
          }
        )
        .subscribe();
    };

    fetchCurrentData();
    setupRealtimeSubscription();

    // Clean up subscription on unmount
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [userId]);

  // Function to determine temperature color based on value
  const getTemperatureColor = (temp) => {
    if (temp < 18) return "#00bcd4"; // Cool blue
    if (temp < 24) return "#4CAF50"; // Good green
    if (temp < 28) return "#FFC107"; // Warning yellow
    return "#F44336"; // Hot red
  };

  // Function to determine humidity color based on value
  const getHumidityColor = (humidity) => {
    if (humidity < 30) return "#F44336"; // Too dry - red
    if (humidity < 40) return "#FFC107"; // Dry - yellow
    if (humidity < 70) return "#4CAF50"; // Good - green
    return "#2196F3"; // Humid - blue
  };

  // Prepare chart data from historical readings
  const prepareChartData = () => {
    if (!historicalData || historicalData.length === 0) {
      return null;
    }

    // We need to reverse the data for the chart (oldest to newest)
    const chartData = [...historicalData].slice(0, 6).reverse();

    return {
      temperatureData: {
        labels: chartData.map(item => item.time),
        datasets: [
          {
            data: chartData.map(item => parseFloat(item.temperature)),
            color: () => "#FFC107", // amber color for temperature
            strokeWidth: 2,
          }
        ],
        legend: ["Temperature (°C)"]
      },
      humidityData: {
        labels: chartData.map(item => item.time),
        datasets: [
          {
            data: chartData.map(item => parseFloat(item.humidity)),
            color: () => "#2196F3", // blue color for humidity
            strokeWidth: 2,
          }
        ],
        legend: ["Humidity (%)"]
      }
    };
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: "#232946",
    backgroundGradientTo: "#232946",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#fafafa"
    }
  };

  // Get chart data
  const chartData = prepareChartData();

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
      
      <Text style={styles.title}>Temperature & Humidity</Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4f8cff" />
            <Text style={styles.loadingText}>Loading sensor data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={40} color="#f44336" />
            <Text style={styles.errorText}>Error loading data</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Current Readings Card */}
            <View style={styles.readingsCard}>
              <Text style={styles.cardTitle}>Current Readings</Text>
              {currentReadings.lastUpdated && (
                <Text style={styles.updateTime}>
                  Last updated: {currentReadings.lastUpdated}
                </Text>
              )}
              
              <View style={styles.metricsContainer}>
                {/* Temperature Display */}
                <View style={styles.metricBox}>
                  <View style={styles.metricHeader}>
                    <MaterialCommunityIcons name="thermometer" size={24} color="#FFC107" />
                    <Text style={styles.metricTitle}>Temperature</Text>
                  </View>
                  
                  <View style={styles.gaugeContainer}>
                    <View style={[styles.gauge, { backgroundColor: getTemperatureColor(currentReadings.temperature) }]}>
                      <Text style={styles.gaugeValue}>{currentReadings.temperature.toFixed(1)}°C</Text>
                    </View>
                  </View>
                  
                  <View style={styles.metricInfoRow}>
                    <Text style={styles.metricInfoLabel}>Status:</Text>
                    <Text style={[
                      styles.metricInfoValue, 
                      {color: getTemperatureColor(currentReadings.temperature)}
                    ]}>
                      {currentReadings.temperature < 18 ? "Cold" : 
                       currentReadings.temperature < 24 ? "Comfortable" :
                       currentReadings.temperature < 28 ? "Warm" : "Hot"}
                    </Text>
                  </View>
                </View>
                
                {/* Humidity Display */}
                <View style={styles.metricBox}>
                  <View style={styles.metricHeader}>
                    <MaterialCommunityIcons name="water-percent" size={24} color="#2196F3" />
                    <Text style={styles.metricTitle}>Humidity</Text>
                  </View>
                  
                  <View style={styles.gaugeContainer}>
                    <View style={[
                      styles.gauge, 
                      { backgroundColor: getHumidityColor(currentReadings.humidity) }
                    ]}>
                      <Text style={styles.gaugeValue}>{Math.round(currentReadings.humidity)}%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.metricInfoRow}>
                    <Text style={styles.metricInfoLabel}>Status:</Text>
                    <Text style={[
                      styles.metricInfoValue, 
                      {color: getHumidityColor(currentReadings.humidity)}
                    ]}>
                      {currentReadings.humidity < 30 ? "Very Dry" : 
                       currentReadings.humidity < 40 ? "Dry" :
                       currentReadings.humidity < 70 ? "Comfortable" : "Humid"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Sensor Info Card */}
            <View style={styles.sensorInfoCard}>
              <Text style={styles.cardTitle}>Sensor Information</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sensor Type:</Text>
                <Text style={styles.infoValue}>DHT22 (AM2302)</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Accuracy:</Text>
                <Text style={styles.infoValue}>±0.5°C, ±2-5% RH</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Range:</Text>
                <Text style={styles.infoValue}>-40 to 80°C, 0-100% RH</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Resolution:</Text>
                <Text style={styles.infoValue}>0.1°C, 0.1% RH</Text>
              </View>
            </View>
            
            {/* Historical Data Card */}
            <View style={styles.historyCard}>
              <Text style={styles.cardTitle}>Historical Data</Text>
              <Text style={styles.cardSubtitle}>Today's readings</Text>
              
              {historicalData.length > 0 ? (
                <View style={styles.chartsContainer}>
                  {/* Temperature Chart */}
                  <Text style={styles.chartTitle}>Temperature Trend</Text>
                  <LineChart
                    data={chartData.temperatureData}
                    width={width * 0.8}
                    height={180}
                    chartConfig={{
                      ...chartConfig,
                      backgroundGradientFrom: "#2c3154",
                      backgroundGradientTo: "#2c3154",
                      color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
                    }}
                    bezier
                    style={styles.chart}
                  />
                  
                  {/* Humidity Chart */}
                  <Text style={styles.chartTitle}>Humidity Trend</Text>
                  <LineChart
                    data={chartData.humidityData}
                    width={width * 0.8}
                    height={180}
                    chartConfig={{
                      ...chartConfig,
                      backgroundGradientFrom: "#2c3154",
                      backgroundGradientTo: "#2c3154",
                      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                    }}
                    bezier
                    style={styles.chart}
                  />
                </View>
              ) : (
                <View style={styles.chartPlaceholder}>
                  <Text style={styles.chartPlaceholderText}>No Chart Data</Text>
                  <Text style={styles.chartPlaceholderSubtext}>Waiting for sensor readings...</Text>
                </View>
              )}
              
              {/* Data Table */}
              {historicalData.length > 0 ? (
                <View style={styles.dataTable}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderCell}>Time</Text>
                    <Text style={styles.tableHeaderCell}>Temp (°C)</Text>
                    <Text style={styles.tableHeaderCell}>Humidity (%)</Text>
                  </View>
                  
                  {historicalData.map((reading, index) => (
                    <View key={index} style={[
                      styles.tableRow,
                      index % 2 === 0 ? styles.evenRow : null
                    ]}>
                      <Text style={styles.tableCell}>{reading.time}</Text>
                      <Text style={[
                        styles.tableCell, 
                        {color: getTemperatureColor(reading.temperature)}
                      ]}>
                        {reading.temperature}
                      </Text>
                      <Text style={[
                        styles.tableCell,
                        {color: getHumidityColor(reading.humidity)}
                      ]}>
                        {reading.humidity}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No historical data available</Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.viewMoreButton}>
                <Text style={styles.viewMoreButtonText}>View Complete History</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
      
      {/* Floating Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Home", { userId })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="home-variant" style={styles.navIcon} />
          <Text style={styles.navText}>Home</Text>
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
          style={[styles.navItem, styles.activeNavItem]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="thermometer" style={[styles.navIcon, styles.activeNavIcon]} />
          <Text style={[styles.navText, styles.activeNavText]}>DTH</Text>
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
  readingsCard: {
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
  cardTitle: {
    color: "#4f8cff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  cardSubtitle: {
    color: "#bfc9d1",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  updateTime: {
    color: "#bfc9d1",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  metricBox: {
    backgroundColor: "rgba(43, 51, 73, 0.7)",
    borderRadius: 16,
    padding: 16,
    width: "48%",
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metricTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  gaugeContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  gauge: {
    width: "100%",
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  gaugeValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  metricInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  metricInfoLabel: {
    color: "#bfc9d1",
    fontSize: 14,
  },
  metricInfoValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  sensorInfoCard: {
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
  infoRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  infoLabel: {
    color: "#bfc9d1",
    fontSize: 14,
    fontWeight: "bold",
    width: 100,
  },
  infoValue: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  historyCard: {
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
  chartsContainer: {
    marginBottom: 16,
    width: "100%",
  },
  chartTitle: {
    color: "#bfc9d1",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 8,
    textAlign: "center",
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
    paddingRight: 16,
  },
  chartPlaceholder: {
    backgroundColor: "rgba(43, 51, 73, 0.7)",
    height: 180,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  chartPlaceholderText: {
    color: "#4f8cff",
    fontSize: 20,
    fontWeight: "bold",
  },
  chartPlaceholderSubtext: {
    color: "#bfc9d1",
    fontSize: 14,
    marginTop: 8,
  },
  dataTable: {
    width: "100%",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "rgba(43, 51, 73, 0.9)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  tableHeaderCell: {
    flex: 1,
    color: "#4f8cff",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 8,
  },
  evenRow: {
    backgroundColor: "rgba(43, 51, 73, 0.4)",
  },
  tableCell: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  viewMoreButton: {
    backgroundColor: "rgba(79, 140, 255, 0.2)",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  viewMoreButtonText: {
    color: "#4f8cff",
    fontWeight: "bold",
  },
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
  noDataContainer: {
    backgroundColor: "rgba(43, 51, 73, 0.7)",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginVertical: 16,
  },
  noDataText: {
    color: "#bfc9d1",
    fontSize: 15,
  }
});

export default DTHPage;