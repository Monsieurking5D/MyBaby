// Coeur 3D (Three.js) injecté dans le bouton #enter-btn.
// Chargé en <script type="module"> : si le CDN échoue, le module entier
// est abandonné et le coeur SVG + animation CSS restent en fallback.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const btn = document.getElementById('enter-btn');
const welcomeScreen = document.getElementById('welcome-screen');
if (btn) {
    const SIZE = 170;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.z = 46;

    // failIfMajorPerformanceCaveat : refuse le WebGL logiciel (SwiftShader).
    // Sans GPU matériel (VM, vieux drivers), la boucle de rendu peut geler
    // l'onglet — dans ce cas on lève ici et le coeur SVG reste en fallback.
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'low-power',
            failIfMajorPerformanceCaveat: true,
            preserveDrawingBuffer: true // permet le snapshot toDataURL au clic
        });
    } catch (e) {
        console.warn('Coeur 3D désactivé (pas de GPU matériel) :', e.message);
        throw e; // abandonne le module, fallback emoji
    }
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

    // Le canvas remplace le contenu du bouton (SVG coeur = fallback,
    // conservé pour pouvoir le restaurer si le WebGL lâche)
    const fallbackMarkup = btn.innerHTML;
    btn.classList.add('has-3d');
    btn.textContent = '';
    btn.appendChild(renderer.domElement);

    // GPU instable (perte de contexte WebGL, vu sur VM/vieux drivers :
    // peut geler le compositor et bloquer les transitions CSS) →
    // au premier "context lost", on abandonne le 3D et on remet le SVG.
    renderer.domElement.addEventListener('webglcontextlost', (e) => {
        e.preventDefault(); // pas de tentative de restauration
        cancelAnimationFrame(rafId);
        renderer.domElement.remove();
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        btn.classList.remove('has-3d');
        btn.innerHTML = fallbackMarkup; // l'animation CSS heartSpin reprend
        console.warn('Coeur 3D désactivé après perte de contexte WebGL, retour au coeur SVG.');
    }, { once: true });

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

    // Dès le clic : remplace le canvas WebGL par un snapshot statique.
    // Un canvas WebGL vivant dans l'overlay pendant le fondu peut geler
    // le compositor sur certains GPU (transition bloquée, overlay qui ne
    // part jamais — observé sur la machine de dev). L'image est identique
    // à la dernière frame, le fondu reste visuellement seamless.
    btn.addEventListener('click', () => {
        cancelAnimationFrame(rafId);
        try {
            const img = new Image();
            img.src = renderer.domElement.toDataURL('image/png');
            img.width = SIZE;
            img.height = SIZE;
            renderer.domElement.replaceWith(img);
        } catch (_) {
            renderer.domElement.remove();
            btn.classList.remove('has-3d');
            btn.innerHTML = fallbackMarkup;
        }
        renderer.dispose();
        geometry.dispose();
        material.dispose();
    }, { once: true });
}
