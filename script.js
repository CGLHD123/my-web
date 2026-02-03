// Game Classes Data
const classes = [
    { id: 'Warrior', hp: 500, atk: 90, wp: 'Nihonto.png', type: 'melee', color: '#600' },
    { id: 'Mage', hp: 160, atk: 260, wp: 'Wandering_Staff.png', type: 'ranged', color: '#006' },
    { id: 'Scout', hp: 220, atk: 80, wp: 'Hunting_Bow.png', type: 'ranged', color: '#060' },
    { id: 'Tanker', hp: 1600, atk: 45, wp: 'Battle_Axe.png', type: 'melee', color: '#444' },
    { id: 'Rogue', hp: 280, atk: 190, wp: 'Knife.png', type: 'melee', color: '#222' },
    { id: 'Cleric', hp: 420, atk: 85, wp: 'Wandering_Staff.png', type: 'ranged', color: '#860' },
    { id: 'Archer', hp: 260, atk: 170, wp: 'Hunting_Bow.png', type: 'ranged', color: '#540' },
    { id: 'Necromancer', hp: 320, atk: 210, wp: 'Wandering_Staff.png', type: 'ranged', color: '#304' },
    { id: 'Paladin', hp: 850, atk: 125, wp: 'Nihonto.png', type: 'melee', color: '#ddd' },
    { id: 'Berserker', hp: 650, atk: 230, wp: 'Battle_Axe.png', type: 'melee', color: '#a00' }
];

const questTemplates = [
    { id: 1, desc: 'Tiêu diệt 10 quái vật', target: 10, type: 'kill', reward: 500 },
    { id: 2, desc: 'Thu thập 1000 vàng', target: 1000, type: 'gold', reward: 300 },
    { id: 3, desc: 'Sống sót 3 phút', target: 180, type: 'time', reward: 800 },
    { id: 4, desc: 'Đạt level 5', target: 5, type: 'level', reward: 1000 },
    { id: 5, desc: 'Tiêu diệt 1 Boss', target: 1, type: 'boss', reward: 1500 },
    { id: 6, desc: 'Mở 5 rương', target: 5, type: 'chest', reward: 600 },
    { id: 7, desc: 'Thu thập 3 lọ thuốc', target: 3, type: 'potion', reward: 400 }
];

let g = {
    active: false, paused: false,
    player: { x: 100, y: 150, vx: 0, vy: 0, hp: 100, maxH: 100, exp: 0, lvl: 1, gold: 0, kills: 0, dir: 1, ground: false, attackCooldown: 0, critChance: 0.15, invulnerable: 0, moveSpeed: 1, chestOpened: 0, potionsCollected: 0, bossKilled: 0 },
    plats: [], mobs: [], pjs: [], items: [], keys: {},
    lastX: 0, danger: 1, timer: 0, startTime: 0, bossSpawned: false,
    upgrades: { atkSpeed: 1 }, quests: [], questsCompleted: 0, currentQuest: null
};

window.onload = () => {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.backgroundImage = `url('assets/thumbs/${c.id}.png')`;
        card.style.background = `linear-gradient(135deg, ${c.color} 0%, ${adjustColor(c.color, -30)} 100%)`;
        card.onclick = () => {
            document.querySelectorAll('.card').forEach(v => v.classList.remove('active'));
            card.classList.add('active');
            g.selected = JSON.parse(JSON.stringify(c));
            document.getElementById('start-btn').disabled = false;
            document.getElementById('class-stats').innerHTML = `<p><strong>HP:</strong> ${c.hp}</p><p><strong>ATK:</strong> ${c.atk}</p><p><strong>Type:</strong> ${c.type === 'melee' ? 'Cận chiến' : 'Tầm xa'}</p>`;
            document.getElementById('class-weapon-preview').style.backgroundImage = `url('assets/weapons/${c.wp}')`;
        };
        grid.appendChild(card);
    });
    if (localStorage.getItem('abyssGame')) document.getElementById('continue-btn').style.display = 'inline-block';
    setupMobileControls();
    generateNewQuest();
};

