require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const app = express();
const db = new Pool({ connectionString: process.env.DATABASE_URL });
app.use(express.json());
app.use(express.static('public'));
app.get('/api/:type', async (req, res) => {
  const queries = { projects: 'SELECT * FROM projects ORDER BY id', apartments: "SELECT apartments.*, projects.name AS project_name, projects.image FROM apartments JOIN projects ON projects.id = apartments.project_id WHERE apartments.status = 'available' ORDER BY apartments.id", news: 'SELECT * FROM news ORDER BY published DESC', programs: 'SELECT * FROM mortgage_programs ORDER BY id' };
  if (!queries[req.params.type]) return res.status(404).json({ error: 'Не найдено' });
  try { const result = await db.query(queries[req.params.type]); res.json(result.rows); } catch (error) { console.error(error); res.status(500).json({ error: 'Ошибка базы данных' }); }
});
app.post('/api/requests', async (req, res) => {
  const { name, phone, message, apartment_id } = req.body;
  if (typeof name !== 'string' || typeof phone !== 'string' || name.trim().length < 2 || !/^[+\d ()-]{7,30}$/.test(phone)) return res.status(400).json({ error: 'Проверьте имя и телефон' });
  try { await db.query('INSERT INTO requests (name, phone, message, apartment_id) VALUES ($1, $2, $3, $4)', [name.trim().slice(0,100), phone, String(message || '').slice(0,2000), apartment_id || null]); res.status(201).json({ success: true }); } catch (error) { console.error(error); res.status(500).json({ error: 'Не удалось сохранить заявку' }); }
});
app.listen(process.env.PORT || 3000, () => console.log('Сайт: http://localhost:' + (process.env.PORT || 3000)));
