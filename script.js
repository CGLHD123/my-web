let posX = 285, posY = 185;
const player = document.getElementById('player');
const welcomeGUI = document.getElementById('gui-welcome');
const helpGUI = document.getElementById('gui-help');

// Đóng GUI chào mừng
function closeWelcome() {
    welcomeGUI.style.opacity = '0';
    setTimeout(() => { welcomeGUI.style.display = 'none'; }, 300);
}

// Bật/Tắt GUI Help độc lập
function toggleHelp(show) {
    helpGUI.style.display = show ? 'flex' : 'none';
}

// Di chuyển
document.addEventListener('keydown', (e) => {
    // Chỉ di chuyển khi cả 2 GUI đều đóng
    if (welcomeGUI.style.display === 'none' && helpGUI.style.display === 'none') {
        const key = e.key.toLowerCase();
        const step = 20;

        if (key === 'w' || key === 'arrowup') posY -= step;
        if (key === 's' || key === 'arrowdown') posY += step;
        if (key === 'a' || key === 'arrowleft') posX -= step;
        if (key === 'd' || key === 'arrowright') posX += step;

        posX = Math.max(10, Math.min(565, posX));
        posY = Math.max(10, Math.min(365, posY));

        player.style.left = posX + 'px';
        player.style.top = posY + 'px';
    }
});

// Khởi tạo vị trí
player.style.left = posX + 'px';
player.style.top = posY + 'px';