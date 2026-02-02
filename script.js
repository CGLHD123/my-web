const classes = [
    { id: 'scout', hp: 160, atk: 35, color: '#00ffcc', type: 'ranged', pj: 'pj-arrow', wp: 'Hunting_Bow.png' },
    { id: 'warrior', hp: 400, atk: 80, color: '#ff4444', type: 'melee', wp: 'Nihonto.png' },
    { id: 'tanker', hp: 1200, atk: 45, color: '#aaaaaa', type: 'melee', wp: 'Battle_Axe.png' },
    { id: 'mage', hp: 150, atk: 180, color: '#4444ff', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png' },
    { id: 'rogue', hp: 220, atk: 140, color: '#ff00ff', type: 'melee', wp: 'Knife.png' },
    { id: 'cleric', hp: 300, atk: 75, color: '#ffff00', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png' },
    { id: 'archer', hp: 200, atk: 125, color: '#ff8800', type: 'ranged', pj: 'pj-arrow', wp: 'Hunting_Bow.png' },
    { id: 'necro', hp: 240, atk: 150, color: '#440044', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png' },
    { id: 'paladin', hp: 600, atk: 95, color: '#ffffff', type: 'melee', wp: 'Nihonto.png' },
    { id: 'berserker', hp: 500, atk: 170, color: '#880000', type: 'melee', wp: 'Battle_Axe.png' }
];

let g = {
    active: false, shopOpen: false, time: 0, danger: 1,
    player: { x: 200, y: 200, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, speed: 7, gold: 0, lvl: 1, dir: 1, ground: false },
    quest: { target: 3, current: 0, desc: 'DIỆT 3 QUÁI VẬT' },
    keys: {}, platforms: [], enemies: [], projectiles: [], lastX: 0, lastY: 100
};

// KHỞI TẠO GUI CLASS CHỌN 2 HÀNG
window.onload = () => {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const el = document.createElement('div'); el.className = 'class-item';
        el.style.backgroundColor = c.color;
        el.onmouseover = () => {
            document.getElementById('info-content').innerHTML = `
                <h3 style="color:${c.color}; margin:0">${c.id.toUpperCase()}</h3>
                <hr style="border:0.5px solid #333">
                <p>LOẠI: ${c.type.toUpperCase()}<br>MÁU: ${c.hp}<br>CÔNG: ${c.atk}<br>VŨ KHÍ: ${c.wp.split('.')[0]}</p>`;
        };
        el.onclick = () => {
            document.querySelectorAll('.class-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active'); g.selected = c;
            document.getElementById('start-btn').disabled = false;
        };
        grid.appendChild(el);
    });
};

function initGame() {
    const s = g.selected;
    Object.assign(g.player, { hp: s.hp, maxH: s.hp, atk: s.atk });
    document.getElementById('weapon-sprite').style.backgroundImage = `url('assets/weapons/${s.wp}')`;
    document.getElementById('player-sprite').style.backgroundColor = s.color;

    createPlatform(0, 0, 1500, 100); g.lastX = 1500;
    for (let i = 0; i < 8; i++) generateNextPlatform();

    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    document.getElementById('hud').style.display = 'block';
    g.active = true;
    setInterval(() => { if (g.active && !g.shopOpen) { g.time++; updateWorld(); } }, 1000);
    updateQuestUI();
    requestAnimationFrame(loop);
}

function generateNextPlatform() {
    const gapX = 110 + Math.random() * 70, gapY = (Math.random() - 0.5) * 60;
    let newY = Math.max(80, Math.min(240, g.lastY + gapY));
    const newW = 400 + Math.random() * 300;
    createPlatform(g.lastX + gapX, newY, newW, 80);
    if (Math.random() > 0.45) spawnEnemy(g.lastX + gapX + 200, newY + 80, g.lastX + gapX, g.lastX + gapX + newW - 40);
    g.lastX += gapX + newW; g.lastY = newY;
}

function spawnEnemy(x, y, start, end) {
    const cont = document.createElement('div'); cont.className = 'enemy-container';
    cont.innerHTML = `<div class="health-bar-mini"><div class="health-fill-mini" style="width:100%"></div></div><div class="enemy-sprite"></div>`;
    document.getElementById('entity-layer').appendChild(cont);
    g.enemies.push({ x, y, hp: 100 * g.danger, maxH: 100 * g.danger, el: cont, active: true, dir: 1, start, end });
}

function applyDamage(en) {
    en.hp -= g.player.atk;
    if (en.hp <= 0) {
        en.active = false; en.el.remove();
        g.player.gold += 50; updateQuest();
    }
}

function updateQuest() {
    g.quest.current++;
    if (g.quest.current >= g.quest.target) {
        g.player.gold += 300; g.quest.target += 2; g.quest.current = 0;
        g.quest.desc = `DIỆT ${g.quest.target} QUÁI VẬT`;
    }
    updateQuestUI();
}

function updateQuestUI() {
    document.getElementById('quest-desc').innerText = g.quest.desc;
    document.getElementById('quest-fill').style.width = (g.quest.current / g.quest.target * 100) + '%';
}

function loop() { if (g.active) { if (!g.shopOpen) update(); draw(); requestAnimationFrame(loop); } }

function update() {
    const p = g.player;
    if (g.keys['KeyD']) { p.vx = p.speed; p.dir = 1; }
    else if (g.keys['KeyA']) { p.vx = -p.speed; p.dir = -1; }
    else p.vx *= 0.8;
    if (g.keys['Space'] && p.ground) { p.vy = 17; p.ground = false; }
    p.vy -= 0.85; p.x += p.vx; p.y += p.vy;

    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 30 > plat.x && p.x < plat.x + plat.w && p.vy <= 0 && p.y >= plat.y + plat.h - 15 && p.y <= plat.y + plat.h + 5) {
            p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
        }
    });

    g.enemies.forEach(en => {
        if (!en.active) return;
        en.x += en.dir * 2;
        if (en.x >= en.end || en.x <= en.start) en.dir *= -1;
        en.el.style.left = en.x + 'px'; en.el.style.bottom = en.y + 'px';
        en.el.querySelector('.health-fill-mini').style.width = (en.hp / en.maxH * 100) + '%';
        if (Math.abs(p.x - en.x) < 35 && Math.abs(p.y - en.y) < 40) p.hp -= 1;
    });

    g.projectiles.forEach((pj, i) => {
        pj.x += pj.vx; pj.el.style.left = pj.x + 'px'; pj.el.style.bottom = pj.y + 'px';
        if (Math.abs(pj.x - pj.startX) > 500) { pj.el.remove(); g.projectiles.splice(i, 1); return; }
        g.enemies.forEach(en => { if (en.active && Math.abs(pj.x - en.x) < 60 && Math.abs(pj.y - en.y) < 60) { applyDamage(en); pj.el.remove(); g.projectiles.splice(i, 1); } });
    });

    if (p.x + 1000 > g.lastX) generateNextPlatform();
    if (p.y < -200 || p.hp <= 0) location.reload();
}