function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function generateNewQuest() {
    const template = questTemplates[Math.floor(Math.random() * questTemplates.length)];
    g.currentQuest = { ...template, progress: 0, completed: false };
    updateQuestUI();
}

function updateQuestProgress(type, amount = 1) {
    if (!g.currentQuest || g.currentQuest.completed) return;
    if (g.currentQuest.type === type) {
        if (type === 'gold') g.currentQuest.progress = g.player.gold;
        else g.currentQuest.progress += amount;
        if (g.currentQuest.progress >= g.currentQuest.target) completeQuest();
        updateQuestUI();
    }
}

function completeQuest() {
    if (!g.currentQuest || g.currentQuest.completed) return;
    g.currentQuest.completed = true;
    g.player.gold += g.currentQuest.reward;
    g.questsCompleted++;
    showDamageNumber(g.player.x, g.player.y + 60, `+${g.currentQuest.reward}💰`, 'crit');
    createParticles(g.player.x, g.player.y + 30, 20, '#ffd700');
    setTimeout(() => generateNewQuest(), 3000);
}

function updateQuestUI() {
    if (!g.currentQuest) return;
    document.getElementById('quest-desc').textContent = g.currentQuest.desc;
    const percent = (g.currentQuest.progress / g.currentQuest.target) * 100;
    document.getElementById('quest-progress-bar').style.width = Math.min(100, percent) + '%';
    document.getElementById('quest-progress-text').textContent = `${Math.min(g.currentQuest.progress, g.currentQuest.target)}/${g.currentQuest.target}`;
    document.getElementById('quest-reward').textContent = `Phần thưởng: ${g.currentQuest.reward}💰`;
    if (g.currentQuest.completed) {
        document.getElementById('quest-desc').textContent = 'HOÀN THÀNH! Nhiệm vụ mới...';
        document.getElementById('quest-progress-bar').style.background = '#ffd700';
    }
}

function startGame() {
    const s = g.selected;
    Object.assign(g.player, { hp: s.hp, maxH: s.hp, exp: 0, lvl: 1, gold: 0, kills: 0, chestOpened: 0, potionsCollected: 0, bossKilled: 0 });
    document.getElementById('p-sprite').style.backgroundColor = s.color;
    document.getElementById('portrait-img').style.backgroundImage = `url('assets/thumbs/${s.id}.png')`;
    document.getElementById('portrait-img').style.backgroundColor = s.color;
    document.getElementById('p-weapon').style.backgroundImage = `url('assets/weapons/${s.wp}')`;
    document.getElementById('gui-select').style.display = 'none';
    addPlat(0, 50, 2000, 50);
    g.lastX = 2000;
    for (let i = 0; i < 10; i++) spawnMap();
    g.active = true;
    g.startTime = Date.now();
    requestAnimationFrame(loop);
    setInterval(() => {
        if (g.active && !g.paused) {
            g.timer++;
            g.danger = 1 + Math.floor(g.timer / 30);
            if (g.timer % 120 === 0 && g.timer > 0) spawnBoss();
            updateQuestProgress('time', 1);
        }
    }, 1000);
    setInterval(() => { if (g.active && !g.paused) cleanupEntities(); }, 5000);
}

function spawnMap() {
    const w = 300 + Math.random() * 500;
    const gap = 100 + Math.random() * 150;
    const x = g.lastX + gap;
    const lastY = g.plats.length > 0 ? g.plats[g.plats.length - 1].y : 50;
    const y = Math.max(30, Math.min(200, lastY + (-60 + Math.random() * 120)));
    addPlat(x, y, w, 50);
    const rng = Math.random();
    if (rng > 0.6) {
        const count = g.danger > 3 ? (Math.random() > 0.5 ? 2 : 1) : 1;
        for (let i = 0; i < count; i++) spawnMob(x + (w / (count + 1)) * (i + 1), y + 50, 'enemy');
    } else if (rng > 0.45 && rng <= 0.6) {
        spawnMob(x + w / 2, y + 50, 'chest');
    } else if (rng > 0.3 && rng <= 0.45) {
        spawnPotion(x + w / 2, y + 50);
    }
    g.lastX = x + w;
}

