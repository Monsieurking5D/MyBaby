document.addEventListener('DOMContentLoaded', () => {
    // Welcome screen logic
    const welcomeScreen = document.getElementById('welcome-screen');
    const enterBtn = document.getElementById('enter-btn');
    const heartContainer = document.getElementById('heart-container');

    if (heartContainer) {
        setTimeout(() => {
            heartContainer.classList.remove('hidden-heart');
        }, 3800); // Affiche le coeur à la fin du vol
    }

    if (enterBtn && welcomeScreen) {
        enterBtn.addEventListener('click', () => {
            welcomeScreen.classList.add('hidden');
        });
        // Une fois le fondu terminé, sortir l'overlay du rendu :
        // libère le layer compositeur (will-change) et tout coût résiduel
        welcomeScreen.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'opacity' && welcomeScreen.classList.contains('hidden')) {
                welcomeScreen.style.display = 'none';
            }
        });
    }

    const cards = document.querySelectorAll('.card');
    const selectedList = document.getElementById('selected-list');
    const countDisplay = document.getElementById('count');
    const validateBtn = document.getElementById('validate-btn');
    
    const modal = document.getElementById('confirmation-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const finalItinerary = document.getElementById('final-itinerary');

    let selectedPlaces = [];
    const MAX_SELECTION = 3;

    // Supabase (clé publishable : sûre côté client, RLS n'autorise que l'insertion)
    const SUPABASE_URL = 'https://pbnnpbbdgqyvrrgswtac.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_F1wWU2_VC3XrYEa5jJSlog_GyVmpwlx';

    // Enregistrement silencieux : elle ne voit rien, toi tu consultes la table
    async function sendChoices(places) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/soiree_choices`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ places: places.map(p => p.name) })
            });
            if (!response.ok) {
                console.error('Enregistrement échoué :', response.status, await response.text());
            }
        } catch (error) {
            console.error('Enregistrement impossible :', error);
        }
    }

    // Confetti animation
    // Différée après le paint (setTimeout) et insérée en un seul appendChild
    // (DocumentFragment) pour ne pas bloquer le clic de validation (INP)
    const createConfetti = () => {
        setTimeout(() => {
            const colors = ['#f43f5e', '#e11d48', '#fb7185', '#fda4af', '#fff'];
            const fragment = document.createDocumentFragment();
            const pieces = [];
            for (let i = 0; i < 70; i++) {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.zIndex = '1000';
                confetti.style.pointerEvents = 'none';
                fragment.appendChild(confetti);
                pieces.push(confetti);
            }
            document.body.appendChild(fragment);

            pieces.forEach(confetti => {
                const animation = confetti.animate([
                    { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 1 },
                    { transform: `translate3d(${Math.random()*200 - 100}px, 100vh, 0) rotate(${Math.random()*360}deg)`, opacity: 0 }
                ], {
                    duration: Math.random() * 1500 + 1000,
                    easing: 'cubic-bezier(.37,0,.63,1)'
                });

                animation.onfinish = () => confetti.remove();
            });
        }, 0);
    };

    function updateCart() {
        // Update count
        countDisplay.textContent = selectedPlaces.length;

        // Enable/Disable validate button
        if (selectedPlaces.length === MAX_SELECTION) {
            validateBtn.removeAttribute('disabled');
        } else {
            validateBtn.setAttribute('disabled', 'true');
        }

        // Render list
        selectedList.innerHTML = '';
        selectedPlaces.forEach(place => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${place.name}</span>
                <button class="remove-item" data-id="${place.id}">✕</button>
            `;
            selectedList.appendChild(li);
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Prevent event bubbling if necessary
                e.stopPropagation();
                const id = e.target.getAttribute('data-id');
                removePlace(id);
            });
        });

        // Update cards selection state
        cards.forEach(card => {
            const id = card.getAttribute('data-id');
            const btn = card.querySelector('.select-btn');
            if (selectedPlaces.find(p => p.id === id)) {
                card.classList.add('selected');
                btn.textContent = 'Sélectionné';
            } else {
                card.classList.remove('selected');
                btn.textContent = 'Ajouter au programme';
            }
        });
    }

    function removePlace(id) {
        selectedPlaces = selectedPlaces.filter(p => p.id !== id);
        updateCart();
    }

    cards.forEach(card => {
        const btn = card.querySelector('.select-btn');
        
        btn.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            const name = card.getAttribute('data-place');

            // If already selected, remove it
            if (selectedPlaces.find(p => p.id === id)) {
                removePlace(id);
                return;
            }

            // If not selected, check limit
            if (selectedPlaces.length >= MAX_SELECTION) {
                alert(`Tu as déjà sélectionné tes ${MAX_SELECTION} activités !`);
                return;
            }

            // Add to selection
            selectedPlaces.push({ id, name });
            updateCart();
        });
    });

    // Validate button logic
    validateBtn.addEventListener('click', () => {
        if (selectedPlaces.length === MAX_SELECTION) {
            // Build final itinerary list in modal
            let html = '<ol>';
            selectedPlaces.forEach(p => {
                html += `<li><strong>${p.name}</strong></li>`;
            });
            html += '</ol>';
            finalItinerary.innerHTML = html;

            modal.classList.remove('hidden');
            createConfetti();
            sendChoices(selectedPlaces);
        }
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});
