const btnToggle = document.getElementById('btn-toggle-theme');
const bulbIcon = document.getElementById('bulb-icon');
const body = document.body;

// Mảng màu sắc neon cho bóng đèn
const neonColors = ['#00fff2', '#ff00ff', '#ffff00', '#00ff00', '#ff4d4d'];

btnToggle.addEventListener('click', () => {
    // 1. Chuyển đổi giữa light và dark theme
    body.classList.toggle('light-theme');

    // 2. Đổi màu icon bóng đèn và viền nút ngẫu nhiên
    const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)];
    btnToggle.style.borderColor = randomColor;
    btnToggle.style.boxShadow = `0 0 20px ${randomColor}`;
    bulbIcon.style.textShadow = `0 0 15px ${randomColor}`;

    // 3. Hiệu ứng rung nhẹ khi nhấn
    btnToggle.style.transform = 'scale(0.9)';
    setTimeout(() => {
        btnToggle.style.transform = 'scale(1)';
    }, 100);
});

// Logic nút khám phá đơn giản
document.getElementById('btn-explore').addEventListener('click', () => {
    document.getElementById('game-text').innerText = "Bạn tiến vào hầm ngục, các tia sáng Neon quét qua hành lang tối...";
});