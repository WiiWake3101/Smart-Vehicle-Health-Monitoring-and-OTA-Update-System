pipeline {
    agent any

    parameters {
        booleanParam(name: 'UPLOAD_FIRMWARE', defaultValue: false, description: 'Upload firmware to Supabase?')
        string(name: 'FIRMWARE_VERSION', defaultValue: '1.0.1', description: 'Firmware version (e.g., 1.0.1)')
        string(name: 'DEVICE_TYPE', defaultValue: 'GPS-Tracker', description: 'Device type')
        booleanParam(name: 'IS_MANDATORY', defaultValue: false, description: 'Mark firmware as mandatory update?')
        booleanParam(name: 'FORCE_UPLOAD', defaultValue: false, description: 'Force upload even if version exists?')
    }

    environment {
        EXPO_PUBLIC_SUPABASE_URL      = credentials('EXPO_PUBLIC_SUPABASE_URL')
        EXPO_PUBLIC_SUPABASE_ANON_KEY = credentials('EXPO_PUBLIC_SUPABASE_ANON_KEY')
        WIFI_SSID                     = credentials('WIFI_SSID')
        WIFI_PASSWORD                 = credentials('WIFI_PASSWORD')
        SUPABASE_URL                  = credentials('SUPABASE_URL')
        SUPABASE_API_KEY              = credentials('SUPABASE_API_KEY')
        USER_ID                       = credentials('USER_ID')
        HOME                          = 'C:\\Users\\vivek'
        USERPROFILE                   = 'C:\\Users\\vivek'
        ARDUINO_CLI                   = 'arduino-cli'
        PYTHON                        = 'python'
        BUILD_PATH                    = 'esp32\\build\\esp32.esp32.esp32wrover'
        FIRMWARE_BIN                  = 'Devops.ino.bin'
        FIRMWARE_SRC                  = 'esp32\\Devops_1_0_0.ino'
        FIRMWARE_DST                  = 'esp32\\Devops\\Devops.ino'
        SECRETS_HDR                   = 'esp32\\secrets.h'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Generate Environment Files') {
            steps {
                bat """
                echo EXPO_PUBLIC_SUPABASE_URL=%EXPO_PUBLIC_SUPABASE_URL% > .env
                echo EXPO_PUBLIC_SUPABASE_ANON_KEY=%EXPO_PUBLIC_SUPABASE_ANON_KEY% >> .env
                echo #define WIFI_SSID "%WIFI_SSID%" > %SECRETS_HDR%
                echo #define WIFI_PASSWORD "%WIFI_PASSWORD%" >> %SECRETS_HDR%
                echo #define SUPABASE_URL "%SUPABASE_URL%" >> %SECRETS_HDR%
                echo #define SUPABASE_API_KEY "%SUPABASE_API_KEY%" >> %SECRETS_HDR%
                echo #define USER_ID "%USER_ID%" >> %SECRETS_HDR%
                """
            }
        }

        stage('Install Node & Arduino Dependencies') {
            parallel {
                stage('Node Dependencies') {
                    steps {
                        bat 'npm install'
                    }
                }
                stage('Arduino Libraries') {
                    steps {
                        bat """
                        %ARDUINO_CLI% lib install "TinyGPSPlus"
                        %ARDUINO_CLI% lib install "Adafruit MPU6050"
                        %ARDUINO_CLI% lib install "DHT sensor library"
                        %ARDUINO_CLI% lib install "ArduinoJson"
                        """
                    }
                }
            }
        }

        stage('Compile ESP32 Firmware') {
            steps {
                bat """
                if not exist esp32\\Devops mkdir esp32\\Devops
                copy %FIRMWARE_SRC% %FIRMWARE_DST%
                copy %SECRETS_HDR% esp32\\Devops\\secrets.h
                %ARDUINO_CLI% compile --fqbn esp32:esp32:esp32 esp32\\Devops\\Devops.ino
                """
            }
        }

        stage('Check and Upload Firmware') {
            steps {
                script {
                    dir('scripts') {
                        bat '''
                        set ENV_FILE_PATH=../.env
                        echo 📋 Checking compiled firmware...
                        C:\\Users\\vivek\\AppData\\Local\\Programs\\Python\\Python313\\python.exe upload_firmware.py binaries
                        '''
                        if (params.UPLOAD_FIRMWARE) {
                            echo "🚀 FIRMWARE UPLOAD ENABLED - Uploading to Supabase..."
                            def forceFlag = params.FORCE_UPLOAD ? "--force" : ""
                            def firmwareBinPath = "${env.WORKSPACE}\\${env.BUILD_PATH}\\${env.FIRMWARE_BIN}"
                            bat """
                            set ENV_FILE_PATH=../.env
                            echo Firmware binary path: %firmwareBinPath%
                            C:\\Users\\vivek\\AppData\\Local\\Programs\\Python\\Python313\\python.exe upload_firmware.py upload "%firmwareBinPath%" ${params.FIRMWARE_VERSION} ${params.DEVICE_TYPE} ${params.IS_MANDATORY} ${forceFlag}
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