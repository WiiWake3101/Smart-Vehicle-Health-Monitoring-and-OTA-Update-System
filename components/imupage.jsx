import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5, Ionicons, Feather } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";

const { width, height } = Dimensions.get("window");

const IMUPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = route.params?.userId;

  // Simulated data for Accelerometer (X, Y, Z)
  const accelChartData = {
    labels: ["0", "1", "2", "3", "4", "5"],
    datasets: [
      {
        data: [0.1, 0.5, 0.2, 0.7, 0.3, 0.6],
        color: () => "#4f8cff",
        strokeWidth: 2,
      },
      {
        data: [0.2, 0.1, 0.4, 0.2, 0.5, 0.3],
        color: () => "#00e676",
        strokeWidth: 2,
      },
      {
        data: [0.3, 0.6, 0.1, 0.4, 0.2, 0.5],
        color: () => "#ffb300",
        strokeWidth: 2,
      },
    ],
    legend: ["Accel X", "Accel Y", "Accel Z"],
  };

  // Simulated data for Gyroscope (X, Y, Z)
  const gyroChartData = {
    labels: ["0", "1", "2", "3", "4", "5"],
    datasets: [
      {
        data: [0.05, 0.2, 0.1, 0.3, 0.15, 0.25],
        color: () => "#ff5555",
        strokeWidth: 2,
      },
      {
        data: [0.1, 0.05, 0.2, 0.1, 0.25, 0.15],
        color: () => "#00bcd4",
        strokeWidth: 2,
      },
      {
        data: [0.15, 0.3, 0.05, 0.2, 0.1, 0.2],
        color: () => "#c51162",
        strokeWidth: 2,
      },
    ],
    legend: ["Gyro X", "Gyro Y", "Gyro Z"],
  };

  // Acceleration magnitude (from accelChartData)
  const accelMagnitude = accelChartData.labels.map((_, i) => {
    const x = accelChartData.datasets[0].data[i];
    const y = accelChartData.datasets[1].data[i];
    const z = accelChartData.datasets[2].data[i];
    return Math.sqrt(x * x + y * y + z * z);
  });
  const accelMagChartData = {
    labels: accelChartData.labels,
    datasets: [
      {
        data: accelMagnitude,
        color: () => "#9c27b0",
        strokeWidth: 2,
      },
    ],
    legend: ["Acceleration Magnitude"],
  };

  // Jerk from Gyroscope (difference of magnitude between steps)
  const gyroMagnitude = gyroChartData.labels.map((_, i) => {
    const x = gyroChartData.datasets[0].data[i];
    const y = gyroChartData.datasets[1].data[i];
    const z = gyroChartData.datasets[2].data[i];
    return Math.sqrt(x * x + y * y + z * z);
  });
  const jerkData = gyroMagnitude.map((val, i, arr) =>
    i === 0 ? 0 : Math.abs(val - arr[i - 1])
  );
  const jerkChartData = {
    labels: gyroChartData.labels,
    datasets: [
      {
        data: jerkData,
        color: () => "#f44336",
        strokeWidth: 2,
      },
    ],
    legend: ["Jerk (ΔGyro Mag)"],
  };

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
      <Text style={styles.title}>IMU Data</Text>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{ alignItems: "center", paddingTop: 24, paddingBottom: 80 }}
        horizontal={false}
        showsVerticalScrollIndicator={false}
      >
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
        </View>
        <View style={styles.card}>
          <Text style={styles.subtitle}>Acceleration Magnitude</Text>
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
        </View>
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
        </View>
        <View style={[styles.card, { marginBottom: 5 }]}>
          <Text style={styles.subtitle}>Jerk (ΔGyro Mag)</Text>
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
        </View>
        <View style={{ height: 40 }} />
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

const NAVBAR_HEIGHT = 100; // Increased from 90 to 100
const NAVBAR_MARGIN = 24;

const styles = StyleSheet.create({
  container: {
    minHeight: "100%",
    width: "100%",
    backgroundColor: "#181c2f",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  card: {
    position: "relative",
    zIndex: 1,
    backgroundColor: "rgba(34, 40, 57, 0.95)",
    borderRadius: 32,
    paddingVertical: 24, // Reduced padding
    paddingHorizontal: 12, // Reduced padding
    width: "85%",
    maxWidth: 370,
    alignItems: "center",
    shadowColor: "#1f2687",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24, // Less space between cards
  },
  title: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 24,
    marginTop: 30, // Add margin to push it down a bit
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#bfc9d1",
    marginBottom: 16,
    fontSize: 16,
    textAlign: "center",
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
  navIcon: {
    fontSize: Math.round(width * 0.07),
    color: "#4f8cff",
    marginBottom: 2,
  },
  navText: {
    color: "#bfc9d1",
    fontSize: Math.round(width * 0.032),
    fontWeight: "600",
  },
  graphLabel: {
    color: "#bfc9d1",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
    marginBottom: 4,
  },
  graph: {
    borderRadius: 16,
    marginHorizontal: 0,
    marginBottom: 12,
    width: "100%",
    backgroundColor: "transparent", // Remove graph background
  },
  graphSection: {
    marginBottom: 18,
    alignItems: "center",
    backgroundColor: "#20243a",
    borderRadius: 18,
    paddingVertical: 12,
    marginHorizontal: 0,
    shadowColor: "#4f8cff",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    width: "100%",
  },
});

export default IMUPage;