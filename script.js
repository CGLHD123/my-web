const classes = [
    { name: 'SCOUT', hp: 80, atk: 15, range: 120 },
    { name: 'WARRIOR', hp: 120, atk: 18, range: 90 }
];

const enemyTypes = [
    { type: 'goblin', hp: 30, speed: 2, color: '#4a4', w: 32, h: 32 },
    { type: 'orc', hp: 80, speed: 1, color: '#852', w: 48, h: 48 }
];

let player = {
    x: 100, y: 0, vx: 0, vy: 0,
    hp: 100, maxHp: 100, atk: 15, range: 120,
    lvl: 1, exp: 0, active: false,
    onGround: false, facingRight: true, isAttacking: false
};

let enemies = [];
const keys = {};

function init() {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.style.border = "1px solid #555"; card.style.padding = "10px"; card.style.cursor = "pointer";
        card.innerHTML = `<h3>${c.name}</h3>`;
        card.onclick = () => {
            player.hp = player.maxHp = c.hp;
            player.atk = c.atk; player.range = c.range;
            player.active = true;
            document.getElementById('gui-class').style.display = 'none';
            spawnEnemies();
        };
        grid.appendChild(card);
    });
}

function spawnEnemies() {
    const layer = document.getElementById('enemies-layer');
    for (let i = 0; i < 15; i++) {
        const t = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const x = 800 + Math.random() * 4000;
        const el = document.createElement('div');
        el.className = `enemy ${t.type}`;
        el.style.width = t.w + 'px'; el.style.height = t.h + 'px';
        el.style.background = t.color; el.style.bottom = '40px';
        layer.appendChild(el);
        enemies.push({ ...t, x, currentHp: t.hp, el });
    }
}

document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);
document.addEventListener('mousedown', e => { if (player.active && e.button === 0) attack(); });

function attack() {
    if (player.isAttacking) return;
    player.isAttacking = true;
    const pEl = document.getElementById('player');
    pEl.classList.add('attacking');

    enemies.forEach((en, i) => {
        const dist = player.facingRight ? (en.x - player.x) : (player.x - en.x);
        if (dist > 0 && dist < player.range) {
            en.currentHp -= player.atk;
            en.x += player.facingRight ? 40 : -40; // Knockback
            if (en.currentHp <= 0) {
                en.el.remove(); enemies.splice(i, 1);
                player.exp += 250;
                if (player.exp >= 1000) { player.lvl++; player.exp = 0; player.atk += 5; }
                updateUI();
            }
        }
    });

    setTimeout(() => {
        player.isAttacking = false;
        pEl.classList.remove('attacking');
    }, 400);
}

function updatePhysics() {
    if (!player.active) return;
    const pEl = document.getElementById('player');

    if (keys['KeyA']) { player.vx = -6; player.facingRight = false; }
    else if (keys['KeyD']) { player.vx = 6; player.facingRight = true; }
    else { player.vx *= 0.8; }

    if (keys['Space'] && player.onGround) { player.vy = -16; player.onGround = false; }

    player.vy += 0.8; player.x += player.vx; player.y += player.vy;
    if (player.y >= 0) { player.y = 0; player.vy = 0; player.onGround = true; }

    pEl.style.left = player.x + 'px';
    pEl.style.bottom = (40 - player.y) + 'px';
    pEl.style.transform = player.facingRight ? 'scaleX(1)' : 'scaleX(-1)';

    if (!player.isAttacking) {
        pEl.className = '';
        if (!player.onGround) pEl.classList.add('jump');
        else if (keys['ShiftLeft']) pEl.classList.add('crouching');
        else if (Math.abs(player.vx) > 1) pEl.classList.add('run');
        else pEl.classList.add('idle');
    }

    // Fog follow
    const rect = pEl.getBoundingClientRect();
    document.body.style.setProperty('--px', (rect.left + 32) + 'px');
    document.body.style.setProperty('--py', (rect.top + 32) + 'px');

    // Camera follow
    document.getElementById('dungeon').style.left = `${-player.x + 200}px`;
}

function updateUI() {
    document.getElementById('stat-level').innerText = player.lvl;
    document.getElementById('stat-hp').innerText = Math.ceil(player.hp);
    document.getElementById('stat-exp').innerText = player.exp;
    document.getElementById('hp-bar-inner').style.width = (player.hp / player.maxHp * 100) + '%';
}

function loop() {
    updatePhysics();
    enemies.forEach(en => en.el.style.left = en.x + 'px');
    requestAnimationFrame(loop);
}

function toggleHelp(s) { document.getElementById('gui-help').style.display = s ? 'flex' : 'none'; }

init();
loop();