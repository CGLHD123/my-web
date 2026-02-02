const classes = [
    { id: 'scout', hp: 160, atk: 35, color: '#1a432e', type: 'ranged', wp: 'Hunting_Bow.png', thumb: 'Scout.png' },
    { id: 'warrior', hp: 450, atk: 95, color: '#4a0e0e', type: 'melee', wp: 'Nihonto.png', thumb: 'Warrior.png' },
    { id: 'tanker', hp: 1400, atk: 45, color: '#2b2b2b', type: 'melee', wp: 'Battle_Axe.png', thumb: 'Tanker.png' },
    { id: 'mage', hp: 150, atk: 240, color: '#0a1a4a', type: 'ranged', wp: 'Wandering_Staff.png', thumb: 'Mage.png' },
    { id: 'rogue', hp: 220, atk: 170, color: '#1a0d0a', type: 'melee', wp: 'Knife.png', thumb: 'Rogue.png' },
    { id: 'cleric', hp: 380, atk: 85, color: '#b8860b', type: 'ranged', wp: 'Wandering_Staff.png', thumb: 'Cleric.png' },
    { id: 'archer', hp: 200, atk: 150, color: '#5c4033', type: 'ranged', wp: 'Hunting_Bow.png', thumb: 'Archer.png' },
    { id: 'necro', hp: 280, atk: 190, color: '#1a0033', type: 'ranged', wp: 'Wandering_Staff.png', thumb: 'Necromancer.png' },
    { id: 'paladin', hp: 700, atk: 115, color: '#d3d3d3', type: 'melee', wp: 'Nihonto.png', thumb: 'Paladin.png' },
    { id: 'berserker', hp: 550, atk: 210, color: '#800000', type: 'melee', wp: 'Battle_Axe.png', thumb: 'Berserker.png' }
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
        el.style.backgroundImage = `url('assets/thumbs/${c.thumb}')`;
        el.onclick = () => {
            document.querySelectorAll('.class-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active'); g.selected = c;
            document.getElementById('start-btn').disabled = false;
            document.getElementById('info-side').innerHTML = `<h2 style="color:var(--gold)">${c.id.toUpperCase()}</h2><p>TYPE: ${c.type.toUpperCase()}</p><p>HP: ${c.hp}<br>ATK: ${c.atk}</p>`;
        };
        grid.appendChild(el);
    });
};

function initGame() {
    const s = g.selected;
    Object.assign(g.player, { hp: s.hp, maxH: s.hp, atk: s.atk });
    document.getElementById('weapon-sprite').style.backgroundImage = `url('assets/weapons/${s.wp}')`;
    document.getElementById('player-sprite').style.backgroundColor = s.color;

    // Khởi tạo sàn sát đáy màn hình (y: 0)
    createPlatform(0, 0, 2000, 50);
    g.lastX = 2000; g.lastY = 0;
    for (let i = 0; i < 6; i++) generateNextPlatform();

    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    g.active = true;
    setInterval(() => { if (g.active) { g.time++; updateWorld(); } }, 1000);
    requestAnimationFrame(loop);
}

function generateNextPlatform() {
    const gapX = 160 + Math.random() * 120, gapY = (Math.random() - 0.5) * 40;
    let newY = Math.max(0, Math.min(100, g.lastY + gapY)); // Giữ map ở tầm thấp
    const newW = 500 + Math.random() * 300;
    createPlatform(g.lastX + gapX, newY, newW, 50);

    if (g.platforms.length % 5 === 0) spawnEnemy(g.lastX + gapX + 250, newY + 50, true);
    else {
        spawnEnemy(g.lastX + gapX + 150, newY + 50, false);
        if (Math.random() > 0.6) spawnChest(g.lastX + gapX + 350, newY + 50);
    }
    g.lastX += gapX + newW; g.lastY = newY;
}

function spawnEnemy(x, y, isBoss) {
    const el = document.createElement('div'); el.className = 'enemy-container' + (isBoss ? ' boss-unit' : '');
    el.style.cssText = `position:absolute; width:45px; height:45px; bottom:${y}px; left:${x}px; background:#200; border:1px solid #900;`;
    document.getElementById('entity-layer').appendChild(el);
    g.enemies.push({ x, y, hp: (isBoss ? 800 : 100) * g.danger, el, active: true, dir: 1, isBoss, start: x - 120, end: x + 120 });
}

function spawnChest(x, y) {
    const el = document.createElement('div'); el.className = 'chest-unit';
    el.style.left = x + 'px'; el.style.bottom = y + 'px';
    document.getElementById('entity-layer').appendChild(el);
    g.items.push({ x, y, el, active: true });
}

