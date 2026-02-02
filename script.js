const classes = [
    { id: 'scout', hp: 120, atk: 25, type: 'bow' },
    { id: 'warrior', hp: 180, atk: 35, type: 'bow' },
    { id: 'tanker', hp: 500, atk: 20, type: 'staff' },
    { id: 'mage', hp: 100, atk: 90, type: 'staff' },
    { id: 'rogue', hp: 130, atk: 60, type: 'bow' },
    { id: 'cleric', hp: 160, atk: 35, type: 'staff' },
    { id: 'berserker', hp: 250, atk: 70, type: 'bow' },
    { id: 'archer', hp: 110, atk: 55, type: 'bow' },
    { id: 'paladin', hp: 300, atk: 40, type: 'staff' },
    { id: 'necro', hp: 120, atk: 60, type: 'staff' }
];

let g = {
    active: false, diff: 1, lastGenX: 0,
    player: { x: 100, y: 300, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, coin: 0, lvl: 1, exp: 0, nextExp: 100, dir: 1, type: 'bow', canAtk: true, canDash: true, isDashing: false, combo: 0, berserkActive: false },
    keys: {}, platforms: [], entities: [], projectiles: [], selected: null,
    dashCooldownTimer: null, berserkTimer: null, comboResetTimer: null
};

// --- CONTROLS ---
window.addEventListener('keydown', e => {
    g.keys[e.code] = true;
    if (e.code === 'KeyB') toggleShop();
    if (e.code === 'KeyC') toggleStats();
    if (e.code === 'ShiftLeft' && g.player.canDash && g.player.ground && !g.player.isDashing) {
        dash();
    }
});
window.addEventListener('keyup', e => g.keys[e.code] = false);
window.addEventListener('mousedown', e => { if (e.button === 0) shoot(); });

// --- UI TOGGLES ---
function toggleShop() {
    const s = document.getElementById('gui-shop');
    s.style.display = s.style.display === 'none' ? 'flex' : 'none';
    g.active = s.style.display === 'none';
    if (g.active) loop();
}

function toggleStats() {
    alert(`LEVEL: ${g.player.lvl}\nATK: ${g.player.atk}\nHP: ${Math.floor(g.player.hp)}/${g.player.maxH}`);
}

// --- GAME INITIALIZATION ---
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
            document.getElementById('class-details').innerHTML = `<strong>${c.id.toUpperCase()}</strong><br>Vũ khí: ${c.type === 'bow' ? 'Cung' : 'Trượng'}`;
            document.getElementById('start-btn').disabled = false;
        };
        grid.appendChild(item);
    });
}

function initGame() {
    const p = g.player;
    const s = g.selected;
    p.hp = p.maxH = s.hp;
    p.atk = s.atk;
    p.type = s.type;
    document.getElementById('player-sprite').style.backgroundImage = `url('assets/thumbs/${s.id}.png')`;
    document.getElementById('weapon-visual').className = s.type === 'bow' ? 'weapon-bow' : 'weapon-staff';
    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    createPlatform(0, 0, 2000, 50);
    g.lastGenX = 2000;
    g.active = true;
    loop();
}

// --- GAME CORE LOOP ---
function loop() {
    if (!g.active) return;
    updatePlayer();
    updateProjectiles();
    updateEntities();
    generateMap();
    requestAnimationFrame(loop);
}

// --- PLAYER ACTIONS ---
function dash() {
    const p = g.player;
    p.canDash = false;
    p.isDashing = true;
    p.vx = p.dir * 30; // Tốc độ dash
    // Tạo bóng mờ
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const clone = document.createElement('div');
            clone.className = 'dash-clone';
            clone.style.backgroundImage = document.getElementById('player-sprite').style.backgroundImage;
            clone.style.left = p.x + 'px';
            clone.style.bottom = p.y + 'px';
            clone.style.transform = `scaleX(${p.dir})`;
            document.getElementById('player-container').appendChild(clone);
            setTimeout(() => clone.remove(), 200);
        }, i * 50);
    }

    // Thời gian dash ngắn
    setTimeout(() => { p.isDashing = false; }, 150);

    // Cooldown cho dash
    document.getElementById('dash-cooldown').style.display = 'block';
    let cd = 2;
    document.getElementById('dash-cd-val').innerText = cd + 's';
    g.dashCooldownTimer = setInterval(() => {
        cd--;
        document.getElementById('dash-cd-val').innerText = cd + 's';
        if (cd <= 0) {
            clearInterval(g.dashCooldownTimer);
            p.canDash = true;
            document.getElementById('dash-cooldown').style.display = 'none';
        }
    }, 1000);
}


