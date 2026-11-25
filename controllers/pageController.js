import { resources } from '../config/resources.js';
import { getCollection } from '../config/db.js';
import { buildCollectionSample, buildSingleSample, fallbackSamples } from '../utils/sample.js';

function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}/api`;
}

async function loadCounts() {
  try {
    const counts = await Promise.all(
      resources.map(async (r) => (await getCollection(r.collection)).countDocuments({}))
    );
    return { connected: true, counts };
  } catch (err) {
    console.error('Could not load counts:', err.message);
    return { connected: false, counts: resources.map(() => 0) };
  }
}

export async function renderHome(req, res, next) {
  try {
    const { connected, counts } = await loadCounts();
    const cards = resources.map((r, i) => ({ ...r, count: counts[i] }));
    const totalRecords = counts.reduce((sum, n) => sum + n, 0);

    let heroJson = JSON.stringify({ total: 0, skip: 0, limit: 10, posts: [] }, null, 2);
    if (connected && counts[0] > 0) {
      const docs = await (await getCollection('posts')).find({}).sort({ id: 1 }).limit(2).toArray();
      heroJson = buildCollectionSample('posts', docs, counts[0], 10);
    }

    res.render('pages/home', {
      title: 'Mock REST API for developers',
      active: 'home',
      pageCss: 'home',
      baseUrl: getBaseUrl(req),
      cards,
      totalRecords,
      endpointCount: resources.length * 2,
      dbConnected: connected,
      heroJson,
    });
  } catch (err) {
    next(err);
  }
}

export function renderAbout(req, res) {
  res.render('pages/about', { title: 'About', active: 'about', pageCss: 'about' });
}

export async function renderDocs(req, res, next) {
  try {
    const samples = {};
    for (const r of resources) {
      try {
        const col = await getCollection(r.collection);
        const [docs, total] = await Promise.all([
          col.find({}).sort({ id: 1 }).limit(2).toArray(),
          col.countDocuments({}),
        ]);
        samples[r.slug] = docs.length
          ? { list: buildCollectionSample(r.key, docs, total, 10), single: buildSingleSample(docs[0]) }
          : fallbackSamples(r.key);
      } catch (err) {
        console.error(`Docs sample for ${r.slug} failed:`, err.message);
        samples[r.slug] = fallbackSamples(r.key);
      }
    }

    res.render('pages/docs', {
      title: 'Documentation',
      active: 'docs',
      pageCss: 'docs',
      baseUrl: getBaseUrl(req),
      samples,
    });
  } catch (err) {
    next(err);
  }
}