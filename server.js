import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

import { resources } from './config/resources.js';
import pageRoutes from './routes/pageRoutes.js';
import postRoutes from './routes/postRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  next();
});

app.use(express.json());

app.use('/api', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  })
);

app.use((req, res, next) => {
  res.locals.githubUrl = process.env.GITHUB_URL || '';
  res.locals.year = new Date().getFullYear();
  res.locals.resources = resources;
  next();
});

app.use('/', pageRoutes);

app.get('/api', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}/api`;
  res.json({
    name: 'MockBase API',
    docs: `${req.protocol}://${req.get('host')}/docs`,
    endpoints: resources.flatMap((r) => [`${base}/${r.slug}`, `${base}/${r.slug}/:id`]),
  });
});
app.use('/api/posts', postRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);

app.use(notFound);
app.use(errorHandler);

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`MockBase running at http://localhost:${PORT}`));
}

export default app;