function shoot() {
    if (!g.active || !g.player.canAtk) return;
    g.player.canAtk = false;

    const p = g.player;
    const el = document.createElement('div');
    let projectileType = p.type === 'bow' ? 'arrow' : 'magic-orb';
    let projectileColor = p.type === 'bow' ? 'gold' : 'neon'; // Màu mặc định cho particle
    let atkMultiplier = 1;
    let shootDelay = 350;

    if (p.berserkActive) {
        projectileType = p.type === 'bow' ? 'berserk-arrow' : 'berserk-orb';
        projectileColor = 'berserk'; // Đỏ rực
        atkMultiplier = 1.5; // Tăng sát thương
        shootDelay = 150; // Tăng tốc độ bắn
    }

    el.className = `projectile ${projectileType}`;
    document.getElementById('projectile-layer').appendChild(el);

    g.projectiles.push({
        x: p.x + (p.dir === 1 ? 50 : -20),
        y: p.y + 25,
        vx: p.dir * 18,
        el: el,
        atk: p.atk * atkMultiplier,
        active: true,
        color: projectileColor // Lưu màu particle
    });

    setTimeout(() => g.player.canAtk = true, shootDelay);
}


// --- UPDATE GAME STATE ---
function updatePlayer() {
    const p = g.player;
    if (g.keys['KeyA'] && !p.isDashing) { p.vx = -8; p.dir = -1; }
    else if (g.keys['KeyD'] && !p.isDashing) { p.vx = 8; p.dir = 1; }
    else if (!p.isDashing) p.vx *= 0.85;

    if (g.keys['Space'] && p.ground) { p.vy = 20; p.ground = false; }
    p.vy -= 0.9;
    p.x += p.vx;
    p.y += p.vy;

    // Rơi vực tức thì
    if (p.y < -200) die();

    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 40 > plat.x && p.x < plat.x + plat.w) {
            if (p.vy <= 0 && p.y >= plat.y + plat.h - 15 && p.y <= plat.y + plat.h + 5) {
                p.y = plat.y + plat.h;
                p.vy = 0;
                p.ground = true;
            }
        }
    });

    // Cập nhật UI
    const camX = -p.x + window.innerWidth / 2;
    document.getElementById('world').style.transform = `translateX(${camX}px)`;
    document.getElementById('player-container').style.left = p.x + 'px';
    document.getElementById('player-container').style.bottom = p.y + 'px';
    document.getElementById('player-container').style.transform = `scaleX(${p.dir})`;
    document.getElementById('dist-val').innerText = Math.floor(p.x / 10);
    document.getElementById('hp-fill-main').style.width = (p.hp / p.maxH * 100) + '%';
    if (p.hp <= 0) die();

    // Reset combo nếu không bắn trúng trong 1 giây
    clearTimeout(g.comboResetTimer);
    g.comboResetTimer = setTimeout(() => {
        if (p.combo > 0) {
            p.combo = 0;
            document.getElementById('combo-meter').style.display = 'none';
            if (p.berserkActive) disableBerserk();
        }
    }, 1000);
}


