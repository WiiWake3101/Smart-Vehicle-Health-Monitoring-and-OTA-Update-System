import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ActivityIndicator, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5, Ionicons, Feather, MaterialIcons, Entypo } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { supabase } from "../lib/supabase";

const { width, height } = Dimensions.get("window");

const GPSPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = route.params?.userId;
  const mapRef = useRef(null);

  // State for current location and trip history
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
    address: "Loading...",
    speed: 0,
    altitude: 0,
    satellites: 0,
    lastUpdated: null
  });

  const [tripHistory, setTripHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripRoute, setTripRoute] = useState([]);
  const [trackingActive, setTrackingActive] = useState(false);
  const [currentRoute, setCurrentRoute] = useState([]);

  // Custom map style (dark mode)
  const mapStyle = [
    {
      "elementType": "geometry",
      "stylers": [{ "color": "#242f3e" }]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#746855" }]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#242f3e" }]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#d59563" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{ "color": "#38414e" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#212a37" }]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#9ca5b3" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#17263c" }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#515c6d" }]
    }
  ];

  // Cache for geocoding results to reduce API calls
  const geocodingCache = {};

  // Helper function to reverse geocode (convert coordinates to address)
  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      // Round coordinates to 5 decimal places for cache key
      const lat = parseFloat(latitude).toFixed(5);
      const lng = parseFloat(longitude).toFixed(5);
      const cacheKey = `${lat},${lng}`;
      
      // Check cache first
      if (geocodingCache[cacheKey]) {
        return geocodingCache[cacheKey];
      }
      
      // Fallback address using coordinates
      const fallbackAddress = `Location (${lat}, ${lng})`;
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'DevopsGPSTracker/1.0',
              'Accept': 'application/json',
              'Accept-Language': 'en'
            },
            timeout: 5000 // 5 second timeout
          }
        );
        
        if (!response.ok) {
          console.log(`Geocoding error: Status ${response.status}`);
          return fallbackAddress;
        }
        
        const text = await response.text();
        if (text.includes("<html") || text.includes("<!DOCTYPE")) {
          console.log("Received HTML instead of JSON");
          return fallbackAddress;
        }
        
        try {
          const data = JSON.parse(text);
          const address = data.display_name || fallbackAddress;
          
          // Cache the result
          geocodingCache[cacheKey] = address;
          
          return address;
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          return fallbackAddress;
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        return fallbackAddress;
      }
    } catch (error) {
      console.error('Error with geocoding:', error);
      return `Location (${parseFloat(latitude).toFixed(5)}, ${parseFloat(longitude).toFixed(5)})`;
    }
  };

  // Fetch data and set up real-time subscription
  useEffect(() => {
    let subscription;
    let routeUpdateInterval;

    const fetchGPSData = async () => {
      try {
        setLoading(true);

        // Fetch most recent location data
        const { data, error } = await supabase
          .from('sensor_data')
          .select('latitude, longitude, speed, altitude, satellites, time')
          .eq('user_id', userId)
          .order('time', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const latestLocation = data[0];
          
          // Get address from coordinates
          const address = await getAddressFromCoordinates(
            latestLocation.latitude, 
            latestLocation.longitude
          );
          
          // Update current location with real data from the database
          setCurrentLocation({
            latitude: latestLocation.latitude,
            longitude: latestLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
            address: address,
            speed: latestLocation.speed || 0,
            altitude: latestLocation.altitude || 0,
            satellites: latestLocation.satellites || 0,
            lastUpdated: new Date(latestLocation.time).toLocaleTimeString()
          });
          
          // Add this point to the current route if tracking is active
          if (trackingActive) {
            setCurrentRoute(prev => [...prev, {
              latitude: latestLocation.latitude,
              longitude: latestLocation.longitude,
              time: latestLocation.time,
              speed: latestLocation.speed
            }]);
          }
          
          // Center map on current location
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: latestLocation.latitude,
              longitude: latestLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }

        // Check if trips table exists - if not, we'll use raw sensor data
        const { data: tripsData, error: tripsTableError } = await supabase
          .from('trips')
          .select('id')
          .limit(1);
          
        if (tripsTableError && tripsTableError.code === '42P01') {
          // Table doesn't exist, fetch history from sensor_data
          await fetchTripHistoryFromSensorData();
        } else {
          // Table exists, fetch from proper trips table
          await fetchTripHistory();
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching GPS data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    // Fetch trip history from the proper trips table
    const fetchTripHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', userId)
          .order('end_time', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Format data for display
          const formattedTrips = await Promise.all(data.map(async (trip) => {
            // Fetch route points for this trip
            const { data: pointsData, error: pointsError } = await supabase
              .from('trip_points')
              .select('latitude, longitude, time, speed')
              .eq('trip_id', trip.id)
              .order('time', { ascending: true });
              
            if (pointsError) throw pointsError;
            
            return {
              id: trip.id,
              date: new Date(trip.end_time).toLocaleString([], {
                weekday: 'short',
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              startPoint: "Start",
              endPoint: "End",
              startAddress: trip.start_address || "Unknown location",
              endAddress: trip.end_address || "Unknown location",
              distance: trip.distance.toFixed(1) + " km",
              duration: Math.round(trip.duration) + " min",
              averageSpeed: Math.round(trip.avg_speed) + " km/h",
              coordinates: pointsData ? pointsData.map(point => ({
                latitude: point.latitude,
                longitude: point.longitude
              })) : []
            };
          }));
          
          setTripHistory(formattedTrips);
        }
      } catch (err) {
        console.error("Error fetching trip history:", err);
        // Continue even if there's an error fetching trip history
      }
    };

    // Fallback method to generate trip history from sensor data when trips table doesn't exist
    const fetchTripHistoryFromSensorData = async () => {
      try {
        // Get data from the last 7 days
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const { data, error } = await supabase
          .from('sensor_data')
          .select('latitude, longitude, speed, time')
          .eq('user_id', userId)
          .gte('time', lastWeek.toISOString())
          .order('time', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Segment data into trips based on time gaps (e.g., 30 minutes without data = new trip)
          const trips = [];
          let currentTrip = [data[0]];
          
          for (let i = 1; i < data.length; i++) {
            const timeDiff = new Date(data[i].time) - new Date(currentTrip[currentTrip.length - 1].time);
            const minutesDiff = timeDiff / (1000 * 60);
            
            // If the time gap is more than 30 minutes, consider it a new trip
            if (minutesDiff > 30) {
              if (currentTrip.length > 5) { // Only consider trips with at least 5 data points
                trips.push(currentTrip);
              }
              currentTrip = [data[i]];
            } else {
              currentTrip.push(data[i]);
            }
          }
          
          // Add the last trip if it has enough points
          if (currentTrip.length > 5) {
            trips.push(currentTrip);
          }
          
          // Format trips for display
          const formattedTrips = await Promise.all(trips.slice(0, 5).map(async (tripPoints, index) => {
            // Calculate trip statistics
            const startPoint = tripPoints[0];
            const endPoint = tripPoints[tripPoints.length - 1];
            const startTime = new Date(startPoint.time);
            const endTime = new Date(endPoint.time);
            const durationMinutes = (endTime - startTime) / (1000 * 60);
            
            // Calculate distance
            let totalDistance = 0;
            let totalSpeed = 0;
            let speedReadings = 0;
            
            for (let i = 1; i < tripPoints.length; i++) {
              if (tripPoints[i].latitude && tripPoints[i-1].latitude) {
                totalDistance += calculateDistance(
                  tripPoints[i-1].latitude, tripPoints[i-1].longitude,
                  tripPoints[i].latitude, tripPoints[i].longitude
                );
              }
              
              if (tripPoints[i].speed) {
                totalSpeed += tripPoints[i].speed;
                speedReadings++;
              }
            }
            
            const avgSpeed = speedReadings > 0 ? totalSpeed / speedReadings : 0;
            
            // Get addresses
            const startAddress = await getAddressFromCoordinates(startPoint.latitude, startPoint.longitude);
            const endAddress = await getAddressFromCoordinates(endPoint.latitude, endPoint.longitude);
            
            return {
              id: index + 1,
              date: startTime.toLocaleString([], {
                weekday: 'short',
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              startPoint: "Start",
              endPoint: "End",
              startAddress: startAddress,
              endAddress: endAddress,
              distance: totalDistance.toFixed(1) + " km",
              duration: Math.round(durationMinutes) + " min",
              averageSpeed: Math.round(avgSpeed) + " km/h",
              coordinates: tripPoints.map(point => ({
                latitude: point.latitude,
                longitude: point.longitude
              }))
            };
          }));
          
          setTripHistory(formattedTrips);
        }
      } catch (err) {
        console.error("Error processing sensor data for trips:", err);
      }
    };

    // Helper function to calculate distance between coordinates
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const distance = R * c; // Distance in km
      return distance;
    };

    const setupRealtimeSubscription = async () => {
      // Subscribe to changes on the sensor_data table for this user
      subscription = supabase
        .channel('gps_location_changes')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'sensor_data',
            filter: `user_id=eq.${userId}`
          }, 
          async (payload) => {
            const newLocation = payload.new;
            
            // Only update if we have valid GPS data
            if (newLocation.latitude && newLocation.longitude) {
              // Get address from coordinates
              const address = await getAddressFromCoordinates(
                newLocation.latitude, 
                newLocation.longitude
              );
              
              // Update current location with real-time data
              setCurrentLocation({
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
                address: address,
                speed: newLocation.speed || 0,
                altitude: newLocation.altitude || 0,
                satellites: newLocation.satellites || 0,
                lastUpdated: new Date(newLocation.time).toLocaleTimeString()
              });
              
              // Add to current route if tracking is active
              if (trackingActive) {
                setCurrentRoute(prev => [...prev, {
                  latitude: newLocation.latitude,
                  longitude: newLocation.longitude,
                  time: newLocation.time,
                  speed: newLocation.speed
                }]);
              }
              
              // Animate map to new location
              if (mapRef.current) {
                mapRef.current.animateToRegion({
                  latitude: newLocation.latitude,
                  longitude: newLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
              }
            }
          }
        )
        .subscribe();
    };

    // Set up interval to check for significant movement and update the current route
    const setupRouteTracking = () => {
      routeUpdateInterval = setInterval(async () => {
        if (trackingActive && currentRoute.length > 1) {
          // Every minute, check if we should save this as a trip
          const firstPoint = currentRoute[0];
          const lastPoint = currentRoute[currentRoute.length - 1];
          
          // Calculate time difference in minutes
          const timeDiffMs = new Date(lastPoint.time) - new Date(firstPoint.time);
          const timeDiffMinutes = timeDiffMs / (1000 * 60);
          
          // Only save trips that are more than 5 minutes
          if (timeDiffMinutes >= 5) {
            // Calculate distance, avg speed
            let totalDistance = 0;
            let maxSpeed = 0;
            let totalSpeed = 0;
            let speedReadings = 0;
            
            for (let i = 1; i < currentRoute.length; i++) {
              totalDistance += calculateDistance(
                currentRoute[i-1].latitude, currentRoute[i-1].longitude,
                currentRoute[i].latitude, currentRoute[i].longitude
              );
              
              if (currentRoute[i].speed) {
                totalSpeed += currentRoute[i].speed;
                speedReadings++;
                if (currentRoute[i].speed > maxSpeed) {
                  maxSpeed = currentRoute[i].speed;
                }
              }
            }
            
            const avgSpeed = speedReadings > 0 ? totalSpeed / speedReadings : 0;
            
            // Check if trips table exists before trying to insert
            try {
              const { data: tripsData, error: tripsTableError } = await supabase
                .from('trips')
                .select('id')
                .limit(1);
                
              if (!tripsTableError) {
                // Table exists, save the trip
                const startAddress = await getAddressFromCoordinates(firstPoint.latitude, firstPoint.longitude);
                const endAddress = await getAddressFromCoordinates(lastPoint.latitude, lastPoint.longitude);
                
                // Insert trip record
                const { data: tripData, error: tripError } = await supabase
                  .from('trips')
                  .insert({
                    user_id: userId,
                    start_time: firstPoint.time,
                    end_time: lastPoint.time,
                    start_latitude: firstPoint.latitude,
                    start_longitude: firstPoint.longitude,
                    end_latitude: lastPoint.latitude,
                    end_longitude: lastPoint.longitude,
                    distance: totalDistance,
                    duration: Math.round(timeDiffMinutes), // Convert to integer
                    avg_speed: avgSpeed,
                    max_speed: maxSpeed,
                    start_address: startAddress,
                    end_address: endAddress
                  })
                  .select('id')
                  .single();
                  
                if (tripError) {
                  console.error("Error saving trip:", tripError);
                } else if (tripData) {
                  // Save route points
                  const tripPoints = currentRoute.map(point => ({
                    trip_id: tripData.id,
                    latitude: point.latitude,
                    longitude: point.longitude,
                    speed: point.speed || 0,
                    time: point.time
                  }));
                  
                  await supabase
                    .from('trip_points')
                    .insert(tripPoints);
                    
                  // Refresh trip history
                  fetchTripHistory();
                }
              }
            } catch (err) {
              console.error("Error with trips table check:", err);
            }
            
            // Reset current route but keep tracking active
            setCurrentRoute([lastPoint]);
          }
        }
      }, 60000); // Check every minute
    };

    // Toggle trip tracking
    const toggleTracking = () => {
      setTrackingActive(prev => !prev);
      if (!trackingActive && currentLocation.latitude) {
        // Start new tracking session
        setCurrentRoute([{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          time: new Date().toISOString(),
          speed: currentLocation.speed
        }]);
      }
    };

    fetchGPSData();
    setupRealtimeSubscription();
    setupRouteTracking();

    // Clean up subscription and intervals on unmount
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
      if (routeUpdateInterval) {
        clearInterval(routeUpdateInterval);
      }
    };
  }, [userId, trackingActive]);

  // Handle trip selection
  const handleTripSelect = (trip) => {
    if (selectedTrip?.id === trip.id) {
      // Deselect if already selected
      setSelectedTrip(null);
      setTripRoute([]);
      
      // Reset map to current location
      if (mapRef.current && currentLocation) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } else {
      setSelectedTrip(trip);
      setTripRoute(trip.coordinates || []);
      
      // Fit the map to show the entire route
      if (mapRef.current && trip.coordinates && trip.coordinates.length > 0) {
        mapRef.current.fitToCoordinates(trip.coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true
        });
      }
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
      
      <Text style={styles.title}>GPS Tracking</Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4f8cff" />
            <Text style={styles.loadingText}>Loading GPS data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="map-marker-alert" size={40} color="#f44336" />
            <Text style={styles.errorText}>Error loading GPS data</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Current Location Card with Map */}
            <View style={styles.locationCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="location" size={22} color="#4f8cff" />
                <Text style={styles.cardHeaderText}>Current Location</Text>
                
                {/* Tracking toggle button */}
                <TouchableOpacity 
                  style={[styles.trackingButton, trackingActive && styles.trackingActiveButton]}
                  onPress={() => setTrackingActive(!trackingActive)}
                >
                  <Text style={styles.trackingButtonText}>
                    {trackingActive ? "Tracking On" : "Start Tracking"}
                  </Text>
                  <View style={[styles.trackingIndicator, trackingActive && styles.trackingActiveIndicator]} />
                </TouchableOpacity>
              </View>
              
              {/* Real Map */}
              <View style={styles.mapContainer}>
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  provider={PROVIDER_GOOGLE}
                  customMapStyle={mapStyle}
                  initialRegion={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  {/* Current location marker */}
                  <Marker
                    coordinate={{
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                    }}
                    title="Current Location"
                  >
                    <View style={styles.markerContainer}>
                      <View style={styles.markerDot} />
                      <View style={styles.markerRing} />
                    </View>
                  </Marker>
                  
                  {/* Show selected trip route */}
                  {tripRoute.length > 0 && (
                    <Polyline
                      coordinates={tripRoute}
                      strokeColor="#4f8cff"
                      strokeWidth={3}
                      lineDashPattern={[0]}
                    />
                  )}
                  
                  {/* Show current route if tracking is active */}
                  {trackingActive && currentRoute.length > 1 && (
                    <Polyline
                      coordinates={currentRoute.map(point => ({
                        latitude: point.latitude,
                        longitude: point.longitude
                      }))}
                      strokeColor="#4CAF50"
                      strokeWidth={4}
                      lineDashPattern={[0]}
                    />
                  )}
                </MapView>
              </View>
              
              <View style={styles.locationDetails}>
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>Address:</Text>
                  <Text style={styles.locationValue}>{currentLocation.address}</Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>Coordinates:</Text>
                  <Text style={styles.locationValue}>
                    {currentLocation.latitude.toFixed(4)}° N, {currentLocation.longitude.toFixed(4)}° E
                  </Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>Current Speed:</Text>
                  <Text style={styles.locationValue}>{Math.round(currentLocation.speed)} km/h</Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>Altitude:</Text>
                  <Text style={styles.locationValue}>{Math.round(currentLocation.altitude)} m</Text>
                </View>
                {currentLocation.lastUpdated && (
                  <View style={styles.locationRow}>
                    <Text style={styles.locationLabel}>Last Updated:</Text>
                    <Text style={styles.locationValue}>{currentLocation.lastUpdated}</Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Trip History Section */}
            <View style={styles.historySection}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="history" size={22} color="#4f8cff" />
                <Text style={styles.sectionHeaderText}>Trip History</Text>
              </View>
              
              {tripHistory.length > 0 ? (
                tripHistory.map(trip => (
                  <View key={trip.id} style={[
                    styles.tripCard,
                    selectedTrip?.id === trip.id ? styles.selectedTripCard : null
                  ]}>
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
                    
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => handleTripSelect(trip)}
                    >
                      <Text style={styles.viewButtonText}>
                        {selectedTrip?.id === trip.id ? "Hide Route" : "View Route"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.noTripsContainer}>
                  <MaterialCommunityIcons name="map-marker-path" size={40} color="#4f8cff" />
                  <Text style={styles.noTripsText}>No trip history available</Text>
                  <Text style={styles.noTripsSubtext}>Your trips will appear here as you travel</Text>
                </View>
              )}
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
    width: '100%',
  },
  cardHeaderText: {
    color: "#4f8cff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  mapContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4f8cff',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 140, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(79, 140, 255, 0.5)',
    position: 'absolute',
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
  
  // Loading and Error Styles
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
  
  // Trip Styles
  selectedTripCard: {
    borderWidth: 2,
    borderColor: "#4f8cff",
  },
  noTripsContainer: {
    backgroundColor: "rgba(43, 51, 73, 0.7)",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  noTripsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
  },
  noTripsSubtext: {
    color: "#bfc9d1",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
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
  
  // Tracking button styles
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 51, 73, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  trackingActiveButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  trackingButtonText: {
    color: '#bfc9d1',
    fontSize: 12,
    marginRight: 6,
  },
  trackingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bfc9d1',
  },
  trackingActiveIndicator: {
    backgroundColor: '#4CAF50',
  },
});

export default GPSPage;