function addPlat(x, y, w, h) {
    const el = document.createElement('div');
    el.className = 'platform';
    el.style.cssText = `left:${x}px; bottom:${y}px; width:${w}px; height:${h}px;`;
    document.getElementById('platform-layer').appendChild(el);
    g.plats.push({ x, y, w, h, el });
}

function spawnMob(x, y, type) {
    const el = document.createElement('div');
    el.className = type;
    el.style.left = x + 'px';
    el.style.bottom = y + 'px';
    const mult = 1 + (g.danger - 1) * 0.5;
    const mob = {
        x, y,
        hp: (type === 'enemy' ? 100 : 1) * g.danger * mult,
        maxHp: (type === 'enemy' ? 100 : 1) * g.danger * mult,
        atk: 20 * g.danger * mult,
        el, active: true, type, vx: 0, vy: 0, ground: false, attackCooldown: 0, ai: type === 'enemy'
    };
    if (type === 'enemy') {
        const hpBar = document.createElement('div');
        hpBar.className = 'hp-bar-entity';
        const hpFill = document.createElement('div');
        hpFill.className = 'hp-bar-fill';
        hpFill.style.width = '100%';
        hpBar.appendChild(hpFill);
        el.appendChild(hpBar);
        mob.hpBar = hpBar;
        mob.hpFill = hpFill;
    }
    document.getElementById('entity-layer').appendChild(el);
    g.mobs.push(mob);
}

function spawnBoss() {
    if (g.bossSpawned) return;
    const x = g.player.x + 800, y = 150;
    const el = document.createElement('div');
    el.className = 'boss';
    el.style.left = x + 'px';
    el.style.bottom = y + 'px';
    const mult = 1 + (g.danger - 1) * 0.3;
    const hp = 1000 * g.danger * mult;
    const mob = { x, y, hp, maxHp: hp, atk: 50 * g.danger * mult, el, active: true, type: 'boss', vx: 0, vy: 0, ground: false, attackCooldown: 0, ai: true, isBoss: true };
    const hpBar = document.createElement('div');
    hpBar.className = 'hp-bar-entity';
    hpBar.style.display = 'block';
    const hpFill = document.createElement('div');
    hpFill.className = 'hp-bar-fill';
    hpFill.style.width = '100%';
    hpBar.appendChild(hpFill);
    el.appendChild(hpBar);
    mob.hpBar = hpBar;
    mob.hpFill = hpFill;
    document.getElementById('entity-layer').appendChild(el);
    g.mobs.push(mob);
    g.bossSpawned = true;
    showDamageNumber(x, y + 50, '⚠️ BOSS ⚠️', 'crit');
}

function spawnPotion(x, y) {
    const types = ['health', 'strength', 'speed'];
    const type = types[Math.floor(Math.random() * types.length)];
    const el = document.createElement('div');
    el.className = `potion potion-${type}`;
    el.style.left = x + 'px';
    el.style.bottom = y + 'px';
    g.items.push({ x, y, type, el, active: true });
    document.getElementById('item-layer').appendChild(el);
}

