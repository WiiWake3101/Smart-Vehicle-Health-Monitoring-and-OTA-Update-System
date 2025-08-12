import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const Splash = () => (
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
    <View style={styles.centerContent}>
      {/* Replace with your logo if available */}
      {/* <Image source={require("../assets/logo.png")} style={styles.logo} /> */}
      <Text style={styles.title}>Vehicle Health</Text>
      <Text style={styles.subtitle}>Smart Monitoring & OTA Updates</Text>
    </View>
  </View>
);

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
  centerContent: {
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // logo: {
  //   width: 80,
  //   height: 80,
  //   marginBottom: 24,
  //   resizeMode: "contain",
  // },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    color: "#bfc9d1",
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
});

export default Splash;
