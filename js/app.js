// ========================================
// Les Recettes de Camille - JavaScript
// Design "Nature Moderne 2026"
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupSearch();
    setupFilters();
    setupPrintedToggle();
}

// === RECHERCHE ===
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const recipeCards = document.querySelectorAll('.recipe-card');

    recipeCards.forEach(card => {
        const title = card.querySelector('.recipe-title').textContent.toLowerCase();
        const ingredients = card.dataset.ingredients ? card.dataset.ingredients.toLowerCase() : '';

        if (title.includes(searchTerm) || ingredients.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// === FILTRES ===
var activeCategory = 'all';
var activeTag = null;

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilter);
    });
}

function handleFilter(event) {
    const button = event.target;
    const filterType = button.dataset.filter;
    const value = button.dataset.value;

    if (filterType === 'category') {
        // Catégories : un seul actif à la fois
        document.querySelectorAll('[data-filter="category"]').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        activeCategory = value;
    } else if (filterType === 'tag') {
        // Tags : toggle on/off
        if (button.classList.contains('active')) {
            button.classList.remove('active');
            activeTag = null;
        } else {
            document.querySelectorAll('[data-filter="tag"]').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            activeTag = value;
        }
    }

    applyFilters();
}

function applyFilters() {
    const recipeCards = document.querySelectorAll('.recipe-card');
    recipeCards.forEach(card => {
        const cardCategory = card.dataset.category;
        const cardTags = card.dataset.tags || '';

        const matchCategory = (activeCategory === 'all' || cardCategory === activeCategory);
        const matchTag = (!activeTag || cardTags.includes(activeTag));

        card.style.display = (matchCategory && matchTag) ? 'block' : 'none';
    });
}

// === NOTE "IMPRIMÉE" (chargée depuis data/printed.json, synchro partout) ===
function setupPrintedToggle() {
    // Seulement sur les pages recettes (pas l'index)
    var prepSection = document.querySelector('.preparation-section');
    if (!prepSection) return;

    // Identifier la recette par l'URL
    var recipeId = window.location.pathname.replace(/.*\//, '').replace('.html', '');

    // Charger le JSON
    fetch('../data/printed.json?' + Date.now())
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var printed = data[recipeId] === true;

            var container = document.createElement('div');
            container.className = 'printed-note';
            container.style.cssText = 'text-align:center;margin:1.5rem 0 0.5rem;padding:8px 16px;';

            if (printed) {
                container.innerHTML = '<span style="font-size:0.85rem;color:#999;opacity:0.6;">📄 Imprimée ✅</span>';
            } else {
                container.innerHTML = '<span style="font-size:0.85rem;color:#ccc;opacity:0.5;">📄 Non imprimée</span>';
            }

            var exportBtns = document.querySelector('.export-buttons');
            if (exportBtns) {
                exportBtns.parentNode.insertBefore(container, exportBtns);
            } else {
                prepSection.parentNode.insertBefore(container, prepSection.nextSibling);
            }
        })
        .catch(function() { /* silencieux si pas de JSON */ });
}

// ============================================================
// EXPORT : PDF & IMAGE — 100% Canvas API (mobile-compatible)
// Layout identique au template preview-canva.html
// ============================================================

// Dimensions du template (A4 à 96dpi)
var EXPORT_W = 794;
var EXPORT_H = 1123;
var PHOTO_H = 420;
var LEFT_COL_RATIO = 0.38;

// --- Extraction des données recette depuis le DOM ---
function extractRecipeData() {
    var title = document.querySelector('.recipe-main-title').textContent.trim();
    var ingredients = [];
    document.querySelectorAll('.ingredient-text').forEach(function(el) {
        ingredients.push(el.textContent.trim());
    });
    var steps = [];
    document.querySelectorAll('.step-text').forEach(function(el) {
        steps.push(el.textContent.trim());
    });

    var categoryEl = document.querySelector('.info-chip--category') || document.querySelector('.category-badge');
    var categoryText = '';
    if (categoryEl) {
        categoryText = categoryEl.textContent.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{FE0F}]/gu, '').trim();
    }

    var timeText = '';
    var servesText = '';
    document.querySelectorAll('.info-chip').forEach(function(chip) {
        if (chip.classList.contains('info-chip--time')) {
            timeText = chip.textContent.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{FE0F}]/gu, '').trim();
            var plusIdx = timeText.indexOf('+');
            if (plusIdx > 0) timeText = timeText.substring(0, plusIdx).trim();
            timeText = timeText.replace(/\s*(prep|prép|préparation)\.?$/i, '').trim();
        }
        if (chip.classList.contains('info-chip--serves')) {
            servesText = chip.textContent.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{FE0F}]/gu, '').trim();
        }
    });

    var heroImg = document.querySelector('.recipe-hero-image img');
    return {
        title: title,
        ingredients: ingredients,
        steps: steps,
        categoryText: categoryText,
        timeText: timeText,
        servesText: servesText,
        heroSrc: heroImg ? heroImg.src : null
    };
}

