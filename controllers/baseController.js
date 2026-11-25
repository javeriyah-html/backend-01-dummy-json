// Shared logic for all four resources. Each resource controller calls
// createController() with its collection name so we do not repeat code.
import { getCollection } from '../config/db.js';
import { HttpError } from '../middleware/errorHandler.js';

export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// Accepts only whole numbers written with digits, e.g. "10".
function parseWholeNumber(name, value, min, max) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new HttpError(400, `${name} must be a whole number.`);
  }
  const number = Number(value);
  if (number < min || (max !== undefined && number > max)) {
    const range = max !== undefined ? `between ${min} and ${max}` : `${min} or greater`;
    throw new HttpError(400, `${name} must be an integer ${range}.`);
  }
  return number;
}

// Reads and validates ?limit=&skip= from the query string.
export function parsePagination(query) {
  const limit =
    query.limit === undefined ? DEFAULT_LIMIT : parseWholeNumber('limit', query.limit, 1, MAX_LIMIT);
  const skip = query.skip === undefined ? 0 : parseWholeNumber('skip', query.skip, 0);
  return { limit, skip };
}

export function createController({ collection, key, label }) {
  // GET /api/<resource>?limit=10&skip=0
  async function getAll(req, res, next) {
    try {
      const { limit, skip } = parsePagination(req.query);
      const col = await getCollection(collection);

      const [items, total] = await Promise.all([
        col.find({}).sort({ id: 1 }).skip(skip).limit(limit).toArray(),
        col.countDocuments({}),
      ]);

      res.json({ total, skip, limit, [key]: items });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/<resource>/:id
  async function getById(req, res, next) {
    try {
      const rawId = req.params.id;
      if (!/^\d+$/.test(rawId) || Number(rawId) < 1 || !Number.isSafeInteger(Number(rawId))) {
        throw new HttpError(404, `Invalid id '${rawId}'. The id must be a positive whole number.`);
      }
      const id = Number(rawId);

      const col = await getCollection(collection);
      const item = await col.findOne({ id });
      if (!item) throw new HttpError(404, `${label} with id ${id} not found.`);

      res.json(item);
    } catch (err) {
      next(err);
    }
  }

  return { getAll, getById };
}