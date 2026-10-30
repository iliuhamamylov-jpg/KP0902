require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
async function main() { const client = new Client({ connectionString: process.env.DATABASE_URL }); await client.connect(); await client.query(fs.readFileSync('schema.sql', 'utf8')); await client.end(); console.log('База данных готова'); }
main().catch(error => { console.error(error); process.exit(1); });
