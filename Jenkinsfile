pipeline {
    agent any
    environment {
        EXPO_PUBLIC_SUPABASE_URL = credentials('EXPO_PUBLIC_SUPABASE_URL')
        EXPO_PUBLIC_SUPABASE_ANON_KEY = credentials('EXPO_PUBLIC_SUPABASE_ANON_KEY')
        WIFI_SSID = credentials('WIFI_SSID')
        WIFI_PASSWORD = credentials('WIFI_PASSWORD')
        SUPABASE_URL = credentials('SUPABASE_URL')
        SUPABASE_API_KEY = credentials('SUPABASE_API_KEY')
        USER_ID = credentials('USER_ID')
        HOME = 'C:\\Users\\vivek'
        USERPROFILE = 'C:\\Users\\vivek'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Create .env') {
            steps {
                bat '''
                echo EXPO_PUBLIC_SUPABASE_URL=%EXPO_PUBLIC_SUPABASE_URL% > .env
                echo EXPO_PUBLIC_SUPABASE_ANON_KEY=%EXPO_PUBLIC_SUPABASE_ANON_KEY% >> .env
                '''
            }
        }
        stage('Create secrets.h') {
            steps {
                bat '''
                echo #define WIFI_SSID "%WIFI_SSID%" > esp32\\secrets.h
                echo #define WIFI_PASSWORD "%WIFI_PASSWORD%" >> esp32\\secrets.h
                echo #define SUPABASE_URL "%SUPABASE_URL%" >> esp32\\secrets.h
                echo #define SUPABASE_API_KEY "%SUPABASE_API_KEY%" >> esp32\\secrets.h
                echo #define USER_ID "%USER_ID%" >> esp32\\secrets.h
                '''
            }
        }
        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }
        stage('Install Arduino Libraries') {
            steps {
                bat 'arduino-cli lib install "TinyGPSPlus"'
                bat 'arduino-cli lib install "Adafruit MPU6050"'
                bat 'arduino-cli lib install "DHT sensor library"'
                bat 'arduino-cli lib install "ArduinoJson"'
            }
        }
        stage('Compile ESP32 Firmware') {
            steps {
                bat 'if not exist esp32\\Devops mkdir esp32\\Devops'
                bat 'copy esp32\\Devops_1_0_0.ino esp32\\Devops\\Devops.ino'
                bat 'copy esp32\\secrets.h esp32\\Devops\\secrets.h'
                bat 'arduino-cli compile --fqbn esp32:esp32:esp32 esp32\\Devops\\Devops.ino'
            }
        }
        stage('Test Firmware Upload Script') {
            steps {
                script {
                    // Set working directory for the script
                    dir('scripts') {
                        // Test listing firmware versions (read-only operation)
                        bat 'python upload_firmware.py list || exit /b'
                        
                        // Test listing binary files
                        bat 'python upload_firmware.py binaries || exit /b'
                        
                        echo "Firmware upload script tests passed!"
                    }
                }
            }
        }
        stage('App Test') {
            steps {
                bat 'npm test'
            }
        }
    }
}