const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function init() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3307,
      user: process.env.DB_USER || 'smartvet_user',
      password: process.env.DB_PASSWORD || 'SmartVetDB@123',
      database: process.env.DB_NAME || 'smartvet',
      multipleStatements: true
    });

    console.log('Connected to MySQL. Reading schema...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await connection.query(schema);
    
    console.log('Schema executed successfully.');
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:', tables);
    
    await connection.end();
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
}

init();
