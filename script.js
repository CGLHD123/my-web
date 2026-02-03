// Game Classes Data with Icons
const classes = [
    { id: 'Warrior', hp: 500, atk: 90, wp: 'Nihonto.png', type: 'melee', color: '#600', icon: '⚔️' },
    { id: 'Mage', hp: 160, atk: 260, wp: 'Wandering_Staff.png', type: 'ranged', color: '#006', icon: '🔮' },
    { id: 'Scout', hp: 220, atk: 80, wp: 'Hunting_Bow.png', type: 'ranged', color: '#060', icon: '🏹' },
    { id: 'Tanker', hp: 1600, atk: 45, wp: 'Battle_Axe.png', type: 'melee', color: '#444', icon: '🛡️' },
    { id: 'Rogue', hp: 280, atk: 190, wp: 'Knife.png', type: 'melee', color: '#222', icon: '🗡️' },
    { id: 'Cleric', hp: 420, atk: 85, wp: 'Wandering_Staff.png', type: 'ranged', color: '#860', icon: '✨' },
    { id: 'Archer', hp: 260, atk: 170, wp: 'Hunting_Bow.png', type: 'ranged', color: '#540', icon: '🎯' },
    { id: 'Necromancer', hp: 320, atk: 210, wp: 'Wandering_Staff.png', type: 'ranged', color: '#304', icon: '💀' },
    { id: 'Paladin', hp: 850, atk: 125, wp: 'Nihonto.png', type: 'melee', color: '#ddd', icon: '🌟' },
    { id: 'Berserker', hp: 650, atk: 230, wp: 'Battle_Axe.png', type: 'melee', color: '#a00', icon: '🔥' }
];

const questTemplates = [
    { id: 1, desc: 'Tiêu diệt 10 quái vật', target: 10, type: 'kill', reward: 500 },
    { id: 2, desc: 'Thu thập 1000 vàng', target: 1000, type: 'gold', reward: 300 },
    { id: 3, desc: 'Sống sót 3 phút', target: 180, type: 'time', reward: 800 },
    { id: 4, desc: 'Đạt level 5', target: 5, type: 'level', reward: 1000 },
    { id: 5, desc: 'Tiêu diệt 1 Boss', target: 1, type: 'boss', reward: 1500 },
    { id: 6, desc: 'Mở 5 rương', target: 5, type: 'chest', reward: 600 },
    { id: 7, desc: 'Thu thập 3 lọ thuốc', target: 3, type: 'potion', reward: 400 },
    { id: 8, desc: 'Đạt combo 20', target: 20, type: 'combo', reward: 900 },
    { id: 9, desc: 'Đi qua khu vực 3', target: 3, type: 'zone', reward: 1200 }
];

let g = {
    active: false, paused: false,
    player: {
        x: 100, y: 150, vx: 0, vy: 0, hp: 100, maxH: 100, exp: 0, lvl: 1, gold: 0,
        kills: 0, dir: 1, ground: false, attackCooldown: 0, critChance: 0.15,
        invulnerable: 0, moveSpeed: 1, chestOpened: 0, potionsCollected: 0,
        bossKilled: 0, combo: 0, maxCombo: 0, comboTimer: 0, lifeSteal: 0,
        dashCooldown: 0, doubleJump: false, hasDoubleJump: false
    },
    plats: [], mobs: [], pjs: [], items: [], keys: {},
    lastX: 0, danger: 1, timer: 0, startTime: 0, bossSpawned: false, miniBossNearby: false,
    upgrades: { atkSpeed: 1, comboDuration: 100 },
    quests: [], questsCompleted: 0, currentQuest: null,
    zone: 1, totalDistance: 0,
    // Infinite map management
    platformBuffer: 3000,
    cleanupDistance: 2000
};

