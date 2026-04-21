
const mysql = require('mysql2/promise');

async function checkProduct() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'shop_ao_dai'
  });

  try {
    const [products] = await connection.execute('SELECT * FROM products WHERE id = 7');
    console.log('Product 7:', JSON.stringify(products, null, 2));

    const [images] = await connection.execute('SELECT * FROM product_images WHERE product_id = 7');
    console.log('Images for Product 7:', JSON.stringify(images, null, 2));

    const [variants] = await connection.execute('SELECT * FROM product_variants WHERE product_id = 7');
    console.log('Variants for Product 7:', JSON.stringify(variants, null, 2));

    if (products.length > 0) {
        const [category] = await connection.execute('SELECT name FROM categories WHERE id = ?', [products[0].category_id]);
        console.log('Category:', JSON.stringify(category, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkProduct();
