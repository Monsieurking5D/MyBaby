// "Our Plan" sidebar:
// - desktop: tab on the left edge of the fixed panel → collapse/expand
// - mobile: floating button (heart + counter) → panel slides in as a
//   drawer from the right, dimmed backdrop, tap outside to close
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.cart-container');
    if (!sidebar) return;

    const badges = [];
    const pageCount = document.getElementById('count');
    const syncBadges = () => badges.forEach(b => { b.textContent = pageCount.textContent; });

    // ---------- Desktop tab ----------
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'cart-toggle';
    toggle.setAttribute('aria-label', 'Collapse or expand the plan');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.innerHTML = '<svg class="cart-toggle-chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 18 6-6-6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="cart-toggle-count" aria-hidden="true">0</span>';
    sidebar.appendChild(toggle);
    badges.push(toggle.querySelector('.cart-toggle-count'));

    const chevron = toggle.querySelector('.cart-toggle-chevron');
    toggle.addEventListener('click', () => {
        const collapsed = document.body.classList.toggle('cart-collapsed');
        toggle.setAttribute('aria-expanded', String(!collapsed));
        chevron.classList.toggle('is-collapsed', collapsed);
    });

    // ---------- Mobile drawer ----------
    const backdrop = document.createElement('div');
    backdrop.className = 'cart-backdrop';
    document.body.appendChild(backdrop);

    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'cart-fab';
    fab.setAttribute('aria-label', 'View our plan');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = '<svg class="cart-fab-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#icon-heart"/></svg><span class="cart-fab-count" aria-hidden="true">0</span>';
    document.body.appendChild(fab);
    badges.push(fab.querySelector('.cart-fab-count'));

    const setDrawer = (open) => {
        document.body.classList.toggle('cart-open', open);
        fab.setAttribute('aria-expanded', String(open));
    };

    fab.addEventListener('click', () => {
        if (window.innerWidth > 992) {
            // On desktop, the FAB reopens the collapsed sidebar
            const collapsed = document.body.classList.toggle('cart-collapsed');
            toggle.setAttribute('aria-expanded', String(!collapsed));
            chevron.classList.toggle('is-collapsed', collapsed);
        } else {
            // On mobile, the FAB toggles the drawer
            setDrawer(!document.body.classList.contains('cart-open'));
        }
    });
    backdrop.addEventListener('click', () => setDrawer(false));
    // Validating from the drawer: close it to make room for the modal
    const validateBtn = document.getElementById('validate-btn');
    if (validateBtn) validateBtn.addEventListener('click', () => setDrawer(false));

    // ---------- Shared counter ----------
    if (pageCount) {
        syncBadges();
        new MutationObserver(syncBadges)
            .observe(pageCount, { childList: true, characterData: true, subtree: true });
    }
});
