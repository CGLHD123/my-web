const classes = [
    { id: 'scout', hp: 160, atk: 35, color: '#00ffcc', type: 'ranged', pj: 'pj-arrow' },
    { id: 'warrior', hp: 350, atk: 65, color: '#ff4444', type: 'melee' },
    { id: 'tanker', hp: 950, atk: 30, color: '#aaaaaa', type: 'melee' },
    { id: 'mage', hp: 130, atk: 140, color: '#4444ff', type: 'ranged', pj: 'pj-magic' },
    { id: 'rogue', hp: 180, atk: 110, color: '#ff00ff', type: 'melee' },
    { id: 'cleric', hp: 250, atk: 55, color: '#ffff00', type: 'ranged', pj: 'pj-magic' },
    { id: 'archer', hp: 160, atk: 95, color: '#ff8800', type: 'ranged', pj: 'pj-arrow' },
    { id: 'necro', hp: 200, atk: 120, color: '#440044', type: 'ranged', pj: 'pj-fire' },
    { id: 'paladin', hp: 480, atk: 75, color: '#ffffff', type: 'melee' },
    { id: 'berserker', hp: 450, atk: 130, color: '#880000', type: 'melee' }
];

let g = {
    active: false, shopOpen: false, helpOpen: false, time: 0, danger: 1,
    player: { x: 200, y: 200, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, speed: 7, gold: 0, xp: 0, nextXp: 100, lvl: 1, ult: 0, dir: 1, ground: false, invul: false },
    quest: { target: 5, current: 0, type: 'kill', desc: 'DIỆT 5 QUÁI VẬT' },
    keys: {}, platforms: [], enemies: [], projectiles: [], chests: [], lastX: 0, lastY: 100
};

// KHOỞI TẠO CHỌN CLASS
window.onload = () => {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const el = document.createElement('div'); el.className = 'class-item';
        el.style.backgroundColor = c.color;
        el.style.backgroundImage = `url('assets/thumbs/${c.id}.png')`;
        el.onmouseover = () => {
            document.getElementById('info-content').innerHTML = `
                <h3 style="color:${c.color}">${c.id.toUpperCase()}</h3>
                <p>KIỂU: ${c.type.toUpperCase()}<br>HP: ${c.hp}<br>ATK: ${c.atk}</p>`;
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
    Object.assign(g.player, { hp: s.hp, maxH: s.hp, atk: s.atk, invul: true });
    setTimeout(() => g.player.invul = false, 2000);

    createPlatform(0, 0, 1500, 100); g.lastX = 1500;
    for (let i = 0; i < 5; i++) generateNextPlatform();

    document.getElementById('player-sprite').style.backgroundColor = s.color;
    document.getElementById('player-sprite').style.backgroundImage = `url('assets/thumbs/${s.id}.png')`;
    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    document.getElementById('hud').style.display = 'block';

    g.active = true;
    setInterval(() => { if (g.active && !g.shopOpen) { g.time++; updateWorld(); } }, 1000);
    updateQuestUI();
    requestAnimationFrame(loop);
}

// HỆ THỐNG NHIỆM VỤ
function updateQuest(type) {
    if (g.quest.type === type) {
        g.quest.current++;
        if (g.quest.current >= g.quest.target) {
            g.player.gold += 150; g.player.xp += 100;
            g.quest.target += 5; g.quest.current = 0;
            g.quest.desc = `DIỆT ${g.quest.target} QUÁI VẬT`;
        }
        updateQuestUI();
    }
}

function updateQuestUI() {
    document.getElementById('quest-desc').innerText = g.quest.desc;
    document.getElementById('quest-fill').style.width = (g.quest.current / g.quest.target * 100) + '%';
}

// CHIẾN ĐẤU
function handleAttack() {
    const p = g.player; const s = g.selected;
    if (s.type === 'melee') {
        const effect = document.getElementById('melee-effect');
        effect.classList.add('slash-anim');
        setTimeout(() => effect.classList.remove('slash-anim'), 100);
        g.enemies.forEach(en => {
            if (en.active && Math.abs((p.x + p.dir * 45) - en.x) < 75 && Math.abs(p.y - en.y) < 60) applyDamage(en);
        });
    } else {
        const el = document.createElement('div'); el.className = `projectile ${s.pj}`;
        document.getElementById('projectile-layer').appendChild(el);
        g.projectiles.push({ x: p.x + 20, y: p.y + 20, vx: p.dir * 22, el });
    }
}

function applyDamage(en) {
    en.hp -= g.player.atk;
    if (en.hp <= 0) {
        en.active = false; en.el.remove();
        g.player.gold += 30; g.player.xp += 40;
        g.player.ult = Math.min(100, g.player.ult + 12);
        updateQuest('kill');
    }
}

// MAP & QUÁI
function generateNextPlatform() {
    const gapX = 160 + Math.random() * 120, gapY = (Math.random() - 0.5) * 130;
    let newY = Math.max(60, Math.min(280, g.lastY + gapY));
    const newW = 500 + Math.random() * 500;
    createPlatform(g.lastX + gapX, newY, newW, 80);

    if (Math.random() < 0.12) spawnChest(g.lastX + gapX + 100, newY + 80);
    if (Math.random() > 0.4) {
        const eEl = document.createElement('div'); eEl.className = 'enemy';
        document.getElementById('entity-layer').appendChild(eEl);
        g.enemies.push({ x: g.lastX + gapX + 200, y: newY + 80, hp: 70 * g.danger, el: eEl, active: true, dir: 1, start: g.lastX + gapX, end: g.lastX + gapX + newW - 40 });
    }
    g.lastX += gapX + newW; g.lastY = newY;
    if (g.platforms.length > 20) { const old = g.platforms.shift(); old.el.remove(); }
}

function spawnChest(x, y) {
    const cEl = document.createElement('div'); cEl.className = 'chest'; cEl.innerText = 'CHEST';
    cEl.style.left = x + 'px'; cEl.style.bottom = y + 'px';
    document.getElementById('drop-layer').appendChild(cEl);
    g.chests.push({ x, y, el: cEl, active: true });
}

function createPlatform(x, y, w, h) {
    const el = document.createElement('div'); el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px';
    document.getElementById('platform-layer').appendChild(el);
    g.platforms.push({ x, y, w, h, el });
}

// LOOP & UPDATE
function loop() { if (g.active) { if (!g.shopOpen && !g.helpOpen) update(); draw(); requestAnimationFrame(loop); } }

function update() {
    const p = g.player;
    if (g.keys['KeyD']) { p.vx = p.speed; p.dir = 1; }
    else if (g.keys['KeyA']) { p.vx = -p.speed; p.dir = -1; }
    else p.vx *= 0.82;
    if (g.keys['Space'] && p.ground) { p.vy = 18; p.ground = false; }
    p.vy -= 0.85; p.x += p.vx; p.y += p.vy;

    // Va chạm platform
    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 35 > plat.x && p.x < plat.x + plat.w && p.vy <= 0 && p.y >= plat.y + plat.h - 15 && p.y <= plat.y + plat.h + 5) {
            p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
        }
    });

    // Rương & Đạn
    g.chests.forEach(ch => { if (ch.active && Math.abs(p.x - ch.x) < 40 && Math.abs(p.y - ch.y) < 40) { ch.active = false; ch.el.remove(); p.gold += 250; p.ult = 100; } });
    g.projectiles.forEach((pj, i) => {
        pj.x += pj.vx; pj.el.style.left = pj.x + 'px'; pj.el.style.bottom = pj.y + 'px';
        g.enemies.forEach(en => { if (en.active && Math.abs(pj.x - en.x) < 60 && Math.abs(pj.y - en.y) < 60) { applyDamage(en); pj.el.remove(); g.projectiles.splice(i, 1); } });
    });

    // Quái vật
    g.enemies.forEach(en => {
        if (!en.active) return;
        en.x += en.dir * (en.isBoss ? 2.5 : 3.5);
        if (en.x >= en.end || en.x <= en.start) en.dir *= -1;
        if (Math.abs(p.x - en.x) < 35 && Math.abs(p.y - en.y) < 40 && !p.invul) p.hp -= 0.8 * g.danger;
    });

    if (p.xp >= p.nextXp) { p.lvl++; p.xp = 0; p.nextXp *= 1.65; p.maxH += 45; p.hp = p.maxH; }
    if (p.x + 1200 > g.lastX) generateNextPlatform();
    if (p.y < -300 || p.hp <= 0) location.reload();
}

