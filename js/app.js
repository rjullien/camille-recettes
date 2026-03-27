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

// === FONCTION PDF ===
// Stratégie : window.print() avec @media print CSS dédié
// html2pdf.js est trop instable sur mobile (Safari iOS, Chrome Android)
function printRecipe(recipeName) {
    // Sur mobile iOS Safari, html2pdf échoue souvent silencieusement
    // On utilise window.print() qui ouvre le dialogue natif "Enregistrer en PDF"
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile || typeof html2pdf === 'undefined') {
        // Fallback natif — fonctionne partout
        window.print();
        return;
    }
    
    // Sur desktop avec html2pdf disponible : générer un joli PDF
    generatePdfDesktop(recipeName);
}

function generatePdfDesktop(recipeName) {
    // Récupérer les données de la recette
    const title = document.querySelector('.recipe-main-title').textContent;
    const ingredients = document.querySelectorAll('.ingredient-text');
    const steps = document.querySelectorAll('.step-text');
    const categoryBadge = document.querySelector('.category-badge');
    const categoryText = categoryBadge ? categoryBadge.textContent : '';
    
    let timeText = '';
    let servesText = '';
    document.querySelectorAll('.info-chip').forEach(chip => {
        if (chip.classList.contains('info-chip--time')) timeText = chip.textContent.replace('⏱️ ', '');
        if (chip.classList.contains('info-chip--serves')) servesText = chip.textContent.replace('👥 ', '');
    });

    const heroImg = document.querySelector('.recipe-hero-image img');

    // Créer le container PDF (hors écran mais visible pour html2canvas)
    const old = document.getElementById('pdf-render-zone');
    if (old) old.remove();

    const pdfContainer = document.createElement('div');
    pdfContainer.id = 'pdf-render-zone';
    pdfContainer.style.cssText = 'position:absolute;left:-9999px;top:0;width:794px;background:#FFF;';
    document.body.appendChild(pdfContainer);

    // Construire le contenu avec des fonts système (pas de Google Fonts dans le PDF)
    const photoHtml = heroImg 
        ? '<img src="' + heroImg.src + '" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;">'
        : '<div style="width:100%;height:100%;background:linear-gradient(135deg,#D4C9B5,#B8A68E);text-align:center;line-height:380px;font-size:48px;color:#8B7355;">📸</div>';

    const ingredientItems = Array.from(ingredients).map(ing => 
        '<li style="font-size:14px;line-height:1.6;margin-bottom:6px;padding-left:16px;position:relative;color:#2A2A2A;">' +
        '<span style="position:absolute;left:0;color:#4A7C59;font-weight:bold;">•</span>' + 
        ing.textContent + '</li>'
    ).join('');

    const stepItems = Array.from(steps).map((step, i) => 
        '<li style="font-size:14px;line-height:1.6;margin-bottom:10px;padding-left:28px;position:relative;color:#2A2A2A;">' +
        '<span style="position:absolute;left:0;top:0;width:20px;height:20px;background:#D4764E;color:#FFF;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:bold;">' + (i+1) + '</span>' +
        step.textContent + '</li>'
    ).join('');

    const categoryHtml = categoryText 
        ? '<span style="display:inline-block;background:#E8F5E9;color:#2E7D32;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:8px;">🌱 ' + categoryText + '</span><br>'
        : '';

    pdfContainer.innerHTML = 
        '<div style="width:794px;min-height:1123px;font-family:Helvetica,Arial,sans-serif;color:#1A1A1A;background:#FFF;position:relative;">' +
            // Photo
            '<div style="width:794px;height:380px;overflow:hidden;background:linear-gradient(135deg,#D4C9B5,#B8A68E);">' + photoHtml + '</div>' +
            // Titre
            '<div style="padding:20px 32px 12px;">' +
                categoryHtml +
                '<div style="font-size:36px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#1A1A1A;line-height:1.2;margin-bottom:8px;">' + title + '</div>' +
                '<div style="width:60px;height:2px;background:#1A1A1A;margin-bottom:4px;"></div>' +
                '<div style="font-size:13px;color:#6B6360;margin-top:6px;">⏱️ ' + timeText + '  ·  👥 ' + servesText + '</div>' +
            '</div>' +
            // 2 colonnes via float
            '<div style="width:794px;overflow:hidden;padding:0;">' +
                // Gauche beige — Ingrédients
                '<div style="float:left;width:300px;background-color:#F5F0E8;padding:20px 24px;min-height:400px;">' +
                    '<div style="font-size:16px;font-weight:700;margin-bottom:14px;color:#1A1A1A;text-transform:uppercase;letter-spacing:1px;">Ingrédients</div>' +
                    '<ul style="list-style:none;padding:0;margin:0;">' + ingredientItems + '</ul>' +
                '</div>' +
                // Droite blanc — Préparation
                '<div style="margin-left:300px;padding:20px 28px;min-height:400px;">' +
                    '<div style="font-size:16px;font-weight:700;margin-bottom:14px;color:#1A1A1A;text-transform:uppercase;letter-spacing:1px;">Préparation</div>' +
                    '<ul style="list-style:none;padding:0;margin:0;">' + stepItems + '</ul>' +
                '</div>' +
            '</div>' +
            // Footer
            '<div style="text-align:center;padding:12px;font-size:11px;color:#999;border-top:1px solid #E5E5E5;margin-top:16px;">Les Recettes de Camille 🌿</div>' +
        '</div>';

    // Attendre que l'image se charge
    const images = pdfContainer.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    });

    Promise.all(imagePromises).then(() => {
        setTimeout(() => {
            html2pdf().set({
                margin: 0,
                filename: recipeName + '.pdf',
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true,
                    logging: false,
                    allowTaint: false
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait'
                }
            }).from(pdfContainer).save().then(() => {
                pdfContainer.remove();
            }).catch(err => {
                console.error('Erreur PDF:', err);
                pdfContainer.remove();
                // Fallback vers print natif
                window.print();
            });
        }, 500);
    });
}
