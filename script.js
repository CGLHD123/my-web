// ========== GAME CLASSES DATA ==========
const classes = [
    { id: 'Warrior', hp: 500, atk: 90, wp: 'Nihonto.png', type: 'melee', color: '#600', desc: 'Chiến binh cận chiến mạnh mẽ' },
    { id: 'Mage', hp: 160, atk: 260, wp: 'Wandering_Staff.png', type: 'ranged', color: '#006', desc: 'Pháp sư với sát thương phép thuật cao' },
    { id: 'Scout', hp: 220, atk: 80, wp: 'Hunting_Bow.png', type: 'ranged', color: '#060', desc: 'Trinh sát nhanh nhẹn' },
    { id: 'Tanker', hp: 1600, atk: 45, wp: 'Battle_Axe.png', type: 'melee', color: '#444', desc: 'Tank với HP cực cao' },
    { id: 'Rogue', hp: 280, atk: 190, wp: 'Knife.png', type: 'melee', color: '#222', desc: 'Sát thủ với sát thương chí mạng' },
    { id: 'Cleric', hp: 420, atk: 85, wp: 'Wandering_Staff.png', type: 'ranged', color: '#860', desc: 'Mục sư hỗ trợ và tấn công' },
    { id: 'Archer', hp: 260, atk: 170, wp: 'Hunting_Bow.png', type: 'ranged', color: '#540', desc: 'Cung thủ tầm xa' },
    { id: 'Necromancer', hp: 320, atk: 210, wp: 'Wandering_Staff.png', type: 'ranged', color: '#304', desc: 'Phù thủy tối với phép tối thượng' },
    { id: 'Paladin', hp: 850, atk: 125, wp: 'Nihonto.png', type: 'melee', color: '#ddd', desc: 'Hiệp sĩ cân bằng giữa tấn công và phòng thủ' },
    { id: 'Berserker', hp: 650, atk: 230, wp: 'Battle_Axe.png', type: 'melee', color: '#a00', desc: 'Cuồng chiến với sát thương khủng' }
];

// ========== GAME STATE ==========
let g = {
    active: false,
    paused: false,
    player: {
        x: 100, y: 150,
        vx: 0, vy: 0,
        hp: 100, maxH: 100,
        exp: 0, lvl: 1,
        gold: 0, kills: 0,
        dir: 1,
        ground: false,
        attackCooldown: 0,
        critChance: 0.15,
        invulnerable: 0
    },
    plats: [],
    mobs: [],
    pjs: [],
    keys: {},
    lastX: 0,
    danger: 1,
    timer: 0,
    startTime: 0,
    bossSpawned: false,
    cleanupTimer: 0,
    upgrades: {
        atkSpeed: 1
    }
};

// ========== INITIALIZATION ==========
window.onload = () => {
    const grid = document.getElementById('class-grid');
    classes.forEach(c => {
        const card = document.createElement('div');
        card.className = 'card';
        // Tạo placeholder gradient thay vì hình ảnh
        card.style.background = `linear-gradient(135deg, ${c.color} 0%, ${adjustColor(c.color, -30)} 100%)`;

        card.onclick = () => {
            document.querySelectorAll('.card').forEach(v => v.classList.remove('active'));
            card.classList.add('active');
            g.selected = JSON.parse(JSON.stringify(c));
            document.getElementById('start-btn').disabled = false;

            const statsHTML = `
                <p>📊 <strong>HP:</strong> ${c.hp}</p>
                <p>⚔️ <strong>ATK:</strong> ${c.atk}</p>
                <p>🎯 <strong>Type:</strong> ${c.type === 'melee' ? 'Cận chiến' : 'Tầm xa'}</p>
                <p style="color:#aaa; margin-top:10px;">${c.desc}</p>
            `;
            document.getElementById('class-stats').innerHTML = statsHTML;
        };
        grid.appendChild(card);
    });

    // Check if saved game exists
    if (localStorage.getItem('abyssGame')) {
        document.getElementById('continue-btn').style.display = 'inline-block';
    }

    setupMobileControls();
};

// ========== UTILITY FUNCTIONS ==========
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

