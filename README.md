# Smart Vehicle Health Monitoring and OTA Update System 🚗

A comprehensive IoT solution for real-time vehicle monitoring and over-the-air updates, built with ESP32, React Native, Supabase, and a modern DevOps stack.

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
- **DevOps Tools:** Jenkins CI/CD, Ansible, Terraform, Docker, Grafana and Prometheus

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

### Docker Setup

1. **Build the Docker image:**
   ```bash
   docker build -t vehicle-monitoring-app .
   ```

2. **Set your IP address:**
   
   Before running the container, uncomment and set your machine's IP address in the Dockerfile:
   ```dockerfile
   ENV REACT_NATIVE_PACKAGER_HOSTNAME=<your-machine-ip-address>
   ```

3. **Run the Docker container:**
   ```bash
   docker run -it --rm \
     -p 8081:8081 \
     -p 19000:19000 \
     -p 19001:19001 \
     -p 19002:19002 \
     vehicle-monitoring-app
   ```

4. **Connect to Expo:**
   
   Open the Expo Go app on your mobile device and connect directly to your machine's IP address at port 19000.

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

## 🚀 CI/CD Pipeline with Jenkins

This project uses Jenkins for continuous integration and deployment:

- **Automated Testing:**  
  Jenkins runs unit and integration tests on each commit.
- **Mobile App Builds:**  
  Jenkins automates Expo builds for iOS and Android.
- **ESP32 Firmware Verification:**  
  Jenkins compiles and statically analyzes ESP32 firmware.
- **OTA Updates:**  
  Jenkins automates deployment of firmware updates to the S3 bucket.
- **Secrets Management:**  
  Jenkins securely injects Supabase and WiFi credentials into `.env` and `secrets.h` files for builds.

**Jenkins Pipeline Example:**  
See [`Jenkinsfile`](./Jenkinsfile) for the full pipeline.

## 🏗️ Infrastructure as Code with Terraform

Terraform is used to automate and manage cloud infrastructure for this project.  
It provisions AWS resources such as EC2 instances, S3 buckets for firmware storage, IAM users and policies, and security groups for monitoring tools.  
The main Terraform configuration is in `infra/terraform/main.tf`, which defines:

- The AWS region and team members as variables.
- The latest Ubuntu AMI for EC2.
- Security groups for SSH, HTTP, Expo, Grafana, Prometheus, Node Exporter, and other required ports.
- An EC2 instance for testing and deployment, tagged with environment and owner information.
- Output of the public IP address for easy access.

Terraform ensures reproducibility, scalability, and best practices by keeping all infrastructure code in the `infra/terraform` directory.

**How to Use:**

1. **Provision Infrastructure:**
   ```sh
   cd infra/terraform
   terraform init
   terraform plan
   terraform apply
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
## 🚀 DevOps Tools Used

This project leverages the following DevOps tools for automation, deployment, and monitoring:

- **Jenkins CI/CD:** Automated testing, mobile app builds, firmware verification, OTA updates, and secrets management.
- **Ansible:** Automated configuration management and deployment of application and monitoring stack.
- **Terraform:** Infrastructure as Code for provisioning AWS resources, IAM policies, and S3 buckets.
- **Docker:** Containerization for consistent development, testing, and deployment of services.
- **Grafana:** Monitoring and visualization of system and hardware metrics.

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