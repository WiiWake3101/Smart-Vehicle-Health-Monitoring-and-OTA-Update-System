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
        // Set Arduino CLI config directory
        ARDUINO_CLI_CONFIG = "${WORKSPACE}/.arduino15"
        ARDUINO_USER_DIR = "${WORKSPACE}/Arduino"
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Setup Arduino CLI') {
            steps {
                script {
                    // Create Arduino directories
                    sh 'mkdir -p ${ARDUINO_CLI_CONFIG}'
                    sh 'mkdir -p ${ARDUINO_USER_DIR}'
                    
                    // Initialize Arduino CLI config if not exists
                    sh '''
                    if [ ! -f ${ARDUINO_CLI_CONFIG}/arduino-cli.yaml ]; then
                        arduino-cli config init --config-dir ${ARDUINO_CLI_CONFIG}
                    fi
                    '''
                    
                    // Add ESP32 board manager URL to config
                    sh '''
                    arduino-cli config add board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json --config-dir ${ARDUINO_CLI_CONFIG}
                    '''
                    
                    // Update package index
                    sh 'arduino-cli core update-index --config-dir ${ARDUINO_CLI_CONFIG}'
                    
                    // Install ESP32 core if not already installed
                    sh '''
                    if ! arduino-cli core list --config-dir ${ARDUINO_CLI_CONFIG} | grep -q "esp32:esp32"; then
                        arduino-cli core install esp32:esp32 --config-dir ${ARDUINO_CLI_CONFIG}
                    fi
                    '''
                    
                    // Install required libraries if not already installed
                    sh '''
                    arduino-cli lib install --config-dir ${ARDUINO_CLI_CONFIG} "WiFi" || echo "WiFi library already installed or built-in"
                    arduino-cli lib install --config-dir ${ARDUINO_CLI_CONFIG} "ArduinoHttpClient" || echo "ArduinoHttpClient already installed"
                    arduino-cli lib install --config-dir ${ARDUINO_CLI_CONFIG} "ArduinoJson" || echo "ArduinoJson already installed"
                    '''
                    
                    // Verify installation
                    sh 'arduino-cli core list --config-dir ${ARDUINO_CLI_CONFIG}'
                }
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
                script {
                    // Create proper Arduino sketch structure
                    sh 'mkdir -p esp32/Devops'
                    sh 'cp esp32/Devops_1_0_0.ino esp32/Devops/Devops.ino'
                    
                    // Compile with correct Arduino sketch structure
                    sh 'arduino-cli compile --fqbn esp32:esp32:esp32wrover --config-dir ${ARDUINO_CLI_CONFIG} esp32/Devops/Devops.ino'
                }
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
    post {
        always {
            // Clean up Arduino directories if needed
            sh 'rm -rf ${ARDUINO_CLI_CONFIG} ${ARDUINO_USER_DIR}'
        }
    }
}