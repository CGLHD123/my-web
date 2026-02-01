const classes = [
    { name: 'SCOUT', hp: 80, atk: 12, range: 60, weapon: 'DAGGER', color: '#0f0' },
    { name: 'WARRIOR', hp: 120, atk: 18, range: 80, weapon: 'SWORD', color: '#f00' },
    { name: 'TANKER', hp: 200, atk: 10, range: 70, weapon: 'MACE', color: '#00f' },
    { name: 'MAGE', hp: 70, atk: 30, range: 180, weapon: 'STAFF', color: '#f0f' },
    { name: 'ROGUE', hp: 90, atk: 25, range: 60, weapon: 'KATAR', color: '#ff0' },
    { name: 'CLERIC', hp: 110, atk: 15, range: 70, weapon: 'MACE', color: '#fff' },
    { name: 'BERSERKER', hp: 140, atk: 28, range: 80, weapon: 'AXE', color: '#f80' },
    { name: 'ARCHER', hp: 85, atk: 22, range: 250, weapon: 'BOW', color: '#8f0' },
    { name: 'PALADIN', hp: 160, atk: 15, range: 80, weapon: 'HOLY', color: '#0ff' },
    { name: 'NECRO', hp: 75, atk: 26, range: 120, weapon: 'SCYTHE', color: '#80f' }
];

let player = {
    x: 100, y: 0, vx: 0, vy: 0,
    hp: 100, maxHp: 100, atk: 10, range: 60,
    lvl: 1, exp: 0, active: false,
    onGround: false, shielding: false, shieldCD: false
};

let enemies = [];
const keys = {};

// Khởi tạo
function init() {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.innerHTML = `<h3>${c.name}</h3><p>${c.weapon}</p>`;
        card.onclick = () => {
            player.hp = player.maxHp = c.hp;
            player.atk = c.atk;
            player.range = c.range;
            player.active = true;
            document.getElementById('gui-class').style.display = 'none';
            updateUI();
        };
        grid.appendChild(card);
    });
    spawnEnemy('goblin', 600);
    spawnEnemy('orc', 1200);
    spawnEnemy('witch', 1800);
}

function spawnEnemy(type, x) {
    const el = document.createElement('div');
    el.className = `enemy ${type}`;
    document.getElementById('enemies-layer').appendChild(el);
    enemies.push({ type, x, hp: 50, el });
}

// Input
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

document.addEventListener('mousedown', e => {
    if (!player.active) return;
    if (e.button === 0) attack();
    if (e.button === 2) useShield();
});
document.addEventListener('contextmenu', e => e.preventDefault());

function attack() {
    const el = document.getElementById('player');
    el.classList.add('attacking');
    enemies.forEach((en, i) => {
        if (Math.abs(player.x - en.x) < player.range) {
            en.hp -= player.atk;
            if (en.hp <= 0) {
                en.el.remove();
                enemies.splice(i, 1);
                player.exp += 340;
                if (player.exp >= 1000) { player.lvl++; player.exp = 0; }
                updateUI();
            }
        }
    });
    setTimeout(() => el.classList.remove('attacking'), 200);
}

function useShield() {
    if (player.shieldCD) return;
    player.shielding = true;
    player.shieldCD = true;
    document.getElementById('player').classList.add('shielding');
    document.getElementById('shield-status').innerText = "SHIELD: ACTIVE";

    setTimeout(() => {
        player.shielding = false;
        document.getElementById('player').classList.remove('shielding');
        let cd = 5;
        const timer = setInterval(() => {
            cd--;
            document.getElementById('shield-status').innerText = `SHIELD: CD ${cd}s`;
            if (cd <= 0) {
                clearInterval(timer);
                player.shieldCD = false;
                document.getElementById('shield-status').innerText = "SHIELD: READY";
            }
        }, 1000);
    }, 2000);
}

function updatePhysics() {
    if (!player.active) return;

    if (keys['KeyA']) player.vx = -6;
    else if (keys['KeyD']) player.vx = 6;
    else player.vx *= 0.8;

    if (keys['Space'] && player.onGround) { player.vy = -18; player.onGround = false; }

    const pEl = document.getElementById('player');
    if (keys['ShiftLeft']) pEl.classList.add('crouching');
    else pEl.classList.remove('crouching');

    player.vy += 0.8; // Gravity
    player.x += player.vx;
    player.y += player.vy;

    if (player.y >= 0) { player.y = 0; player.vy = 0; player.onGround = true; }

    pEl.style.left = player.x + 'px';
    pEl.style.bottom = (40 - player.y) + 'px';

    // Camera & Fog
    const screenX = pEl.getBoundingClientRect().left;
    const screenY = pEl.getBoundingClientRect().top;
    document.body.style.setProperty('--px', screenX + 16 + 'px');
    document.body.style.setProperty('--py', screenY + 24 + 'px');
}

function updateUI() {
    document.getElementById('stat-level').innerText = player.lvl;
    document.getElementById('stat-exp').innerText = player.exp;
    document.getElementById('stat-hp').innerText = player.hp;
    document.getElementById('stat-atk').innerText = player.atk;
    document.getElementById('hp-bar-inner').style.width = (player.hp / player.maxHp * 100) + '%';
}

function loop() {
    updatePhysics();
    enemies.forEach(en => en.el.style.left = en.x + 'px');
    requestAnimationFrame(loop);
}

function toggleHelp(s) { document.getElementById('gui-help').style.display = s ? 'flex' : 'none'; }
function resetData() { localStorage.clear(); location.reload(); }

init();
loop();