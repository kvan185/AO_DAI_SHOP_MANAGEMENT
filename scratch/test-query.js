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

        const [rows] = await connection.query(`
            SELECT p.*, pi.image_path as image_path 
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
            ORDER BY p.created_at DESC
        `);
        console.log(`Query succeeded with ${rows.length} rows.`);
        await connection.end();
    } catch (e) {
        console.error("Query failed:", e.message);
    }
}

testQuery();
