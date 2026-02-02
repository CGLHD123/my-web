const classes = [
    { id: 'Warrior', hp: 500, atk: 90, wp: 'Nihonto.png', type: 'melee', color: '#600' },
    { id: 'Mage', hp: 160, atk: 260, wp: 'Wandering_Staff.png', type: 'ranged', color: '#006' },
    { id: 'Scout', hp: 220, atk: 80, wp: 'Hunting_Bow.png', type: 'ranged', color: '#060' },
    { id: 'Tanker', hp: 1600, atk: 45, wp: 'Battle_Axe.png', type: 'melee', color: '#444' },
    { id: 'Rogue', hp: 280, atk: 190, wp: 'Knife.png', type: 'melee', color: '#222' },
    { id: 'Cleric', hp: 420, atk: 85, wp: 'Wandering_Staff.png', type: 'ranged', color: '#860' },
    { id: 'Archer', hp: 260, atk: 170, wp: 'Hunting_Bow.png', type: 'ranged', color: '#540' },
    { id: 'Necromancer', hp: 320, atk: 210, wp: 'Wandering_Staff.png', type: 'ranged', color: '#304' },
    { id: 'Paladin', hp: 850, atk: 125, wp: 'Nihonto.png', type: 'melee', color: '#ddd' },
    { id: 'Berserker', hp: 650, atk: 230, wp: 'Battle_Axe.png', type: 'melee', color: '#a00' }
];

let g = {
    active: false,
    player: { x: 100, y: 150, vx: 0, vy: 0, hp: 100, maxH: 100, exp: 0, lvl: 1, gold: 0, dir: 1, ground: false },
    plats: [], mobs: [], pjs: [],
    keys: {}, lastX: 0, danger: 1, timer: 0
};

// NẠP GRID 5x2
window.onload = () => {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.backgroundImage = `url('assets/thumbs/${c.id}.png')`;
        card.onclick = () => {
            document.querySelectorAll('.card').forEach(v => v.classList.remove('active'));
            card.classList.add('active');
            g.selected = JSON.parse(JSON.stringify(c)); // Copy dữ liệu tránh tham chiếu
            document.getElementById('start-btn').disabled = false;
            document.getElementById('class-info').innerHTML = `<h3>${c.id.toUpperCase()}</h3>HP: ${c.hp}<br>ATK: ${c.atk}`;
        };
        grid.appendChild(card);
    });
};

function startGame() {
    const s = g.selected;
    Object.assign(g.player, { hp: s.hp, maxH: s.hp });
    document.getElementById('p-sprite').style.backgroundColor = s.color;
    document.getElementById('p-weapon').style.backgroundImage = `url('assets/weapons/${s.wp}')`;
    document.getElementById('gui-select').style.display = 'none';

    addPlat(0, 50, 2000, 50); g.lastX = 2000;
    for (let i = 0; i < 6; i++) spawnMap();

    g.active = true;
    requestAnimationFrame(loop);
    setInterval(() => { if (g.active) { g.timer++; g.danger = 1 + Math.floor(g.timer / 30); } }, 1000);
}

function spawnMap() {
    const w = 400 + Math.random() * 400;
    const x = g.lastX + 160 + Math.random() * 120;
    const y = 60 + Math.random() * 80;
    addPlat(x, y, w, 50);
    const rng = Math.random();
    if (rng > 0.4) spawnMob(x + w / 2, y + 50, 'enemy');
    else if (rng < 0.15) spawnMob(x + w / 2, y + 50, 'chest');
    g.lastX = x + w;
}

function addPlat(x, y, w, h) {
    const el = document.createElement('div');
    el.className = 'platform';
    el.style.cssText = `left:${x}px; bottom:${y}px; width:${w}px; height:${h}px;`;
    document.getElementById('platform-layer').appendChild(el);
    g.plats.push({ x, y, w, h });
}

function spawnMob(x, y, type) {
    const el = document.createElement('div');
    el.className = type;
    el.style.left = x + 'px'; el.style.bottom = y + 'px';
    document.getElementById('entity-layer').appendChild(el);
    g.mobs.push({ x, y, hp: type === 'enemy' ? (100 * g.danger) : 1, el, active: true, type });
}

