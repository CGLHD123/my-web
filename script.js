const classes = [
    { id: 'scout', hp: 160, atk: 35, color: '#00ffcc', type: 'ranged', pj: 'pj-arrow', wp: 'Hunting_Bow.png', thumb: 'Scout.png' },
    { id: 'warrior', hp: 400, atk: 80, color: '#ff4444', type: 'melee', wp: 'Nihonto.png', thumb: 'Warrior.png' },
    { id: 'tanker', hp: 1200, atk: 45, color: '#aaaaaa', type: 'melee', wp: 'Battle_Axe.png', thumb: 'Tanker.png' },
    { id: 'mage', hp: 150, atk: 200, color: '#4444ff', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png', thumb: 'Mage.png' },
    { id: 'rogue', hp: 220, atk: 150, color: '#ff00ff', type: 'melee', wp: 'Knife.png', thumb: 'Rogue.png' },
    { id: 'cleric', hp: 350, atk: 75, color: '#ffff00', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png', thumb: 'Cleric.png' },
    { id: 'archer', hp: 200, atk: 130, color: '#ff8800', type: 'ranged', pj: 'pj-arrow', wp: 'Hunting_Bow.png', thumb: 'Archer.png' },
    { id: 'necro', hp: 250, atk: 160, color: '#440044', type: 'ranged', pj: 'pj-magic', wp: 'Wandering_Staff.png', thumb: 'Necromancer.png' },
    { id: 'paladin', hp: 650, atk: 100, color: '#ffffff', type: 'melee', wp: 'Nihonto.png', thumb: 'Paladin.png' },
    { id: 'berserker', hp: 550, atk: 180, color: '#880000', type: 'melee', wp: 'Battle_Axe.png', thumb: 'Berserker.png' }
];

let g = {
    active: false, shopOpen: false, time: 0, danger: 1,
    // Vị trí người chơi bắt đầu ở góc trái dưới
    player: { x: 100, y: 120, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, speed: 7, gold: 0, ult: 0, dir: 1, ground: false, invul: false },
    quest: { target: 3, current: 0 },
    keys: {}, platforms: [], enemies: [], projectiles: [], lastX: 0, lastY: 40
};

window.onload = () => {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const el = document.createElement('div'); el.className = 'class-item';
        el.style.backgroundImage = `url('assets/thumbs/${c.thumb}')`;
        el.onmouseover = () => {
            document.getElementById('info-content').innerHTML = `<h3>${c.id.toUpperCase()}</h3><p>HP: ${c.hp}<br>ATK: ${c.atk}<br>TYPE: ${c.type.toUpperCase()}</p>`;
        };
        el.onclick = () => {
            document.querySelectorAll('.class-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active'); g.selected = c;
            document.getElementById('start-btn').disabled = false;
        };
        grid.appendChild(el);
    });
};

function initGame() {
    const s = g.selected;
    Object.assign(g.player, { hp: s.hp, maxH: s.hp, atk: s.atk });
    document.getElementById('weapon-sprite').style.backgroundImage = `url('assets/weapons/${s.wp}')`;
    document.getElementById('player-sprite').style.backgroundColor = s.color;

    // Tạo sàn ban đầu sát đáy để không bị rơi
    createPlatform(0, 0, 2000, 40); g.lastX = 2000; g.lastY = 40;
    for (let i = 0; i < 5; i++) generateNextPlatform();

    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    document.getElementById('hud').style.display = 'block';
    g.active = true;
    setInterval(() => { if (g.active && !g.shopOpen) { g.time++; updateWorld(); } }, 1000);
    updateQuestUI();
    requestAnimationFrame(loop);
}

function generateNextPlatform() {
    const gapX = 120 + Math.random() * 80;
    const gapY = (Math.random() - 0.5) * 50;
    // Đảm bảo bậc nhảy không quá cao
    let newY = Math.max(40, Math.min(180, g.lastY + gapY));
    const newW = 400 + Math.random() * 300;
    createPlatform(g.lastX + gapX, newY, newW, 60);
    spawnEnemy(g.lastX + gapX + 150, newY + 60, g.lastX + gapX, g.lastX + gapX + newW - 45);
    g.lastX += gapX + newW; g.lastY = newY;
}

function spawnEnemy(x, y, start, end) {
    const cont = document.createElement('div'); cont.className = 'enemy-container';
    cont.innerHTML = `<div class="health-bar-mini"><div class="health-fill-mini" style="width:100%"></div></div><div class="enemy-sprite"></div>`;
    document.getElementById('entity-layer').appendChild(cont);
    g.enemies.push({ x, y, hp: 100 * g.danger, maxH: 100 * g.danger, el: cont, active: true, dir: 1, start, end });
}

