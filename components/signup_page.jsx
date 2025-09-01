
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Linking, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";
import { useNavigation } from "@react-navigation/native"; // <-- add this import

const { width, height } = Dimensions.get("window");

const signup_page = () => {
  // State for Supabase signup
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigation = useNavigation(); // <-- add this line

  // Supabase email/password sign-up
  const handleSignUp = async () => {
    setError('');
    setSuccess('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          phone: phone,
        },
      },
    });
    if (error) {
      if (
        error.message &&
        error.message.toLowerCase().includes("user already registered")
      ) {
        alert("User already exists. Please login.");
        navigation.navigate("Login");
      } else {
        setError(error.message);
      }
    } else {
      navigation.navigate("Login"); 
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
      <View style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>
          Create your account to get started.
        </Text>
        {/* Signup Form */}
        <View style={{ width: "100%", marginBottom: 16 }}>
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#bfc9d1"
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#bfc9d1"
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#bfc9d1"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#bfc9d1"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          {error ? (
            <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>
          ) : null}
          {success ? (
            <Text style={{ color: "green", marginBottom: 8 }}>{success}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.loginBtnContainer}
            onPress={handleSignUp}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#4f8cff", "#3358d1"]}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.loginBtn}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text style={styles.signupText}>
          Already have an account?{" "}
          <Text
            style={{ color: "#4f8cff" }}
            onPress={() => navigation.navigate("Login")}
          >
            Sign in
          </Text>
        </Text>
      </View>
    </View>
  );
};

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
  input: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2d3756",
    backgroundColor: "#232946",
    color: "#fff",
    fontSize: 16,
  },
  loginBtnContainer: {
    width: "100%",
    marginBottom: 8,
    borderRadius: 24,
    overflow: "hidden",
  },
  loginBtn: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  orText: {
    width: "100%",
    textAlign: "center",
    color: "#bfc9d1",
    marginVertical: 12,
    fontSize: 15,
  },
  socialBtn: {
    width: "100%",
    paddingVertical: 12,
    marginVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  roundedBtn: {
    borderRadius: 24,
  },
  socialIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
    resizeMode: "contain",
  },
  signupText: {
    color: "#bfc9d1",
    fontSize: 15,
    textAlign: "center",
  },
});

export default signup_page;