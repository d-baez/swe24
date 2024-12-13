require('dotenv').config();

const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Promise-based queries
const promisePool = pool.promise();

const connectDB = async () => {
  try {
    const [rows] = await promisePool.query('SELECT 1'); // Test query
    console.log('MySQL Database Connected');
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
    process.exit(1);
  }
};

module.exports = { connectDB, promisePool };
