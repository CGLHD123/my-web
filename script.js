const classes = [
    { id: 'scout', hp: 160, atk: 35, color: '#2d6a4f', type: 'ranged', pj: 'pj-arrow', wp: 'Hunting_Bow.png', thumb: 'Scout.png' },
    { id: 'warrior', hp: 450, atk: 95, color: '#660708', type: 'melee', wp: 'Nihonto.png', thumb: 'Warrior.png' },
    { id: 'tanker', hp: 1400, atk: 45, color: '#3d3d3d', type: 'melee', wp: 'Battle_Axe.png', thumb: 'Tanker.png' },
    { id: 'mage', hp: 150, atk: 240, color: '#03045e', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png', thumb: 'Mage.png' },
    { id: 'rogue', hp: 220, atk: 170, color: '#250902', type: 'melee', wp: 'Knife.png', thumb: 'Rogue.png' },
    { id: 'cleric', hp: 380, atk: 85, color: '#ffb703', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png', thumb: 'Cleric.png' },
    { id: 'archer', hp: 200, atk: 150, color: '#bc6c25', type: 'ranged', pj: 'pj-arrow', wp: 'Hunting_Bow.png', thumb: 'Archer.png' },
    { id: 'necro', hp: 280, atk: 190, color: '#2d004d', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png', thumb: 'Necromancer.png' },
    { id: 'paladin', hp: 700, atk: 115, color: '#f8f9fa', type: 'melee', wp: 'Nihonto.png', thumb: 'Paladin.png' },
    { id: 'berserker', hp: 550, atk: 210, color: '#a4161a', type: 'melee', wp: 'Battle_Axe.png', thumb: 'Berserker.png' }
];

let g = {
    active: false, time: 0, danger: 1,
    player: { x: 100, y: 50, vx: 0, vy: 0, hp: 100, maxH: 100, exp: 0, atk: 10, speed: 7, gold: 0, dir: 1, ground: false },
    quest: { target: 5, current: 0 },
    keys: {}, platforms: [], enemies: [], projectiles: [], items: [], lastX: 0, lastY: 0
};

window.onload = () => {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const el = document.createElement('div'); el.className = 'class-item';
        el.style.backgroundImage = `url('assets/thumbs/${c.thumb}')`; // Tích hợp assets/thumbs/
        el.onclick = () => {
            document.querySelectorAll('.class-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active'); g.selected = c;
            document.getElementById('start-btn').disabled = false;
            document.getElementById('info-panel').innerHTML = `<h3>${c.id.toUpperCase()}</h3><p>ATK: ${c.atk} | HP: ${c.hp}</p>`;
        };
        grid.appendChild(el);
    });
};

function initGame() {
    const s = g.selected;
    Object.assign(g.player, { hp: s.hp, maxH: s.hp, atk: s.atk });
    document.getElementById('weapon-sprite').style.backgroundImage = `url('assets/weapons/${s.wp}')`;
    document.getElementById('player-sprite').style.backgroundColor = s.color;

    // Khởi tạo sàn thấp góc trái
    createPlatform(0, 0, 2000, 50);
    g.lastX = 2000;
    for (let i = 0; i < 5; i++) generateNextPlatform();

    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    g.active = true;
    setInterval(() => { if (g.active) { g.time++; updateWorld(); } }, 1000);
    requestAnimationFrame(loop);
}

function generateNextPlatform() {
    const gapX = 160 + Math.random() * 100, gapY = (Math.random() - 0.5) * 40;
    let newY = Math.max(0, Math.min(100, g.lastY + gapY));
    const newW = 400 + Math.random() * 400;
    createPlatform(g.lastX + gapX, newY, newW, 50);

    // Hệ thống Boss & Rương
    if (g.platforms.length % 6 === 0) spawnEnemy(g.lastX + gapX + 200, newY + 50, true);
    else {
        spawnEnemy(g.lastX + gapX + 150, newY + 50, false);
        if (Math.random() > 0.7) spawnChest(g.lastX + gapX + 300, newY + 50);
    }
    g.lastX += gapX + newW; g.lastY = newY;
}

function spawnEnemy(x, y, isBoss) {
    const el = document.createElement('div'); el.className = 'enemy-container' + (isBoss ? ' boss' : '');
    el.style.cssText = `position:absolute; width:45px; height:45px; bottom:${y}px; left:${x}px; background:#300; border:1px solid #f00;`;
    document.getElementById('entity-layer').appendChild(el);
    g.enemies.push({ x, y, hp: (isBoss ? 600 : 100) * g.danger, el, active: true, dir: 1, isBoss, start: x - 100, end: x + 100 });
}

function spawnChest(x, y) {
    const el = document.createElement('div'); el.className = 'chest';
    el.style.left = x + 'px'; el.style.bottom = y + 'px';
    document.getElementById('entity-layer').appendChild(el);
    g.items.push({ x, y, el, active: true });
}

function handleAttack() {
    const p = g.player; const s = g.selected;
    if (s.type === 'melee') {
        document.getElementById('melee-effect').classList.add('slash-anim');
        setTimeout(() => document.getElementById('melee-effect').classList.remove('slash-anim'), 150);
        g.enemies.forEach(en => {
            if (en.active && Math.abs((p.x + p.dir * 50) - en.x) < 85 && Math.abs(p.y - en.y) < 60) damageEnemy(en);
        });
    } else {
        const el = document.createElement('div'); el.style.cssText = `position:absolute; background:gold; width:20px; height:4px; left:${p.x + 20}px; bottom:${p.y + 25}px;`;
        document.getElementById('projectile-layer').appendChild(el);
        g.projectiles.push({ x: p.x + 20, y: p.y + 25, vx: p.dir * 20, startX: p.x, el });
    }
}

function damageEnemy(en) {
    en.hp -= g.player.atk; createSpark(en.x + 20, en.y + 20);
    if (en.hp <= 0) {
        en.active = false; en.el.remove();
        g.player.gold += en.isBoss ? 500 : 50;
        g.player.exp += en.isBoss ? 150 : 30;
        g.quest.current++; updateQuest();
    }
}

function createSpark(x, y) {
    for (let i = 0; i < 5; i++) {
        const s = document.createElement('div'); s.className = 'spark';
        document.getElementById('fx-layer').appendChild(s);
        let sx = x, sy = y, vx = (Math.random() - 0.5) * 12, vy = (Math.random() - 0.5) * 12;
        const anim = setInterval(() => { sx += vx; sy += vy; s.style.left = sx + 'px'; s.style.bottom = sy + 'px'; }, 20);
        setTimeout(() => { s.remove(); clearInterval(anim); }, 300);
    }
}

function update() {
    const p = g.player;
    if (g.keys['KeyD']) { p.vx = p.speed; p.dir = 1; }
    else if (g.keys['KeyA']) { p.vx = -p.speed; p.dir = -1; }
    else p.vx *= 0.8;
    if (g.keys['Space'] && p.ground) { p.vy = 15; p.ground = false; }
    p.vy -= 0.8; p.x += p.vx; p.y += p.vy;

    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 30 > plat.x && p.x < plat.x + plat.w && p.vy <= 0 && p.y >= plat.y + plat.h - 10 && p.y <= plat.y + plat.h + 5) {
            p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
        }
    });

    g.enemies.forEach(en => {
        if (!en.active) return;
        en.x += en.dir * (en.isBoss ? 1.5 : 2.5);
        if (en.x > en.end || en.x < en.start) en.dir *= -1;
        en.el.style.left = en.x + 'px';
        if (Math.abs(p.x - en.x) < 40 && Math.abs(p.y - en.y) < 40) p.hp -= en.isBoss ? 2 : 0.5;
    });

    g.items.forEach((it, i) => {
        if (it.active && Math.abs(p.x - it.x) < 40 && Math.abs(p.y - it.y) < 40) {
            it.active = false; it.el.remove(); g.player.gold += 300;
        }
    });

    g.projectiles.forEach((pj, i) => {
        pj.x += pj.vx; pj.el.style.left = pj.x + 'px';
        g.enemies.forEach(en => {
            if (en.active && Math.abs(pj.x - en.x) < 40 && Math.abs(pj.y - en.y) < 40) {
                damageEnemy(en); pj.el.remove(); g.projectiles.splice(i, 1);
            }
        });
        if (pj.x > p.x + 800 || pj.x < p.x - 800) { pj.el.remove(); g.projectiles.splice(i, 1); }
    });

    if (p.x + 1000 > g.lastX) generateNextPlatform();
    if (p.y < -200 || p.hp <= 0) location.reload();
}

