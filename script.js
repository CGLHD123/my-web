// Thiết lập vị trí ban đầu của nhân vật (giữa khung 500x400)
let posX = 240;
let posY = 190;
const step = 20; // Tốc độ di chuyển mỗi bước

const player = document.getElementById('player');
const gui = document.getElementById('gui-guide');
const consoleOut = document.getElementById('console-output');
const btnToggle = document.getElementById('btn-toggle-theme');

// 1. Hàm đóng/mở GUI hướng dẫn
function toggleGUI() {
    if (gui.style.display === 'none') {
        gui.style.display = 'flex';
    } else {
        gui.style.display = 'none';
    }
}

// 2. Xử lý đổi Theme và hiệu ứng Light Neon cho bóng đèn
btnToggle.addEventListener('click', () => {
    const body = document.body;
    body.classList.toggle('light-theme');

    // Đổi màu ngẫu nhiên cho hiệu ứng Neon khi nhấn nút
    const neonColors = ['#00f2ff', '#ff0055', '#39ff14', '#ffff00', '#ff00de'];
    const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)];

    btnToggle.style.borderColor = randomColor;
    btnToggle.style.boxShadow = `0 0 20px ${randomColor}`;
    btnToggle.style.color = randomColor;
});

// 3. Xử lý di chuyển bằng bàn phím (WASD & Mũi tên)
document.addEventListener('keydown', (e) => {
    // Nếu GUI đang mở thì không cho phép di chuyển nhân vật
    if (gui.style.display !== 'none' && gui.style.display !== '') return;

    const key = e.key.toLowerCase();

    // Di chuyển
    if (key === 'w' || key === 'arrowup') posY -= step;
    if (key === 's' || key === 'arrowdown') posY += step;
    if (key === 'a' || key === 'arrowleft') posX -= step;
    if (key === 'd' || key === 'arrowright') posX += step;

    // Giới hạn va chạm trong khung hầm ngục (500x400)
    // Trừ đi kích thước nhân vật (20px) và padding biên
    posX = Math.max(15, Math.min(465, posX));
    posY = Math.max(15, Math.min(365, posY));

    // Cập nhật vị trí trên giao diện
    player.style.left = posX + 'px';
    player.style.top = posY + 'px';

    // Hiệu ứng phản hồi Console
    updateConsole(posX, posY);
});

// 4. Hàm cập nhật trạng thái hệ thống dựa trên tọa độ
function updateConsole(x, y) {
    if (x > 400 && y > 300) {
        consoleOut.innerText = "Tín hiệu lạ phát hiện ở tọa độ phía Đông Nam...";
        consoleOut.style.color = "yellow";
    } else if (x < 100 && y < 100) {
        consoleOut.innerText = "Khu vực điện từ yếu. Cẩn thận!";
        consoleOut.style.color = "var(--neon-main)";
    } else {
        consoleOut.innerText = "System Stability: 100% | Đang thám hiểm...";
        consoleOut.style.color = "var(--text)";
    }
}

// Khởi tạo vị trí ban đầu khi load trang
player.style.left = posX + 'px';
player.style.top = posY + 'px';