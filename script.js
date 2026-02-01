const classes = [
    { id: 'scout', name: 'SCOUT', hp: 80, atk: 15, range: 120, desc: 'Agile operative with high range.' },
    { id: 'warrior', name: 'WARRIOR', hp: 120, atk: 18, range: 90, desc: 'Standard frontline combatant.' },
    { id: 'tanker', name: 'TANKER', hp: 200, atk: 10, range: 80, desc: 'Heavy armor, low damage.' },
    { id: 'mage', name: 'MAGE', hp: 70, atk: 25, range: 150, desc: 'Powerful energy attacks.' },
    { id: 'rogue', name: 'ROGUE', hp: 90, atk: 22, range: 100, desc: 'Critical strike specialist.' },
    { id: 'cleric', name: 'CLERIC', hp: 100, atk: 12, range: 110, desc: 'Balanced stats with high HP.' },
    { id: 'berserker', name: 'BERSERKER', hp: 110, atk: 24, range: 95, desc: 'High risk, high reward.' },
    { id: 'archer', name: 'ARCHER', hp: 75, atk: 18, range: 200, desc: 'Longest engagement range.' },
    { id: 'paladin', name: 'PALADIN', hp: 140, atk: 14, range: 90, desc: 'Holy warrior, high defense.' },
    { id: 'neco', name: 'NECO', hp: 60, atk: 30, range: 130, desc: 'Experimental glass cannon.' }
];

let player = { x: 100, y: 0, vx: 0, vy: 0, hp: 100, maxHp: 100, atk: 10, range: 100, active: false, onGround: false, facingRight: true };
let enemies = [];
const keys = {};

function init() {
    const grid = document.getElementById('class-grid');
    const infoPanel = document.getElementById('info-content');

    classes.forEach(c => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.innerHTML = `<div class="class-thumb" style="background-image: url('assets/thumbs/${c.id}.png')"></div>`;

        // Sự kiện di chuột vào (Hover)
        card.onmouseenter = () => {
            infoPanel.innerHTML = `
                <h2 style="color:var(--neon)">${c.name}</h2>
                <p>HP: ${c.hp}</p>
                <p>ATK: ${c.atk}</p>
                <p>RANGE: ${c.range}</p>
                <hr style="border:1px solid #333">
                <p style="font-size:8px; color:#888">${c.desc}</p>
            `;
        };

        // Sự kiện click chọn
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

// Logic điều khiển & Fog
function updatePhysics() {
    if (!player.active) return;
    const pEl = document.getElementById('player');

    if (keys['KeyA']) { player.vx = -6; player.facingRight = false; }
    else if (keys['KeyD']) { player.vx = 6; player.facingRight = true; }
    else player.vx *= 0.8;

    if (keys['Space'] && player.onGround) { player.vy = -16; player.onGround = false; }
    player.vy += 0.8; player.x += player.vx; player.y += player.vy;
    if (player.y >= 0) { player.y = 0; player.vy = 0; player.onGround = true; }

    pEl.style.left = player.x + 'px';
    pEl.style.bottom = (40 - player.y) + 'px';
    pEl.style.transform = player.facingRight ? 'scaleX(1)' : 'scaleX(-1)';
    pEl.className = Math.abs(player.vx) > 1 ? 'run' : 'idle';

    // Cập nhật vị trí Fog
    const rect = pEl.getBoundingClientRect();
    document.body.style.setProperty('--px', (rect.left + 32) + 'px');
    document.body.style.setProperty('--py', (rect.top + 32) + 'px');
    document.getElementById('dungeon').style.left = `${-player.x + 200}px`;
}

function updateUI() {
    document.getElementById('stat-hp').innerText = Math.ceil(player.hp);
    document.getElementById('stat-atk').innerText = player.atk;
    document.getElementById('hp-bar-inner').style.width = (player.hp / player.maxHp * 100) + '%';
}

function loop() {
    updatePhysics();
    requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);
function toggleHelp(s) { document.getElementById('gui-help').style.display = s ? 'flex' : 'none'; }

init();
loop();