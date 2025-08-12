import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import SplashScreen from "../components/splashScreen";

export default function Splash() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 1800); // 1.8 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return <SplashScreen />;
}