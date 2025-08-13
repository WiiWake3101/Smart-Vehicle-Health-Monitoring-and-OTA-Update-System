-- Sample GPS data for user 5bef5871-dc77-4985-91fb-4067c54e4608
-- Starting point: BSR Vidhyu Latha enclave
-- Routes: 
-- 1. Home to SRM Institute of Science and Technology, Kattankulathur
-- 2. SRM Institute back to Home
-- 3. Home to Express Avenue Mall

-- Trip 1: BSR Vidhyu Latha enclave to SRM Institute (Morning Trip)
INSERT INTO sensor_data (user_id, latitude, longitude, speed, altitude, satellites, time, accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, humidity, temperature) VALUES
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.9229, 80.1275, 0, 22, 8, '2023-08-15 08:00:00+05:30', 0.01, 0.02, 0.98, 0.01, 0.01, 0.01, 65, 28),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.9182, 80.1220, 35, 23, 9, '2023-08-15 08:03:20+05:30', 0.05, 0.01, 1.01, 0.02, 0.03, 0.01, 65, 28.2),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.9101, 80.1156, 42, 24, 8, '2023-08-15 08:06:40+05:30', 0.03, 0.02, 0.99, 0.01, 0.02, 0.01, 66, 28.3),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.9009, 80.1082, 50, 25, 9, '2023-08-15 08:10:00+05:30', 0.02, 0.03, 1.02, 0.02, 0.01, 0.02, 66, 28.5),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.8925, 80.0998, 45, 23, 10, '2023-08-15 08:13:20+05:30', 0.04, 0.02, 0.98, 0.03, 0.02, 0.01, 67, 28.6),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.8832, 80.0910, 38, 22, 9, '2023-08-15 08:16:40+05:30', 0.02, 0.01, 1.01, 0.01, 0.03, 0.02, 67, 28.8),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.8724, 80.0811, 43, 21, 8, '2023-08-15 08:20:00+05:30', 0.03, 0.02, 0.99, 0.02, 0.01, 0.01, 68, 29),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.8617, 80.0712, 40, 20, 9, '2023-08-15 08:23:20+05:30', 0.02, 0.03, 1.00, 0.01, 0.02, 0.02, 68, 29.2),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.8486, 80.0625, 35, 19, 8, '2023-08-15 08:26:40+05:30', 0.01, 0.02, 0.98, 0.03, 0.01, 0.01, 69, 29.5),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.8324, 80.0536, 25, 19, 9, '2023-08-15 08:30:00+05:30', 0.03, 0.01, 1.01, 0.01, 0.02, 0.01, 69, 29.7),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.8237, 80.0475, 0, 18, 8, '2023-08-15 08:35:00+05:30', 0.01, 0.01, 0.99, 0.01, 0.01, 0.01, 70, 30);

-- Trip 2: SRM Institute back to BSR Vidhyu Latha enclave (Evening Trip)
INSERT INTO sensor_data (user_id, latitude, longitude, speed, altitude, satellites, time, accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, humidity, temperature) VALUES
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.8237, 80.0475, 0, 18, 9, '2023-08-15 17:00:00+05:30', 0.01, 0.02, 0.98, 0.01, 0.01, 0.01, 62, 31),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.8324, 80.0536, 30, 19, 8, '2023-08-15 17:03:20+05:30', 0.04, 0.02, 1.01, 0.02, 0.03, 0.01, 62, 30.8),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.8486, 80.0625, 45, 19, 9, '2023-08-15 17:06:40+05:30', 0.02, 0.01, 0.99, 0.01, 0.02, 0.02, 61, 30.6),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.8617, 80.0712, 50, 20, 10, '2023-08-15 17:10:00+05:30', 0.03, 0.03, 1.02, 0.03, 0.01, 0.01, 61, 30.4),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.8724, 80.0811, 48, 21, 9, '2023-08-15 17:13:20+05:30', 0.02, 0.02, 0.98, 0.01, 0.03, 0.02, 60, 30.2),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.8832, 80.0910, 40, 22, 8, '2023-08-15 17:16:40+05:30', 0.01, 0.01, 1.01, 0.02, 0.01, 0.01, 60, 30),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.8925, 80.0998, 42, 23, 9, '2023-08-15 17:20:00+05:30', 0.03, 0.02, 0.99, 0.01, 0.02, 0.02, 59, 29.8),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.9009, 80.1082, 38, 25, 8, '2023-08-15 17:23:20+05:30', 0.02, 0.03, 1.00, 0.02, 0.01, 0.01, 59, 29.6),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.9101, 80.1156, 35, 24, 9, '2023-08-15 17:26:40+05:30', 0.01, 0.02, 0.98, 0.01, 0.03, 0.02, 58, 29.4),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.9182, 80.1220, 30, 23, 8, '2023-08-15 17:30:00+05:30', 0.03, 0.01, 1.01, 0.03, 0.01, 0.01, 58, 29.2),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.9229, 80.1275, 0, 22, 9, '2023-08-15 17:35:00+05:30', 0.01, 0.01, 0.99, 0.01, 0.01, 0.01, 57, 29);

