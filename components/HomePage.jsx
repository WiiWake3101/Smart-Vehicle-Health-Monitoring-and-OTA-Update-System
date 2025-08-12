import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5, Ionicons, Feather } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const MAX_SPEED = 120; // Adjust as needed

const HomePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = route.params?.userId;

  const [speed, setSpeed] = useState(0);

  // Simulate live speed updates (replace with real data source)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate speed between 0 and 120 km/h
      setSpeed(Math.floor(Math.random() * 121));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
      {/* Device Info Card at the top */}
      <View style={styles.deviceCard}>
        <Text style={styles.infoTitle}>Device Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Firmware Version:</Text>
          <Text style={styles.infoValue}>v1.2.3</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Sync:</Text>
          <Text style={styles.infoValue}>2025-08-10 15:30</Text>
        </View>
        <Text style={[styles.infoLabel, { marginTop: 10 }]}>Equipped Sensors:</Text>
        <Text style={styles.infoValue}>
          • Accelerometer (IMU){"\n"}
          • Gyroscope (IMU){"\n"}
          • DHT11/22 (Temperature & Humidity){"\n"}
          • GPS Module{"\n"}
          • Barometer (optional)
        </Text>
      </View>
      {/* Main Content */}
      <View style={styles.card}>
        <View style={styles.odometerContainer}>
          <Text style={styles.odometerLabel}>Speed</Text>
          <Text style={styles.odometerValue}>{speed} km/h</Text>
        </View>
      </View>
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

const NAVBAR_HEIGHT = 100; // Increased from 70 to 100
const NAVBAR_MARGIN = 24;

const styles = StyleSheet.create({
  container: {
    minHeight: "100%",
    width: "100%",
    backgroundColor: "#181c2f",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    paddingVertical: 40,
    paddingHorizontal: 24,
    width: "85%",
    maxWidth: 370,
    alignItems: "center",
    shadowColor: "#1f2687",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: NAVBAR_HEIGHT + NAVBAR_MARGIN, // space for navbar
  },
  title: {
    color: "#fff",
    marginBottom: 8,
    fontWeight: "700",
    fontSize: 24,
  },
  subtitle: {
    color: "#bfc9d1",
    marginBottom: 24,
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
  odometerContainer: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#232946",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 32,
    shadowColor: "#4f8cff",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  odometerLabel: {
    color: "#bfc9d1",
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "600",
  },
  odometerValue: {
    color: "#4f8cff",
    fontSize: 38,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  speedometerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: -10,
  },
  infoSection: {
    marginTop: 18,
    width: "100%",
    backgroundColor: "#20243a",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: "flex-start",
    shadowColor: "#4f8cff",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
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
  deviceCard: {
    backgroundColor: "#20243a",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 22,
    width: "85%",
    maxWidth: 370,
    alignItems: "flex-start",
    shadowColor: "#4f8cff",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 18,
    marginTop: 30,
    alignSelf: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    marginTop: 2,
  },
});

export default HomePage;