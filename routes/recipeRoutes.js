import { Router } from 'express';
import { getRecipes, getRecipeById } from '../controllers/recipeController.js';

const router = Router();

router.get('/', getRecipes);
router.get('/:id', getRecipeById);

export default router;