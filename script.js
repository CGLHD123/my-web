document.addEventListener('DOMContentLoaded', () => {
    const gameText = document.getElementById('game-text');
    const btnExplore = document.getElementById('btn-explore');
    const btnToggleTheme = document.getElementById('btn-toggle-theme');
    const statusMessage = document.getElementById('status-message');
    let isExploring = false;

    // Kiểm tra theme đã lưu trong localStorage
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }

    // Chức năng đổi Sáng/Tối
    btnToggleTheme.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        // Lưu lựa chọn theme vào localStorage
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // Chức năng khám phá
    btnExplore.addEventListener('click', () => {
        if (!isExploring) {
            gameText.textContent = "Bạn cẩn thận bước vào sâu hơn trong hầm ngục. Một luồng gió lạnh buốt lướt qua, mang theo tiếng rít nhẹ. Điều gì đang chờ đợi bạn?";
            btnExplore.textContent = "Tiến sâu hơn nữa";
            statusMessage.textContent = "Bạn cảm thấy một sự tò mò pha lẫn chút sợ hãi.";
            isExploring = true;
        } else {
            // Đây là nơi bạn có thể mở rộng game với nhiều lựa chọn và kịch bản khác nhau
            const randomEvent = Math.random();
            if (randomEvent < 0.4) {
                gameText.textContent = "Bạn tìm thấy một đồng xu cổ dưới đất. Không có gì nhiều nhặn, nhưng ít nhất không phải là quái vật.";
                statusMessage.textContent = "Bạn nhặt được đồng xu. Cảm thấy an toàn hơn một chút.";
            } else if (randomEvent < 0.8) {
                gameText.textContent = "Một lối đi nhỏ rẽ sang bên phải, tối tăm và có vẻ nguy hiểm. Bạn có nên đi vào không?";
                statusMessage.textContent = "Quyết định khó khăn đang chờ đợi.";
            } else {
                gameText.textContent = "Bỗng nhiên, một tiếng gầm vang lên từ phía trước! Bạn có vẻ đã đánh thức thứ gì đó.";
                statusMessage.textContent = "Nguy hiểm! Cẩn thận!";
            }
        }
    });
});