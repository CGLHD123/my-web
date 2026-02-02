const classes = [
    { id: 'warrior', hp: 500, atk: 80, wp: 'Nihonto.png', thumb: 'Warrior.png', type: 'melee', color: '#600' },
    { id: 'mage', hp: 150, atk: 200, wp: 'Wandering_Staff.png', thumb: 'Mage.png', type: 'ranged', color: '#006' },
    { id: 'scout', hp: 200, atk: 60, wp: 'Hunting_Bow.png', thumb: 'Scout.png', type: 'ranged', color: '#060' },
    { id: 'tanker', hp: 1200, atk: 40, wp: 'Battle_Axe.png', thumb: 'Tanker.png', type: 'melee', color: '#444' },
    { id: 'rogue', hp: 250, atk: 120, wp: 'Knife.png', thumb: 'Rogue.png', type: 'melee', color: '#222' },
    { id: 'cleric', hp: 300, atk: 70, wp: 'Wandering_Staff.png', thumb: 'Cleric.png', type: 'ranged', color: '#860' },
    { id: 'archer', hp: 220, atk: 130, wp: 'Hunting_Bow.png', thumb: 'Archer.png', type: 'ranged', color: '#530' },
    { id: 'necro', hp: 280, atk: 150, wp: 'Wandering_Staff.png', thumb: 'Necromancer.png', type: 'ranged', color: '#304' },
    { id: 'paladin', hp: 700, atk: 100, wp: 'Nihonto.png', thumb: 'Paladin.png', type: 'melee', color: '#ddd' },
    { id: 'berserker', hp: 550, atk: 180, wp: 'Battle_Axe.png', thumb: 'Berserker.png', type: 'melee', color: '#a00' }
];

let g = {
    active: false,
    player: { x: 100, y: 50, vx: 0, vy: 0, hp: 100, maxH: 100, exp: 0, gold: 0, dir: 1, ground: false },
    platforms: [], enemies: [], pjs: [],
    keys: {}, lastX: 0, danger: 1, time: 0
};

window.onload = () => {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const btn = document.createElement('div');
        btn.className = 'class-btn';
        btn.style.backgroundImage = `url('assets/thumbs/${c.thumb}')`;
        btn.onclick = () => {
            document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            g.selected = c;
            document.getElementById('start-btn').disabled = false;
            document.getElementById('class-info').innerHTML = `<h3>${c.id.toUpperCase()}</h3><p>HP: ${c.hp}<br>ATK: ${c.atk}</p>`;
        };
        grid.appendChild(btn);
    });
};

function startGame() {
    const s = g.selected;
    Object.assign(g.player, { hp: s.hp, maxH: s.hp });
    document.getElementById('player-sprite').style.backgroundColor = s.color;
    document.getElementById('weapon-sprite').style.backgroundImage = `url('assets/weapons/${s.wp}')`;
    document.getElementById('gui-select').style.display = 'none';

    // Tạo map ban đầu
    createPlat(0, 0, 2000, 50); g.lastX = 2000;
    for (let i = 0; i < 5; i++) spawnMap();

    g.active = true;
    requestAnimationFrame(loop);
    setInterval(() => { if (g.active) g.time++; g.danger = Math.floor(g.time / 60) + 1; }, 1000);
}

function spawnMap() {
    const w = 400 + Math.random() * 300;
    const x = g.lastX + 150 + Math.random() * 100;
    const y = Math.random() * 80; // Giữ map ở tầm thấp
    createPlat(x, y, w, 50);

    // Spawn quái hoặc rương
    if (Math.random() > 0.3) spawnEnemy(x + w / 2, y + 50);
    else spawnChest(x + w / 2, y + 50);

    g.lastX = x + w;
}

function createPlat(x, y, w, h) {
    const el = document.createElement('div');
    el.className = 'platform';
    el.style.cssText = `left:${x}px; bottom:${y}px; width:${w}px; height:${h}px;`;
    document.getElementById('platform-layer').appendChild(el);
    g.platforms.push({ x, y, w, h });
}

