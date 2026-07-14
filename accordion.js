// Category accordions: collapses card grids behind their title.
// Mobile (<= 992px): all collapsed on load to avoid infinite scrolling;
// desktop: all open. Titles remain clickable everywhere.
document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.matchMedia('(max-width: 992px)').matches;
    const sections = document.querySelectorAll('.category-section:not(#a-plus-tard-section)');

    sections.forEach((section, index) => {
        const title = section.querySelector('.category-title');
        if (!title) return;

        // Wrap everything after the title in a collapsible body
        const body = document.createElement('div');
        body.className = 'category-body';
        const inner = document.createElement('div');
        inner.className = 'category-body-inner';
        body.appendChild(inner);
        while (title.nextSibling) inner.appendChild(title.nextSibling);
        section.appendChild(body);

        // Place count + chevron inside the title
        const count = inner.querySelectorAll('.card').length;
        const meta = document.createElement('span');
        meta.className = 'category-meta';
        meta.innerHTML = `<span class="category-count">${count} places</span><span class="category-chevron" aria-hidden="true">▾</span>`;
        title.appendChild(meta);

        title.setAttribute('role', 'button');
        title.setAttribute('tabindex', '0');

        const setOpen = (open) => {
            section.classList.toggle('collapsed', !open);
            title.setAttribute('aria-expanded', String(open));
        };
        const toggle = () => setOpen(section.classList.contains('collapsed'));

        title.addEventListener('click', toggle);
        title.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });

        setOpen(!isMobile);
    });
});
