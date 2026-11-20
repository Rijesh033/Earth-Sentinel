import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const LABEL = { moon: 'MOON ANALOG', mars: 'MARS ANALOG', both: 'MOON + MARS' };
const COL = { moon: 0xdfe8f7, mars: 0xff6b4a, both: 0xffb347 };
const R = 2;

/* ---------------- SCENE ---------------- */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, .1, 500);
camera.position.set(0, 1.5, 30);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 3.2;
controls.maxDistance = 12;
controls.enablePan = false;
controls.rotateSpeed = .5;

// STARS
const dotC = document.createElement('canvas');
dotC.width = dotC.height = 64;
{
    const x = dotC.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, '#fff');
    g.addColorStop(.25, 'rgba(255,255,255,.8)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
}
const dotTex = new THREE.CanvasTexture(dotC);
const starLayers = [];

function starLayer(n, size, minR, maxR, bandBias) {
    const g = new THREE.BufferGeometry();
    const a = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);

    for (let i = 0; i < n; i++) {
        const v = new THREE.Vector3().randomDirection();

        if (bandBias && Math.random() < bandBias) {
            v.y *= .12;
            v.normalize();
            v.applyAxisAngle(new THREE.Vector3(1, 0, 1).normalize(), .6);
        }

        v.multiplyScalar(minR + Math.random() * (maxR - minR));
        a.set([v.x, v.y, v.z], i * 3);

        const k = Math.random();
        const c = new THREE.Color().setHSL(
            k < .2 ? .08 : k < .7 ? .6 : .55,
            .6,
            .65 + Math.random() * .35
        );
        col.set([c.r, c.g, c.b], i * 3);
    }

    g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const p = new THREE.Points(
        g,
        new THREE.PointsMaterial({
            size,
            map: dotTex,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: .95,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        })
    );

    scene.add(p);
    starLayers.push(p);
    return p;
}

var stars = starLayer(9000, .6, 120, 260, .45);
starLayer(1800, 1.5, 110, 200, .2);
starLayer(250, 3.4, 100, 180, 0);

// SHOOTING STARS
const shooters = [];

function shoot() {
    const start = new THREE.Vector3()
        .randomDirection()
        .multiplyScalar(90);

    start.y = Math.abs(start.y) + 10;

    const dir = new THREE.Vector3(
        Math.random() - .5,
        -Math.random() * .5 - .1,
        Math.random() - .5
    ).normalize();

    const geo = new THREE.BufferGeometry()
        .setFromPoints([start.clone(), start.clone()]);

    const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({
            color: 0xcfefff,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        })
    );

    line.frustumCulled = false;
    scene.add(line);
    shooters.push({ line, start, dir, life: 0 });
}

setInterval(() => {
    if (document.hidden) return;
    shoot();
    if (Math.random() < .4) setTimeout(shoot, 250);
}, 2600);


// COSMIC GLOWING ORB + STAR TRAIL
const dot = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
const tc = document.getElementById('trail');
const tx = tc.getContext('2d');

let mx = innerWidth / 2;
let my = innerHeight / 2;
let rx = mx;
let ry = my;
let parts = [];

function sizeTrail() {
    tc.width = innerWidth;
    tc.height = innerHeight;
}

sizeTrail();

addEventListener('pointermove', e => {
    mx = e.clientX;
    my = e.clientY;

    // Create tiny sparkling stars
    for (let i = 0; i < 3; i++) {
        parts.push({
            x: mx + (Math.random() - .5) * 12,
            y: my + (Math.random() - .5) * 12,
            vx: (Math.random() - .5) * 1.5,
            vy: (Math.random() - .5) * 1.5,
            l: 1,
            s: Math.random() * 2.5 + 1,
            h: Math.random() < .2 ? 45 : 190,
            phase: Math.random() * Math.PI * 2
        });
    }

    const el = e.target;

    ring.classList.toggle(
        'hov',
        !!(el.closest && el.closest('.btn,.item,.x'))
    );
});

addEventListener('pointerdown', () => ring.classList.add('drag'));
addEventListener('pointerup', () => ring.classList.remove('drag'));

function cursorFrame() {
    rx += (mx - rx) * .18;
    ry += (my - ry) * .18;

    // Move the glowing orb and its outer halo
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;

    tx.clearRect(0, 0, tc.width, tc.height);
    tx.globalCompositeOperation = 'lighter';

    parts = parts.filter(p => p.l > 0);

    for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.l -= .018;
        p.phase += .12;

        const glow = p.l * (0.7 + Math.sin(p.phase) * .3);

        tx.save();
        tx.translate(p.x, p.y);
        tx.globalAlpha = glow;
        tx.strokeStyle = `hsl(${p.h}, 100%, 80%)`;
        tx.shadowBlur = 12;
        tx.shadowColor = `hsl(${p.h}, 100%, 70%)`;
        tx.lineWidth = 1;

        // Four-point star sparkle
        tx.beginPath();
        tx.moveTo(0, -p.s * 2);
        tx.lineTo(0, p.s * 2);
        tx.moveTo(-p.s * 2, 0);
        tx.lineTo(p.s * 2, 0);
        tx.stroke();

        // Bright centre
        tx.fillStyle = '#ffffff';
        tx.beginPath();
        tx.arc(0, 0, p.s * .45, 0, Math.PI * 2);
        tx.fill();

        tx.restore();
    }

    requestAnimationFrame(cursorFrame);
}

cursorFrame();


// NEBULA BACKGROUND
{
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const x = c.getContext('2d');

    [
        [150, 200, 'rgba(60,90,255,.28)'],
        [380, 320, 'rgba(255,80,160,.18)'],
        [260, 120, 'rgba(80,240,255,.14)']
    ].forEach(([px, py, col]) => {
        const g = x.createRadialGradient(px, py, 0, px, py, 230);
        g.addColorStop(0, col);
        g.addColorStop(1, 'transparent');
        x.fillStyle = g;
        x.fillRect(0, 0, 512, 512);
    });

    const m = new THREE.Mesh(
        new THREE.SphereGeometry(220, 32, 32),
        new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(c),
            side: THREE.BackSide,
            transparent: true,
            opacity: .8,
            depthWrite: false
        })
    );

    scene.add(m);
}
// LIGHTING
const sun = new THREE.DirectionalLight(0xfff1dd, 3.2);
sun.position.set(-12, 5, 10);
scene.add(sun);
scene.add(new THREE.AmbientLight(0x1a2a55, .7));