window.onload = () => {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const card = document.createElement('div');
        card.className = 'card';

        // Create icon display
        const iconDiv = document.createElement('div');
        iconDiv.className = 'class-icon';
        iconDiv.textContent = c.icon;
        iconDiv.style.fontSize = '3rem';
        iconDiv.style.display = 'flex';
        iconDiv.style.alignItems = 'center';
        iconDiv.style.justifyContent = 'center';
        iconDiv.style.height = '100%';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'class-name';
        nameDiv.textContent = c.id;
        nameDiv.style.position = 'absolute';
        nameDiv.style.bottom = '5px';
        nameDiv.style.left = '0';
        nameDiv.style.right = '0';
        nameDiv.style.fontSize = '7px';
        nameDiv.style.textAlign = 'center';
        nameDiv.style.background = 'rgba(0,0,0,0.7)';
        nameDiv.style.padding = '3px';

        card.style.background = `linear-gradient(135deg, ${c.color} 0%, ${adjustColor(c.color, -30)} 100%)`;
        card.appendChild(iconDiv);
        card.appendChild(nameDiv);

        card.onclick = () => {
            document.querySelectorAll('.card').forEach(v => v.classList.remove('active'));
            card.classList.add('active');
            g.selected = JSON.parse(JSON.stringify(c));
            document.getElementById('start-btn').disabled = false;
            document.getElementById('class-stats').innerHTML = `
                <p><strong>HP:</strong> ${c.hp}</p>
                <p><strong>ATK:</strong> ${c.atk}</p>
                <p><strong>Type:</strong> ${c.type === 'melee' ? 'Cận chiến' : 'Tầm xa'}</p>
            `;
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
        else if (type === 'combo') g.currentQuest.progress = g.player.maxCombo;
        else if (type === 'zone') g.currentQuest.progress = g.zone;
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
    Object.assign(g.player, {
        hp: s.hp, maxH: s.hp, exp: 0, lvl: 1, gold: 0, kills: 0,
        chestOpened: 0, potionsCollected: 0, bossKilled: 0,
        combo: 0, maxCombo: 0, comboTimer: 0, lifeSteal: 0
    });

    // Sprite avec couleur et icône
    const spriteEl = document.getElementById('p-sprite');
    spriteEl.style.backgroundColor = s.color;
    spriteEl.innerHTML = `<div style="font-size: 2rem; display: flex; align-items: center; justify-content: center; height: 100%;">${s.icon}</div>`;

    // Portrait avec icône
    document.getElementById('portrait-img').textContent = s.icon;
    document.getElementById('portrait-img').style.fontSize = '3rem';
    document.getElementById('portrait-img').style.display = 'flex';
    document.getElementById('portrait-img').style.alignItems = 'center';
    document.getElementById('portrait-img').style.justifyContent = 'center';
    document.getElementById('portrait-img').style.backgroundColor = s.color;

    // Arme du personnage
    const weaponEl = document.getElementById('p-weapon');
    weaponEl.style.backgroundImage = `url('assets/weapons/${s.wp}')`;
    weaponEl.style.display = 'block';

    document.getElementById('gui-select').style.display = 'none';

    // Initialize first platform
    addPlat(0, 50, 2000, 50);
    g.lastX = 2000;

    // Generate initial map segments
    for (let i = 0; i < 15; i++) spawnMap();

    g.active = true;
    g.startTime = Date.now();
    requestAnimationFrame(loop);

    setInterval(() => {
        if (g.active && !g.paused) {
            g.timer++;
            g.danger = 1 + Math.floor(g.timer / 30);

            // Update zone based on distance
            g.zone = Math.floor(g.totalDistance / 5000) + 1;
            updateQuestProgress('zone', 0);

            if (g.timer % 120 === 0 && g.timer > 0) spawnBoss();
            updateQuestProgress('time', 1);

            // Combo timer
            if (g.player.comboTimer > 0) {
                g.player.comboTimer--;
                if (g.player.comboTimer === 0) {
                    g.player.combo = 0;
                }
            }
        }
    }, 1000);

    setInterval(() => { if (g.active && !g.paused) cleanupEntities(); }, 3000);
}

function spawnMap() {
    const w = 350 + Math.random() * 450;
    const gap = 80 + Math.random() * 120;
    const x = g.lastX + gap;
    const lastY = g.plats.length > 0 ? g.plats[g.plats.length - 1].y : 50;

    const maxHeightChange = 60;
    const y = Math.max(40, Math.min(180, lastY + (-maxHeightChange + Math.random() * (maxHeightChange * 2))));

    addPlat(x, y, w, 50);

    const rng = Math.random();

    // Plus de variété dans les spawns
    if (rng > 0.65) {
        // Ennemis multiples
        const count = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            spawnMob(x + (w / (count + 1)) * (i + 1), y + 50, 'enemy');
        }
    } else if (rng > 0.50) {
        // Coffres précieux
        spawnChest(x + w / 2, y + 50);
    } else if (rng > 0.35) {
        // Potions magiques
        spawnPotion(x + w / 2, y + 50);
    } else if (rng > 0.25) {
        // Pièges dangereux
        spawnTrap(x + w / 2, y + 50);
    } else if (rng > 0.15) {
        // Plateformes bonus avec récompenses
        spawnBonusPlatform(x + w / 2, y + 80);
    } else if (rng > 0.08) {
        // Boss mini
        if (!g.miniBossNearby) spawnMiniBoss(x + w / 2, y + 50);
    } else {
        // Portails de téléportation
        spawnPortal(x + w / 2, y + 50);
    }

    // Décorations environnementales
    if (Math.random() > 0.7) {
        spawnDecoration(x + Math.random() * w, y + 50);
    }

    g.lastX = x + w;
}

