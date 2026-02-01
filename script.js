const classes = [
    { id: 'scout', hp: 100, atk: 18, range: 85 }, { id: 'warrior', hp: 160, atk: 28, range: 100 },
    { id: 'tanker', hp: 380, atk: 15, range: 75 }, { id: 'mage', hp: 90, atk: 70, range: 190 },
    { id: 'rogue', hp: 110, atk: 48, range: 75 }, { id: 'cleric', hp: 140, atk: 22, range: 90 },
    { id: 'berserker', hp: 200, atk: 55, range: 100 }, { id: 'archer', hp: 95, atk: 40, range: 350 },
    { id: 'paladin', hp: 250, atk: 25, range: 100 }, { id: 'necro', hp: 110, atk: 45, range: 180 }
];

let g = {
    active: false, diff: 1, lastGenX: 0, lastBossDist: 0,
    player: { x: 100, y: 300, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, coin: 0, lvl: 1, exp: 0, nextExp: 100, ground: false, dir: 1, range: 80, gravity: 0.95, jump: 20 },
    quest: { target: 5, current: 0, reward: 150, desc: "DIỆT 5 QUÁI" },
    keys: {}, platforms: [], entities: [], drops: [], chests: [], spikes: [], selected: null
};

function initSelection() {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const item = document.createElement('div');
        item.className = 'class-item';
        item.style.backgroundImage = `url('assets/thumbs/${c.id}.png')`;
        item.onclick = () => {
            document.querySelectorAll('.class-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active'); g.selected = c;
            document.getElementById('class-details').innerHTML = `<h3>${c.id.toUpperCase()}</h3><p>ATK: ${c.atk} | HP: ${c.hp}</p>`;
            document.getElementById('start-btn').disabled = false;
        };
        grid.appendChild(item);
    });
}

function initGame() {
    const p = g.player; const s = g.selected;
    p.hp = p.maxH = s.hp; p.atk = s.atk; p.range = s.range;
    document.getElementById('player-sprite').style.backgroundImage = `url('assets/thumbs/${s.id}.png')`;
    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    createPlatform(0, 0, 1500, 45); g.lastGenX = 1500;
    g.active = true; updateUI(); requestAnimationFrame(loop);
}

function loop() {
    if (!g.active) return;
    updatePlayer(); updateEntities(); updateMapItems(); generateMap();
    requestAnimationFrame(loop);
}

function updatePlayer() {
    const p = g.player;
    if (g.keys['KeyA']) { p.vx = -8; p.dir = -1; }
    else if (g.keys['KeyD']) { p.vx = 8; p.dir = 1; }
    else p.vx *= 0.85;

    if (g.keys['Space'] && p.ground) { p.vy = p.jump; p.ground = false; }
    p.vy -= p.gravity; p.x += p.vx; p.y += p.vy;

    // RƠI VỰC TỨC THÌ
    let currentFloor = -100;
    g.platforms.forEach(plat => { if (p.x + 30 > plat.x && p.x < plat.x + plat.w) currentFloor = Math.max(currentFloor, plat.y + plat.h); });
    if (p.y < currentFloor - 120) die();

    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 40 > plat.x && p.x < plat.x + plat.w) {
            if (p.vy <= 0 && p.y >= plat.y + plat.h - 15 && p.y <= plat.y + plat.h + 5) {
                p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
            }
        }
    });

    // Va chạm Gai
    g.spikes.forEach(s => { if (Math.abs(p.x - s.x) < 25 && Math.abs(p.y - s.y) < 20) p.hp -= 1.5; });

    // Cập nhật Camera & Meter
    const camX = -p.x + window.innerWidth / 2;
    document.getElementById('world').style.transform = `translateX(${camX}px)`;
    document.getElementById('parallax-far').style.transform = `translateX(${camX * 0.1}px)`;
    document.getElementById('parallax-mid').style.transform = `translateX(${camX * 0.3}px)`;
    document.getElementById('player-container').style.left = p.x + 'px';
    document.getElementById('player-container').style.bottom = p.y + 'px';
    document.getElementById('player-container').style.transform = `scaleX(${p.dir})`;
    document.getElementById('dist-val').innerText = Math.floor(p.x / 10);
    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    if (p.hp <= 0) die();
}

function die() { g.active = false; alert("OPERATIVE TERMINATED"); location.reload(); }

function generateMap() {
    if (g.player.x + 1000 > g.lastGenX) {
        let w = 400 + Math.random() * 300;
        let x = g.lastGenX + 160;
        let lastY = g.platforms[g.platforms.length - 1]?.y || 0;
        let y = Math.max(50, Math.min(320, lastY + (Math.random() * 160 - 80)));
        createPlatform(x, y, w, 25);

        // Mỗi 5000px xuất hiện Boss
        if (g.player.x - g.lastBossDist > 5000) {
            createEntity(x + w / 2, y + 40, true);
            g.lastBossDist = g.player.x;
        } else if (Math.random() > 0.4) {
            createEntity(x + w / 2, y + 40, false);
        }

        if (Math.random() < 0.15) createSpike(x + 100 + Math.random() * (w - 200), y + 25);
        if (Math.random() < 0.1) createChest(x + 50, y + 25);
        g.lastGenX = x + w;
    }
}

