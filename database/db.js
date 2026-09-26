/**
 * INVENTRA Database Connection Pool (Node.js + mysql2/promise)
 * Use this module to connect your Express/Node.js backend directly to MySQL.
 * 
 * Prerequisites:
 *   npm install mysql2 dotenv
 */

import mysql from 'mysql2/promise';

// Connection configuration with sensible defaults for local development
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'inventra_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Execute a parameterized SQL query
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Promise<Array>}
 */
export async function query(sql, params = []) {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error.message, { sql, params });
    throw error;
  }
}

/**
 * Helper to fetch dashboard metrics directly from the MySQL view
 */
export async function getDashboardKPIs() {
  const [rows] = await pool.query('SELECT * FROM v_dashboard_kpis LIMIT 1');
  return rows[0];
}

/**
 * Helper to get all products with live stock and health metrics
 */
export async function getProducts(options = {}) {
  const { warehouseId, categoryId, search } = options;
  let sql = 'SELECT * FROM v_product_stock_summary WHERE 1=1';
  const params = [];

  if (warehouseId) {
    sql += ' AND warehouse_short_code = ?';
    params.push(warehouseId);
  }
  if (categoryId) {
    sql += ' AND category_name = ?';
    params.push(categoryId);
  }
  if (search) {
    sql += ' AND (product_name LIKE ? OR sku LIKE ? OR barcode LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY product_name ASC';
  return query(sql, params);
}

/**
 * Test database connectivity
 */
export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected successfully to INVENTRA MySQL database');
    conn.release();
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to MySQL database:', err.message);
    return false;
  }
}

export default pool;
