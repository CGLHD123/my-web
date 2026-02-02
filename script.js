const classes = [
    { id: 'warrior', hp: 500, atk: 90, wp: 'Nihonto.png', thumb: 'Warrior.png', type: 'melee', color: '#600' },
    { id: 'mage', hp: 150, atk: 250, wp: 'Wandering_Staff.png', thumb: 'Mage.png', type: 'ranged', color: '#006' },
    { id: 'scout', hp: 200, atk: 70, wp: 'Hunting_Bow.png', thumb: 'Scout.png', type: 'ranged', color: '#060' },
    { id: 'tanker', hp: 1500, atk: 40, wp: 'Battle_Axe.png', thumb: 'Tanker.png', type: 'melee', color: '#444' },
    { id: 'rogue', hp: 280, atk: 180, wp: 'Knife.png', thumb: 'Rogue.png', type: 'melee', color: '#222' },
    { id: 'cleric', hp: 400, atk: 80, wp: 'Wandering_Staff.png', thumb: 'Cleric.png', type: 'ranged', color: '#860' },
    { id: 'archer', hp: 250, atk: 160, wp: 'Hunting_Bow.png', thumb: 'Archer.png', type: 'ranged', color: '#540' },
    { id: 'necro', hp: 300, atk: 200, wp: 'Wandering_Staff.png', thumb: 'Necromancer.png', type: 'ranged', color: '#304' },
    { id: 'paladin', hp: 800, atk: 120, wp: 'Nihonto.png', thumb: 'Paladin.png', type: 'melee', color: '#ddd' },
    { id: 'berserker', hp: 600, atk: 220, wp: 'Battle_Axe.png', thumb: 'Berserker.png', type: 'melee', color: '#a00' }
];

let g = {
    active: false,
    player: { x: 100, y: 50, vx: 0, vy: 0, hp: 100, maxH: 100, exp: 0, gold: 0, dir: 1, onGround: false },
    platforms: [], enemies: [], pjs: [],
    keys: {}, lastX: 0, danger: 1, ticks: 0
};

// NẠP 10 CLASS VÀO GRID 5x2
window.onload = () => {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const card = document.createElement('div');
        card.className = 'class-card';
        // Đường dẫn chính xác tới assets/thumbs/
        card.style.backgroundImage = `url('assets/thumbs/${c.thumb}')`;

        card.onclick = () => {
            document.querySelectorAll('.class-card').forEach(el => el.classList.remove('active'));
            card.classList.add('active');
            g.selected = c;
            document.getElementById('launch-btn').disabled = false;
            document.getElementById('detail-content').innerHTML = `
                <h2 style="color:var(--gold);margin-top:0">${c.id.toUpperCase()}</h2>
                <p style="color:#aaa">Class: ${c.type === 'melee' ? 'Cận Chiến' : 'Tầm Xa'}</p>
                <div style="font-size:1.1rem; line-height:1.6">
                    Máu (VIT): ${c.hp}<br>Tấn công (ATK): ${c.atk}
                </div>
            `;
        };
        grid.appendChild(card);
    });
};

function startGame() {
    const s = g.selected;
    Object.assign(g.player, { hp: s.hp, maxH: s.hp });
    document.getElementById('sprite').style.backgroundColor = s.color;
    document.getElementById('weapon').style.backgroundImage = `url('assets/weapons/${s.wp}')`;
    document.getElementById('gui-selection').style.display = 'none';

    addPlat(0, 0, 2000, 50); g.lastX = 2000;
    for (let i = 0; i < 5; i++) buildWorld();

    g.active = true;
    requestAnimationFrame(loop);
    setInterval(() => { if (g.active) { g.ticks++; g.danger = Math.floor(g.ticks / 60) + 1; } }, 1000);
}

function buildWorld() {
    const w = 400 + Math.random() * 400;
    const x = g.lastX + 160 + Math.random() * 100;
    const y = Math.random() * 70; // Map thấp
    addPlat(x, y, w, 50);
    if (Math.random() > 0.4) spawnMob(x + w / 2, y + 50);
    g.lastX = x + w;
}

