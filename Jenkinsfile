pipeline {
    agent none
    
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
            agent any
            steps {
                checkout scm
            }
        }
        
        stage('Arduino Tasks') {
            agent {
                dockerfile {
                    filename 'Dockerfile.arduino-agent'
                    dir 'Devops'
                    args '-v ${WORKSPACE}:/app'
                }
            }
            stages {
                stage('Verify Arduino Setup') {
                    steps {
                        sh 'arduino-cli version'
                        sh 'arduino-cli core list'
                        sh 'arduino-cli board list'
                        sh 'arduino-cli lib list'
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
                
                stage('Compile ESP32 Firmware') {
                    steps {
                        sh 'mkdir -p esp32/Devops'
                        sh 'cp esp32/Devops_1_0_0.ino esp32/Devops/Devops.ino'
                        
                        // Verbose compilation for better debugging
                        sh 'arduino-cli compile --fqbn esp32:esp32:esp32wrover esp32/Devops --verbose'
                    }
                }
                
                stage('Upload Firmware') {
                    when {
                        expression { return fileExists('scripts/upload_firmware.py') }
                    }
                    steps {
                        sh 'python3 scripts/upload_firmware.py'
                    }
                }
            }
        }
        
        stage('Mobile App Tasks') {
            agent {
                docker {
                    image 'node:18'
                    args '-v ${WORKSPACE}:/app -w /app'
                }
            }
            stages {
                stage('Create .env') {
                    steps {
                        sh '''
                        echo "EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL" > .env
                        echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY" >> .env
                        '''
                    }
                }
                
                stage('Install Node Dependencies') {
                    steps {
                        sh 'npm install'
                    }
                }
                
                stage('Run Tests') {
                    steps {
                        sh 'npm test'
                    }
                }
                
                stage('Build Mobile App') {
                    steps {
                        sh 'npx eas build --platform android --non-interactive'
                        sh 'npx eas build --platform ios --non-interactive'
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