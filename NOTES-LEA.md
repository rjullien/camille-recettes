# 📝 Notes Léa — Recettes de Camille

> Ce fichier persiste dans le repo Git. Mes learnings techniques pour ne pas refaire les mêmes erreurs.

## Architecture du site
- **Repo** : `rjullien/camille-recettes` (GitHub Pages)
- **URL** : https://rjullien.github.io/camille-recettes/
- **Stack** : HTML/CSS/JS vanilla, pas de framework
- **Export PDF** : Canvas API → jsPDF (rendu via Canvas, pas jsPDF direct)
- **Export IMG** : Canvas API → PNG download
- **Icônes** : SVG inline en dur dans `js/app.js` (PAS de CDN Lucide)
- **Fonts** : Cormorant Garamond (titres) + Montserrat (body)

## Learnings techniques (27/03/2026)

### ❌ Ce qui NE MARCHE PAS avec jsPDF 2.5.1
- `pdf.roundedRect()` → **n'existe pas** dans jsPDF 2.5
- `pdf.lines()` avec Bézier → **crashe silencieusement** (mauvais format de courbes)
- Icônes Lucide via CDN + `lucide.icons[name]` → **format instable** entre versions
- Appels async (`svgToPng`) dans `buildPDF()` → **le PDF se sauve avant le callback**

### ✅ Ce qui MARCHE
- **Canvas API** pour tout le rendu visuel (formes, icônes, texte stylé)
- **SVG inline** (paths en dur dans le JS) → zéro dépendance réseau
- **`roundRect(ctx, x, y, w, h, r)`** natif Canvas → `ctx.quadraticCurveTo()` fiable
- **`loadSvgAsImage(svgString)`** → SVG string → data URL → Image DOM → Canvas
- **Canvas → PDF** : `canvas.toDataURL('image/jpeg')` → `pdf.addImage()`

### 🔧 Debug front-end
- **TOUJOURS utiliser le browser** (Playwright/Chrome headless) pour debugger du front
- Ne jamais patcher à l'aveugle depuis le VPS sans voir les erreurs console
- Ouvrir la page, F12 Console, reproduire le bug visuellement

## Historique versions PDF
| Version | Approche | Résultat |
|---------|----------|----------|
| v9 | html2canvas + jsPDF | Fonctionnel mais bizarre |
| v10-v12 | jsPDF pur (dessin direct) | Layout OK, icônes KO |
| v13 | jsPDF + Lucide SVG→canvas→PNG | Icônes marchaient... parfois |
| v14 | html2canvas retour | Retour en arrière, pas concluant |
| v15 | jsPDF pur + Lucide CDN | FINAL annoncé trop tôt |
| v16-v18 | Patches jsPDF (roundedRect, sélecteurs) | Échecs silencieux |
| **v19** | **Canvas API + SVG inline (Claude Code)** | **✅ TOUT MARCHE** |

---
*Créé par Léa 🌙 — 27/03/2026*