// PROCEDURAL TEXTURES
function noiseTex(base, hi, seed, craters) {
    const w = 1024;
    const h = 512;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;

    const x = c.getContext('2d');
    x.fillStyle = base;
    x.fillRect(0, 0, w, h);

    let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;

    for (let i = 0; i < 2600; i++) {
        const r = rnd() * 40 + 4;
        const px = rnd() * w;
        const py = rnd() * h;

        const g = x.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, hi + (rnd() * .14) + ')');
        g.addColorStop(1, 'rgba(0,0,0,0)');

        x.fillStyle = g;
        x.fillRect(px - r, py - r, r * 2, r * 2);
    }

    for (let i = 0; i < craters; i++) {
        const r = rnd() * rnd() * 28 + 2;
        const px = rnd() * w;
        const py = rnd() * h;

        x.beginPath();
        x.arc(px, py, r, 0, 7);
        x.fillStyle = 'rgba(0,0,0,.28)';
        x.fill();

        x.beginPath();
        x.arc(px - r * .15, py - r * .15, r * .92, 0, 7);
        x.fillStyle = 'rgba(255,255,255,.07)';
        x.fill();
    }

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

// TEXTURE LOADER
const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

const ANI = renderer.capabilities.getMaxAnisotropy();

function tryLoad(mat, url, key) {
    loader.load(
        url,
        t => {
            if (key === 'map') t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = ANI;
            mat[key] = t;
            mat.needsUpdate = true;
        },
        undefined,
        () => {
            console.warn('Texture could not load:', url);
        }
    );
}

const E4 = 'https://cdn.jsdelivr.net/gh/turban/webgl-earth@master/images/';
const NIGHT = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg';

// Solar System Scope lunar surface texture (8192 x 4096, CC BY 4.0)
// Credit: Solar System Scope — https://www.solarsystemscope.com/textures/
const MOON4K = './8k_moon.jpg';

const MARS4K = './8k_mars.jpg';

// ATMOSPHERE
const atmoMat = col => new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,

    uniforms: {
        c: { value: new THREE.Color(col) }
    },

    vertexShader: `
        varying vec3 n;
        varying vec3 v;

        void main() {
            n = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.);
            v = -mv.xyz;
            gl_Position = projectionMatrix * mv;
        }
    `,

    fragmentShader: `
        uniform vec3 c;
        varying vec3 n;
        varying vec3 v;

        void main() {
            float d = clamp(
                -dot(normalize(n), normalize(v)),
                0.,
                1.
            );
            float i = pow(d, 2.4) * 1.5;
            gl_FragColor = vec4(c * i, 1.);
        }
    `
});

// PLANETS
const PL = {};

function makePlanet(key) {
    const g = new THREE.Group();
    let mat, atm;

    if (key === 'earth') {
        mat = new THREE.MeshPhongMaterial({
            map: noiseTex('#0a2a5a', 'rgba(40,120,70,', 7, 0),
            bumpScale: .035,
            specular: new THREE.Color(0x3a5878),
            shininess: 22
        });

        tryLoad(mat, E4 + '2_no_clouds_4k.jpg', 'map');
        tryLoad(mat, E4 + 'elev_bump_4k.jpg', 'bumpMap');
        tryLoad(mat, E4 + 'water_4k.png', 'specularMap');

        const clouds = new THREE.Mesh(
            new THREE.SphereGeometry(R * 1.012, 96, 96),
            new THREE.MeshPhongMaterial({
                transparent: true,
                opacity: .85,
                depthWrite: false
            })
        );

        tryLoad(clouds.material, E4 + 'fair_clouds_4k.png', 'map');
        g.userData.clouds = clouds;
        g.add(clouds);

        const nm = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,

            uniforms: {
                t: { value: null },
                sun: { value: sun.position.clone().normalize() }
            },

            vertexShader: `
                varying vec2 u;
                varying vec3 w;

                void main() {
                    u = uv;
                    w = normalize(mat3(modelMatrix) * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
                }
            `,

            fragmentShader: `
                uniform sampler2D t;
                uniform vec3 sun;
                varying vec2 u;
                varying vec3 w;

                void main() {
                    float k = smoothstep(.05, -.25, dot(normalize(w), sun));
                    gl_FragColor = vec4(texture2D(t, u).rgb * k * 1.5, 1.);
                }
            `
        });

        loader.load(NIGHT, t => {
            t.anisotropy = ANI;
            nm.uniforms.t.value = t;
            g.add(new THREE.Mesh(
                new THREE.SphereGeometry(R * 1.003, 96, 96),
                nm
            ));
        }, undefined, () => { });

        atm = 0x4aa8ff;

    } else if (key === 'moon') {

        // REALISTIC MOON SURFACE
        // Use a real lunar color texture.
        // Do not use the same color image as a bump map.

        mat = new THREE.MeshStandardMaterial({
            roughness: 1,
            metalness: 0,
            color: 0xe5e5e5
        });

        tryLoad(mat, MOON4K, 'map');

        atm = 0x8899bb;

    } else {

        mat = new THREE.MeshStandardMaterial({
            map: noiseTex('#9a4a2a', 'rgba(235,150,90,', 11, 500),
            roughness: 1
        });

        mat.bumpScale = .35;
        tryLoad(mat, MARS4K, 'map');
        tryLoad(mat, MARS4K, 'bumpMap');

        atm = 0xff7a4a;
    }

    g.add(new THREE.Mesh(
        new THREE.SphereGeometry(R, 192, 192),
        mat
    ));

    const a = new THREE.Mesh(
        new THREE.SphereGeometry(R * 1.12, 64, 64),
        atmoMat(atm)
    );

    g.add(a);
    g.userData.markers = [];

    SITES[key].forEach(s => {
        const p = ll(s.lat, s.lon, R * 1.005);
        const col = COL[s.t];

        const m = new THREE.Mesh(
            new THREE.SphereGeometry(.035, 16, 16),
            new THREE.MeshBasicMaterial({ color: col })
        );

        m.position.copy(p);
        m.userData.site = s;

        const ring = new THREE.Mesh(
            new THREE.RingGeometry(.06, .075, 32),
            new THREE.MeshBasicMaterial({
                color: col,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: .9,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );

        ring.position.copy(p);
        ring.lookAt(p.clone().multiplyScalar(2));

        const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(.004, .004, .45, 6),
            new THREE.MeshBasicMaterial({
                color: col,
                transparent: true,
                opacity: .6,
                blending: THREE.AdditiveBlending
            })
        );

        beam.position.copy(
            p.clone().multiplyScalar(1 + .225 / R / 1.005)
        );

        beam.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            p.clone().normalize()
        );

        g.add(m, ring, beam);
        g.userData.markers.push({ m, ring, beam, s });
    });

    g.visible = false;
    scene.add(g);
    PL[key] = g;
}