function spawnChest(x, y) {
    const el = document.createElement('div');
    el.className = 'chest';
    el.style.left = x + 'px';
    el.style.bottom = y + 'px';

    const gold = Math.floor(150 + Math.random() * 300 + g.zone * 100);
    const hasSpecialItem = Math.random() > 0.7;

    document.getElementById('entity-layer').appendChild(el);
    g.mobs.push({
        el, x, y, type: 'chest', active: true,
        gold, hasSpecialItem, hp: 1, maxH: 1
    });
}

function spawnTrap(x, y) {
    const el = document.createElement('div');
    el.className = 'trap';
    el.style.left = x + 'px';
    el.style.bottom = y + 'px';
    el.innerHTML = '⚠️';

    document.getElementById('entity-layer').appendChild(el);
    g.items.push({
        el, x, y, type: 'trap', active: true,
        damage: 30 + g.zone * 10
    });
}

function spawnBonusPlatform(x, y) {
    const el = document.createElement('div');
    el.className = 'bonus-platform';
    el.style.left = x + 'px';
    el.style.bottom = y + 'px';
    el.innerHTML = '⭐';

    document.getElementById('item-layer').appendChild(el);
    g.items.push({
        el, x, y, type: 'bonus', active: true,
        reward: 200 + g.zone * 50
    });
}

function spawnMiniBoss(x, y) {
    const el = document.createElement('div');
    el.className = 'mini-boss';
    el.style.left = x + 'px';
    el.style.bottom = y + 'px';

    const hp = 200 + g.danger * 100 + g.zone * 150;
    const maxH = hp;

    const hpBar = document.createElement('div');
    hpBar.className = 'hp-bar-entity';
    hpBar.style.display = 'block';
    const hpFill = document.createElement('div');
    hpFill.className = 'hp-bar-fill';
    hpBar.appendChild(hpFill);
    el.appendChild(hpBar);

    document.getElementById('entity-layer').appendChild(el);
    g.mobs.push({
        el, x, y, hp, maxH, type: 'miniboss',
        active: true, ai: 'aggressive', dir: -1
    });
    g.miniBossNearby = true;
    setTimeout(() => g.miniBossNearby = false, 10000);
}

function spawnPortal(x, y) {
    const el = document.createElement('div');
    el.className = 'portal';
    el.style.left = x + 'px';
    el.style.bottom = y + 'px';

    document.getElementById('item-layer').appendChild(el);
    g.items.push({
        el, x, y, type: 'portal', active: true,
        teleportDistance: 500 + Math.random() * 300
    });
}

function spawnDecoration(x, y) {
    const decorations = ['🌳', '🗿', '💀', '🔥', '❄️', '⚡', '🌙', '☀️', '🌟'];
    const deco = decorations[Math.floor(Math.random() * decorations.length)];

    const el = document.createElement('div');
    el.className = 'decoration';
    el.style.left = x + 'px';
    el.style.bottom = y + 'px';
    el.innerHTML = deco;

    document.getElementById('fx-layer').appendChild(el);
}

function addPlat(x, y, w, h) {
    const el = document.createElement('div');
    el.className = 'platform';

    // Couleur des plateformes selon la zone
    let platColor = 'linear-gradient(180deg, #3a3a3a, #1a1a1a)';
    let borderColor = '#666';

    if (g.zone >= 5) {
        platColor = 'linear-gradient(180deg, #2a1a3a, #0a0a1a)';
        borderColor = '#a0a';
    } else if (g.zone >= 4) {
        platColor = 'linear-gradient(180deg, #1a2a3a, #0a1520)';
        borderColor = '#6af';
    } else if (g.zone >= 3) {
        platColor = 'linear-gradient(180deg, #3a2a1a, #1a0a0a)';
        borderColor = '#f80';
    } else if (g.zone >= 2) {
        platColor = 'linear-gradient(180deg, #1a3a2a, #0a1a0a)';
        borderColor = '#6a6';
    }

    el.style.cssText = `left:${x}px; bottom:${y}px; width:${w}px; height:${h}px; background: ${platColor}; border-top-color: ${borderColor};`;
    document.getElementById('platform-layer').appendChild(el);
    g.plats.push({ x, y, w, h, el });
}

