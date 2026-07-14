document.addEventListener('DOMContentLoaded', () => {
    const timerEl = document.getElementById('anniversary-timer');
    if (!timerEl) return;

    // Target date: July 26, 2026 at 10:00 AM
    // Note: JavaScript months are 0-indexed (January = 0, July = 6)
    const targetDate = new Date(2026, 6, 26, 10, 0, 0).getTime();

    function updateTimer() {
        const now = Date.now();
        const diff = targetDate - now;

        if (diff <= 0) {
            timerEl.textContent = "00:00:00:00";
            return;
        }

        // Remaining time in H:m:s:cs
        // We keep total hours (no reset at 24) for a spectacular countdown
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        const cs = Math.floor((diff % 1000) / 10); // Centiseconds for readability

        const pad = (num) => num.toString().padStart(2, '0');

        timerEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(cs)}`;

        requestAnimationFrame(updateTimer);
    }

    requestAnimationFrame(updateTimer);
});
