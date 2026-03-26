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

// === FONCTION PDF — Template Canva (sans flex pour html2canvas) ===
function printRecipe(recipeName) {
    if (typeof html2pdf === 'undefined') {
        alert('La librairie PDF n\'est pas chargée. Veuillez actualiser la page.');
        return;
    }

    // Précharger les fonts
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const waitForFonts = document.fonts ? document.fonts.ready : new Promise(r => setTimeout(r, 1000));
    
    waitForFonts.then(() => {
        setTimeout(() => {
            const old = document.getElementById('pdf-render-zone');
            if (old) old.remove();
            
            const pdfContainer = document.createElement('div');
            pdfContainer.id = 'pdf-render-zone';
            pdfContainer.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;background:#FFF;overflow:hidden;z-index:-1;opacity:0;pointer-events:none;';
            document.body.appendChild(pdfContainer);
            
            fillPdfContent(pdfContainer);

            setTimeout(() => {
                // Rendre visible temporairement pour html2canvas
                pdfContainer.style.opacity = '1';
                pdfContainer.style.zIndex = '99999';
                
                html2pdf().set({
                    margin: 0,
                    filename: recipeName + '.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2,
                        width: 794,
                        height: 1123,
                        scrollX: 0,
                        scrollY: 0,
                        useCORS: true
                    },
                    jsPDF: { 
                        unit: 'px', 
                        format: [794, 1123], 
                        orientation: 'portrait',
                        hotfixes: ['px_scaling']
                    }
                }).from(pdfContainer).save().then(function() {
                    pdfContainer.remove();
                }).catch(function(err) {
                    console.error('Erreur PDF:', err);
                    pdfContainer.remove();
                    alert('Erreur lors de la génération du PDF.');
                });
            }, 800);
        }, 300);
    });
}

function fillPdfContent(container) {
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
    var photoHtml = heroImg 
        ? '<img src="' + heroImg.src + '" style="width:100%;height:420px;object-fit:cover;display:block;">'
        : '<div style="width:100%;height:420px;background:linear-gradient(135deg,#D4C9B5,#B8A68E);text-align:center;line-height:420px;font-size:48px;color:#8B7355;">📸</div>';

    var ingredientsHtml = '';
    ingredients.forEach(function(ing) {
        ingredientsHtml += '<div style="font-size:14px;line-height:1.5;margin-bottom:6px;padding-left:16px;color:#2A2A2A;position:relative;"><span style="position:absolute;left:0;color:#5C5C5C;font-weight:bold;">•</span>' + ing.textContent + '</div>';
    });

    var stepsHtml = '';
    steps.forEach(function(step) {
        stepsHtml += '<div style="font-size:14px;line-height:1.6;margin-bottom:10px;padding-left:16px;color:#2A2A2A;position:relative;"><span style="position:absolute;left:0;color:#5C5C5C;font-weight:bold;">•</span>' + step.textContent + '</div>';
    });

    var categoryBadgeHtml = categoryText 
        ? '<div style="float:right;background:#E8F5E9;color:#2E7D32;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:500;font-family:Montserrat,sans-serif;margin-top:12px;">🌱 ' + categoryText + '</div>' 
        : '';

    // TOUT en block/float, ZERO flex
    container.innerHTML = 
        '<div style="width:794px;height:1123px;font-family:Montserrat,sans-serif;color:#1A1A1A;background:#FFF;position:relative;overflow:hidden;">' +
            // Photo
            '<div style="width:100%;height:420px;overflow:hidden;">' + photoHtml + '</div>' +
            // Titre zone
            '<div style="padding:16px 32px 12px;overflow:hidden;">' +
                categoryBadgeHtml +
                '<div style="font-family:Cormorant Garamond,serif;font-size:48px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#1A1A1A;display:inline-block;padding-bottom:8px;line-height:1.1;border-bottom:1.5px solid #1A1A1A;border-bottom-width:1.5px;">' + title + '</div>' +
            '</div>' +
            // 2 colonnes en float
            '<div style="width:100%;overflow:hidden;position:absolute;top:500px;bottom:2px;left:0;right:0;">' +
                // Gauche beige
                '<div style="float:left;width:38%;height:100%;background-color:#E8DCC8;padding:20px 24px;box-sizing:border-box;">' +
                    // Icônes en inline-block
                    '<div style="text-align:center;margin-bottom:20px;padding-bottom:12px;">' +
                        '<div style="display:inline-block;text-align:center;margin-right:30px;vertical-align:top;">' +
                            '<div style="font-size:32px;margin-bottom:4px;">⏱</div>' +
                            '<div style="font-size:14px;color:#3D3D3D;font-family:Montserrat,sans-serif;">' + timeText + '</div>' +
                        '</div>' +
                        '<div style="display:inline-block;text-align:center;vertical-align:top;">' +
                            '<div style="font-size:32px;margin-bottom:4px;">👥</div>' +
                            '<div style="font-size:14px;color:#3D3D3D;font-family:Montserrat,sans-serif;">' + servesText + '</div>' +
                        '</div>' +
                    '</div>' +
                    ingredientsHtml +
                '</div>' +
                // Droite blanc
                '<div style="float:left;width:62%;height:100%;background-color:#FFFFFF;padding:0 28px 20px 28px;box-sizing:border-box;">' +
                    stepsHtml +
                '</div>' +
            '</div>' +
            // Trait bas
            '<div style="position:absolute;bottom:0;left:0;width:100%;height:1.5px;background:#1A1A1A;"></div>' +
        '</div>';
}
