const classes = [
    { id: 'scout', hp: 120, atk: 25, type: 'bow' },
    { id: 'warrior', hp: 180, atk: 35, type: 'bow' },
    { id: 'tanker', hp: 500, atk: 20, type: 'staff' },
    { id: 'mage', hp: 100, atk: 90, type: 'staff' },
    { id: 'rogue', hp: 130, atk: 60, type: 'bow' },
    { id: 'cleric', hp: 160, atk: 35, type: 'staff' },
    { id: 'berserker', hp: 250, atk: 70, type: 'bow' },
    { id: 'archer', hp: 110, atk: 55, type: 'bow' },
    { id: 'paladin', hp: 300, atk: 40, type: 'staff' },
    { id: 'necro', hp: 120, atk: 60, type: 'staff' }
];

let g = {
    active: false, diff: 1, lastGenX: 0,
    player: { x: 100, y: 300, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, coin: 0, lvl: 1, exp: 0, nextExp: 100, dir: 1, type: 'bow', canAtk: true },
    keys: {}, platforms: [], entities: [], projectiles: [], selected: null
};

// --- KHỞI TẠO ---
function initSelection() {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const item = document.createElement('div');
        item.className = 'class-item';
        item.style.backgroundImage = `url('assets/thumbs/${c.id}.png')`;
        item.onclick = () => {
            document.querySelectorAll('.class-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active'); g.selected = c;
            document.getElementById('class-details').innerHTML = `<strong>${c.id.toUpperCase()}</strong><br>Vũ khí: ${c.type === 'bow' ? 'Cung' : 'Trượng'}`;
            document.getElementById('start-btn').disabled = false;
        };
        grid.appendChild(item);
    });
}

function initGame() {
    const p = g.player; const s = g.selected;
    p.hp = p.maxH = s.hp; p.atk = s.atk; p.type = s.type;
    document.getElementById('player-sprite').style.backgroundImage = `url('assets/thumbs/${s.id}.png')`;
    document.getElementById('weapon-visual').className = s.type === 'bow' ? 'weapon-bow' : 'weapon-staff';
    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    createPlatform(0, 0, 2000, 50); g.lastGenX = 2000;
    g.active = true; loop();
}

// --- CHIẾN ĐẤU ---
function shoot() {
    if (!g.active || !g.player.canAtk) return;
    g.player.canAtk = false;
    const p = g.player;
    const el = document.createElement('div');
    el.className = `projectile ${p.type === 'bow' ? 'arrow' : 'magic-orb'}`;
    document.getElementById('projectile-layer').appendChild(el);
    g.projectiles.push({ x: p.x + (p.dir === 1 ? 50 : -20), y: p.y + 25, vx: p.dir * 18, el: el, atk: p.atk, active: true });
    setTimeout(() => g.player.canAtk = true, 350);
}

function updateProjectiles() {
    g.projectiles.forEach((pj, idx) => {
        if (!pj.active) return;
        pj.x += pj.vx;
        pj.el.style.left = pj.x + 'px';
        pj.el.style.bottom = pj.y + 'px';
        g.entities.forEach(en => {
            if (en.active && Math.abs(pj.x - en.x) < 40 && Math.abs(pj.y - en.y) < 60) {
                en.hp -= pj.atk;
                pj.active = false; pj.el.remove();
                if (en.hp <= 0) {
                    en.active = false; en.el.remove();
                    g.player.coin += 50; g.player.exp += 60;
                    if (g.player.exp >= g.player.nextExp) levelUp();
                    updateUI();
                } else {
                    en.el.querySelector('.m-hp-fill').style.width = (en.hp / en.mH * 100) + '%';
                }
            }
        });
        if (Math.abs(pj.x - g.player.x) > 1000) { pj.active = false; pj.el.remove(); }
    });
}

// --- CORE LOOP ---
function loop() {
    if (!g.active) return;
    updatePlayer();
    updateProjectiles();
    updateEntities();
    generateMap();
    requestAnimationFrame(loop);
}

