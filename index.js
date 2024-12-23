 Create database
CREATE DATABASE soil_moisture_db;

-- Create table for sensors
CREATE TABLE sensors (
    sensor_id SERIAL PRIMARY KEY,
    sensor_name VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    installation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create table for moisture readings
CREATE TABLE moisture_readings (
    reading_id SERIAL PRIMARY KEY,
    sensor_id INTEGER REFERENCES sensors(sensor_id),
    moisture_level DECIMAL(5,2) NOT NULL, -- Percentage value (0-100)
    led_status VARCHAR(10) CHECK (led_status IN ('green', 'red')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    battery_level DECIMAL(5,2), -- Optional battery level monitoring
    temperature DECIMAL(5,2), -- Optional temperature reading
    CONSTRAINT valid_moisture CHECK (moisture_level >= 0 AND moisture_level <= 100)
);

-- Create indexes for better query performance
CREATE INDEX idx_sensor_readings ON moisture_readings(sensor_id, timestamp);
CREATE INDEX idx_moisture_level ON moisture_readings(moisture_level);

-- Create view for latest readings
CREATE VIEW latest_readings AS
SELECT 
    s.sensor_id,
    s.sensor_name,
    s.location,
    mr.moisture_level,
    mr.led_status,
    mr.timestamp,
    mr.battery_level,
    mr.temperature
FROM sensors s
JOIN moisture_readings mr ON s.sensor_id = mr.sensor_id
WHERE mr.timestamp = (
    SELECT MAX(timestamp)
    FROM moisture_readings
    WHERE sensor_id = s.sensor_id
);

