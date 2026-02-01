const classes = [
    { name: 'SCOUT', hp: 80, atk: 12, range: 75, color: '#0f0', id: 'scout' },
    { name: 'WARRIOR', hp: 120, atk: 18, range: 90, color: '#f00', id: 'warrior' },
    { name: 'TANKER', hp: 200, atk: 10, range: 75, color: '#00f', id: 'tanker' },
    { name: 'MAGE', hp: 70, atk: 30, range: 180, color: '#f0f', id: 'mage' },
    { name: 'ROGUE', hp: 90, atk: 25, range: 65, color: '#ff0', id: 'rogue' },
    { name: 'CLERIC', hp: 110, atk: 15, range: 75, color: '#fff', id: 'cleric' },
    { name: 'BERSERKER', hp: 140, atk: 28, range: 85, color: '#f80', id: 'berserker' },
    { name: 'ARCHER', hp: 85, atk: 22, range: 250, color: '#8f0', id: 'archer' },
    { name: 'PALADIN', hp: 160, atk: 15, range: 85, color: '#0ff', id: 'paladin' },
    { name: 'NECRO', hp: 75, atk: 26, range: 120, color: '#80f', id: 'necro' }
];

let g = {
    active: false,
    player: { x: 100, y: 0, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, coin: 0, lvl: 1, exp: 0, next: 100, ground: false, crouch: false, dir: 1, range: 80 },
    keys: {},
    platforms: [
        { x: 0, y: 0, w: 10000, h: 40 },
        { x: 500, y: 180, w: 250, h: 20 },
        { x: 950, y: 350, w: 250, h: 20 },
        { x: 1500, y: 200, w: 300, h: 20 }
    ],
    spawnPoints: [
        { x: 600, y: 40, type: 'goblin', s: false },
        { x: 1200, y: 40, type: 'orc', s: false },
        { x: 550, y: 200, type: 'chest', s: false },
        { x: 1800, y: 40, type: 'witch', s: false },
        { x: 2500, y: 40, type: 'orc', s: false }
    ],
    entities: [],
    selected: null
};

function initSelection() {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const d = document.createElement('div');
        d.className = 'class-item';
        d.style.backgroundImage = `url('assets/thumbs/${c.id}.png')`;
        d.onmouseenter = () => {
            document.getElementById('class-details').innerHTML = `
                <h2 style="color:${c.color}">${c.name}</h2>
                <hr>
                <p>HEALTH: ${c.hp}</p>
                <p>ATTACK: ${c.atk}</p>
                <p>RANGE:  ${c.range}px</p>
            `;
        };
        d.onclick = () => {
            document.querySelectorAll('.class-item').forEach(i => i.classList.remove('active'));
            d.classList.add('active');
            g.selected = c;
            document.getElementById('start-btn').disabled = false;
        };
        grid.appendChild(d);
    });
}

function initGame() {
    const p = g.player; const s = g.selected;
    p.hp = p.maxH = s.hp; p.atk = s.atk; p.range = s.range;

    // Gán giao diện thẻ bài
    document.getElementById('card-inner').style.backgroundColor = s.color;
    document.getElementById('card-inner').style.backgroundImage = `url('assets/thumbs/${s.id}.png')`;

    document.getElementById('gui-selection').style.display = 'none';

    g.platforms.forEach(plat => {
        const el = document.createElement('div');
        el.className = 'platform';
        el.style.left = plat.x + 'px'; el.style.bottom = plat.y + 'px';
        el.style.width = plat.w + 'px'; el.style.height = plat.h + 'px';
        document.getElementById('world').appendChild(el);
    });

    g.active = true;
    requestAnimationFrame(loop);
}

function loop() {
    if (!g.active) return;
    updatePlayer();
    handleSpawning();
    updateEntities();
    requestAnimationFrame(loop);
}

