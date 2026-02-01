const classes = [
    { id: 'scout', name: 'SCOUT', hp: 100, atk: 15, range: 80 },
    { id: 'warrior', name: 'WARRIOR', hp: 150, atk: 25, range: 90 },
    { id: 'tanker', name: 'TANKER', hp: 300, atk: 12, range: 70 },
    { id: 'mage', name: 'MAGE', hp: 80, atk: 55, range: 180 },
    { id: 'rogue', name: 'ROGUE', hp: 100, atk: 40, range: 60 },
    { id: 'cleric', name: 'CLERIC', hp: 120, atk: 20, range: 75 },
    { id: 'berserker', name: 'BERSERKER', hp: 180, atk: 45, range: 85 },
    { id: 'archer', name: 'ARCHER', hp: 90, atk: 30, range: 250 },
    { id: 'paladin', name: 'PALADIN', hp: 200, atk: 22, range: 90 },
    { id: 'necro', name: 'NECRO', hp: 90, atk: 35, range: 150 }
];

let g = {
    active: false,
    player: {
        x: 100, y: 200, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, coin: 0,
        lvl: 1, exp: 0, nextExp: 100, ground: false, dir: 1, range: 80, canAtk: true, gravity: 0.9, jump: 19
    },
    quest: { target: 5, current: 0, reward: 100, desc: "DIỆT 5 QUÁI VẬT" },
    keys: {}, platforms: [], entities: [], particles: [], lastGenX: 0, deathLimit: -400,
    selected: null
};

function initSelection() {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const item = document.createElement('div');
        item.className = 'class-item';
        item.style.backgroundImage = `url('assets/thumbs/${c.id}.png')`;
        item.onclick = () => {
            document.querySelectorAll('.class-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            g.selected = c;
            document.getElementById('class-details').innerHTML = `<h2>${c.name}</h2><p>HP: ${c.hp}</p><p>ATK: ${c.atk}</p>`;
            document.getElementById('start-btn').disabled = false;
        };
        grid.appendChild(item);
    });
}

function initGame() {
    if (!g.selected) return;
    const p = g.player; const s = g.selected;
    p.hp = p.maxH = s.hp; p.atk = s.atk; p.range = s.range;
    document.getElementById('player-sprite').style.backgroundImage = `url('assets/thumbs/${s.id}.png')`;
    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    updateQuestUI();

    createPlatform(0, 0, 1500, 45);
    g.lastGenX = 1500;
    g.active = true;
    requestAnimationFrame(loop);
}

// HỆ THỐNG LEVEL & NHIỆM VỤ
function addExp(amount) {
    g.player.exp += amount;
    if (g.player.exp >= g.player.nextExp) {
        g.player.lvl++;
        g.player.exp -= g.player.nextExp;
        g.player.nextExp = Math.floor(g.player.nextExp * 1.5);
        g.player.atk += 5; // Tăng ATK khi lên cấp
        g.player.maxH += 20;
        g.player.hp = g.player.maxH;
        createParticle(g.player.x, g.player.y + 50, "#ff00ff"); // Hiệu ứng lên cấp
    }
    updateUI();
}

function checkQuest() {
    g.quest.current++;
    if (g.quest.current >= g.quest.target) {
        g.player.coin += g.quest.reward;
        g.quest.current = 0;
        g.quest.target += 3;
        g.quest.reward += 50;
        g.quest.desc = `DIỆT ${g.quest.target} QUÁI VẬT`;
        addExp(150); // Thưởng EXP khi xong quest
    }
    updateQuestUI();
}

function updateUI() {
    document.getElementById('ui-lvl').innerText = g.player.lvl;
    document.getElementById('ui-coin').innerText = g.player.coin;
    document.getElementById('exp-fill').style.width = (g.player.exp / g.player.nextExp * 100) + '%';
}

function updateQuestUI() {
    document.getElementById('quest-desc').innerText = `${g.quest.desc} (${g.quest.current}/${g.quest.target})`;
}

// LOGIC GAME CHÍNH
function createPlatform(x, y, w, h) {
    const el = document.createElement('div'); el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px';
    el.style.width = w + 'px'; el.style.height = h + 'px';
    document.getElementById('world').appendChild(el);
    g.platforms.push({ x, y, w, h, el });
}

