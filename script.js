let posX = 237, posY = 187;
const step = 15;
const player = document.getElementById('player');
const gui = document.getElementById('gui-guide');
const consoleOut = document.getElementById('console-output');

// Đóng/Mở GUI
function toggleGUI() {
    gui.style.display = (gui.style.display === 'none') ? 'flex' : 'none';
}

// Chuyển đổi Theme
document.getElementById('btn-toggle-theme').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    document.getElementById('bulb-icon').style.filter = isLight ? 'drop-shadow(0 0 10px red)' : 'none';
});

// Điều khiển WASD và Mũi tên
document.addEventListener('keydown', (e) => {
    if (gui.style.display !== 'none') return; // Không di chuyển khi đang mở hướng dẫn

    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') posY -= step;
    if (key === 's' || key === 'arrowdown') posY += step;
    if (key === 'a' || key === 'arrowleft') posX -= step;
    if (key === 'd' || key === 'arrowright') posX += step;

    // Giới hạn trong hầm ngục (500x400)
    posX = Math.max(10, Math.min(465, posX));
    posY = Math.max(10, Math.min(365, posY));

    player.style.left = posX + 'px';
    player.style.top = posY + 'px';

    // Cập nhật console dựa trên vị trí
    if (posX > 400) consoleOut.innerText = "Cảnh báo: Áp lực tăng cao ở biên giới phía Đông.";
    else consoleOut.innerText = "Tín hiệu ổn định.";
});