// --- Chargement d'une image (hero photo) avec crop centré ---
function loadCroppedImage(src, targetW, targetH) {
    return new Promise(function(resolve) {
        if (!src) { resolve(null); return; }

        // Essayer d'abord de réutiliser l'image déjà chargée dans le DOM
        var existingImg = document.querySelector('.recipe-hero-image img');
        if (existingImg && existingImg.complete && existingImg.naturalWidth > 0) {
            try {
                var c = document.createElement('canvas');
                c.width = targetW; c.height = targetH;
                var ctx = c.getContext('2d');
                var ir = existingImg.naturalWidth / existingImg.naturalHeight;
                var cr = targetW / targetH;
                var sx, sy, sw, sh;
                if (ir > cr) { sh = existingImg.naturalHeight; sw = sh * cr; sx = (existingImg.naturalWidth - sw) / 2; sy = 0; }
                else { sw = existingImg.naturalWidth; sh = sw / cr; sx = 0; sy = (existingImg.naturalHeight - sh) / 2; }
                ctx.drawImage(existingImg, sx, sy, sw, sh, 0, 0, targetW, targetH);
                // Tester que le canvas n'est pas tainted
                c.toDataURL();
                resolve(c);
                return;
            } catch (e) {
                // Canvas tainted, fallback ci-dessous
            }
        }

        // Fallback : recharger l'image
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            var c = document.createElement('canvas');
            c.width = targetW; c.height = targetH;
            var ctx = c.getContext('2d');
            var ir = img.naturalWidth / img.naturalHeight;
            var cr = targetW / targetH;
            var sx, sy, sw, sh;
            if (ir > cr) { sh = img.naturalHeight; sw = sh * cr; sx = (img.naturalWidth - sw) / 2; sy = 0; }
            else { sw = img.naturalWidth; sh = sw / cr; sx = 0; sy = (img.naturalHeight - sh) / 2; }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
            resolve(c);
        };
        img.onerror = function() { resolve(null); };
        img.src = src;
    });
}

// --- Chargement d'un SVG inline en Image utilisable sur Canvas ---
function loadSvgAsImage(svgString) {
    return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() { resolve(img); };
        img.onerror = function() { resolve(null); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    });
}

// --- SVG des icônes Lucide (identiques au template) ---
var SVG_CLOCK = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
var SVG_USERS = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
var SVG_SPROUT = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>';

// --- Word-wrap helper pour Canvas ---
function wrapText(ctx, text, maxWidth) {
    var words = text.split(' ');
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
        var test = line + (line ? ' ' : '') + words[i];
        if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = words[i];
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines;
}

