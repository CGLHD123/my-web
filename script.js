:root {
    --bg - dark: #050505;
    --neon - blue: #00f2ff;
    --neon - pink: #ff00de;
    --neon - red: #ff3131;
    --glass - bg: rgba(255, 255, 255, 0.05);
}

body.dark - theme {
    background - color: var(--bg - dark);
    color: #fff;
}

body.light - theme {
    background - color: #f0f0f0;
    color: #222;
    --glass - bg: rgba(0, 0, 0, 0.05);
}

/* Nút bóng đèn góc trái */
.theme - fixed - btn {
    position: fixed; top: 20px; left: 20px;
    width: 50px; height: 50px; border - radius: 50 %;
    border: 2px solid var(--neon - blue);
    background: var(--glass - bg); cursor: pointer;
    box - shadow: 0 0 15px var(--neon - blue);
    transition: 0.3s; z - index: 100;
}

/* Container hiệu ứng kính mờ */
.game - container {
    background: var(--glass - bg);
    backdrop - filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 30px; border - radius: 15px;
    text - align: center; width: 90 %; max - width: 500px;
    box - shadow: 0 0 40px rgba(0, 0, 0, 0.5);
}

/* Text Neon rực rỡ */
.neon - title {
    font - size: 2.5rem;
    color: #fff;
    text - shadow: 0 0 10px var(--neon - blue), 0 0 20px var(--neon - blue), 0 0 40px var(--neon - blue);
    margin - bottom: 20px;
}

.neon - text - red { color: var(--neon - red); text - shadow: 0 0 10px var(--neon - red); }
.neon - text - blue { color: var(--neon - blue); text - shadow: 0 0 10px var(--neon - blue); }

/* Nút bấm Neon */
.neon - button {
    padding: 12px 20px; margin: 10px;
    background: transparent; cursor: pointer;
    border - radius: 5px; font - weight: bold;
    transition: 0.3s;
}

.neon - button.blue {
    border: 2px solid var(--neon - blue); color: var(--neon - blue);
    box - shadow: inset 0 0 10px var(--neon - blue), 0 0 10px var(--neon - blue);
}

.neon - button.pink {
    border: 2px solid var(--neon - pink); color: var(--neon - pink);
    box - shadow: inset 0 0 10px var(--neon - pink), 0 0 10px var(--neon - pink);
}

.neon - button:hover {
    transform: scale(1.05);
    background: white; color: black;
}

.stats - bar { margin - bottom: 20px; font - size: 1.2rem; display: flex; justify - content: space - around; }