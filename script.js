const player = document.getElementById('player');
const gameMap = document.getElementById('game-map');
const gameText = document.getElementById('game-text');
const btnToggle = document.getElementById('btn-toggle-theme');

let posX = 185; // Vị trí X ban đầu
let posY = 185; // Vị trí Y ban đầu
const step = 15; // Tốc độ di chuyển

// 1. Tính năng Đổi Theme & Màu Neon
btnToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const color = document.body.classList.contains('light-theme') ? '#ff00de' : '#00f2ff';
    btnToggle.style.borderColor = color;
    btnToggle.style.boxShadow = `0 0 20px ${color}`;
});

// 2. Cơ chế di chuyển nhân vật
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (key === 'w' || key === 'arrowup') posY -= step;
    if (key === 's' || key === 'arrowdown') posY += step;
    if (key === 'a' || key === 'arrowleft') posX -= step;
    if (key === 'd' || key === 'arrowright') posX += step;

    // Giới hạn nhân vật không đi ra ngoài bản đồ (400px - 30px size)
    posX = Math.max(0, Math.min(370, posX));
    posY = Math.max(0, Math.min(370, posY));

    updatePosition();
});

function updatePosition() {
    player.style.left = posX + 'px';
    player.style.top = posY + 'px';

    // Hiệu ứng văn bản khi di chuyển
    if (posX < 50 && posY < 50) {
        gameText.innerText = "Khu vực bị khóa. Cần thẻ truy cập mức 1.";
    } else if (posX > 300 && posY > 300) {
        gameText.innerText = "Phát hiện tín hiệu thoát ở góc này!";
    }
}