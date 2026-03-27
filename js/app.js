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

// === GÉNÉRATION PDF via HTML2CANVAS ===
function printRecipe(recipeName) {
    // Vérifier les dépendances
    if (!window.html2canvas) {
        alert('html2canvas non chargé. Actualise la page.');
        return;
    }
    
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

    // Extraire les données de la page
    var recipeData = extractRecipeData();
    
    // Créer le template DOM caché
    var templateContainer = createPDFTemplate(recipeData);
    
    // Ajouter au DOM temporairement (invisible)
    templateContainer.style.position = 'absolute';
    templateContainer.style.left = '-9999px';
    templateContainer.style.top = '0';
    document.body.appendChild(templateContainer);
    
    // Attendre que les fonts se chargent
    setTimeout(function() {
        // Capturer avec html2canvas
        html2canvas(templateContainer, {
            width: 794,
            height: 1123,
            scale: 2, // Haute qualité
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#FFFFFF',
            logging: false
        }).then(function(canvas) {
            // Nettoyer le DOM
            document.body.removeChild(templateContainer);
            
            // Créer le PDF
            var pdf = new jsPDFClass({
                orientation: 'portrait',
                unit: 'px',
                format: [794, 1123]
            });
            
            var imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123);
            
            // Détection iOS pour le fix d'ouverture
            var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            
            if (isIOS) {
                // Sur iOS, utiliser window.open avec data URI
                var pdfBlob = pdf.output('datauristring');
                window.open(pdfBlob, '_blank');
            } else {
                // Sur desktop, téléchargement normal
                pdf.save(recipeName + '.pdf');
            }
        }).catch(function(error) {
            console.error('Erreur html2canvas:', error);
            document.body.removeChild(templateContainer);
            alert('Erreur lors de la génération du PDF.');
        });
    }, 1000); // Délai pour charger les fonts
}

// Extraire les données de la recette depuis la page
function extractRecipeData() {
    var data = {
        title: '',
        category: '',
        time: '',
        serves: '',
        ingredients: [],
        steps: [],
        imageUrl: ''
    };
    
    // Titre
    var titleEl = document.querySelector('.recipe-main-title');
    if (titleEl) data.title = titleEl.textContent.trim();
    
    // Catégorie
    var categoryEl = document.querySelector('.category-badge');
    if (categoryEl) data.category = categoryEl.textContent.trim();
    
    // Temps et portions depuis les info-chips
    document.querySelectorAll('.info-chip').forEach(function(chip) {
        if (chip.classList.contains('info-chip--time')) {
            data.time = chip.textContent.replace('⏱️', '').trim();
        }
        if (chip.classList.contains('info-chip--serves')) {
            data.serves = chip.textContent.replace('👥', '').trim();
        }
    });
    
    // Ingrédients
    document.querySelectorAll('.ingredient-text').forEach(function(ingredient) {
        data.ingredients.push(ingredient.textContent.trim());
    });
    
    // Étapes
    document.querySelectorAll('.step-text').forEach(function(step) {
        data.steps.push(step.textContent.trim());
    });
    
    // Image
    var imgEl = document.querySelector('.recipe-hero-image img');
    if (imgEl) data.imageUrl = imgEl.src;
    
    return data;
}

// Créer le template DOM basé sur preview-canva.html
function createPDFTemplate(data) {
    var container = document.createElement('div');
    
    // Styles intégrés (copié exactement du template)
    var styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        .pdf-template * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .pdf-template .page {
            width: 794px;
            height: 1123px;
            font-family: 'Montserrat', sans-serif;
            color: #1A1A1A;
            background: #FFFFFF;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .pdf-template .photo-zone {
            width: 100%;
            height: 420px;
            background: linear-gradient(135deg, #D4C9B5 0%, #B8A68E 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: #8B7355;
            overflow: hidden;
            flex-shrink: 0;
        }
        .pdf-template .photo-zone img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .pdf-template .title-zone {
            padding: 16px 32px 12px;
            flex-shrink: 0;
        }
        .pdf-template .category {
            float: right;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #E8F5E9;
            color: #2E7D32;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            font-family: 'Montserrat', sans-serif;
            margin-top: 12px;
        }
        .pdf-template .title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 48px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #1A1A1A;
            display: inline-block;
            padding-bottom: 8px;
            line-height: 1.1;
            position: relative;
        }
        .pdf-template .title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 20%;
            height: 1.5px;
            background: #1A1A1A;
        }
        
        .pdf-template .content {
            display: flex;
            flex: 1;
            align-items: stretch;
        }
        
        .pdf-template .col-left {
            width: 38%;
            background-color: #E8DCC8;
            padding: 20px 24px;
        }
        
        .pdf-template .meta-row {
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
        }
        .pdf-template .meta-item {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .pdf-template .meta-icon-svg {
            display: block;
            margin-bottom: 6px;
        }
        .pdf-template .meta-label {
            font-size: 14px;
            font-weight: 400;
            color: #3D3D3D;
            font-family: 'Montserrat', sans-serif;
        }
        
        .pdf-template .ingredient-list {
            list-style: none;
            padding: 0;
        }
        .pdf-template .ingredient-list li {
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 6px;
            padding-left: 16px;
            position: relative;
            color: #2A2A2A;
        }
        .pdf-template .ingredient-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #5C5C5C;
            font-weight: bold;
        }
        
        .pdf-template .col-right {
            width: 62%;
            background-color: #FFFFFF;
            padding: 0 28px 20px 28px;
        }
        .pdf-template .step-list {
            list-style: none;
            padding: 0;
            margin-top: 0;
        }
        .pdf-template .step-list li {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 10px;
            padding-left: 16px;
            position: relative;
            color: #2A2A2A;
        }
        .pdf-template .step-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #5C5C5C;
            font-weight: bold;
        }
        
        .pdf-template .bottom-bar {
            height: 1.5px;
            background: #1A1A1A;
            width: 100%;
            margin-top: auto;
        }
    `;
    
    document.head.appendChild(styleSheet);
    
    // HTML du template (structure exacte)
    container.className = 'pdf-template';
    container.innerHTML = `
        <div class="page">
            <div class="photo-zone">
                ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.title}">` : '📸 Photo du plat'}
            </div>

            <div class="title-zone">
                <span class="category">${data.category || '🌱 Légumes du jardin'}</span>
                <div class="title">${data.title || 'Titre de la recette'}</div>
            </div>

            <div class="content">
                <div class="col-left">
                    <div class="meta-row">
                        <div class="meta-item">
                            <svg class="meta-icon-svg" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span class="meta-label">${data.time || '15 min'}</span>
                        </div>
                        <div class="meta-item">
                            <svg class="meta-icon-svg" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            <span class="meta-label">${data.serves || '6 personnes'}</span>
                        </div>
                    </div>
                    <ul class="ingredient-list">
                        ${data.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
                <div class="col-right">
                    <ul class="step-list">
                        ${data.steps.map(step => `<li>${step}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="bottom-bar"></div>
        </div>
    `;
    
    return container;
}