pipeline {
    agent any
    environment {
        ARDUINO_DATA_DIR = 'C:\\ProgramData\\Jenkins\\.jenkins\\arduino-data'
        EXPO_PUBLIC_SUPABASE_URL = credentials('EXPO_PUBLIC_SUPABASE_URL')
        EXPO_PUBLIC_SUPABASE_ANON_KEY = credentials('EXPO_PUBLIC_SUPABASE_ANON_KEY')
        WIFI_SSID = credentials('WIFI_SSID')
        WIFI_PASSWORD = credentials('WIFI_PASSWORD')
        SUPABASE_URL = credentials('SUPABASE_URL')
        SUPABASE_API_KEY = credentials('SUPABASE_API_KEY')
        USER_ID = credentials('USER_ID')
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
                if not exist esp32 mkdir esp32
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
                bat 'set ARDUINO_DATA_DIR=%ARDUINO_DATA_DIR% && arduino-cli lib install "TinyGPSPlus"'
                bat 'set ARDUINO_DATA_DIR=%ARDUINO_DATA_DIR% && arduino-cli lib install "Adafruit MPU6050"'
                bat 'set ARDUINO_DATA_DIR=%ARDUINO_DATA_DIR% && arduino-cli lib install "DHT sensor library"'
                bat 'set ARDUINO_DATA_DIR=%ARDUINO_DATA_DIR% && arduino-cli lib install "ArduinoJson"'
            }
        }

        stage('Prepare Arduino Data Dir & Core') {
            steps {
                bat 'if not exist "%ARDUINO_DATA_DIR%" mkdir "%ARDUINO_DATA_DIR%"'
                bat 'set ARDUINO_DATA_DIR=%ARDUINO_DATA_DIR% && arduino-cli core install esp32:esp32'
                bat 'set ARDUINO_DATA_DIR=%ARDUINO_DATA_DIR% && arduino-cli core list || echo "core list failed"'
                bat 'set ARDUINO_DATA_DIR=%ARDUINO_DATA_DIR% && arduino-cli board listall esp32:esp32 || echo "board listall failed"'
            }
        }

        stage('Compile ESP32 Firmware') {
            steps {
                // ensure Devops sketch folder exists and contains Devops.ino (copied from Devops_1_0_0.ino)
                bat 'if not exist esp32\\Devops mkdir esp32\\Devops'
                bat 'echo BEFORE COPY: listing esp32 folder && dir esp32'
                bat 'copy /Y esp32\\Devops_1_0_0.ino esp32\\Devops\\Devops.ino'
                bat 'copy /Y esp32\\secrets.h esp32\\Devops\\secrets.h'
                bat 'echo AFTER COPY: listing esp32\\Devops folder && dir esp32\\Devops'
                // use ARDUINO_DATA_DIR for Jenkins-run arduino-cli
                bat 'set ARDUINO_DATA_DIR=%ARDUINO_DATA_DIR% && arduino-cli core list || echo "core list failed"'
                // compile using sketch folder (not a mismatched file name) and Wrover FQBN
                bat 'set ARDUINO_DATA_DIR=%ARDUINO_DATA_DIR% && arduino-cli compile --fqbn esp32:esp32:esp32wrover esp32\\Devops'
            }
        }

        stage('Install Python Dependencies') {
            steps {
                bat 'pip install -r scripts\\requirements.txt'
            }
        }

        stage('Upload Firmware') {
            steps {
                bat 'python scripts\\upload_firmware.py'
            }
        }

        stage('Test Mobile App') {
            steps {
                bat 'npm test'
            }
        }

        stage('Build Mobile App') {
            steps {
                bat 'npx expo build:android'
                bat 'npx expo build:ios'
            }
        }
    }
}