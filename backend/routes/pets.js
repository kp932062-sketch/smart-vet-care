const express = require('express');
const petController = require('../controllers/petController');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', auth, petController.createPet);
router.get('/', auth, petController.listPets);
router.get('/:id', auth, petController.getPet);
router.put('/:id', auth, petController.updatePet);
router.delete('/:id', auth, petController.deletePet);
router.post('/:id/vaccination', auth, petController.addVaccination);

module.exports = router;
