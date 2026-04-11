import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // Default XAMPP password is empty
    database: process.env.DB_NAME || 'shop_ao_dai',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

export default pool;