function spawnMob(x, y, type) {
    const el = document.createElement('div');
    el.className = type;
    el.style.left = x + 'px';
    el.style.bottom = y + 'px';

    if (type === 'enemy') {
        const hpScaling = g.danger * (1 + g.zone * 0.2);
        const hp = Math.floor(50 + g.danger * 30 * hpScaling);
        const maxH = hp;

        const hpBar = document.createElement('div');
        hpBar.className = 'hp-bar-entity';
        const hpFill = document.createElement('div');
        hpFill.className = 'hp-bar-fill';
        hpBar.appendChild(hpFill);
        el.appendChild(hpBar);

        document.getElementById('entity-layer').appendChild(el);
        g.mobs.push({ el, x, y, hp, maxH, type, active: true, ai: Math.random() > 0.5 ? 'chase' : 'patrol', dir: 1, patrolStart: x });
    } else {
        document.getElementById('entity-layer').appendChild(el);
        g.mobs.push({ el, x, y, type, active: true, gold: Math.floor(100 + Math.random() * 200 + g.zone * 50) });
    }
}

function spawnPotion(x, y) {
    const types = ['health', 'strength', 'speed'];
    const type = types[Math.floor(Math.random() * types.length)];
    const el = document.createElement('div');
    el.className = `potion potion-${type}`;
    el.style.left = x + 'px';
    el.style.bottom = y + 'px';
    document.getElementById('item-layer').appendChild(el);
    g.items.push({ el, x, y, type, active: true });
}

function collectPotion(item) {
    const p = g.player;
    item.active = false;
    item.el.remove();
    g.player.potionsCollected++;
    updateQuestProgress('potion', 1);

    switch (item.type) {
        case 'health':
            p.maxH += 50;
            p.hp = Math.min(p.hp + 100, p.maxH);
            showDamageNumber(item.x, item.y, '+100 HP', 'crit');
            break;
        case 'strength':
            g.selected.atk += 15;
            showDamageNumber(item.x, item.y, '+15 ATK', 'crit');
            break;
        case 'speed':
            p.moveSpeed += 0.15;
            showDamageNumber(item.x, item.y, '+SPEED', 'crit');
            break;
    }
    createParticles(item.x, item.y, 15, '#0ff');
}

function spawnBoss() {
    if (g.bossSpawned) return;
    g.bossSpawned = true;

    const bossX = g.player.x + 800;
    const bossY = 150;
    const el = document.createElement('div');
    el.className = 'boss';
    el.style.left = bossX + 'px';
    el.style.bottom = bossY + 'px';

    const bossHp = 500 + g.danger * 200 + g.zone * 300;
    const maxH = bossHp;

    const hpBar = document.createElement('div');
    hpBar.className = 'hp-bar-entity';
    hpBar.style.display = 'block';
    const hpFill = document.createElement('div');
    hpFill.className = 'hp-bar-fill';
    hpBar.appendChild(hpFill);
    el.appendChild(hpBar);

    document.getElementById('entity-layer').appendChild(el);
    g.mobs.push({ el, x: bossX, y: bossY, hp: bossHp, maxH, type: 'boss', active: true, ai: 'boss', dir: -1 });

    showDamageNumber(bossX, bossY + 100, '⚠️ BOSS ⚠️', 'crit');
}

function updateEnemyAI(m) {
    if (!m.active || (m.type !== 'enemy' && m.type !== 'boss' && m.type !== 'miniboss')) return;

    const p = g.player;
    const dist = Math.abs(m.x - p.x);

    if (m.ai === 'chase' || m.type === 'boss' || m.ai === 'aggressive' || m.type === 'miniboss') {
        const chaseDistance = m.type === 'boss' ? 800 : m.type === 'miniboss' ? 700 : 600;
        if (dist < chaseDistance) {
            const moveSpeed = m.type === 'boss' ? 3 : m.type === 'miniboss' ? 2.5 : 2;
            m.x += (p.x > m.x ? moveSpeed : -moveSpeed);
            m.dir = p.x > m.x ? 1 : -1;
        }
    } else if (m.ai === 'patrol') {
        if (Math.abs(m.x - m.patrolStart) > 200) m.dir *= -1;
        m.x += m.dir * 1.5;
    }

    m.el.style.left = m.x + 'px';
    m.el.style.transform = `scaleX(${m.dir})`;

    // Enemy attack player
    if (dist < 60 && Math.abs(m.y - p.y) < 60 && p.invulnerable === 0) {
        let dmg = 20;
        if (m.type === 'boss') dmg = 50;
        else if (m.type === 'miniboss') dmg = 35;

        p.hp -= dmg;
        p.invulnerable = 30;
        showDamageNumber(p.x, p.y + 30, `-${dmg}`, 'normal');
        if (p.hp <= 0) gameOver();
    }
}

function attack() {
    const p = g.player;
    if (p.attackCooldown > 0) return;

    p.attackCooldown = Math.floor(20 * g.upgrades.atkSpeed);

    const slashEl = document.getElementById('p-slash');
    slashEl.classList.add('slash-anim');
    setTimeout(() => slashEl.classList.remove('slash-anim'), 150);

    if (g.selected.type === 'ranged') shootProjectile();
    else meleeAttack();
}

