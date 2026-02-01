const player = document.getElementById('player');
const dungeon = document.getElementById('dungeon-frame');
const fog = document.getElementById('fog-overlay');
const goldItem = document.getElementById('gold-item');
const walls = document.querySelectorAll('.wall');

let posX = 60, posY = 60, speed = 5, pSize = 20, goldCount = 0;
const keys = {};
const beep = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFRm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTdvT18AZmZmWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZ');

window.onload = () => {
    const saved = localStorage.getItem('selectedClass');
    if (!saved) document.getElementById('gui-class').style.display = 'flex';
    else applyClassSettings(saved);
    spawnGold();
};

function selectClass(type) {
    localStorage.setItem('selectedClass', type);
    applyClassSettings(type);
    document.getElementById('gui-class').style.display = 'none';
}

function applyClassSettings(type) {
    speed = (type === 'Scout') ? 8 : 3;
    pSize = (type === 'Scout') ? 14 : 28;
    player.style.width = pSize + 'px';
    player.style.height = pSize + 'px';
    document.getElementById('stat-class').innerText = type.toUpperCase();
    document.getElementById('stat-speed').innerText = speed;
}

function spawnGold() {
    goldItem.style.left = (Math.random() * 600 + 50) + 'px';
    goldItem.style.top = (Math.random() * 300 + 50) + 'px';
}

function resetData() { localStorage.removeItem('selectedClass'); location.reload(); }
function toggleHelp(show) { document.getElementById('gui-help').style.display = show ? 'flex' : 'none'; }

document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function gameLoop() {
    const isGuiOpen = document.getElementById('gui-class').style.display === 'flex' ||
        document.getElementById('gui-help').style.display === 'flex';

    if (!isGuiOpen) {
        let nX = posX, nY = posY;
        if (keys['w']) nY -= speed; if (keys['s']) nY += speed;
        if (keys['a']) nX -= speed; if (keys['d']) nX += speed;

        const pR = player.getBoundingClientRect();

        // 1. Va chạm Portal
        const iR = document.getElementById('portal-in').getBoundingClientRect();
        if (!(pR.right < iR.left || pR.left > iR.right || pR.bottom < iR.top || pR.top > iR.bottom)) {
            const outRect = document.getElementById('portal-out').getBoundingClientRect();
            const dRect = dungeon.getBoundingClientRect();
            posX = outRect.left - dRect.left; posY = outRect.top - dRect.top;
        }

        // 2. Va chạm Tường & Ăn Vàng
        const gR = goldItem.getBoundingClientRect();
        if (!(pR.right < gR.left || pR.left > gR.right || pR.bottom < gR.top || pR.top > gR.bottom)) {
            goldCount++; document.getElementById('stat-gold').innerText = goldCount;
            spawnGold(); beep.play().catch(() => { });
        }

        // 3. Giới hạn biên
        posX = Math.max(0, Math.min(dungeon.clientWidth - pSize, nX));
        posY = Math.max(0, Math.min(dungeon.clientHeight - pSize, nY));

        player.style.left = posX + 'px';
        player.style.top = posY + 'px';

        // Cập nhật sương mù theo nhân vật
        fog.style.setProperty('--x', (posX + pSize / 2) + 'px');
        fog.style.setProperty('--y', (posY + pSize / 2) + 'px');
    }
    requestAnimationFrame(gameLoop);
}

document.getElementById('btn-toggle-theme').addEventListener('click', () => document.body.classList.toggle('light-theme'));
gameLoop();