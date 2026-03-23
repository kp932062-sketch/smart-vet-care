const express = require('express');
const suggestionController = require('../controllers/suggestionController');

const router = express.Router();

router.get('/animals', suggestionController.getAnimals);
router.get('/breeds/:animalId', suggestionController.getBreeds);
router.get('/reasons', suggestionController.getReasons);

module.exports = router;
