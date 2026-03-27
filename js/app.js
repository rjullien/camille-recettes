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
    var categoryBadge = document.querySelector('.category-badge');
    var categoryText = categoryBadge ? categoryBadge.textContent.trim() : '';
    var timeText = '';
    var servesText = '';
    
    document.querySelectorAll('.info-chip').forEach(function(chip) {
        if (chip.classList.contains('info-chip--time')) {
            timeText = chip.textContent.replace('⏱️', '').replace(/^\s+/, '').trim();
        }
        if (chip.classList.contains('info-chip--serves')) {
            servesText = chip.textContent.replace('👥', '').replace(/^\s+/, '').trim();
        }
    });
    
    var heroImg = document.querySelector('.recipe-hero-image img');
    
    // Créer le PDF A4 (210x297mm = 794x1123px à 96 DPI)
    var pdf = new jsPDFClass({
        orientation: 'portrait',
        unit: 'pt',  // points (1pt = 96/72 px = 1.333 px)
        format: 'a4'
    });
    
    // Dimensions A4 en points : 595.28 x 841.89
    var pageWidth = pdf.internal.pageSize.getWidth();
    var pageHeight = pdf.internal.pageSize.getHeight();
    
    // Variables de positionnement (conversion px -> pt : diviser par ~1.33)
    var photoHeight = 315; // 420px / 1.33
    var leftColWidth = pageWidth * 0.38; // 38% comme le template
    var rightColX = leftColWidth;
    var contentStartY = photoHeight + 20;
    
    // === 1. PHOTO ===
    if (heroImg && heroImg.src) {
        processImageForPDF(heroImg.src, function(imgData) {
            if (imgData) {
                pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, photoHeight);
            } else {
                drawPlaceholderPhoto(pdf, pageWidth, photoHeight);
            }
            continuePDFGeneration();
        });
    } else {
        drawPlaceholderPhoto(pdf, pageWidth, photoHeight);
        continuePDFGeneration();
    }
    
    function drawPlaceholderPhoto(pdf, width, height) {
        // Fond gradient simulé (dégradé beige)
        pdf.setFillColor(212, 201, 181); // #D4C9B5
        pdf.rect(0, 0, width, height, 'F');
        
        // Emoji photo centré
        pdf.setFontSize(36);
        pdf.setTextColor(139, 115, 85); // #8B7355
        var text = '📸';
        var textWidth = pdf.getTextWidth(text);
        pdf.text(text, (width - textWidth) / 2, height / 2 + 12);
    }
    
    // Icônes via Lucide Icons (librairie open source, chargée via CDN)
    function lucideSvgToDataUrl(iconName, size, color) {
        if (typeof lucide === 'undefined' || !lucide.icons || !lucide.icons[iconName]) return null;
        var iconDef = lucide.icons[iconName];
        // iconDef = [defaultAttributes, elements]
        var elements = iconDef[1];
        var svgInner = elements.map(function(el) {
            var tag = el[0];
            var attrs = el[1];
            var attrStr = '';
            for (var k in attrs) {
                if (attrs.hasOwnProperty(k)) attrStr += ' ' + k + '="' + attrs[k] + '"';
            }
            return '<' + tag + attrStr + '/>';
        }).join('');
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">' + svgInner + '</svg>';
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    function svgToPng(dataUrl, size, callback) {
        if (!dataUrl) { callback(null); return; }
        var img = new Image();
        img.onload = function() {
            var c = document.createElement('canvas');
            c.width = size * 2; c.height = size * 2; // 2x pour la netteté
            var ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0, size * 2, size * 2);
            callback(c.toDataURL('image/png'));
        };
        img.onerror = function() { callback(null); };
        img.src = dataUrl;
    }

    function continuePDFGeneration() {
        // Générer les icônes Lucide → PNG, puis construire le PDF
        var clockSvg = lucideSvgToDataUrl('clock', 80, '#1A1A1A');
        var usersSvg = lucideSvgToDataUrl('users', 80, '#1A1A1A');
        svgToPng(clockSvg, 80, function(clockPng) {
            svgToPng(usersSvg, 80, function(peoplePng) {
                buildPDF(clockPng, peoplePng);
            });
        });
    }

    function buildPDF(clockPng, peoplePng) {
        // =============================================
        // FIDÈLE AU TEMPLATE preview-canva.html
        // =============================================
        var titlePadLeft = 24;

        // === 2. ZONE TITRE (title-zone) ===
        var titleZoneY = photoHeight;
        var titlePadTop = 12;

        // Catégorie badge — float right (comme le template, avec emoji 🌱)
        if (categoryText) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10.5);
            var badgeLabel = categoryText;
            var badgeTxtW = pdf.getTextWidth(badgeLabel);
            var badgePadH = 12;
            var badgeH = 22;
            var badgeW = badgeTxtW + badgePadH * 2;
            var badgeX = pageWidth - badgeW - titlePadLeft;
            var badgeY = titleZoneY + titlePadTop + 4;
            pdf.setFillColor(232, 245, 233);
            pdf.setDrawColor(232, 245, 233);
            pdf.rect(badgeX, badgeY, badgeW, badgeH, 'FD');
            pdf.setTextColor(46, 125, 50);
            pdf.text(badgeLabel, badgeX + badgePadH, badgeY + 15);
        }

        // Titre principal
        pdf.setTextColor(26, 26, 26);
        pdf.setFont('times', 'bold');
        pdf.setFontSize(36);
        var titleMaxW = pageWidth - titlePadLeft * 2 - (categoryText ? badgeW + 40 : 0);
        var titleLines = pdf.splitTextToSize(title.toUpperCase(), titleMaxW);
        var titleStartY = titleZoneY + titlePadTop + 32;
        titleLines.forEach(function(line, i) {
            pdf.text(line, titlePadLeft, titleStartY + i * 38);
        });
        var titleBottomY = titleStartY + (titleLines.length - 1) * 38;

        // Trait sous le titre
        pdf.setDrawColor(26, 26, 26);
        pdf.setLineWidth(1.1);
        pdf.line(titlePadLeft, titleBottomY + 8, titlePadLeft + titleMaxW * 0.2, titleBottomY + 8);

        // === 3. CONTENT — 2 colonnes ===
        var colStartY = titleBottomY + 18;
        var colEndY = pageHeight - 4;

        // Colonne gauche — fond beige
        pdf.setFillColor(232, 220, 200);
        pdf.rect(0, colStartY, leftColWidth, colEndY - colStartY, 'F');

        // --- Meta row avec icônes SVG rendues en PNG ---
        var metaRowY = colStartY + 15;
        var metaColCenter1 = leftColWidth * 0.3;
        var metaColCenter2 = leftColWidth * 0.7;
        var iconSize = 30; // 40px / 1.33

        // Icône horloge
        if (clockPng) {
            pdf.addImage(clockPng, 'PNG', metaColCenter1 - iconSize / 2, metaRowY, iconSize, iconSize);
        }
        // Texte temps
        if (timeText) {
            pdf.setTextColor(61, 61, 61);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10.5);
            var timeW = pdf.getTextWidth(timeText);
            pdf.text(timeText, metaColCenter1 - timeW / 2, metaRowY + iconSize + 14);
        }

        // Icône personnes
        if (peoplePng) {
            pdf.addImage(peoplePng, 'PNG', metaColCenter2 - iconSize / 2, metaRowY, iconSize, iconSize);
        }
        // Texte portions
        if (servesText) {
            pdf.setTextColor(61, 61, 61);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10.5);
            var servW = pdf.getTextWidth(servesText);
            pdf.text(servesText, metaColCenter2 - servW / 2, metaRowY + iconSize + 14);
        }

        // Séparation après meta
        var ingStartY = metaRowY + iconSize + 30;

        // --- Ingrédients (bullets) ---
        pdf.setTextColor(42, 42, 42);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10.5); // 14px / 1.33
        var ingY = ingStartY;
        var ingPadLeft = 18;
        var ingTextLeft = ingPadLeft + 12;
        var ingMaxW = leftColWidth - ingTextLeft - 10;

        ingredients.forEach(function(ingredient) {
            if (ingY > colEndY - 10) return;
            // Bullet
            pdf.setTextColor(92, 92, 92); // #5C5C5C
            pdf.setFont('helvetica', 'bold');
            pdf.text('•', ingPadLeft, ingY);
            // Texte
            pdf.setTextColor(42, 42, 42);
            pdf.setFont('helvetica', 'normal');
            var lines = pdf.splitTextToSize(ingredient.textContent.trim(), ingMaxW);
            lines.forEach(function(line, li) {
                if (ingY > colEndY - 10) return;
                pdf.text(line, ingTextLeft, ingY);
                ingY += 14; // line-height 1.5 × 14px ≈ 14pt
            });
            ingY += 3; // margin-bottom: 6px ≈ 4.5pt
        });

        // --- Colonne droite — Étapes (fond blanc, padding 0 28px 20px 28px) ---
        var stepPadLeft = rightColX + 21; // 28px / 1.33
        var stepTextLeft = stepPadLeft + 12;
        var stepMaxW = pageWidth - stepTextLeft - 16;
        var stepY = colStartY + 15;

        pdf.setFontSize(10.5);
        steps.forEach(function(step) {
            if (stepY > colEndY - 10) return;
            // Bullet
            pdf.setTextColor(92, 92, 92);
            pdf.setFont('helvetica', 'bold');
            pdf.text('•', stepPadLeft, stepY);
            // Texte
            pdf.setTextColor(42, 42, 42);
            pdf.setFont('helvetica', 'normal');
            var lines = pdf.splitTextToSize(step.textContent.trim(), stepMaxW);
            lines.forEach(function(line) {
                if (stepY > colEndY - 10) return;
                pdf.text(line, stepTextLeft, stepY);
                stepY += 15; // line-height 1.6 × ~14px
            });
            stepY += 5; // margin-bottom: 10px ≈ 7.5pt
        });

        // === 4. BARRE DU BAS (bottom-bar — 1.5px #1A1A1A) ===
        pdf.setFillColor(26, 26, 26);
        pdf.rect(0, pageHeight - 1.5, pageWidth, 1.5, 'F');

        // Sauvegarder le PDF
        pdf.save(recipeName + '.pdf');
    } // end buildPDF
}

// Fonction utilitaire pour traiter les images
function processImageForPDF(imageSrc, callback) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        try {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            
            // Taille optimisée pour PDF — cover crop (respecte le ratio)
            canvas.width = 794;  // Largeur A4 en px
            canvas.height = 420; // Hauteur photo du template
            
            // Cover crop : remplir le rectangle sans déformer l'image
            var imgRatio = img.naturalWidth / img.naturalHeight;
            var canvasRatio = canvas.width / canvas.height;
            var sx, sy, sw, sh;
            if (imgRatio > canvasRatio) {
                // Image plus large → crop les côtés
                sh = img.naturalHeight;
                sw = sh * canvasRatio;
                sx = (img.naturalWidth - sw) / 2;
                sy = 0;
            } else {
                // Image plus haute → crop haut/bas
                sw = img.naturalWidth;
                sh = sw / canvasRatio;
                sx = 0;
                sy = (img.naturalHeight - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
            
            // Convertir en base64
            var dataURL = canvas.toDataURL('image/jpeg', 0.8);
            callback(dataURL);
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
