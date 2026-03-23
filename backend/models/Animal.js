const { query } = require('../config/database');
const { parseJson, toBoolean, normalizeDate, toJson } = require('../utils/sql');

function mapAnimal(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    _id: Number(row.id),
    owner: Number(row.owner_id),
    ownerId: Number(row.owner_id),
    name: row.name,
    type: row.species,
    species: row.species,
    breed: row.breed,
    age: row.age == null ? null : Number(row.age),
    gender: row.gender,
    weight: row.weight == null ? null : Number(row.weight),
    healthStatus: row.health_status,
    vaccinations: parseJson(row.vaccinations, []),
    imageUrl: row.image_url,
    isActive: toBoolean(row.is_active),
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at)
  };
}

async function create(data) {
  const result = await query(
    `INSERT INTO pets (owner_id, name, species, breed, age, gender, weight, health_status, vaccinations, image_url, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      data.ownerId,
      data.name,
      data.species || data.type || 'pet',
      data.breed || null,
      data.age ?? null,
      data.gender || null,
      data.weight ?? null,
      data.healthStatus || 'healthy',
      toJson(data.vaccinations || []),
      data.imageUrl || null
    ]
  );

  return findById(result.insertId);
}

async function listByOwner(ownerId) {
  const rows = await query(
    'SELECT * FROM pets WHERE owner_id = ? AND is_active = 1 ORDER BY created_at DESC',
    [ownerId]
  );
  return rows.map((row) => mapAnimal(row));
}

async function findById(id) {
  const rows = await query('SELECT * FROM pets WHERE id = ? LIMIT 1', [id]);
  return mapAnimal(rows[0]);
}

async function findByIdForOwner(id, ownerId) {
  const rows = await query('SELECT * FROM pets WHERE id = ? AND owner_id = ? LIMIT 1', [id, ownerId]);
  return mapAnimal(rows[0]);
}

async function update(id, ownerId, data) {
  await query(
    `UPDATE pets
     SET name = COALESCE(?, name),
         species = COALESCE(?, species),
         breed = COALESCE(?, breed),
         age = COALESCE(?, age),
         gender = COALESCE(?, gender),
         weight = COALESCE(?, weight),
         health_status = COALESCE(?, health_status),
         vaccinations = COALESCE(?, vaccinations),
         image_url = COALESCE(?, image_url)
     WHERE id = ? AND owner_id = ?`,
    [
      data.name ?? null,
      data.species ?? data.type ?? null,
      data.breed ?? null,
      data.age ?? null,
      data.gender ?? null,
      data.weight ?? null,
      data.healthStatus ?? null,
      data.vaccinations ? toJson(data.vaccinations) : null,
      data.imageUrl ?? null,
      id,
      ownerId
    ]
  );

  return findByIdForOwner(id, ownerId);
}

async function softDelete(id, ownerId) {
  await query('UPDATE pets SET is_active = 0 WHERE id = ? AND owner_id = ?', [id, ownerId]);
}

async function addVaccination(id, vaccination, doctorId) {
  const animal = await findById(id);
  if (!animal) {
    return null;
  }

  const vaccinations = Array.isArray(animal.vaccinations) ? animal.vaccinations : [];
  vaccinations.push({
    ...vaccination,
    givenBy: doctorId,
    addedAt: new Date().toISOString()
  });

  await query('UPDATE pets SET vaccinations = ? WHERE id = ?', [toJson(vaccinations), id]);
  return findById(id);
}

module.exports = {
  create,
  listByOwner,
  findById,
  findByIdForOwner,
  update,
  softDelete,
  addVaccination
};
