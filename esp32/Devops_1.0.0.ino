#include <TinyGPS++.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <Update.h>
#include <ArduinoJson.h>
#include "secrets.h"

// pins and constants
#define RXD2 16
#define TXD2 17
#define GPS_BAUD 9600
#define DHTPIN 5
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

TinyGPSPlus gps;
HardwareSerial gpsSerial(2);
Adafruit_MPU6050 mpu;

// OTA configuration
#define CURRENT_FIRMWARE_VERSION "1.0.0"
#define DEVICE_TYPE "GPS-Tracker"
#define OTA_CHECK_INTERVAL 3600000 // Check for updates every hour (in milliseconds)
unsigned long lastOTACheck = 0;
bool otaInProgress = false;
unsigned long lastLedToggle = 0;
bool ledState = false;

void setup() {
  Serial.begin(115200);
  Serial.println("Starting...");
  Serial.printf("Current firmware version: %s\n", CURRENT_FIRMWARE_VERSION);
  
  // GPS serial
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);

  // MPU
  if (!mpu.begin()) {
    Serial.println("MPU6050 not found!");
    while (1) delay(1000);
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting WiFi");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi connected. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi not connected (timeout).");
  }

  dht.begin();

  Serial.print("Using hardcoded USER_ID: ");
  Serial.println(USER_ID);
}

void checkForOTA() {
  // Only check periodically to avoid excessive API calls
  if (millis() - lastOTACheck < OTA_CHECK_INTERVAL && lastOTACheck != 0) {
    return;
  }

  lastOTACheck = millis();

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, skipping OTA check");
    return;
  }

  Serial.println("Checking for firmware updates...");

  // Create a secure client
  WiFiClientSecure *client = new WiFiClientSecure;
  if(client) {
    // Skip certificate verification (for development only - not secure for production)
    client->setInsecure();
    Serial.println("Created secure client");
    
    HTTPClient https;
    https.setTimeout(10000);
    
    // Correctly construct the URL to the firmware table
    String url = String(SUPABASE_URL) + "/rest/v1/firmware?select=version,binary_url,is_mandatory&device_type=eq." + DEVICE_TYPE + "&order=created_at.desc&limit=1";
    Serial.print("Request URL: ");
    Serial.println(url);

    Serial.println("Beginning HTTPS connection...");
    if (https.begin(*client, url)) {
      Serial.println("Adding headers...");
      Serial.print("API Key (first 5 chars): ");
      Serial.println(String(SUPABASE_API_KEY).substring(0, 5) + "...");
      https.addHeader("apikey", SUPABASE_API_KEY);
      https.addHeader("Authorization", String("Bearer ") + SUPABASE_API_KEY);

      Serial.println("Sending GET request...");
      int httpCode = https.GET();
      Serial.print("HTTP response code: ");
      Serial.println(httpCode);


if (httpCode == 200) {
        String payload = https.getString();
        Serial.print("Response payload: ");
        Serial.println(payload);
        
        // Parse JSON response
        DynamicJsonDocument doc(1024);
        DeserializationError error = deserializeJson(doc, payload);
        
        if (error) {
          Serial.print("JSON parsing failed: ");
          Serial.println(error.c_str());
        } else if (doc.size() > 0) {
          Serial.print("JSON array size: ");
          Serial.println(doc.size());
          
          // Get the first (and only) item in the array
          JsonObject firmware = doc[0];
          String newVersion = firmware["version"].as<String>();
          String binaryUrl = firmware["binary_url"].as<String>();
          bool isMandatory = firmware["is_mandatory"].as<bool>();
          
          Serial.printf("Latest version: %s, Current version: %s\n", newVersion.c_str(), CURRENT_FIRMWARE_VERSION);
          
          // Compare versions (simple string comparison - you might want a more sophisticated version check)
          if (newVersion != CURRENT_FIRMWARE_VERSION) {
            Serial.println("New firmware version available");
            downloadAndInstallUpdate(binaryUrl);
          } else {
            Serial.println("Firmware is up to date");
          }
        } else {
          Serial.println("No firmware records found in the response");
        }
      } else {
        Serial.printf("Failed to check for updates, HTTP error: %s\n", https.errorToString(httpCode).c_str());
      }

      https.end();
    } else {
      Serial.println("Failed to establish HTTPS connection");
    }
    
    delete client;
  } else {
    Serial.println("Failed to create secure client");
  }
  
  Serial.println("OTA check completed");
}

