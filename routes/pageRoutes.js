import { Router } from 'express';
import { renderHome, renderAbout, renderDocs } from '../controllers/pageController.js';

const router = Router();

router.get('/', renderHome);
router.get('/about', renderAbout);
router.get('/docs', renderDocs);

export default router;