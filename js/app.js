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
// Reproduit exactement le template Canva (preview-canva.html)
// Template A4 = 794x1123px, 1 seule page
// html2canvas ne gère pas flex → on utilise float/position absolute
function printRecipe(recipeName) {
    if (typeof html2pdf === 'undefined') {
        alert('La librairie PDF n\'est pas chargée. Actualise la page et réessaie.');
        return;
    }

    // Récupérer les données de la page recette
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

    // Nettoyer ancien container
    const old = document.getElementById('pdf-render-zone');
    if (old) old.remove();

    // Créer le container hors-écran
    const pdfContainer = document.createElement('div');
    pdfContainer.id = 'pdf-render-zone';
    pdfContainer.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;background:#FFF;overflow:hidden;z-index:-1;opacity:0;pointer-events:none;';
    document.body.appendChild(pdfContainer);

    // === CONSTRUIRE LE TEMPLATE CANVA ===
    // Reproduction fidèle de templates/preview-canva.html
    // Pas de flex (html2canvas bug) → float + position absolute

    const photoHtml = heroImg 
        ? '<img src="' + heroImg.src + '" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;">'
        : '<div style="width:100%;height:100%;background:linear-gradient(135deg,#D4C9B5,#B8A68E);text-align:center;line-height:420px;font-size:48px;color:#8B7355;">📸</div>';

    const ingredientItems = Array.from(ingredients).map(ing => 
        '<li style="font-size:14px;line-height:1.5;margin-bottom:6px;padding-left:16px;position:relative;color:#2A2A2A;">' +
        '<span style="position:absolute;left:0;color:#5C5C5C;font-weight:bold;">•</span>' + 
        ing.textContent + '</li>'
    ).join('');

    const stepItems = Array.from(steps).map(step => 
        '<li style="font-size:14px;line-height:1.6;margin-bottom:10px;padding-left:16px;position:relative;color:#2A2A2A;">' +
        '<span style="position:absolute;left:0;color:#5C5C5C;font-weight:bold;">•</span>' +
        step.textContent + '</li>'
    ).join('');

    const categoryHtml = categoryText 
        ? '<span style="float:right;background:#E8F5E9;color:#2E7D32;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:500;font-family:Montserrat,Helvetica,Arial,sans-serif;margin-top:12px;">🌱 ' + categoryText + '</span>'
        : '';

    pdfContainer.innerHTML = 
        '<div style="width:794px;height:1123px;font-family:Montserrat,Helvetica,Arial,sans-serif;color:#1A1A1A;background:#FFF;position:relative;overflow:hidden;">' +
            // === PHOTO (420px, identique au template) ===
            '<div style="width:794px;height:420px;overflow:hidden;background:linear-gradient(135deg,#D4C9B5,#B8A68E);">' + photoHtml + '</div>' +
            // === TITRE ZONE ===
            '<div style="padding:16px 32px 12px;overflow:hidden;">' +
                categoryHtml +
                '<div style="font-family:Cormorant Garamond,Georgia,serif;font-size:48px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#1A1A1A;display:inline-block;padding-bottom:8px;line-height:1.1;">' + title + '</div>' +
                '<div style="width:20%;height:1.5px;background:#1A1A1A;clear:both;"></div>' +
            '</div>' +
            // === 2 COLONNES (float, position absolute pour remplir) ===
            '<div style="position:absolute;top:520px;bottom:2px;left:0;right:0;overflow:hidden;">' +
                // Gauche beige (38%) — Ingrédients
                '<div style="float:left;width:302px;height:100%;background-color:#E8DCC8;padding:20px 24px;box-sizing:border-box;overflow:hidden;">' +
                    // Icônes temps + personnes (table au lieu de flex)
                    '<table style="width:100%;margin-bottom:20px;padding-bottom:12px;"><tr>' +
                        '<td style="text-align:center;vertical-align:top;">' +
                            '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
                            '<br><span style="font-size:14px;color:#3D3D3D;font-family:Montserrat,Helvetica,sans-serif;">' + timeText + '</span>' +
                        '</td>' +
                        '<td style="text-align:center;vertical-align:top;">' +
                            '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
                            '<br><span style="font-size:14px;color:#3D3D3D;font-family:Montserrat,Helvetica,sans-serif;">' + servesText + '</span>' +
                        '</td>' +
                    '</tr></table>' +
                    '<ul style="list-style:none;padding:0;margin:0;">' + ingredientItems + '</ul>' +
                '</div>' +
                // Droite blanc (62%) — Préparation
                '<div style="margin-left:302px;padding:0 28px 20px 28px;box-sizing:border-box;overflow:hidden;">' +
                    '<ul style="list-style:none;padding:0;margin:0;">' + stepItems + '</ul>' +
                '</div>' +
            '</div>' +
            // === BARRE BAS ===
            '<div style="position:absolute;bottom:0;left:0;width:100%;height:1.5px;background:#1A1A1A;"></div>' +
        '</div>';

    // Attendre fonts + images
    const waitFonts = document.fonts ? document.fonts.ready : Promise.resolve();
    const images = pdfContainer.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
    });

    Promise.all([waitFonts, ...imagePromises]).then(() => {
        setTimeout(() => {
            html2pdf().set({
                margin: 0,
                filename: recipeName + '.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true,
                    logging: false,
                    width: 794,
                    height: 1123
                },
                jsPDF: { 
                    unit: 'px', 
                    format: [794, 1123], 
                    orientation: 'portrait',
                    hotfixes: ['px_scaling']
                }
            }).from(pdfContainer).save().then(() => {
                pdfContainer.remove();
            }).catch(err => {
                console.error('Erreur PDF:', err);
                pdfContainer.remove();
                alert('Erreur lors de la génération du PDF. Réessaie !');
            });
        }, 800);
    });
}
