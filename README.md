# Smart Vehicle Health Monitoring and OTA Update System 🚗

A comprehensive IoT solution for real-time vehicle monitoring and over-the-air updates, built with ESP32, React Native, and Supabase.

## 🔍 Project Overview

This system enables real-time monitoring of vehicle health metrics:
- GPS location tracking with trip history
- Temperature and humidity sensing
- IMU (Inertial Measurement Unit) data for motion analysis
- OTA (Over-The-Air) firmware updates for ESP32 devices

## 🛠️ Technology Stack

- **Frontend:** React Native with Expo
- **Backend:** Supabase (PostgreSQL + Real-time API)
- **IoT Hardware:** ESP32 with GPS, DHT22, and MPU6050 sensors

## ⚙️ Setup Instructions

### Mobile Application

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

### ESP32 Hardware Setup

1. **Connect the sensors:**
   - GPS module to pins 16 (RX) and 17 (TX)
   - DHT22 sensor to pin 5
   - MPU6050 to I2C pins (SDA/SCL)

2. **Create and configure `secrets.h` in the Arduino IDE:**
   - In the same folder as your `Devops_1.0.0.ino` file, create a file named `secrets.h`.
   - Add your WiFi SSID, password, Supabase URL, API key, and user ID as shown below:
     ```cpp
     #define WIFI_SSID "your_wifi_ssid"
     #define WIFI_PASSWORD "your_wifi_password"
     #define SUPABASE_URL "your_supabase_url"
     #define SUPABASE_API_KEY "your_supabase_anon_key"
     #define USER_ID "your_user_id"
     ```
   - Save `secrets.h` before compiling and uploading the firmware.

3. **Upload the firmware to ESP32:**
   - Open `Devops_1.0.0.ino` in Arduino IDE.
   - Select the correct board and port.
   - Compile and upload the sketch to your ESP32.

## Environment Configuration (.env)

This application requires a properly configured `.env` file in the root directory. Below is the structure of the `.env` file with the required variables:

```
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Started

1. Clone the repository
2. Create the `.env` file as described above
3. Install dependencies with `npm install`
4. Start the development server with `npx expo start`