function addPlat(x, y, w, h) {
    const el = document.createElement('div');
    el.className = 'platform';
    el.style.cssText = `left:${x}px; bottom:${y}px; width:${w}px; height:${h}px;`;
    document.getElementById('platform-layer').appendChild(el);
    g.platforms.push({ x, y, w, h });
}

function spawnMob(x, y) {
    const el = document.createElement('div');
    el.className = 'enemy';
    el.style.cssText = `left:${x}px; bottom:${y}px;`;
    document.getElementById('entity-layer').appendChild(el);
    g.enemies.push({ x, y, hp: 100 * g.danger, el, active: true });
}

function performAttack() {
    if (!g.active) return;
    const p = g.player; const s = g.selected;
    if (s.type === 'melee') {
        const fx = document.getElementById('atk-fx');
        fx.classList.add('slash-anim');
        setTimeout(() => fx.classList.remove('slash-anim'), 150);
        g.enemies.forEach(en => {
            if (en.active && Math.abs((p.x + p.dir * 60) - en.x) < 90 && Math.abs(p.y - en.y) < 60) {
                en.hp -= s.atk; checkKill(en);
            }
        });
    } else {
        const pj = document.createElement('div');
        pj.style.cssText = `position:absolute; left:${p.x}px; bottom:${p.y + 25}px; width:25px; height:4px; background:#ff0; box-shadow:0 0 10px #ff0;`;
        document.getElementById('fx-layer').appendChild(pj);
        g.pjs.push({ x: p.x, y: p.y + 25, vx: p.dir * 20, el: pj });
    }
}

function checkKill(en) {
    if (en.hp <= 0 && en.active) {
        en.active = false; en.el.remove();
        g.player.gold += 50; g.player.exp += 30;
    }
}

function loop() {
    if (!g.active) return;
    const p = g.player;

    if (g.keys['KeyD']) { p.vx = 7.5; p.dir = 1; }
    else if (g.keys['KeyA']) { p.vx = -7.5; p.dir = -1; }
    else p.vx *= 0.8;

    if (g.keys['Space'] && p.onGround) { p.vy = 16; p.onGround = false; }

    p.vy -= 0.85; p.x += p.vx; p.y += p.vy;
    p.onGround = false;

    g.platforms.forEach(plat => {
        if (p.x + 40 > plat.x && p.x < plat.x + plat.w && p.vy <= 0 && p.y >= plat.y + plat.h - 12 && p.y <= plat.y + plat.h + 5) {
            p.y = plat.y + plat.h; p.vy = 0; p.onGround = true;
        }
    });

    g.pjs.forEach((pj, i) => {
        pj.x += pj.vx; pj.el.style.left = pj.x + 'px';
        g.enemies.forEach(en => {
            if (en.active && Math.abs(pj.x - en.x) < 40 && Math.abs(pj.y - en.y) < 40) {
                en.hp -= g.selected.atk; checkKill(en);
                pj.el.remove(); g.pjs.splice(i, 1);
            }
        });
        if (Math.abs(pj.x - p.x) > 1000) { pj.el.remove(); g.pjs.splice(i, 1); }
    });

    if (p.x + 1200 > g.lastX) buildWorld();
    if (p.y < -300 || p.hp <= 0) location.reload();

    // RENDER
    const el = document.getElementById('player-entity');
    el.style.left = p.x + 'px'; el.style.bottom = p.y + 'px';
    el.style.transform = `scaleX(${p.dir})`;
    document.getElementById('world').style.transform = `translateX(${-p.x + 200}px)`;
    document.getElementById('hp-bar').style.width = (p.hp / p.maxH * 100) + '%';
    document.getElementById('exp-bar').style.width = (p.exp % 100) + '%';
    document.getElementById('gold-val').innerText = p.gold;
    document.getElementById('depth-val').innerText = g.danger;
    document.getElementById('kill-count').innerText = `${g.enemies.filter(e => !e.active).length % 5}/5`;

    requestAnimationFrame(loop);
}

window.onkeydown = e => g.keys[e.code] = true;
window.onkeyup = e => g.keys[e.code] = false;
window.onmousedown = e => { if (e.button === 0) performAttack(); };