function updatePlayer() {
    const p = g.player;
    if (g.keys['KeyA']) { p.vx = -7; p.dir = -1; }
    else if (g.keys['KeyD']) { p.vx = 7; p.dir = 1; }
    else p.vx *= 0.85;

    p.crouch = !!g.keys['ShiftLeft'];
    const s = document.getElementById('player-card');
    s.style.height = p.crouch ? '35px' : '55px';
    s.style.marginTop = p.crouch ? '20px' : '0px';

    if (g.keys['Space'] && p.ground) { p.vy = 22; p.ground = false; }
    p.vy -= 1.2; p.x += p.vx; p.y += p.vy;

    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 40 > plat.x && p.x < plat.x + plat.w) {
            if (p.vy <= 0 && p.y >= plat.y + plat.h - 20 && p.y <= plat.y + plat.h + 5) {
                p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
            }
        }
    });

    const c = document.getElementById('player-container');
    c.style.left = p.x + 'px'; c.style.bottom = p.y + 'px';
    c.style.transform = `scaleX(${p.dir})`;
    document.getElementById('world').style.transform = `translateX(${-p.x + window.innerWidth / 2}px)`;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
}

function handleSpawning() {
    g.spawnPoints.forEach(sp => {
        if (!sp.s && Math.abs(g.player.x - sp.x) < 750) {
            sp.s = true;
            createEntity(sp.type, sp.x, sp.y);
        }
    });
}

function createEntity(type, x, y) {
    const el = document.createElement('div');
    el.className = type;
    if (['goblin', 'orc', 'witch'].includes(type)) {
        el.innerHTML = `<div class="m-hp"><div class="m-hp-i"></div></div>`;
    }
    document.getElementById('entity-layer').appendChild(el);
    g.entities.push({ type, x, y, hp: 50, mH: 50, el, active: true, speed: (type === 'goblin' ? 3.2 : 1.8) });
}

function updateEntities() {
    g.entities.forEach(en => {
        if (!en.active) return;

        if (['goblin', 'orc', 'witch'].includes(en.type)) {
            let dist = g.player.x - en.x;
            if (Math.abs(dist) < 500) {
                en.x += Math.sign(dist) * en.speed;
                en.el.style.transform = `scaleX(${Math.sign(dist)})`;
            }
        }

        en.el.style.left = en.x + 'px';
        en.el.style.bottom = en.y + 'px';

        let pDist = Math.abs(g.player.x - en.x);
        if (en.type === 'coin' && pDist < 30 && Math.abs(g.player.y - en.y) < 40) {
            en.active = false; en.el.remove(); g.player.coin += 10;
            document.getElementById('ui-coin').innerText = g.player.coin;
        }
        if (en.type === 'chest' && pDist < 40 && Math.abs(g.player.y - en.y) < 40) {
            en.active = false;
            en.el.style.opacity = "0.3";
            gainExp(45);
            for (let i = 0; i < 6; i++) createEntity('coin', en.x + Math.random() * 40, en.y + 10);
            // Tự động biến mất sau 2 giây
            setTimeout(() => en.el.remove(), 2000);
        }
    });
}

function attack() {
    if (!g.active) return;
    g.entities.forEach(en => {
        if (!en.active || ['coin', 'chest'].includes(en.type)) return;
        let d = g.player.dir === 1 ? (en.x - g.player.x) : (g.player.x - en.x);
        if (d > 0 && d < g.player.range && Math.abs(g.player.y - en.y) < 75) {
            en.hp -= g.player.atk;
            if (en.hp <= 0) {
                en.active = false; en.el.remove();
                gainExp(35);
                for (let i = 0; i < 4; i++) createEntity('coin', en.x + Math.random() * 20, en.y + 10);
            } else {
                en.el.querySelector('.m-hp-i').style.width = (en.hp / en.mH * 100) + '%';
            }
        }
    });
}

function gainExp(v) {
    const p = g.player; p.exp += v;
    if (p.exp >= p.next) {
        p.lvl++; p.exp = 0; p.next += 60; p.atk += 6; p.maxH += 25; p.hp = p.maxH;
        const m = document.getElementById('level-up-msg');
        m.style.display = 'block'; setTimeout(() => m.style.display = 'none', 2000);
    }
    document.getElementById('ui-lvl').innerText = p.lvl;
    document.getElementById('ui-exp').innerText = `${p.exp}/${p.next}`;
}

window.onkeydown = e => g.keys[e.code] = true;
window.onkeyup = e => g.keys[e.code] = false;
window.onmousedown = e => { if (e.button === 0) attack(); };
initSelection();