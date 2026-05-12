require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to handle CORS and JSON data
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection using Aiven MySQL URL (from .env file)
let pool;
try {
    pool = mysql.createPool(process.env.MYSQL_URL);  // Connect to MySQL using the URL from .env
    console.log("Connected to Aiven MySQL");
} catch (err) {
    console.error("Database Connection Failed:", err);
}

// Create tables if they don't exist
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(50) UNIQUE NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                course VARCHAR(100) NOT NULL,
                year_level VARCHAR(20) NOT NULL,
                email VARCHAR(100) NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_name VARCHAR(100) NOT NULL
            );
        `);
    } catch (err) {
        console.error("Table Creation Error:", err);
    }
};
initDB();

// CREATE (Add a new student)
app.post('/api/students', async (req, res) => {
    const { student_id, full_name, course, year_level, email } = req.body;
    try {
        await pool.query(
            'INSERT INTO students (student_id, full_name, course, year_level, email) VALUES (?, ?, ?, ?, ?)',
            [student_id, full_name, course, year_level, email]
        );
        res.status(201).json({ message: "Student added successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ (Get all students)
app.get('/api/students', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM students ORDER BY id DESC');
        res.json(rows); // Send all students as JSON response
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE (Update student information)
app.put('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    const { student_id, full_name, course, year_level, email } = req.body;
    try {
        await pool.query(
            'UPDATE students SET student_id=?, full_name=?, course=?, year_level=?, email=? WHERE id=?',
            [student_id, full_name, course, year_level, email, id]
        );
        res.json({ message: "Student updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE (Delete a student)
app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM students WHERE id = ?', [id]);
        res.json({ message: "Student deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE (Add a new course)
app.post('/api/courses', async (req, res) => {
    const { course_name } = req.body;
    try {
        await pool.query(
            'INSERT INTO courses (course_name) VALUES (?)',
            [course_name]
        );
        res.status(201).json({ message: "Course added successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ (Get all courses)
app.get('/api/courses', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM courses ORDER BY id DESC');
        res.json(rows); // Send all courses as JSON response
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE (Delete a course)
app.delete('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM courses WHERE id = ?', [id]);
        res.json({ message: "Course deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server and listen for incoming requests
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
