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
        // === 2. ZONE TITRE ===
        pdf.setTextColor(26, 26, 26); // #1A1A1A
        
        // Catégorie badge en haut à droite
        if (categoryText) {
            pdf.setFillColor(232, 245, 233); // #E8F5E9
            pdf.setDrawColor(232, 245, 233);
            var badgeWidth = 80;
            var badgeHeight = 20;
            var badgeX = pageWidth - badgeWidth - 24;
            var badgeY = photoHeight + 12;
            
            // Rectangle badge (arrondi simulé par rectangle normal)
            pdf.rect(badgeX, badgeY, badgeWidth, badgeHeight, 'FD');
            
            pdf.setTextColor(46, 125, 50); // #2E7D32
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            var badgeText = '🌱 ' + categoryText;
            var badgeTextWidth = pdf.getTextWidth(badgeText);
            pdf.text(badgeText, badgeX + (badgeWidth - badgeTextWidth) / 2, badgeY + 13);
        }
        
        // Titre principal
        pdf.setTextColor(26, 26, 26); // #1A1A1A
        pdf.setFont('times', 'bold');  // Approx Cormorant Garamond
        pdf.setFontSize(36);
        var titleY = photoHeight + 50;
        pdf.text(title.toUpperCase(), 24, titleY);
        
        // Trait sous le titre
        var lineWidth = pageWidth * 0.2;
        pdf.setDrawColor(26, 26, 26);
        pdf.setLineWidth(1.5);
        pdf.line(24, titleY + 8, 24 + lineWidth, titleY + 8);
        
        // === 3. COLONNES ===
        var colStartY = contentStartY + 60;
        var colEndY = pageHeight - 15; // Laisser place à la barre du bas
        
        // Colonne gauche - fond beige
        pdf.setFillColor(232, 220, 200); // #E8DCC8
        pdf.rect(0, colStartY, leftColWidth, colEndY - colStartY, 'F');
        
        // Meta infos (temps + personnes) centrées
        if (timeText || servesText) {
            pdf.setTextColor(61, 61, 61); // #3D3D3D
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            var metaText = (timeText ? '⏱️ ' + timeText : '') + 
                          (timeText && servesText ? '  |  ' : '') +
                          (servesText ? '👥 ' + servesText : '');
            var metaWidth = pdf.getTextWidth(metaText);
            pdf.text(metaText, (leftColWidth - metaWidth) / 2, colStartY + 20);
        }
        
        // Ingrédients
        var currentY = colStartY + 40;
        pdf.setTextColor(42, 42, 42); // #2A2A2A
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        ingredients.forEach(function(ingredient) {
            if (currentY > colEndY - 15) return; // Éviter débordement
            
            var text = '• ' + ingredient.textContent.trim();
            var lines = pdf.splitTextToSize(text, leftColWidth - 40);
            
            lines.forEach(function(line, index) {
                if (currentY > colEndY - 15) return;
                pdf.text(line, 20, currentY);
                if (index < lines.length - 1 || ingredients.length > 1) {
                    currentY += 12;
                }
            });
            currentY += 4; // Espace entre ingrédients
        });
        
        // Colonne droite - étapes
        currentY = colStartY + 20;
        pdf.setTextColor(42, 42, 42); // #2A2A2A
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        steps.forEach(function(step) {
            if (currentY > colEndY - 15) return; // Éviter débordement
            
            var text = '• ' + step.textContent.trim();
            var lines = pdf.splitTextToSize(text, pageWidth - rightColX - 40);
            
            lines.forEach(function(line, index) {
                if (currentY > colEndY - 15) return;
                pdf.text(line, rightColX + 20, currentY);
                if (index < lines.length - 1 || steps.length > 1) {
                    currentY += 14;
                }
            });
            currentY += 8; // Espace entre étapes
        });
        
        // === 4. BARRE DU BAS ===
        pdf.setFillColor(26, 26, 26); // #1A1A1A
        pdf.rect(0, pageHeight - 2, pageWidth, 2, 'F');
        
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
            
            // Taille optimisée pour PDF
            canvas.width = 794;  // Largeur A4 en px
            canvas.height = 420; // Hauteur photo du template
            
            // Dessiner l'image redimensionnée
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
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
