const mysql = require('mysql2/promise');

async function testConnection() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shop_ao_dai',
    };

    console.log('Testing connection with config:', { ...dbConfig, password: '***' });

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected successfully!');
        const [images] = await connection.execute('SELECT * FROM product_images WHERE product_id = 7');
        console.log('Images for Product 7:', images);
        
        const [variants] = await connection.execute('SELECT * FROM product_variants WHERE product_id = 7');
        console.log('Variants for Product 7:', variants);
        
        const [tableInfo] = await connection.execute('DESCRIBE product_variants');
        console.log('Table structure for product_variants:', tableInfo);

        await connection.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('Database does not exist. Attempting to create it...');
            try {
                const connection = await mysql.createConnection({
                    host: dbConfig.host,
                    user: dbConfig.user,
                    password: dbConfig.password,
                });
                await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
                console.log(`Database ${dbConfig.database} created successfully!`);
                await connection.end();
            } catch (createErr) {
                console.error('Failed to create database:', createErr.message);
            }
        }
    }
}

testConnection();