function ll(lat, lon, r) {
    const phi = (90 - lat) * Math.PI / 180;
    const th = (lon + 180) * Math.PI / 180;

    return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(th),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(th)
    );
}

['earth', 'moon', 'mars'].forEach(makePlanet);

/* ---------------- STATE / UI ---------------- */

let cur = 'earth';
let sel = null;
let fly = null;
let entered = false;
let auto = true;
let intro = null;
let hl = null;
let listMode = 'sites';
let q = '';
let tour = null;

const $ = id => document.getElementById(id);

/* BACK BUTTON */
const backButton = document.createElement('button');
backButton.id = 'previousPageBtn';
backButton.className = 'btn';
backButton.textContent = '← BACK';

Object.assign(backButton.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '1',
});

document.body.appendChild(backButton);

const pageHistory = [];

const backStyle = document.createElement('style');
backStyle.textContent = `
    #previousPageBtn {
        background: rgba(5, 15, 35, .85);
        border: 1px solid rgba(94, 231, 255, .5);
        color: #dfdaff;
        cursor: pointer;
    }
`;
document.head.appendChild(backStyle);


function stopTour() {
    if (tour) {
        clearInterval(tour);
        tour = null;
    }

    const b = $('tourBtn');
    b.classList.remove('on');
    b.textContent = '▶ GUIDED TOUR';
}

function show(key, remember = true) {
    if (remember && entered && cur !== key) {
        pageHistory.push(cur);
    }
    stopTour();
    q = '';

    Object.entries(PL).forEach(([k, v]) => {
        v.visible = k === key;
    });

    cur = key;
    sel = null;

    document.querySelectorAll('#planets .btn').forEach(b => {
        if (b.dataset.p) {
            b.classList.toggle('on', b.dataset.p === key);
        }
    });

    $('stat').textContent =
        'Orbit locked · ' + key.charAt(0).toUpperCase() + key.slice(1);

    $('panel').classList.remove('open');
    auto = true;
    buildList();
}

function buildList() {
    const l = $('list');

    const titles = {
        earth: 'ANALOG SITES ON EARTH',
        moon: 'MOON BASE CANDIDATES',
        mars: 'MARS LANDING ZONES'
    };

    l.innerHTML =
        '<h4>' + titles[cur] + '</h4>' +
        '<input id="q" placeholder="Search sites..." style="width:100%;margin:2px 0 8px;padding:9px 12px;border-radius:9px;border:1px solid rgba(94,231,255,.3);background:rgba(8,14,30,.7);color:#fff;font-size:13px;outline:none">' +
        '<div id="items"></div>';

    $('q').oninput = e => {
        q = e.target.value;
        renderItems();
    };

    renderItems();
}

function renderItems() {
    const box = $('items');
    box.innerHTML = '';

    const k = q.trim().toLowerCase();

    SITES[cur]
        .filter(s => !k || (s.n + ' ' + s.c).toLowerCase().includes(k))
        .forEach(s => {
            const d = document.createElement('div');

            d.className = 'item' + (sel && sel.id === s.id ? ' on' : '');
            d.dataset.id = s.id;

            d.innerHTML =
                '<span>' + s.n + '</span>' +
                '<span class="tag ' + s.t + '">' +
                LABEL[s.t].split(' ')[0] +
                (s.t === 'both' ? '+' : '') +
                '</span>';

            d.onclick = () => select(s);
            box.appendChild(d);
        });

    if (!box.children.length) {
        box.innerHTML =
            '<div style="padding:10px;font-size:12px;color:#7e94b8">No site matches.</div>';
    }
}

function find(key, id) {
    return SITES[key].find(x => x.id === id);
}
function select(s) {
    sel = s;
    auto = false;

    document.querySelectorAll('.item').forEach(i => {
        i.classList.toggle('on', i.dataset.id === s.id);
    });

    const w = ll(s.lat, s.lon, 1).normalize();
    const g = PL[cur];
    const dir = w.clone().applyQuaternion(g.quaternion);

    fly = {
        t: 0,
        from: camera.position.clone(),
        to: dir.multiplyScalar(5.2).add(new THREE.Vector3(0, .4, 0))
    };

    const links = [];

    if (cur === 'earth') {
        if (s.moon) links.push(['moon', s.moon, 'Moon site']);
        if (s.mars) links.push(['mars', s.mars, 'Mars site']);
    }

    $('pc').innerHTML =
        '<span class="tag ' + s.t + '">' + LABEL[s.t] + '</span>' +
        '<h2>' + s.n + '</h2>' +
        '<div class="loc">' + s.c + ' · ' +
        s.lat.toFixed(2) + '°, ' + s.lon.toFixed(2) + '°</div>' +
        '<div class="stats">' +
        s.st.map(x =>
            '<div class="stat"><small>' + x[0] +
            '</small><b>' + x[1] + '</b></div>'
        ).join('') +
        '</div>' +
        '<h5>WHY IT MATTERS FOR SPACE</h5><p>' + s.s + '</p>' +
        '<h5>REAL-WORLD PROBLEM IT HELPS SOLVE</h5><p class="problem">' + s.p + '</p>' +
        (links.length
            ? '<h5>COMPARE WITH ITS OFF-WORLD TWIN</h5><div class="cmp">' +
            links.map(l =>
                '<button class="btn" data-k="' + l[0] +
                '" data-i="' + l[1] + '">→ ' +
                find(l[0], l[1]).n.toUpperCase() +
                '</button>'
            ).join('') + '</div>'
            : '');

    $('pc').querySelectorAll('.cmp .btn').forEach(b => {
        b.onclick = () => {
            show(b.dataset.k);
            select(find(b.dataset.k, b.dataset.i));
        };
    });

    $('panel').classList.add('open');
}

document.querySelectorAll('#planets .btn[data-p]').forEach(b => {
    b.onclick = () => {
        hl = null;
        show(b.dataset.p);
    };
});

$('probBtn').onclick = () => {
    stopTour();
    hl = null;
    showProblemMenu();
};

$('cmpBtn').onclick = () => {
    stopTour();
    showCompare();
};

