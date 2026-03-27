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
    
    function continuePDFGeneration() {
        var margin = 24;

        // === 2. ZONE TITRE ===
        pdf.setTextColor(26, 26, 26); // #1A1A1A

        // Titre principal
        pdf.setFont('times', 'bold');
        pdf.setFontSize(30);
        var titleY = photoHeight + 42;
        var titleLines = pdf.splitTextToSize(title.toUpperCase(), pageWidth - margin * 2 - 120);
        titleLines.forEach(function(line, i) {
            pdf.text(line, margin, titleY + i * 32);
        });
        var titleBottomY = titleY + (titleLines.length - 1) * 32;

        // Catégorie badge à droite du titre
        if (categoryText) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            var badgeText = categoryText;
            var badgeTextWidth = pdf.getTextWidth(badgeText);
            var badgePadH = 10;
            var badgePadV = 6;
            var badgeW = badgeTextWidth + badgePadH * 2;
            var badgeH = 18;
            var badgeX = pageWidth - badgeW - margin;
            var badgeY = photoHeight + 22;
            pdf.setFillColor(232, 245, 233);
            pdf.setDrawColor(232, 245, 233);
            pdf.rect(badgeX, badgeY, badgeW, badgeH, 'FD');
            pdf.setTextColor(46, 125, 50);
            pdf.text(badgeText, badgeX + badgePadH, badgeY + 12);
        }

        // Trait sous le titre
        pdf.setTextColor(26, 26, 26);
        var lineWidth = pageWidth * 0.2;
        pdf.setDrawColor(26, 26, 26);
        pdf.setLineWidth(1.5);
        pdf.line(margin, titleBottomY + 8, margin + lineWidth, titleBottomY + 8);

        // Meta infos sous le trait
        var metaY = titleBottomY + 24;
        if (timeText || servesText) {
            pdf.setTextColor(80, 80, 80);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            var metaText = '';
            if (timeText) metaText += timeText;
            if (timeText && servesText) metaText += '   •   ';
            if (servesText) metaText += servesText;
            pdf.text(metaText, margin, metaY);
            metaY += 16;
        }

        // === 3. COLONNES ===
        var colStartY = metaY + 6;
        var colEndY = pageHeight - 12;

        // Colonne gauche - fond beige
        pdf.setFillColor(232, 220, 200);
        pdf.rect(0, colStartY, leftColWidth, colEndY - colStartY, 'F');

        // Sous-titre INGRÉDIENTS
        var currentY = colStartY + 22;
        pdf.setTextColor(26, 26, 26);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text('INGRÉDIENTS', 20, currentY);
        currentY += 16;

        // Ingrédients
        pdf.setTextColor(42, 42, 42);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);

        ingredients.forEach(function(ingredient) {
            if (currentY > colEndY - 12) return;
            var text = '• ' + ingredient.textContent.trim();
            var lines = pdf.splitTextToSize(text, leftColWidth - 40);
            lines.forEach(function(line) {
                if (currentY > colEndY - 12) return;
                pdf.text(line, 20, currentY);
                currentY += 12;
            });
            currentY += 2;
        });

        // Sous-titre PRÉPARATION
        var rightCurrentY = colStartY + 22;
        pdf.setTextColor(26, 26, 26);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text('PRÉPARATION', rightColX + 20, rightCurrentY);
        rightCurrentY += 16;

        // Étapes
        pdf.setTextColor(42, 42, 42);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);

        steps.forEach(function(step, idx) {
            if (rightCurrentY > colEndY - 12) return;
            var text = (idx + 1) + '. ' + step.textContent.trim();
            var lines = pdf.splitTextToSize(text, pageWidth - rightColX - 40);
            lines.forEach(function(line) {
                if (rightCurrentY > colEndY - 12) return;
                pdf.text(line, rightColX + 20, rightCurrentY);
                rightCurrentY += 13;
            });
            rightCurrentY += 5;
        });

        // === 4. BARRE DU BAS ===
        pdf.setFillColor(26, 26, 26);
        pdf.rect(0, pageHeight - 3, pageWidth, 3, 'F');

        // Sauvegarder le PDF
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
