const classes = [
    { id: 'scout', name: 'SCOUT', hp: 100, atk: 15, range: 80 },
    { id: 'warrior', name: 'WARRIOR', hp: 150, atk: 25, range: 90 },
    { id: 'tanker', name: 'TANKER', hp: 300, atk: 10, range: 70 },
    { id: 'mage', name: 'MAGE', hp: 80, atk: 50, range: 180 },
    { id: 'rogue', name: 'ROGUE', hp: 100, atk: 35, range: 60 },
    { id: 'cleric', name: 'CLERIC', hp: 120, atk: 20, range: 75 },
    { id: 'berserker', name: 'BERSERKER', hp: 170, atk: 40, range: 85 },
    { id: 'archer', name: 'ARCHER', hp: 90, atk: 30, range: 250 },
    { id: 'paladin', name: 'PALADIN', hp: 200, atk: 22, range: 90 },
    { id: 'necro', name: 'NECRO', hp: 90, atk: 35, range: 140 }
];

let g = {
    active: false,
    player: { x: 100, y: 100, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, coin: 0, ground: false, dir: 1, range: 80, canAtk: true },
    keys: {}, platforms: [], entities: [], particles: [], lastGenX: 0,
    selected: null
};

// --- HÀM KHỞI TẠO LẠI TOÀN BỘ SỰ KIỆN CHỌN ---
function initSelection() {
    const grid = document.getElementById('class-grid');
    grid.innerHTML = '';

    classes.forEach(c => {
        const item = document.createElement('div');
        item.className = 'class-item';
        // Tải ảnh làm cover cho ô chọn
        item.style.backgroundImage = `url('assets/thumbs/${c.id}.png')`;

        // Gán sự kiện click trực tiếp
        item.onclick = (e) => {
            e.stopPropagation();
            // Reset trạng thái chọn
            document.querySelectorAll('.class-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');

            // Lưu dữ liệu class đã chọn
            g.selected = c;

            // Cập nhật UI thông tin
            document.getElementById('class-details').innerHTML = `
                <h2 style="color:var(--neon)">${c.name}</h2>
                <p>HP: ${c.hp}</p>
                <p>ATK: ${c.atk}</p>
                <p>RANGE: ${c.range}px</p>
            `;

            // Mở nút Start
            document.getElementById('start-btn').disabled = false;
        };
        grid.appendChild(item);
    });
}

// --- VÀO HẦM NGỤC ---
function initGame() {
    if (!g.selected) return;

    // Gán chỉ số nhân vật
    const p = g.player;
    const s = g.selected;
    p.hp = p.maxH = s.hp;
    p.atk = s.atk;
    p.range = s.range;

    // Đổi nhân vật thành ảnh Class đã chọn
    const sprite = document.getElementById('player-sprite');
    sprite.style.backgroundImage = `url('assets/thumbs/${s.id}.png')`;

    // Chuyển cảnh
    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';

    // Tạo địa hình đầu tiên
    createPlatform(0, 0, 2000, 40);
    g.lastGenX = 2000;

    g.active = true;
    requestAnimationFrame(loop);
}

function createPlatform(x, y, w, h) {
    const el = document.createElement('div');
    el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px';
    el.style.width = w + 'px'; el.style.height = h + 'px';
    document.getElementById('world').appendChild(el);
    g.platforms.push({ x, y, w, h, el });
}

function generateMap() {
    if (g.player.x + 1000 > g.lastGenX) {
        let w = 400 + Math.random() * 300;
        let x = g.lastGenX + 150 + Math.random() * 150;
        let y = 100 + Math.random() * 200;
        createPlatform(x, y, w, 20);
        if (Math.random() > 0.4) createEntity(x + w / 2, y + 40);
        g.lastGenX = x + w;
    }
}

function createEntity(x, y) {
    const el = document.createElement('div');
    el.className = 'goblin';
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
    if (g.keys['KeyA']) { p.vx = -7; p.dir = -1; }
    else if (g.keys['KeyD']) { p.vx = 7; p.dir = 1; }
    else p.vx *= 0.85;

    if (g.keys['Space'] && p.ground) { p.vy = 22; p.ground = false; }
    p.vy -= 1.2; p.x += p.vx; p.y += p.vy;

    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 45 > plat.x && p.x < plat.x + plat.w) {
            if (p.vy <= 0 && p.y >= plat.y + plat.h - 15 && p.y <= plat.y + plat.h + 5) {
                p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
            }
        }
    });

    const c = document.getElementById('player-container');
    c.style.left = p.x + 'px'; c.style.bottom = p.y + 'px';
    c.style.transform = `scaleX(${p.dir})`;
    document.getElementById('world').style.transform = `translateX(${-p.x + window.innerWidth / 2}px)`;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxH * 100) + '%';
    if (p.hp <= 0) location.reload();
}

function updateEntities() {
    g.entities.forEach(en => {
        if (!en.active) return;
        let d = g.player.x - en.x;
        if (Math.abs(d) < 500) en.x += Math.sign(d) * 2;
        if (Math.abs(d) < 40 && Math.abs(g.player.y - en.y) < 50) g.player.hp -= 0.5;
        en.el.style.left = en.x + 'px'; en.el.style.bottom = en.y + 'px';
    });
}

function createParticle(x, y) {
    for (let i = 0; i < 5; i++) {
        const el = document.createElement('div'); el.className = 'particle';
        el.style.backgroundColor = '#f00'; document.getElementById('particle-layer').appendChild(el);
        g.particles.push({ el, x, y, vx: (Math.random() - 0.5) * 10, vy: Math.random() * 10, life: 1 });
    }
}

function updateParticles() {
    for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i]; p.x += p.vx; p.y += p.vy; p.vy -= 0.5; p.life -= 0.05;
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
            createParticle(en.x, en.y + 20);
            if (en.hp <= 0) { en.active = false; en.el.remove(); g.player.coin += 20; document.getElementById('ui-coin').innerText = g.player.coin; }
            else en.el.querySelector('.m-hp-i').style.width = (en.hp / en.mH * 100) + '%';
        }
    });
    setTimeout(() => { document.getElementById('weapon-visual').classList.remove('swing'); g.player.canAtk = true; }, 200);
}

window.onkeydown = e => g.keys[e.code] = true;
window.onkeyup = e => g.keys[e.code] = false;
window.onmousedown = e => { if (e.button === 0) attack(); };

// Chạy khởi tạo ngay khi load
window.onload = initSelection;