$('tourBtn').onclick = () => {
    if (tour) {
        stopTour();
        return;
    }

    hl = null;
    const list = SITES[cur];
    let n = 0;

    const step = () => select(list[n++ % list.length]);

    step();
    tour = setInterval(step, 7000);

    $('tourBtn').classList.add('on');
    $('tourBtn').textContent = '■ STOP TOUR';
};

$('close').onclick = () => {
    stopTour();
    $('panel').classList.remove('open');
    sel = null;
    hl = null;
    auto = true;

    document.querySelectorAll('.item').forEach(i => {
        i.classList.remove('on');
    });
};

$('enter').onclick = () => {
    $('intro').classList.add('hide');
    document.body.classList.add('on');
    entered = true;
    intro = { t: 0 };
    backButton.style.display = 'block';
};

/* ---- FIND BY PROBLEM + COMPARE ---- */

const PROB = [
    {
        id: 'water',
        n: 'Water & food scarcity',
        w: 'Dry and extreme places teach us to get water from air, soil and brine and to grow food with almost nothing.',
        r: 'Helps farming communities and drought regions worldwide.',
        sites: ['atacama', 'dryvalleys', 'mdrs', 'hiseas', 'danakil']
    },
    {
        id: 'energy',
        n: 'Clean & off-grid energy',
        w: 'Habitats far from any grid must run on solar, geothermal and stored power, and battery minerals are mined in places like these.',
        r: 'Helps remote villages and islands cut diesel use.',
        sites: ['uyuni', 'hiseas', 'lanzarote', 'askja', 'riotinto']
    },
    {
        id: 'disaster',
        n: 'Disaster response & extreme shelter',
        w: 'Crews test shelters, rovers and rescue routines in heat, cold, ash and isolation.',
        r: 'Helps relief teams and people in harsh climates.',
        sites: ['danakil', 'dryvalleys', 'askja', 'lanzarote', 'atacama']
    },
    {
        id: 'train',
        n: 'Astronaut & crew training',
        w: 'Isolated habitats and crater fields let crews practise teamwork, EVA and repairs before real missions.',
        r: 'Helps any team working in long isolation, such as polar and offshore crews.',
        sites: ['haughton', 'hiseas', 'mdrs', 'craters', 'meteor', 'lanzarote']
    },
    {
        id: 'edu',
        n: 'Education & outreach',
        w: 'Open field stations and visitor sites let students and the public see planetary science up close.',
        r: 'Helps schools bring space science into class.',
        sites: ['mdrs', 'hiseas', 'craters', 'meteor', 'haughton']
    }
];

function showProblemMenu() {
    $('pc').innerHTML =
        '<span class="tag both">FIND BY PROBLEM</span>' +
        '<h2>What problem do you care about?</h2>' +
        '<p style="margin-top:8px">Pick one. The Earth sites that help solve it light up in white.</p>' +
        '<div class="cmp" style="flex-direction:column">' +
        PROB.map(p =>
            '<button class="btn" data-p="' + p.id +
            '" style="text-align:left">' + p.n.toUpperCase() +
            '</button>'
        ).join('') +
        '</div>';

    $('pc').querySelectorAll('.cmp .btn').forEach(b => {
        b.onclick = () => showProblem(PROB.find(p => p.id === b.dataset.p));
    });

    $('panel').classList.add('open');
}

function showProblem(p) {
    if (cur !== 'earth') show('earth');

    hl = new Set(p.sites);
    auto = false;
    sel = null;

    $('pc').innerHTML =
        '<span class="tag both">PROBLEM</span>' +
        '<h2>' + p.n + '</h2>' +
        '<h5>HOW ANALOG SITES HELP</h5><p>' + p.w + '</p>' +
        '<h5>REAL-WORLD PAYOFF</h5><p class="problem">' + p.r + '</p>' +
        '<h5>SITES · TAP TO FLY THERE</h5><div class="cmp">' +
        p.sites.map(id =>
            '<button class="btn" data-i="' + id + '">' +
            find('earth', id).n.toUpperCase() +
            '</button>'
        ).join('') +
        '</div>' +
        '<div class="cmp" style="margin-top:16px">' +
        '<button class="btn" id="back">← ALL PROBLEMS</button>' +
        '</div>';

    $('pc').querySelectorAll('.cmp .btn[data-i]').forEach(b => {
        b.onclick = () => select(find('earth', b.dataset.i));
    });

    $('back').onclick = () => {
        hl = null;
        showProblemMenu();
    };

    $('panel').classList.add('open');
}

function showCompare() {
    hl = null;

    const rows = [
        ['Gravity', '9.81 m/s²', '1.62 m/s²', '3.71 m/s²'],
        ['Day length', '24 h', '29.5 Earth days', '24 h 37 min'],
        ['Temperature', '15 °C avg', '−170 to +120 °C', '−60 °C avg'],
        ['Air pressure', '1 bar', 'almost none', '~0.006 bar'],
        ['Radiation', 'Shielded', 'Unshielded', 'Mostly unshielded'],
        ['Signal delay', '—', '~1.3 s', '~3–22 min'],
        ['Trip time', '—', '~3 days', '~6–9 months']
    ];

    $('pc').innerHTML =
        '<span class="tag both">COMPARE WORLDS</span>' +
        '<h2>Earth vs Moon vs Mars</h2>' +
        '<table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:12px">' +
        '<tr style="color:#5ee7ff;font-family:Orbitron;font-size:10px">' +
        '<th></th><th>EARTH</th><th>MOON</th><th>MARS</th></tr>' +
        rows.map(r =>
            '<tr style="border-top:1px solid rgba(94,231,255,.15)">' +
            '<td style="padding:7px 4px;color:#8fa6c7">' + r[0] + '</td>' +
            r.slice(1).map(x =>
                '<td style="padding:7px 4px">' + x + '</td>'
            ).join('') +
            '</tr>'
        ).join('') +
        '</table>' +
        '<h5>YOUR WEIGHT ON EACH WORLD</h5>' +
        '<input id="wt" type="number" value="60" min="1" style="width:90px;padding:8px;border-radius:8px;border:1px solid rgba(94,231,255,.4);background:rgba(8,14,30,.7);color:#fff">' +
        ' kg on Earth<div class="stats" id="wout"></div>';

    const upd = () => {
        const v = +$('wt').value || 0;

        $('wout').innerHTML = [
            ['Moon', .1654],
            ['Mars', .3794]
        ].map(x =>
            '<div class="stat"><small>' + x[0] +
            '</small><b>' + (v * x[1]).toFixed(1) +
            ' kg</b></div>'
        ).join('');
    };

    $('wt').oninput = upd;
    upd();

    $('panel').classList.add('open');
}
/* ---------------- LOOP ---------------- */

