const classes = [
    { id: 'scout', name: 'SCOUT', hp: 80, atk: 15, range: 120, desc: 'Agile operative with fast strikes.' },
    { id: 'warrior', name: 'WARRIOR', hp: 120, atk: 18, range: 90, desc: 'Heavy frontline combatant.' },
    { id: 'tanker', name: 'TANKER', hp: 200, atk: 10, range: 80, desc: 'Ultimate defense system.' },
    { id: 'mage', name: 'MAGE', hp: 70, atk: 25, range: 150, desc: 'Energy-based long range unit.' },
    { id: 'rogue', name: 'ROGUE', hp: 90, atk: 22, range: 100, desc: 'Stealth and critical hits.' },
    { id: 'cleric', name: 'CLERIC', hp: 100, atk: 12, range: 110, desc: 'Balanced support frame.' },
    { id: 'berserker', name: 'BERSERKER', hp: 110, atk: 24, range: 95, desc: 'High risk attack power.' },
    { id: 'archer', name: 'ARCHER', hp: 75, atk: 18, range: 200, desc: 'Long engagement distance.' },
    { id: 'paladin', name: 'PALADIN', hp: 140, atk: 14, range: 90, desc: 'Holy armored protector.' },
    { id: 'necro', name: 'NECRO', hp: 60, atk: 35, range: 130, desc: 'Experimental energy cannon.' }
];

let player = {
    x: 100, y: 0, vx: 0, vy: 0,
    hp: 0, maxHp: 0, atk: 0, range: 0,
    active: false, facingRight: true, isAttacking: false
};

const keys = {};

function init() {
    const grid = document.getElementById('class-grid');
    const infoContent = document.getElementById('info-content');

    classes.forEach(c => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.innerHTML = `<div class="class-thumb" style="background-image: url('assets/thumbs/${c.id}.png')"></div>`;

        // Cập nhật cột phải khi Hover
        card.onmouseenter = () => {
            infoContent.innerHTML = `
                <h2 style="color:var(--neon); margin-bottom:10px;">${c.name}</h2>
                <p>HEALTH: ${c.hp}</p>
                <p>ATTACK: ${c.atk}</p>
                <p>RANGE:  ${c.range}</p>
                <div style="margin-top:15px; color:#888; border-top:1px solid #333; padding-top:10px;">
                    ${c.desc}
                </div>
            `;
        };

        // Chọn Class
        card.onclick = () => {
            player.hp = player.maxHp = c.hp;
            player.atk = c.atk; player.range = c.range;
            player.active = true;
            document.getElementById('gui-class').style.display = 'none';
            updateUI();
        };
        grid.appendChild(card);
    });
}

function attack() {
    if (player.isAttacking || !player.active) return;
    player.isAttacking = true;
    const pEl = document.getElementById('player');
    pEl.classList.add('attacking');

    // Logic chém trúng quái (nếu có quái trong mảng enemies)
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
    else player.vx *= 0.8;

    player.x += player.vx;
    pEl.style.left = player.x + 'px';
    pEl.style.bottom = '40px';
    pEl.style.transform = player.facingRight ? 'scaleX(1)' : 'scaleX(-1)';

    if (!player.isAttacking) {
        pEl.className = Math.abs(player.vx) > 1 ? 'run' : 'idle';
    }

    // Fog bám sát nhân vật
    const rect = pEl.getBoundingClientRect();
    const centerX = rect.left + (player.isAttacking && player.facingRight ? 32 : 32);
    document.body.style.setProperty('--px', centerX + 'px');
    document.body.style.setProperty('--py', (rect.top + 32) + 'px');

    document.getElementById('dungeon').style.left = `${-player.x + 200}px`;
}

function updateUI() {
    document.getElementById('stat-hp').innerText = player.hp;
    document.getElementById('stat-atk').innerText = player.atk;
    document.getElementById('hp-bar-inner').style.width = (player.hp / player.maxHp * 100) + '%';
}

function loop() {
    updatePhysics();
    requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);
document.addEventListener('mousedown', e => { if (e.button === 0) attack(); });

init();
loop();