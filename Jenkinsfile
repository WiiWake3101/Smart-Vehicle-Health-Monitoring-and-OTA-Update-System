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
        stage('Create .env') {
            steps {
                sh '''
                echo "EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL" > .env
                echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY" >> .env
                '''
            }
        }
        stage('Create secrets.h') {
            steps {
                sh '''
                echo "#define WIFI_SSID \\"$WIFI_SSID\\"" > esp32/secrets.h
                echo "#define WIFI_PASSWORD \\"$WIFI_PASSWORD\\"" >> esp32/secrets.h
                echo "#define SUPABASE_URL \\"$SUPABASE_URL\\"" >> esp32/secrets.h
                echo "#define SUPABASE_API_KEY \\"$SUPABASE_API_KEY\\"" >> esp32/secrets.h
                echo "#define USER_ID \\"$USER_ID\\"" >> esp32/secrets.h
                '''
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
        stage('Compile ESP32 Firmware') {
            steps {
                // Create proper Arduino sketch structure
                sh 'mkdir -p esp32/Devops'
                sh 'cp esp32/Devops_1_0_0.ino esp32/Devops/Devops.ino'
                sh 'arduino-cli core list'
                // Compile with correct Arduino sketch structure
                sh 'arduino-cli compile --fqbn esp32:esp32:esp32wrover esp32/Devops/Devops.ino'
            }
        }
        stage('Build Mobile App') {
            steps {
                sh 'npx expo build:android'
                sh 'npx expo build:ios'
            }
        }
        stage('Upload Firmware') {
            steps {
                sh 'python scripts/upload_firmware.py'
            }
        }
    }
}