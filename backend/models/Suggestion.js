const { query } = require('../config/database');

function toPositiveInt(value, fallback = 10) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

async function listAnimals(options = {}) {
  const limit = Math.min(toPositiveInt(options.limit, 200), 500);
  const q = String(options.q || '').trim();
  const params = [];

  let sql = `SELECT id, name FROM animals`;
  if (q) {
    sql += ' WHERE LOWER(name) LIKE CONCAT(\'%\', LOWER(?), \'%\')';
    params.push(q);
  }

  sql += ` ORDER BY name ASC LIMIT ${limit}`;

  const rows = await query(sql, params);

  return rows.map((row) => ({ id: Number(row.id), name: row.name }));
}

async function listBreedsByAnimal(animalId, options = {}) {
  const limit = Math.min(toPositiveInt(options.limit, 200), 500);
  const q = String(options.q || '').trim();
  const params = [animalId];

  let sql = `SELECT id, animal_id AS animalId, name FROM breeds WHERE animal_id = ?`;
  if (q) {
    sql += ' AND LOWER(name) LIKE CONCAT(\'%\', LOWER(?), \'%\')';
    params.push(q);
  }

  sql += ` ORDER BY name ASC LIMIT ${limit}`;

  const rows = await query(sql, params);

  return rows.map((row) => ({
    id: Number(row.id),
    animalId: Number(row.animalId),
    name: row.name
  }));
}

async function listReasons(options = {}) {
  const limit = Math.min(toPositiveInt(options.limit, 500), 1000);
  const q = String(options.q || '').trim();
  const params = [];

  let sql = `SELECT id, title FROM visit_reasons`;
  if (q) {
    sql += ' WHERE LOWER(title) LIKE CONCAT(\'%\', LOWER(?), \'%\')';
    params.push(q);
  }

  sql += ` ORDER BY title ASC LIMIT ${limit}`;

  const rows = await query(sql, params);

  return rows.map((row) => ({ id: Number(row.id), title: row.title }));
}

async function getAnimalById(id) {
  const rows = await query('SELECT id, name FROM animals WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? { id: Number(rows[0].id), name: rows[0].name } : null;
}

async function createAnimal(name) {
  const result = await query('INSERT INTO animals (name) VALUES (?)', [name]);
  return getAnimalById(result.insertId);
}

async function updateAnimal(id, name) {
  await query('UPDATE animals SET name = ? WHERE id = ?', [name, id]);
  return getAnimalById(id);
}

async function deleteAnimal(id) {
  const result = await query('DELETE FROM animals WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function getBreedById(id) {
  const rows = await query('SELECT id, animal_id AS animalId, name FROM breeds WHERE id = ? LIMIT 1', [id]);
  if (!rows[0]) {
    return null;
  }

  return {
    id: Number(rows[0].id),
    animalId: Number(rows[0].animalId),
    name: rows[0].name
  };
}

async function createBreed(animalId, name) {
  const result = await query('INSERT INTO breeds (animal_id, name) VALUES (?, ?)', [animalId, name]);
  return getBreedById(result.insertId);
}

async function updateBreed(id, animalId, name) {
  await query('UPDATE breeds SET animal_id = ?, name = ? WHERE id = ?', [animalId, name, id]);
  return getBreedById(id);
}

async function deleteBreed(id) {
  const result = await query('DELETE FROM breeds WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function getReasonById(id) {
  const rows = await query('SELECT id, title FROM visit_reasons WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? { id: Number(rows[0].id), title: rows[0].title } : null;
}

async function createReason(title) {
  const result = await query('INSERT INTO visit_reasons (title) VALUES (?)', [title]);
  return getReasonById(result.insertId);
}

async function updateReason(id, title) {
  await query('UPDATE visit_reasons SET title = ? WHERE id = ?', [title, id]);
  return getReasonById(id);
}

async function deleteReason(id) {
  const result = await query('DELETE FROM visit_reasons WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  listAnimals,
  listBreedsByAnimal,
  listReasons,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  getBreedById,
  createBreed,
  updateBreed,
  deleteBreed,
  getReasonById,
  createReason,
  updateReason,
  deleteReason
};
