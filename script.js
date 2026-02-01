const classes = [
    { id: 'scout', hp: 100, atk: 20, range: 85 }, { id: 'warrior', hp: 160, atk: 30, range: 100 },
    { id: 'tanker', hp: 400, atk: 18, range: 75 }, { id: 'mage', hp: 80, atk: 80, range: 200 },
    { id: 'rogue', hp: 110, atk: 50, range: 80 }, { id: 'cleric', hp: 140, atk: 25, range: 90 },
    { id: 'berserker', hp: 210, atk: 60, range: 105 }, { id: 'archer', hp: 90, atk: 45, range: 380 },
    { id: 'paladin', hp: 260, atk: 28, range: 110 }, { id: 'necro', hp: 100, atk: 50, range: 180 }
];

let g = {
    active: false, diff: 1, lastGenX: 0, lastBossDist: 0,
    player: { x: 100, y: 300, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, coin: 0, lvl: 1, exp: 0, nextExp: 100, ground: false, dir: 1, range: 80, gravity: 0.95, jump: 20, canAtk: true },
    quest: { target: 5, current: 0, reward: 200 },
    keys: {}, platforms: [], entities: [], drops: [], chests: [], spikes: [], selected: null
};

// --- ĐIỀU KHIỂN ---
window.addEventListener('keydown', e => {
    g.keys[e.code] = true;
    if (e.code === 'KeyB') toggleShop();
    if (e.code === 'KeyC') toggleStats();
});
window.addEventListener('keyup', e => g.keys[e.code] = false);

function toggleShop() {
    const s = document.getElementById('gui-shop');
    const isHidden = s.style.display === 'none';
    s.style.display = isHidden ? 'flex' : 'none';
    g.active = !isHidden;
    if (g.active) loop();
}

function toggleStats() {
    const s = document.getElementById('gui-stats');
    const isHidden = s.style.display === 'none';
    if (isHidden) {
        document.getElementById('stats-content').innerHTML = `LEVEL: ${g.player.lvl}<br>ATK: ${g.player.atk}<br>HP: ${Math.floor(g.player.hp)}/${g.player.maxH}<br>DIFFICULTY: x${g.diff.toFixed(2)}`;
        s.style.display = 'flex'; g.active = false;
    } else { s.style.display = 'none'; g.active = true; loop(); }
}

// --- KHỞI TẠO ---
function initSelection() {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const item = document.createElement('div');
        item.className = 'class-item';
        item.onclick = () => {
            document.querySelectorAll('.class-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active'); g.selected = c;
            document.getElementById('class-details').innerText = `${c.id.toUpperCase()} | HP:${c.hp} ATK:${c.atk}`;
            document.getElementById('start-btn').disabled = false;
        };
        grid.appendChild(item);
    });
}

function initGame() {
    const p = g.player; const s = g.selected;
    p.hp = p.maxH = s.hp; p.atk = s.atk; p.range = s.range;
    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    createPlatform(0, 0, 1500, 45); g.lastGenX = 1500;
    g.active = true; updateUI(); loop();
}

function loop() {
    if (!g.active) return;
    updatePlayer(); updateEntities(); generateMap();
    requestAnimationFrame(loop);
}

function updatePlayer() {
    const p = g.player;
    if (g.keys['KeyA']) { p.vx = -8; p.dir = -1; }
    else if (g.keys['KeyD']) { p.vx = 8; p.dir = 1; }
    else p.vx *= 0.85;

    if (g.keys['Space'] && p.ground) { p.vy = p.jump; p.ground = false; }
    p.vy -= p.gravity; p.x += p.vx; p.y += p.vy;

    // Rơi vực tức thì
    let floorY = -300;
    g.platforms.forEach(plat => { if (p.x + 30 > plat.x && p.x < plat.x + plat.w) floorY = Math.max(floorY, plat.y + plat.h); });
    if (p.y < floorY - 150) die();

    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 40 > plat.x && p.x < plat.x + plat.w) {
            if (p.vy <= 0 && p.y >= plat.y + plat.h - 15 && p.y <= plat.y + plat.h + 5) {
                p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
            }
        }
    });

    // Va chạm & Hiệu ứng
    g.spikes.forEach(s => { if (Math.abs(p.x - s.x) < 25 && Math.abs(p.y - s.y) < 20) p.hp -= 1.2; });

    // Cảnh báo máu thấp
    const body = document.getElementById('body-main');
    if (p.hp < p.maxH * 0.3) body.classList.add('low-hp'); else body.classList.remove('low-hp');

    const camX = -p.x + window.innerWidth / 2;
    document.getElementById('world').style.transform = `translateX(${camX}px)`;
    document.getElementById('player-container').style.left = p.x + 'px';
    document.getElementById('player-container').style.bottom = p.y + 'px';
    document.getElementById('player-container').style.transform = `scaleX(${p.dir})`;
    document.getElementById('dist-val').innerText = Math.floor(p.x / 10);
    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    if (p.hp <= 0) die();
}

