import { createController } from './baseController.js';

const { getAll, getById } = createController({ collection: 'products', key: 'products', label: 'Product' });

export const getProducts = getAll;
export const getProductById = getById;