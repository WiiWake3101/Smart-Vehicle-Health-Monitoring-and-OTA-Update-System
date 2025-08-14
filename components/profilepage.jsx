import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, TextInput, Keyboard, TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome5, Ionicons, Feather } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { Svg, Circle, Path } from "react-native-svg";

const { width } = Dimensions.get("window");

const ProfilePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = route.params?.userId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add state for editing
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (!error && data && data.user) {
        if (!userId || data.user.id === userId) {
          setProfile({
            name: data.user.user_metadata?.name || "",
            email: data.user.email,
            id: data.user.id,
            phone: data.user.phone || data.user.user_metadata?.phone || "",
          });
          setName(data.user.user_metadata?.name || "");
          setEmail(data.user.email || "");
          setPhone(data.user.phone || data.user.user_metadata?.phone || "");
        } else {
          setProfile(null);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  // Update user profile (name, email, phone) in Supabase Auth
  const handleSave = async () => {
    setSaving(true);
    let error = null;

    // Update email if changed
    if (email !== profile.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) error = emailError;
    }

    // Update name and phone in user_metadata
    if (name !== profile.name || phone !== (profile.phone || "")) {
      const { error: metaError } = await supabase.auth.updateUser({
        data: { name, phone },
      });
      if (metaError) error = metaError;
    }

    if (!error) {
      setProfile((prev) => ({ ...prev, name, email, phone }));
      setEditing(false);
    } else {
      alert("Failed to update profile.");
    }
    setSaving(false);
  };

  // Logout handler
  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4f8cff", "#3358d1"]}
        style={styles.topLeftCircle}
        start={[0, 0]}
        end={[1, 1]}
      />
      <LinearGradient
        colors={["#232946", "#4f8cff"]}
        style={styles.bottomRightCircle}
        start={[0, 1]}
        end={[1, 0]}
      />
      
      <Text style={styles.title}>Profile</Text>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          overScrollMode="always"
        >
          <View style={styles.card}>
            {loading ? (
              <ActivityIndicator color="#4f8cff" size="large" />
            ) : profile ? (
              <>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarCircle}>
                    {/* Person SVG Icon inside the circle */}
                    <Svg width={54} height={54} viewBox="0 0 54 54">
                      <Circle cx="27" cy="27" r="27" fill="#4f8cff" />
                      {/* Head */}
                      <Circle cx="27" cy="20" r="8" fill="#fff" />
                      {/* Body */}
                      <Path
                        d="M14 44c0-7.18 5.82-13 13-13s13 5.82 13 13"
                        stroke="#fff"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </Svg>
                  </View>
                </View>
                
                {editing ? (
                  <View style={styles.editSection}>
                    <Text style={styles.sectionTitle}>Edit Profile</Text>
                    
                    <Text style={styles.profileLabel}>Name</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      editable={!saving}
                      placeholder="Enter your name"
                      placeholderTextColor="#bfc9d1"
                    />
                    
                    <Text style={styles.profileLabel}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      editable={!saving}
                      placeholder="Enter your email"
                      placeholderTextColor="#bfc9d1"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    
                    <Text style={styles.profileLabel}>Phone</Text>
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      editable={!saving}
                      placeholder="Enter your phone"
                      placeholderTextColor="#bfc9d1"
                      keyboardType="phone-pad"
                      returnKeyType="done"
                      blurOnSubmit={true}
                      onSubmitEditing={Keyboard.dismiss}
                      selectionColor="#4f8cff"
                    />
                    
                    <View style={styles.editButtonRow}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.saveButtonText}>Save</Text>
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setEditing(false)}
                        disabled={saving}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.profileName}>{profile.name || "No Name"}</Text>
                    <Text style={styles.profileEmail}>{profile.email || "N/A"}</Text>
                    <Text style={styles.profilePhone}>{profile.phone || "No phone"}</Text>
                    
                    <View style={styles.profileInfoBox}>
                      <Text style={styles.profileLabel}>User ID</Text>
                      <Text style={styles.profileValue}>{profile.id}</Text>
                    </View>
                    
                    <View style={styles.actionsContainer}>
                      <TouchableOpacity
                        style={styles.editProfileButton}
                        onPress={() => setEditing(true)}
                      >
                        <Feather name="edit-2" size={18} color="#fff" />
                        <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        disabled={loggingOut}
                      >
                        <Feather name="log-out" size={18} color="#fff" />
                        <Text style={styles.logoutButtonText}>
                          {loggingOut ? "Logging out..." : "Logout"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </>
            ) : (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={36} color="#f44336" />
                <Text style={styles.errorText}>Profile not found.</Text>
                <Text style={styles.errorSubtext}>Please try logging in again.</Text>
              </View>
            )}
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>App Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2023.10.15</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device ID</Text>
              <Text style={styles.infoValue}>DV-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Home", {userId })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="home-variant" style={styles.navIcon} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("IMU", {userId })}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="chart-line" style={styles.navIcon} />
          <Text style={styles.navText}>IMU</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("DTH", {userId })}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="thermometer" style={styles.navIcon} />
          <Text style={styles.navText}>DTH</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("GPS", {userId })}
          activeOpacity={0.7}
        >
          <Ionicons name="location-sharp" style={styles.navIcon} />
          <Text style={styles.navText}>GPS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, styles.activeNavItem]}
          activeOpacity={0.7}
        >
          <Feather name="user" style={[styles.navIcon, styles.activeNavIcon]} />
          <Text style={[styles.navText, styles.activeNavText]}>Profile</Text>
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
  keyboardAvoidingView: {
    flex: 1,
    width: "100%",
  },
  scrollView: {
    width: "100%",
    zIndex: 1,
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: NAVBAR_HEIGHT + 20,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "rgba(34, 40, 57, 0.95)",
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#1f2687",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4f8cff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#232946",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  profileName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  profileEmail: {
    color: "#bfc9d1",
    fontSize: 16,
    marginBottom: 4,
    textAlign: "center",
  },
  profilePhone: {
    color: "#bfc9d1",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  profileInfoBox: {
    backgroundColor: "rgba(43, 51, 73, 0.5)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
  },
  actionsContainer: {
    width: "100%",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#4f8cff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  profileLabel: {
    color: "#bfc9d1",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  profileValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4f8cff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    marginBottom: 14,
  },
  editProfileButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f44336",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  
  // Edit section styles
  editSection: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 10,
  },
  input: {
    color: "#fff",
    backgroundColor: "rgba(43, 51, 73, 0.7)",
    borderRadius: 12,
    padding: 14,
    width: "100%",
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(79, 140, 255, 0.5)",
  },
  editButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#4f8cff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 0,
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "rgba(43, 51, 73, 0.7)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 0,
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    borderWidth: 1,
    borderColor: "#bfc9d1",
  },
  cancelButtonText: {
    color: "#bfc9d1",
    fontWeight: "bold",
    fontSize: 16,
  },
  
  // Error container styles
  errorContainer: {
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#f44336",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },
  errorSubtext: {
    color: "#bfc9d1",
    fontSize: 14,
    textAlign: "center",
  },
  
  // Info card styles
  infoCard: {
    backgroundColor: "rgba(34, 40, 57, 0.95)",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    width: "90%",
    maxWidth: 380,
    shadowColor: "#1f2687",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(43, 51, 73, 0.7)",
  },
  infoLabel: {
    color: "#bfc9d1",
    fontSize: 14,
  },
  infoValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  
  // Navbar styles
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

export default ProfilePage;
