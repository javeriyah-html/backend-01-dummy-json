import { createController } from './baseController.js';

const { getAll, getById } = createController({ collection: 'recipes', key: 'recipes', label: 'Recipe' });

export const getRecipes = getAll;
export const getRecipeById = getById;