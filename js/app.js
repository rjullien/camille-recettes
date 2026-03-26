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

// === FONCTION PDF — Template Canva Camille ===
function printRecipe(recipeName) {
    if (typeof html2pdf === 'undefined') {
        alert('La librairie PDF n\'est pas chargée. Veuillez actualiser la page.');
        return;
    }

    // Précharger les fonts Canva template
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Attendre que les fonts soient chargées (Safari fix)
    const waitForFonts = document.fonts ? document.fonts.ready : new Promise(r => setTimeout(r, 1000));
    
    waitForFonts.then(() => {
        // Petit délai supplémentaire pour Safari
        setTimeout(() => {
            const pdfContainer = createPdfContainer();
            document.body.appendChild(pdfContainer);
            fillPdfContent(pdfContainer);

            // Attendre le rendu DOM + fonts dans le container
            setTimeout(() => {
                const opt = {
                    margin: 0,
                    filename: `${recipeName}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2,
                        width: 794,
                        height: 1123,
                        scrollX: 0,
                        scrollY: 0,
                        useCORS: true,
                        logging: false
                    },
                    jsPDF: { 
                        unit: 'px', 
                        format: [794, 1123], 
                        orientation: 'portrait',
                        hotfixes: ['px_scaling']
                    }
                };

                html2pdf().set(opt).from(pdfContainer).save().then(() => {
                    document.body.removeChild(pdfContainer);
                }).catch(err => {
                    console.error('Erreur PDF:', err);
                    document.body.removeChild(pdfContainer);
                    alert('Erreur lors de la génération du PDF. Réessaie !');
                });
            }, 500);
        }, 300);
    });
}

function createPdfContainer() {
    const container = document.createElement('div');
    container.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 794px;
        height: 1123px;
        background: #FFFFFF;
        overflow: hidden;
        box-sizing: border-box;
    `;
    return container;
}

function fillPdfContent(container) {
    // Récupérer les données de la page
    const title = document.querySelector('.recipe-main-title').textContent;
    const ingredients = document.querySelectorAll('.ingredient-text');
    const steps = document.querySelectorAll('.step-text');
    const categoryBadge = document.querySelector('.category-badge');
    const categoryText = categoryBadge ? categoryBadge.textContent : '';
    
    // Extraire temps et personnes depuis les info-chips
    let timeText = '';
    let servesText = '';
    document.querySelectorAll('.info-chip').forEach(chip => {
        if (chip.classList.contains('info-chip--time')) timeText = chip.textContent.replace('⏱️ ', '');
        if (chip.classList.contains('info-chip--serves')) servesText = chip.textContent.replace('👥 ', '');
    });

    // Chercher une image hero (si elle existe)
    const heroImg = document.querySelector('.recipe-hero-image img');
    const photoHtml = heroImg 
        ? `<img src="${heroImg.src}" style="width:100%;height:100%;object-fit:cover;">`
        : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:48px;color:#8B7355;">📸</div>`;

    container.innerHTML = `
        <div style="
            width: 794px;
            height: 1123px;
            font-family: 'Montserrat', sans-serif;
            color: #1A1A1A;
            background: #FFFFFF;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        ">
            <!-- Photo -->
            <div style="
                width: 100%;
                height: 420px;
                background: linear-gradient(135deg, #D4C9B5 0%, #B8A68E 100%);
                overflow: hidden;
                flex-shrink: 0;
            ">${photoHtml}</div>

            <!-- Titre -->
            <div style="padding: 16px 32px 12px; flex-shrink: 0;">
                ${categoryText ? `<span style="
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
                ">🌱 ${categoryText}</span>` : ''}
                <div style="
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
                ">${title}<span style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 20%;
                    height: 1.5px;
                    background: #1A1A1A;
                    display: block;
                "></span></div>
            </div>

            <!-- 2 Colonnes -->
            <div style="display: flex; flex: 1; align-items: stretch;">
                <!-- Gauche beige -->
                <div style="
                    width: 38%;
                    background-color: #E8DCC8;
                    padding: 20px 24px;
                ">
                    <!-- Icônes -->
                    <div style="
                        display: flex;
                        justify-content: space-around;
                        align-items: center;
                        margin-bottom: 20px;
                        padding-bottom: 12px;
                    ">
                        <div style="text-align:center;display:flex;flex-direction:column;align-items:center;">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span style="font-size:14px;color:#3D3D3D;font-family:'Montserrat',sans-serif;margin-top:6px;">${timeText}</span>
                        </div>
                        <div style="text-align:center;display:flex;flex-direction:column;align-items:center;">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            <span style="font-size:14px;color:#3D3D3D;font-family:'Montserrat',sans-serif;margin-top:6px;">${servesText}</span>
                        </div>
                    </div>
                    <!-- Ingrédients -->
                    <ul style="list-style:none;padding:0;margin:0;">
                        ${Array.from(ingredients).map(ing => `
                            <li style="
                                font-size:14px;
                                line-height:1.5;
                                margin-bottom:6px;
                                padding-left:16px;
                                position:relative;
                                color:#2A2A2A;
                            "><span style="position:absolute;left:0;color:#5C5C5C;font-weight:bold;">•</span>${ing.textContent}</li>
                        `).join('')}
                    </ul>
                </div>
                <!-- Droite blanc -->
                <div style="
                    width: 62%;
                    background-color: #FFFFFF;
                    padding: 0 28px 20px 28px;
                ">
                    <ul style="list-style:none;padding:0;margin:0;">
                        ${Array.from(steps).map(step => `
                            <li style="
                                font-size:14px;
                                line-height:1.6;
                                margin-bottom:10px;
                                padding-left:16px;
                                position:relative;
                                color:#2A2A2A;
                            "><span style="position:absolute;left:0;color:#5C5C5C;font-weight:bold;">•</span>${step.textContent}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>

            <!-- Trait bas -->
            <div style="height:1.5px;background:#1A1A1A;width:100%;flex-shrink:0;"></div>
        </div>
    `;
}
