const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function run() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3310,
    user: 'smartvet_user',
    password: 'SmartVetDB@123',
    database: 'smartvet'
  });

  const [existingByEmail] = await conn.execute("SELECT id, role FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1", ['kundan@gmail.com']);
  const [rows] = await conn.execute("SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1");
  const hash = await bcrypt.hash('123456789', 12);

  if (existingByEmail.length > 0) {
    await conn.execute(
      "UPDATE users SET role = 'admin', status = 'active', is_active = 1, password = ? WHERE id = ?",
      [hash, existingByEmail[0].id]
    );
    console.log('ADMIN_EMAIL_PROMOTED', existingByEmail[0].id);
  } else if (rows.length > 0) {
    await conn.execute('UPDATE users SET email = ?, password = ? WHERE id = ?', ['kundan@gmail.com', hash, rows[0].id]);
    console.log('ADMIN_UPDATED', rows[0].id);
  } else {
    await conn.execute(
      "INSERT INTO users (name, email, mobile, password, role, pet_name, status, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      ['SmartVet Platform Admin', 'kundan@gmail.com', null, hash, 'admin', null, 'active', 1]
    );
    console.log('ADMIN_CREATED');
  }

  await conn.end();
}

run().catch((error) => {
  console.error('ADMIN_UPDATE_ERR', error.message);
  process.exit(1);
});
