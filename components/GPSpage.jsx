import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5, Ionicons, Feather, MaterialIcons, Entypo } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const GPSPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = route.params?.userId;

  const [currentLocation, setCurrentLocation] = useState({
    latitude: "28.6139° N",
    longitude: "77.2090° E",
    address: "Connaught Place, New Delhi",
    speed: 45,
    lastUpdated: "2 sec ago"
  });

  const [tripHistory, setTripHistory] = useState([
    {
      id: 1,
      date: "Today, 3:30 PM",
      startPoint: "Home",
      startAddress: "123 Maple Street",
      endPoint: "Office",
      endAddress: "456 Business Park",
      distance: "12.5 km",
      duration: "35 min",
      averageSpeed: "42 km/h"
    },
    {
      id: 2,
      date: "Today, 9:15 AM",
      startPoint: "Office",
      startAddress: "456 Business Park",
      endPoint: "Home",
      endAddress: "123 Maple Street",
      distance: "13.2 km",
      duration: "40 min",
      averageSpeed: "38 km/h"
    },
    {
      id: 3,
      date: "Yesterday, 6:45 PM",
      startPoint: "Office",
      startAddress: "456 Business Park",
      endPoint: "Gym",
      endAddress: "789 Fitness Center",
      distance: "5.7 km",
      duration: "15 min",
      averageSpeed: "32 km/h"
    }
  ]);

  // Simulate location updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLocation(prev => ({
        ...prev,
        speed: Math.floor(Math.random() * 80),
        lastUpdated: "2 sec ago"
      }));
    }, 2000);
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
      
      <Text style={styles.title}>GPS Tracking</Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Location Card */}
        <View style={styles.locationCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={22} color="#4f8cff" />
            <Text style={styles.cardHeaderText}>Current Location</Text>
          </View>
          
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Map View</Text>
            <Text style={styles.mapPlaceholderSubtext}>(Map will be integrated here)</Text>
          </View>
          
          <View style={styles.locationDetails}>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Address:</Text>
              <Text style={styles.locationValue}>{currentLocation.address}</Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Coordinates:</Text>
              <Text style={styles.locationValue}>
                {currentLocation.latitude}, {currentLocation.longitude}
              </Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Current Speed:</Text>
              <Text style={styles.locationValue}>{currentLocation.speed} km/h</Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Last Updated:</Text>
              <Text style={styles.locationValue}>{currentLocation.lastUpdated}</Text>
            </View>
          </View>
        </View>
        
        {/* Trip History Section */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="history" size={22} color="#4f8cff" />
            <Text style={styles.sectionHeaderText}>Trip History</Text>
          </View>
          
          {tripHistory.map(trip => (
            <View key={trip.id} style={styles.tripCard}>
              <Text style={styles.tripDate}>{trip.date}</Text>
              
              <View style={styles.tripRoute}>
                <View style={styles.routeMarkers}>
                  <View style={styles.startMarker} />
                  <View style={styles.routeLine} />
                  <View style={styles.endMarker} />
                </View>
                
                <View style={styles.routeDetails}>
                  <View style={styles.routePoint}>
                    <Text style={styles.pointName}>{trip.startPoint}</Text>
                    <Text style={styles.pointAddress}>{trip.startAddress}</Text>
                  </View>
                  
                  <View style={styles.routePoint}>
                    <Text style={styles.pointName}>{trip.endPoint}</Text>
                    <Text style={styles.pointAddress}>{trip.endAddress}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.tripStats}>
                <View style={styles.statItem}>
                  <MaterialIcons name="directions-car" size={18} color="#bfc9d1" />
                  <Text style={styles.statText}>{trip.distance}</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialIcons name="timer" size={18} color="#bfc9d1" />
                  <Text style={styles.statText}>{trip.duration}</Text>
                </View>
                <View style={styles.statItem}>
                  <FontAwesome5 name="tachometer-alt" size={16} color="#bfc9d1" />
                  <Text style={styles.statText}>{trip.averageSpeed}</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
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
          style={[styles.navItem, styles.activeNavItem]}
          activeOpacity={0.7}
        >
          <Ionicons name="location-sharp" style={[styles.navIcon, styles.activeNavIcon]} />
          <Text style={[styles.navText, styles.activeNavText]}>GPS</Text>
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
  // Location Card Styles
  locationCard: {
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderText: {
    color: "#4f8cff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  mapPlaceholder: {
    backgroundColor: "rgba(43, 51, 73, 0.7)",
    height: 180,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  mapPlaceholderText: {
    color: "#4f8cff",
    fontSize: 20,
    fontWeight: "bold",
  },
  mapPlaceholderSubtext: {
    color: "#bfc9d1",
    fontSize: 14,
    marginTop: 8,
  },
  locationDetails: {
    backgroundColor: "rgba(43, 51, 73, 0.5)",
    borderRadius: 12,
    padding: 16,
  },
  locationRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  locationLabel: {
    color: "#bfc9d1",
    fontSize: 14,
    fontWeight: "bold",
    width: 120,
  },
  locationValue: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  
  // Trip History Styles
  historySection: {
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
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeaderText: {
    color: "#4f8cff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  tripCard: {
    backgroundColor: "rgba(43, 51, 73, 0.5)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  tripDate: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 12,
  },
  tripRoute: {
    flexDirection: "row",
    marginBottom: 16,
  },
  routeMarkers: {
    width: 24,
    alignItems: "center",
  },
  startMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: "#4f8cff",
    marginVertical: 4,
    marginLeft: 5,
  },
  endMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#F44336",
  },
  routeDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  routePoint: {
    marginBottom: 12,
  },
  pointName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  pointAddress: {
    color: "#bfc9d1",
    fontSize: 13,
  },
  tripStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(32, 38, 57, 0.8)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    color: "#fff",
    fontSize: 13,
    marginLeft: 6,
  },
  viewButton: {
    backgroundColor: "rgba(79, 140, 255, 0.2)",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#4f8cff",
    fontWeight: "bold",
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
});

export default GPSPage;