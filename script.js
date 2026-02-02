const classes = [
    { id: 'scout', hp: 120, atk: 25, wp: 'Cung', ult: 'Tăng tốc' },
    { id: 'warrior', hp: 250, atk: 45, wp: 'Kiếm', ult: 'Đạn to' },
    { id: 'tanker', hp: 700, atk: 20, wp: 'Khiên', ult: 'Bất tử' },
    { id: 'mage', hp: 110, atk: 98, wp: 'Gậy Phép', ult: '8 hướng' },
    { id: 'rogue', hp: 140, atk: 80, wp: 'Dao', ult: 'Xuyên thấu' },
    { id: 'cleric', hp: 200, atk: 40, wp: 'Trượng', ult: 'Hồi HP' },
    { id: 'berserker', hp: 350, atk: 90, wp: 'Lưỡi Hái', ult: 'Cuồng nộ' },
    { id: 'archer', hp: 130, atk: 70, wp: 'Cung Cải Tiến', ult: 'Mưa tên' },
    { id: 'paladin', hp: 400, atk: 55, wp: 'Trượng Kiếm', ult: 'Hào quang' },
    { id: 'necro', hp: 160, atk: 85, wp: 'Lưỡi Hái Tối', ult: 'Linh hồn' }
];

let g = {
    active: false, shopOpen: false, time: 0, danger: 1,
    player: { x: 200, y: 300, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, speed: 7.5, gold: 0, xp: 0, nextXp: 100, lvl: 1, ult: 0, dir: 1, ground: false, invul: false, kills: 0 },
    keys: {}, platforms: [], enemies: [], projectiles: [], drops: [], lastX: 0, lastY: 100
};

// Giao diện Hướng dẫn
function closeTutorial() {
    document.getElementById('gui-tutorial').style.display = 'none';
    document.getElementById('gui-selection').style.display = 'flex';
    initSelection();
}

function initSelection() {
    const grid = document.getElementById('class-grid');
    grid.innerHTML = '';
    classes.forEach(c => {
        const el = document.createElement('div'); el.className = 'class-item';
        el.style.backgroundImage = `url('assets/thumbs/${c.id}.png')`;
        el.onclick = () => {
            document.querySelectorAll('.class-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active'); g.selected = c;
            document.getElementById('start-btn').disabled = false;
            document.getElementById('info-content').innerHTML = `<h3>${c.id.toUpperCase()}</h3><p>Vũ khí: ${c.wp}<br>Tuyệt kỹ: ${c.ult}<br>HP: ${c.hp} | ATK: ${c.atk}</p>`;
        };
        grid.appendChild(el);
    });
}

function initGame() {
    const s = g.selected;
    Object.assign(g.player, { hp: s.hp, maxH: s.hp, atk: s.atk });
    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    document.getElementById('hud').style.display = 'block';
    document.getElementById('player-sprite').style.backgroundImage = `url('assets/thumbs/${s.id}.png')`;

    createPlatform(0, 50, 1000, 100); g.lastX = 1000;
    for (let i = 0; i < 5; i++) generateNextPlatform();

    // Danger Scaling Timer
    setInterval(() => {
        if (g.active && !g.shopOpen) {
            g.time++;
            g.danger = Math.floor(g.time / 45) + 1;
            if (g.time % 180 === 0) spawnBoss(); // Boss mỗi 3 phút
            updateTimeDisplay();
        }
    }, 1000);

    g.active = true; loop();
}

function updateTimeDisplay() {
    let m = Math.floor(g.time / 60), s = g.time % 60;
    document.getElementById('time-val').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    document.getElementById('danger-val').innerText = g.danger;
}

function spawnPj() {
    if (!g.active || g.shopOpen) return;
    const el = document.createElement('div'); el.className = 'projectile';
    document.getElementById('projectile-layer').appendChild(el);
    g.projectiles.push({ x: g.player.x + 20, y: g.player.y + 25, vx: g.player.dir * 20, el, active: true });
}

function loop() { if (g.active) { update(); draw(); requestAnimationFrame(loop); } }

function update() {
    if (g.shopOpen) return;
    const p = g.player;

    // Movement
    if (g.keys['KeyD']) { p.vx = p.speed; p.dir = 1; }
    else if (g.keys['KeyA']) { p.vx = -p.speed; p.dir = -1; }
    else p.vx *= 0.8;
    if (g.keys['Space'] && p.ground) { p.vy = 16.5; p.ground = false; }
    p.vy -= 0.85; p.x += p.vx; p.y += p.vy;

    // Platform Collision
    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 35 > plat.x && p.x < plat.x + plat.w && p.vy <= 0 && p.y >= plat.y + plat.h - 15 && p.y <= plat.y + plat.h + 5) {
            p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
        }
    });

    // Entities Logic
    g.projectiles.forEach((pj, i) => {
        pj.x += pj.vx; pj.el.style.left = pj.x + 'px';
        g.enemies.forEach(en => {
            if (en.active && Math.abs(pj.x - en.x) < 60 && Math.abs(pj.y - en.y) < 60) {
                en.hp -= p.atk; pj.active = false; pj.el.remove(); g.projectiles.splice(i, 1);
                if (en.hp <= 0) {
                    en.active = false; en.el.remove(); p.kills++;
                    dropLoot(en.x, en.y, en.isBoss);
                    p.ult = Math.min(100, p.ult + 8);
                }
            }
        });
        if (pj.x < p.x - 1000 || pj.x > p.x + 1000) { pj.el.remove(); g.projectiles.splice(i, 1); }
    });

    g.enemies.forEach(en => {
        if (!en.active) return;
        en.x += en.dir * (en.isBoss ? 2 : 2.5 + g.danger * 0.4);
        if (en.x >= en.end || en.x <= en.start) en.dir *= -1;
        if (Math.abs(p.x - en.x) < 35 && Math.abs(p.y - en.y) < 40 && !p.invul) p.hp -= 0.4 * g.danger;
    });

    g.drops.forEach((d, i) => {
        if (d.active && Math.abs(p.x - d.x) < 60 && Math.abs(p.y - d.y) < 60) {
            d.active = false; d.el.remove(); g.drops.splice(i, 1);
            if (d.type === 'xp') {
                p.xp += 30;
                if (p.xp >= p.nextXp) { p.lvl++; p.xp = 0; p.nextXp *= 1.6; p.maxH += 30; p.hp = p.maxH; }
            } else { p.gold += 20; }
        }
    });

    if (p.x + 1000 > g.lastX) generateNextPlatform();
    if (p.y < -300 || p.hp <= 0) location.reload();
}

