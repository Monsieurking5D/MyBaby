document.addEventListener('DOMContentLoaded', () => {
    // Welcome screen logic
    const welcomeScreen = document.getElementById('welcome-screen');
    const enterBtn = document.getElementById('enter-btn');
    const heartContainer = document.getElementById('heart-container');

    if (heartContainer) {
        setTimeout(() => {
            heartContainer.classList.remove('hidden-heart');
        }, 3800); // Reveal the heart at the end of the flight
    }

    if (enterBtn && welcomeScreen) {
        enterBtn.addEventListener('click', () => {
            welcomeScreen.classList.add('hidden');
            startLibTraverse();  // Start traversing dragonflies once the welcome screen is dismissed
        });
        // Once the fade-out completes, remove the overlay from rendering:
        // frees the compositor layer (will-change) and any residual cost
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
    const MIN_SELECTION = 1;
    const MAX_SELECTION = 3;

    // Supabase (publishable key: safe client-side, RLS only allows inserts)
    const SUPABASE_URL = 'https://pbnnpbbdgqyvrrgswtac.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_F1wWU2_VC3XrYEa5jJSlog_GyVmpwlx';

    // Silent save: she sees nothing, you check the table
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
                console.error('Save failed:', response.status, await response.text());
            }
        } catch (error) {
            console.error('Save impossible:', error);
        }
    }

    // Confetti animation
    // Deferred after paint (setTimeout) and inserted in a single appendChild
    // (DocumentFragment) to avoid blocking the validate click (INP)
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

        // Enable/Disable validate button (1 to 3 selections)
        if (selectedPlaces.length >= MIN_SELECTION) {
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
                btn.textContent = 'Selected';
            } else {
                card.classList.remove('selected');
                btn.textContent = 'Add to plan';
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
                alert(`You've already selected ${MAX_SELECTION} activities!`);
                return;
            }

            // Add to selection
            selectedPlaces.push({ id, name });
            updateCart();
        });
    });

    // Validate button logic
    validateBtn.addEventListener('click', () => {
        if (selectedPlaces.length >= MIN_SELECTION) {
            // Double-click guard: disable before doing anything so a rapid
            // second click can't trigger a duplicate Supabase POST
            if (validateBtn.disabled) return;
            validateBtn.disabled = true;

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

            // Generate WhatsApp message
            const placeNames = selectedPlaces.map(p => p.name).join(", ");
            const message = `Hey my love! ❤️ I've chosen our anniversary plan: ${placeNames}. Can't wait! 🥰`;
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
            const whatsappBtn = document.getElementById('whatsapp-btn');
            if (whatsappBtn) {
                whatsappBtn.href = whatsappUrl;
            }

            // Reveal the "Save for later" calendar section in the background
            const aPlusTardSection = document.getElementById('a-plus-tard-section');
            if (aPlusTardSection) {
                aPlusTardSection.style.display = 'block';
            }
        }
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        // Smooth scroll to the calendar once the modal is closed
        const aPlusTardSection = document.getElementById('a-plus-tard-section');
        if (aPlusTardSection && aPlusTardSection.style.display === 'block') {
            setTimeout(() => {
                aPlusTardSection.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            // Smooth scroll to the calendar once the modal is closed
            const aPlusTardSection = document.getElementById('a-plus-tard-section');
            if (aPlusTardSection && aPlusTardSection.style.display === 'block') {
                setTimeout(() => {
                    aPlusTardSection.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        }
    });

    // ───── Traversing dragonfly ─────
    let libTimer = null;

    function spawnLibellule() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 120 120');
        svg.classList.add('lib-traverse');

        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttribute('href', '#libellule');
        svg.appendChild(use);

        // Random trajectory
        const fromRight = Math.random() > 0.5;
        const y0 = Math.random() * 60 + 12;   // 12–72 vh
        const y1 = Math.random() * 50 + 20;   // 20–70 vh
        const yMid = (y0 + y1) / 2 + (Math.random() * 34 - 17); // arc ±17vh
        const duration = Math.random() * 5000 + 7000; // 7–12 s

        if (fromRight) {
            svg.style.setProperty('--traverse-start-x', 'calc(100vw + 80px)');
            svg.style.setProperty('--traverse-end-x', '-80px');
            svg.style.setProperty('--traverse-start-rot', '12deg');
            svg.style.setProperty('--traverse-end-rot', '-12deg');
        } else {
            svg.style.setProperty('--traverse-start-x', '-80px');
            svg.style.setProperty('--traverse-end-x', 'calc(100vw + 80px)');
            svg.style.setProperty('--traverse-start-rot', '-12deg');
            svg.style.setProperty('--traverse-end-rot', '12deg');
        }

        svg.style.setProperty('--traverse-y0', y0 + 'vh');
        svg.style.setProperty('--traverse-y1', y1 + 'vh');
        svg.style.setProperty('--traverse-ymid', yMid + 'vh');
        svg.style.setProperty('--traverse-duration', duration + 'ms');

        svg.addEventListener('animationend', () => svg.remove());
        document.body.appendChild(svg);
    }

    function scheduleNextLibellule() {
        const delay = Math.random() * 18000 + 22000; // 22–40 s
        libTimer = setTimeout(() => {
            spawnLibellule();
            scheduleNextLibellule();
        }, delay);
    }

    function startLibTraverse() {
        // First dragonfly after 12s, then loop
        libTimer = setTimeout(() => {
            spawnLibellule();
            scheduleNextLibellule();
        }, 12000);
    }
});