function collectPotion(potion) {
    if (!potion.active) return;
    potion.active = false;
    potion.el.remove();
    const p = g.player;
    switch (potion.type) {
        case 'health': p.hp = Math.min(p.maxH, p.hp + 100); showDamageNumber(potion.x, potion.y, '+100 HP', 'crit'); break;
        case 'strength': g.selected.atk += 10; showDamageNumber(potion.x, potion.y, '+10 ATK', 'crit'); break;
        case 'speed': p.moveSpeed += 0.1; showDamageNumber(potion.x, potion.y, '+SPEED', 'crit'); break;
    }
    createParticles(potion.x, potion.y, 12, potion.type === 'health' ? '#f00' : (potion.type === 'strength' ? '#f80' : '#0ff'));
    p.potionsCollected++;
    updateQuestProgress('potion', 1);
    g.items = g.items.filter(i => i !== potion);
}

function attack() {
    if (!g.active || g.paused || g.player.attackCooldown > 0 || document.getElementById('gui-shop').style.display === 'flex') return;
    const p = g.player, s = g.selected;
    g.player.attackCooldown = 20 * g.upgrades.atkSpeed;
    if (s.type === 'melee') {
        document.getElementById('p-slash').classList.add('slash-anim');
        setTimeout(() => document.getElementById('p-slash').classList.remove('slash-anim'), 150);
        g.mobs.forEach(m => {
            if (m.active && Math.abs((p.x + p.dir * 60) - m.x) < 100 && Math.abs(p.y - m.y) < 70) hit(m, p.x + p.dir * 60, p.y + 25);
        });
    } else {
        const pjEl = document.createElement('div');
        pjEl.className = 'projectile';
        pjEl.style.cssText = `position:absolute; left:${p.x}px; bottom:${p.y + 25}px;`;
        document.getElementById('fx-layer').appendChild(pjEl);
        g.pjs.push({ x: p.x, y: p.y + 25, vx: p.dir * 18, el: pjEl });
    }
}

function hit(m, hitX, hitY) {
    const isCrit = Math.random() < g.player.critChance;
    const damage = isCrit ? g.selected.atk * 2 : g.selected.atk;
    m.hp -= damage;
    if (m.hpFill) {
        m.hpFill.style.width = Math.max(0, (m.hp / m.maxHp) * 100) + '%';
        if (m.hpBar) m.hpBar.style.display = 'block';
    }
    if (m.el) {
        m.el.style.filter = 'brightness(2)';
        setTimeout(() => { if (m.el) m.el.style.filter = 'brightness(1)'; }, 100);
    }
    showDamageNumber(hitX, hitY, `-${Math.floor(damage)}`, isCrit ? 'crit' : '');
    createParticles(hitX, hitY, isCrit ? 8 : 4);
    if (m.hp <= 0 && m.active) killMob(m);
}

function killMob(m) {
    m.active = false;
    if (m.el) m.el.remove();
    if (m.type === 'chest') {
        g.player.gold += 500;
        g.player.chestOpened++;
        showDamageNumber(m.x, m.y, '+500💰', 'crit');
        createParticles(m.x, m.y, 12, '#ffd700');
        updateQuestProgress('chest', 1);
    } else {
        const gold = (m.isBoss ? 500 : 50) * g.danger;
        const exp = m.isBoss ? 200 : 34;
        g.player.gold += gold;
        g.player.exp += exp;
        g.player.kills++;
        showDamageNumber(m.x, m.y + 20, `+${gold}💰`, '');
        createParticles(m.x, m.y, m.isBoss ? 20 : 6, '#f00');
        if (m.isBoss) {
            g.bossSpawned = false;
            g.player.bossKilled++;
            showDamageNumber(m.x, m.y + 40, '🏆 BOSS 🏆', 'crit');
            updateQuestProgress('boss', 1);
        }
        updateQuestProgress('kill', 1);
        if (g.player.exp >= 100) levelUp();
    }
}

function levelUp() {
    g.player.lvl++;
    g.player.exp -= 100;
    g.player.maxH += 50;
    g.player.hp = Math.min(g.player.hp + 100, g.player.maxH);
    g.selected.atk += 15;
    document.getElementById('lvl-up-fx').classList.add('lvl-anim');
    setTimeout(() => document.getElementById('lvl-up-fx').classList.remove('lvl-anim'), 1200);
    createParticles(g.player.x, g.player.y + 50, 20, '#ff0');
    updateQuestProgress('level', 1);
    if (g.player.exp >= 100) levelUp();
}

