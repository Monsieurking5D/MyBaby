// Calendrier post-its « À plus tard » — vanilla JS.
// Elle épingle ses envies (lieux ou texte libre) sur les 2 semaines
// suivant son retour. Persistance locale (localStorage) + envoi
// silencieux Supabase via le bouton « Envoyer mes envies ».
document.addEventListener('DOMContentLoaded', () => {
    const host = document.getElementById('post-it-calendar');
    if (!host) return;

    const SUPABASE_URL = 'https://pbnnpbbdgqyvrrgswtac.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_F1wWU2_VC3XrYEa5jJSlog_GyVmpwlx';
    const STORAGE_KEY = 'planning-pins-v1';
    const START = new Date(2026, 6, 22); // lendemain du retour
    const DAY_COUNT = 14;
    const PASTELS = ['postit-rose', 'postit-peche', 'postit-lavande', 'postit-menthe', 'postit-citron'];

    const dayFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    // Date locale (PAS toISOString : UTC décalerait au jour précédent)
    const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // pins : [{ id, label, day: 'YYYY-MM-DD' | null (= panier) }]
    let pins = [];
    try {
        pins = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        if (!Array.isArray(pins)) pins = [];
    } catch (_) { pins = []; }

    // La section est masquée jusqu'à la validation de la soirée (script.js) —
    // mais si elle revient avec des post-its déjà créés, on la ré-affiche
    if (pins.length > 0) {
        const section = document.getElementById('a-plus-tard-section');
        if (section) section.style.display = 'block';
    }

    const savePins = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
    const pastelFor = (id) => PASTELS[Math.abs([...id].reduce((a, c) => a + c.charCodeAt(0), 0)) % PASTELS.length];
    const rotationFor = (id) => (([...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 7) - 3) + 'deg';

    // ---------- Structure ----------
    host.classList.remove('calendar-placeholder');
    host.classList.add('postit-board');
    host.innerHTML = `
        <svg class="libellule libellule-board" aria-hidden="true" focusable="false"><use href="#libellule"/></svg>
        <div class="postit-create">
            <input id="postit-input" type="text" maxlength="60"
                   placeholder="Ton envie… (choisis un lieu ou écris librement)" list="places-list">
            <datalist id="places-list"></datalist>
            <button id="postit-add" class="select-btn" type="button">Créer un post-it</button>
        </div>
        <div id="postit-tray" class="postit-tray" aria-label="Post-its à placer">
            <p class="tray-hint">Tes post-its apparaissent ici — glisse-les sur un jour</p>
        </div>
        <div id="postit-days" class="postit-days"></div>
        <div class="postit-send-row">
            <button id="postit-send" class="validate-btn" type="button" disabled>Envoyer mes envies</button>
            <span id="postit-sent-msg" class="postit-sent-msg" hidden>C'est noté quelque part…</span>
        </div>
    `;

    const input = host.querySelector('#postit-input');
    const datalist = host.querySelector('#places-list');
    const addBtn = host.querySelector('#postit-add');
    const tray = host.querySelector('#postit-tray');
    const daysEl = host.querySelector('#postit-days');
    const sendBtn = host.querySelector('#postit-send');
    const sentMsg = host.querySelector('#postit-sent-msg');

    // Suggestions = tous les lieux de la page
    document.querySelectorAll('.card[data-place]').forEach(card => {
        const opt = document.createElement('option');
        opt.value = card.getAttribute('data-place');
        datalist.appendChild(opt);
    });

    // Jours
    const cells = new Map();
    for (let i = 0; i < DAY_COUNT; i++) {
        const d = new Date(START);
        d.setDate(START.getDate() + i);
        const iso = isoDate(d);
        const cell = document.createElement('div');
        cell.className = 'postit-day';
        cell.dataset.day = iso;
        cell.innerHTML = `<span class="postit-day-label">${dayFmt.format(d)}</span><div class="postit-day-slot"></div>`;
        daysEl.appendChild(cell);
        cells.set(iso, cell.querySelector('.postit-day-slot'));
    }

    // ---------- Rendu ----------
    function makeNote(pin) {
        const note = document.createElement('div');
        note.className = `postit-note ${pastelFor(pin.id)}`;
        note.style.setProperty('--tilt', rotationFor(pin.id));
        note.dataset.id = pin.id;
        note.innerHTML = `<span class="postit-label"></span><button class="postit-remove" type="button" aria-label="Retirer">✕</button>`;
        note.querySelector('.postit-label').textContent = pin.label;
        note.querySelector('.postit-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            pins = pins.filter(p => p.id !== pin.id);
            savePins();
            renderAll();
        });
        attachDrag(note, pin);
        return note;
    }

    function renderAll() {
        tray.querySelectorAll('.postit-note').forEach(n => n.remove());
        cells.forEach(slot => slot.replaceChildren());
        pins.forEach(pin => {
            const note = makeNote(pin);
            if (pin.day && cells.has(pin.day)) cells.get(pin.day).appendChild(note);
            else tray.appendChild(note);
        });
        tray.classList.toggle('is-empty', !pins.some(p => !p.day));
        sendBtn.disabled = pins.length === 0;
    }

    // ---------- Création ----------
    function addPin() {
        const label = input.value.trim();
        if (!label) { input.focus(); return; }
        pins.push({ id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), label, day: null });
        input.value = '';
        savePins();
        renderAll();
    }
    addBtn.addEventListener('click', addPin);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addPin(); });

    // ---------- Drag (Pointer Events, souris + tactile) ----------
    function attachDrag(note, pin) {
        note.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.postit-remove')) return;
            e.preventDefault();
            const ghost = note.cloneNode(true);
            const rect = note.getBoundingClientRect();
            ghost.classList.add('postit-ghost');
            ghost.style.width = rect.width + 'px';
            ghost.style.left = (e.clientX - rect.width / 2) + 'px';
            ghost.style.top = (e.clientY - rect.height / 2) + 'px';
            document.body.appendChild(ghost);
            note.classList.add('postit-dragging');

            let hovered = null;
            const move = (ev) => {
                ghost.style.left = (ev.clientX - rect.width / 2) + 'px';
                ghost.style.top = (ev.clientY - rect.height / 2) + 'px';
                ghost.style.display = 'none';
                const under = document.elementFromPoint(ev.clientX, ev.clientY);
                ghost.style.display = '';
                const cell = under && under.closest('.postit-day');
                if (hovered && hovered !== cell) hovered.classList.remove('postit-day-hover');
                if (cell) cell.classList.add('postit-day-hover');
                hovered = cell;
            };
            const up = (ev) => {
                document.removeEventListener('pointermove', move);
                document.removeEventListener('pointerup', up);
                document.removeEventListener('pointercancel', up);
                ghost.remove();
                note.classList.remove('postit-dragging');
                if (hovered) hovered.classList.remove('postit-day-hover');
                ghost.style.display = 'none';
                const under = document.elementFromPoint(ev.clientX, ev.clientY);
                const cell = under && under.closest('.postit-day');
                const overTray = under && under.closest('.postit-tray');
                if (cell) pin.day = cell.dataset.day;
                else if (overTray) pin.day = null;
                savePins();
                renderAll();
            };
            document.addEventListener('pointermove', move);
            document.addEventListener('pointerup', up);
            document.addEventListener('pointercancel', up);
        });
    }

    // ---------- Envoi Supabase (silencieux, comme sendChoices) ----------
    sendBtn.addEventListener('click', async () => {
        if (pins.length === 0) return;
        sendBtn.disabled = true;
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/planning_pins`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ pins: pins.map(p => ({ day: p.day, label: p.label })) })
            });
            if (!response.ok) console.error('Envoi planning échoué :', response.status, await response.text());
        } catch (error) {
            console.error('Envoi planning impossible :', error);
        }
        // Quoi qu'il arrive : petit message doux, jamais d'erreur visible
        sentMsg.hidden = false;
        setTimeout(() => { sentMsg.hidden = true; sendBtn.disabled = pins.length === 0; }, 4000);
    });

    renderAll();
});
