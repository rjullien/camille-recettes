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

// Fonction de téléchargement PDF (une seule page A4)
function printRecipe() {
    const recipeTitle = document.querySelector('.recipe-page-title');
    const filename = recipeTitle 
        ? recipeTitle.textContent.trim().replace(/\s+/g, '_') + '.pdf'
        : 'recette.pdf';

    // Récupérer les données de la recette
    const title = recipeTitle ? recipeTitle.textContent.trim() : 'Recette';
    const categoryBadge = document.querySelector('.recipe-category-badge');
    const category = categoryBadge ? categoryBadge.textContent.trim() : '';
    const infoItems = document.querySelectorAll('.recipe-info-item');
    let time = '', persons = '';
    infoItems.forEach(item => {
        const txt = item.textContent.trim();
        if (txt.includes('min') || txt.includes('h')) time = txt.replace('⏱️', '').trim();
        if (txt.includes('personne')) persons = txt.replace('👥', '').trim();
    });

    const ingredients = [];
    document.querySelectorAll('.ingredients-list li').forEach(li => {
        ingredients.push(li.textContent.trim());
    });

    const steps = [];
    document.querySelectorAll('.instructions-list li').forEach(li => {
        steps.push(li.textContent.trim());
    });

    // Vérifier s'il y a une vraie photo ou un placeholder
    const heroImg = document.querySelector('.recipe-hero-image img');
    const hasPhoto = heroImg && !heroImg.src.includes('placeholder');
    const photoHtml = hasPhoto 
        ? `<img src="${heroImg.src}" style="width:100%; height:100%; object-fit:cover;">`
        : `<div style="width:100%; height:100%; background:linear-gradient(135deg, #E8DCC8 0%, #F5F0E8 100%); display:flex; align-items:center; justify-content:center; font-size:2em; color:#7A8471; opacity:0.6;">📸<br><span style="font-size:0.45em; font-style:italic;">Photo à venir</span></div>`;

    // Créer un conteneur temporaire — dimensions fixes A4 (190mm × 277mm zone utile)
    const pdfContainer = document.createElement('div');
    pdfContainer.id = 'pdf-render';
    // Largeur fixe en px correspondant à 190mm @ 96dpi ≈ 718px
    // Hauteur fixe A4 zone utile ≈ 277mm @ 96dpi ≈ 1048px
    pdfContainer.style.cssText = `
        position: fixed; left: -9999px; top: 0;
        width: 718px;
        height: 1048px;
        overflow: hidden;
        font-family: 'Lato', sans-serif;
        color: #3D2B1F;
        background: #FFFFFF;
    `;

    pdfContainer.innerHTML = `
        <div style="height:100%; display:flex; flex-direction:column;">
            <!-- Photo — hauteur réduite pour tout faire tenir -->
            <div style="height:180px; overflow:hidden; border-radius:10px; margin-bottom:10px; position:relative; flex-shrink:0;">
                ${photoHtml}
                ${category ? `<div style="position:absolute; top:8px; right:8px; background:#7A8471; color:white; padding:4px 12px; border-radius:6px; font-size:10px; font-weight:600;">${category}</div>` : ''}
            </div>

            <!-- Titre -->
            <div style="text-align:center; margin-bottom:6px; flex-shrink:0;">
                <h1 style="font-family:'Pacifico',cursive; font-size:22px; color:#3D2B1F; text-decoration:underline; text-decoration-color:#7A8471; text-underline-offset:4px; text-decoration-thickness:2px; margin:0 0 4px 0;">${title}</h1>
                <div style="font-size:11px; opacity:0.7;">🌿 ✨ 🌿</div>
            </div>

            <!-- Infos temps / personnes -->
            <div style="display:flex; justify-content:center; gap:20px; margin-bottom:10px; flex-shrink:0;">
                ${time ? `<div style="background:#F5F0E8; padding:4px 14px; border-radius:6px; font-weight:600; font-size:11px;">⏱️ ${time}</div>` : ''}
                ${persons ? `<div style="background:#F5F0E8; padding:4px 14px; border-radius:6px; font-weight:600; font-size:11px;">👥 ${persons}</div>` : ''}
            </div>

            <!-- 2 colonnes : Ingrédients + Étapes — prend tout l'espace restant -->
            <div style="display:flex; gap:12px; flex:1; min-height:0;">
                <!-- Ingrédients -->
                <div style="flex:1; background:#E8DCC8; padding:12px 14px; border-radius:10px;">
                    <h2 style="font-family:'Pacifico',cursive; font-size:14px; color:#3D2B1F; margin:0 0 8px 0; text-decoration:underline; text-decoration-color:#7A8471; text-underline-offset:3px;">Ingrédients</h2>
                    <ul style="list-style:none; padding:0; margin:0;">
                        ${ingredients.map(ing => `<li style="padding:3px 0; border-bottom:1px solid rgba(61,43,31,0.1); font-size:10px; padding-left:16px; position:relative;"><span style="position:absolute; left:0; font-size:9px;">🌿</span>${ing}</li>`).join('')}
                    </ul>
                </div>
                <!-- Étapes -->
                <div style="flex:1.2; background:#FFFFFF; padding:12px 14px; border-radius:10px; border:1px solid #E8DCC8;">
                    <h2 style="font-family:'Pacifico',cursive; font-size:14px; color:#3D2B1F; margin:0 0 8px 0; text-decoration:underline; text-decoration-color:#7A8471; text-underline-offset:3px;">Préparation</h2>
                    <ol style="list-style:none; padding:0; margin:0;">
                        ${steps.map((step, i) => `<li style="padding:4px 0; border-bottom:1px solid rgba(61,43,31,0.1); font-size:10px; padding-left:24px; position:relative; line-height:1.4;"><span style="position:absolute; left:0; top:4px; background:#7A8471; color:white; width:18px; height:18px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:9px; font-weight:bold;">${i+1}</span>${step}</li>`).join('')}
                    </ol>
                </div>
            </div>

            <!-- Footer -->
            <div style="text-align:center; margin-top:8px; font-size:9px; color:#7A8471; font-style:italic; flex-shrink:0;">
                Fait avec 💚 par Camille
            </div>
        </div>
    `;

    document.body.appendChild(pdfContainer);

    // Générer le PDF avec html2pdf.js
    const opt = {
        margin:       0,
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.95 },
        html2canvas:  { scale: 2, useCORS: true, width: 718, height: 1048 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfContainer).save().then(() => {
        document.body.removeChild(pdfContainer);
    }).catch(err => {
        console.error('Erreur PDF:', err);
        document.body.removeChild(pdfContainer);
        alert('Erreur lors de la génération du PDF. Réessaie !');
    });
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