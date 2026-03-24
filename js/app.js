// ===== RECHERCHE ET FILTRES =====
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const recipeCards = document.querySelectorAll('.recipe-card');
    
    let currentCategory = 'all';
    let currentSearch = '';

    // Fonction pour afficher/masquer les recettes
    function filterRecipes() {
        recipeCards.forEach(card => {
            const cardCategory = card.dataset.category || '';
            const cardSearch = card.dataset.search || '';
            
            const matchesCategory = currentCategory === 'all' || cardCategory === currentCategory;
            const matchesSearch = currentSearch === '' || 
                cardSearch.toLowerCase().includes(currentSearch.toLowerCase());
            
            if (matchesCategory && matchesSearch) {
                card.style.display = 'block';
                // Animation d'entrée
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.display = 'none';
            }
        });
        
        // Afficher message si aucun résultat
        updateNoResultsMessage();
    }

    // Message "aucun résultat"
    function updateNoResultsMessage() {
        const visibleCards = Array.from(recipeCards).filter(card => 
            card.style.display !== 'none'
        );
        
        let noResultsMsg = document.querySelector('.no-results');
        
        if (visibleCards.length === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results';
                noResultsMsg.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; color: var(--color-accent);">
                        <div style="font-size: 3rem; margin-bottom: 20px;">🤔</div>
                        <h3 style="font-family: var(--font-script); font-size: 2rem; margin-bottom: 15px; color: var(--color-primary);">
                            Aucune recette trouvée
                        </h3>
                        <p style="font-size: 1.1rem; opacity: 0.8;">
                            Essayez avec d'autres mots-clés ou explorez toutes les catégories !
                        </p>
                    </div>
                `;
                document.getElementById('recipesGrid').appendChild(noResultsMsg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }

    // Gestion de la recherche
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearch = this.value.trim();
            filterRecipes();
        });

        // Animation focus sur la barre de recherche
        searchInput.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
        });

        searchInput.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    }

    // Gestion des filtres par catégorie
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Retirer la classe active de tous les boutons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            
            // Mettre à jour la catégorie courante
            currentCategory = this.dataset.category;
            
            // Filtrer les recettes
            filterRecipes();
            
            // Effet visuel sur le bouton
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Animation des cartes au survol
    recipeCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Animation d'entrée des cartes au chargement
    function animateCardsOnLoad() {
        recipeCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }

    // Démarrer l'animation après un petit délai
    setTimeout(animateCardsOnLoad, 200);
});

// ===== FONCTIONS POUR LES PAGES DE RECETTES =====

// Fonction d'impression
function printRecipe() {
    // Optimiser pour l'impression
    const originalTitle = document.title;
    const recipeTitle = document.querySelector('.recipe-page-title');
    
    if (recipeTitle) {
        document.title = recipeTitle.textContent + ' - Les Recettes de Camille';
    }
    
    // Masquer les éléments non nécessaires
    const elementsToHide = [
        '.recipe-actions',
        '.btn',
        'button'
    ];
    
    elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.style.visibility = 'hidden';
        });
    });
    
    // Lancer l'impression
    window.print();
    
    // Restaurer l'état original
    setTimeout(() => {
        document.title = originalTitle;
        elementsToHide.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.visibility = 'visible';
            });
        });
    }, 500);
}

// Fonction pour revenir à l'accueil
function goHome() {
    window.location.href = '../index.html';
}

// Animations sur les pages de recettes
document.addEventListener('DOMContentLoaded', function() {
    // Animation des sections ingrédients/instructions
    const sections = document.querySelectorAll('.ingredients-section, .instructions-section');
    
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.6s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 200 + 300);
    });

    // Animation de l'image hero
    const heroImage = document.querySelector('.recipe-hero-image');
    if (heroImage) {
        heroImage.style.opacity = '0';
        heroImage.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            heroImage.style.transition = 'all 0.8s ease';
            heroImage.style.opacity = '1';
            heroImage.style.transform = 'scale(1)';
        }, 100);
    }

    // Animation du titre
    const title = document.querySelector('.recipe-page-title');
    if (title) {
        title.style.opacity = '0';
        title.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            title.style.transition = 'all 0.6s ease';
            title.style.opacity = '1';
            title.style.transform = 'translateY(0)';
        }, 200);
    }
});

// Utilitaire pour les interactions tactiles sur mobile
document.addEventListener('DOMContentLoaded', function() {
    // Améliorer l'expérience tactile des boutons
    const buttons = document.querySelectorAll('.btn, .filter-btn, .recipe-link');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
});