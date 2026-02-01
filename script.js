const classes = [
    { name: 'SCOUT', hp: 80, atk: 12, range: 100, color: '#0f0' },
    { name: 'WARRIOR', hp: 120, atk: 18, range: 80, color: '#f00' }
];

let player = {
    x: 100, y: 0, vx: 0, vy: 0,
    hp: 100, maxHp: 100, atk: 10, range: 100,
    active: false, onGround: false, shielding: false,
    isAttacking: false, facingRight: true
};

const keys = {};

function init() {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.innerHTML = `<h3>${c.name}</h3>`;
        card.onclick = () => {
            player.hp = player.maxHp = c.hp;
            player.atk = c.atk;
            player.range = c.range;
            player.active = true;
            document.getElementById('gui-class').style.display = 'none';
        };
        grid.appendChild(card);
    });
}

document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);
document.addEventListener('mousedown', e => {
    if (player.active && e.button === 0) attack();
});

function attack() {
    if (player.isAttacking) return;
    player.isAttacking = true;
    const pEl = document.getElementById('player');

    // Logic gây sát thương dựa trên hướng nhân vật
    enemies.forEach((en, i) => {
        const dist = player.facingRight ? (en.x - player.x) : (player.x - en.x);
        if (dist > 0 && dist < player.range) {
            en.hp -= player.atk;
            if (en.hp <= 0) { en.el.remove(); enemies.splice(i, 1); }
        }
    });

    setTimeout(() => { player.isAttacking = false; }, 400);
}

function updatePhysics() {
    if (!player.active) return;
    const pEl = document.getElementById('player');

    // Di chuyển
    if (keys['KeyA']) {
        player.vx = -5;
        player.facingRight = false;
    } else if (keys['KeyD']) {
        player.vx = 5;
        player.facingRight = true;
    } else {
        player.vx *= 0.8;
    }

    if (keys['Space'] && player.onGround) {
        player.vy = -15;
        player.onGround = false;
    }

    // Trọng lực
    player.vy += 0.8;
    player.x += player.vx;
    player.y += player.vy;

    if (player.y >= 0) { player.y = 0; player.vy = 0; player.onGround = true; }

    // Cập nhật DOM
    pEl.style.left = player.x + 'px';
    pEl.style.bottom = (40 - player.y) + 'px';
    pEl.style.transform = player.facingRight ? 'scaleX(1)' : 'scaleX(-1)';

    // QUẢN LÝ ANIMATION CLASS
    pEl.className = ''; // Reset classes
    if (player.isAttacking) {
        pEl.classList.add('attacking');
    } else if (!player.onGround) {
        pEl.classList.add('jump');
    } else if (keys['ShiftLeft']) {
        pEl.classList.add('crouching');
    } else if (Math.abs(player.vx) > 1) {
        pEl.classList.add('run');
    } else {
        pEl.classList.add('idle');
    }

    // Fog mask center
    const rect = pEl.getBoundingClientRect();
    document.body.style.setProperty('--px', (rect.left + 32) + 'px');
    document.body.style.setProperty('--py', (rect.top + 32) + 'px');
}

function loop() {
    updatePhysics();
    requestAnimationFrame(loop);
}

init();
loop();