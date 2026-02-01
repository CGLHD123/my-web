const player = document.getElementById('player');
const welcomeGUI = document.getElementById('gui-welcome');
const helpGUI = document.getElementById('gui-help');
const dungeonFrame = document.getElementById('dungeon-frame');
const walls = document.querySelectorAll('.wall');

let posX = 30, posY = 30;
const speed = 5;
const keys = {};

document.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

function closeWelcome() { welcomeGUI.style.display = 'none'; }
function toggleHelp(show) { helpGUI.style.display = show ? 'flex' : 'none'; }

function isColliding(pRect, wRect) {
    return !(pRect.right < wRect.left || pRect.left > wRect.right ||
        pRect.bottom < wRect.top || pRect.top > wRect.bottom);
}

function triggerShake() {
    dungeonFrame.classList.add('shake');
    setTimeout(() => dungeonFrame.classList.remove('shake'), 200);
}

function update() {
    if (welcomeGUI.style.display === 'none' && helpGUI.style.display === 'none') {
        let nX = posX, nY = posY;
        let moving = false;

        if (keys['w'] || keys['arrowup']) { nY -= speed; moving = true; }
        if (keys['s'] || keys['arrowdown']) { nY += speed; moving = true; }
        if (keys['a'] || keys['arrowleft']) { nX -= speed; moving = true; }
        if (keys['d'] || keys['arrowright']) { nX += speed; moving = true; }

        nX = Math.max(5, Math.min(573, nX));
        nY = Math.max(5, Math.min(373, nY));

        const pRect = { left: nX, top: nY, right: nX + 22, bottom: nY + 22 };
        let hit = false;

        walls.forEach(wall => {
            const wR = wall.getBoundingClientRect();
            const dR = dungeonFrame.getBoundingClientRect();
            const relW = {
                left: wR.left - dR.left, top: wR.top - dR.top,
                right: wR.right - dR.left, bottom: wR.bottom - dR.top
            };
            if (isColliding(pRect, relW)) hit = true;
        });

        if (!hit) {
            posX = nX; posY = nY;
        } else if (moving) {
            triggerShake(); // Rung khi cố tình đi xuyên tường
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