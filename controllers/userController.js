import { createController } from './baseController.js';

const { getAll, getById } = createController({ collection: 'users', key: 'users', label: 'User' });

export const getUsers = getAll;
export const getUserById = getById;