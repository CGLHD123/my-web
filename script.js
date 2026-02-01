const player = document.getElementById('player');
const dungeon = document.getElementById('dungeon-frame');
const fog = document.getElementById('fog-overlay');
const goldItem = document.getElementById('gold-item');
const walls = document.querySelectorAll('.wall');

let posX = 40, posY = 40, speed = 5, pSize = 20, goldCount = 0;
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
    if (type === 'Scout') { speed = 7; pSize = 14; }
    else { speed = 3; pSize = 26; }
    player.style.width = pSize + 'px'; player.style.height = pSize + 'px';
    document.getElementById('stat-class').innerText = type.toUpperCase();
    document.getElementById('stat-speed').innerText = speed;
}

function resetData() { localStorage.removeItem('selectedClass'); location.reload(); }
function toggleHelp(show) { document.getElementById('gui-help').style.display = show ? 'flex' : 'none'; }

function spawnGold() {
    goldItem.style.left = (Math.random() * 500 + 50) + 'px';
    goldItem.style.top = (Math.random() * 300 + 50) + 'px';
}

document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function update() {
    if (document.getElementById('gui-class').style.display === 'none' && document.getElementById('gui-help').style.display === 'none') {
        let nX = posX, nY = posY;
        if (keys['w']) nY -= speed; if (keys['s']) nY += speed;
        if (keys['a']) nX -= speed; if (keys['d']) nX += speed;

        const pR = player.getBoundingClientRect();

        // Va chạm Tường
        let hit = false;
        walls.forEach(wall => {
            const wR = wall.getBoundingClientRect();
            if (!(pR.right < wR.left + 5 || pR.left > wR.right - 5 || pR.bottom < wR.top + 5 || pR.top > wR.bottom - 5)) hit = true;
        });

        // Va chạm Portal
        const iR = document.getElementById('portal-in').getBoundingClientRect();
        if (!(pR.right < iR.left || pR.left > iR.right || pR.bottom < iR.top || pR.top > iR.bottom)) {
            const outRect = document.getElementById('portal-out').getBoundingClientRect();
            const dRect = dungeon.getBoundingClientRect();
            posX = outRect.left - dRect.left; posY = outRect.top - dRect.top;
        }

        // Gold Logic
        const gR = goldItem.getBoundingClientRect();
        if (!(pR.right < gR.left || pR.left > gR.right || pR.bottom < gR.top || pR.top > gR.bottom)) {
            goldCount++;
            document.getElementById('stat-gold').innerText = goldCount;
            spawnGold();
            beep.play().catch(() => { });
        }

        if (!hit) {
            posX = Math.max(5, Math.min(dungeon.clientWidth - pSize - 5, nX));
            posY = Math.max(5, Math.min(dungeon.clientHeight - pSize - 5, nY));
        } else {
            dungeon.classList.add('shake');
            setTimeout(() => dungeon.classList.remove('shake'), 100);
        }

        player.style.left = posX + 'px';
        player.style.top = posY + 'px';
        fog.style.setProperty('--x', (posX + pSize / 2) + 'px');
        fog.style.setProperty('--y', (posY + pSize / 2) + 'px');
    }
    requestAnimationFrame(update);
}
update();
document.getElementById('btn-toggle-theme').addEventListener('click', () => document.body.classList.toggle('light-theme'));