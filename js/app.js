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
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Filter recipes
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

// === FONCTION PDF MODERNE ===
function printRecipe(recipeName) {
    if (typeof html2pdf === 'undefined') {
        alert('La librairie PDF n\'est pas chargée. Veuillez actualiser la page.');
        return;
    }

    // Créer le contenu PDF hors-écran
    const pdfContainer = createPdfContainer();
    document.body.appendChild(pdfContainer);

    // Remplir le contenu
    fillPdfContent(pdfContainer);

    // Configuration PDF (taille A4 fixe)
    const opt = {
        margin: 0,
        filename: `${recipeName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            width: 718,
            height: 1048,
            scrollX: 0,
            scrollY: 0,
            allowTaint: true,
            useCORS: true
        },
        jsPDF: { 
            unit: 'px', 
            format: [718, 1048], 
            orientation: 'portrait'
        }
    };

    // Générer et télécharger le PDF
    html2pdf().set(opt).from(pdfContainer).save().finally(() => {
        // Nettoyer le DOM
        document.body.removeChild(pdfContainer);
    });
}

function createPdfContainer() {
    const container = document.createElement('div');
    container.className = 'pdf-container';
    container.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 718px;
        height: 1048px;
        background-color: white;
        overflow: hidden;
        font-family: 'Inter', sans-serif;
        font-size: 10px;
        line-height: 1.4;
        color: #1A1A1A;
        padding: 20px;
        box-sizing: border-box;
    `;
    return container;
}

function fillPdfContent(container) {
    // Récupérer les données de la page actuelle
    const title = document.querySelector('.recipe-main-title').textContent;
    const infoChips = document.querySelectorAll('.info-chip');
    const ingredients = document.querySelectorAll('.ingredient-text');
    const steps = document.querySelectorAll('.step-text');
    const categoryBadge = document.querySelector('.category-badge');

    // Construire le HTML du PDF (2 colonnes pour optimiser l'espace)
    container.innerHTML = `
        <!-- Photo placeholder -->
        <div style="
            width: 100%; 
            height: 160px; 
            background: linear-gradient(135deg, #F0E6D6 0%, #D4E4D0 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            margin-bottom: 16px;
        ">📸</div>

        <!-- Titre -->
        <h1 style="
            font-family: 'DM Sans', sans-serif;
            font-weight: 700;
            font-size: 24px;
            color: #1A1A1A;
            text-align: center;
            margin-bottom: 12px;
            line-height: 1.2;
        ">${title}</h1>

        <!-- Infos -->
        <div style="
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        ">
            ${Array.from(infoChips).map(chip => `
                <span style="
                    padding: 4px 8px;
                    background-color: ${chip.classList.contains('info-chip--category') ? 'rgba(74, 124, 89, 0.1)' : '#F8F4EF'};
                    color: ${chip.classList.contains('info-chip--category') ? '#4A7C59' : '#1A1A1A'};
                    border-radius: 50px;
                    font-size: 9px;
                    font-weight: 500;
                ">${chip.textContent}</span>
            `).join('')}
        </div>

        <!-- Contenu 2 colonnes -->
        <div style="display: flex; gap: 16px; margin-bottom: 20px;">
            <!-- Colonne Ingrédients -->
            <div style="
                flex: 1;
                background-color: #F8F4EF;
                padding: 12px;
                border-radius: 8px;
            ">
                <h2 style="
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 600;
                    font-size: 13px;
                    color: #1A1A1A;
                    margin-bottom: 8px;
                ">Ingrédients</h2>
                <ul style="list-style: none; margin: 0; padding: 0;">
                    ${Array.from(ingredients).map(ingredient => `
                        <li style="
                            display: flex;
                            align-items: flex-start;
                            gap: 6px;
                            margin-bottom: 4px;
                            font-size: 9px;
                        ">
                            <span style="
                                width: 12px;
                                height: 12px;
                                background-color: #4A7C59;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                flex-shrink: 0;
                                margin-top: 1px;
                                color: white;
                                font-size: 8px;
                                font-weight: bold;
                            ">✓</span>
                            <span>${ingredient.textContent}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <!-- Colonne Préparation -->
            <div style="
                flex: 1;
                background-color: white;
                padding: 12px;
                border-radius: 8px;
            ">
                <h2 style="
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 600;
                    font-size: 13px;
                    color: #1A1A1A;
                    margin-bottom: 8px;
                ">Préparation</h2>
                <ul style="list-style: none; margin: 0; padding: 0;">
                    ${Array.from(steps).map((step, index) => `
                        <li style="
                            display: flex;
                            align-items: flex-start;
                            gap: 8px;
                            margin-bottom: 8px;
                            font-size: 9px;
                        ">
                            <span style="
                                width: 16px;
                                height: 16px;
                                background-color: #D4764E;
                                color: white;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: 600;
                                font-size: 8px;
                                flex-shrink: 0;
                                margin-top: 1px;
                            ">${index + 1}</span>
                            <span>${step.textContent}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div style="
            text-align: center;
            color: #6B6360;
            font-size: 8px;
            margin-top: auto;
        ">Fait avec ❤️ par Camille</div>
    `;
}