function update() {
    const p = g.player;
    if (g.keys['KeyD']) { p.vx = p.speed; p.dir = 1; }
    else if (g.keys['KeyA']) { p.vx = -p.speed; p.dir = -1; }
    else p.vx *= 0.8;
    if (g.keys['Space'] && p.ground) { p.vy = 16; p.ground = false; }
    p.vy -= 0.8; p.x += p.vx; p.y += p.vy;

    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 30 > plat.x && p.x < plat.x + plat.w && p.vy <= 0 && p.y >= plat.y + plat.h - 10 && p.y <= plat.y + plat.h + 5) {
            p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
        }
    });

    g.enemies.forEach(en => {
        if (!en.active) return;
        en.x += en.dir * 2;
        if (en.x >= en.end || en.x <= en.start) en.dir *= -1;
        en.el.style.left = en.x + 'px'; en.el.style.bottom = en.y + 'px';
        en.el.querySelector('.health-fill-mini').style.width = (en.hp / en.maxH * 100) + '%';
        if (Math.abs(p.x - en.x) < 35 && Math.abs(p.y - en.y) < 40 && !p.invul) p.hp -= 1;
    });

    g.projectiles.forEach((pj, i) => {
        pj.x += pj.vx; pj.el.style.left = pj.x + 'px'; pj.el.style.bottom = pj.y + 'px';
        if (Math.abs(pj.x - pj.startX) > 600) { pj.el.remove(); g.projectiles.splice(i, 1); return; }
        g.enemies.forEach(en => {
            if (en.active && Math.abs(pj.x - en.x) < 50 && Math.abs(pj.y - en.y) < 50) {
                en.hp -= p.atk; if (en.hp <= 0) { en.active = false; en.el.remove(); p.gold += 50; p.ult = Math.min(100, p.ult + 20); updateQuest(); }
                pj.el.remove(); g.projectiles.splice(i, 1);
            }
        });
    });

    if (p.x + 1200 > g.lastX) generateNextPlatform();
    if (p.y < -100 || p.hp <= 0) location.reload();
}

function updateQuest() {
    g.quest.current++;
    if (g.quest.current >= g.quest.target) { g.player.gold += 300; g.quest.target += 2; g.quest.current = 0; }
    updateQuestUI();
}

function updateQuestUI() {
    document.getElementById('quest-desc').innerText = `DIỆT ${g.quest.target} QUÁI (${g.quest.current}/${g.quest.target})`;
    document.getElementById('quest-fill').style.width = (g.quest.current / g.quest.target * 100) + '%';
}

function handleAttack() {
    const p = g.player; const s = g.selected;
    if (s.type === 'melee') {
        g.enemies.forEach(en => {
            if (en.active && Math.abs((p.x + p.dir * 40) - en.x) < 80 && Math.abs(p.y - en.y) < 60) {
                en.hp -= p.atk; if (en.hp <= 0) { en.active = false; en.el.remove(); p.gold += 50; p.ult = Math.min(100, p.ult + 15); updateQuest(); }
            }
        });
    } else {
        const el = document.createElement('div'); el.className = `projectile ${s.pj}`;
        document.getElementById('projectile-layer').appendChild(el);
        g.projectiles.push({ x: p.x + 20, y: p.y + 20, vx: p.dir * 20, startX: p.x, el });
    }
}

function draw() {
    const p = g.player;
    document.getElementById('player-container').style.left = p.x + 'px';
    document.getElementById('player-container').style.bottom = p.y + 'px';
    document.getElementById('player-container').style.transform = `scaleX(${p.dir})`;
    // Camera bám theo người chơi, giữ người chơi ở góc trái màn hình (200px từ lề trái)
    document.getElementById('world').style.transform = `translateX(${-p.x + 200}px)`;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    document.getElementById('ult-fill').style.width = p.ult + '%';
    document.getElementById('gold-val').innerText = p.gold;
    document.getElementById('lvl-val').innerText = g.danger;
}

function createPlatform(x, y, w, h) {
    const el = document.createElement('div'); el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px';
    document.getElementById('platform-layer').appendChild(el);
    g.platforms.push({ x, y, w, h, el });
}

function toggleShop() { g.shopOpen = !g.shopOpen; document.getElementById('gui-shop').style.display = g.shopOpen ? 'flex' : 'none'; }
function updateWorld() { g.danger = Math.floor(g.time / 60) + 1; document.getElementById('time-val').innerText = g.time; }
function loop() { if (g.active && !g.shopOpen) { update(); draw(); } requestAnimationFrame(loop); }

window.addEventListener('mousedown', e => { if (e.button === 0 && g.active && !g.shopOpen) handleAttack(); });
window.addEventListener('keydown', e => { g.keys[e.code] = true; if (e.code === 'KeyB') toggleShop(); });
window.addEventListener('keyup', e => g.keys[e.code] = false);