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
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilter);
    });
}

function handleFilter(event) {
    const button = event.target;
    const category = button.dataset.category;
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const recipeCards = document.querySelectorAll('.recipe-card');
    recipeCards.forEach(card => {
        const cardCategory = card.dataset.category;
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// === GÉNÉRATION PDF ===
function printRecipe(recipeName) {
    // Vérifier jsPDF uniquement
    var jsPDFClass = null;
    if (window.jspdf && window.jspdf.jsPDF) {
        jsPDFClass = window.jspdf.jsPDF; // jspdf 2.x UMD
    } else if (window.jsPDF) {
        jsPDFClass = window.jsPDF; // ancien format
    }
    
    if (!jsPDFClass) {
        alert('Librairie jsPDF non chargée. Actualise la page.');
        return;
    }

    // Récupérer données de la page
    var title = document.querySelector('.recipe-main-title').textContent.trim();
    var ingredients = document.querySelectorAll('.ingredient-text');
    var steps = document.querySelectorAll('.step-text');

    // Catégorie : chercher dans info-chip OU category-badge
    var categoryEl = document.querySelector('.info-chip--category') || document.querySelector('.category-badge');
    var categoryText = '';
    if (categoryEl) {
        categoryText = categoryEl.textContent.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
    }

    var timeText = '';
    var servesText = '';
    
    document.querySelectorAll('.info-chip').forEach(function(chip) {
        if (chip.classList.contains('info-chip--time')) {
            timeText = chip.textContent.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
            // Garder seulement le premier temps (ex: "15 min" de "15 min prep + 30 min cuisson")
            var plusIdx = timeText.indexOf('+');
            if (plusIdx > 0) timeText = timeText.substring(0, plusIdx).trim();
            timeText = timeText.replace(/\s*(prep|prép|préparation)\.?$/i, '').trim();
        }
        if (chip.classList.contains('info-chip--serves')) {
            servesText = chip.textContent.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
        }
    });
    
    var heroImg = document.querySelector('.recipe-hero-image img');
    
    // Créer le PDF A4
    var pdf = new jsPDFClass({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
    });
    
    var pageWidth = pdf.internal.pageSize.getWidth();
    var pageHeight = pdf.internal.pageSize.getHeight();
    var photoHeight = 315;
    var leftColWidth = pageWidth * 0.38;
    var rightColX = leftColWidth;
    
    // === 1. PHOTO ===
    if (heroImg && heroImg.src) {
        processImageForPDF(heroImg.src, function(imgData) {
            if (imgData) {
                pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, photoHeight);
            } else {
                drawPlaceholderPhoto(pdf, pageWidth, photoHeight);
            }
            prepareIcons();
        });
    } else {
        drawPlaceholderPhoto(pdf, pageWidth, photoHeight);
        prepareIcons();
    }
    
    function drawPlaceholderPhoto(doc, width, height) {
        doc.setFillColor(212, 201, 181);
        doc.rect(0, 0, width, height, 'F');
        doc.setFontSize(36);
        doc.setTextColor(139, 115, 85);
        var text = 'Photo';
        var textWidth = doc.getTextWidth(text);
        doc.text(text, (width - textWidth) / 2, height / 2 + 12);
    }
    
    // === ICÔNES LUCIDE ===
    // Génère un SVG data URL à partir du nom d'icône Lucide
    function makeLucideSvg(iconName, size, color) {
        try {
            if (typeof lucide === 'undefined') return null;
            // lucide.icons est un objet { iconName: [defaultAttrs, elements] }
            var iconData = lucide.icons && lucide.icons[iconName];
            if (!iconData) return null;
            
            var elements = iconData[1]; // array of [tag, attrs]
            if (!elements || !Array.isArray(elements)) return null;
            
            var svgInner = '';
            for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                var tag = el[0];
                var attrs = el[1] || {};
                var attrStr = '';
                var keys = Object.keys(attrs);
                for (var j = 0; j < keys.length; j++) {
                    attrStr += ' ' + keys[j] + '="' + attrs[keys[j]] + '"';
                }
                svgInner += '<' + tag + attrStr + '/>';
            }
            var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + svgInner + '</svg>';
            return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        } catch(e) {
            console.error('Lucide icon error:', iconName, e);
            return null;
        }
    }

    function svgDataUrlToPng(dataUrl, size, callback) {
        if (!dataUrl) { callback(null); return; }
        var img = new Image();
        img.onload = function() {
            try {
                var c = document.createElement('canvas');
                c.width = size; c.height = size;
                var ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0, size, size);
                callback(c.toDataURL('image/png'));
            } catch(e) {
                console.error('svgToPng error:', e);
                callback(null);
            }
        };
        img.onerror = function() {
            console.error('svgToPng load error');
            callback(null);
        };
        img.src = dataUrl;
    }

    // Préparer TOUTES les icônes AVANT de construire le PDF
    function prepareIcons() {
        var clockSvg = makeLucideSvg('clock', 120, '#1A1A1A');
        var usersSvg = makeLucideSvg('users', 120, '#1A1A1A');
        var sproutSvg = makeLucideSvg('sprout', 120, '#2E7D32');
        
        svgDataUrlToPng(clockSvg, 120, function(clockPng) {
            svgDataUrlToPng(usersSvg, 120, function(usersPng) {
                svgDataUrlToPng(sproutSvg, 120, function(sproutPng) {
                    buildPDF(clockPng, usersPng, sproutPng);
                });
            });
        });
    }

    function buildPDF(clockPng, usersPng, sproutPng) {
        var titlePadLeft = 24;
        var titleZoneY = photoHeight;
        var titlePadTop = 12;

        // === BADGE CATÉGORIE (vert, arrondi, en haut à droite sous la photo) ===
        var badgeW = 0;
        if (categoryText) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10.5);
            var badgeTxtW = pdf.getTextWidth(categoryText);
            var iconSpace = sproutPng ? 16 : 0;
            var badgePadH = 10;
            var badgeH = 22;
            badgeW = badgeTxtW + badgePadH * 2 + iconSpace;
            var badgeX = pageWidth - badgeW - titlePadLeft;
            var badgeY = titleZoneY + titlePadTop + 4;

            // Fond vert clair (rectangle simple — fiable)
            pdf.setFillColor(232, 245, 233);
            pdf.rect(badgeX, badgeY, badgeW, badgeH, 'F');
            
            // Icône sprout
            if (sproutPng) {
                pdf.addImage(sproutPng, 'PNG', badgeX + badgePadH, badgeY + 3, 14, 14);
            }
            
            // Texte catégorie
            pdf.setTextColor(46, 125, 50);
            pdf.text(categoryText, badgeX + badgePadH + iconSpace, badgeY + 15);
        }

        // === TITRE ===
        pdf.setTextColor(26, 26, 26);
        pdf.setFont('times', 'bold');
        pdf.setFontSize(36);
        var titleMaxW = pageWidth - titlePadLeft * 2 - (badgeW > 0 ? badgeW + 40 : 0);
        var titleLines = pdf.splitTextToSize(title.toUpperCase(), titleMaxW);
        var titleStartY = titleZoneY + titlePadTop + 32;
        for (var i = 0; i < titleLines.length; i++) {
            pdf.text(titleLines[i], titlePadLeft, titleStartY + i * 38);
        }
        var titleBottomY = titleStartY + (titleLines.length - 1) * 38;

        // Trait sous le titre
        pdf.setDrawColor(26, 26, 26);
        pdf.setLineWidth(1.1);
        pdf.line(titlePadLeft, titleBottomY + 8, titlePadLeft + titleMaxW * 0.2, titleBottomY + 8);

        // === COLONNES ===
        var colStartY = titleBottomY + 18;
        var colEndY = pageHeight - 4;

        // Colonne gauche — fond beige
        pdf.setFillColor(232, 220, 200);
        pdf.rect(0, colStartY, leftColWidth, colEndY - colStartY, 'F');

        // --- Icônes temps / portions ---
        var metaRowY = colStartY + 15;
        var metaCol1 = leftColWidth * 0.3;
        var metaCol2 = leftColWidth * 0.7;
        var iconSz = 28;

        if (clockPng) {
            pdf.addImage(clockPng, 'PNG', metaCol1 - iconSz / 2, metaRowY, iconSz, iconSz);
        }
        if (timeText) {
            pdf.setTextColor(61, 61, 61);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10.5);
            var tw = pdf.getTextWidth(timeText);
            pdf.text(timeText, metaCol1 - tw / 2, metaRowY + iconSz + 14);
        }

        if (usersPng) {
            pdf.addImage(usersPng, 'PNG', metaCol2 - iconSz / 2, metaRowY, iconSz, iconSz);
        }
        if (servesText) {
            pdf.setTextColor(61, 61, 61);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10.5);
            var sw = pdf.getTextWidth(servesText);
            pdf.text(servesText, metaCol2 - sw / 2, metaRowY + iconSz + 14);
        }

        // --- Ingrédients ---
        var ingStartY = metaRowY + iconSz + 30;
        var ingY = ingStartY;
        var ingPadLeft = 18;
        var ingTextLeft = ingPadLeft + 12;
        var ingMaxW = leftColWidth - ingTextLeft - 10;

        pdf.setFontSize(10.5);
        for (var ii = 0; ii < ingredients.length; ii++) {
            if (ingY > colEndY - 10) break;
            pdf.setTextColor(92, 92, 92);
            pdf.setFont('helvetica', 'bold');
            pdf.text('\u2022', ingPadLeft, ingY);
            pdf.setTextColor(42, 42, 42);
            pdf.setFont('helvetica', 'normal');
            var lines = pdf.splitTextToSize(ingredients[ii].textContent.trim(), ingMaxW);
            for (var li = 0; li < lines.length; li++) {
                if (ingY > colEndY - 10) break;
                pdf.text(lines[li], ingTextLeft, ingY);
                ingY += 14;
            }
            ingY += 3;
        }

        // --- Étapes (colonne droite) ---
        var stepPadLeft = rightColX + 21;
        var stepTextLeft = stepPadLeft + 12;
        var stepMaxW = pageWidth - stepTextLeft - 16;
        var stepY = colStartY + 15;

        pdf.setFontSize(10.5);
        for (var si = 0; si < steps.length; si++) {
            if (stepY > colEndY - 10) break;
            pdf.setTextColor(92, 92, 92);
            pdf.setFont('helvetica', 'bold');
            pdf.text('\u2022', stepPadLeft, stepY);
            pdf.setTextColor(42, 42, 42);
            pdf.setFont('helvetica', 'normal');
            var slines = pdf.splitTextToSize(steps[si].textContent.trim(), stepMaxW);
            for (var sli = 0; sli < slines.length; sli++) {
                if (stepY > colEndY - 10) break;
                pdf.text(slines[sli], stepTextLeft, stepY);
                stepY += 15;
            }
            stepY += 5;
        }

        // === BARRE DU BAS ===
        pdf.setFillColor(26, 26, 26);
        pdf.rect(0, pageHeight - 1.5, pageWidth, 1.5, 'F');

        // Sauvegarder
        pdf.save(recipeName + '.pdf');
    }
}

// Fonction utilitaire pour traiter les images
function processImageForPDF(imageSrc, callback) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        try {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = 794;
            canvas.height = 420;
            
            var imgRatio = img.naturalWidth / img.naturalHeight;
            var canvasRatio = canvas.width / canvas.height;
            var sx, sy, sw, sh;
            if (imgRatio > canvasRatio) {
                sh = img.naturalHeight;
                sw = sh * canvasRatio;
                sx = (img.naturalWidth - sw) / 2;
                sy = 0;
            } else {
                sw = img.naturalWidth;
                sh = sw / canvasRatio;
                sx = 0;
                sy = (img.naturalHeight - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
            callback(canvas.toDataURL('image/jpeg', 0.8));
        } catch (error) {
            console.error('Erreur traitement image:', error);
            callback(null);
        }
    };
    
    img.onerror = function() {
        console.error('Erreur chargement image:', imageSrc);
        callback(null);
    };
    
    img.src = imageSrc;
}
