const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
require('dotenv').config();

const parseBoolean = (value) => ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
const parsedPort = Number(process.env.DB_PORT);
const dbPort = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 3306;

const shouldUseSsl = parseBoolean(process.env.DB_SSL);
const caFromEnv = process.env.DB_SSL_CA ? process.env.DB_SSL_CA.replace(/\\n/g, '\n') : undefined;
const caFromPath = process.env.DB_SSL_CA_PATH
  ? fs.readFileSync(path.resolve(process.env.DB_SSL_CA_PATH), 'utf8')
  : undefined;
const sslCa = caFromEnv || caFromPath;
const shouldRejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== undefined
  ? parseBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED)
  : Boolean(sslCa);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: dbPort,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ...(shouldUseSsl
    ? {
        ssl: {
          rejectUnauthorized: shouldRejectUnauthorized,
          ...(sslCa ? { ca: sslCa } : {}),
        },
      }
    : {}),
});

module.exports = pool.promise();