function createEntity(x, y, isBoss) {
    g.diff = 1 + (g.player.x / 3500);
    const el = document.createElement('div');
    el.className = isBoss ? 'boss' : 'goblin';
    const hp = isBoss ? 1000 * g.diff : 60 * g.diff;
    el.innerHTML = `<div class="hp-label" style="width:100%"><div class="m-hp-i" style="width:100%; background:#f00; height:100%"></div></div>`;
    document.getElementById('entity-layer').appendChild(el);
    g.entities.push({ x, y, hp: hp, mH: hp, atk: (isBoss ? 1.5 : 0.5) * g.diff, el, isBoss, active: true });
}

function attack() {
    if (!g.active || !g.player.canAtk) return;
    g.player.canAtk = false;
    document.getElementById('weapon-visual').classList.add('swing');
    g.entities.forEach(en => {
        if (!en.active) return;
        let dist = g.player.dir === 1 ? (en.x - g.player.x) : (g.player.x - en.x);
        if (dist > 0 && dist < g.player.range && Math.abs(g.player.y - en.y) < 100) {
            en.hp -= g.player.atk;
            if (en.hp <= 0) {
                en.active = false; en.el.remove();
                g.player.coin += en.isBoss ? 1000 : 25;
                g.player.exp += en.isBoss ? 500 : 40;
                g.quest.current++;
                if (Math.random() > 0.6) spawnDrop(en.x, en.y + 20);
                if (g.player.exp >= g.player.nextExp) levelUp();
                if (g.quest.current >= g.quest.target) completeQuest();
                updateUI();
            } else en.el.querySelector('.m-hp-i').style.width = (en.hp / en.mH * 100) + '%';
        }
    });
    setTimeout(() => { document.getElementById('weapon-visual').classList.remove('swing'); g.player.canAtk = true; }, 200);
}

// HÀM BỔ TRỢ
function createPlatform(x, y, w, h) {
    const el = document.createElement('div'); el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px';
    el.style.width = w + 'px'; el.style.height = h + 'px';
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
function spawnDrop(x, y) {
    const type = Math.random() > 0.7 ? 'hp' : 'gold';
    const el = document.createElement('div'); el.className = `drop-item drop-${type}`;
    el.style.left = x + 'px'; el.style.bottom = y + 'px';
    document.getElementById('drop-layer').appendChild(el);
    g.drops.push({ x, y, type, el, active: true });
}
function updateEntities() {
    g.entities.forEach(en => {
        if (!en.active) return;
        let d = g.player.x - en.x;
        if (Math.abs(d) < 600) en.x += Math.sign(d) * (en.isBoss ? 1.2 : 2.0);
        if (Math.abs(d) < (en.isBoss ? 60 : 40) && Math.abs(g.player.y - en.y) < 60) g.player.hp -= en.atk;
        en.el.style.left = en.x + 'px'; en.el.style.bottom = en.y + 'px';
    });
}
function updateMapItems() {
    g.chests.forEach(c => { if (c.active && Math.hypot(g.player.x - c.x, g.player.y - c.y) < 50) { c.active = false; c.el.remove(); g.player.coin += 500; updateUI(); } });
    g.drops.forEach(d => { if (d.active && Math.hypot(g.player.x - d.x, g.player.y - d.y) < 40) { d.active = false; d.el.remove(); if (d.type === 'hp') g.player.hp = Math.min(g.player.maxH, g.player.hp + 30); else g.player.coin += 100; updateUI(); } });
}
function levelUp() { g.player.lvl++; g.player.exp -= g.player.nextExp; g.player.nextExp *= 1.6; g.player.atk += 12; g.player.maxH += 35; g.player.hp = g.player.maxH; }
function completeQuest() { g.player.coin += g.quest.reward; g.quest.current = 0; g.quest.target += 5; g.quest.reward += 200; g.quest.desc = `DIỆT ${g.quest.target} QUÁI`; updateQuestUI(); }
function updateUI() { document.getElementById('ui-lvl').innerText = g.player.lvl; document.getElementById('ui-coin').innerText = g.player.coin; document.getElementById('exp-fill').style.width = (g.player.exp / g.player.nextExp * 100) + '%'; }
function updateQuestUI() { document.getElementById('quest-desc').innerText = `${g.quest.desc} (${g.quest.current}/${g.quest.target})`; }
function toggleShop() { const s = document.getElementById('gui-shop'); s.style.display = (s.style.display === 'none') ? 'flex' : 'none'; g.active = (s.style.display === 'none'); if (g.active) loop(); }
function toggleStats() { const s = document.getElementById('gui-stats'); if (s.style.display === 'none') { document.getElementById('stats-content').innerHTML = `LVL: ${g.player.lvl}<br>ATK: ${g.player.atk}<br>HP: ${Math.floor(g.player.hp)}/${g.player.maxH}<br>DIFF: x${g.diff.toFixed(2)}`; s.style.display = 'flex'; g.active = false; } else { s.style.display = 'none'; g.active = true; loop(); } }
function buyUpgrade(t, p) { if (g.player.coin >= p) { g.player.coin -= p; if (t === 'atk') g.player.atk += 25; else g.player.hp = g.player.maxH; updateUI(); } }

window.onkeydown = e => { g.keys[e.code] = true; if (e.code === 'KeyB') toggleShop(); if (e.code === 'KeyC') toggleStats(); };
window.onkeyup = e => g.keys[e.code] = false;
window.onmousedown = e => { if (e.button === 0) attack(); };
window.onload = initSelection;