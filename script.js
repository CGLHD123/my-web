const classes = [
    { id: 'scout', hp: 160, atk: 35, color: '#00ffcc', type: 'ranged', pj: 'pj-arrow', wp: 'Hunting_Bow.png', thumb: 'Scout.png', sName: 'Bão Tên' },
    { id: 'warrior', hp: 400, atk: 85, color: '#ff4444', type: 'melee', wp: 'Nihonto.png', thumb: 'Warrior.png', sName: 'Xung Kích' },
    { id: 'tanker', hp: 1300, atk: 40, color: '#aaaaaa', type: 'melee', wp: 'Battle_Axe.png', thumb: 'Tanker.png', sName: 'Phản Đòn' },
    { id: 'mage', hp: 140, atk: 220, color: '#4444ff', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png', thumb: 'Mage.png', sName: 'Thiên Thạch' },
    { id: 'rogue', hp: 220, atk: 150, color: '#ff00ff', type: 'melee', wp: 'Knife.png', thumb: 'Rogue.png', sName: 'Ám Sát' },
    { id: 'cleric', hp: 350, atk: 70, color: '#ffff00', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png', thumb: 'Cleric.png', sName: 'Thánh Quang' },
    { id: 'archer', hp: 200, atk: 130, color: '#ff8800', type: 'ranged', pj: 'pj-arrow', wp: 'Hunting_Bow.png', thumb: 'Archer.png', sName: 'Xuyên Tâm' },
    { id: 'necro', hp: 250, atk: 160, color: '#440044', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png', thumb: 'Necromancer.png', sName: 'Triệu Hồi' },
    { id: 'paladin', hp: 600, atk: 95, color: '#ffffff', type: 'melee', wp: 'Nihonto.png', thumb: 'Paladin.png', sName: 'Thần Khiên' },
    { id: 'berserker', hp: 500, atk: 180, color: '#880000', type: 'melee', wp: 'Battle_Axe.png', thumb: 'Berserker.png', sName: 'Cuồng Nộ' }
];

let g = {
    active: false, shopOpen: false, time: 0, danger: 1,
    player: { x: 100, y: 100, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, speed: 7, gold: 0, ult: 0, dir: 1, ground: false, invul: false },
    quest: { target: 3, current: 0 },
    keys: {}, platforms: [], enemies: [], projectiles: [], lastX: 0, lastY: 40
};

window.onload = () => {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const el = document.createElement('div'); el.className = 'class-item';
        el.style.backgroundImage = `url('assets/thumbs/${c.thumb}')`;
        el.onmouseover = () => {
            document.getElementById('info-content').innerHTML = `
                <h3 style="color:${c.color}; margin:0">${c.id.toUpperCase()}</h3>
                <hr style="border:0.5px solid var(--neon)">
                <p>HP: ${c.hp} | ATK: ${c.atk}<br>KỸ NĂNG: <b>${c.sName}</b> (Phím U)</p>`;
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

    // Tạo sàn khởi đầu sát góc trái dưới
    createPlatform(0, 0, 1800, 40); g.lastX = 1800;
    for (let i = 0; i < 6; i++) generateNextPlatform();

    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    document.getElementById('hud').style.display = 'block';
    g.active = true;
    setInterval(() => { if (g.active && !g.shopOpen) { g.time++; updateWorld(); } }, 1000);
    updateQuestUI();
    requestAnimationFrame(loop);
}

function handleSkill() {
    const p = g.player; if (p.ult < 100) return; p.ult = 0;
    const s = g.selected;
    if (s.id === 'warrior') p.vx = p.dir * 45;
    else if (['tanker', 'cleric'].includes(s.id)) p.hp = Math.min(p.maxH, p.hp + p.maxH * 0.3);
    else if (s.id === 'paladin') { p.invul = true; setTimeout(() => p.invul = false, 2000); }
    else {
        for (let i = 0; i < 6; i++) {
            const el = document.createElement('div'); el.className = 'projectile pj-skill';
            document.getElementById('projectile-layer').appendChild(el);
            g.projectiles.push({ x: p.x, y: p.y, vx: p.dir * 12, vy: (i - 3) * 4, startX: p.x, el });
        }
    }
}

function generateNextPlatform() {
    const gapX = 130 + Math.random() * 80, gapY = (Math.random() - 0.5) * 60;
    let newY = Math.max(40, Math.min(220, g.lastY + gapY));
    const newW = 450 + Math.random() * 300;
    createPlatform(g.lastX + gapX, newY, newW, 60);
    spawnEnemy(g.lastX + gapX + 200, newY + 60, g.lastX + gapX, g.lastX + gapX + newW - 50);
    g.lastX += gapX + newW; g.lastY = newY;
}

function spawnEnemy(x, y, start, end) {
    const cont = document.createElement('div'); cont.className = 'enemy-container';
    cont.innerHTML = `<div class="health-bar-mini"><div class="health-fill-mini" style="width:100%"></div></div><div class="enemy-sprite"></div>`;
    document.getElementById('entity-layer').appendChild(cont);
    g.enemies.push({ x, y, hp: 100 * g.danger, maxH: 100 * g.danger, el: cont, active: true, dir: 1, start, end });
}

function update() {
    const p = g.player;
    if (g.keys['KeyD']) { p.vx = p.speed; p.dir = 1; }
    else if (g.keys['KeyA']) { p.vx = -p.speed; p.dir = -1; }
    else p.vx *= 0.82;
    if (g.keys['Space'] && p.ground) { p.vy = 16; p.ground = false; }
    p.vy -= 0.8; p.x += p.vx; p.y += p.vy;

    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 30 > plat.x && p.x < plat.x + plat.w && p.vy <= 0 && p.y >= plat.y + plat.h - 12 && p.y <= plat.y + plat.h + 5) {
            p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
        }
    });

    g.enemies.forEach(en => {
        if (!en.active) return;
        en.x += en.dir * (2 + g.danger * 0.2);
        if (en.x >= en.end || en.x <= en.start) en.dir *= -1;
        en.el.style.left = en.x + 'px'; en.el.style.bottom = en.y + 'px';
        en.el.querySelector('.health-fill-mini').style.width = (en.hp / en.maxH * 100) + '%';
        if (Math.abs(p.x - en.x) < 40 && Math.abs(p.y - en.y) < 40 && !p.invul) p.hp -= 1.5;
    });

    g.projectiles.forEach((pj, i) => {
        pj.x += pj.vx; if (pj.vy) pj.y += pj.vy;
        pj.el.style.left = pj.x + 'px'; pj.el.style.bottom = pj.y + 'px';
        if (Math.abs(pj.x - pj.startX) > 600) { pj.el.remove(); g.projectiles.splice(i, 1); return; }
        g.enemies.forEach(en => {
            if (en.active && Math.abs(pj.x - en.x) < 60 && Math.abs(pj.y - en.y) < 60) {
                en.hp -= p.atk; if (en.hp <= 0) { en.active = false; en.el.remove(); p.gold += 60; p.ult = Math.min(100, p.ult + 20); updateQuest(); }
                pj.el.remove(); g.projectiles.splice(i, 1);
            }
        });
    });

    if (p.x + 1200 > g.lastX) generateNextPlatform();
    if (p.y < -150 || p.hp <= 0) location.reload();
}

function handleAttack() {
    const p = g.player; const s = g.selected;
    if (s.type === 'melee') {
        g.enemies.forEach(en => {
            if (en.active && Math.abs((p.x + p.dir * 40) - en.x) < 90 && Math.abs(p.y - en.y) < 60) {
                en.hp -= p.atk; if (en.hp <= 0) { en.active = false; en.el.remove(); p.gold += 60; p.ult = Math.min(100, p.ult + 15); updateQuest(); }
            }
        });
    } else {
        const el = document.createElement('div'); el.className = `projectile ${s.pj}`;
        document.getElementById('projectile-layer').appendChild(el);
        g.projectiles.push({ x: p.x + 20, y: p.y + 20, vx: p.dir * 22, startX: p.x, el });
    }
}

function updateQuest() {
    g.quest.current++;
    if (g.quest.current >= g.quest.target) { g.player.gold += 500; g.quest.target += 2; g.quest.current = 0; }
    updateQuestUI();
}

function updateQuestUI() {
    document.getElementById('quest-desc').innerText = `DIỆT ${g.quest.target} QUÁI (${g.quest.current}/${g.quest.target})`;
    document.getElementById('quest-fill').style.width = (g.quest.current / g.quest.target * 100) + '%';
}

function draw() {
    const p = g.player;
    document.getElementById('player-container').style.left = p.x + 'px';
    document.getElementById('player-container').style.bottom = p.y + 'px';
    document.getElementById('player-container').style.transform = `scaleX(${p.dir})`;
    document.getElementById('world').style.transform = `translateX(${-p.x + 150}px)`;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    document.getElementById('ult-fill').style.width = p.ult + '%';
    document.getElementById('gold-val').innerText = p.gold;
    document.getElementById('lvl-val').innerText = g.danger;
}

function createPlatform(x, y, w, h) {
    const el = document.createElement('div'); el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px';
    document.getElementById('platform-layer').appendChild(el);
    g.platforms.push({ x, y, w, h, el });
}

function toggleShop() {
    g.shopOpen = !g.shopOpen; document.getElementById('gui-shop').style.display = g.shopOpen ? 'flex' : 'none';
    if (g.shopOpen) {
        document.getElementById('shop-items').innerHTML = `
            <button onclick="buy('h')" class="pixel-btn">HỒI MÁU (100G)</button>
            <button onclick="buy('a')" class="pixel-btn" style="margin-left:10px">CÔNG +50 (600G)</button>`;
        document.getElementById('shop-stats').innerText = `VÀNG: ${g.player.gold} | ATK: ${g.player.atk}`;
    }
}

function buy(t) {
    if (t === 'h' && g.player.gold >= 100) { g.player.gold -= 100; g.player.hp = g.player.maxH; }
    if (t === 'a' && g.player.gold >= 600) { g.player.gold -= 600; g.player.atk += 50; }
    toggleShop(); toggleShop();
}

function updateWorld() {
    g.danger = Math.floor(g.time / 60) + 1;
    let m = Math.floor(g.time / 60), s = g.time % 60;
    document.getElementById('time-val').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    document.getElementById('danger-val').innerText = g.danger;
}

function loop() { if (g.active) { if (!g.shopOpen) update(); draw(); } requestAnimationFrame(loop); }

window.addEventListener('mousedown', e => { if (e.button === 0 && g.active && !g.shopOpen) handleAttack(); });
window.addEventListener('keydown', e => { g.keys[e.code] = true; if (e.code === 'KeyB') toggleShop(); if (e.code === 'KeyU') handleSkill(); });
window.addEventListener('keyup', e => g.keys[e.code] = false);