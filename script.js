const classes = [
    { id: 'scout', name: 'Trinh Sát', hp: 120, atk: 25, type: 'bow', desc: 'Tốc độ cực nhanh, chuyên gia bắn xa và cơ động.' },
    { id: 'warrior', name: 'Chiến Binh', hp: 180, atk: 35, type: 'bow', desc: 'Dũng sĩ cận vệ với khả năng công thủ toàn diện.' },
    { id: 'tanker', name: 'Đấu Sĩ', hp: 550, atk: 22, type: 'staff', desc: 'Lượng sinh mệnh khổng lồ, là bức tường thép.' },
    { id: 'mage', name: 'Pháp Sư', hp: 100, atk: 98, type: 'staff', desc: 'Sức mạnh phép thuật hủy diệt nhưng sinh mệnh mỏng manh.' },
    { id: 'rogue', name: 'Sát Thủ', hp: 140, atk: 68, type: 'bow', desc: 'Kẻ ám sát trong bóng đêm với những mũi tên chí mạng.' },
    { id: 'cleric', name: 'Tu Sĩ', hp: 170, atk: 38, type: 'staff', desc: 'Người nắm giữ quyền năng năng lượng cổ đại.' },
    { id: 'berserker', name: 'Cuồng Chiến', hp: 260, atk: 78, type: 'bow', desc: 'Càng chiến đấu càng hăng máu, sức mạnh vô song.' },
    { id: 'archer', name: 'Cung Thủ', hp: 115, atk: 62, type: 'bow', desc: 'Bậc thầy cung nghệ với độ chính xác tuyệt đối.' },
    { id: 'paladin', name: 'Hộ Vệ', hp: 320, atk: 48, type: 'staff', desc: 'Được các vị thần bảo hộ, sở hữu trượng năng lượng.' },
    { id: 'necro', name: 'Pháp Sư Tối', hp: 130, atk: 68, type: 'staff', desc: 'Triệu hồi sức mạnh từ vực thẳm đen tối.' }
];

let g = {
    active: false, lastGenX: 0,
    player: { x: 100, y: 300, vx: 0, vy: 0, hp: 100, maxH: 100, atk: 10, coin: 0, lvl: 1, exp: 0, nextExp: 100, dir: 1, type: 'bow', canAtk: true, ground: false, combo: 0, berserk: false },
    keys: {}, platforms: [], entities: [], projectiles: [], selected: null
};

// --- CHỌN NHÂN VẬT ---
function initSelection() {
    const grid = document.getElementById('class-grid');
    const info = document.getElementById('info-content');

    classes.forEach(c => {
        const item = document.createElement('div');
        item.className = 'class-item';
        item.style.backgroundImage = `url('assets/thumbs/${c.id}.png')`;

        item.onmouseenter = () => {
            info.innerHTML = `
                <div style="font-size: 22px; color: var(--neon); font-weight: bold; margin-bottom: 10px;">${c.name}</div>
                <div style="color: #00ff00; margin-bottom: 5px;">MÁU: ${c.hp}</div>
                <div style="color: #ff3e3e; margin-bottom: 5px;">CÔNG: ${c.atk}</div>
                <div style="color: #ffcc00; margin-bottom: 15px;">VŨ KHÍ: ${c.type === 'bow' ? 'Cung Gỗ' : 'Trượng Phép'}</div>
                <div style="font-style: italic; color: #aaa; line-height: 1.5; font-size: 14px;">"${c.desc}"</div>
            `;
        };

        item.onclick = () => {
            document.querySelectorAll('.class-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            g.selected = c;
            document.getElementById('start-btn').disabled = false;
        };
        grid.appendChild(item);
    });
}

function initGame() {
    const p = g.player; const s = g.selected;
    p.hp = p.maxH = s.hp; p.atk = s.atk; p.type = s.type;
    document.getElementById('player-sprite').style.backgroundImage = `url('assets/thumbs/${s.id}.png')`;
    document.getElementById('weapon-visual').className = s.type === 'bow' ? 'weapon-bow' : 'weapon-staff';
    document.getElementById('gui-selection').style.display = 'none';
    document.getElementById('world').style.display = 'block';
    createPlatform(0, 0, 2500, 60); g.lastGenX = 2500;
    g.active = true; loop();
}

// --- CHIẾN ĐẤU & HIỆU ỨNG ---
function shoot() {
    if (!g.active || !g.player.canAtk) return;
    g.player.canAtk = false;
    const p = g.player;
    const el = document.createElement('div');
    const isBerserk = p.berserk;
    el.className = `projectile ${p.type === 'bow' ? 'arrow' : 'magic-orb'}`;
    if (isBerserk) el.style.filter = 'hue-rotate(150deg) brightness(1.5)';

    document.getElementById('projectile-layer').appendChild(el);
    g.projectiles.push({
        x: p.x + (p.dir === 1 ? 50 : -20),
        y: p.y + 25,
        vx: p.dir * (isBerserk ? 25 : 18),
        el: el,
        atk: p.atk * (isBerserk ? 1.5 : 1),
        active: true
    });

    setTimeout(() => g.player.canAtk = true, isBerserk ? 150 : 350);
}

function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = x + 'px'; p.style.bottom = y + 'px';
        p.style.width = p.style.height = Math.random() * 6 + 2 + 'px';
        p.style.background = color;
        document.getElementById('particle-layer').appendChild(p);

        const vx = (Math.random() - 0.5) * 10;
        const vy = (Math.random() - 0.5) * 10;

        p.animate([
            { transform: 'translate(0,0)', opacity: 1 },
            { transform: `translate(${vx * 15}px, ${vy * 15}px)`, opacity: 0 }
        ], { duration: 600, easing: 'ease-out' }).onfinish = () => p.remove();
    }
}