function meleeAttack() {
    const p = g.player;
    const baseAtk = g.selected.atk;
    const comboMult = 1 + Math.min(p.combo * 0.1, 2); // Max 3x from combo

    g.mobs.forEach(m => {
        const inRange = Math.abs(m.x - p.x) < 100 && Math.abs(m.y - p.y) < 80;
        if (m.active && inRange) {
            hit(m, p.x, p.y, comboMult);
        }
    });
}

function shootProjectile() {
    const p = g.player;
    const el = document.createElement('div');
    el.className = 'projectile';
    el.style.left = (p.x + 40) + 'px';
    el.style.bottom = (p.y + 20) + 'px';

    // Augmenter la vitesse et portée selon la classe
    let speed = 15;
    let size = 25;

    if (g.selected.id === 'Mage') {
        speed = 20;
        size = 30;
        el.style.background = 'radial-gradient(circle, #88f, #44f)';
        el.style.boxShadow = '0 0 15px #44f';
    } else if (g.selected.id === 'Archer' || g.selected.id === 'Scout') {
        speed = 25;
        size = 20;
        el.style.background = 'linear-gradient(90deg, #ff8, #fa0)';
        el.style.boxShadow = '0 0 10px #fa0';
    } else if (g.selected.id === 'Necromancer') {
        speed = 18;
        size = 28;
        el.style.background = 'radial-gradient(circle, #a0a, #505)';
        el.style.boxShadow = '0 0 20px #a0a';
    } else if (g.selected.id === 'Cleric') {
        speed = 16;
        size = 26;
        el.style.background = 'radial-gradient(circle, #ffa, #ff8)';
        el.style.boxShadow = '0 0 12px #ff8';
    }

    el.style.width = size + 'px';

    document.getElementById('fx-layer').appendChild(el);

    const comboMult = 1 + Math.min(p.combo * 0.1, 2);
    const baseRange = 800 + (g.player.lvl * 50);
    const rangeBonus = p.rangeBonus || 0;
    const finalRange = baseRange * (1 + rangeBonus);

    g.pjs.push({
        el, x: p.x + 40, y: p.y + 20,
        vx: p.dir * speed, comboMult,
        maxDistance: finalRange,
        startX: p.x + 40
    });
}

function hit(mob, hitX, hitY, comboMult = 1) {
    const p = g.player;
    const isCrit = Math.random() < p.critChance;
    const baseDmg = g.selected.atk;
    const critMult = isCrit ? 2 : 1;
    const totalDmg = Math.floor(baseDmg * critMult * comboMult);

    mob.hp -= totalDmg;

    // Life steal
    if (p.lifeSteal > 0) {
        const heal = Math.floor(totalDmg * p.lifeSteal);
        p.hp = Math.min(p.hp + heal, p.maxH);
        if (heal > 0) showDamageNumber(p.x, p.y + 40, `+${heal}`, 'crit');
    }

    const hpBar = mob.el.querySelector('.hp-bar-fill');
    if (hpBar) {
        hpBar.style.width = ((mob.hp / mob.maxH) * 100) + '%';
        mob.el.querySelector('.hp-bar-entity').style.display = 'block';
    }

    const dmgText = isCrit ? `${totalDmg} CRIT!` : `${totalDmg}`;
    const comboText = comboMult > 1 ? ` x${comboMult.toFixed(1)}` : '';
    showDamageNumber(mob.x, mob.y + 30, dmgText + comboText, isCrit ? 'crit' : 'normal');
    createParticles(mob.x, mob.y + 20, 8, isCrit ? '#ff0' : '#fff');

    if (mob.hp <= 0) killMob(mob);
}

