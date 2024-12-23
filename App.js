const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Configure PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// POST endpoint to register a new sensor
router.post('/sensors', async (req, res) => {
    try {
        const { sensor_name, location } = req.body;
        const result = await pool.query(
            'INSERT INTO sensors (sensor_name, location) VALUES ($1, $2) RETURNING *',
            [sensor_name, location]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST endpoint to record moisture reading
router.post('/readings', async (req, res) => {
    try {
        const { sensor_id, moisture_level, battery_level, temperature } = req.body;
        
        // Determine LED status based on moisture level
        const led_status = moisture_level >= 40 ? 'green' : 'red';
        
        const result = await pool.query(
            `INSERT INTO moisture_readings 
            (sensor_id, moisture_level, led_status, battery_level, temperature) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *`,
            [sensor_id, moisture_level, led_status, battery_level, temperature]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET endpoint to fetch latest readings for all sensors
router.get('/latest-readings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM latest_readings');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET endpoint to fetch historical readings for a specific sensor
router.get('/readings/:sensor_id', async (req, res) => {
    try {
        const { sensor_id } = req.params;
        const { days } = req.query;
        
        const result = await pool.query(
            `SELECT * FROM moisture_readings 
            WHERE sensor_id = $1 
            AND timestamp >= NOW() - INTERVAL '${days || 7} days'
            ORDER BY timestamp DESC`,
            [sensor_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
