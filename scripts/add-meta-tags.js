#!/usr/bin/env node
// Ajoute <meta description> + Open Graph à toutes les recettes
const fs = require('fs');
const path = require('path');

const RECETTES = path.join(__dirname, '..', 'recettes');
const BASE = 'https://rjullien.github.io/camille-recettes';

// Descriptions courtes par recette
const descriptions = {
  'blanquette-chevreau': 'Blanquette de chevreau de Pâques à la cocotte-minute, chanterelles et pommes de terre vapeur. Recette familiale traditionnelle.',
  'cake-aux-olives': 'Cake aux olives moelleux et savoureux. Recette facile pour l\'apéritif ou le pique-nique.',
  'caviar-aubergine': 'Caviar d\'aubergine maison, simple et délicieux. Parfait en entrée ou à l\'apéritif.',
  'crepes-maison': 'Crêpes maison légères et dorées. La recette classique inratable pour toute la famille.',
  'crousti-salade': 'Crousti salade gourmande, fraîche et croquante. Repas léger et équilibré.',
  'crunchy-crevettes': 'Crevettes croustillantes à l\'air fryer, panure légère et dorée. Rapide et addictif !',
  'lasagne-courgette': 'Lasagne à la courgette, plus légère que la classique. Recette gourmande et équilibrée.',
  'lasagne-fraiche': 'Lasagne aux pâtes fraîches maison. Le must de la lasagne italienne.',
  'lasagne': 'Lasagne bolognaise classique, béchamel onctueuse et fromage gratiné. Le plat réconfortant par excellence.',
  'pate-crevette': 'Pâtes aux crevettes, ail et persil. Recette rapide pour un repas savoureux en 15 minutes.',
  'poulet-miel-moutarde': 'Poulet miel-moutarde au four, sauce caramélisée et sauce soja salée. Testé et approuvé !',
  'salade-rapido': 'Salade rapide et complète pour un déjeuner express. Prête en 10 minutes.',
  'sauce-bechamel': 'Sauce béchamel onctueuse au robot. Base indispensable pour gratins et lasagnes.',
  'sauce-tomate': 'Sauce tomate maison au robot. Simple, fraîche et polyvalente pour toutes vos recettes.',
  'soupe-courgette': 'Soupe de courgette veloutée et réconfortante. Recette express au robot ou à la casserole.',
  'tarte-de-patate': 'Tarte de pommes de terre croustillante et fondante. Recette originale et gourmande.',
  'tarte-tomate': 'Tarte à la tomate avec moutarde et herbes de Provence. Simple et estivale.',
  'tomate-mozza': 'Tomate mozzarella fraîche, basilic et huile d\'olive. L\'entrée d\'été par excellence.',
};

let count = 0;

for (const file of fs.readdirSync(RECETTES).sort()) {
  if (!file.endsWith('.html')) continue;
  const name = file.replace('.html', '');
  const fp = path.join(RECETTES, file);
  let html = fs.readFileSync(fp, 'utf8');

  // Skip if already has meta description
  if (html.includes('meta name="description"')) continue;

  const desc = descriptions[name] || `Recette ${name.replace(/-/g, ' ')} — Les Recettes de Camille`;
  const title = (html.match(/<title>([^<]+)</) || [])[1] || name;
  
  // Check if image exists
  let imgTag = '';
  const imgExts = ['jpg', 'jpeg', 'png', 'webp'];
  for (const ext of imgExts) {
    if (fs.existsSync(path.join(__dirname, '..', 'images', `${name}.${ext}`))) {
      imgTag = `\n    <meta property="og:image" content="${BASE}/images/${name}.${ext}">`;
      break;
    }
  }

  const metaTags = `
    <meta name="description" content="${desc}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:type" content="article">${imgTag}
    <meta property="og:url" content="${BASE}/recettes/${file}">`;

  // Insert after viewport meta
  html = html.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `<meta name="viewport" content="width=device-width, initial-scale=1.0">${metaTags}`
  );

  fs.writeFileSync(fp, html);
  count++;
  console.log(`✅ ${name}`);
}

console.log(`\n🎉 ${count} recettes mises à jour`);
