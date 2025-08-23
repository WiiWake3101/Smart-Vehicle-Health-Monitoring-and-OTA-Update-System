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
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Verify Arduino Setup') {
            steps {
                sh 'arduino-cli version'
                sh 'arduino-cli core list'
                sh 'node --version'
                sh 'npm --version'
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
        
        stage('Run Tests') {
            steps {
                bat 'arduino-cli lib install "TinyGPSPlus"'
                bat 'arduino-cli lib install "Adafruit MPU6050"'
                bat 'arduino-cli lib install "DHT sensor library"'
                bat 'arduino-cli lib install "ArduinoJson"'
            }
        }
        stage('Compile ESP32 Firmware') {
            steps {
                sh 'mkdir -p esp32/Devops'
                sh 'cp esp32/Devops_1_0_0.ino esp32/Devops/Devops.ino'
                sh 'arduino-cli compile --fqbn esp32:esp32:esp32wrover esp32/Devops'
            }
        }
        
        stage('Build Mobile App') {
            steps {
                // Use EAS Build (modern Expo build system)
                sh 'npx eas build --platform android --non-interactive'
                sh 'npx eas build --platform ios --non-interactive'
            }
        }
        
        stage('Upload Firmware') {
            steps {
                script {
                    if (fileExists('scripts/upload_firmware.py')) {
                        sh 'python3 scripts/upload_firmware.py'
                    } else {
                        echo 'Upload script not found, skipping firmware upload'
                    }
                }
            }
        }
    }
    
    post {
        success {
            archiveArtifacts artifacts: 'esp32/Devops/build/**/*.bin', allowEmptyArchive: true
        }
    }
}