function killMob(mob) {
    mob.active = false;
    mob.el.remove();

    const p = g.player;

    if (mob.type === 'enemy' || mob.type === 'boss' || mob.type === 'miniboss') {
        p.kills++;

        let expGain = 10;
        let goldDrop = 50 + Math.floor(Math.random() * 50);

        if (mob.type === 'boss') {
            expGain = 50;
            goldDrop = 500 + g.zone * 100;
        } else if (mob.type === 'miniboss') {
            expGain = 30;
            goldDrop = 200 + g.zone * 50;
            showDamageNumber(mob.x, mob.y + 50, '⚡ MINI-BOSS DOWN! ⚡', 'crit');
        }

        p.exp += expGain;
        p.gold += goldDrop;

        // Combo system
        p.combo++;
        p.comboTimer = g.upgrades.comboDuration;
        if (p.combo > p.maxCombo) {
            p.maxCombo = p.combo;
            updateQuestProgress('combo', 0);
        }

        updateQuestProgress('kill', 1);
        if (mob.type === 'boss') {
            p.bossKilled++;
            updateQuestProgress('boss', 1);
            g.bossSpawned = false;
            showDamageNumber(mob.x, mob.y + 50, '👑 BOSS DEFEATED! 👑', 'crit');
        }

        // Chance de drop d'items
        if (Math.random() > 0.7) {
            spawnPotion(mob.x, mob.y);
        }

        if (p.exp >= p.lvl * 100) levelUp();
        createParticles(mob.x, mob.y + 20, 15, '#ffd700');

    } else if (mob.type === 'chest') {
        p.gold += mob.gold;
        p.chestOpened++;
        updateQuestProgress('chest', 1);
        showDamageNumber(mob.x, mob.y + 30, `+${mob.gold}💰`, 'crit');

        // Items spéciaux dans les coffres
        if (mob.hasSpecialItem) {
            const specialRewards = [
                { type: 'health', msg: '+50 MAX HP!' },
                { type: 'strength', msg: '+20 ATK!' },
                { type: 'speed', msg: '+SPEED!' },
                { type: 'gold', msg: '+500💰 JACKPOT!' }
            ];

            const reward = specialRewards[Math.floor(Math.random() * specialRewards.length)];

            if (reward.type === 'health') p.maxH += 50;
            else if (reward.type === 'strength') g.selected.atk += 20;
            else if (reward.type === 'speed') p.moveSpeed += 0.15;
            else if (reward.type === 'gold') p.gold += 500;

            showDamageNumber(mob.x, mob.y + 60, reward.msg, 'crit');
        }

        createParticles(mob.x, mob.y + 20, 25, '#ffd700');
    }
}

function levelUp() {
    const p = g.player;
    p.lvl++;
    p.exp = 0;
    p.maxH += 50;
    p.hp = p.maxH;
    g.selected.atk += 10;

    updateQuestProgress('level', 0);

    const lvlFx = document.getElementById('lvl-up-fx');
    lvlFx.classList.add('lvl-anim');
    setTimeout(() => lvlFx.classList.remove('lvl-anim'), 1200);

    createParticles(p.x, p.y + 30, 30, '#ff0');
    showDamageNumber(p.x, p.y + 80, '⭐ LEVEL UP! ⭐', 'crit');
}

function showDamageNumber(x, y, text, type) {
    const el = document.createElement('div');
    el.className = `damage-number ${type}`;
    el.textContent = text;
    el.style.left = (x + Math.random() * 20 - 10) + 'px';
    el.style.bottom = y + 'px';
    document.getElementById('damage-layer').appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function createParticles(x, y, count, color) {
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
        case 'heal':
            if (p.gold >= 200) {
                p.hp = p.maxH;
                p.gold -= 200;
                showDamageNumber(p.x, p.y + 40, '+HP', 'crit');
            }
            break;
        case 'atk':
            if (p.gold >= 500) {
                g.selected.atk += 25;
                p.gold -= 500;
                showDamageNumber(p.x, p.y + 40, '+ATK', 'crit');
            }
            break;
        case 'hp':
            if (p.gold >= 600) {
                p.maxH += 100;
                p.hp += 100;
                p.gold -= 600;
                showDamageNumber(p.x, p.y + 40, '+HP', 'crit');
            }
            break;
        case 'speed':
            if (p.gold >= 800 && g.upgrades.atkSpeed > 0.5) {
                g.upgrades.atkSpeed *= 0.9;
                p.gold -= 800;
                showDamageNumber(p.x, p.y + 40, '+SPD', 'crit');
            }
            break;
        case 'crit':
            if (p.gold >= 1000) {
                p.critChance += 0.05;
                p.gold -= 1000;
                showDamageNumber(p.x, p.y + 40, '+CRIT', 'crit');
            }
            break;
        case 'movespeed':
            if (p.gold >= 700) {
                p.moveSpeed += 0.2;
                p.gold -= 700;
                showDamageNumber(p.x, p.y + 40, '+MOVE', 'crit');
            }
            break;
        case 'combo':
            if (p.gold >= 1200) {
                g.upgrades.comboDuration += 50;
                p.gold -= 1200;
                showDamageNumber(p.x, p.y + 40, '+COMBO', 'crit');
            }
            break;
        case 'lifesteal':
            if (p.gold >= 1500) {
                p.lifeSteal += 0.1;
                p.gold -= 1500;
                showDamageNumber(p.x, p.y + 40, '+LIFESTEAL', 'crit');
            }
            break;
        case 'doublejump':
            if (p.gold >= 1000 && !p.hasDoubleJump) {
                p.hasDoubleJump = true;
                p.gold -= 1000;
                showDamageNumber(p.x, p.y + 40, '💨 DOUBLE JUMP!', 'crit');
                createParticles(p.x, p.y + 30, 25, '#0ff');
            }
            break;
        case 'range':
            if (p.gold >= 900) {
                g.player.rangeBonus = (g.player.rangeBonus || 0) + 0.3;
                p.gold -= 900;
                showDamageNumber(p.x, p.y + 40, '+RANGE', 'crit');
            }
            break;
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
        document.getElementById('pause-zone').textContent = g.zone;
    }
}

