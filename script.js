const classes = [
    { id: 'scout', hp: 160, atk: 35, color: '#00ffcc', type: 'ranged', pj: 'pj-arrow', wp: 'Hunting_Bow.png' },
    { id: 'warrior', hp: 380, atk: 75, color: '#ff4444', type: 'melee', wp: 'Nihonto.png' },
    { id: 'tanker', hp: 1200, atk: 40, color: '#aaaaaa', type: 'melee', wp: 'Battle_Axe.png' },
    { id: 'mage', hp: 140, atk: 160, color: '#4444ff', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png' },
    { id: 'rogue', hp: 200, atk: 120, color: '#ff00ff', type: 'melee', wp: 'Knife.png' },
    { id: 'cleric', hp: 280, atk: 65, color: '#ffff00', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png' },
    { id: 'archer', hp: 180, atk: 110, color: '#ff8800', type: 'ranged', pj: 'pj-arrow', wp: 'Hunting_Bow.png' },
    { id: 'necro', hp: 220, atk: 130, color: '#440044', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png' },
    { id: 'paladin', hp: 550, atk: 85, color: '#ffffff', type: 'melee', wp: 'Nihonto.png' },
    { id: 'berserker', hp: 480, atk: 150, color: '#880000', type: 'melee', wp: 'Battle_Axe.png' }
];

let g = {
    active: false, shopOpen: false, time: 0, danger: 1,
    player: { x: 200, y: 200, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, speed: 7, baseSpeed: 7, gold: 0, xp: 0, nextXp: 100, lvl: 1, ult: 0, dir: 1, ground: false, invul: false },
    quest: { target: 5, current: 0, desc: 'DIỆT 5 QUÁI VẬT' },
    buff: { active: false, timer: 0 },
    keys: {}, platforms: [], enemies: [], projectiles: [], chests: [], lastX: 0, lastY: 100
};

window.onload = () => {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const el = document.createElement('div'); el.className = 'class-item';
        el.style.backgroundColor = c.color;
        el.onmouseover = () => {
            document.getElementById('info-content').innerHTML = `
                <h3 style="color:${c.color}">${c.id.toUpperCase()}</h3>
                <p>KIỂU: ${c.type.toUpperCase()}<br>WP: ${c.wp.split('.')[0]}<br>HP: ${c.hp}<br>ATK: ${c.atk}</p>`;
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

    // Gán vũ khí lên tay
    document.getElementById('weapon-sprite').style.backgroundImage = `url('assets/weapons/${s.wp}')`;
    document.getElementById('player-sprite').style.backgroundColor = s.color;

    createPlatform(0, 0, 1500, 100); g.lastX = 1500;
    for (let i = 0; i < 8; i++) generateNextPlatform();

    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    document.getElementById('hud').style.display = 'block';

    g.active = true;
    setInterval(() => { if (g.active && !g.shopOpen) { g.time++; if (g.buff.active) updateBuff(); } }, 1000);
    requestAnimationFrame(loop);
}

function updateBuff() {
    g.buff.timer--;
    document.getElementById('buff-val').innerText = g.buff.timer;
    if (g.buff.timer <= 0) {
        g.buff.active = false; g.player.speed = g.player.baseSpeed;
        document.getElementById('buff-timer').style.display = 'none';
    }
}

function handleAttack() {
    const p = g.player; const s = g.selected;
    if (s.type === 'melee') {
        const effect = document.getElementById('melee-effect');
        effect.classList.add('slash-anim');
        setTimeout(() => effect.classList.remove('slash-anim'), 100);
        g.enemies.forEach(en => {
            if (en.active && Math.abs((p.x + p.dir * 50) - en.x) < 85 && Math.abs(p.y - en.y) < 60) applyDamage(en);
        });
    } else {
        const el = document.createElement('div'); el.className = `projectile ${s.pj}`;
        document.getElementById('projectile-layer').appendChild(el);
        // GIẢM KHOẢNG CÁCH ĐẠN: startX lưu lại điểm bắn
        g.projectiles.push({ x: p.x + 20, y: p.y + 20, vx: p.dir * 25, startX: p.x, el });
    }
}

function applyDamage(en) {
    en.hp -= g.player.atk;
    if (en.hp <= 0) {
        en.active = false; en.el.remove();
        g.player.gold += 35; g.player.xp += 50;
        updateQuest();
    }
}

function updateQuest() {
    g.quest.current++;
    if (g.quest.current >= g.quest.target) {
        g.player.gold += 250; g.quest.target += 5; g.quest.current = 0;
        g.quest.desc = `DIỆT ${g.quest.target} QUÁI VẬT`;
    }
    document.getElementById('quest-desc').innerText = g.quest.desc;
    document.getElementById('quest-fill').style.width = (g.quest.current / g.quest.target * 100) + '%';
}

function generateNextPlatform() {
    // CHỈNH BẬC NHẢY CỰC GẦN: ngang max 180, dọc max 80
    const gapX = 120 + Math.random() * 60, gapY = (Math.random() - 0.5) * 80;
    let newY = Math.max(80, Math.min(240, g.lastY + gapY));
    const newW = 400 + Math.random() * 300;
    createPlatform(g.lastX + gapX, newY, newW, 80);

    if (Math.random() < 0.1) spawnChest(g.lastX + gapX + 100, newY + 80);
    if (Math.random() > 0.5) {
        const eEl = document.createElement('div'); eEl.className = 'enemy';
        document.getElementById('entity-layer').appendChild(eEl);
        g.enemies.push({ x: g.lastX + gapX + 200, y: newY + 80, hp: 100, el: eEl, active: true, dir: 1, start: g.lastX + gapX, end: g.lastX + gapX + newW - 40 });
    }
    g.lastX += gapX + newW; g.lastY = newY;
}

function spawnChest(x, y) {
    const cEl = document.createElement('div'); cEl.className = 'chest'; cEl.innerText = 'BOX';
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

function loop() { if (g.active) { if (!g.shopOpen) update(); draw(); requestAnimationFrame(loop); } }

function update() {
    const p = g.player;
    if (g.keys['KeyD']) { p.vx = p.speed; p.dir = 1; }
    else if (g.keys['KeyA']) { p.vx = -p.speed; p.dir = -1; }
    else p.vx *= 0.8;
    if (g.keys['Space'] && p.ground) { p.vy = 16; p.ground = false; }
    p.vy -= 0.8; p.x += p.vx; p.y += p.vy;

    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 35 > plat.x && p.x < plat.x + plat.w && p.vy <= 0 && p.y >= plat.y + plat.h - 15 && p.y <= plat.y + plat.h + 5) {
            p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
        }
    });

    g.chests.forEach(ch => { if (ch.active && Math.abs(p.x - ch.x) < 40 && Math.abs(p.y - ch.y) < 40) { ch.active = false; ch.el.remove(); handleChest(); } });

    // HỦY ĐẠN TẦM NGẮN (500px)
    g.projectiles.forEach((pj, i) => {
        pj.x += pj.vx; pj.el.style.left = pj.x + 'px'; pj.el.style.bottom = pj.y + 'px';
        if (Math.abs(pj.x - pj.startX) > 500) { pj.el.remove(); g.projectiles.splice(i, 1); return; }
        g.enemies.forEach(en => { if (en.active && Math.abs(pj.x - en.x) < 60 && Math.abs(pj.y - en.y) < 60) { applyDamage(en); pj.el.remove(); g.projectiles.splice(i, 1); } });
    });

    g.enemies.forEach(en => {
        if (!en.active) return;
        en.x += en.dir * 3;
        if (en.x >= en.end || en.x <= en.start) en.dir *= -1;
        if (Math.abs(p.x - en.x) < 35 && Math.abs(p.y - en.y) < 40 && !p.invul) p.hp -= 1.5;
    });

    if (p.x + 1000 > g.lastX) generateNextPlatform();

    // RESET TỨC THÌ
    if (p.y < -150 || p.hp <= 0) location.reload();
}

function handleChest() {
    g.player.gold += 300; g.buff.active = true; g.buff.timer = 8;
    g.player.speed = g.player.baseSpeed * 1.5;
    document.getElementById('buff-name').innerText = "SPEED UP";
    document.getElementById('buff-timer').style.display = 'block';
}

function draw() {
    const p = g.player;
    const cont = document.getElementById('player-container');
    cont.style.left = p.x + 'px'; cont.style.bottom = p.y + 'px';
    cont.style.transform = `scaleX(${p.dir})`;
    document.getElementById('world').style.transform = `translateX(${-p.x + 150}px)`;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    document.getElementById('xp-fill').style.width = (p.xp / p.nextXp * 100) + '%';
    document.getElementById('gold-val').innerText = p.gold;
    document.getElementById('lvl-val').innerText = p.lvl;
}

function toggleShop() { g.shopOpen = !g.shopOpen; document.getElementById('gui-shop').style.display = g.shopOpen ? 'flex' : 'none'; }
function toggleHelp() { document.getElementById('gui-help').style.display = document.getElementById('gui-help').style.display === 'none' ? 'flex' : 'none'; }

window.addEventListener('mousedown', e => { if (e.button === 0 && g.active && !g.shopOpen) handleAttack(); });
window.addEventListener('keydown', e => {
    g.keys[e.code] = true;
    if (e.code === 'KeyB') toggleShop();
    if (e.code === 'KeyH') toggleHelp();
    if (e.code === 'KeyU' && g.player.ult >= 100) {
        g.player.ult = 0; for (let i = 0; i < 10; i++) {
            const el = document.createElement('div'); el.className = 'projectile pj-fire';
            document.getElementById('projectile-layer').appendChild(el);
            g.projectiles.push({ x: g.player.x, y: g.player.y, vx: (Math.random() - 0.5) * 40, startX: g.player.x, el });
        }
    }
});
window.addEventListener('keyup', e => g.keys[e.code] = false);