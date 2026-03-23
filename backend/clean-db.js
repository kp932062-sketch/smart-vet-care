const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function cleanDatabase() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3307),
    user: process.env.DB_USER || 'smartvet_user',
    password: process.env.DB_PASSWORD || 'SmartVetDB@123',
    database: process.env.DB_NAME || 'smartvet'
  });

  try {
    console.log('Disabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    const tables = [
      'admin_messages',
      'treatments',
      'consultation_messages',
      'medical_reports',
      'appointments',
      'pets',
      'doctors',
      'users'
    ];

    for (const table of tables) {
      console.log(`Truncating table: ${table}...`);
      try {
        await connection.query(`TRUNCATE TABLE ${table};`);
        console.log(`✅ Table ${table} truncated successfully.`);
      } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
          console.log(`⚠️ Table ${table} does not exist, skipping.`);
        } else {
          console.error(`❌ Error truncating ${table}:`, err.message);
        }
      }
    }

    console.log('Re-enabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    
    console.log('\n🎉 Database cleanup complete! All past appointments, users, doctors, and messages have been removed.');
    console.log('Your Admin login (stored in .env) is still active and secure.');

  } catch (error) {
    console.error('An error occurred during cleanup:', error);
  } finally {
    await connection.end();
  }
}

cleanDatabase();