function saveGame() {
    localStorage.setItem('abyssGame', JSON.stringify({
        player: g.player, selected: g.selected, danger: g.danger, timer: g.timer,
        upgrades: g.upgrades, questsCompleted: g.questsCompleted,
        zone: g.zone, totalDistance: g.totalDistance, timestamp: Date.now()
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
    g.zone = data.zone || 1;
    g.totalDistance = data.totalDistance || 0;
    startGame();
}

function gameOver() {
    g.active = false;
    document.getElementById('final-lvl').textContent = g.player.lvl;
    document.getElementById('final-gold').textContent = g.player.gold;
    document.getElementById('final-time').textContent = formatTime(g.timer);
    document.getElementById('final-kills').textContent = g.player.kills;
    document.getElementById('final-quests').textContent = g.questsCompleted;
    document.getElementById('final-zone').textContent = g.zone;
    document.getElementById('final-combo').textContent = g.player.maxCombo;
    document.getElementById('gui-gameover').style.display = 'flex';
}

function cleanupEntities() {
    const camX = g.player.x;

    // Clean up platforms behind player
    g.plats = g.plats.filter(pl => {
        if (pl.x + pl.w < camX - g.cleanupDistance) {
            pl.el.remove();
            return false;
        }
        return true;
    });

    // Clean up mobs
    g.mobs = g.mobs.filter(m => {
        if (!m.active || Math.abs(m.x - camX) > 2500 || m.y < -500) {
            if (m.el) m.el.remove();
            return false;
        }
        return true;
    });

    // Clean up projectiles
    g.pjs = g.pjs.filter(pj => {
        if (Math.abs(pj.x - camX) > 1500) {
            pj.el.remove();
            return false;
        }
        return true;
    });

    // Clean up items
    g.items = g.items.filter(i => {
        if (!i.active || Math.abs(i.x - camX) > 2000) {
            if (i.el) i.el.remove();
            return false;
        }
        return true;
    });
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

    // Movement
    if (g.keys['KeyD'] || g.keys['ArrowRight']) { p.vx = speed; p.dir = 1; }
    else if (g.keys['KeyA'] || g.keys['ArrowLeft']) { p.vx = -speed; p.dir = -1; }
    else p.vx *= 0.8;

    // Dash mechanic (Shift key)
    if (g.keys['ShiftLeft'] || g.keys['ShiftRight']) {
        if (p.dashCooldown === 0) {
            p.vx = p.dir * 25;
            p.dashCooldown = 60;
            p.invulnerable = 15;
            createParticles(p.x, p.y + 20, 15, '#0ff');
            showDamageNumber(p.x, p.y + 50, '💨 DASH!', 'crit');
        }
    }

    // Jump with double jump
    if ((g.keys['Space'] || g.keys['KeyW'] || g.keys['ArrowUp'])) {
        if (p.ground) {
            p.vy = 16;
            p.ground = false;
            p.doubleJump = false;
        } else if (!p.doubleJump && p.hasDoubleJump && !g.keys._spaceReleased) {
            p.vy = 16;
            p.doubleJump = true;
            createParticles(p.x, p.y, 10, '#fff');
            showDamageNumber(p.x, p.y + 40, '✨ DOUBLE JUMP!', 'crit');
        }
        g.keys._spaceReleased = false;
    } else {
        g.keys._spaceReleased = true;
    }

    // Physics
    p.vy -= 0.85;
    p.x += p.vx;
    p.y += p.vy;
    p.ground = false;

    // Track total distance
    if (p.vx > 0) g.totalDistance += Math.abs(p.vx);

    // Platform collision
    g.plats.forEach(pl => {
        if (p.x + 40 > pl.x && p.x < pl.x + pl.w &&
            p.vy <= 0 && p.y >= pl.y + pl.h - 12 && p.y <= pl.y + pl.h + 5) {
            p.y = pl.y + pl.h;
            p.vy = 0;
            p.ground = true;
        }
    });

    // Projectile updates
    g.pjs.forEach((pj, i) => {
        pj.x += pj.vx;
        pj.el.style.left = pj.x + 'px';

        // Distance traveled check
        const startX = pj.startX || pj.x;
        if (!pj.startX) pj.startX = startX;

        if (Math.abs(pj.x - startX) > (pj.maxDistance || 800)) {
            pj.el.remove();
            g.pjs.splice(i, 1);
            return;
        }

        g.mobs.forEach(m => {
            if (m.active && Math.abs(pj.x - m.x) < 45 && Math.abs(pj.y - m.y) < 45) {
                hit(m, pj.x, pj.y, pj.comboMult || 1);
                pj.el.remove();
                g.pjs.splice(i, 1);
            }
        });
    });

    // Item collection and interactions
    g.items.forEach((item, idx) => {
        if (!item.active) return;

        const dist = Math.abs(p.x - item.x);
        const distY = Math.abs(p.y - item.y);

        if (dist < 50 && distY < 50) {
            if (item.type === 'trap') {
                // Piège
                if (p.invulnerable === 0) {
                    p.hp -= item.damage;
                    p.invulnerable = 40;
                    showDamageNumber(p.x, p.y + 30, `-${item.damage} TRAP!`, 'normal');
                    createParticles(item.x, item.y, 20, '#f00');
                    item.active = false;
                    item.el.remove();
                    if (p.hp <= 0) gameOver();
                }
            } else if (item.type === 'bonus') {
                // Plateforme bonus
                p.gold += item.reward;
                p.exp += 20;
                showDamageNumber(item.x, item.y, `+${item.reward}💰 BONUS!`, 'crit');
                createParticles(item.x, item.y, 30, '#ffd700');
                item.active = false;
                item.el.remove();
            } else if (item.type === 'portal') {
                // Portail
                p.x += item.teleportDistance * p.dir;
                showDamageNumber(p.x, p.y + 50, '🌀 TELEPORT!', 'crit');
                createParticles(item.x, item.y, 40, '#0ff');
                item.active = false;
                item.el.remove();
            } else {
                // Potions normales
                collectPotion(item);
            }
        }
    });

    // Update enemies
    g.mobs.forEach(m => updateEnemyAI(m));

    // INFINITE MAP GENERATION - Generate ahead of player
    if (p.x + g.platformBuffer > g.lastX) {
        spawnMap();
    }

    // Fall death
    if (p.y < -300) gameOver();

    // Cooldowns
    if (p.attackCooldown > 0) p.attackCooldown--;
    if (p.invulnerable > 0) p.invulnerable--;
    if (p.dashCooldown > 0) p.dashCooldown--;

    // Reset double jump when grounded
    if (p.ground) p.doubleJump = false;

    // Render player
    const playerEl = document.getElementById('player');
    playerEl.style.left = p.x + 'px';
    playerEl.style.bottom = p.y + 'px';
    playerEl.style.transform = `scaleX(${p.dir})`;
    playerEl.style.opacity = p.invulnerable > 0 && p.invulnerable % 4 < 2 ? 0.5 : 1;

    // Camera follow
    document.getElementById('world').style.transform = `translateX(${-p.x + 200}px)`;
    document.getElementById('parallax-bg').style.transform = `translateX(${-p.x * 0.15}px)`;

    // Update HUD
    document.getElementById('hp-bar').style.width = (p.hp / p.maxH) * 100 + '%';
    document.getElementById('hp-text').textContent = `${Math.floor(p.hp)}/${p.maxH}`;
    document.getElementById('exp-bar').style.width = (p.exp % 100) + '%';
    document.getElementById('exp-text').textContent = `${p.exp % 100}/100`;
    document.getElementById('gold-val').textContent = p.gold;
    document.getElementById('danger-val').textContent = g.danger;
    document.getElementById('lvl-tag').textContent = `LV. ${p.lvl}`;
    document.getElementById('timer-val').textContent = formatTime(g.timer);
    document.getElementById('kills-val').textContent = p.kills;
    document.getElementById('zone-val').textContent = g.zone;

    // Update background based on zone
    const bgEl = document.getElementById('parallax-bg');
    bgEl.className = '';
    if (g.zone >= 5) bgEl.classList.add('zone-5');
    else if (g.zone >= 4) bgEl.classList.add('zone-4');
    else if (g.zone >= 3) bgEl.classList.add('zone-3');
    else if (g.zone >= 2) bgEl.classList.add('zone-2');
    else bgEl.classList.add('zone-1');

    // Combo display
    const comboEl = document.getElementById('combo-val');
    comboEl.textContent = p.combo;
    if (p.combo > 0) {
        comboEl.parentElement.style.color = p.combo >= 20 ? '#ff0' : p.combo >= 10 ? '#f80' : '#fff';
    }

    updateQuestProgress('gold', 0);

    requestAnimationFrame(loop);
}

// Event listeners
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