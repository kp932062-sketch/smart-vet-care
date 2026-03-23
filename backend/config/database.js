const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function env(name, fallback) {
  return process.env[name] || fallback;
}

function pickDbEnv(primary, secondary, fallback, invalidValues = []) {
  const rawValue = (process.env[primary] || process.env[secondary] || '').toString().trim();
  if (!rawValue || invalidValues.includes(rawValue)) {
    return fallback;
  }
  return rawValue;
}

const placeholderValues = ['your_db_user', 'your_db_password'];

const dbConfig = {
  host: pickDbEnv('DB_HOST', 'MYSQL_HOST', '127.0.0.1'),
  port: Number(pickDbEnv('DB_PORT', 'MYSQL_PORT', '3310')),
  user: pickDbEnv('DB_USER', 'MYSQL_USER', 'smartvet_user', placeholderValues),
  password: pickDbEnv('DB_PASSWORD', 'MYSQL_PASSWORD', '', placeholderValues),
  database: pickDbEnv('DB_NAME', 'MYSQL_DATABASE', 'smartvet'),
  connectionLimit: Number(pickDbEnv('DB_CONNECTION_LIMIT', 'MYSQL_CONNECTION_LIMIT', '10'))
};

function decorateDatabaseError(error) {
  if (error && error.code === 'ER_ACCESS_DENIED_ERROR') {
    error.message = `MySQL access denied for ${dbConfig.user}@${dbConfig.host}. Verify DB_USER/DB_PASSWORD (or MYSQL_USER/MYSQL_PASSWORD) in backend/.env.`;
  }
  return error;
}

let pool;

function createPool() {
  return mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    port: dbConfig.port,
    waitForConnections: true,
    connectionLimit: dbConfig.connectionLimit,
    queueLimit: 0,
    namedPlaceholders: true,
    multipleStatements: true,
    decimalNumbers: true
  });
}

function getPool() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

async function query(sql, params = []) {
  try {
    const [rows] = await getPool().execute(sql, params);
    return rows;
  } catch (error) {
    throw decorateDatabaseError(error);
  }
}

async function transaction(work) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw decorateDatabaseError(error);
  } finally {
    connection.release();
  }
}

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port,
    multipleStatements: true
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await connection.end();
  }
}

async function initializeDatabase() {
  await ensureDatabaseExists();
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await getPool().query(schema);
}

async function initializeDatabaseWithRetry(options = {}) {
  const maxAttempts = Number(options.maxAttempts || env('DB_CONNECT_RETRIES', 3));
  const delayMs = Number(options.delayMs || env('DB_CONNECT_RETRY_DELAY_MS', 2000));
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await initializeDatabase();
      return;
    } catch (error) {
      lastError = decorateDatabaseError(error);
      const nonRetryable =
        lastError.code === 'ER_ACCESS_DENIED_ERROR' ||
        lastError.code === 'ER_DBACCESS_DENIED_ERROR' ||
        lastError.code === 'ER_BAD_DB_ERROR';

      if (attempt === 1 || !nonRetryable) {
        console.error(`Database initialization attempt ${attempt}/${maxAttempts} failed: ${lastError.message}`);
      }

      if (nonRetryable) {
        break;
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

async function testConnection() {
  const rows = await query('SELECT DATABASE() AS database_name, 1 AS ok');
  return rows[0];
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  dbConfig,
  getPool,
  query,
  transaction,
  initializeDatabase,
  initializeDatabaseWithRetry,
  testConnection,
  closePool
};
