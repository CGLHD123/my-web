const classes = [
    { name: 'SCOUT', hp: 100, atk: 15, range: 80, color: '#2ecc71', id: 'scout', ult: 'DASH' },
    { name: 'WARRIOR', hp: 150, atk: 25, range: 90, color: '#e74c3c', id: 'warrior', ult: 'SLASH' },
    { name: 'TANKER', hp: 300, atk: 10, range: 70, color: '#3498db', id: 'tanker', ult: 'SHIELD' },
    { name: 'MAGE', hp: 80, atk: 50, range: 200, color: '#9b59b6', id: 'mage', ult: 'BLAST' },
    { name: 'ROGUE', hp: 100, atk: 40, range: 60, color: '#f1c40f', id: 'rogue', ult: 'STEALTH' },
    { name: 'CLERIC', hp: 130, atk: 15, range: 70, color: '#ecf0f1', id: 'cleric', ult: 'HEAL' },
    { name: 'BERSERKER', hp: 180, atk: 35, range: 85, color: '#e67e22', id: 'berserker', ult: 'RAGE' },
    { name: 'ARCHER', hp: 90, atk: 30, range: 300, color: '#a2b9bc', id: 'archer', ult: 'ARROW' },
    { name: 'PALADIN', hp: 200, atk: 20, range: 90, color: '#1abc9c', id: 'paladin', ult: 'HOLY' },
    { name: 'NECRO', hp: 90, atk: 30, range: 150, color: '#8e44ad', id: 'necro', ult: 'SUMMON' }
];

let g = {
    active: false,
    player: { x: 100, y: 100, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, coin: 0, ground: false, dir: 1, range: 80, canAtk: true, ultCD: false },
    keys: {},
    platforms: [], entities: [], particles: [],
    lastGenX: 0, // Dùng để tạo map vô tận
    selected: null
};

// --- CORE SYSTEM ---
function initSelection() {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const d = document.createElement('div');
        d.className = 'class-item';
        d.style.backgroundImage = `url('assets/thumbs/${c.id}.png')`;
        d.onclick = () => {
            document.querySelectorAll('.class-item').forEach(i => i.classList.remove('active'));
            d.classList.add('active');
            g.selected = c;
            document.getElementById('start-btn').disabled = false;
            document.getElementById('class-details').innerHTML = `<h3>${c.name}</h3><p>ULT: ${c.ult}</p>`;
        };
        grid.appendChild(d);
    });
}

function initGame() {
    const s = g.selected;
    g.player.hp = g.player.maxH = s.hp; g.player.atk = s.atk; g.player.range = s.range;
    document.getElementById('player-sprite').style.backgroundColor = s.color;
    document.getElementById('gui-selection').style.display = 'none';

    // Tạo sàn ban đầu
    createPlatform(0, 0, 2000, 40);
    g.active = true;
    requestAnimationFrame(loop);
}

// --- INFINITE MAP GENERATION ---
function createPlatform(x, y, w, h) {
    const el = document.createElement('div');
    el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px';
    el.style.width = w + 'px'; el.style.height = h + 'px';
    document.getElementById('world').appendChild(el);
    g.platforms.push({ x, y, w, h, el });
}

function generateMap() {
    if (g.player.x + 1000 > g.lastGenX) {
        let w = 300 + Math.random() * 400;
        let x = g.lastGenX + 150 + Math.random() * 200;
        let y = 100 + Math.random() * 250;
        createPlatform(x, y, w, 20);

        // Spawn quái vật trên platform mới
        if (Math.random() > 0.4) {
            createEntity(Math.random() > 0.5 ? 'goblin' : 'orc', x + w / 2, y + 40);
        }
        g.lastGenX = x + w;
    }
}

// --- COMBAT & SKILLS ---
function useUltimate() {
    const p = g.player;
    if (p.ultCD || !g.active) return;
    p.ultCD = true;

    const ultType = g.selected.ult;
    if (ultType === 'DASH') { p.vx = p.dir * 40; }
    if (ultType === 'HEAL') { p.hp = Math.min(p.maxH, p.hp + 50); }
    if (ultType === 'SLASH') { p.atk *= 2; setTimeout(() => p.atk /= 2, 2000); }

    createParticle(p.x, p.y + 20, '#fff'); // Hiệu ứng kích hoạt
    setTimeout(() => p.ultCD = false, 5000); // 5s hồi chiêu
}