function handleAttack() {
    if (!g.active) return;
    const p = g.player; const s = g.selected;
    if (s.type === 'melee') {
        document.getElementById('melee-effect').classList.add('slash-anim');
        setTimeout(() => document.getElementById('melee-effect').classList.remove('slash-anim'), 150);
        g.enemies.forEach(en => {
            if (en.active && Math.abs((p.x + p.dir * 50) - en.x) < 95 && Math.abs(p.y - en.y) < 60) damageEnemy(en);
        });
    } else {
        const pj = document.createElement('div');
        pj.style.cssText = `position:absolute; background:var(--gold); width:25px; height:4px; left:${p.x + 20}px; bottom:${p.y + 25}px; box-shadow:0 0 10px gold;`;
        document.getElementById('projectile-layer').appendChild(pj);
        g.projectiles.push({ x: p.x + 20, y: p.y + 25, vx: p.dir * 22, startX: p.x, el: pj });
    }
}

function damageEnemy(en) {
    en.hp -= g.player.atk; createSpark(en.x + 20, en.y + 20);
    if (en.hp <= 0) {
        en.active = false; en.el.remove();
        g.player.gold += en.isBoss ? 800 : 70;
        g.player.exp += en.isBoss ? 200 : 40;
        g.quest.current++; updateQuest();
    }
}

function createSpark(x, y) {
    for (let i = 0; i < 6; i++) {
        const s = document.createElement('div'); s.className = 'spark-fx';
        document.getElementById('fx-layer').appendChild(s);
        let sx = x, sy = y, vx = (Math.random() - 0.5) * 15, vy = (Math.random() - 0.5) * 15;
        const anim = setInterval(() => { sx += vx; sy += vy; vy -= 0.5; s.style.left = sx + 'px'; s.style.bottom = sy + 'px'; }, 20);
        setTimeout(() => { s.remove(); clearInterval(anim); }, 400);
    }
}

function update() {
    const p = g.player;
    if (g.keys['KeyD']) { p.vx = p.speed; p.dir = 1; }
    else if (g.keys['KeyA']) { p.vx = -p.speed; p.dir = -1; }
    else p.vx *= 0.82;
    if (g.keys['Space'] && p.ground) { p.vy = 16; p.ground = false; }
    p.vy -= 0.85; p.x += p.vx; p.y += p.vy;

    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 30 > plat.x && p.x < plat.x + plat.w && p.vy <= 0 && p.y >= plat.y + plat.h - 10 && p.y <= plat.y + plat.h + 5) {
            p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
        }
    });

    g.enemies.forEach(en => {
        if (!en.active) return;
        en.x += en.dir * (en.isBoss ? 1.8 : 2.8);
        if (en.x > en.end || en.x < en.start) en.dir *= -1;
        en.el.style.left = en.x + 'px';
        if (Math.abs(p.x - en.x) < 40 && Math.abs(p.y - en.y) < 40) p.hp -= en.isBoss ? 2.5 : 0.7;
    });

    g.items.forEach((it, i) => {
        if (it.active && Math.abs(p.x - it.x) < 45 && Math.abs(p.y - it.y) < 45) {
            it.active = false; it.el.remove(); g.player.gold += 400;
        }
    });

    g.projectiles.forEach((pj, i) => {
        pj.x += pj.vx; pj.el.style.left = pj.x + 'px';
        g.enemies.forEach(en => {
            if (en.active && Math.abs(pj.x - en.x) < 40 && Math.abs(pj.y - en.y) < 40) {
                damageEnemy(en); pj.el.remove(); g.projectiles.splice(i, 1);
            }
        });
        if (Math.abs(pj.x - pj.startX) > 850) { pj.el.remove(); g.projectiles.splice(i, 1); }
    });

    if (p.x + 1200 > g.lastX) generateNextPlatform();
    if (p.y < -300 || p.hp <= 0) location.reload();
}

function updateQuest() {
    if (g.quest.current >= g.quest.target) { g.player.gold += 1200; g.quest.target += 5; g.quest.current = 0; }
    document.getElementById('quest-desc').innerText = `Slaying Entities: ${g.quest.current}/${g.quest.target}`;
}

function draw() {
    const p = g.player;
    const cont = document.getElementById('player-container');
    cont.style.left = p.x + 'px'; cont.style.bottom = p.y + 'px';
    cont.style.transform = `scaleX(${p.dir})`;
    document.getElementById('world').style.transform = `translateX(${-p.x + 200}px)`;
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

function updateWorld() { g.danger = Math.floor(g.time / 60) + 1; }
function loop() { if (g.active) { update(); draw(); requestAnimationFrame(loop); } }

window.addEventListener('mousedown', e => { if (e.button === 0) handleAttack(); });
window.addEventListener('keydown', e => g.keys[e.code] = true);
window.addEventListener('keyup', e => g.keys[e.code] = false);