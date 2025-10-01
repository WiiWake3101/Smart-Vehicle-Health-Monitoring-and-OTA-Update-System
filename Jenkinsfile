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
        stage('List Directories') {
            steps {
                // Show workspace root contents
                bat 'echo "=== WORKSPACE ROOT (%CD%) ===" && dir'
                
                // Explore esp32 directory structure in detail
                bat 'echo "=== ESP32 DIRECTORY ===" && if exist esp32 dir esp32 /s'
                
                // Look for .bin files anywhere in the workspace
                bat 'echo "=== SEARCHING FOR .BIN FILES ===" && dir /s /b *.bin'
                
                // Look specifically in build directories
                bat 'echo "=== SEARCHING FOR BUILD DIRECTORIES ===" && dir /s /b *build*'
                
                // List scripts directory contents
                bat 'echo "=== SCRIPTS DIRECTORY ===" && if exist scripts dir scripts'
                
                // Check parent directory of workspace
                bat 'echo "=== PARENT DIRECTORY ===" && dir ..'
                
                // Try to find the Devops.ino.bin file
                bat 'echo "=== SEARCHING FOR DEVOPS.INO.BIN ===" && dir /s /b *Devops.ino.bin*'
            }
        }
        stage('Test Firmware Upload Script') {
            steps {
                script {
                    // Create a simple test binary for testing purposes
                    bat '''
                    echo Creating test binary file...
                    mkdir -p test_bin_dir
                    echo This is a test binary file > test_bin_dir\\test.bin
                    dir test_bin_dir
                    '''
                    
                    // Set working directory for the script
                    dir('scripts') {
                        // Test with the test binary directory
                        bat 'set DEFAULT_BIN_PATH=%CD%\\..\\test_bin_dir && python upload_firmware.py binaries || exit /b'
                        
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