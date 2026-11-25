import { createController } from './baseController.js';

const { getAll, getById } = createController({ collection: 'posts', key: 'posts', label: 'Post' });

export const getPosts = getAll;
export const getPostById = getById;