function attack() {
    if (!g.active || !g.player.canAtk) return;
    g.player.canAtk = false;
    document.getElementById('weapon-visual').classList.add('swing');

    g.entities.forEach(en => {
        if (!en.active) return;
        let d = g.player.dir === 1 ? (en.x - g.player.x) : (g.player.x - en.x);
        if (d > 0 && d < g.player.range && Math.abs(g.player.y - en.y) < 80) {
            en.hp -= g.player.atk;
            createParticle(en.x, en.y + 20, en.type === 'goblin' ? '#1a5e1a' : '#d2b48c');
            if (en.hp <= 0) { en.active = false; en.el.remove(); g.player.coin += 25; updateUI(); }
            else en.el.querySelector('.m-hp-i').style.width = (en.hp / en.mH * 100) + '%';
        }
    });
    setTimeout(() => { document.getElementById('weapon-visual').classList.remove('swing'); g.player.canAtk = true; }, 200);
}

// --- SHOP SYSTEM ---
function openShop() { document.getElementById('gui-shop').style.display = 'flex'; g.active = false; }
function closeShop() { document.getElementById('gui-shop').style.display = 'none'; g.active = true; requestAnimationFrame(loop); }
function buyUpgrade(type) {
    if (type === 'atk' && g.player.coin >= 50) { g.player.atk += 5; g.player.coin -= 50; }
    if (type === 'hp' && g.player.coin >= 30) { g.player.hp = g.player.maxH; g.player.coin -= 30; }
    updateUI();
}

// --- GAME LOOP ---
function loop() {
    if (!g.active) return;
    updatePlayer();
    updateEntities();
    updateParticles();
    generateMap();
    requestAnimationFrame(loop);
}

function updatePlayer() {
    const p = g.player;
    if (g.keys['KeyA']) { p.vx = -8; p.dir = -1; }
    else if (g.keys['KeyD']) { p.vx = 8; p.dir = 1; }
    else p.vx *= 0.85;

    if (g.keys['Space'] && p.ground) { p.vy = 22; p.ground = false; }
    p.vy -= 1.2; p.x += p.vx; p.y += p.vy;

    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 35 > plat.x && p.x < plat.x + plat.w) {
            if (p.vy <= 0 && p.y >= plat.y + plat.h - 15 && p.y <= plat.y + plat.h + 5) {
                p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
            }
        }
    });

    const c = document.getElementById('player-container');
    c.style.left = p.x + 'px'; c.style.bottom = p.y + 'px';
    c.style.transform = `scaleX(${p.dir})`;
    document.getElementById('world').style.transform = `translateX(${-p.x + window.innerWidth / 2}px)`;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    if (p.hp <= 0) location.reload();
}

function createEntity(type, x, y) {
    const el = document.createElement('div');
    el.className = type;
    el.innerHTML = `<div class="m-hp"><div class="m-hp-i" style="width:100%"></div></div>`;
    document.getElementById('entity-layer').appendChild(el);
    g.entities.push({ type, x, y, hp: 60, mH: 60, el, active: true });
}

function updateEntities() {
    g.entities.forEach(en => {
        if (!en.active) return;
        let dist = g.player.x - en.x;
        if (Math.abs(dist) < 600) en.x += Math.sign(dist) * 2;
        if (Math.abs(dist) < 40 && Math.abs(g.player.y - en.y) < 50) g.player.hp -= 0.5;
        en.el.style.left = en.x + 'px'; en.el.style.bottom = en.y + 'px';
    });
}

function createParticle(x, y, color) {
    for (let i = 0; i < 6; i++) {
        const el = document.createElement('div'); el.className = 'particle';
        el.style.backgroundColor = color; document.getElementById('particle-layer').appendChild(el);
        g.particles.push({ el, x, y, vx: (Math.random() - 0.5) * 10, vy: Math.random() * 10, life: 1 });
    }
}

function updateParticles() {
    for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i];
        p.x += p.vx; p.y += p.vy; p.vy -= 0.5; p.life -= 0.03;
        p.el.style.left = p.x + 'px'; p.el.style.bottom = p.y + 'px'; p.el.style.opacity = p.life;
        if (p.life <= 0) { p.el.remove(); g.particles.splice(i, 1); }
    }
}

function updateUI() {
    document.getElementById('ui-coin').innerText = g.player.coin;
}

window.onkeydown = e => { g.keys[e.code] = true; if (e.code === 'KeyE') useUltimate(); if (e.code === 'KeyB') openShop(); };
window.onkeyup = e => g.keys[e.code] = false;
window.onmousedown = e => { if (e.button === 0) attack(); };
window.onload = initSelection;