-- Trip 3: BSR Vidhyu Latha enclave to Express Avenue Mall (Weekend Trip)
INSERT INTO sensor_data (user_id, latitude, longitude, speed, altitude, satellites, time, accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, humidity, temperature) VALUES
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.9229, 80.1275, 0, 22, 9, '2023-08-19 11:00:00+05:30', 0.01, 0.01, 0.98, 0.01, 0.01, 0.01, 60, 29),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.9325, 80.1382, 32, 23, 8, '2023-08-19 11:04:00+05:30', 0.03, 0.02, 1.01, 0.02, 0.02, 0.01, 60, 29.2),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.9450, 80.1482, 40, 24, 9, '2023-08-19 11:08:00+05:30', 0.02, 0.01, 0.99, 0.01, 0.03, 0.02, 61, 29.4),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.9592, 80.1578, 45, 25, 10, '2023-08-19 11:12:00+05:30', 0.04, 0.03, 1.02, 0.03, 0.01, 0.01, 61, 29.6),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.9725, 80.1684, 48, 26, 9, '2023-08-19 11:16:00+05:30', 0.02, 0.02, 0.98, 0.01, 0.02, 0.03, 62, 29.8),
('5bef5871-dc77-4985-91fb-4067c54e4608', 12.9865, 80.1782, 50, 27, 8, '2023-08-19 11:20:00+05:30', 0.03, 0.01, 1.01, 0.02, 0.01, 0.01, 62, 30),
('5bef5871-dc77-4985-91fb-4067c54e4608', 13.0009, 80.1886, 42, 28, 9, '2023-08-19 11:24:00+05:30', 0.01, 0.02, 0.99, 0.01, 0.03, 0.02, 63, 30.2),
('5bef5871-dc77-4985-91fb-4067c54e4608', 13.0158, 80.1998, 38, 27, 8, '2023-08-19 11:28:00+05:30', 0.02, 0.03, 1.00, 0.03, 0.01, 0.01, 63, 30.4),
('5bef5871-dc77-4985-91fb-4067c54e4608', 13.0302, 80.2115, 35, 26, 9, '2023-08-19 11:32:00+05:30', 0.03, 0.02, 0.98, 0.01, 0.02, 0.02, 64, 30.6),
('5bef5871-dc77-4985-91fb-4067c54e4608', 13.0438, 80.2305, 30, 25, 8, '2023-08-19 11:36:00+05:30', 0.01, 0.01, 1.01, 0.02, 0.01, 0.01, 64, 30.8),
('5bef5871-dc77-4985-91fb-4067c54e4608', 13.0574, 80.2606, 0, 24, 9, '2023-08-19 11:40:00+05:30', 0.01, 0.01, 0.99, 0.01, 0.01, 0.01, 65, 31);

-- Create trips and trip_points tables if they don't exist
CREATE TABLE IF NOT EXISTS trips (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  start_latitude double precision not null,
  start_longitude double precision not null,
  end_latitude double precision not null,
  end_longitude double precision not null,
  distance double precision not null,
  duration integer not null,
  avg_speed double precision not null,
  max_speed double precision not null,
  start_address text,
  end_address text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS trip_points (
  id bigint generated always as identity primary key,
  trip_id bigint references trips(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  speed double precision,
  altitude double precision,
  time timestamptz not null,
  created_at timestamptz default now()
);

-- Insert sample trip records
INSERT INTO trips (
  user_id, start_time, end_time, 
  start_latitude, start_longitude, 
  end_latitude, end_longitude,
  distance, duration, avg_speed, max_speed,
  start_address, end_address
) VALUES
(
  '5bef5871-dc77-4985-91fb-4067c54e4608',
  '2023-08-15 08:00:00+05:30',
  '2023-08-15 08:35:00+05:30',
  12.9229, 80.1275,
  12.8237, 80.0475,
  18.5, 35, 40, 50,
  'BSR Vidhyu Latha enclave', 
  'SRM Institute of Science and Technology, Kattankulathur'
),
(
  '5bef5871-dc77-4985-91fb-4067c54e4608',
  '2023-08-15 17:00:00+05:30',
  '2023-08-15 17:35:00+05:30',
  12.8237, 80.0475,
  12.9229, 80.1275,
  18.5, 35, 38, 50,
  'SRM Institute of Science and Technology, Kattankulathur',
  'BSR Vidhyu Latha enclave'
),
(
  '5bef5871-dc77-4985-91fb-4067c54e4608',
  '2023-08-19 11:00:00+05:30',
  '2023-08-19 11:40:00+05:30',
  12.9229, 80.1275,
  13.0574, 80.2606,
  15.3, 40, 36, 50,
  'BSR Vidhyu Latha enclave',
  'Express Avenue Mall, Chennai'
);
