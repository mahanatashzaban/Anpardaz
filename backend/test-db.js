const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Atash1365%25@localhost:5432/payment_db'
});

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() as time, current_database() as db');
    console.log('✅ Database connected successfully!');
    console.log('📊 Database:', res.rows[0].db);
    console.log('🕐 Time:', res.rows[0].time);
    
    // Show tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('📋 Tables in database:', tables.rows.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
  pool.end();
}

testConnection();
