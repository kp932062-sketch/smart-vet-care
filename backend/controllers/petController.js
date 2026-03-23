const Animal = require('../models/Animal');

async function createPet(req, res) {
  try {
    const animal = await Animal.create({
      ...req.body,
      ownerId: req.user
    });
    res.status(201).json(animal);
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({ message: 'Failed to add animal' });
  }
}

async function listPets(req, res) {
  try {
    const animals = await Animal.listByOwner(req.user);
    res.json(animals);
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ message: 'Failed to fetch animals' });
  }
}

async function getPet(req, res) {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }
    res.json(animal);
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(500).json({ message: 'Failed to fetch animal details' });
  }
}

async function updatePet(req, res) {
  try {
    const animal = await Animal.update(req.params.id, req.user, req.body);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found or unauthorized' });
    }
    res.json(animal);
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ message: 'Failed to update animal' });
  }
}

async function deletePet(req, res) {
  try {
    const animal = await Animal.findByIdForOwner(req.params.id, req.user);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found or unauthorized' });
    }
    await Animal.softDelete(req.params.id, req.user);
    res.json({ message: 'Animal removed successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ message: 'Failed to remove animal' });
  }
}

async function addVaccination(req, res) {
  try {
    const animal = await Animal.addVaccination(req.params.id, req.body, req.user);
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }
    res.json(animal);
  } catch (error) {
    console.error('Error adding vaccination:', error);
    res.status(500).json({ message: 'Failed to add vaccination record' });
  }
}

module.exports = {
  createPet,
  listPets,
  getPet,
  updatePet,
  deletePet,
  addVaccination
};
