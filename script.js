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
    active: false, shopOpen: false, time: 0, danger: 1,
    player: { x: 150, y: 50, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, speed: 7, gold: 0, ult: 0, dir: 1, ground: false },
    quest: { target: 3, current: 0 },
    keys: {}, platforms: [], enemies: [], projectiles: [], lastX: 0, lastY: 0
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
            document.getElementById('info-content').innerHTML = `<h3>${c.id.toUpperCase()}</h3><p>LOẠI: ${c.type.toUpperCase()}<br>SÁT THƯƠNG: ${c.atk}<br>SINH MỆNH: ${c.hp}</p>`;
        };
        grid.appendChild(el);
    });
};

function initGame() {
    const s = g.selected;
    Object.assign(g.player, { hp: s.hp, maxH: s.hp, atk: s.atk });
    document.getElementById('weapon-sprite').style.backgroundImage = `url('assets/weapons/${s.wp}')`;
    document.getElementById('player-sprite').style.backgroundColor = s.color;

    // Khởi tạo sàn thấp góc trái dưới
    createPlatform(0, 0, 2000, 50);
    g.lastX = 2000; g.lastY = 0;
    for (let i = 0; i < 6; i++) generateNextPlatform();

    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    document.getElementById('hud').style.display = 'block';
    g.active = true;
    setInterval(() => { if (g.active && !g.shopOpen) { g.time++; updateWorld(); } }, 1000);
    updateQuestUI();
    requestAnimationFrame(loop);
}

function generateNextPlatform() {
    const gapX = 140 + Math.random() * 100, gapY = (Math.random() - 0.5) * 50;
    let newY = Math.max(0, Math.min(120, g.lastY + gapY));
    const newW = 400 + Math.random() * 400;
    createPlatform(g.lastX + gapX, newY, newW, 50);
    spawnEnemy(g.lastX + gapX + 100, newY + 50, g.lastX + gapX, g.lastX + gapX + newW - 50);
    g.lastX += gapX + newW; g.lastY = newY;
}

function spawnEnemy(x, y, start, end) {
    const el = document.createElement('div'); el.className = 'enemy-container';
    el.style.cssText = `position:absolute; width:45px; height:45px; bottom:${y}px; left:${x}px; background:#400; border:1px solid #f00;`;
    document.getElementById('entity-layer').appendChild(el);
    g.enemies.push({ x, y, hp: 80 * g.danger, el, active: true, dir: 1, start, end });
}

function handleAttack() {
    if (!g.active || g.shopOpen) return;
    const p = g.player; const s = g.selected;
    if (s.type === 'melee') {
        const eff = document.getElementById('melee-effect');
        eff.classList.add('slash-anim'); setTimeout(() => eff.classList.remove('slash-anim'), 150);
        g.enemies.forEach(en => {
            if (en.active && Math.abs((p.x + p.dir * 45) - en.x) < 80 && Math.abs(p.y - en.y) < 60) {
                damageEnemy(en);
            }
        });
    } else {
        const el = document.createElement('div'); el.className = `projectile ${s.pj}`;
        el.style.cssText = `position:absolute; background:gold; width:15px; height:4px;`;
        document.getElementById('projectile-layer').appendChild(el);
        g.projectiles.push({ x: p.x + 20, y: p.y + 25, vx: p.dir * 20, startX: p.x, el });
    }
}

function damageEnemy(en) {
    en.hp -= g.player.atk;
    createSpark(en.x + 20, en.y + 20);
    if (en.hp <= 0) {
        en.active = false; en.el.remove();
        g.player.gold += 50; g.player.ult = Math.min(100, g.player.ult + 10);
        g.quest.current++; updateQuest();
    }
}