function updateEnemyAI(m) {
    if (!m.ai || !m.active) return;
    const p = g.player, dist = Math.abs(m.x - p.x);
    if (dist < 500) {
        const speed = (m.isBoss ? 3 : 2.5) * (1 + g.danger * 0.1);
        if (m.x < p.x - 60) m.vx = speed;
        else if (m.x > p.x + 60) m.vx = -speed;
        else {
            m.vx = 0;
            if (m.attackCooldown <= 0 && Math.abs(m.y - p.y) < 60) {
                attackPlayer(m);
                m.attackCooldown = m.isBoss ? 60 : 90;
            }
        }
        if (m.ground && Math.random() > 0.96) { m.vy = 14; m.ground = false; }
    } else m.vx *= 0.9;
    m.vy -= 0.85; m.x += m.vx; m.y += m.vy; m.ground = false;
    g.plats.forEach(pl => {
        if (m.x + 45 > pl.x && m.x < pl.x + pl.w && m.vy <= 0 && m.y >= pl.y + pl.h - 12 && m.y <= pl.y + pl.h + 5) {
            m.y = pl.y + pl.h; m.vy = 0; m.ground = true;
        }
    });
    if (m.el) { m.el.style.left = m.x + 'px'; m.el.style.bottom = m.y + 'px'; }
    if (m.attackCooldown > 0) m.attackCooldown--;
    if (m.y < -500) { m.active = false; if (m.el) m.el.remove(); }
}

function attackPlayer(m) {
    if (g.player.invulnerable > 0) return;
    const damage = m.atk || (m.isBoss ? 50 * g.danger : 20 * g.danger);
    g.player.hp -= damage;
    showDamageNumber(g.player.x, g.player.y + 30, `-${Math.floor(damage)}`, '');
    createParticles(g.player.x, g.player.y + 25, 6, '#f00');
    g.player.invulnerable = 30;
    if (g.player.hp <= 0) gameOver();
}

function showDamageNumber(x, y, text, type = '') {
    const dmg = document.createElement('div');
    dmg.className = 'damage-number ' + type;
    dmg.textContent = text;
    dmg.style.left = x + 'px';
    dmg.style.bottom = y + 'px';
    document.getElementById('damage-layer').appendChild(dmg);
    setTimeout(() => dmg.remove(), 1000);
}

function createParticles(x, y, count = 6, color = '#fff') {
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.backgroundColor = color;
        p.style.left = x + 'px';
        p.style.bottom = y + 'px';
        const angle = (Math.PI * 2 * i) / count;
        const speed = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        document.getElementById('fx-layer').appendChild(p);
        let life = 0;
        const anim = setInterval(() => {
            life++;
            p.style.left = (parseFloat(p.style.left) + vx) + 'px';
            p.style.bottom = (parseFloat(p.style.bottom) + vy - life * 0.2) + 'px';
            if (life > 20) { clearInterval(anim); p.remove(); }
        }, 16);
    }
}

function buy(type) {
    const p = g.player;
    switch (type) {
        case 'heal': if (p.gold >= 200) { p.hp = p.maxH; p.gold -= 200; showDamageNumber(p.x, p.y + 40, '+HP', 'crit'); } break;
        case 'atk': if (p.gold >= 500) { g.selected.atk += 25; p.gold -= 500; showDamageNumber(p.x, p.y + 40, '+ATK', 'crit'); } break;
        case 'hp': if (p.gold >= 600) { p.maxH += 100; p.hp += 100; p.gold -= 600; showDamageNumber(p.x, p.y + 40, '+HP', 'crit'); } break;
        case 'speed': if (p.gold >= 800 && g.upgrades.atkSpeed > 0.5) { g.upgrades.atkSpeed *= 0.9; p.gold -= 800; showDamageNumber(p.x, p.y + 40, '+SPD', 'crit'); } break;
        case 'crit': if (p.gold >= 1000) { p.critChance += 0.05; p.gold -= 1000; showDamageNumber(p.x, p.y + 40, '+CRIT', 'crit'); } break;
        case 'movespeed': if (p.gold >= 700) { p.moveSpeed += 0.2; p.gold -= 700; showDamageNumber(p.x, p.y + 40, '+MOVE', 'crit'); } break;
    }
}

