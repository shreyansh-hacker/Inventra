import mysql from 'mysql2/promise';

async function testMySQL() {
  console.log('🔄 Connecting to XAMPP MySQL (localhost:3306)...');
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '', // default XAMPP root password is empty
      database: 'inventra_db'
    });

    console.log('✅ Connected to MySQL database `inventra_db` successfully!\n');

    // 1. Check Tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📊 Found ${tables.length} tables in inventra_db:`);
    console.log(tables.map(t => Object.values(t)[0]).join(', '));
    console.log('');

    // 2. Check Users
    const [users] = await connection.query('SELECT id, name, email, role_id, status FROM users');
    console.log(`👤 Users count: ${users.length}`);
    console.table(users);

    // 3. Check Products
    const [products] = await connection.query('SELECT id, name, sku, unit, cost_price, selling_price FROM products LIMIT 5');
    console.log(`📦 Sample Products (first 5 of total):`);
    console.table(products);

    // 4. Check Warehouses
    const [warehouses] = await connection.query('SELECT id, name, short_code, capacity FROM warehouses');
    console.log(`🏢 Warehouses:`);
    console.table(warehouses);

    await connection.end();
    console.log('🎉 Database is 100% operational and healthy!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Hint: Please make sure MySQL is started in XAMPP Control Panel.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Hint: Database `inventra_db` does not exist yet. Please create it in phpMyAdmin.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Hint: Check your MySQL username and password (default in XAMPP is user: root, password: empty).');
    }
  }
}

testMySQL();
