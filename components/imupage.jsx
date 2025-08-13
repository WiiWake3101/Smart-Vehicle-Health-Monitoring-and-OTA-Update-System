import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5, Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";

const { width, height } = Dimensions.get("window");

const IMUPage = ({ userId }) => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Use userId from props or route params
  const userIdToUse = userId || route.params?.userId;
  
  // State for live data simulation
  const [accelData, setAccelData] = useState({
    x: [0.1, 0.5, 0.2, 0.7, 0.3, 0.6],
    y: [0.2, 0.1, 0.4, 0.2, 0.5, 0.3],
    z: [0.3, 0.6, 0.1, 0.4, 0.2, 0.5]
  });
  
  const [gyroData, setGyroData] = useState({
    x: [0.05, 0.2, 0.1, 0.3, 0.15, 0.25],
    y: [0.1, 0.05, 0.2, 0.1, 0.25, 0.15],
    z: [0.15, 0.3, 0.05, 0.2, 0.1, 0.2]
  });

  // Simulated IMU thresholds for analysis
  const [thresholds, setThresholds] = useState({
    accelMag: 0.8,
    jerk: 0.15
  });

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update accelerometer data by shifting and adding a new value
      setAccelData(prev => {
        const newX = [...prev.x.slice(1), Math.random() * 0.8];
        const newY = [...prev.y.slice(1), Math.random() * 0.7];
        const newZ = [...prev.z.slice(1), Math.random() * 0.6];
        return { x: newX, y: newY, z: newZ };
      });
      
      // Update gyroscope data by shifting and adding a new value
      setGyroData(prev => {
        const newX = [...prev.x.slice(1), Math.random() * 0.3];
        const newY = [...prev.y.slice(1), Math.random() * 0.35];
        const newZ = [...prev.z.slice(1), Math.random() * 0.25];
        return { x: newX, y: newY, z: newZ };
      });
    }, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Labels for time points (x-axis)
  const timeLabels = ["5s", "4s", "3s", "2s", "1s", "Now"];

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
        data: Array(6).fill(thresholds.accelMag), // Threshold line
        color: () => "rgba(255, 80, 80, 0.5)",
        strokeWidth: 1,
        strokeDasharray: [5, 5],
      }
    ],
    legend: ["Acceleration Magnitude", "Threshold"],
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
        data: Array(6).fill(thresholds.jerk), // Threshold line
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
      
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{ alignItems: "center", paddingTop: 24, paddingBottom: NAVBAR_HEIGHT + 20 }}
        horizontal={false}
        showsVerticalScrollIndicator={false}
      >
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 16,
  },
  subtitle: {
    color: "#bfc9d1",
    marginBottom: 16,
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
    marginLeft: 10,
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
});

export default IMUPage;