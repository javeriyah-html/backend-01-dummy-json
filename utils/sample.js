// Builds the "Show Output" previews from REAL documents in MongoDB.

export function buildCollectionSample(key, docs, total, limit = 10) {
  const shown = Math.min(limit, total);
  let items;
  if (shown > 3 && docs.length) {
    items = [docs[0], '__E__', '__E__', '__C__'];
  } else {
    items = docs.slice(0, shown);
  }

  return JSON.stringify({ total, skip: 0, limit, [key]: items }, null, 2)
    .replace(/,\n(\s*)"__C__"/, `\n$1// ${shown} items`)
    .replace(/"__E__"/g, '{...}');
}

export function buildSingleSample(doc) {
  return JSON.stringify(doc, null, 2);
}

export function fallbackSamples(key) {
  return {
    list: JSON.stringify({ total: 0, skip: 0, limit: 10, [key]: [] }, null, 2),
    single: JSON.stringify(
      { message: 'Connect MongoDB and run "npm run seed" to see a live sample here.' },
      null,
      2
    ),
  };
}