// --- LOGIC CHÍNH ---
function loop() {
    if (!g.active) return;
    updatePlayer();
    updateProjectiles();
    updateEntities();
    generateMap();
    requestAnimationFrame(loop);
}

function updatePlayer() {
    const p = g.player;
    if (g.keys['KeyA']) { p.vx = -8; p.dir = -1; }
    else if (g.keys['KeyD']) { p.vx = 8; p.dir = 1; }
    else p.vx *= 0.85;

    // DASH (Shift)
    if (g.keys['ShiftLeft'] && Math.abs(p.vx) > 1) p.vx *= 1.5;

    if (g.keys['Space'] && p.ground) { p.vy = 21; p.ground = false; }
    p.vy -= 1.0; p.x += p.vx; p.y += p.vy;

    if (p.y < -300) die();

    p.ground = false;
    g.platforms.forEach(plat => {
        if (p.x + 40 > plat.x && p.x < plat.x + plat.w) {
            if (p.vy <= 0 && p.y >= plat.y + plat.h - 15 && p.y <= plat.y + plat.h + 5) {
                p.y = plat.y + plat.h; p.vy = 0; p.ground = true;
            }
        }
    });

    const camX = -p.x + window.innerWidth / 2;
    document.getElementById('world').style.transform = `translateX(${camX}px)`;
    document.getElementById('player-container').style.left = p.x + 'px';
    document.getElementById('player-container').style.bottom = p.y + 'px';
    document.getElementById('player-container').style.transform = `scaleX(${p.dir})`;
    document.getElementById('dist-val').innerText = Math.floor(p.x / 10);
    document.getElementById('hp-fill-main').style.width = (p.hp / p.maxH * 100) + '%';

    if (p.hp <= 0) die();
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
                createParticles(pj.x, pj.y, '#fff');
                pj.active = false; pj.el.remove();

                g.player.combo++;
                updateCombo();

                if (en.hp <= 0) {
                    en.active = false; en.el.remove();
                    createParticles(en.x, en.y, '#f00');
                    g.player.coin += 50; g.player.exp += 50;
                    if (g.player.exp >= g.player.nextExp) levelUp();
                    updateUI();
                } else {
                    en.el.querySelector('.m-hp-fill').style.width = (en.hp / en.mH * 100) + '%';
                }
            }
        });
        if (Math.abs(pj.x - g.player.x) > 1200) { pj.active = false; pj.el.remove(); resetCombo(); }
    });
}

function updateEntities() {
    g.entities.forEach(en => {
        if (!en.active) return;
        let d = g.player.x - en.x;
        if (Math.abs(d) < 600) en.x += Math.sign(d) * (2 + g.player.lvl * 0.2);
        if (Math.abs(d) < 45 && Math.abs(g.player.y - en.y) < 60) {
            g.player.hp -= 1.2;
            resetCombo();
        }
        en.el.style.left = en.x + 'px'; en.el.style.bottom = en.y + 'px';
    });
}

function generateMap() {
    if (g.player.x + 1200 > g.lastGenX) {
        let x = g.lastGenX + 280;
        let w = 500 + Math.random() * 500;
        let y = Math.random() * 250;
        createPlatform(x, y, w, 50);
        if (Math.random() > 0.4) createEntity(x + w / 2, y + 70);
        g.lastGenX = x + w;
    }
}

function createPlatform(x, y, w, h) {
    const el = document.createElement('div'); el.className = 'platform';
    el.style.left = x + 'px'; el.style.bottom = y + 'px';
    el.style.width = w + 'px'; el.style.height = h + 'px';
    document.getElementById('world').appendChild(el);
    g.platforms.push({ x, y, w, h, el });
}

function createEntity(x, y) {
    const el = document.createElement('div'); el.className = 'entity';
    el.style.width = '45px'; el.style.height = '50px'; el.style.position = 'absolute';
    const hp = 80 + (g.player.lvl * 20);
    el.innerHTML = `<div class="monster-sprite" style="width:100%;height:100%;background:#1a5e1a;border:2px solid #000"></div><div class="m-hp-bar"><div class="m-hp-fill"></div></div>`;
    document.getElementById('entity-layer').appendChild(el);
    g.entities.push({ x, y, hp, mH: hp, el, active: true });
}

function updateUI() {
    document.getElementById('ui-lvl').innerText = g.player.lvl;
    document.getElementById('ui-coin').innerText = g.player.coin;
    document.getElementById('exp-fill').style.width = (g.player.exp / g.player.nextExp * 100) + '%';
}

function updateCombo() {
    const c = document.getElementById('combo-meter');
    c.style.display = 'block';
    document.getElementById('combo-val').innerText = g.player.combo;
    if (g.player.combo >= 10) {
        g.player.berserk = true;
        document.getElementById('berserk-mode').style.display = 'block';
    }
}

function resetCombo() {
    g.player.combo = 0;
    g.player.berserk = false;
    document.getElementById('combo-meter').style.display = 'none';
    document.getElementById('berserk-mode').style.display = 'none';
}

function die() { alert("NHIỆM VỤ THẤT BẠI!"); location.reload(); }
function levelUp() { g.player.lvl++; g.player.exp -= g.player.nextExp; g.player.nextExp *= 1.7; g.player.maxH += 60; g.player.hp = g.player.maxH; }

window.addEventListener('keydown', e => g.keys[e.code] = true);
window.addEventListener('keyup', e => g.keys[e.code] = false);
window.addEventListener('mousedown', e => { if (e.button === 0) shoot(); });
window.onload = initSelection;