function updatePlayer() {
    const p = g.player;
    if (g.keys['KeyA']) { p.vx = -8; p.dir = -1; }
    else if (g.keys['KeyD']) { p.vx = 8; p.dir = 1; }
    else p.vx *= 0.85;
    if (g.keys['Space'] && p.ground) { p.vy = 20; p.ground = false; }
    p.vy -= 0.9; p.x += p.vx; p.y += p.vy;
    if (p.y < -200) die();
    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 40 > plat.x && p.x < plat.x + plat.w) {
            if (p.vy <= 0 && p.y >= plat.y + plat.h - 15 && p.y <= plat.y + plat.h + 5) {
                p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
            }
        }
    });
    const camX = -p.x + window.innerWidth / 2;
    document.getElementById('world').style.transform = `translateX(${camX}px)`;
    document.getElementById('player-container').style.left = p.x + 'px';
    document.getElementById('player-container').style.bottom = p.y + 'px';
    document.getElementById('player-container').style.transform = `scaleX(${p.dir})`;
    document.getElementById('dist-val').innerText = Math.floor(p.x / 10);
    document.getElementById('hp-fill-main').style.width = (p.hp / p.maxH * 100) + '%';
    if (p.hp <= 0) die();
}

function updateEntities() {
    g.entities.forEach(en => {
        if (!en.active) return;
        let d = g.player.x - en.x;
        if (Math.abs(d) < 600) en.x += Math.sign(d) * 2.2;
        if (Math.abs(d) < 45 && Math.abs(g.player.y - en.y) < 60) g.player.hp -= 0.8;
        en.el.style.left = en.x + 'px'; en.el.style.bottom = en.y + 'px';
    });
}

function generateMap() {
    if (g.player.x + 1000 > g.lastGenX) {
        let x = g.lastGenX + 220;
        let w = 500 + Math.random() * 400;
        let y = Math.max(50, Math.min(300, (g.platforms[g.platforms.length - 1]?.y || 0) + (Math.random() * 160 - 80)));
        createPlatform(x, y, w, 40);
        if (Math.random() > 0.4) createEntity(x + w / 2, y + 60);
        g.lastGenX = x + w;
    }
}

function createPlatform(x, y, w, h) {
    const el = document.createElement('div'); el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px';
    document.getElementById('world').appendChild(el);
    g.platforms.push({ x, y, w, h, el });
}

function createEntity(x, y) {
    g.diff = 1 + (g.player.x / 5000);
    const el = document.createElement('div'); el.className = 'entity';
    const hp = 80 * g.diff;
    el.innerHTML = `<div class="monster-sprite"></div><div class="m-hp-bar"><div class="m-hp-fill"></div></div>`;
    document.getElementById('entity-layer').appendChild(el);
    g.entities.push({ x, y, hp, mH: hp, el, active: true });
}

function updateUI() {
    document.getElementById('ui-lvl').innerText = g.player.lvl;
    document.getElementById('ui-coin').innerText = g.player.coin;
    document.getElementById('exp-fill').style.width = (g.player.exp / g.player.nextExp * 100) + '%';
}

function die() { g.active = false; alert("THẤT BẠI! NHẤN OK ĐỂ CHƠI LẠI."); location.reload(); }
function levelUp() { g.player.lvl++; g.player.exp = 0; g.player.nextExp *= 1.7; g.player.atk += 20; g.player.maxH += 50; g.player.hp = g.player.maxH; updateUI(); }
function toggleShop() { const s = document.getElementById('gui-shop'); s.style.display = s.style.display === 'none' ? 'flex' : 'none'; g.active = s.style.display === 'none'; if (g.active) loop(); }
function toggleStats() { alert(`LEVEL: ${g.player.lvl}\nATK: ${g.player.atk}\nHP: ${Math.floor(g.player.hp)}/${g.player.maxH}`); }

window.addEventListener('keydown', e => g.keys[e.code] = true);
window.addEventListener('keyup', e => g.keys[e.code] = false);
window.addEventListener('mousedown', e => { if (e.button === 0) shoot(); });
window.onload = initSelection;