function toggleGUI(id) {
    const el = document.getElementById(id);
    const wasHidden = el.style.display === 'none';
    el.style.display = wasHidden ? 'flex' : 'none';
    if (id === 'gui-shop' || id === 'gui-help' || id === 'gui-quests') g.paused = wasHidden;
}

function togglePause() {
    g.paused = !g.paused;
    document.getElementById('gui-pause').style.display = g.paused ? 'flex' : 'none';
    if (g.paused) {
        document.getElementById('pause-lvl').textContent = g.player.lvl;
        document.getElementById('pause-gold').textContent = g.player.gold;
        document.getElementById('pause-time').textContent = formatTime(g.timer);
        document.getElementById('pause-kills').textContent = g.player.kills;
    }
}

function saveGame() {
    localStorage.setItem('abyssGame', JSON.stringify({
        player: g.player, selected: g.selected, danger: g.danger, timer: g.timer,
        upgrades: g.upgrades, questsCompleted: g.questsCompleted, timestamp: Date.now()
    }));
    showDamageNumber(g.player.x, g.player.y + 50, '💾 SAVED', 'crit');
}

function loadGame() {
    const data = JSON.parse(localStorage.getItem('abyssGame') || '{}');
    if (!data.player) return;
    g.selected = data.selected;
    Object.assign(g.player, data.player);
    g.danger = data.danger;
    g.timer = data.timer;
    g.upgrades = data.upgrades;
    g.questsCompleted = data.questsCompleted || 0;
    startGame();
}

function gameOver() {
    g.active = false;
    document.getElementById('final-lvl').textContent = g.player.lvl;
    document.getElementById('final-gold').textContent = g.player.gold;
    document.getElementById('final-time').textContent = formatTime(g.timer);
    document.getElementById('final-kills').textContent = g.player.kills;
    document.getElementById('final-quests').textContent = g.questsCompleted;
    document.getElementById('final-danger').textContent = g.danger;
    document.getElementById('gui-gameover').style.display = 'flex';
}

function cleanupEntities() {
    const camX = g.player.x;
    g.plats = g.plats.filter(pl => { if (Math.abs(pl.x - camX) > 2000) { pl.el.remove(); return false; } return true; });
    g.mobs = g.mobs.filter(m => { if (!m.active || Math.abs(m.x - camX) > 2000 || m.y < -500) { if (m.el) m.el.remove(); return false; } return true; });
    g.pjs = g.pjs.filter(pj => { if (Math.abs(pj.x - camX) > 1500) { pj.el.remove(); return false; } return true; });
    g.items = g.items.filter(i => { if (!i.active || Math.abs(i.x - camX) > 2000) { if (i.el) i.el.remove(); return false; } return true; });
}

