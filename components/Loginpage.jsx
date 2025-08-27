import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../lib/supabase";

const { width, height } = Dimensions.get("window");

const Loginpage = () => {
  const navigation = useNavigation();

  // State for Supabase auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check for existing session on component mount
  useEffect(() => {
    checkSession();
  }, []);

  // Function to check if user is already logged in
  const checkSession = async () => {
    try {
      setLoading(true);

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setInitialCheckDone(true);
        setLoading(false);
        return;
      }

      if (session) {
        // Session exists, navigate to Home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home', params: { userId: session.user.id } }],
        });
      } else {
        // No session, stay on login page
        setInitialCheckDone(true);
        setLoading(false);
      }
    } catch (error) {
      setInitialCheckDone(true);
      setLoading(false);
    }
  };

  // Supabase email/password sign-in
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password');
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Login Error', error.message || "Incorrect email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Successful login, store session in secure storage
      if (data?.session) {
        try {
          // Store auth token in AsyncStorage
          await AsyncStorage.setItem('supabase-auth', JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          }));

          // Navigate to home screen
          const userId = data.user.id;
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home', params: { userId } }],
          });
        } catch (storageError) {
          setError("Could not save session. Please try again.");
        }
      } else {
        setError("Login successful but no session created. Please try again.");
      }
    } catch (e) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading indicator until initial session check is complete
  if (!initialCheckDone && loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4f8cff" />
        <Text style={styles.loadingText}>Checking session...</Text>
      </View>
    );
  }

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
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>
          Welcome back! Please login to your account.
        </Text>
        {/* Email/Password Form */}
        <View style={{ width: "100%", marginBottom: 16 }}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#bfc9d1"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
          <View style={{ position: "relative", width: "100%" }}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#bfc9d1"
              secureTextEntry={!showPassword}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 16,
                top: 10,
                height: 32,
                justifyContent: "center",
                alignItems: "center",
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#4f8cff"
              />
            </TouchableOpacity>
          </View>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.loginBtnContainer, loading && styles.disabledButton]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            <LinearGradient
              colors={["#4f8cff", "#3358d1"]}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.loginBtn}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Login</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text style={styles.signupText}>
          Don't have an account?{" "}
          <Text
            style={{ color: "#4f8cff" }}
            onPress={() => navigation.navigate("SignUp")}
          >
            Sign up
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
    borderRadius: 24, // More rounded
    overflow: "hidden",
  },
  loginBtn: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24, // More rounded
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
    borderRadius: 24, // More rounded for all buttons
  },
  socialIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
    resizeMode: "contain",
  },
  signupText: {
    marginTop: 0,
    color: "#bfc9d1",
    fontSize: 15,
    textAlign: "center",
  },
  errorText: {
    color: "#ff6b6b",
    marginBottom: 12,
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
  },
});

export default Loginpage;