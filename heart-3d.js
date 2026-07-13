// Coeur 3D (Three.js) injecté dans le bouton #enter-btn.
// Chargé en <script type="module"> : si le CDN échoue, le module entier
// est abandonné et l'emoji ❤️ + animation CSS restent en fallback.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const btn = document.getElementById('enter-btn');
const welcomeScreen = document.getElementById('welcome-screen');
if (btn) {
    const SIZE = 170;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.z = 46;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(SIZE, SIZE);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Silhouette de coeur classique (courbes de Bézier), extrudée en volume
    const shape = new THREE.Shape();
    shape.moveTo(5, 5);
    shape.bezierCurveTo(5, 5, 4, 0, 0, 0);
    shape.bezierCurveTo(-6, 0, -6, 7, -6, 7);
    shape.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
    shape.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
    shape.bezierCurveTo(16, 7, 16, 0, 10, 0);
    shape.bezierCurveTo(7, 0, 5, 5, 5, 5);

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 4,
        curveSegments: 24,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1.6,
        bevelSegments: 10
    });
    geometry.center();

    const material = new THREE.MeshPhysicalMaterial({
        color: 0xe11d48,
        roughness: 0.28,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.15
    });

    const heart = new THREE.Mesh(geometry, material);
    heart.rotation.z = Math.PI; // la forme est dessinée pointe en haut
    const group = new THREE.Group();
    group.add(heart);
    scene.add(group);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(5, 6, 8);
    scene.add(key);
    const rim = new THREE.PointLight(0xff8fab, 60);
    rim.position.set(-7, -4, 7);
    scene.add(rim);

    // Remplace l'emoji : le canvas devient le contenu du bouton
    btn.classList.add('has-3d');
    btn.textContent = '';
    btn.appendChild(renderer.domElement);

    let rafId;
    const start = performance.now();
    const SPIN_MS = 3000;    // un tour complet
    const BEAT_MS = 1500;    // battement

    function render(now) {
        const t = now - start;
        if (!reducedMotion) {
            group.rotation.y = (t / SPIN_MS) * Math.PI * 2;
            // battement doux : deux pulsations par cycle
            const beat = Math.abs(Math.sin((t / BEAT_MS) * Math.PI));
            const s = 1 + 0.07 * beat * beat;
            group.scale.setScalar(s);
        }
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(render);
    }
    rafId = requestAnimationFrame(render);

    // Dès le clic : gèle la boucle de rendu (le coeur part en fondu,
    // inutile de rendre pendant la transition — ça pèse sur l'INP)
    btn.addEventListener('click', () => cancelAnimationFrame(rafId));

    // L'overlay caché → libère le GPU
    if (welcomeScreen) {
        welcomeScreen.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'opacity' && welcomeScreen.classList.contains('hidden')) {
                cancelAnimationFrame(rafId);
                renderer.dispose();
                geometry.dispose();
                material.dispose();
            }
        });
    }
}
