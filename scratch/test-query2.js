const mysql = require('mysql2/promise');

async function testQuery() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'shop_ao_dai',
        });
        console.log("Connected to DB.");
        await connection.end();
    } catch (e) {
        console.error("Connection error completely caught:");
        console.error(e);
        process.exit(1);
    }
}

testQuery();