function handleAttack() {
    const p = g.player; const s = g.selected;
    if (s.type === 'melee') {
        g.enemies.forEach(en => { if (en.active && Math.abs((p.x + p.dir * 40) - en.x) < 80 && Math.abs(p.y - en.y) < 60) applyDamage(en); });
    } else {
        const el = document.createElement('div'); el.className = `projectile ${s.pj}`;
        document.getElementById('projectile-layer').appendChild(el);
        g.projectiles.push({ x: p.x + 20, y: p.y + 20, vx: p.dir * 25, startX: p.x, el });
    }
}

function draw() {
    const p = g.player;
    document.getElementById('player-container').style.left = p.x + 'px';
    document.getElementById('player-container').style.bottom = p.y + 'px';
    document.getElementById('player-container').style.transform = `scaleX(${p.dir})`;
    document.getElementById('world').style.transform = `translateX(${-p.x + 200}px)`;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    document.getElementById('gold-val').innerText = p.gold;
    document.getElementById('lvl-val').innerText = p.lvl;
}

function createPlatform(x, y, w, h) {
    const el = document.createElement('div'); el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px';
    document.getElementById('platform-layer').appendChild(el);
    g.platforms.push({ x, y, w, h, el });
}

function toggleShop() {
    g.shopOpen = !g.shopOpen; document.getElementById('gui-shop').style.display = g.shopOpen ? 'flex' : 'none';
    if (g.shopOpen) document.getElementById('shop-items').innerHTML = `<button onclick="buy('h')">HỒI MÁU (100G)</button><button onclick="buy('a')">CÔNG+40 (400G)</button>`;
}

function buy(t) {
    if (t === 'h' && g.player.gold >= 100) { g.player.gold -= 100; g.player.hp = g.player.maxH; }
    if (t === 'a' && g.player.gold >= 400) { g.player.gold -= 400; g.player.atk += 40; }
    toggleShop();
}

function updateWorld() {
    g.danger = Math.floor(g.time / 60) + 1;
    let m = Math.floor(g.time / 60), s = g.time % 60;
    document.getElementById('time-val').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    document.getElementById('danger-val').innerText = g.danger;
}

window.addEventListener('mousedown', e => { if (e.button === 0 && g.active && !g.shopOpen) handleAttack(); });
window.addEventListener('keydown', e => { g.keys[e.code] = true; if (e.code === 'KeyB') toggleShop(); });
window.addEventListener('keyup', e => g.keys[e.code] = false);