const Suggestion = require('../models/Suggestion');

function parseId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeText(value) {
  return String(value || '').trim();
}

function handleDbError(error, res, duplicateLabel) {
  if (error && error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: `${duplicateLabel} already exists.` });
  }

  console.error('Suggestion API error:', error);
  return res.status(500).json({ success: false, message: 'Internal server error.' });
}

async function getAnimals(req, res) {
  try {
    const items = await Suggestion.listAnimals({ q: req.query.q, limit: req.query.limit || 200 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return handleDbError(error, res, 'Animal');
  }
}

async function getBreeds(req, res) {
  const animalId = parseId(req.params.animalId);
  if (!animalId) {
    return res.status(400).json({ success: false, message: 'Valid animalId is required.' });
  }

  try {
    const items = await Suggestion.listBreedsByAnimal(animalId, { q: req.query.q, limit: req.query.limit || 200 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return handleDbError(error, res, 'Breed');
  }
}

async function getReasons(req, res) {
  try {
    const items = await Suggestion.listReasons({ q: req.query.q, limit: req.query.limit || 500 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return handleDbError(error, res, 'Reason');
  }
}

async function createAnimal(req, res) {
  const name = normalizeText(req.body?.name);
  if (!name) {
    return res.status(400).json({ success: false, message: 'Animal name is required.' });
  }

  try {
    const created = await Suggestion.createAnimal(name);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return handleDbError(error, res, 'Animal');
  }
}

async function updateAnimal(req, res) {
  const id = parseId(req.params.id);
  const name = normalizeText(req.body?.name);

  if (!id) {
    return res.status(400).json({ success: false, message: 'Valid animal id is required.' });
  }
  if (!name) {
    return res.status(400).json({ success: false, message: 'Animal name is required.' });
  }

  try {
    const updated = await Suggestion.updateAnimal(id, name);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Animal not found.' });
    }
    return res.json({ success: true, data: updated });
  } catch (error) {
    return handleDbError(error, res, 'Animal');
  }
}

async function deleteAnimal(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, message: 'Valid animal id is required.' });
  }

  try {
    const deleted = await Suggestion.deleteAnimal(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Animal not found.' });
    }
    return res.json({ success: true, message: 'Animal deleted successfully.' });
  } catch (error) {
    return handleDbError(error, res, 'Animal');
  }
}

async function createBreed(req, res) {
  const animalId = parseId(req.body?.animalId);
  const name = normalizeText(req.body?.name);

  if (!animalId) {
    return res.status(400).json({ success: false, message: 'Valid animalId is required.' });
  }
  if (!name) {
    return res.status(400).json({ success: false, message: 'Breed name is required.' });
  }

  try {
    const parentAnimal = await Suggestion.getAnimalById(animalId);
    if (!parentAnimal) {
      return res.status(404).json({ success: false, message: 'Animal not found.' });
    }

    const created = await Suggestion.createBreed(animalId, name);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return handleDbError(error, res, 'Breed');
  }
}

async function updateBreed(req, res) {
  const id = parseId(req.params.id);
  const animalId = parseId(req.body?.animalId);
  const name = normalizeText(req.body?.name);

  if (!id) {
    return res.status(400).json({ success: false, message: 'Valid breed id is required.' });
  }
  if (!animalId) {
    return res.status(400).json({ success: false, message: 'Valid animalId is required.' });
  }
  if (!name) {
    return res.status(400).json({ success: false, message: 'Breed name is required.' });
  }

  try {
    const parentAnimal = await Suggestion.getAnimalById(animalId);
    if (!parentAnimal) {
      return res.status(404).json({ success: false, message: 'Animal not found.' });
    }

    const updated = await Suggestion.updateBreed(id, animalId, name);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Breed not found.' });
    }
    return res.json({ success: true, data: updated });
  } catch (error) {
    return handleDbError(error, res, 'Breed');
  }
}

async function deleteBreed(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, message: 'Valid breed id is required.' });
  }

  try {
    const deleted = await Suggestion.deleteBreed(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Breed not found.' });
    }
    return res.json({ success: true, message: 'Breed deleted successfully.' });
  } catch (error) {
    return handleDbError(error, res, 'Breed');
  }
}

async function createReason(req, res) {
  const title = normalizeText(req.body?.title);
  if (!title) {
    return res.status(400).json({ success: false, message: 'Reason title is required.' });
  }

  try {
    const created = await Suggestion.createReason(title);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return handleDbError(error, res, 'Reason');
  }
}

async function updateReason(req, res) {
  const id = parseId(req.params.id);
  const title = normalizeText(req.body?.title);

  if (!id) {
    return res.status(400).json({ success: false, message: 'Valid reason id is required.' });
  }
  if (!title) {
    return res.status(400).json({ success: false, message: 'Reason title is required.' });
  }

  try {
    const updated = await Suggestion.updateReason(id, title);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Reason not found.' });
    }
    return res.json({ success: true, data: updated });
  } catch (error) {
    return handleDbError(error, res, 'Reason');
  }
}

async function deleteReason(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, message: 'Valid reason id is required.' });
  }

  try {
    const deleted = await Suggestion.deleteReason(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Reason not found.' });
    }
    return res.json({ success: true, message: 'Reason deleted successfully.' });
  } catch (error) {
    return handleDbError(error, res, 'Reason');
  }
}

module.exports = {
  getAnimals,
  getBreeds,
  getReasons,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  createBreed,
  updateBreed,
  deleteBreed,
  createReason,
  updateReason,
  deleteReason
};
