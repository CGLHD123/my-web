const classes = [
    { id: 'scout', hp: 160, atk: 35, color: '#00ffcc', type: 'ranged', pj: 'pj-arrow' },
    { id: 'warrior', hp: 350, atk: 60, color: '#ff4444', type: 'melee' },
    { id: 'tanker', hp: 950, atk: 30, color: '#aaaaaa', type: 'melee' },
    { id: 'mage', hp: 130, atk: 130, color: '#4444ff', type: 'ranged', pj: 'pj-magic' },
    { id: 'rogue', hp: 180, atk: 100, color: '#ff00ff', type: 'melee' },
    { id: 'cleric', hp: 250, atk: 50, color: '#ffff00', type: 'ranged', pj: 'pj-magic' },
    { id: 'archer', hp: 160, atk: 90, color: '#ff8800', type: 'ranged', pj: 'pj-arrow' },
    { id: 'necro', hp: 200, atk: 110, color: '#440044', type: 'ranged', pj: 'pj-fire' },
    { id: 'paladin', hp: 450, atk: 65, color: '#ffffff', type: 'melee' },
    { id: 'berserker', hp: 420, atk: 120, color: '#880000', type: 'melee' }
];

let g = {
    active: false, shopOpen: false, time: 0, danger: 1,
    player: { x: 200, y: 200, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, speed: 7, gold: 0, xp: 0, nextXp: 100, lvl: 1, ult: 0, dir: 1, ground: false, invul: false },
    keys: {}, platforms: [], enemies: [], projectiles: [], lastX: 0, lastY: 100
};

function closeTutorial() { document.getElementById('gui-tutorial').style.display = 'none'; document.getElementById('gui-selection').style.display = 'flex'; initSelection(); }

function initSelection() {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const el = document.createElement('div'); el.className = 'class-item';
        el.style.backgroundColor = c.color; el.style.backgroundImage = `url('assets/thumbs/${c.id}.png')`;
        el.onclick = () => {
            document.querySelectorAll('.class-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active'); g.selected = c;
            document.getElementById('start-btn').disabled = false;
        };
        grid.appendChild(el);
    });
}

function initGame() {
    const s = g.selected;
    Object.assign(g.player, { hp: s.hp, maxH: s.hp, atk: s.atk, invul: true });
    setTimeout(() => g.player.invul = false, 2000);

    createPlatform(0, 0, 1500, 100); g.lastX = 1500;
    for (let i = 0; i < 5; i++) generateNextPlatform();

    document.getElementById('player-sprite').style.backgroundColor = s.color;
    document.getElementById('player-sprite').style.backgroundImage = `url('assets/thumbs/${s.id}.png')`;
    document.getElementById('world').style.display = 'block';
    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('hud').style.display = 'block';

    g.active = true;
    setInterval(() => { if (g.active && !g.shopOpen) { g.time++; updateWorld(); } }, 1000);
    requestAnimationFrame(loop);
}

function updateWorld() {
    g.danger = Math.floor(g.time / 45) + 1;
    let m = Math.floor(g.time / 60), s = g.time % 60;
    document.getElementById('time-val').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    document.getElementById('danger-val').innerText = g.danger;
    if (g.time % 120 === 0) spawnBoss();
}

// XỬ LÝ TẤN CÔNG THEO CLASS
function handleAttack() {
    const p = g.player;
    const s = g.selected;

    if (s.type === 'melee') {
        // Cận chiến: Hiện hiệu ứng và check hitbox
        const effect = document.getElementById('melee-effect');
        effect.classList.add('slash-anim');
        setTimeout(() => effect.classList.remove('slash-anim'), 100);

        g.enemies.forEach(en => {
            if (en.active && Math.abs((p.x + p.dir * 40) - en.x) < 70 && Math.abs(p.y - en.y) < 50) {
                applyDamage(en);
            }
        });
    } else {
        // Tầm xa: Bắn đạn
        const el = document.createElement('div');
        el.className = `projectile ${s.pj}`;
        document.getElementById('projectile-layer').appendChild(el);
        g.projectiles.push({ x: p.x + 20, y: p.y + 20, vx: p.dir * 20, el });
    }
}

function applyDamage(en) {
    en.hp -= g.player.atk;
    if (en.hp <= 0) {
        en.active = false; en.el.remove();
        g.player.gold += 25; g.player.xp += 40;
        g.player.ult = Math.min(100, g.player.ult + 10);
    }
}

function loop() { if (g.active) { if (!g.shopOpen) update(); draw(); requestAnimationFrame(loop); } }

