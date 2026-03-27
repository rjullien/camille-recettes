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
    // Vérifier html2canvas
    if (typeof html2canvas === 'undefined') {
        alert('Librairie PDF non chargée. Actualise la page.');
        return;
    }
    
    // Trouver jsPDF (l'export varie selon la version)
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

    // Récupérer données
    var title = document.querySelector('.recipe-main-title').textContent;
    var ingredients = document.querySelectorAll('.ingredient-text');
    var steps = document.querySelectorAll('.step-text');
    var categoryBadge = document.querySelector('.category-badge');
    var categoryText = categoryBadge ? categoryBadge.textContent : '';
    var timeText = '';
    var servesText = '';
    document.querySelectorAll('.info-chip').forEach(function(chip) {
        if (chip.classList.contains('info-chip--time')) timeText = chip.textContent.replace('⏱️ ', '');
        if (chip.classList.contains('info-chip--serves')) servesText = chip.textContent.replace('👥 ', '');
    });
    var heroImg = document.querySelector('.recipe-hero-image img');

    // Nettoyer ancien container
    var old = document.getElementById('pdf-zone');
    if (old) old.remove();

    // Créer container VISIBLE (html2canvas ne capture pas les éléments cachés)
    var box = document.createElement('div');
    box.id = 'pdf-zone';
    box.style.cssText = 'position:fixed;top:0;left:0;width:794px;height:1123px;background:#FFF;z-index:99999;overflow:hidden;';
    document.body.appendChild(box);

    // Photo
    var photoHtml = heroImg
        ? '<img src="' + heroImg.src + '" style="width:100%;height:100%;object-fit:cover;">'
        : '<div style="width:100%;height:100%;background:linear-gradient(135deg,#D4C9B5,#B8A68E);text-align:center;line-height:420px;font-size:48px;">📸</div>';

    // Ingrédients
    var ingHtml = '';
    ingredients.forEach(function(ing) {
        ingHtml += '<div style="font-size:13px;line-height:1.5;margin-bottom:5px;color:#2A2A2A;">• ' + ing.textContent + '</div>';
    });

    // Étapes
    var stepsHtml = '';
    steps.forEach(function(step) {
        stepsHtml += '<div style="font-size:13px;line-height:1.6;margin-bottom:8px;color:#2A2A2A;">• ' + step.textContent + '</div>';
    });

    // Catégorie
    var catHtml = categoryText
        ? '<div style="position:absolute;top:16px;right:32px;background:#E8F5E9;color:#2E7D32;padding:5px 14px;border-radius:20px;font-size:13px;">🌱 ' + categoryText + '</div>'
        : '';

    // Template A4 exact
    box.innerHTML =
        '<div style="width:794px;height:1123px;font-family:Arial,Helvetica,sans-serif;color:#1A1A1A;background:#FFF;position:relative;overflow:hidden;">' +
        // Photo 420px
        '<div style="width:794px;height:420px;overflow:hidden;background:#ccc;">' + photoHtml + '</div>' +
        // Titre
        '<div style="padding:14px 32px 10px;position:relative;">' +
        catHtml +
        '<div style="font-family:Georgia,serif;font-size:42px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#1A1A1A;line-height:1.1;">' + title + '</div>' +
        '<div style="width:80px;height:2px;background:#1A1A1A;margin-top:6px;"></div>' +
        '</div>' +
        // 2 colonnes
        '<div style="position:absolute;top:520px;bottom:2px;left:0;right:0;">' +
        // Gauche beige
        '<div style="position:absolute;left:0;top:0;bottom:0;width:302px;background-color:#E8DCC8;padding:16px 20px;">' +
        '<div style="text-align:center;margin-bottom:14px;font-size:12px;color:#3D3D3D;">⏱️ ' + timeText + '  |  👥 ' + servesText + '</div>' +
        ingHtml +
        '</div>' +
        // Droite blanc
        '<div style="position:absolute;left:302px;top:0;bottom:0;right:0;padding:16px 24px;background:#FFF;">' +
        stepsHtml +
        '</div>' +
        '</div>' +
        // Barre bas
        '<div style="position:absolute;bottom:0;left:0;width:100%;height:2px;background:#1A1A1A;"></div>' +
        '</div>';

    // Attendre image puis capturer
    var img = box.querySelector('img');
    var waitImg = (!img || img.complete) ? Promise.resolve() : new Promise(function(r) { img.onload = r; img.onerror = r; });

    waitImg.then(function() {
        return new Promise(function(r) { setTimeout(r, 600); });
    }).then(function() {
        return html2canvas(box, {
            width: 794,
            height: 1123,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#FFFFFF',
            logging: false
        });
    }).then(function(canvas) {
        var pdf = new jsPDFClass({
            orientation: 'portrait',
            unit: 'px',
            format: [794, 1123],
            hotfixes: ['px_scaling']
        });
        var imgData = canvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(imgData, 'JPEG', 0, 0, 794, 1123);
        pdf.save(recipeName + '.pdf');
        box.remove();
    }).catch(function(err) {
        console.error('PDF error:', err);
        box.remove();
        alert('Erreur PDF: ' + err.message);
    });
}
