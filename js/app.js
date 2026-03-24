// === VARIABLES GLOBALES ===
let allRecipes = [];

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer toutes les cartes de recettes
    allRecipes = Array.from(document.querySelectorAll('.recipe-card'));
    
    // Initialiser la recherche
    initSearch();
    
    // Initialiser les filtres
    initFilters();
    
    // Initialiser le PDF (si on est sur une page de recette)
    initPDF();
});

// === RECHERCHE ===
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        filterRecipes(query);
    });
    
    // Bouton de recherche
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.toLowerCase().trim();
            filterRecipes(query);
        });
    }
}

function filterRecipes(query) {
    allRecipes.forEach(card => {
        const title = card.querySelector('.recipe-title').textContent.toLowerCase();
        const isVisible = query === '' || title.includes(query);
        
        card.style.display = isVisible ? 'block' : 'none';
    });
}

// === FILTRES PAR CATÉGORIE ===
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Retirer la classe active des autres boutons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            
            // Filtrer les recettes
            const category = this.dataset.category;
            filterByCategory(category);
        });
    });
}

function filterByCategory(category) {
    allRecipes.forEach(card => {
        const cardCategory = card.dataset.category;
        const isVisible = category === 'all' || cardCategory === category;
        
        card.style.display = isVisible ? 'block' : 'none';
    });
}

// === GÉNÉRATION PDF ===
function initPDF() {
    const pdfBtn = document.querySelector('.pdf-button');
    if (!pdfBtn) return;
    
    // Charger html2pdf.js
    if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js';
        script.onload = function() {
            console.log('html2pdf.js chargé');
        };
        document.head.appendChild(script);
    }
    
    pdfBtn.addEventListener('click', function(e) {
        e.preventDefault();
        generatePDF();
    });
}

function generatePDF() {
    if (!window.html2pdf) {
        alert('Génération PDF en cours de chargement, veuillez réessayer dans quelques secondes.');
        return;
    }
    
    // Créer le conteneur PDF hors-écran
    const pdfContainer = createPDFContainer();
    
    // Ajouter le conteneur au DOM temporairement
    document.body.appendChild(pdfContainer);
    
    // Options PDF
    const options = {
        margin: 0,
        filename: getRecipeTitle() + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true
        },
        jsPDF: { 
            unit: 'px', 
            format: [718, 1048],
            orientation: 'portrait'
        }
    };
    
    // Générer le PDF
    html2pdf().set(options).from(pdfContainer).save().then(() => {
        // Nettoyer : retirer le conteneur temporaire
        document.body.removeChild(pdfContainer);
    }).catch(error => {
        console.error('Erreur génération PDF:', error);
        document.body.removeChild(pdfContainer);
        alert('Erreur lors de la génération du PDF.');
    });
}

function createPDFContainer() {
    const container = document.createElement('div');
    container.className = 'pdf-container';
    
    // Titre de la recette
    const title = document.querySelector('.recipe-main-title');
    const titleClone = title.cloneNode(true);
    container.appendChild(titleClone);
    
    // Ligne décorative
    const decorativeLine = document.createElement('div');
    decorativeLine.className = 'decorative-line';
    decorativeLine.innerHTML = '─── ✿ ───';
    container.appendChild(decorativeLine);
    
    // Photo (placeholder)
    const heroImage = document.querySelector('.recipe-hero-image');
    const imageClone = heroImage.cloneNode(true);
    container.appendChild(imageClone);
    
    // Badges d'info
    const infoBadges = document.querySelector('.recipe-info-badges');
    const badgesClone = infoBadges.cloneNode(true);
    container.appendChild(badgesClone);
    
    // Colonnes ingrédients/instructions
    const columns = document.querySelector('.recipe-columns');
    const columnsClone = columns.cloneNode(true);
    container.appendChild(columnsClone);
    
    // Footer discret
    const footer = document.createElement('div');
    footer.style.textAlign = 'center';
    footer.style.fontSize = '8px';
    footer.style.color = '#7A6B5A';
    footer.style.marginTop = '16px';
    footer.innerHTML = 'Les Recettes de Camille';
    container.appendChild(footer);
    
    return container;
}

function getRecipeTitle() {
    const titleElement = document.querySelector('.recipe-main-title');
    return titleElement ? titleElement.textContent.trim() : 'recette';
}

// === NAVIGATION FLUIDE ===
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll pour les ancres (si besoin plus tard)
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// === AMÉLIORATION UX ===
// Effet de chargement léger sur les cartes
document.addEventListener('DOMContentLoaded', function() {
    const recipeCards = document.querySelectorAll('.recipe-card');
    
    // Animation d'apparition progressive
    recipeCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// === UTILITAIRES ===
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}