function createSpark(x, y) {
    for (let i = 0; i < 6; i++) {
        const s = document.createElement('div'); s.className = 'spark';
        document.getElementById('fx-layer').appendChild(s);
        let sx = x, sy = y, vx = (Math.random() - 0.5) * 12, vy = (Math.random() - 0.5) * 12;
        const anim = setInterval(() => {
            sx += vx; sy += vy; vy -= 0.5;
            s.style.left = sx + 'px'; s.style.bottom = sy + 'px';
            if (sy < -10) { s.remove(); clearInterval(anim); }
        }, 20);
        setTimeout(() => { s.remove(); clearInterval(anim); }, 400);
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
        en.x += en.dir * 2; if (en.x > en.end || en.x < en.start) en.dir *= -1;
        en.el.style.left = en.x + 'px';
        if (Math.abs(p.x - en.x) < 40 && Math.abs(p.y - en.y) < 40) p.hp -= 1;
    });

    g.projectiles.forEach((pj, i) => {
        pj.x += pj.vx; pj.el.style.left = pj.x + 'px'; pj.el.style.bottom = pj.y + 'px';
        g.enemies.forEach(en => {
            if (en.active && Math.abs(pj.x - en.x) < 40 && Math.abs(pj.y - en.y) < 40) {
                damageEnemy(en); pj.el.remove(); g.projectiles.splice(i, 1);
            }
        });
        if (Math.abs(pj.x - pj.startX) > 800) { pj.el.remove(); g.projectiles.splice(i, 1); }
    });

    if (p.x + 1000 > g.lastX) generateNextPlatform();
    if (p.y < -100 || p.hp <= 0) location.reload();
}

function updateQuest() {
    if (g.quest.current >= g.quest.target) {
        g.player.gold += 300; g.quest.target += 2; g.quest.current = 0;
    }
    updateQuestUI();
}

function updateQuestUI() {
    document.getElementById('quest-desc').innerText = `Diệt quái vật Abyss (${g.quest.current}/${g.quest.target})`;
    document.getElementById('quest-fill').style.width = (g.quest.current / g.quest.target * 100) + '%';
}

function draw() {
    const p = g.player;
    const cont = document.getElementById('player-container');
    cont.style.left = p.x + 'px'; cont.style.bottom = p.y + 'px';
    cont.style.transform = `scaleX(${p.dir})`;
    document.getElementById('world').style.transform = `translateX(${-p.x + 200}px)`;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    document.getElementById('ult-fill').style.width = p.ult + '%';
    document.getElementById('gold-val').innerText = p.gold;
    document.getElementById('danger-val').innerText = g.danger;
}

function createPlatform(x, y, w, h) {
    const el = document.createElement('div'); el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px';
    document.getElementById('platform-layer').appendChild(el);
    g.platforms.push({ x, y, w, h });
}

function toggleShop() {
    g.shopOpen = !g.shopOpen; document.getElementById('gui-shop').style.display = g.shopOpen ? 'flex' : 'none';
    if (g.shopOpen) {
        document.getElementById('shop-items').innerHTML = `
            <div style="margin-bottom:15px">Vàng của bạn: ${g.player.gold}</div>
            <button class="fantasy-btn" onclick="buy('atk')">Nâng ATK (+20) - 400G</button>
            <button class="fantasy-btn" onclick="buy('hp')">Hồi Máu - 200G</button>
        `;
    }
}

function buy(type) {
    if (type === 'atk' && g.player.gold >= 400) { g.player.gold -= 400; g.player.atk += 20; }
    if (type === 'hp' && g.player.gold >= 200) { g.player.gold -= 200; g.player.hp = g.player.maxH; }
    toggleShop();
}

function updateWorld() {
    g.danger = Math.floor(g.time / 60) + 1;
    let m = Math.floor(g.time / 60), s = g.time % 60;
    document.getElementById('time-val').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
}

function loop() { if (g.active && !g.shopOpen) { update(); draw(); } requestAnimationFrame(loop); }

window.addEventListener('mousedown', e => { if (e.button === 0) handleAttack(); });
window.addEventListener('keydown', e => { g.keys[e.code] = true; if (e.code === 'KeyB') toggleShop(); });
window.addEventListener('keyup', e => g.keys[e.code] = false);