function attack() {
    if (!g.active || document.getElementById('gui-shop').style.display === 'flex') return;
    const p = g.player; const s = g.selected;
    if (s.type === 'melee') {
        const fx = document.getElementById('p-slash');
        fx.classList.add('slash-anim');
        setTimeout(() => fx.classList.remove('slash-anim'), 120);
        g.mobs.forEach(m => {
            if (m.active && Math.abs((p.x + p.dir * 60) - m.x) < 90 && Math.abs(p.y - m.y) < 60) hit(m);
        });
    } else {
        const pjEl = document.createElement('div');
        pjEl.style.cssText = `position:absolute; left:${p.x}px; bottom:${p.y + 25}px; width:25px; height:4px; background:#fff;`;
        document.getElementById('fx-layer').appendChild(pjEl);
        g.pjs.push({ x: p.x, y: p.y + 25, vx: p.dir * 18, el: pjEl });
    }
}

function hit(m) {
    m.hp -= g.selected.atk;
    if (m.hp <= 0 && m.active) {
        m.active = false; m.el.remove();
        if (m.type === 'chest') g.player.gold += 500;
        else {
            g.player.gold += 50 * g.danger;
            g.player.exp += 34; // Tăng kinh nghiệm
            if (g.player.exp >= 100) levelUp();
        }
    }
}

function levelUp() {
    g.player.lvl++;
    g.player.exp = 0;
    g.player.maxH += 50;
    g.player.hp = g.player.maxH;
    g.selected.atk += 15;
    const fx = document.getElementById('lvl-up-fx');
    fx.classList.add('lvl-anim');
    setTimeout(() => fx.classList.remove('lvl-anim'), 1000);
}

function buy(type) {
    if (type === 'heal' && g.player.gold >= 200) { g.player.hp = g.player.maxH; g.player.gold -= 200; }
    if (type === 'atk' && g.player.gold >= 500) { g.selected.atk += 25; g.player.gold -= 500; }
}

function toggleGUI(id) {
    const el = document.getElementById(id);
    el.style.display = el.style.display === 'none' ? 'flex' : 'none';
}

function loop() {
    if (!g.active) return;
    const p = g.player;

    if (g.keys['KeyD']) { p.vx = 8; p.dir = 1; }
    else if (g.keys['KeyA']) { p.vx = -8; p.dir = -1; }
    else p.vx *= 0.8;

    if (g.keys['Space'] && p.ground) { p.vy = 16; p.ground = false; }
    p.vy -= 0.85; p.x += p.vx; p.y += p.vy;
    p.ground = false;

    g.plats.forEach(pl => {
        if (p.x + 40 > pl.x && p.x < pl.x + pl.w && p.vy <= 0 && p.y >= pl.y + pl.h - 12 && p.y <= pl.y + pl.h + 5) {
            p.y = pl.y + pl.h; p.vy = 0; p.ground = true;
        }
    });

    g.pjs.forEach((pj, i) => {
        pj.x += pj.vx; pj.el.style.left = pj.x + 'px';
        g.mobs.forEach(m => {
            if (m.active && Math.abs(pj.x - m.x) < 40 && Math.abs(pj.y - m.y) < 40) {
                hit(m); pj.el.remove(); g.pjs.splice(i, 1);
            }
        });
    });

    if (p.x + 1200 > g.lastX) spawnMap();
    if (p.y < -300 || p.hp <= 0) location.reload();

    document.getElementById('player').style.left = p.x + 'px';
    document.getElementById('player').style.bottom = p.y + 'px';
    document.getElementById('player').style.transform = `scaleX(${p.dir})`;
    document.getElementById('world').style.transform = `translateX(${-p.x + 200}px)`;
    document.getElementById('parallax-bg').style.transform = `translateX(${-p.x * 0.2}px)`;

    document.getElementById('hp-bar').style.width = (p.hp / p.maxH * 100) + '%';
    document.getElementById('exp-bar').style.width = (p.exp % 100) + '%';
    document.getElementById('gold-val').innerText = g.player.gold;
    document.getElementById('danger-val').innerText = g.danger;
    document.getElementById('lvl-tag').innerText = `LV. ${g.player.lvl}`;

    requestAnimationFrame(loop);
}

window.onkeydown = e => {
    g.keys[e.code] = true;
    if (e.code === 'KeyH') toggleGUI('gui-help');
    if (e.code === 'KeyB') toggleGUI('gui-shop');
};
window.onkeyup = e => g.keys[e.code] = false;
window.onmousedown = e => { if (e.button === 0) attack(); };