// ========== GAME START ==========
function startGame() {
    const s = g.selected;
    Object.assign(g.player, {
        hp: s.hp,
        maxH: s.hp,
        exp: 0,
        lvl: 1,
        gold: 0,
        kills: 0
    });

    document.getElementById('p-sprite').style.backgroundColor = s.color;
    document.getElementById('gui-select').style.display = 'none';

    // Initial platforms
    addPlat(0, 50, 2000, 50);
    g.lastX = 2000;

    for (let i = 0; i < 8; i++) spawnMap();

    g.active = true;
    g.startTime = Date.now();
    requestAnimationFrame(loop);

    // Game timer
    setInterval(() => {
        if (g.active && !g.paused) {
            g.timer++;
            g.danger = 1 + Math.floor(g.timer / 30);

            // Boss spawn every 2 minutes
            if (g.timer % 120 === 0 && g.timer > 0) {
                spawnBoss();
            }
        }
    }, 1000);

    // Cleanup old entities
    setInterval(() => {
        if (g.active && !g.paused) {
            cleanupEntities();
        }
    }, 5000);
}

// ========== MAP GENERATION ==========
function spawnMap() {
    const w = 350 + Math.random() * 450;
    const x = g.lastX + 140 + Math.random() * 180;
    const y = 50 + Math.random() * 100;

    addPlat(x, y, w, 50);

    const rng = Math.random();
    if (rng > 0.35) {
        spawnMob(x + w / 2, y + 50, 'enemy');
        // Chance for double spawn at higher danger
        if (g.danger > 3 && Math.random() > 0.6) {
            spawnMob(x + w / 3, y + 50, 'enemy');
        }
    } else if (rng < 0.12) {
        spawnMob(x + w / 2, y + 50, 'chest');
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

    const mob = {
        x, y,
        hp: type === 'enemy' ? (100 * g.danger) : 1,
        maxHp: type === 'enemy' ? (100 * g.danger) : 1,
        el,
        active: true,
        type,
        vx: 0,
        vy: 0,
        ground: false,
        target: null,
        attackCooldown: 0,
        ai: type === 'enemy'
    };

    // Add HP bar for enemies
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

    const x = g.player.x + 800;
    const y = 150;

    const el = document.createElement('div');
    el.className = 'boss';
    el.style.left = x + 'px';
    el.style.bottom = y + 'px';

    const bossHp = 1000 * g.danger;
    const mob = {
        x, y,
        hp: bossHp,
        maxHp: bossHp,
        el,
        active: true,
        type: 'boss',
        vx: 0,
        vy: 0,
        ground: false,
        target: null,
        attackCooldown: 0,
        ai: true,
        isBoss: true
    };

    // Boss HP bar
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

    showDamageNumber(x, y + 50, '⚠️ BOSS APPEARED ⚠️', 'crit');
}

// ========== COMBAT SYSTEM ==========
function attack() {
    if (!g.active || g.paused || g.player.attackCooldown > 0) return;
    if (document.getElementById('gui-shop').style.display === 'flex') return;

    const p = g.player;
    const s = g.selected;

    // Set cooldown based on upgrades
    g.player.attackCooldown = 20 * g.upgrades.atkSpeed;

    if (s.type === 'melee') {
        // Melee attack
        const fx = document.getElementById('p-slash');
        fx.classList.add('slash-anim');
        setTimeout(() => fx.classList.remove('slash-anim'), 150);

        g.mobs.forEach(m => {
            if (m.active && Math.abs((p.x + p.dir * 60) - m.x) < 100 && Math.abs(p.y - m.y) < 70) {
                hit(m, p.x + p.dir * 60, p.y + 25);
            }
        });
    } else {
        // Ranged attack
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

    // Update HP bar
    if (m.hpFill) {
        const hpPercent = Math.max(0, (m.hp / m.maxHp) * 100);
        m.hpFill.style.width = hpPercent + '%';
        if (m.hpBar) m.hpBar.style.display = 'block';
    }

    // Flash effect
    if (m.el) {
        m.el.classList.add('hit-flash');
        setTimeout(() => m.el.classList.remove('hit-flash'), 200);
    }

    // Damage number
    showDamageNumber(hitX, hitY, `-${Math.floor(damage)}`, isCrit ? 'crit' : '');

    // Create particles
    createParticles(hitX, hitY, isCrit ? 8 : 4);

    if (m.hp <= 0 && m.active) {
        killMob(m);
    }
}

function killMob(m) {
    m.active = false;
    if (m.el) m.el.remove();

    if (m.type === 'chest') {
        g.player.gold += 500;
        showDamageNumber(m.x, m.y, '+500 💰', 'crit');
        createParticles(m.x, m.y, 12, '#c5a059');
    } else {
        const goldReward = (m.isBoss ? 500 : 50) * g.danger;
        const expReward = m.isBoss ? 200 : 34;

        g.player.gold += goldReward;
        g.player.exp += expReward;
        g.player.kills++;

        showDamageNumber(m.x, m.y + 20, `+${goldReward} 💰`, '');
        createParticles(m.x, m.y, m.isBoss ? 20 : 6, '#f00');

        if (m.isBoss) {
            g.bossSpawned = false;
            showDamageNumber(m.x, m.y + 40, '🏆 BOSS DEFEATED 🏆', 'crit');
        }

        if (g.player.exp >= 100) {
            levelUp();
        }
    }
}

function levelUp() {
    g.player.lvl++;
    g.player.exp -= 100;
    g.player.maxH += 50;
    g.player.hp = Math.min(g.player.hp + 100, g.player.maxH);
    g.selected.atk += 15;

    const fx = document.getElementById('lvl-up-fx');
    fx.classList.add('lvl-anim');
    setTimeout(() => fx.classList.remove('lvl-anim'), 1200);

    createParticles(g.player.x, g.player.y + 50, 20, '#ff0');

    // Check if player leveled up multiple times
    if (g.player.exp >= 100) {
        levelUp();
    }
}

// ========== ENEMY AI ==========
function updateEnemyAI(m) {
    if (!m.ai || !m.active) return;

    const p = g.player;
    const dist = Math.abs(m.x - p.x);

    // Detection range
    if (dist < 500) {
        // Move towards player
        if (m.x < p.x - 60) {
            m.vx = m.isBoss ? 3 : 2;
        } else if (m.x > p.x + 60) {
            m.vx = m.isBoss ? -3 : -2;
        } else {
            m.vx = 0;
            // Attack player if in range
            if (m.attackCooldown <= 0 && Math.abs(m.y - p.y) < 60) {
                attackPlayer(m);
                m.attackCooldown = m.isBoss ? 60 : 90;
            }
        }

        // Jump if needed
        if (m.ground && Math.random() > 0.97) {
            m.vy = 12;
            m.ground = false;
        }
    } else {
        m.vx *= 0.9;
    }

    // Apply physics
    m.vy -= 0.85;
    m.x += m.vx;
    m.y += m.vy;
    m.ground = false;

    // Platform collision
    g.plats.forEach(pl => {
        if (m.x + 45 > pl.x && m.x < pl.x + pl.w &&
            m.vy <= 0 && m.y >= pl.y + pl.h - 12 && m.y <= pl.y + pl.h + 5) {
            m.y = pl.y + pl.h;
            m.vy = 0;
            m.ground = true;
        }
    });

    // Update position
    if (m.el) {
        m.el.style.left = m.x + 'px';
        m.el.style.bottom = m.y + 'px';
    }

    // Decrease cooldown
    if (m.attackCooldown > 0) m.attackCooldown--;

    // Remove if fell too far
    if (m.y < -500) {
        m.active = false;
        if (m.el) m.el.remove();
    }
}

function attackPlayer(m) {
    if (g.player.invulnerable > 0) return;

    const damage = m.isBoss ? 50 * g.danger : 20 * g.danger;
    g.player.hp -= damage;

    showDamageNumber(g.player.x, g.player.y + 30, `-${Math.floor(damage)}`, '');
    createParticles(g.player.x, g.player.y + 25, 6, '#f00');

    // Invulnerability frames
    g.player.invulnerable = 30;

    if (g.player.hp <= 0) {
        gameOver();
    }
}

// ========== VISUAL EFFECTS ==========
function showDamageNumber(x, y, text, type = '') {
    const dmg = document.createElement('div');
    dmg.className = 'damage-number ' + type;
    dmg.textContent = text;
    dmg.style.left = x + 'px';
    dmg.style.bottom = y + 'px';
    dmg.classList.add('damage-float');

    document.getElementById('damage-layer').appendChild(dmg);

    setTimeout(() => dmg.remove(), 1000);
}

function createParticles(x, y, count = 6, color = '#fff') {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.backgroundColor = color;
        particle.style.left = x + 'px';
        particle.style.bottom = y + 'px';

        const angle = (Math.PI * 2 * i) / count;
        const speed = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        document.getElementById('fx-layer').appendChild(particle);

        let life = 0;
        const particleAnim = setInterval(() => {
            life++;
            const px = parseFloat(particle.style.left) + vx;
            const py = parseFloat(particle.style.bottom) + vy - life * 0.2;
            particle.style.left = px + 'px';
            particle.style.bottom = py + 'px';

            if (life > 20) {
                clearInterval(particleAnim);
                particle.remove();
            }
        }, 16);
    }
}

// ========== SHOP SYSTEM ==========
function buy(type) {
    const p = g.player;

    switch (type) {
        case 'heal':
            if (p.gold >= 200) {
                p.hp = p.maxH;
                p.gold -= 200;
                showDamageNumber(p.x, p.y + 40, '+FULL HP', 'crit');
            }
            break;
        case 'atk':
            if (p.gold >= 500) {
                g.selected.atk += 25;
                p.gold -= 500;
                showDamageNumber(p.x, p.y + 40, '+25 ATK', 'crit');
            }
            break;
        case 'hp':
            if (p.gold >= 600) {
                p.maxH += 100;
                p.hp += 100;
                p.gold -= 600;
                showDamageNumber(p.x, p.y + 40, '+100 MAX HP', 'crit');
            }
            break;
        case 'speed':
            if (p.gold >= 800 && g.upgrades.atkSpeed > 0.5) {
                g.upgrades.atkSpeed *= 0.9;
                p.gold -= 800;
                showDamageNumber(p.x, p.y + 40, '+ATK SPEED', 'crit');
            }
            break;
    }
}

// ========== GUI FUNCTIONS ==========
function toggleGUI(id) {
    const el = document.getElementById(id);
    const wasHidden = el.style.display === 'none';
    el.style.display = wasHidden ? 'flex' : 'none';

    if (id === 'gui-shop' || id === 'gui-help') {
        g.paused = wasHidden;
    }
}

function togglePause() {
    g.paused = !g.paused;
    document.getElementById('gui-pause').style.display = g.paused ? 'flex' : 'none';
}

// ========== SAVE/LOAD SYSTEM ==========
function saveGame() {
    const saveData = {
        player: g.player,
        selected: g.selected,
        danger: g.danger,
        timer: g.timer,
        upgrades: g.upgrades,
        timestamp: Date.now()
    };

    localStorage.setItem('abyssGame', JSON.stringify(saveData));
    showDamageNumber(g.player.x, g.player.y + 50, '💾 GAME SAVED', 'crit');
}

function loadGame() {
    const saved = localStorage.getItem('abyssGame');
    if (!saved) return;

    const data = JSON.parse(saved);

    g.selected = data.selected;
    Object.assign(g.player, data.player);
    g.danger = data.danger;
    g.timer = data.timer;
    g.upgrades = data.upgrades;

    startGame();
}

// ========== GAME OVER ==========
function gameOver() {
    g.active = false;

    document.getElementById('final-lvl').textContent = g.player.lvl;
    document.getElementById('final-gold').textContent = g.player.gold;
    document.getElementById('final-time').textContent = formatTime(g.timer);
    document.getElementById('final-kills').textContent = g.player.kills;

    document.getElementById('gui-gameover').style.display = 'flex';
}

// ========== CLEANUP ==========
function cleanupEntities() {
    const camX = g.player.x;

    // Remove far platforms
    g.plats = g.plats.filter(pl => {
        if (Math.abs(pl.x - camX) > 2000) {
            if (pl.el) pl.el.remove();
            return false;
        }
        return true;
    });

    // Remove far mobs
    g.mobs = g.mobs.filter(m => {
        if (!m.active || Math.abs(m.x - camX) > 2000 || m.y < -500) {
            if (m.el) m.el.remove();
            return false;
        }
        return true;
    });

    // Remove far projectiles
    g.pjs = g.pjs.filter(pj => {
        if (Math.abs(pj.x - camX) > 1500) {
            if (pj.el) pj.el.remove();
            return false;
        }
        return true;
    });
}

// ========== MOBILE CONTROLS ==========
function setupMobileControls() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;

    document.getElementById('btn-left').addEventListener('touchstart', () => g.keys['KeyA'] = true);
    document.getElementById('btn-left').addEventListener('touchend', () => g.keys['KeyA'] = false);

    document.getElementById('btn-right').addEventListener('touchstart', () => g.keys['KeyD'] = true);
    document.getElementById('btn-right').addEventListener('touchend', () => g.keys['KeyD'] = false);

    document.getElementById('btn-jump').addEventListener('touchstart', () => g.keys['Space'] = true);
    document.getElementById('btn-jump').addEventListener('touchend', () => g.keys['Space'] = false);

    document.getElementById('btn-attack').addEventListener('touchstart', () => attack());
}

