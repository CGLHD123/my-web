const player = document.getElementById('player');
const welcomeGUI = document.getElementById('gui-welcome');
const helpGUI = document.getElementById('gui-help');
const walls = document.querySelectorAll('.wall');

let posX = 30, posY = 30;
const speed = 4;
const keys = {};

document.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

function closeWelcome() { welcomeGUI.style.display = 'none'; }
function toggleHelp(show) { helpGUI.style.display = show ? 'flex' : 'none'; }

function isColliding(pRect, wRect) {
    return !(pRect.right < wRect.left || pRect.left > wRect.right ||
        pRect.bottom < wRect.top || pRect.top > wRect.bottom);
}

function update() {
    if (welcomeGUI.style.display === 'none' && helpGUI.style.display === 'none') {
        let nX = posX, nY = posY;

        if (keys['w'] || keys['arrowup']) nY -= speed;
        if (keys['s'] || keys['arrowdown']) nY += speed;
        if (keys['a'] || keys['arrowleft']) nX -= speed;
        if (keys['d'] || keys['arrowright']) nX += speed;

        // Giới hạn biên & Va chạm
        nX = Math.max(0, Math.min(580, nX));
        nY = Math.max(0, Math.min(380, nY));

        const pRect = { left: nX, top: nY, right: nX + 20, bottom: nY + 20 };
        let hit = false;

        walls.forEach(wall => {
            const wR = wall.getBoundingClientRect();
            const dR = document.getElementById('dungeon-frame').getBoundingClientRect();
            const relW = {
                left: wR.left - dR.left, top: wR.top - dR.top,
                right: wR.right - dR.left, bottom: wR.bottom - dR.top
            };
            if (isColliding(pRect, relW)) hit = true;
        });

        if (!hit) { posX = nX; posY = nY; }
        player.style.left = posX + 'px';
        player.style.top = posY + 'px';
    }
    requestAnimationFrame(update);
}

document.getElementById('btn-toggle-theme').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
});

requestAnimationFrame(update);