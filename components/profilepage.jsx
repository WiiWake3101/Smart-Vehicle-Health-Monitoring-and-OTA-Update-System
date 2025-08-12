import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, TextInput, Keyboard, TouchableWithoutFeedback } from "react-native";
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                    style={[styles.input, { color: "#fff", fontWeight: "bold", letterSpacing: 1.5 }]}
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
                      <Text style={styles.saveButtonText}>
                        {saving ? "Saving..." : "Save"}
                      </Text>
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
                    <Text style={styles.logoutButtonText}>{loggingOut ? "Logging out..." : "Logout"}</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : (
            <Text style={styles.profileValue}>Profile not found.</Text>
          )}
        </View>
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
            style={styles.navItem}
            onPress={() => navigation.navigate("Profile", {userId })}
            activeOpacity={0.7}
          >
            <Feather name="user" style={styles.navIcon} />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
    justifyContent: "center",
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
    backgroundColor: "rgba(34, 40, 57, 0.98)",
    borderRadius: 32,
    paddingVertical: 36,
    paddingHorizontal: 24,
    width: "88%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#1f2687",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.37,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4f8cff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: "#232946",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  title: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 24,
    marginTop: 30,
    marginBottom: 8,
    textAlign: "center",
  },
  profileName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 2,
    textAlign: "center",
  },
  profileEmail: {
    color: "#bfc9d1",
    fontSize: 15,
    marginBottom: 2,
    textAlign: "center",
  },
  profilePhone: {
    color: "#bfc9d1",
    fontSize: 15,
    marginBottom: 10,
    textAlign: "center",
  },
  profileInfoBox: {
    backgroundColor: "#232946",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 18,
    alignItems: "center",
    width: "100%",
  },
  profileLabel: {
    color: "#bfc9d1",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
  },
  profileValue: {
    color: "#4f8cff",
    fontSize: 14,
    marginBottom: 2,
    textAlign: "center",
    fontWeight: "600",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4f8cff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 22,
    marginTop: 10,
    shadowColor: "#4f8cff",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  editProfileButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
  editSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  input: {
    color: "#4f8cff",
    backgroundColor: "#232946",
    borderRadius: 8,
    padding: 10,
    width: "100%",
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#4f8cff",
  },
  editButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#4f8cff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginRight: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  cancelButton: {
    backgroundColor: "#232946",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#bfc9d1",
  },
  cancelButtonText: {
    color: "#bfc9d1",
    fontWeight: "bold",
    fontSize: 15,
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f44336",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 22,
    marginTop: 16,
    shadowColor: "#f44336",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
});

export default ProfilePage;