function updateQuest() {
    if (g.quest.current >= g.quest.target) { g.player.gold += 1000; g.quest.target += 5; g.quest.current = 0; }
    document.getElementById('quest-text').innerText = `Diệt quái: ${g.quest.current}/${g.quest.target}`;
}

function draw() {
    const p = g.player;
    const cont = document.getElementById('player-container');
    cont.style.left = p.x + 'px'; cont.style.bottom = p.y + 'px';
    cont.style.transform = `scaleX(${p.dir})`;
    document.getElementById('world').style.transform = `translateX(${-p.x + 150}px)`;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    document.getElementById('exp-fill').style.width = (p.exp % 100) + '%';
    document.getElementById('gold-val').innerText = g.player.gold;
    document.getElementById('danger-val').innerText = g.danger;
}

function createPlatform(x, y, w, h) {
    const el = document.createElement('div'); el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px';
    document.getElementById('platform-layer').appendChild(el);
    g.platforms.push({ x, y, w, h });
}

function toggleHelp() {
    const h = document.getElementById('gui-help');
    h.style.display = (h.style.display === 'none') ? 'flex' : 'none';
}

function updateWorld() { g.danger = Math.floor(g.time / 60) + 1; }
function loop() { if (g.active) { update(); draw(); requestAnimationFrame(loop); } }

window.addEventListener('mousedown', e => { if (e.button === 0) handleAttack(); });
window.addEventListener('keydown', e => {
    g.keys[e.code] = true;
    if (e.code === 'KeyH') toggleHelp();
});
window.addEventListener('keyup', e => g.keys[e.code] = false);