// --- RENDU PRINCIPAL SUR CANVAS ---
function renderRecipeToCanvas(data, scale, callback) {
    var W = EXPORT_W * scale;
    var H = EXPORT_H * scale;
    var S = scale; // facteur d'échelle

    // Charger toutes les ressources en parallèle
    Promise.all([
        loadCroppedImage(data.heroSrc, W, PHOTO_H * S),
        loadSvgAsImage(SVG_CLOCK, 40, 40),
        loadSvgAsImage(SVG_USERS, 40, 40),
        loadSvgAsImage(SVG_SPROUT, 16, 16),
        document.fonts ? document.fonts.ready : Promise.resolve()
    ]).then(function(results) {
        var heroCanvas = results[0];
        var clockImg = results[1];
        var usersImg = results[2];
        var sproutImg = results[3];

        var canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        var ctx = canvas.getContext('2d');

        // Fond blanc
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, W, H);

        // === PHOTO (420px dans template) ===
        var photoH = PHOTO_H * S;
        if (heroCanvas) {
            ctx.drawImage(heroCanvas, 0, 0, W, photoH);
        } else {
            // Dégradé placeholder
            var grad = ctx.createLinearGradient(0, 0, W, photoH);
            grad.addColorStop(0, '#D4C9B5');
            grad.addColorStop(1, '#B8A68E');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, photoH);
            ctx.fillStyle = '#8B7355';
            ctx.font = (48 * S) + 'px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Photo', W / 2, photoH / 2);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
        }

        // === ZONE TITRE (padding: 16px 32px 12px) ===
        var titleZoneY = photoH;
        var titlePadX = 32 * S;
        var titlePadTop = 16 * S;

        // Badge catégorie (float right)
        var badgeTotalW = 0;
        if (data.categoryText) {
            ctx.font = '500 ' + (14 * S) + 'px Montserrat, sans-serif';
            var catTxtW = ctx.measureText(data.categoryText).width;
            var sproutW = sproutImg ? 20 * S : 0;
            var badgePadX = 16 * S;
            var badgeGap = 6 * S;
            badgeTotalW = badgePadX + sproutW + (sproutW ? badgeGap : 0) + catTxtW + badgePadX;
            var badgeH = 32 * S;
            var badgeX = W - titlePadX - badgeTotalW;
            var badgeY = titleZoneY + 12 * S;

            // Fond vert clair arrondi
            ctx.fillStyle = '#E8F5E9';
            roundRect(ctx, badgeX, badgeY, badgeTotalW, badgeH, 20 * S, true, false);

            // Icône sprout
            var iconX = badgeX + badgePadX;
            if (sproutImg) {
                var sproutSize = 16 * S;
                ctx.drawImage(sproutImg, iconX, badgeY + (badgeH - sproutSize) / 2, sproutSize, sproutSize);
                iconX += sproutSize + badgeGap;
            }

            // Texte catégorie
            ctx.fillStyle = '#2E7D32';
            ctx.font = '500 ' + (14 * S) + 'px Montserrat, sans-serif';
            ctx.textBaseline = 'middle';
            ctx.fillText(data.categoryText, iconX, badgeY + badgeH / 2);
            ctx.textBaseline = 'alphabetic';
        }

        // Titre (Cormorant Garamond, 48px, uppercase, letter-spacing 2px)
        ctx.fillStyle = '#1A1A1A';
        ctx.font = '600 ' + (48 * S) + 'px "Cormorant Garamond", serif';
        var titleText = data.title.toUpperCase();
        var titleMaxW = W - titlePadX * 2 - (badgeTotalW > 0 ? badgeTotalW + 20 * S : 0);
        var titleLines = wrapText(ctx, titleText, titleMaxW);
        var titleLineH = 53 * S; // line-height ~1.1
        var titleStartY = titleZoneY + titlePadTop + titleLineH;

        for (var ti = 0; ti < titleLines.length; ti++) {
            // Simuler letter-spacing en dessinant caractère par caractère
            drawLetterSpaced(ctx, titleLines[ti], titlePadX, titleStartY + ti * titleLineH, 2 * S);
        }

        var titleBottomY = titleStartY + (titleLines.length - 1) * titleLineH + 8 * S;

        // Trait sous le titre (20% de la largeur du titre)
        ctx.strokeStyle = '#1A1A1A';
        ctx.lineWidth = 1.5 * S;
        var firstLineW = measureLetterSpaced(ctx, titleLines[0], 2 * S);
        ctx.beginPath();
        ctx.moveTo(titlePadX, titleBottomY);
        ctx.lineTo(titlePadX + firstLineW * 0.2, titleBottomY);
        ctx.stroke();

        // === COLONNES ===
        var colStartY = titleBottomY + 12 * S;
        var leftColW = Math.round(W * LEFT_COL_RATIO);
        var colEndY = H - 1.5 * S; // juste avant la barre du bas

        // Fond beige colonne gauche
        ctx.fillStyle = '#E8DCC8';
        ctx.fillRect(0, colStartY, leftColW, colEndY - colStartY);

        // --- Meta row (icônes + labels) ---
        var metaPadTop = 20 * S;
        var metaY = colStartY + metaPadTop;
        var col1X = leftColW * 0.3;
        var col2X = leftColW * 0.7;
        var iconSize = 40 * S;

        // Icône horloge
        if (clockImg) {
            ctx.drawImage(clockImg, col1X - iconSize / 2, metaY, iconSize, iconSize);
        }
        // Icône personnes
        if (usersImg) {
            ctx.drawImage(usersImg, col2X - iconSize / 2, metaY, iconSize, iconSize);
        }

        // Labels sous les icônes
        ctx.fillStyle = '#3D3D3D';
        ctx.font = '400 ' + (14 * S) + 'px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        if (data.timeText) {
            ctx.fillText(data.timeText, col1X, metaY + iconSize + 18 * S);
        }
        if (data.servesText) {
            ctx.fillText(data.servesText, col2X, metaY + iconSize + 18 * S);
        }
        ctx.textAlign = 'left';

        // --- Ingrédients (colonne gauche) ---
        var ingStartY = metaY + iconSize + 20 * S + 20 * S;
        var ingY = ingStartY;
        var ingPadLeft = 24 * S;
        var ingBulletLeft = ingPadLeft;
        var ingTextLeft = ingPadLeft + 16 * S;
        var ingMaxW = leftColW - ingTextLeft - 10 * S;
        var ingLineH = 14 * 1.5 * S; // font-size 14 * line-height 1.5
        var ingGap = 6 * S;

        ctx.font = '400 ' + (14 * S) + 'px Montserrat, sans-serif';

        for (var ii = 0; ii < data.ingredients.length; ii++) {
            if (ingY > colEndY - 20 * S) break;
            // Bullet
            ctx.fillStyle = '#5C5C5C';
            ctx.font = 'bold ' + (14 * S) + 'px Montserrat, sans-serif';
            ctx.fillText('\u2022', ingBulletLeft, ingY);
            // Texte
            ctx.fillStyle = '#2A2A2A';
            ctx.font = '400 ' + (14 * S) + 'px Montserrat, sans-serif';
            var ingLines = wrapText(ctx, data.ingredients[ii], ingMaxW);
            for (var il = 0; il < ingLines.length; il++) {
                ctx.fillText(ingLines[il], ingTextLeft, ingY);
                ingY += ingLineH;
            }
            ingY += ingGap;
        }

        // --- Étapes (colonne droite, fond blanc) ---
        var stepPadLeft = leftColW + 28 * S;
        var stepBulletLeft = stepPadLeft;
        var stepTextLeft = stepPadLeft + 16 * S;
        var stepMaxW = W - stepTextLeft - 20 * S;
        var stepLineH = 14 * 1.6 * S; // font-size 14 * line-height 1.6
        var stepGap = 10 * S;
        var stepY = colStartY + metaPadTop;

        for (var si = 0; si < data.steps.length; si++) {
            if (stepY > colEndY - 20 * S) break;
            // Bullet
            ctx.fillStyle = '#5C5C5C';
            ctx.font = 'bold ' + (14 * S) + 'px Montserrat, sans-serif';
            ctx.fillText('\u2022', stepBulletLeft, stepY);
            // Texte
            ctx.fillStyle = '#2A2A2A';
            ctx.font = '400 ' + (14 * S) + 'px Montserrat, sans-serif';
            var stepLines = wrapText(ctx, data.steps[si], stepMaxW);
            for (var sl = 0; sl < stepLines.length; sl++) {
                ctx.fillText(stepLines[sl], stepTextLeft, stepY);
                stepY += stepLineH;
            }
            stepY += stepGap;
        }

        // === BARRE DU BAS ===
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, H - 1.5 * S, W, 1.5 * S);

        callback(canvas);
    });
}