function updateProjectiles() {
    g.projectiles.forEach((pj, idx) => {
        if (!pj.active) return;
        pj.x += pj.vx;
        pj.el.style.left = pj.x + 'px';
        pj.el.style.bottom = pj.y + 'px';

        g.entities.forEach(en => {
            if (en.active && Math.abs(pj.x - en.x) < 40 && Math.abs(pj.y - en.y) < 60) {
                en.hp -= pj.atk;
                pj.active = false;
                pj.el.remove();
                createParticles(pj.x, pj.y, 10, pj.color); // Tạo hạt khi trúng đòn

                g.player.combo++;
                updateComboUI();
                if (g.player.combo >= 10 && !g.player.berserkActive) {
                    activateBerserk();
                }

                if (en.hp <= 0) {
                    en.active = false;
                    en.el.remove();
                    g.player.coin += en.isBoss ? 200 : 50;
                    g.player.exp += en.isBoss ? 250 : 60;
                    createParticles(en.x, en.y, en.isBoss ? 50 : 20, en.isBoss ? 'berserk' : 'green'); // Nổ lớn hơn khi chết
                    if (g.player.exp >= g.player.nextExp) levelUp();
                    updateUI();
                } else {
                    en.el.querySelector('.m-hp-fill').style.width = (en.hp / en.mH * 100) + '%';
                }
            }
        });
        // Xóa đạn bay quá xa
        if (Math.abs(pj.x - g.player.x) > 1000) {
            pj.active = false;
            pj.el.remove();
            g.player.combo = 0; // Combo reset khi bắn trượt/đạn biến mất
            updateComboUI();
            if (g.player.berserkActive) disableBerserk();
        }
    });
    g.projectiles = g.projectiles.filter(pj => pj.active);
}

function updateEntities() {
    g.entities.forEach(en => {
        if (!en.active) return;
        let d = g.player.x - en.x;

        if (en.type === 'normal') {
            if (Math.abs(d) < 600) en.x += Math.sign(d) * 2.2;
            if (Math.abs(d) < 45 && Math.abs(g.player.y - en.y) < 60 && !g.player.isDashing) g.player.hp -= 0.8;
        } else if (en.type === 'sniper') {
            if (Math.abs(d) < 800) {
                if (en.canShoot && Math.abs(g.player.y - en.y) < 100) {
                    shootEnemyProjectile(en.x, en.y + 20, Math.sign(d));
                    en.canShoot = false;
                    setTimeout(() => en.canShoot = true, 2000); // 2 giây cooldown
                }
            }
        } else if (en.type === 'flying') {
            en.y += Math.sin(en.x * 0.05) * 1.5; // Bay lượn sóng
            if (Math.abs(d) < 700) {
                en.x += Math.sign(d) * 1.5;
                if (en.canBomb && Math.abs(g.player.y - en.y) < 300) {
                    dropBomb(en.x, en.y);
                    en.canBomb = false;
                    setTimeout(() => en.canBomb = true, 3000); // 3 giây cooldown
                }
            }
        }

        en.el.style.left = en.x + 'px';
        en.el.style.bottom = en.y + 'px';
    });
}

function createParticles(x, y, count, color) {
    const particleLayer = document.getElementById('particle-layer');
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = `particle ${color}`;
        p.style.left = x + 'px';
        p.style.bottom = y + 'px';
        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 5 + 2;
        p.style.setProperty('--vx', `${Math.cos(angle) * speed}px`);
        p.style.setProperty('--vy', `${Math.sin(angle) * speed}px`);
        particleLayer.appendChild(p);
        p.animate([
            { transform: `translate(-50%, -50%) translate(0,0)`, opacity: 1 },
            { transform: `translate(-50%, -50%) translate(${Math.cos(angle) * speed * 20}px, ${Math.sin(angle) * speed * 20}px)`, opacity: 0 }
        ], {
            duration: 800 + Math.random() * 400,
            easing: 'ease-out',
            fill: 'forwards'
        }).onfinish = () => p.remove();
    }
}


function shootEnemyProjectile(x, y, dir) {
    const el = document.createElement('div');
    el.className = 'projectile enemy-bullet'; // Thêm class cho đạn địch
    document.getElementById('projectile-layer').appendChild(el);
    g.projectiles.push({
        x, y,
        vx: dir * 10,
        el,