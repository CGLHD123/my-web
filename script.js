const classes = [
    { name: 'SCOUT', hp: 80, atk: 12, range: 60, weapon: 'DAGGER', color: '#0f0', id: 'scout' },
    { name: 'WARRIOR', hp: 120, atk: 18, range: 80, weapon: 'SWORD', color: '#f00', id: 'warrior' },
    { name: 'TANKER', hp: 200, atk: 10, range: 70, weapon: 'MACE', color: '#00f', id: 'tanker' },
    { name: 'MAGE', hp: 70, atk: 30, range: 180, weapon: 'STAFF', color: '#f0f', id: 'mage' },
    { name: 'ROGUE', hp: 90, atk: 25, range: 60, weapon: 'KATAR', color: '#ff0', id: 'rogue' },
    { name: 'CLERIC', hp: 110, atk: 15, range: 70, weapon: 'MACE', color: '#fff', id: 'cleric' },
    { name: 'BERSERKER', hp: 140, atk: 28, range: 80, weapon: 'AXE', color: '#f80', id: 'berserker' },
    { name: 'ARCHER', hp: 85, atk: 22, range: 250, weapon: 'BOW', color: '#8f0', id: 'archer' },
    { name: 'PALADIN', hp: 160, atk: 15, range: 80, weapon: 'HOLY', color: '#0ff', id: 'paladin' },
    { name: 'NECRO', hp: 75, atk: 26, range: 120, weapon: 'SCYTHE', color: '#80f', id: 'necro' }
];

let gameState = {
    player: { x: 200, y: 0, vx: 0, vy: 0, hp: 100, maxHp: 100, atk: 10, range: 80, lvl: 1, exp: 0, coin: 0, scale: 1, crouching: false },
    active: false,
    selectedClass: null,
    keys: {},
    platforms: [
        { x: 0, y: 0, w: 5000, h: 40 },
        { x: 400, y: 150, w: 200, h: 20 },
        { x: 700, y: 280, w: 200, h: 20 }
    ],
    entities: []
};

// Khởi tạo GUI chọn Class
function initMenu() {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const btn = document.createElement('div');
        btn.className = 'class-btn';
        btn.style.backgroundImage = `url('assets/thumbs/${c.id}.png')`;

        btn.onmouseenter = () => {
            document.getElementById('class-info').innerHTML = `
                <h3 style="color:${c.color}">${c.name}</h3>
                <p>HP: ${c.hp} | ATK: ${c.atk}</p>
                <p>WEAPON: ${c.weapon}</p>
                <p>RANGE: ${c.range}px</p>
            `;
        };

        btn.onclick = () => {
            document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            gameState.selectedClass = c;
            const startBtn = document.getElementById('btn-start');
            startBtn.disabled = false;
            startBtn.classList.add('active');
        };
        grid.appendChild(btn);
    });
}

function startGame() {
    const c = gameState.selectedClass;
    gameState.player.hp = gameState.player.maxHp = c.hp;
    gameState.player.atk = c.atk;
    gameState.player.range = c.range;
    document.getElementById('player-body').style.background = c.color;
    document.getElementById('gui-class').style.display = 'none';
    gameState.active = true;
    spawnMapContent();
    requestAnimationFrame(gameLoop);
}

function spawnMapContent() {
    // Spawn 1 rương và 3 quái mẫu
    spawnEntity('chest', 600, 40);
    spawnEntity('goblin', 800, 40);
    spawnEntity('orc', 1200, 40);
}

function spawnEntity(type, x, y) {
    const el = document.createElement('div');
    el.className = type;
    el.style.left = x + 'px';
    el.style.bottom = y + 'px';
    document.getElementById('entities-layer').appendChild(el);
    gameState.entities.push({ type, x, y, hp: 50, el });
}

// Logic Game Loop
function gameLoop() {
    if (!gameState.active) return;
    updatePlayer();
    updateFog();
    requestAnimationFrame(gameLoop);
}

function updatePlayer() {
    const p = gameState.player;
    // Input
    if (gameState.keys['KeyA']) { p.vx = -5; p.scale = -1; }
    else if (gameState.keys['KeyD']) { p.vx = 5; p.scale = 1; }
    else p.vx *= 0.8;

    if (gameState.keys['Space'] && p.onGround) p.vy = -15;

    p.crouching = !!gameState.keys['ShiftLeft'];

    // Gravity & Physics
    p.vy += 0.8;
    p.x += p.vx;
    p.y -= p.vy;

    // Va chạm nền đất & Platform
    p.onGround = false;
    gameState.platforms.forEach(plat => {
        if (p.x + 20 > plat.x && p.x - 20 < plat.x + plat.w) {
            if (p.y <= plat.y + plat.h && p.y + p.vy >= plat.y + plat.h) {
                p.y = plat.y + plat.h;
                p.vy = 0;
                p.onGround = true;
            }
        }
    });

    // Update DOM
    const container = document.getElementById('player-container');
    container.style.left = p.x + 'px';
    container.style.bottom = p.y + 'px';
    container.style.transform = `scaleX(${p.scale}) ${p.crouching ? 'scaleY(0.6)' : 'scaleY(1)'}`;

    // Camera follow
    document.getElementById('world').style.transform = `translateX(${-p.x + window.innerWidth / 2}px)`;

    // HUD
    document.getElementById('val-lvl').innerText = p.lvl;
    document.getElementById('val-coin').innerText = p.coin;
}

function updateFog() {
    const p = document.getElementById('player-container').getBoundingClientRect();
    document.documentElement.style.setProperty('--px', (p.left + 20) + 'px');
    document.documentElement.style.setProperty('--py', (p.top + 25) + 'px');
}

// Events
window.onkeydown = e => gameState.keys[e.code] = true;
window.onkeyup = e => gameState.keys[e.code] = false;
function toggleHelp(s) { document.getElementById('gui-help').style.display = s ? 'flex' : 'none'; }

// Init
initMenu();
gameState.platforms.forEach(plat => {
    const el = document.createElement('div');
    el.className = 'platform';
    el.style.left = plat.x + 'px';
    el.style.bottom = plat.y + 'px';
    el.style.width = plat.w + 'px';
    document.getElementById('world').appendChild(el);
});