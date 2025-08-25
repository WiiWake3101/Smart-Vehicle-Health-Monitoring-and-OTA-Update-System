import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5, Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { supabase } from "../lib/supabase";

const { width, height } = Dimensions.get("window");

const IMUPage = ({ userId }) => {
  const navigation = useNavigation();
  const route = useRoute();

  // Use userId from props or route params
  const userIdToUse = userId || route.params?.userId;

  // State for IMU data from Supabase
  const [accelData, setAccelData] = useState({
    x: [0, 0, 0, 0, 0, 0],
    y: [0, 0, 0, 0, 0, 0],
    z: [0, 0, 0, 0, 0, 0]
  });

  const [gyroData, setGyroData] = useState({
    x: [0, 0, 0, 0, 0, 0],
    y: [0, 0, 0, 0, 0, 0],
    z: [0, 0, 0, 0, 0, 0]
  });

  // Thresholds for alerts
  const [thresholds, setThresholds] = useState({
    accelMag: 16.0,
    jerk: 0.15
  });

  // Additional state for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Number of data points to display
  const DATA_POINTS = 6;

  // Fetch initial data and set up real-time subscription
  useEffect(() => {
    let subscription;

    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch the most recent 6 data points
        const { data, error } = await supabase
          .from('sensor_data')
          .select('accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, time')
          .eq('user_id', userIdToUse)
          .order('time', { ascending: false })
          .limit(DATA_POINTS);

        if (error) throw error;

        if (data && data.length > 0) {
          // Reverse data to get chronological order (oldest to newest)
          const chronologicalData = [...data].reverse();

          // Update state with initial data
          updateSensorData(chronologicalData);

          // Set last updated time
          setLastUpdated(new Date(data[0].time).toLocaleTimeString());
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching sensor data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    const setupRealtimeSubscription = async () => {
      // Subscribe to changes on the sensor_data table for this user
      subscription = supabase
        .channel('sensor_data_changes')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'sensor_data',
            filter: `user_id=eq.${userIdToUse}`
          },
          (payload) => {
            // When new data comes in, add it to our existing data
            const newDataPoint = payload.new;

            // Update with the new data point
            setAccelData(prev => ({
              x: [...prev.x.slice(1), newDataPoint.accel_x],
              y: [...prev.y.slice(1), newDataPoint.accel_y],
              z: [...prev.z.slice(1), newDataPoint.accel_z]
            }));

            setGyroData(prev => ({
              x: [...prev.x.slice(1), newDataPoint.gyro_x],
              y: [...prev.y.slice(1), newDataPoint.gyro_y],
              z: [...prev.z.slice(1), newDataPoint.gyro_z]
            }));

            // Update last updated timestamp
            setLastUpdated(new Date(newDataPoint.time).toLocaleTimeString());
          }
        )
        .subscribe();
    };

    // Helper function to update state with sensor data
    const updateSensorData = (dataArray) => {
      // Extract accelerometer data
      const accelX = dataArray.map(item => item.accel_x);
      const accelY = dataArray.map(item => item.accel_y);
      const accelZ = dataArray.map(item => item.accel_z);

      // Extract gyroscope data
      const gyroX = dataArray.map(item => item.gyro_x);
      const gyroY = dataArray.map(item => item.gyro_y);
      const gyroZ = dataArray.map(item => item.gyro_z);

      // Pad arrays if we have fewer than DATA_POINTS
      const padArray = (arr) => {
        if (arr.length < DATA_POINTS) {
          return Array(DATA_POINTS - arr.length).fill(0).concat(arr);
        }
        return arr;
      };

      // Update state with padded arrays
      setAccelData({
        x: padArray(accelX),
        y: padArray(accelY),
        z: padArray(accelZ)
      });

      setGyroData({
        x: padArray(gyroX),
        y: padArray(gyroY),
        z: padArray(gyroZ)
      });
    };

    // Run our functions
    fetchInitialData();
    setupRealtimeSubscription();

    // Clean up subscription when component unmounts
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [userIdToUse]);

  // Generate time labels
  const generateTimeLabels = () => {
    if (!lastUpdated) return ["", "", "", "", "", "Now"];

    return Array(DATA_POINTS - 1).fill("").concat(["Now"]);
  };

  const timeLabels = generateTimeLabels();

  // Prepare chart data from state
  const accelChartData = {
    labels: timeLabels,
    datasets: [
      {
        data: accelData.x,
        color: () => "#4f8cff",
        strokeWidth: 2,
      },
      {
        data: accelData.y,
        color: () => "#00e676",
        strokeWidth: 2,
      },
      {
        data: accelData.z,
        color: () => "#ffb300",
        strokeWidth: 2,
      },
    ],
    legend: ["Accel X", "Accel Y", "Accel Z"],
  };

  const gyroChartData = {
    labels: timeLabels,
    datasets: [
      {
        data: gyroData.x,
        color: () => "#ff5555",
        strokeWidth: 2,
      },
      {
        data: gyroData.y,
        color: () => "#00bcd4",
        strokeWidth: 2,
      },
      {
        data: gyroData.z,
        color: () => "#c51162",
        strokeWidth: 2,
      },
    ],
    legend: ["Gyro X", "Gyro Y", "Gyro Z"],
  };

  // Calculate acceleration magnitude
  const accelMagnitude = accelData.x.map((_, i) => {
    const x = accelData.x[i];
    const y = accelData.y[i];
    const z = accelData.z[i];
    return Math.sqrt(x * x + y * y + z * z);
  });

  const accelMagChartData = {
    labels: timeLabels,
    datasets: [
      {
        data: accelMagnitude,
        color: () => "#9c27b0",
        strokeWidth: 2,
      },
      {
        data: Array(DATA_POINTS).fill(thresholds.accelMag), // Threshold line
        color: () => "rgba(255, 80, 80, 0.5)",
        strokeWidth: 1,
        strokeDasharray: [5, 5],
      }
    ],
    legend: ["Accel Mag", "Threshold"],
  };

  // Calculate jerk
  const gyroMagnitude = gyroData.x.map((_, i) => {
    const x = gyroData.x[i];
    const y = gyroData.y[i];
    const z = gyroData.z[i];
    return Math.sqrt(x * x + y * y + z * z);
  });

  const jerkData = gyroMagnitude.map((val, i, arr) =>
    i === 0 ? 0 : Math.abs(val - arr[i - 1])
  );

  const jerkChartData = {
    labels: timeLabels,
    datasets: [
      {
        data: jerkData,
        color: () => "#f44336",
        strokeWidth: 2,
      },
      {
        data: Array(DATA_POINTS).fill(thresholds.jerk), // Threshold line
        color: () => "rgba(255, 80, 80, 0.5)",
        strokeWidth: 1,
        strokeDasharray: [5, 5],
      }
    ],
    legend: ["Jerk (ΔGyro Mag)", "Threshold"],
  };

  // Analyze if any values exceed thresholds
  const isAccelMagAlert = Math.max(...accelMagnitude) > thresholds.accelMag;
  const isJerkAlert = Math.max(...jerkData) > thresholds.jerk;

  const chartConfig = {
    backgroundGradientFrom: "#232946",
    backgroundGradientTo: "#232946",
    color: (opacity = 1) => `rgba(79, 140, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(191, 201, 209, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 2,
    propsForDots: {
      r: "3",
      strokeWidth: "2",
      stroke: "#fff",
    },
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

      <Text style={styles.title}>IMU Sensor Data</Text>

      {/* Show last updated time if available */}
      {lastUpdated && (
        <View style={styles.lastUpdatedContainer}>
          <MaterialIcons name="update" size={16} color="#bfc9d1" />
          <Text style={styles.lastUpdatedText}>Last updated: {lastUpdated}</Text>
        </View>
      )}

      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{ alignItems: "center", paddingTop: 24, paddingBottom: NAVBAR_HEIGHT + 20 }}
        horizontal={false}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4f8cff" />
            <Text style={styles.loadingText}>Loading sensor data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={40} color="#f44336" />
            <Text style={styles.errorText}>Error loading data</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
          </View>
        ) : (
          <>
            {/* IMU Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>About IMU Sensors</Text>
              <Text style={styles.infoText}>
                The Inertial Measurement Unit (IMU) combines accelerometer and gyroscope
                sensors to track motion, orientation, and vibration patterns.
              </Text>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <FontAwesome5 name="tachometer-alt" size={20} color="#4f8cff" style={styles.infoIcon} />
                  <Text style={styles.infoItemTitle}>Accelerometer</Text>
                  <Text style={styles.infoItemText}>Measures linear acceleration forces in G (9.8 m/s²)</Text>
                </View>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="rotate-3d" size={20} color="#00e676" style={styles.infoIcon} />
                  <Text style={styles.infoItemTitle}>Gyroscope</Text>
                  <Text style={styles.infoItemText}>Measures angular velocity in degrees per second</Text>
                </View>
              </View>
            </View>

            {/* Acceleration Card */}
            <View style={styles.card}>
              <Text style={styles.subtitle}>Accelerometer (X/Y/Z)</Text>
              <LineChart
                data={accelChartData}
                width={Math.min(width * 0.8, 340)}
                height={180}
                chartConfig={chartConfig}
                bezier
                style={styles.graph}
                withInnerLines={false}
                withOuterLines={true}
                fromZero
              />
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: "#4f8cff" }]} />
                  <Text style={styles.legendText}>X-axis</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: "#00e676" }]} />
                  <Text style={styles.legendText}>Y-axis</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: "#ffb300" }]} />
                  <Text style={styles.legendText}>Z-axis</Text>
                </View>
              </View>
            </View>

            {/* Acceleration Magnitude Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.subtitle}>Acceleration Magnitude</Text>
                {isAccelMagAlert && (
                  <View style={styles.alertBadge}>
                    <MaterialIcons name="warning" size={16} color="#fff" />
                    <Text style={styles.alertText}>Threshold Exceeded</Text>
                  </View>
                )}
              </View>

              <LineChart
                data={accelMagChartData}
                width={Math.min(width * 0.8, 340)}
                height={180}
                chartConfig={chartConfig}
                bezier
                style={styles.graph}
                withInnerLines={false}
                withOuterLines={true}
                fromZero
              />

              <Text style={styles.cardDescription}>
                Combined magnitude of acceleration across all axes. Peaks may indicate
                significant movement or impacts.
              </Text>
            </View>

            {/* Gyroscope Card */}
            <View style={styles.card}>
              <Text style={styles.subtitle}>Gyroscope (X/Y/Z)</Text>
              <LineChart
                data={gyroChartData}
                width={Math.min(width * 0.8, 340)}
                height={180}
                chartConfig={chartConfig}
                bezier
                style={styles.graph}
                withInnerLines={false}
                withOuterLines={true}
                fromZero
              />
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: "#ff5555" }]} />
                  <Text style={styles.legendText}>X-axis</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: "#00bcd4" }]} />
                  <Text style={styles.legendText}>Y-axis</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: "#c51162" }]} />
                  <Text style={styles.legendText}>Z-axis</Text>
                </View>
              </View>
            </View>

            {/* Jerk Card */}
            <View style={[styles.card, { marginBottom: 5 }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.subtitle}>Jerk (ΔGyro Mag)</Text>
                {isJerkAlert && (
                  <View style={styles.alertBadge}>
                    <MaterialIcons name="warning" size={16} color="#fff" />
                    <Text style={styles.alertText}>Threshold Exceeded</Text>
                  </View>
                )}
              </View>

              <LineChart
                data={jerkChartData}
                width={Math.min(width * 0.8, 340)}
                height={180}
                chartConfig={chartConfig}
                bezier
                style={styles.graph}
                withInnerLines={false}
                withOuterLines={true}
                fromZero
              />

              <Text style={styles.cardDescription}>
                Jerk represents sudden changes in rotation rate. High values may indicate
                abrupt direction changes or vibration events.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Home", { userId: userIdToUse })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="home-variant" style={styles.navIcon} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, styles.activeNavItem]}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="chart-line" style={[styles.navIcon, styles.activeNavIcon]} />
          <Text style={[styles.navText, styles.activeNavText]}>IMU</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("DTH", { userId: userIdToUse })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="thermometer" style={styles.navIcon} />
          <Text style={styles.navText}>DTH</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("GPS", { userId: userIdToUse })}
          activeOpacity={0.7}
        >
          <Ionicons name="location-sharp" style={styles.navIcon} />
          <Text style={styles.navText}>GPS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Profile", { userId: userIdToUse })}
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
    // Add paddingTop for iPhone notch/safe area
    paddingTop: 32,
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
    fontWeight: "700",
    fontSize: 24,
    marginTop: 30,
    marginBottom: 8,
    textAlign: "center",
    zIndex: 1,
  },
  infoCard: {
    backgroundColor: "rgba(34, 40, 57, 0.95)",
    borderRadius: 24,
    padding: 20,
    width: "85%",
    maxWidth: 370,
    marginBottom: 24,
    shadowColor: "#1f2687",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 16,
    elevation: 8,
  },
  infoTitle: {
    color: "#4f8cff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  infoText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  infoItem: {
    backgroundColor: "rgba(43, 51, 73, 0.7)",
    borderRadius: 16,
    padding: 12,
    width: "48%",
    alignItems: "center",
  },
  infoIcon: {
    marginBottom: 8,
  },
  infoItemTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  infoItemText: {
    color: "#bfc9d1",
    fontSize: 12,
    textAlign: "center",
  },
  card: {
    position: "relative",
    zIndex: 1,
    backgroundColor: "rgba(34, 40, 57, 0.95)",
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: "85%",
    maxWidth: 370,
    alignItems: "center",
    shadowColor: "#1f2687",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 8,
  },
  subtitle: {
    color: "#bfc9d1",
    marginBottom: 8,
    fontSize: 16,
    textAlign: "center",
  },
  cardDescription: {
    color: "#bfc9d1",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(244, 67, 54, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: "center",
  },
  alertText: {
    color: "#ff5555",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    color: "#bfc9d1",
    fontSize: 12,
  },
  graph: {
    borderRadius: 16,
    marginHorizontal: 0,
    marginBottom: 8,
    backgroundColor: "transparent",
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
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 40, 57, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
    zIndex: 1,
  },
  lastUpdatedText: {
    color: '#bfc9d1',
    fontSize: 12,
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(34, 40, 57, 0.95)',
    borderRadius: 24,
    width: '85%',
    marginTop: 20,
  },
  loadingText: {
    color: '#bfc9d1',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(34, 40, 57, 0.95)',
    borderRadius: 24,
    width: '85%',
    marginTop: 20,
  },
  errorText: {
    color: '#f44336',
    marginTop: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorSubtext: {
    color: '#bfc9d1',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default IMUPage;