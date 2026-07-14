// Sidebar « Notre Programme » rétractable (desktop uniquement).
// Une languette accrochée au bord gauche de la sidebar la replie/déplie ;
// repliée, la languette reste visible au bord de l'écran avec le compteur.
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.cart-container');
    if (!sidebar) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'cart-toggle';
    toggle.setAttribute('aria-label', 'Replier ou déplier le programme');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.innerHTML = '<span class="cart-toggle-chevron" aria-hidden="true">❯</span><span class="cart-toggle-count" aria-hidden="true">0</span>';
    sidebar.appendChild(toggle);

    const chevron = toggle.querySelector('.cart-toggle-chevron');
    const countBadge = toggle.querySelector('.cart-toggle-count');
    const pageCount = document.getElementById('count');

    // Reflète le compteur du panier sur la languette
    if (pageCount) {
        countBadge.textContent = pageCount.textContent;
        new MutationObserver(() => { countBadge.textContent = pageCount.textContent; })
            .observe(pageCount, { childList: true, characterData: true, subtree: true });
    }

    toggle.addEventListener('click', () => {
        const collapsed = document.body.classList.toggle('cart-collapsed');
        toggle.setAttribute('aria-expanded', String(!collapsed));
        chevron.textContent = collapsed ? '❮' : '❯';
    });
});
