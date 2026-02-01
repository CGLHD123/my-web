const player = document.getElementById('player');
const dungeon = document.getElementById('dungeon-frame');
const fog = document.getElementById('fog-overlay');
const goldItem = document.getElementById('gold-item');
const portalIn = document.getElementById('portal-in');
const portalOut = document.getElementById('portal-out');

let posX = 100, posY = 100, speed = 5, pSize = 20, goldCount = 0;
const keys = {};
const beep = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFRm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTdvT18AZmZmWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZ');

window.onload = () => {
    const savedClass = localStorage.getItem('selectedClass');
    if (!savedClass) document.getElementById('gui-class').style.display = 'flex';
    else applyClassSettings(savedClass);
    spawnGold();
};

function selectClass(type) {
    localStorage.setItem('selectedClass', type);
    applyClassSettings(type);
    document.getElementById('gui-class').style.display = 'none';
}

function applyClassSettings(type) {
    if (type === 'Scout') { speed = 8; pSize = 14; }
    else { speed = 3; pSize = 26; }
    player.style.width = pSize + 'px'; player.style.height = pSize + 'px';
    document.getElementById('stat-class').innerText = type.toUpperCase();
    document.getElementById('stat-speed').innerText = speed;
}

function resetData() { localStorage.removeItem('selectedClass'); location.reload(); }
function toggleHelp(show) { document.getElementById('gui-help').style.display = show ? 'flex' : 'none'; }
function spawnGold() {
    goldItem.style.left = Math.random() * 700 + 'px';
    goldItem.style.top = Math.random() * 400 + 'px';
}

document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function update() {
    if (document.getElementById('gui-class').style.display === 'none') {
        let nX = posX, nY = posY;
        if (keys['w']) nY -= speed; if (keys['s']) nY += speed;
        if (keys['a']) nX -= speed; if (keys['d']) nX += speed;

        // Va chạm Portal
        const pR = player.getBoundingClientRect();
        const iR = portalIn.getBoundingClientRect();
        if (!(pR.right < iR.left || pR.left > iR.right || pR.bottom < iR.top || pR.top > iR.bottom)) {
            const outRect = portalOut.getBoundingClientRect();
            const dRect = dungeon.getBoundingClientRect();
            posX = outRect.left - dRect.left; posY = outRect.top - dRect.top;
        }

        // Ăn vàng
        const gR = goldItem.getBoundingClientRect();
        if (!(pR.right < gR.left || pR.left > gR.right || pR.bottom < gR.top || pR.top > gR.bottom)) {
            goldCount++;
            document.getElementById('stat-gold').innerText = goldCount;
            spawnGold();
            beep.play().catch(() => { });
        }

        // Biên giới hạn (Đơn giản hóa cho đa khối)
        posX = Math.max(0, Math.min(dungeon.clientWidth - pSize, nX));
        posY = Math.max(0, Math.min(dungeon.clientHeight - pSize, nY));

        player.style.left = posX + 'px';
        player.style.top = posY + 'px';
        fog.style.setProperty('--x', (posX + pSize / 2) + 'px');
        fog.style.setProperty('--y', (posY + pSize / 2) + 'px');
    }
    requestAnimationFrame(update);
}
document.getElementById('btn-toggle-theme').addEventListener('click', () => document.body.classList.toggle('light-theme'));
update();