function draw() {
    const p = g.player;
    document.getElementById('player-container').style.left = p.x + 'px';
    document.getElementById('player-container').style.bottom = p.y + 'px';
    document.getElementById('player-container').style.transform = `scaleX(${p.dir})`;
    document.getElementById('world').style.transform = `translateX(${-p.x + (window.innerWidth * 0.2)}px)`;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    document.getElementById('xp-fill').style.width = (p.xp / p.nextXp * 100) + '%';
    document.getElementById('ult-fill').style.width = p.ult + '%';
    document.getElementById('gold-val').innerText = p.gold;
    document.getElementById('lvl-val').innerText = p.lvl;
}

// GUI HELPERS
function toggleShop() {
    g.shopOpen = !g.shopOpen; document.getElementById('gui-shop').style.display = g.shopOpen ? 'flex' : 'none';
    if (g.shopOpen) {
        document.getElementById('shop-items').innerHTML = `<div class="shop-card">HEAL (100G) <button onclick="buy('h')">BUY</button></div><div class="shop-card">ATK+30 (300G) <button onclick="buy('a')">BUY</button></div>`;
        document.getElementById('full-stats').innerHTML = `LEVEL: ${g.player.lvl}<br>ATK: ${g.player.atk}<br>MAX HP: ${g.player.maxH}`;
    }
}
function toggleHelp() { g.helpOpen = !g.helpOpen; document.getElementById('gui-help').style.display = g.helpOpen ? 'flex' : 'none'; }
function buy(t) { if (t === 'h' && g.player.gold >= 100) { g.player.gold -= 100; g.player.hp = g.player.maxH; } else if (t === 'a' && g.player.gold >= 300) { g.player.gold -= 300; g.player.atk += 30; } toggleShop(); toggleShop(); }
function updateWorld() {
    g.danger = Math.floor(g.time / 60) + 1;
    let m = Math.floor(g.time / 60), s = g.time % 60;
    document.getElementById('time-val').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    document.getElementById('danger-val').innerText = g.danger;
}

window.addEventListener('mousedown', e => { if (e.button === 0 && g.active && !g.shopOpen) handleAttack(); });
window.addEventListener('keydown', e => {
    g.keys[e.code] = true; if (e.code === 'KeyB') toggleShop(); if (e.code === 'KeyH') toggleHelp();
    if (e.code === 'KeyU' && g.player.ult >= 100) {
        g.player.ult = 0; for (let i = 0; i < 15; i++) {
            const el = document.createElement('div'); el.className = 'projectile pj-fire';
            document.getElementById('projectile-layer').appendChild(el);
            g.projectiles.push({ x: g.player.x, y: g.player.y, vx: (Math.random() - 0.5) * 40, el });
        }
    }
});
window.addEventListener('keyup', e => g.keys[e.code] = false);