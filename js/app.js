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

// === GÉNÉRATION PDF CORRIGÉE ===
// Nouvelle approche: on évite html2pdf.js qui est buggy avec html2canvas
// On utilise directement jsPDF + html2canvas pour plus de contrôle
async function printRecipe(recipeName) {
    try {
        // Vérifier que les librairies sont disponibles
        if (typeof html2canvas === 'undefined' || typeof window.jsPDF === 'undefined') {
            // Fallback: charger les librairies si pas déjà chargées
            await loadPDFLibraries();
        }

        // Récupérer les données de la page recette
        const recipeData = extractRecipeData();
        
        // Créer le container PDF visible temporairement 
        const pdfContainer = createPDFContainer(recipeData);
        
        // Attendre que tout soit rendu
        await waitForRender(pdfContainer);
        
        // Capturer avec html2canvas
        const canvas = await html2canvas(pdfContainer, {
            width: 794,
            height: 1123,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#FFFFFF',
            logging: false,
            onclone: function(clonedDoc) {
                // S'assurer que les fonts système sont utilisées dans le clone
                const style = clonedDoc.createElement('style');
                style.innerHTML = `
                    * { 
                        font-family: Arial, Helvetica, sans-serif !important; 
                    }
                    .title-font { 
                        font-family: Georgia, 'Times New Roman', serif !important; 
                    }
                `;
                clonedDoc.head.appendChild(style);
            }
        });

        // Créer le PDF avec jsPDF
        const { jsPDF } = window.jsPDF;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [794, 1123]
        });

        // Ajouter l'image au PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, 794, 1123);
        
        // Sauvegarder
        pdf.save(recipeName + '.pdf');
        
        // Nettoyer
        document.body.removeChild(pdfContainer);
        
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        alert('Erreur lors de la génération du PDF. Vérifie que ton navigateur autorise les téléchargements et réessaie.');
    }
}

// Charger les librairies PDF si nécessaire
async function loadPDFLibraries() {
    return new Promise((resolve, reject) => {
        // Charger html2canvas
        if (typeof html2canvas === 'undefined') {
            const script1 = document.createElement('script');
            script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script1.onload = () => {
                // Charger jsPDF
                if (typeof window.jsPDF === 'undefined') {
                    const script2 = document.createElement('script');
                    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                    script2.onload = resolve;
                    script2.onerror = reject;
                    document.head.appendChild(script2);
                } else {
                    resolve();
                }
            };
            script1.onerror = reject;
            document.head.appendChild(script1);
        } else if (typeof window.jsPDF === 'undefined') {
            const script2 = document.createElement('script');
            script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script2.onload = resolve;
            script2.onerror = reject;
            document.head.appendChild(script2);
        } else {
            resolve();
        }
    });
}

// Extraire les données de la recette depuis la page
function extractRecipeData() {
    const title = document.querySelector('.recipe-main-title')?.textContent || 'Recette';
    const ingredients = Array.from(document.querySelectorAll('.ingredient-text')).map(el => el.textContent);
    const steps = Array.from(document.querySelectorAll('.step-text')).map(el => el.textContent);
    const categoryBadge = document.querySelector('.category-badge');
    const categoryText = categoryBadge ? categoryBadge.textContent : '';
    
    let timeText = '';
    let servesText = '';
    document.querySelectorAll('.info-chip').forEach(chip => {
        const text = chip.textContent;
        if (chip.classList.contains('info-chip--time')) {
            timeText = text.replace('⏱️ ', '').replace(' prep', '').replace(' + ', '/');
        }
        if (chip.classList.contains('info-chip--serves')) {
            servesText = text.replace('👥 ', '').replace(' pers.', ' personnes');
        }
    });

    const heroImg = document.querySelector('.recipe-hero-image img');
    const imageSrc = heroImg ? heroImg.src : null;

    return {
        title,
        ingredients,
        steps,
        categoryText,
        timeText,
        servesText,
        imageSrc
    };
}

