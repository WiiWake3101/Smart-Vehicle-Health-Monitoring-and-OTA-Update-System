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

## 📊 System Architecture
