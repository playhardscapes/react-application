const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function regeneratePasswordHash() {
  const client = new Client({
    host: 'localhost',
    database: 'playhardscapes',
    user: process.env.DB_USER || 'phadmin',
    password: process.env.DB_PASSWORD || 'Heisjustamo12'
  });

  try {
    await client.connect();
    
    const plainTextPassword = 'admin123';
    const saltRounds = 10;
    
    // Generate new hash
    const newPasswordHash = await bcrypt.hash(plainTextPassword, saltRounds);
    
    // Update user's password hash
    const updateQuery = `
      UPDATE users 
      SET password_hash = $1 
      WHERE email = 'patrick@playhardscapes.com'
    `;
    
    const result = await client.query(updateQuery, [newPasswordHash]);
    console.log('Password hash updated. Rows affected:', result.rowCount);
  } catch (error) {
    console.error('Error regenerating password hash:', error);
  } finally {
    await client.end();
  }
}

regeneratePasswordHash()
  .catch(console.error);