const clock = new THREE.Clock();
const wp = new THREE.Vector3();

show('earth');

function ease(t) {
    return 1 - Math.pow(1 - t, 4);
}

function loop() {
    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    const g = PL[cur];

    if (auto || !entered) {
        g.rotation.y += dt * (entered ? .05 : .12);
    }

    const e0 = entered ? (intro ? ease(intro.t) : 1) : 0;
    const hw = Math.tan(22.5 * Math.PI / 180) * 8.5 * camera.aspect;

    g.position.x = (1 - e0) * hw;
    g.scale.setScalar(1.2 - .2 * e0);

    if (g.userData.clouds) {
        g.userData.clouds.rotation.y += dt * .01;
    }

    starLayers.forEach((s, i) => {
        s.rotation.y += dt * .002 * (i + 1);
        s.material.opacity =
            .75 + .25 * Math.sin(t * (1.2 + i * .9) + i);
    });

    for (let i = shooters.length - 1; i >= 0; i--) {
        const o = shooters[i];

        o.life += dt;

        const head = o.start.clone().addScaledVector(o.dir, o.life * 140);
        const tail = o.start.clone().addScaledVector(
            o.dir,
            Math.max(0, o.life - .35) * 140
        );

        o.line.geometry.setFromPoints([tail, head]);
        o.line.material.opacity = Math.max(0, 1 - o.life / 1.2);

        if (o.life > 1.2) {
            scene.remove(o.line);
            o.line.geometry.dispose();
            shooters.splice(i, 1);
        }
    }

    starLayers.forEach((s, i) => {
        s.position.x += (
            (mx / innerWidth - .5) * (i + 1) * -3 - s.position.x
        ) * .03;

        s.position.y += (
            (my / innerHeight - .5) * (i + 1) * 3 - s.position.y
        ) * .03;
    });

    g.userData.markers.forEach((o, i) => {
        const k = (t * .8 + i * .3) % 1;

        o.m.getWorldPosition(wp);

        const front =
            entered &&
            !intro &&
            wp.dot(camera.position) > R * R * 1.03;

        const on = !!(hl && hl.has(o.s.id));

        o.m.visible = o.beam.visible = front;
        o.ring.visible = front && (!hl || on);

        const c = on ? 0xffffff : COL[o.s.t];

        o.m.material.color.setHex(c);
        o.ring.material.color.setHex(c);

        o.m.scale.setScalar(hl ? (on ? 2.4 : .6) : 1);

        o.ring.scale.setScalar(1 + k * (on ? 3 : 1.8));
        o.ring.material.opacity = .9 * (1 - k);
    });

    if (!entered) {
        camera.position.set(0, 1.5, 8.5);
        camera.lookAt(0, 0, 0);

    } else if (intro) {
        intro.t = Math.min(1, intro.t + dt / 3.5);

        camera.position.set(0, 1.5, 8.5);
        camera.lookAt(0, 0, 0);

        if (intro.t >= 1) {
            intro = null;
            controls.update();
        }

    } else {
        if (fly) {
            fly.t = Math.min(1, fly.t + dt / 1.8);

            camera.position.lerpVectors(
                fly.from,
                fly.to,
                ease(fly.t)
            );

            if (fly.t >= 1) fly = null;
        }

        controls.update();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}

loop();

addEventListener('resize', () => {
    sizeTrail();

    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(innerWidth, innerHeight);
});


/* ================================================================
   ADD-ON: MISSION CHALLENGE ANALYZER
   This block is intentionally separate from the existing features.
   It adds one new toolbar button and uses the existing info panel.
   ================================================================ */
(function addMissionChallengeAnalyzer() {
    const existingProblemButton = $('probBtn');

    const resourceButton = $('resourceBtn');
    const signalButton = $('commBtn');
    const checklistButton = $('checkBtn');

    if (!existingProblemButton || !$('panel') || !$('pc')) return;

    function openPanel(content) {
        $('pc').innerHTML = content;
        $('panel').classList.add('open');
    }

    const missionButton = document.createElement('button');
    missionButton.type = 'button';
    missionButton.className = 'btn';
    missionButton.id = 'missionChallengeBtn';
    missionButton.textContent = 'MISSION CHALLENGES';
    missionButton.title = 'Match Moon and Mars mission challenges with Earth analogue locations';
    missionButton.addEventListener('click', openMissionChallenges);

    const style = document.createElement('style');
    style.textContent = `
      #missionChallengeBtn { border-color:rgba(94,231,255,.55); }
      #missionChallengeBtn:hover { box-shadow:0 0 18px rgba(94,231,255,.2); }
      .mission-intro { color:#9aacc8; font-size:12px; line-height:1.65; margin:8px 0 14px; }
      .mission-section { margin-top:16px; }
      .mission-section h5 { margin:0 0 8px; color:#5ee7ff; font:700 10px Orbitron, sans-serif; letter-spacing:1.1px; }
      .mission-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-top:10px; }
      .mission-choice { min-height:42px; text-align:left; white-space:normal; line-height:1.4; }
      .mission-result { margin-top:12px; padding:12px; border:1px solid rgba(94,231,255,.2); border-radius:12px; background:rgba(94,231,255,.045); }
      .mission-result b { display:block; color:#eaf5ff; font-size:13px; margin-bottom:5px; }
      .mission-result p { color:#a9bad3; font-size:12px; line-height:1.6; margin:0; }
      .mission-note { color:#8195b4; font-size:10px; line-height:1.55; margin-top:12px; }
      @media(max-width:600px) { .mission-grid { grid-template-columns:1fr; } }
    `;
    document.head.appendChild(style);

    const challenges = {
        moon: [
            { id: 'water', title: 'Water ice & life support', earth: ['dryvalleys', 'atacama', 'uyuni', 'haughton'], moonSite: 'shackleton', reason: 'Earth polar deserts, dry lakebeds and salt flats help researchers test ice detection, drilling, sampling and resource-use methods. They are useful analogues, but they do not reproduce the Moon’s vacuum or extreme cold.', test: 'Ice and subsurface mapping, autonomous drilling, sample handling, water purification and closed-loop life-support tests.', solution: 'Prospecting radar, robotic drills, insulated storage and systems that can purify and recycle water.' },
            { id: 'radiation', title: 'Radiation protection & shelter', earth: ['craters', 'haughton', 'dryvalleys', 'mdrs'], moonSite: 'marius', reason: 'Remote field habitats and natural underground formations help test shelter layouts, operations and crew routines. Earth itself does not reproduce the Moon’s unshielded radiation environment.', test: 'Habitat shielding concepts, underground shelter access, suit operations and emergency procedures.', solution: 'Regolith-covered habitats, buried modules, lava-tube exploration and radiation monitoring.' },
            { id: 'temperature', title: 'Extreme temperature & long night', earth: ['dryvalleys', 'danakil', 'haughton', 'atacama'], moonSite: 'shackleton', reason: 'Antarctic cold and desert heat help test thermal control, insulation, equipment reliability and human procedures across harsh temperature ranges.', test: 'Thermal insulation, battery performance, suit cooling/heating and equipment cycling.', solution: 'Multilayer insulation, thermal storage, heated systems and carefully selected sites with useful sunlight.' },
            { id: 'terrain', title: 'Dust, regolith & rough terrain', earth: ['lanzarote', 'askja', 'atacama', 'meteor', 'haughton'], moonSite: 'tranq', reason: 'Volcanic ash, basalt, impact craters and dry soils provide accessible terrain for rover mobility, sampling and geological field training.', test: 'Wheel traction, dust seals, navigation, drilling, landing-site assessment and sample collection.', solution: 'Dust-tolerant mechanisms, wheel designs, navigation sensors and robotic site surveys.' },
            { id: 'power', title: 'Reliable power & communications', earth: ['uyuni', 'askja', 'hiseas', 'lanzarote'], moonSite: 'malapert', reason: 'Remote research stations and renewable-energy sites help test independent power, storage, maintenance and communication networks.', test: 'Solar arrays, batteries, microgrids, antenna placement and backup power procedures.', solution: 'Solar generation, energy storage, redundant communication relays and efficient power management.' }
        ],
        mars: [
            { id: 'water', title: 'Water access & food production', earth: ['atacama', 'dryvalleys', 'uyuni', 'mdrs', 'haughton'], marsSite: 'utopia', reason: 'Hyper-arid deserts, polar permafrost and dry lakebeds help test water detection, drilling, soil analysis and low-water growing systems.', test: 'Subsurface ice detection, drilling, water extraction, soil testing and controlled-environment agriculture.', solution: 'Ice prospecting, water recycling, greenhouse systems and resource-efficient crop production.' },
            { id: 'radiation', title: 'Radiation & long-term habitat safety', earth: ['dryvalleys', 'haughton', 'mdrs', 'craters'], marsSite: 'gale', reason: 'Isolated polar and desert stations help test habitat operations, monitoring and crew procedures. They cannot reproduce the radiation exposure on Mars.', test: 'Habitat shielding layouts, radiation-monitoring workflows, emergency drills and crew activity planning.', solution: 'Shielded habitats, buried or bermed structures, storm shelters and radiation monitoring.' },
            { id: 'dust', title: 'Dust storms & equipment protection', earth: ['atacama', 'danakil', 'lanzarote', 'dryvalleys'], marsSite: 'hellas', reason: 'Earth’s dry deserts and volcanic landscapes provide test beds for dust-resistant mechanisms, filters, seals, solar-panel cleaning and visibility procedures.', test: 'Dust filtration, seals, sensor visibility, solar-panel performance and rover mobility.', solution: 'Dust-tolerant joints, replaceable filters, electrostatic dust mitigation research and protected power systems.' },
            { id: 'temperature', title: 'Cold, heat & thermal control', earth: ['dryvalleys', 'danakil', 'haughton', 'atacama'], marsSite: 'hellas', reason: 'Antarctic cold and extreme deserts help evaluate insulation, thermal cycling, batteries, suits and habitat systems under harsh conditions.', test: 'Thermal cycling, battery insulation, habitat heating/cooling and suit thermal management.', solution: 'Insulated habitats, thermal storage, efficient heaters and equipment designed for large temperature swings.' },
            { id: 'isolation', title: 'Crew isolation & mental health', earth: ['hiseas', 'mdrs', 'haughton', 'dryvalleys'], marsSite: 'jezero', reason: 'HI-SEAS, MDRS and polar stations simulate parts of mission isolation, limited resources, team dynamics and delayed outside support.', test: 'Crew teamwork, workload, sleep routines, conflict resolution, autonomy and emergency decision-making.', solution: 'Carefully designed crew schedules, private spaces, communication routines and psychological support protocols.' },
            { id: 'power', title: 'Energy independence & resource limits', earth: ['uyuni', 'hiseas', 'askja', 'lanzarote', 'mdrs'], marsSite: 'utopia', reason: 'Remote habitats and renewable-energy locations help test microgrids, energy storage, maintenance and operating with limited supplies.', test: 'Solar generation, battery storage, energy budgeting, backup systems and greenhouse power demand.', solution: 'Hybrid power systems, energy storage, efficient equipment and strict resource monitoring.' },
            { id: 'communications', title: 'Communication delay & autonomy', earth: ['hiseas', 'mdrs', 'haughton', 'dryvalleys'], marsSite: 'jezero', reason: 'Remote analog missions can practise operating with limited contact and making decisions without immediate outside help. They do not reproduce the full 3–22 minute one-way Mars signal delay.', test: 'Autonomous rover tasks, delayed-message procedures, local decision-making and fault recovery.', solution: 'More onboard autonomy, robust mission plans, local navigation and clear crew decision authority.' }
        ]

    };

    function openMissionChallenges() {
        const world = 'moon';

        openPanel(`
        <span class="tag both">MISSION ANALYSIS</span>
        <h2>Mission Challenges</h2>
        <p class="mission-intro">
            Select a destination and a mission challenge to discover
            which Earth locations can help researchers prepare.
        </p>

        <label class="tool-field">
            Mission destination
            <select id="missionWorld">
                <option value="moon">Moon Base</option>
                <option value="mars">Mars Settlement</option>
            </select>
        </label>

        <div class="mission-section">
            <h5>SELECT A CHALLENGE</h5>
            <div class="mission-grid" id="missionChoices"></div>
        </div>

        <div id="missionResult"></div>
    `);

        const worldSelect = $('missionWorld');
        const choices = $('missionChoices');
        const result = $('missionResult');

        function renderChallenges() {
            const list = challenges[worldSelect.value];

            choices.innerHTML = list.map(item => `
            <button class="btn mission-choice" data-id="${item.id}">
                ${item.title}
            </button>
        `).join('');

            result.innerHTML = '';

            choices.querySelectorAll('[data-id]').forEach(button => {
                button.addEventListener('click', () => {
                    const item = list.find(c => c.id === button.dataset.id);

                    const earthNames = {
                        dryvalleys: 'McMurdo Dry Valleys, Antarctica',
                        atacama: 'Atacama Desert, Chile',
                        uyuni: 'Salar de Uyuni, Bolivia',
                        haughton: 'Haughton Crater, Canada',
                        marius: 'Marius Hills, Moon',
                        tranq: 'Sea of Tranquility, Moon',
                        shackleton: 'Shackleton Crater, Moon',
                        malapert: 'Malapert Massif, Moon',
                        craters: 'Impact crater analog sites',
                        mdrs: 'Mars Desert Research Station, USA',
                        hiseas: 'HI-SEAS, Hawaii, USA',
                        danakil: 'Danakil Depression, Ethiopia',
                        askja: 'Askja volcanic region, Iceland',
                        lanzarote: 'Lanzarote, Canary Islands',
                        meteor: 'Meteor Crater, USA',
                        jezero: 'Jezero Crater, Mars',
                        gale: 'Gale Crater, Mars',
                        hellas: 'Hellas Planitia, Mars',
                        utopia: 'Utopia Planitia, Mars'
                    };

                    const locations = item.earth
                        .map(id => earthNames[id] || id)
                        .join('<br>');

                    const target = worldSelect.value === 'moon'
                        ? item.moonSite
                        : item.marsSite;

                    result.innerHTML = `
                    <div class="mission-result">
                        <b>${item.title}</b>
                        <p><strong>Earth analogue locations:</strong><br>
                        ${locations}</p>
                        <br>
                        <p><strong>Destination reference:</strong>
                        ${earthNames[target] || target}</p>
                        <br>
                        <p><strong>Why these locations?</strong><br>
                        ${item.reason}</p>
                        <br>
                        <p><strong>What researchers can test:</strong><br>
                        ${item.test}</p>
                        <br>
                        <p><strong>Possible mission solutions:</strong><br>
                        ${item.solution}</p>
                    </div>
                `;
                });
            });
        }

        worldSelect.addEventListener('change', renderChallenges);
        renderChallenges();
    }

    function openSignalDelay() {

        openPanel(`
          <span class="tag both">DEEP SPACE COMMUNICATION</span>
          <h2>Signal Delay Calculator</h2>
          <p class="tool-copy">Radio signals travel at the speed of light. Choose a destination or enter a custom distance to estimate how long a message takes to travel one way and back.</p>
          <div class="tool-form">
            <label class="tool-field">Mission distance
              <select id="signalPreset">
                <option value="moon">Earth to Moon · 384,400 km</option>
                <option value="marsNear">Earth to Mars · 54.6 million km</option>
                <option value="marsFar">Earth to Mars · 401 million km</option>
                <option value="custom">Custom distance</option>
              </select>
            </label>
            <label class="tool-field">Distance in kilometres
              <input id="signalDistance" type="number" min="0" value="384400">
            </label>
          </div>
          <div class="tool-output" id="signalOutput"></div>
          <div class="tool-block"><h5>WHAT THIS MEANS FOR THE CREW</h5><p class="tool-copy" id="signalExplanation"></p></div>
          <p class="tool-small">This calculator uses light speed (299,792.458 km/s) and the selected distance. Actual Earth–Mars distance changes as the planets orbit the Sun. Network and equipment delays are not included.</p>
        `);

        const preset = $('signalPreset');
        const distance = $('signalDistance');
        const output = $('signalOutput');
        const explanation = $('signalExplanation');

        const presets = {
            moon: 384400,
            marsNear: 54600000,
            marsFar: 401000000
        };

        const lightSpeed = 299792.458;

        function update() {
            const km = Math.max(0, Number(distance.value) || 0);
            const seconds = km / lightSpeed;
            const roundTrip = seconds * 2;
            const pretty = seconds >= 60 ? (seconds / 60).toFixed(2) + ' min' : seconds.toFixed(2) + ' sec';
            const prettyRT = roundTrip >= 60 ? (roundTrip / 60).toFixed(2) + ' min' : roundTrip.toFixed(2) + ' sec';

            output.innerHTML = `
              <div class="stat"><small>ONE-WAY DELAY</small><b>${pretty}</b></div>
              <div class="stat"><small>ROUND-TRIP DELAY</small><b>${prettyRT}</b></div>
              <div class="stat"><small>LIGHT SPEED</small><b>299,792 km/s</b></div>
              <div class="stat"><small>MISSION DISTANCE</small><b>${km.toLocaleString('en-US')} km</b></div>`;

            if (preset.value === 'moon') {
                explanation.textContent = 'Moon crews can usually communicate with Earth with only a few seconds of round-trip light-time. Local backup procedures are still needed for outages.';
            } else if (preset.value === 'marsNear' || preset.value === 'marsFar') {
                explanation.textContent = 'Mars crews cannot rely on real-time conversation with Earth. They need onboard autonomy, pre-approved procedures and the ability to solve emergencies locally.';
            } else {
                explanation.textContent = 'Use this custom calculation to estimate how communication delay changes with distance. It calculates light-time only, not network or equipment delays.';
            }
        }

        preset.onchange = () => {
            if (presets[preset.value]) distance.value = presets[preset.value];
            update();
        };

        distance.oninput = () => {
            if (preset.value !== 'custom') preset.value = 'custom';
            update();
        };

        update();
    }

    function openResourcePlanner() {
        openPanel(`
          <span class="tag both">MISSION LOGISTICS</span>
          <h2>Resource Planner</h2>
          <p class="tool-copy">Estimate basic supplies for a surface crew. Change the crew size and mission duration to update the totals instantly.</p>
          <div class="tool-form">
            <label class="tool-field">Destination
              <select id="resourceWorld"><option value="moon">Moon base</option><option value="mars">Mars settlement</option></select>
            </label>
            <label class="tool-field">Crew members
              <input id="crewCount" type="number" min="1" max="100" value="4">
            </label>
            <label class="tool-field">Mission duration (days)
              <input id="missionDays" type="number" min="1" max="2000" value="30">
            </label>
            <label class="tool-field">Safety reserve
              <select id="reserveRate"><option value="0.1">10%</option><option value="0.2" selected>20%</option><option value="0.3">30%</option></select>
            </label>
          </div>
          <div class="tool-output" id="resourceOutput"></div>
          <div class="tool-block"><h5>PLANNING ASSUMPTIONS</h5><p class="tool-copy">Baseline per person per day: 3.5 L water, 0.84 kg oxygen, 0.62 kg food and 15 kWh electrical energy. The reserve is added to each total. Real mission needs depend on recycling efficiency, equipment, activity and habitat design.</p></div>
          <p class="tool-small" id="resourceSummary"></p>
        `);

        const crew = $('crewCount');
        const days = $('missionDays');
        const reserve = $('reserveRate');
        const world = $('resourceWorld');

        function update() {
            const people = Math.max(1, Math.min(100, Math.floor(Number(crew.value) || 1)));
            const duration = Math.max(1, Math.min(2000, Math.floor(Number(days.value) || 1)));
            const factor = people * duration * (1 + Number(reserve.value));

            crew.value = people;
            days.value = duration;

            const water = factor * 3.5;
            const oxygen = factor * .84;
            const food = factor * .62;
            const energy = factor * 15;

            $('resourceOutput').innerHTML = `
              <div class="stat"><small>WATER</small><b>${Math.ceil(water).toLocaleString('en-US')} L</b></div>
              <div class="stat"><small>OXYGEN</small><b>${oxygen.toFixed(1)} kg</b></div>
              <div class="stat"><small>FOOD</small><b>${food.toFixed(1)} kg</b></div>
              <div class="stat"><small>ELECTRICITY</small><b>${Math.ceil(energy).toLocaleString('en-US')} kWh</b></div>`;

            $('resourceSummary').textContent =
                `${world.value === 'moon' ? 'Moon base' : 'Mars settlement'} estimate for ${people} crew over ${duration} days, including ${(Number(reserve.value) * 100).toFixed(0)}% reserve. These are planning estimates, not a spacecraft-certified supply manifest.`;
        }

        [crew, days, reserve, world].forEach(el => el.addEventListener('input', update));
        [reserve, world].forEach(el => el.addEventListener('change', update));

        update();
    }

    function openReadinessChecklist() {
        openPanel(`
          <span class="tag both">MISSION PREPARATION</span>
          <h2>Readiness Checklist</h2>
          <p class="tool-copy">Use this checklist to review major systems before a long-duration surface mission. Tick an item when the team has verified it.</p>
          <div class="tool-form">
            <label class="tool-field">Mission destination
              <select id="readinessWorld"><option value="moon">Moon base</option><option value="mars">Mars settlement</option></select>
            </label>
            <div class="tool-field" style="justify-content:end"><span>Completed items</span><strong class="readiness" id="readinessCount">0 / 10</strong></div>
          </div>
          <div class="tool-progress"><span id="readinessBar"></span></div>
          <div class="tool-checks" id="readinessItems"></div>
          <div class="tool-block"><h5>IMPORTANT</h5><p class="tool-copy">This is an educational planning aid, not an official NASA flight-readiness standard. Real missions require engineering verification, safety reviews and mission-specific procedures.</p></div>
        `);

        const items = {
            moon: [
                'Life support: oxygen supply, CO₂ removal and pressure control tested',
                'Water: extraction, purification, storage and recycling plan verified',
                'Radiation: shielding strategy and solar-storm shelter prepared',
                'Thermal control: systems tested for extreme hot/cold cycles and lunar night',
                'Power: solar generation, energy storage and backup supply verified',
                'Dust: seals, filters, suit interfaces and cleaning procedures tested',
                'Mobility: rover, navigation, landing zone and surface routes checked',
                'Communications: Earth link, local network and backup procedures tested',
                'Medical: first-aid equipment, health monitoring and evacuation plan ready',
                'Emergency: fire, depressurization, equipment failure and shelter drills completed'
            ],
            mars: [
                'Life support: oxygen supply, CO₂ removal and pressure control tested',
                'Water: ice prospecting, extraction, purification and recycling plan verified',
                'Radiation: habitat shielding and solar-storm shelter prepared',
                'Thermal control: habitat heating, cooling and suit systems tested',
                'Power: reliable generation, storage and backup for dust events verified',
                'Dust: filters, seals, solar-panel cleaning and equipment protection tested',
                'Food: stored food, greenhouse trials and crop-failure backup planned',
                'Communications: delayed-message procedures and crew autonomy tested',
                'Medical: long-duration care, diagnostics and emergency treatment prepared',
                'Emergency: habitat breach, fire, rover failure and safe-haven drills completed'
            ]
        };

        const world = $('readinessWorld');
        const box = $('readinessItems');

        function render() {
            box.innerHTML = items[world.value].map((label, index) =>
                `<label class="tool-check"><input type="checkbox" data-ready="${index}"><span>${label}</span></label>`
            ).join('');

            box.querySelectorAll('[data-ready]').forEach(input => {
                input.addEventListener('change', update);
            });

            update();
        }

        function update() {
            const checks = [...box.querySelectorAll('[data-ready]')];
            const done = checks.filter(input => input.checked).length;
            const total = checks.length;

            $('readinessCount').textContent =
                `${done} / ${total} · ${Math.round(done / total * 100)}%`;

            $('readinessBar').style.width = `${done / total * 100}%`;
        }

        world.addEventListener('change', render);
        render();
    }
    if (resourceButton) {
        resourceButton.addEventListener('click', openResourcePlanner);
    }

    if (signalButton) {
        signalButton.addEventListener('click', openSignalDelay);
    }

    if (checklistButton) {
        checklistButton.addEventListener('click', openReadinessChecklist);
        /* BACK BUTTON LOGIC */

        function returnToOpeningScreen() {
            stopTour();
            $('panel').classList.remove('open');
            $('intro').classList.remove('hide');
            document.body.classList.remove('on');

            entered = false;
            intro = null;
            fly = null;
            sel = null;
            hl = null;
            auto = true;

            pageHistory.length = 0;
            backButton.style.display = 'none';

            show('earth', false);

            camera.position.set(0, 1.5, 8.5);
            controls.target.set(0, 0, 0);
            controls.update();
        }

        backButton.onclick = () => {
            if (!entered) return;

            if ($('panel').classList.contains('open')) {
                $('close').click();
                return;
            }

            if (pageHistory.length > 0) {
                const previousPlanet = pageHistory.pop();
                show(previousPlanet, false);
            } else {
                returnToOpeningScreen();
            }
        };
    }
})();