function draw() {
    const p = g.player;
    document.getElementById('player-container').style.left = p.x + 'px';
    document.getElementById('player-container').style.bottom = p.y + 'px';
    document.getElementById('player-container').style.transform = `scaleX(${p.dir})`;
    document.getElementById('world').style.transform = `translateX(${-p.x + window.innerWidth / 2}px)`;

    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    document.getElementById('xp-fill').style.width = (p.xp / p.nextXp * 100) + '%';
    document.getElementById('ult-fill').style.width = p.ult + '%';
    document.getElementById('gold-val').innerText = p.gold;
    document.getElementById('lvl-val').innerText = p.lvl;

    g.enemies.forEach(en => { if (en.active) { en.el.style.left = en.x + 'px'; en.el.style.bottom = en.y + 'px'; } });
}

function spawnBoss() {
    const plat = g.platforms[g.platforms.length - 1];
    const el = document.createElement('div'); el.className = 'boss'; el.innerText = 'OVERLORD';
    document.getElementById('entity-layer').appendChild(el);
    g.enemies.push({ x: plat.x + 100, y: plat.y + 100, isBoss: true, hp: 1200 * g.danger, el, active: true, dir: 1, start: plat.x, end: plat.x + plat.w - 130 });
}

function dropLoot(x, y, boss) {
    const count = boss ? 8 : 1;
    for (let i = 0; i < count; i++) {
        ['xp', 'gold'].forEach(type => {
            const el = document.createElement('div'); el.className = type === 'xp' ? 'xp-orb' : 'gold-coin';
            el.style.left = (x + (Math.random() - 0.5) * 60) + 'px'; el.style.bottom = y + 'px';
            document.getElementById('drop-layer').appendChild(el);
            g.drops.push({ x, y, type, el, active: true });
        });
    }
}

function createPlatform(x, y, w, h) {
    const el = document.createElement('div'); el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px';
    document.getElementById('platform-layer').appendChild(el);
    g.platforms.push({ x, y, w, h });
}

function generateNextPlatform() {
    const gapX = 160 + Math.random() * 80, gapY = (Math.random() - 0.5) * 150;
    let newY = Math.max(60, Math.min(350, g.lastY + gapY));
    const newW = 450 + Math.random() * 300;
    createPlatform(g.lastX + gapX, newY, newW, 65);
    const eEl = document.createElement('div'); eEl.className = 'enemy';
    document.getElementById('entity-layer').appendChild(eEl);
    g.enemies.push({ x: g.lastX + gapX + 150, y: newY + 65, hp: 60 + g.danger * 50, el: eEl, active: true, dir: 1, start: g.lastX + gapX, end: g.lastX + gapX + newW - 50 });
    g.lastX += gapX + newW; g.lastY = newY;
}

function toggleShop() {
    g.shopOpen = !g.shopOpen;
    document.getElementById('gui-shop').style.display = g.shopOpen ? 'flex' : 'none';
    if (g.shopOpen) {
        document.getElementById('shop-items').innerHTML = `
            <div class="shop-card"><span>HỒI MÁU (60G)</span><button onclick="buy('h')">MUA</button></div>
            <div class="shop-card"><span>SÁT THƯƠNG +20 (200G)</span><button onclick="buy('a')">MUA</button></div>
            <div class="shop-card"><span>TỐC ĐỘ +1 (150G)</span><button onclick="buy('s')">MUA</button></div>
        `;
        document.getElementById('full-stats').innerHTML = `
            <p>ATK: ${g.player.atk}</p><p>SPEED: ${g.player.speed}</p><p>KILLS: ${g.player.kills}</p>
        `;
    }
}

function buy(t) {
    const p = g.player;
    if (t === 'h' && p.gold >= 60) { p.gold -= 60; p.hp = p.maxH; }
    else if (t === 'a' && p.gold >= 200) { p.gold -= 200; p.atk += 20; }
    else if (t === 's' && p.gold >= 150) { p.gold -= 150; p.speed += 1; }
    toggleShop(); toggleShop();
}

// Input Listeners
window.addEventListener('mousedown', e => { if (e.button === 0) spawnPj(); });
window.addEventListener('keydown', e => {
    g.keys[e.code] = true;
    if (e.code === 'KeyB') toggleShop();
    if (e.code === 'KeyU' && g.player.ult >= 100) {
        g.player.ult = 0;
        if (g.selected.id === 'cleric') g.player.hp = g.player.maxH;
        else for (let i = 0; i < 8; i++) spawnPj();
    }
});
window.addEventListener('keyup', e => g.keys[e.code] = false);