// ========== MAIN GAME LOOP ==========
function loop() {
    if (!g.active) return;
    if (g.paused) {
        requestAnimationFrame(loop);
        return;
    }

    const p = g.player;

    // Player movement
    if (g.keys['KeyD'] || g.keys['ArrowRight']) {
        p.vx = 8;
        p.dir = 1;
    } else if (g.keys['KeyA'] || g.keys['ArrowLeft']) {
        p.vx = -8;
        p.dir = -1;
    } else {
        p.vx *= 0.8;
    }

    if ((g.keys['Space'] || g.keys['KeyW'] || g.keys['ArrowUp']) && p.ground) {
        p.vy = 16;
        p.ground = false;
    }

    // Physics
    p.vy -= 0.85;
    p.x += p.vx;
    p.y += p.vy;
    p.ground = false;

    // Platform collision
    g.plats.forEach(pl => {
        if (p.x + 40 > pl.x && p.x < pl.x + pl.w &&
            p.vy <= 0 && p.y >= pl.y + pl.h - 12 && p.y <= pl.y + pl.h + 5) {
            p.y = pl.y + pl.h;
            p.vy = 0;
            p.ground = true;
        }
    });

    // Update projectiles
    g.pjs.forEach((pj, i) => {
        pj.x += pj.vx;
        pj.el.style.left = pj.x + 'px';

        // Check collision with mobs
        g.mobs.forEach(m => {
            if (m.active && Math.abs(pj.x - m.x) < 45 && Math.abs(pj.y - m.y) < 45) {
                hit(m, pj.x, pj.y);
                pj.el.remove();
                g.pjs.splice(i, 1);
            }
        });
    });

    // Update enemies
    g.mobs.forEach(m => updateEnemyAI(m));

    // Spawn new map sections
    if (p.x + 1200 > g.lastX) {
        spawnMap();
    }

    // Death check
    if (p.y < -300) {
        gameOver();
    }

    // Decrease cooldowns
    if (p.attackCooldown > 0) p.attackCooldown--;
    if (p.invulnerable > 0) p.invulnerable--;

    // Update player visuals
    const playerEl = document.getElementById('player');
    playerEl.style.left = p.x + 'px';
    playerEl.style.bottom = p.y + 'px';
    playerEl.style.transform = `scaleX(${p.dir})`;

    // Invulnerability flash
    playerEl.style.opacity = p.invulnerable > 0 && p.invulnerable % 4 < 2 ? 0.5 : 1;

    // Camera
    document.getElementById('world').style.transform = `translateX(${-p.x + 200}px)`;
    document.getElementById('parallax-bg').style.transform = `translateX(${-p.x * 0.15}px)`;

    // Update HUD
    const hpPercent = (p.hp / p.maxH) * 100;
    document.getElementById('hp-bar').style.width = hpPercent + '%';
    document.getElementById('hp-text').textContent = `${Math.floor(p.hp)}/${p.maxH}`;

    const expPercent = (p.exp % 100);
    document.getElementById('exp-bar').style.width = expPercent + '%';
    document.getElementById('exp-text').textContent = `${p.exp % 100}/100`;

    document.getElementById('gold-val').textContent = p.gold;
    document.getElementById('danger-val').textContent = g.danger;
    document.getElementById('lvl-tag').textContent = `LV. ${p.lvl}`;
    document.getElementById('timer-val').textContent = formatTime(g.timer);

    requestAnimationFrame(loop);
}

// ========== EVENT LISTENERS ==========
window.onkeydown = e => {
    g.keys[e.code] = true;

    if (e.code === 'KeyH') toggleGUI('gui-help');
    if (e.code === 'KeyB') toggleGUI('gui-shop');
    if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
};

window.onkeyup = e => {
    g.keys[e.code] = false;
};

window.onmousedown = e => {
    if (e.button === 0) attack();
};

// Prevent context menu
window.oncontextmenu = () => false;