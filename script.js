const player = document.getElementById('player');
const dungeon = document.getElementById('dungeon-frame');
const guiClass = document.getElementById('gui-class');
const guiHelp = document.getElementById('gui-help');
const walls = document.querySelectorAll('.wall');

let posX = 50, posY = 50;
let speed = 5, pSize = 20;
const keys = {};

// Âm thanh Bíp kỹ thuật số
const beep = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFRm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTdvT18AZmZmWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZ');

document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function selectClass(type) {
    if (type === 'Scout') { speed = 8; pSize = 14; }
    else { speed = 3; pSize = 30; }
    player.style.width = pSize + 'px';
    player.style.height = pSize + 'px';
    guiClass.style.display = 'none';
}

function toggleHelp(show) { guiHelp.style.display = show ? 'flex' : 'none'; }

function update() {
    if (guiClass.style.display === 'none' && guiHelp.style.display === 'none') {
        let nX = posX, nY = posY;
        let moving = false;

        if (keys['w'] || keys['arrowup']) { nY -= speed; moving = true; }
        if (keys['s'] || keys['arrowdown']) { nY += speed; moving = true; }
        if (keys['a'] || keys['arrowleft']) { nX -= speed; moving = true; }
        if (keys['d'] || keys['arrowright']) { nX += speed; moving = true; }

        nX = Math.max(10, Math.min(dungeon.clientWidth - pSize - 10, nX));
        nY = Math.max(10, Math.min(dungeon.clientHeight - pSize - 10, nY));

        const pR = { left: nX, top: nY, right: nX + pSize, bottom: nY + pSize };
        let hit = false;

        walls.forEach(wall => {
            const wR = wall.getBoundingClientRect();
            const dR = dungeon.getBoundingClientRect();
            const relW = {
                left: wR.left - dR.left, top: wR.top - dR.top,
                right: wR.right - dR.left, bottom: wR.bottom - dR.top
            };
            if (!(pR.right < relW.left || pR.left > relW.right || pR.bottom < relW.top || pR.top > relW.bottom)) hit = true;
        });

        if (!hit) {
            posX = nX; posY = nY;
        } else if (moving) {
            dungeon.classList.add('shake');
            beep.play().catch(() => { });
            setTimeout(() => dungeon.classList.remove('shake'), 150);
        }

        player.style.left = posX + 'px';
        player.style.top = posY + 'px';
    }
    requestAnimationFrame(update);
}

document.getElementById('btn-toggle-theme').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
});

requestAnimationFrame(update);