// --- Letter-spacing helper ---
function drawLetterSpaced(ctx, text, x, y, spacing) {
    for (var i = 0; i < text.length; i++) {
        ctx.fillText(text[i], x, y);
        x += ctx.measureText(text[i]).width + spacing;
    }
}

function measureLetterSpaced(ctx, text, spacing) {
    var w = 0;
    for (var i = 0; i < text.length; i++) {
        w += ctx.measureText(text[i]).width + spacing;
    }
    return w - spacing; // pas de spacing après le dernier caractère
}

// --- RoundRect helper ---
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

// === TÉLÉCHARGEMENT PDF ===
function printRecipe(recipeName) {
    var jsPDFClass = null;
    if (window.jspdf && window.jspdf.jsPDF) {
        jsPDFClass = window.jspdf.jsPDF;
    } else if (window.jsPDF) {
        jsPDFClass = window.jsPDF;
    }
    if (!jsPDFClass) {
        alert('Librairie jsPDF non chargée. Actualise la page.');
        return;
    }

    var data = extractRecipeData();

    renderRecipeToCanvas(data, 2, function(canvas) {
        var imgData = canvas.toDataURL('image/jpeg', 0.92);
        var pdf = new jsPDFClass({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        var pageW = pdf.internal.pageSize.getWidth(); // 595.28
        var pageH = pdf.internal.pageSize.getHeight(); // 841.89

        pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);

        // iOS : ouvrir dans un nouvel onglet
        var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
        if (isIOS) {
            window.open(pdf.output('datauristring'), '_blank');
        } else {
            pdf.save(recipeName + '.pdf');
        }
    });
}

// === TÉLÉCHARGEMENT IMAGE (PNG) ===
function downloadRecipeAsImage(recipeName) {
    var data = extractRecipeData();

    renderRecipeToCanvas(data, 2, function(canvas) {
        canvas.toBlob(function(blob) {
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = recipeName + '.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    });
}
