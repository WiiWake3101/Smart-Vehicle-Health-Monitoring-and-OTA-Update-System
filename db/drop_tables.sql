-- WARNING: This will permanently delete all sensor data
-- Make sure you have a backup before running this

-- First drop the trip_points and trips tables that might depend on sensor_data
DROP TABLE IF EXISTS trip_points CASCADE;
DROP TABLE IF EXISTS trips CASCADE;

-- Now drop the sensor_data table
DROP TABLE IF EXISTS sensor_data CASCADE;

-- Confirmation message
DO $$
BEGIN
    RAISE NOTICE 'Tables have been dropped successfully.';
END $$;