function attack() {
    if (!g.active || !g.player.canAtk) return;
    g.player.canAtk = false;
    document.getElementById('weapon-visual').classList.add('swing');

    let hitBoss = false;
    g.entities.forEach(en => {
        if (!en.active) return;
        let d = g.player.dir === 1 ? (en.x - g.player.x) : (g.player.x - en.x);
        if (d > 0 && d < g.player.range && Math.abs(g.player.y - en.y) < 100) {
            en.hp -= g.player.atk;
            if (en.isBoss) hitBoss = true;
            if (en.hp <= 0) {
                en.active = false; en.el.remove();
                g.player.coin += en.isBoss ? 1500 : 30;
                g.player.exp += en.isBoss ? 600 : 45;
                g.quest.current++;
                if (g.player.exp >= g.player.nextExp) levelUp();
                if (g.quest.current >= g.quest.target) { g.player.coin += g.quest.reward; g.quest.current = 0; g.quest.target += 5; }
                updateUI();
            } else en.el.querySelector('.m-hp-i').style.width = (en.hp / en.mH * 100) + '%';
        }
    });

    // Hiệu ứng rung màn hình khi đánh Boss
    if (hitBoss) {
        document.getElementById('game-stage').classList.add('shake');
        setTimeout(() => document.getElementById('game-stage').classList.remove('shake'), 300);
    }

    setTimeout(() => { document.getElementById('weapon-visual').classList.remove('swing'); g.player.canAtk = true; }, 200);
}

// --- HỆ THỐNG MAP ---
function generateMap() {
    if (g.player.x + 1000 > g.lastGenX) {
        let w = 400 + Math.random() * 300;
        let x = g.lastGenX + 180;
        let y = Math.max(50, Math.min(320, (g.platforms[g.platforms.length - 1]?.y || 0) + (Math.random() * 160 - 80)));
        createPlatform(x, y, w, 25);

        if (g.player.x - g.lastBossDist > 5000) { createEntity(x + w / 2, y + 40, true); g.lastBossDist = g.player.x; }
        else if (Math.random() > 0.4) createEntity(x + w / 2, y + 40, false);

        if (Math.random() < 0.15) createSpike(x + 150, y + 25);
        if (Math.random() < 0.1) createChest(x + 50, y + 25);
        g.lastGenX = x + w;
    }
}

function createEntity(x, y, isBoss) {
    g.diff = 1 + (g.player.x / 4000);
    const el = document.createElement('div'); el.className = isBoss ? 'boss' : 'goblin';
    const hp = isBoss ? 1500 * g.diff : 65 * g.diff;
    el.innerHTML = `<div class="hp-label" style="width:100%"><div class="m-hp-i" style="width:100%; background:#f00; height:100%"></div></div>`;
    document.getElementById('entity-layer').appendChild(el);
    g.entities.push({ x, y, hp, mH: hp, atk: (isBoss ? 2.5 : 0.8) * g.diff, el, isBoss, active: true });
}

function updateEntities() {
    g.entities.forEach(en => {
        if (!en.active) return;
        let d = g.player.x - en.x;
        if (Math.abs(d) < 600) en.x += Math.sign(d) * (en.isBoss ? 1.5 : 2.5);
        if (Math.abs(d) < (en.isBoss ? 70 : 40) && Math.abs(g.player.y - en.y) < 60) g.player.hp -= en.atk;
        en.el.style.left = en.x + 'px'; en.el.style.bottom = en.y + 'px';
    });
}

function createPlatform(x, y, w, h) {
    const el = document.createElement('div'); el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px';
    document.getElementById('world').appendChild(el);
    g.platforms.push({ x, y, w, h, el });
}
function createSpike(x, y) {
    const el = document.createElement('div'); el.className = 'spike';
    el.style.left = x + 'px'; el.style.bottom = y + 'px';
    document.getElementById('world').appendChild(el);
    g.spikes.push({ x, y, el });
}
function createChest(x, y) {
    const el = document.createElement('div'); el.className = 'chest';
    el.style.left = x + 'px'; el.style.bottom = y + 'px';
    document.getElementById('world').appendChild(el);
    g.chests.push({ x, y, el, active: true });
}
function die() { g.active = false; alert("MISSION FAILED"); location.reload(); }
function levelUp() { g.player.lvl++; g.player.exp -= g.player.nextExp; g.player.nextExp *= 1.6; g.player.atk += 15; g.player.maxH += 40; g.player.hp = g.player.maxH; }
function updateUI() {
    document.getElementById('ui-lvl').innerText = g.player.lvl;
    document.getElementById('ui-coin').innerText = g.player.coin;
    document.getElementById('exp-fill').style.width = (g.player.exp / g.player.nextExp * 100) + '%';
    document.getElementById('quest-desc').innerText = `KILL ${g.quest.target} (${g.quest.current}/${g.quest.target})`;
}
function buyUpgrade(t, p) { if (g.player.coin >= p) { g.player.coin -= p; if (t === 'atk') g.player.atk += 25; else g.player.hp = g.player.maxH; updateUI(); } }

window.addEventListener('mousedown', e => { if (e.button === 0) attack(); });
window.onload = initSelection;