function setupMobileControls() {
    if (!/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
    document.getElementById('btn-left').addEventListener('touchstart', () => g.keys['KeyA'] = true);
    document.getElementById('btn-left').addEventListener('touchend', () => g.keys['KeyA'] = false);
    document.getElementById('btn-right').addEventListener('touchstart', () => g.keys['KeyD'] = true);
    document.getElementById('btn-right').addEventListener('touchend', () => g.keys['KeyD'] = false);
    document.getElementById('btn-jump').addEventListener('touchstart', () => g.keys['Space'] = true);
    document.getElementById('btn-jump').addEventListener('touchend', () => g.keys['Space'] = false);
    document.getElementById('btn-attack').addEventListener('touchstart', () => attack());
}

function loop() {
    if (!g.active) return;
    if (g.paused) { requestAnimationFrame(loop); return; }
    const p = g.player;
    const speed = 8 * p.moveSpeed;
    if (g.keys['KeyD'] || g.keys['ArrowRight']) { p.vx = speed; p.dir = 1; }
    else if (g.keys['KeyA'] || g.keys['ArrowLeft']) { p.vx = -speed; p.dir = -1; }
    else p.vx *= 0.8;
    if ((g.keys['Space'] || g.keys['KeyW'] || g.keys['ArrowUp']) && p.ground) { p.vy = 16; p.ground = false; }
    p.vy -= 0.85; p.x += p.vx; p.y += p.vy; p.ground = false;
    g.plats.forEach(pl => {
        if (p.x + 40 > pl.x && p.x < pl.x + pl.w && p.vy <= 0 && p.y >= pl.y + pl.h - 12 && p.y <= pl.y + pl.h + 5) {
            p.y = pl.y + pl.h; p.vy = 0; p.ground = true;
        }
    });
    g.pjs.forEach((pj, i) => {
        pj.x += pj.vx; pj.el.style.left = pj.x + 'px';
        g.mobs.forEach(m => {
            if (m.active && Math.abs(pj.x - m.x) < 45 && Math.abs(pj.y - m.y) < 45) {
                hit(m, pj.x, pj.y); pj.el.remove(); g.pjs.splice(i, 1);
            }
        });
    });
    g.items.forEach(item => {
        if (item.active && Math.abs(p.x - item.x) < 50 && Math.abs(p.y - item.y) < 50) collectPotion(item);
    });
    g.mobs.forEach(m => updateEnemyAI(m));
    if (p.x + 1200 > g.lastX) spawnMap();
    if (p.y < -300) gameOver();
    if (p.attackCooldown > 0) p.attackCooldown--;
    if (p.invulnerable > 0) p.invulnerable--;
    const playerEl = document.getElementById('player');
    playerEl.style.left = p.x + 'px';
    playerEl.style.bottom = p.y + 'px';
    playerEl.style.transform = `scaleX(${p.dir})`;
    playerEl.style.opacity = p.invulnerable > 0 && p.invulnerable % 4 < 2 ? 0.5 : 1;
    document.getElementById('world').style.transform = `translateX(${-p.x + 200}px)`;
    document.getElementById('parallax-bg').style.transform = `translateX(${-p.x * 0.15}px)`;
    document.getElementById('hp-bar').style.width = (p.hp / p.maxH) * 100 + '%';
    document.getElementById('hp-text').textContent = `${Math.floor(p.hp)}/${p.maxH}`;
    document.getElementById('exp-bar').style.width = (p.exp % 100) + '%';
    document.getElementById('exp-text').textContent = `${p.exp % 100}/100`;
    document.getElementById('gold-val').textContent = p.gold;
    document.getElementById('danger-val').textContent = g.danger;
    document.getElementById('lvl-tag').textContent = `LV. ${p.lvl}`;
    document.getElementById('timer-val').textContent = formatTime(g.timer);
    document.getElementById('kills-val').textContent = p.kills;
    updateQuestProgress('gold', 0);
    requestAnimationFrame(loop);
}

window.onkeydown = e => {
    g.keys[e.code] = true;
    if (e.code === 'KeyH') toggleGUI('gui-help');
    if (e.code === 'KeyB') toggleGUI('gui-shop');
    if (e.code === 'KeyQ') toggleGUI('gui-quests');
    if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
};
window.onkeyup = e => g.keys[e.code] = false;
window.onmousedown = e => { if (e.button === 0) attack(); };
window.oncontextmenu = () => false;