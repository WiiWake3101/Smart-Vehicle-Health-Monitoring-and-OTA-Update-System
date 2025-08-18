# Smart Vehicle Health Monitoring and OTA Update System 🚗

A comprehensive IoT solution for real-time vehicle monitoring with over-the-air updates using ESP32, React Native, and Supabase.

## 🔍 Project Overview

This system provides real-time monitoring of vehicle health metrics including:
- GPS location tracking with trip history
- Temperature and humidity sensing
- IMU (Inertial Measurement Unit) data for motion analysis
- OTA (Over-The-Air) firmware updates for ESP32 devices

## 🛠️ Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Real-time API)
- **IoT Hardware**: ESP32 with GPS, DHT22, and MPU6050 sensors
- **DevOps**: Jenkins, Docker, Terraform, GitHub Actions

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

1. Connect the sensors:
   - GPS module to pins 16 (RX) and 17 (TX)
   - DHT22 sensor to pin 5
   - MPU6050 to I2C pins (SDA/SCL)

2. Flash the ESP32 firmware:

   ```bash
   cd esp32/sensor_data_uploader
   arduino-cli compile --fqbn esp32:esp32:esp32 .
   arduino-cli upload -p [PORT] --fqbn esp32:esp32:esp32 .
   ```

## 🚀 CI/CD Pipeline with Jenkins

This project uses Jenkins for continuous integration and deployment:

1. **Automated Testing**: Unit and integration tests run on each commit
2. **Mobile App Builds**: Automated Expo builds for iOS and Android
3. **ESP32 Firmware Verification**: Compilation and static analysis
4. **OTA Updates**: Automated deployment of firmware updates

### Jenkins Pipeline Structure

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            parallel {
                stage('Mobile App') {
                    steps {
                        sh 'npm install'
                        sh 'npm test'
                    }
                }
                stage('ESP32 Firmware') {
                    steps {
                        sh 'arduino-cli compile --fqbn esp32:esp32:esp32 ./esp32/sensor_data_uploader'
                    }
                }
            }
        }
        stage('Deploy') {
            when { branch 'main' }
            steps {
                sh 'npx expo build:android'
                sh 'npx expo build:ios'
                sh './scripts/deploy_ota_update.sh'
            }
        }
    }
}
```
## 🔄 DevOps Practices Implemented

- **Infrastructure as Code**: Terraform for Supabase resources
- **Containerization**: Docker for consistent development and testing
- **Monitoring**: Grafana dashboards for system performance
- **Automated Testing**: Jest for frontend, Arduino unit tests for ESP32
- **Security Scanning**: Dependency vulnerability scanning
- **Version Control**: Git with GitHub flow branching strategy

## Environment Configuration (.env)

This application requires a properly configured `.env` file in the root directory. Below is the structure of the `.env` file with the required variables:

```
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Important Notes:
- Never commit your `.env` file to version control
- Make sure to add `.env` to your `.gitignore` file
- For local development, create a `.env.local` file that won't be tracked by git
- Request actual values from the project administrator

## 🔄 OTA Firmware Upload Script

A Python script (`scripts/upload_firmware.py`) is provided to manage firmware binaries and OTA updates via Supabase.

### Features

- **Automatic Detection**: Finds `.bin` files in the default directory and uploads them.
- **Manual Upload**: Upload a specific binary with version and device type.
- **Version Management**: List, delete, and check firmware versions.
- **Supabase Integration**: Uploads binaries to Supabase Storage and registers metadata in the database.

### Usage

```bash
# Automatic upload of all binaries in the default directory
python scripts/upload_firmware.py

# Manual upload
python scripts/upload_firmware.py upload <binary_path> <version> <device_type> [is_mandatory] [--force]

# List firmware versions
python scripts/upload_firmware.py list [device_type]

# List available binary files
python scripts/upload_firmware.py binaries

# Delete a firmware version
python scripts/upload_firmware.py delete <version> <device_type>

# Delete all firmware versions
python scripts/upload_firmware.py delete --all
```

**Note:**  
- Ensure your `.env` file contains `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- The script will look for binaries in `python upload_firmware.py upload "C:\Users\vivek\OneDrive\Documents\Arduino\Devops\build\esp32.esp32.esp32wrover\Devops.ino.bin" 1.0.0 GPS-Tracker false` by default.

## Getting Started

1. Clone the repository
2. Create the `.env` file as described above
3. Install dependencies with `npm install`
4. Start the development server with `npx expo start`
