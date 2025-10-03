pipeline {
    agent any
    
    parameters {
        booleanParam(defaultValue: false, description: 'Upload firmware to Supabase?', name: 'UPLOAD_FIRMWARE')
        string(defaultValue: '1.0.1', description: 'Firmware version (e.g., 1.0.1)', name: 'FIRMWARE_VERSION')
        string(defaultValue: 'GPS-Tracker', description: 'Device type', name: 'DEVICE_TYPE')
        booleanParam(defaultValue: false, description: 'Mark firmware as mandatory update?', name: 'IS_MANDATORY')
        booleanParam(defaultValue: false, description: 'Force upload even if version exists?', name: 'FORCE_UPLOAD')
    }
    
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
        PYTHON_DIR = 'C:\\Users\\vivek\\AppData\\Local\\Programs\\Python\\Python313'
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
        stage('Check and Upload Firmware') {
            steps {
                script {
                    // Verify firmware exists
                    bat 'if exist esp32\\build\\esp32.esp32.esp32wrover\\Devops.ino.bin echo ✅ Firmware compiled successfully'
                    
                    // Copy firmware to expected location for script
                    bat '''
                        if not exist Devops\\esp32\\build\\esp32.esp32.esp32wrover mkdir Devops\\esp32\\build\\esp32.esp32.esp32wrover
                        copy esp32\\build\\esp32.esp32.esp32wrover\\Devops.ino.bin Devops\\esp32\\build\\esp32.esp32.esp32wrover\\
                    '''
                    
                    // Run firmware upload script
                    dir('scripts') {
                        // Test firmware detection
                        bat '''
                        set ENV_FILE_PATH=../.env
                        echo 📋 Checking compiled firmware...
                         %PYTHON_DIR%\\python.exe upload_firmware.py binaries
                        '''
                        
                        // Conditionally upload firmware if parameter is set
                        if (params.UPLOAD_FIRMWARE) {
                            echo "🚀 FIRMWARE UPLOAD ENABLED - Uploading to Supabase..."
                            
                            // Include --force flag if FORCE_UPLOAD is true
                            def forceFlag = params.FORCE_UPLOAD ? "--force" : ""
                            
                            bat """
                            set ENV_FILE_PATH=../.env
                             %PYTHON_DIR%\\python.exe upload_firmware.py upload "../Devops/esp32/build/esp32.esp32.esp32wrover/Devops.ino.bin" ${params.FIRMWARE_VERSION} ${params.DEVICE_TYPE} ${params.IS_MANDATORY} ${forceFlag}
                            """
                            
                            echo "✅ Firmware uploaded! Version: ${params.FIRMWARE_VERSION}, Device: ${params.DEVICE_TYPE}"
                        } else {
                            echo "ℹ️ Firmware upload skipped (set UPLOAD_FIRMWARE parameter to enable)"
                        }
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