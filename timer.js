document.addEventListener('DOMContentLoaded', () => {
    const timerEl = document.getElementById('anniversary-timer');
    if (!timerEl) return;

    // Date cible : 26 juillet 2026 à 10h00
    // Attention : en JavaScript, les mois commencent à 0 (Janvier = 0, Juillet = 6)
    const targetDate = new Date(2026, 6, 26, 10, 0, 0).getTime();

    function updateTimer() {
        const now = Date.now();
        const diff = targetDate - now;

        if (diff <= 0) {
            timerEl.textContent = "00:00:00:00";
            return;
        }

        // Calcul du temps restant en H:m:s:ms
        // On garde le total des heures (pas de reset à 24) pour un compte à rebours spectaculaire
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        const ms = Math.floor((diff % 1000) / 10); // Affichage sur 2 chiffres (centisecondes) pour éviter un flou illisible

        const pad = (num) => num.toString().padStart(2, '0');

        timerEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(ms)}`;

        requestAnimationFrame(updateTimer);
    }

    requestAnimationFrame(updateTimer);
});