// Créer le container PDF avec le template exact
function createPDFContainer(data) {
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 50px;
        left: 50px;
        width: 794px;
        height: 1123px;
        background: #FFFFFF;
        font-family: Arial, Helvetica, sans-serif;
        color: #1A1A1A;
        overflow: hidden;
        z-index: 9999;
        border: 1px solid #ccc;
    `;
    
    // Photo zone
    const photoHtml = data.imageSrc 
        ? `<img src="${data.imageSrc}" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;" alt="Photo recette">`
        : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#D4C9B5,#B8A68E);display:flex;align-items:center;justify-content:center;font-size:48px;color:#8B7355;">📸</div>`;

    // Ingrédients HTML
    const ingredientItems = data.ingredients.map(ing => 
        `<li style="font-size:14px;line-height:1.5;margin-bottom:6px;padding-left:16px;position:relative;color:#2A2A2A;">
            <span style="position:absolute;left:0;color:#5C5C5C;font-weight:bold;">•</span>
            ${ing}
        </li>`
    ).join('');

    // Étapes HTML
    const stepItems = data.steps.map(step => 
        `<li style="font-size:14px;line-height:1.6;margin-bottom:10px;padding-left:16px;position:relative;color:#2A2A2A;">
            <span style="position:absolute;left:0;color:#5C5C5C;font-weight:bold;">•</span>
            ${step}
        </li>`
    ).join('');

    // Catégorie
    const categoryHtml = data.categoryText 
        ? `<div style="float:right;background:#E8F5E9;color:#2E7D32;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:500;margin-top:12px;">🌱 ${data.categoryText}</div>`
        : '';

    // Icônes SVG simplifiées pour éviter les problèmes de rendu
    const timeIcon = '⏱️';
    const peopleIcon = '👥';

    container.innerHTML = `
        <!-- Photo zone -->
        <div style="width:794px;height:420px;overflow:hidden;">
            ${photoHtml}
        </div>
        
        <!-- Titre zone -->
        <div style="padding:16px 32px 12px;position:relative;height:100px;">
            ${categoryHtml}
            <h1 class="title-font" style="font-family:Georgia,serif;font-size:48px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#1A1A1A;line-height:1.1;margin:0;padding:0;">
                ${data.title}
            </h1>
            <div style="width:20%;height:1.5px;background:#1A1A1A;margin-top:8px;clear:both;"></div>
        </div>
        
        <!-- Contenu en 2 colonnes -->
        <div style="position:absolute;top:520px;left:0;right:0;bottom:2px;">
            <!-- Colonne gauche (ingrédients) -->
            <div style="position:absolute;left:0;top:0;width:302px;bottom:0;background-color:#E8DCC8;padding:20px 24px;box-sizing:border-box;">
                <!-- Infos temps/personnes -->
                <div style="display:flex;justify-content:space-around;margin-bottom:20px;padding-bottom:12px;">
                    <div style="text-align:center;">
                        <div style="font-size:24px;margin-bottom:6px;">${timeIcon}</div>
                        <div style="font-size:14px;color:#3D3D3D;">${data.timeText}</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:24px;margin-bottom:6px;">${peopleIcon}</div>
                        <div style="font-size:14px;color:#3D3D3D;">${data.servesText}</div>
                    </div>
                </div>
                <!-- Liste ingrédients -->
                <ul style="list-style:none;padding:0;margin:0;">
                    ${ingredientItems}
                </ul>
            </div>
            
            <!-- Colonne droite (étapes) -->
            <div style="position:absolute;left:302px;top:0;right:0;bottom:0;background-color:#FFFFFF;padding:0 28px 20px 28px;box-sizing:border-box;">
                <ul style="list-style:none;padding:0;margin:0;">
                    ${stepItems}
                </ul>
            </div>
        </div>
        
        <!-- Barre du bas -->
        <div style="position:absolute;bottom:0;left:0;width:100%;height:1.5px;background:#1A1A1A;"></div>
    `;

    document.body.appendChild(container);
    return container;
}

// Attendre que le rendu soit complet
async function waitForRender(container) {
    // Attendre les images
    const images = container.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
            // Timeout au cas où l'image ne charge pas
            setTimeout(resolve, 3000);
        });
    });

    await Promise.all(imagePromises);
    
    // Petite pause pour s'assurer que tout est rendu
    return new Promise(resolve => setTimeout(resolve, 500));
}