void downloadAndInstallUpdate(String binaryUrl) {
  otaInProgress = true;
  Serial.printf("Downloading firmware from: %s\n", binaryUrl.c_str());

  // Create a secure client
  WiFiClientSecure *client = new WiFiClientSecure;
  if (!client) {
    Serial.println("Failed to create secure client for download");
    otaInProgress = false;
    return;
  }
  
  // Skip certificate verification (for development only)
  client->setInsecure();
  
  HTTPClient https;
  https.setTimeout(30000); // 30 second timeout for downloading
  
  Serial.println("Beginning HTTPS connection for firmware download...");
  if (https.begin(*client, binaryUrl)) {
    Serial.println("Sending GET request for firmware...");
    int httpCode = https.GET();
    Serial.print("HTTP response code: ");
    Serial.println(httpCode);
    
    if (httpCode == 200) {
      // Get the update size
      int contentLength = https.getSize();
      Serial.printf("Update size: %d bytes\n", contentLength);
      
      // Check if OTA is possible
      unsigned int freeSpace = ESP.getFreeSketchSpace();
      Serial.printf("Free sketch space: %u bytes\n", freeSpace);
      
      if (contentLength > 0 && contentLength < (freeSpace - 0x1000)) {
        // Begin OTA
        Serial.println("Starting Update.begin()...");
        if (Update.begin(contentLength)) {
          Serial.println("Starting OTA update...");
          
          // Create buffer for read
          uint8_t buff[128] = { 0 };
          WiFiClient * stream = https.getStreamPtr();
          
          // Read data and write it to Update
          size_t written = 0;
          unsigned long updateStart = millis();
          
          while (https.connected() && written < contentLength) {
            // Get available data size
            size_t size = stream->available();
            
            if (size > 0) {
              // Read up to 128 bytes
              size_t c = stream->readBytes(buff, ((size > sizeof(buff)) ? sizeof(buff) : size));
              
              // Write to Update
              if (Update.write(buff, c) != c) {
                Serial.println("Write error during update");
                break;
              }
              
              written += c;
              
              // Print progress


if (written % 4096 == 0) {
                Serial.printf("OTA Progress: %d%% (%d/%d bytes)\n", (written * 100) / contentLength, written, contentLength);
              }
            }
            
            // Check for timeout
            if (millis() - updateStart > 300000) { // 5 minute timeout
              Serial.println("Update timeout!");
              break;
            }
            
            delay(1);
          }
          
          if (written == contentLength) {
            Serial.println("Update successfully completed!");
            if (Update.end()) {
              Serial.println("Update successfully written. Rebooting...");
              ESP.restart();
            } else {
              Serial.printf("Update error: %d\n", Update.getError());
            }
          } else {
            Serial.println("Update incomplete. Something went wrong!");
            Serial.printf("Written: %d of %d bytes\n", written, contentLength);
            Update.abort();
          }
        } else {
          Serial.printf("Not enough space for OTA update: %d required, %d available\n", 
                      contentLength, freeSpace);
        }
      } else {
        Serial.println("Invalid content length or not enough space");
      }
    } else {
      Serial.printf("Failed to download update, HTTP error: %s\n", https.errorToString(httpCode).c_str());
    }

    https.end();
  } else {
    Serial.println("Failed to establish HTTPS connection for download");
  }
  
  delete client;
  otaInProgress = false;
  Serial.println("OTA process finished");
}

void sendToSupabase(float lat, float lng, float spd, float alt, int sat,
                   const char* ts, float ax, float ay, float az,
                   float gx, float gy, float gz, float h, float t) {
  if (otaInProgress) {
    return; // Skip sending data during OTA
  }

  if (WiFi.status() == WL_CONNECTED) {
    // Create a secure client
    WiFiClientSecure *client = new WiFiClientSecure;
    if (!client) {
      Serial.println("Failed to create secure client for data upload");
      return;
    }
    
    // Skip certificate verification (for development only)
    client->setInsecure();
    
    HTTPClient https;
    // Construct the URL to the sensor_data table
    String url = String(SUPABASE_URL) + "/rest/v1/sensor_data";
    Serial.print("Sending data to: ");
    Serial.println(url);
    
    if (https.begin(*client, url)) {
      https.addHeader("Content-Type", "application/json");
      https.addHeader("apikey", SUPABASE_API_KEY);
      https.addHeader("Authorization", String("Bearer ") + SUPABASE_API_KEY);

      // Create JSON document for data
      DynamicJsonDocument doc(1024);
      doc["user_id"] = USER_ID;
      doc["latitude"] = lat;
      doc["longitude"] = lng;
      doc["speed"] = spd;
      doc["altitude"] = alt;
      doc["satellites"] = sat;
      doc["time"] = ts;
      doc["accel_x"] = ax;
      doc["accel_y"] = ay;
      doc["accel_z"] = az;
      doc["gyro_x"] = gx;
      doc["gyro_y"] = gy;
      doc["gyro_z"] = gz;
      doc["humidity"] = h;
      doc["temperature"] = t;
      
      String requestBody;
      serializeJson(doc, requestBody);
      
      int httpResponseCode = https.POST(requestBody);
      
      if (httpResponseCode > 0) {
        String response = https.getString();
        Serial.println("Data sent to Supabase: " + response);
      } else {
        Serial.print("Error on sending data: ");
        Serial.println(httpResponseCode);
      }
      
      https.end();
    } else {
      Serial.println("Failed to establish HTTPS connection for data upload");
    }
    
    delete client;
  } else {
    Serial.println("WiFi not connected, cannot send data");
    // Try to reconnect WiFi
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }
}

void loop() {
  // Check for OTA updates first
  checkForOTA();

  // If OTA is in progress, don't do anything else to avoid conflicts
  if (otaInProgress) {
    delay(10);
    return;
  }

  // read gps
  while (gpsSerial.available() > 0) gps.encode(gpsSerial.read());

  if (gps.location.isUpdated()) {
    float lat = gps.location.lat();
    float lng = gps.location.lng();
    float spd = gps.speed.kmph();
    if (spd < 2.0) spd = 0.0;
    float alt = gps.altitude.meters();
    int sat = gps.satellites.value();
    
    // Get timestamp from GPS
    char timestamp[32];
    sprintf(timestamp, "%04d-%02d-%02dT%02d:%02d:%02dZ",
            gps.date.year(), gps.date.month(), gps.date.day(),
            gps.time.hour(), gps.time.minute(), gps.time.second());
    
    // Read motion data
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    
    // Read environmental data
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    
    // Send data to Supabase
    sendToSupabase(lat, lng, spd, alt, sat, 
                  timestamp, a.acceleration.x, a.acceleration.y, a.acceleration.z,
                  g.gyro.x, g.gyro.y, g.gyro.z, humidity, temperature);
  }

  // Add a small delay to prevent CPU overload
  delay(100);
}