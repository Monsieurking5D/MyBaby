// 3D Heart (Three.js) injected into the #enter-btn button.
// Loaded as <script type="module">: if the CDN fails, the entire module
// is abandoned and the SVG heart + CSS animation remain as fallback.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const btn = document.getElementById('enter-btn');
const welcomeScreen = document.getElementById('welcome-screen');
if (btn) {
    const SIZE = 170;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.z = 46;

    // failIfMajorPerformanceCaveat: refuse software WebGL (SwiftShader).
    // Without a hardware GPU (VM, old drivers), the render loop can freeze
    // the tab — we bail out and the SVG heart stays as fallback.
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'low-power',
            failIfMajorPerformanceCaveat: true,
            preserveDrawingBuffer: true // enables toDataURL snapshot on click
        });
    } catch (e) {
        console.warn('3D heart disabled (no hardware GPU):', e.message);
        throw e; // abandon module, fallback to SVG
    }
    renderer.setSize(SIZE, SIZE);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Classic heart silhouette (Bezier curves), extruded in 3D
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
    heart.rotation.z = Math.PI; // shape is drawn point-up
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

    // The canvas replaces the button content (SVG heart = fallback,
    // preserved so it can be restored if WebGL fails)
    const fallbackMarkup = btn.innerHTML;
    btn.classList.add('has-3d');
    btn.textContent = '';
    btn.appendChild(renderer.domElement);

    // Unstable GPU (WebGL context loss, seen on VMs/old drivers:
    // can freeze the compositor and block CSS transitions) →
    // on first "context lost", we abandon 3D and restore the SVG.
    renderer.domElement.addEventListener('webglcontextlost', (e) => {
        e.preventDefault(); // no restoration attempt
        cancelAnimationFrame(rafId);
        renderer.domElement.remove();
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        btn.classList.remove('has-3d');
        btn.innerHTML = fallbackMarkup; // CSS heartSpin animation resumes
        console.warn('3D heart disabled after WebGL context loss, back to SVG heart.');
    }, { once: true });

    let rafId;
    const start = performance.now();
    const SPIN_MS = 3000;    // one full rotation
    const BEAT_MS = 1500;    // heartbeat

    function render(now) {
        const t = now - start;
        if (!reducedMotion) {
            group.rotation.y = (t / SPIN_MS) * Math.PI * 2;
            // soft beat: two pulses per cycle
            const beat = Math.abs(Math.sin((t / BEAT_MS) * Math.PI));
            const s = 1 + 0.07 * beat * beat;
            group.scale.setScalar(s);
        }
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(render);
    }
    rafId = requestAnimationFrame(render);

    // On click: replace the live WebGL canvas with a static snapshot.
    // A live WebGL canvas inside the fading overlay can freeze the
    // compositor on some GPUs (transition stuck, overlay never closes —
    // observed on dev machine). The image is identical to the last frame,
    // the fade remains visually seamless.
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
