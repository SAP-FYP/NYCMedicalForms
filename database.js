require('dotenv').config(); // Import all key/value pairs from .env in process.env with dotenv package
const mysql2 = require('mysql2/promise');

const pool = mysql2.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  connectionLimit: process.env.DB_CONNECTION_LIMIT,
  ssl: {
    rejectUnauthorized: false,
  },
  multipleStatements: true
});

module.exports = {
  query: async function (sql, params) {
    // Get a connection from the connection pool
    const conn = await pool.getConnection();
    try {
      // Execute the query using the connection and parameters
      const rows = await conn.query(sql, params);
      // Return the rows returned by the query
      return rows;
    } catch (err) {
      // If an error occurs, throw it so the calling code can handle it
      throw err;
    } finally {
      // Release the connection back to the pool, whether an error occurred or not
      conn.release();
    }
  },
  pool: pool
};