function generateMap() {
    if (g.player.x + 800 > g.lastGenX) {
        let w = 300 + Math.random() * 400;
        let x = g.lastGenX + 130 + Math.random() * 70;
        let lastY = g.platforms[g.platforms.length - 1].y;
        let y = Math.max(50, Math.min(300, lastY + (Math.random() * 160 - 80)));
        createPlatform(x, y, w, 20);
        if (Math.random() > 0.4) createEntity(x + w / 2, y + 40);
        g.lastGenX = x + w;
    }
}

function createEntity(x, y) {
    const el = document.createElement('div'); el.className = 'goblin';
    el.innerHTML = `<div class="m-hp"><div class="m-hp-i" style="width:100%"></div></div>`;
    document.getElementById('entity-layer').appendChild(el);
    g.entities.push({ x, y, hp: 50, mH: 50, el, active: true });
}

function loop() {
    if (!g.active) return;
    updatePlayer();
    updateEntities();
    updateParticles();
    generateMap();
    requestAnimationFrame(loop);
}

function updatePlayer() {
    const p = g.player;
    if (g.keys['KeyA']) { p.vx = -7.5; p.dir = -1; }
    else if (g.keys['KeyD']) { p.vx = 7.5; p.dir = 1; }
    else p.vx *= 0.85;

    if (g.keys['Space'] && p.ground) { p.vy = p.jump; p.ground = false; }
    p.vy -= p.gravity; p.x += p.vx; p.y += p.vy;

    if (p.y < g.deathLimit) { location.reload(); return; }

    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 40 > plat.x && p.x < plat.x + plat.w) {
            if (p.vy <= 0 && p.y >= plat.y + plat.h - 15 && p.y <= plat.y + plat.h + 5) {
                p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
            }
        }
    });

    const c = document.getElementById('player-container');
    c.style.left = p.x + 'px'; c.style.bottom = p.y + 'px';
    c.style.transform = `scaleX(${p.dir})`;

    const camX = -p.x + window.innerWidth / 2;
    document.getElementById('world').style.transform = `translateX(${camX}px)`;
    document.getElementById('parallax-far').style.transform = `translateX(${camX * 0.1}px)`;
    document.getElementById('parallax-mid').style.transform = `translateX(${camX * 0.3}px)`;

    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    if (p.hp <= 0) location.reload();
}

function updateEntities() {
    g.entities.forEach(en => {
        if (!en.active) return;
        let d = g.player.x - en.x;
        if (Math.abs(d) < 500) en.x += Math.sign(d) * 1.8;
        if (Math.abs(d) < 40 && Math.abs(g.player.y - en.y) < 50) g.player.hp -= 0.5;
        en.el.style.left = en.x + 'px'; en.el.style.bottom = en.y + 'px';
    });
}

function createParticle(x, y, color = "#00f2ff") {
    for (let i = 0; i < 6; i++) {
        const el = document.createElement('div'); el.className = 'particle';
        el.style.backgroundColor = color; document.getElementById('particle-layer').appendChild(el);
        g.particles.push({ el, x, y, vx: (Math.random() - 0.5) * 12, vy: Math.random() * 12, life: 1 });
    }
}

function updateParticles() {
    for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i]; p.x += p.vx; p.y += p.vy; p.vy -= 0.6; p.life -= 0.05;
        p.el.style.left = p.x + 'px'; p.el.style.bottom = p.y + 'px'; p.el.style.opacity = p.life;
        if (p.life <= 0) { p.el.remove(); g.particles.splice(i, 1); }
    }
}

function attack() {
    if (!g.active || !g.player.canAtk) return;
    g.player.canAtk = false;
    document.getElementById('weapon-visual').classList.add('swing');
    g.entities.forEach(en => {
        if (!en.active) return;
        let d = g.player.dir === 1 ? (en.x - g.player.x) : (g.player.x - en.x);
        if (d > 0 && d < g.player.range && Math.abs(g.player.y - en.y) < 70) {
            en.hp -= g.player.atk;
            createParticle(en.x + 15, en.y + 20);
            if (en.hp <= 0) {
                en.active = false; en.el.remove();
                g.player.coin += 20;
                addExp(30);
                checkQuest(); // Cập nhật tiến độ nhiệm vụ
                updateUI();
            }
            else en.el.querySelector('.m-hp-i').style.width = (en.hp / en.mH * 100) + '%';
        }
    });
    setTimeout(() => { document.getElementById('weapon-visual').classList.remove('swing'); g.player.canAtk = true; }, 200);
}

window.onkeydown = e => g.keys[e.code] = true;
window.onkeyup = e => g.keys[e.code] = false;
window.onmousedown = e => { if (e.button === 0) attack(); };
window.onload = initSelection;