function spawnEnemy(x, y) {
    const isBoss = Math.random() > 0.8;
    const el = document.createElement('div');
    el.style.cssText = `position:absolute; left:${x}px; bottom:${y}px; width:40px; height:40px; background:#300; border:2px solid red;`;
    if (isBoss) el.style.transform = 'scale(2)';
    document.getElementById('entity-layer').appendChild(el);
    g.enemies.push({ x, y, hp: isBoss ? 500 : 100, el, active: true, isBoss });
}

function spawnChest(x, y) {
    const el = document.createElement('div');
    el.style.cssText = `position:absolute; left:${x}px; bottom:${y}px; width:30px; height:25px; background:gold; border:2px solid #540;`;
    document.getElementById('entity-layer').appendChild(el);
    g.enemies.push({ x, y, hp: 1, el, active: true, isChest: true });
}

function attack() {
    const p = g.player; const s = g.selected;
    if (s.type === 'melee') {
        const fx = document.getElementById('slash-fx');
        fx.classList.add('slash-active');
        setTimeout(() => fx.classList.remove('slash-active'), 150);
        g.enemies.forEach(en => {
            if (en.active && Math.abs((p.x + p.dir * 50) - en.x) < 80 && Math.abs(p.y - en.y) < 60) damage(en);
        });
    } else {
        const pjEl = document.createElement('div');
        pjEl.style.cssText = `position:absolute; left:${p.x}px; bottom:${p.y + 20}px; width:20px; height:5px; background:yellow;`;
        document.getElementById('fx-layer').appendChild(pjEl);
        g.pjs.push({ x: p.x, y: p.y + 20, vx: p.dir * 15, el: pjEl });
    }
}

function damage(en) {
    en.hp -= g.selected.atk;
    if (en.hp <= 0 && en.active) {
        en.active = false; en.el.remove();
        if (en.isChest) g.player.gold += 200;
        else { g.player.gold += 50; g.player.exp += 30; }
        updateQuest();
    }
}

function updateQuest() {
    const count = g.enemies.filter(e => !e.active && !e.isChest).length;
    document.getElementById('quest-val').innerText = `${count % 5}/5`;
    if (count > 0 && count % 5 === 0) g.player.gold += 500;
}

function loop() {
    if (!g.active) return;
    const p = g.player;

    // Di chuyển
    if (g.keys['KeyD']) { p.vx = 7; p.dir = 1; }
    else if (g.keys['KeyA']) { p.vx = -7; p.dir = -1; }
    else p.vx *= 0.8;

    if (g.keys['Space'] && p.ground) { p.vy = 15; p.ground = false; }

    p.vy -= 0.8; p.x += p.vx; p.y += p.vy;
    p.ground = false;

    // Va chạm sàn
    g.platforms.forEach(plat => {
        if (p.x + 40 > plat.x && p.x < plat.x + plat.w && p.vy <= 0 && p.y >= plat.y + plat.h - 10 && p.y <= plat.y + plat.h + 5) {
            p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
        }
    });

    // Đạn
    g.pjs.forEach((pj, i) => {
        pj.x += pj.vx; pj.el.style.left = pj.x + 'px';
        g.enemies.forEach(en => {
            if (en.active && Math.abs(pj.x - en.x) < 40 && Math.abs(pj.y - en.y) < 40) {
                damage(en); pj.el.remove(); g.pjs.splice(i, 1);
            }
        });
    });

    // Camera & Sinh Map
    if (p.x + 1000 > g.lastX) spawnMap();
    if (p.y < -200 || p.hp <= 0) location.reload();

    draw();
    requestAnimationFrame(loop);
}

function draw() {
    const p = g.player;
    const node = document.getElementById('player-node');
    node.style.left = p.x + 'px';
    node.style.bottom = p.y + 'px';
    node.style.transform = `scaleX(${p.dir})`;

    document.getElementById('world').style.transform = `translateX(${-p.x + 100}px)`;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    document.getElementById('exp-fill').style.width = (p.exp % 100) + '%';
    document.getElementById('gold-val').innerText = p.gold;
    document.getElementById('danger-val').innerText = g.danger;
}

function toggleHelp() {
    const h = document.getElementById('gui-help');
    h.style.display = h.style.display === 'none' ? 'flex' : 'none';
}

window.onkeydown = e => { g.keys[e.code] = true; if (e.code === 'KeyH') toggleHelp(); };
window.onkeyup = e => g.keys[e.code] = false;
window.onmousedown = e => { if (e.button === 0) attack(); };