function update() {
    const p = g.player;
    if (g.keys['KeyD']) { p.vx = p.speed; p.dir = 1; }
    else if (g.keys['KeyA']) { p.vx = -p.speed; p.dir = -1; }
    else p.vx *= 0.8;
    if (g.keys['Space'] && p.ground) { p.vy = 18; p.ground = false; }
    p.vy -= 0.85; p.x += p.vx; p.y += p.vy;

    // Va chạm sàn
    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 35 > plat.x && p.x < plat.x + plat.w && p.vy <= 0 && p.y >= plat.y + plat.h - 15 && p.y <= plat.y + plat.h + 5) {
            p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
        }
    });

    // Cập nhật đạn
    g.projectiles.forEach((pj, i) => {
        pj.x += pj.vx; pj.el.style.left = pj.x + 'px'; pj.el.style.bottom = pj.y + 'px';
        g.enemies.forEach(en => {
            if (en.active && Math.abs(pj.x - en.x) < 50 && Math.abs(pj.y - en.y) < 50) {
                applyDamage(en); pj.el.remove(); g.projectiles.splice(i, 1);
            }
        });
        if (Math.abs(pj.x - p.x) > 1000) { pj.el.remove(); g.projectiles.splice(i, 1); }
    });

    // Quái đuổi theo
    g.enemies.forEach(en => {
        if (!en.active) return;
        en.x += en.dir * (en.isBoss ? 2 : 3);
        if (en.x >= en.end || en.x <= en.start) en.dir *= -1;
        if (Math.abs(p.x - en.x) < 35 && Math.abs(p.y - en.y) < 40 && !p.invul) p.hp -= 0.6 * g.danger;
    });

    if (p.xp >= p.nextXp) { p.lvl++; p.xp = 0; p.nextXp *= 1.6; p.maxH += 30; p.hp = p.maxH; }
    if (p.x + 1200 > g.lastX) generateNextPlatform();
    if (p.y < -300 || p.hp <= 0) location.reload();
}

function generateNextPlatform() {
    const gapX = 160 + Math.random() * 100, gapY = (Math.random() - 0.5) * 120;
    let newY = Math.max(60, Math.min(280, g.lastY + gapY));
    const newW = 500 + Math.random() * 400;
    createPlatform(g.lastX + gapX, newY, newW, 80);

    if (Math.random() > 0.4) {
        const eEl = document.createElement('div'); eEl.className = 'enemy';
        document.getElementById('entity-layer').appendChild(eEl);
        g.enemies.push({ x: g.lastX + gapX + 150, y: newY + 80, hp: 60 * g.danger, el: eEl, active: true, dir: 1, start: g.lastX + gapX, end: g.lastX + gapX + newW - 40 });
    }
    g.lastX += gapX + newW; g.lastY = newY;
    if (g.platforms.length > 15) { const old = g.platforms.shift(); old.el.remove(); }
}

function createPlatform(x, y, w, h) {
    const el = document.createElement('div'); el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px';
    document.getElementById('platform-layer').appendChild(el);
    g.platforms.push({ x, y, w, h, el });
}

function spawnBoss() {
    const el = document.createElement('div'); el.className = 'boss'; el.innerText = 'OVERLORD';
    document.getElementById('entity-layer').appendChild(el);
    g.enemies.push({ x: g.player.x + 800, y: 150, isBoss: true, hp: 2500 * g.danger, el, active: true, dir: 1, start: g.player.x + 400, end: g.player.x + 2000 });
}

function draw() {
    const p = g.player;
    const playerEl = document.getElementById('player-container');
    playerEl.style.left = p.x + 'px'; playerEl.style.bottom = p.y + 'px';
    playerEl.style.transform = `scaleX(${p.dir})`;
    document.getElementById('world').style.transform = `translateX(${-p.x + (window.innerWidth * 0.2)}px)`;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    document.getElementById('xp-fill').style.width = (p.xp / p.nextXp * 100) + '%';
    document.getElementById('ult-fill').style.width = p.ult + '%';
    document.getElementById('gold-val').innerText = p.gold;
    document.getElementById('lvl-val').innerText = p.lvl;
}

function toggleShop() {
    g.shopOpen = !g.shopOpen; document.getElementById('gui-shop').style.display = g.shopOpen ? 'flex' : 'none';
    if (g.shopOpen) {
        document.getElementById('shop-items').innerHTML = `<div class="shop-card">MÁU (60G) <button onclick="buy('h')">MUA</button></div><div class="shop-card">CÔNG +20 (200G) <button onclick="buy('a')">MUA</button></div>`;
        document.getElementById('full-stats').innerHTML = `ATK: ${g.player.atk}<br>MAX HP: ${g.player.maxH}`;
    }
}
function buy(t) { if (t === 'h' && g.player.gold >= 60) { g.player.gold -= 60; g.player.hp = g.player.maxH; } else if (t === 'a' && g.player.gold >= 200) { g.player.gold -= 200; g.player.atk += 20; } toggleShop(); toggleShop(); }

window.addEventListener('mousedown', e => { if (e.button === 0) handleAttack(); });
window.addEventListener('keydown', e => {
    g.keys[e.code] = true;
    if (e.code === 'KeyB') toggleShop();
    if (e.code === 'KeyU' && g.player.ult >= 100) {
        g.player.ult = 0;
        for (let i = 0; i < 12; i++) {
            const el = document.createElement('div'); el.className = 'projectile pj-fire';
            document.getElementById('projectile-layer').appendChild(el);
            g.projectiles.push({ x: g.player.x, y: g.player.y, vx: (Math.random() - 0.5) * 30, el });
        }
    }
});
window.addEventListener('keyup', e => g.keys[e.code] = false);