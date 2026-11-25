import { Router } from 'express';
import { getPosts, getPostById } from '../controllers/postController.js';

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPostById);

export default router;