import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import login from "./Login"
import SplashScreen from "./Splash";
import signup from "./SignUp"
import Home from "./Home";
import IMU from "./IMU";
import Profile from "./profile";
import GPS from "./GPS"
import DTH from "./DTH";

const Stack = createNativeStackNavigator();

export default function Layout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={login} />
      <Stack.Screen name="SignUp" component={signup} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="IMU" component={IMU} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="GPS" component={GPS} />
      <Stack.Screen name="DTH" component={DTH} />
      {/* Add more Stack.Screen entries for other screens */}
    </Stack.Navigator>
  );
}