#!/usr/bin/env node
// Génère sitemap.xml à partir des recettes/*.html
const fs = require('fs');
const path = require('path');

const BASE = 'https://rjullien.github.io/camille-recettes';
const ROOT = path.resolve(__dirname, '..');
const RECETTES = path.join(ROOT, 'recettes');
const today = new Date().toISOString().split('T')[0];

const urls = [];

// Page d'accueil
urls.push({ loc: `${BASE}/`, lastmod: today, freq: 'weekly', priority: '1.0' });

// Toutes les recettes
if (fs.existsSync(RECETTES)) {
  for (const f of fs.readdirSync(RECETTES).sort()) {
    if (f.endsWith('.html')) {
      urls.push({ loc: `${BASE}/recettes/${f}`, lastmod: today, freq: 'monthly', priority: '0.8' });
    }
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`✅ sitemap.xml updated (${urls.length} URLs)`);
