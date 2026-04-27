const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

const TOTAL = 8, W = 220, H = 260;
const CORRECT = Math.floor(Math.random() * TOTAL);
let keys = [], audioWin = null, menuWin = null, loadCount = 0, started = false, shuffleActive = false, done = false, audioReady = false;
let speedMultiplier = 1.0;

function getPositions() {
    const a = screen.getPrimaryDisplay().workAreaSize;
    const cx = a.width / 2, cy = a.height / 2;
    const pos = [];
    for (let i = 0; i < TOTAL; i++) {
        const ang = (i / TOTAL) * Math.PI * 2 - Math.PI / 2;
        pos.push({
            x: Math.round(cx + Math.cos(ang) * 320 - W / 2),
            y: Math.round(cy + Math.sin(ang) * 260 - H / 2)
        });
    }
    return pos;
}

app.whenReady().then(() => {
    menuWin = new BrowserWindow({
        width: 900, height: 600,
        resizable: false,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    menuWin.setMenu(null);
    menuWin.loadFile('menu.html');
});

ipcMain.on('start-game', (e, diff) => {
    if (diff === 'easy') speedMultiplier = 1.2;
    else if (diff === 'normal') speedMultiplier = 1.0;
    else if (diff === 'dificil') speedMultiplier = 0.85;
    else if (diff === 'easy_demon') speedMultiplier = 0.7;
    else if (diff === 'extreme_demon') speedMultiplier = 0.55;
    else if (diff === 'secret_67') speedMultiplier = 0.15;
    else if (diff === 'secret_666') speedMultiplier = 0.40;
    else if (diff === 'secret_123') speedMultiplier = 10000;

    if (menuWin) {
        menuWin.hide(); // Hide to prevent visual glitch, closed later
    }
    startGameWindows();
});

function startGameWindows() {
    const positions = getPositions();

    // Janela escondida so pro audio (com icone)
    audioWin = new BrowserWindow({
        show: false,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    audioWin.loadFile('audio.html');

    // 8 janelas de chave (escondidas ate carregar)
    for (let i = 0; i < TOTAL; i++) {
        const idx = i;
        const w = new BrowserWindow({
            width: W, height: H,
            x: positions[i].x, y: positions[i].y,
            resizable: false, minimizable: false, maximizable: false,
            alwaysOnTop: true, show: false,
            icon: path.join(__dirname, 'icon.ico'), // Ícone aqui para a barra de tarefas
            webPreferences: { nodeIntegration: true, contextIsolation: false }
        });
        w.setMenu(null);
        w.loadFile('key.html');
        w.webContents.on('did-finish-load', () => {
            w.webContents.send('init', {
                id: idx,
                image: idx === CORRECT ? 'images/green-key.png' : 'images/key.png'
            });
            loadCount++;
            tryStart();
        });
        keys.push({ win: w, id: i, x: positions[i].x, y: positions[i].y, busy: false });
    }
}

// Audio avisa que ta pronto no ponto certo
ipcMain.on('audio-ready', () => { audioReady = true; tryStart(); });

function tryStart() {
    if (started) return;
    if (loadCount < TOTAL || !audioReady) return;
    started = true;
    if (menuWin) {
        menuWin.close();
        menuWin = null;
    }
    // Mostra tudo e toca
    keys.forEach(k => k.win.show());
    audioWin.webContents.send('play-now');
    // 3s preview -> shuffle
    setTimeout(startShuffle, 3000);
}

function startShuffle() {
    keys.forEach(k => { k.win.webContents.send('change-img', 'images/key.png'); k.busy = false; });
    shuffleActive = true;
    
    // Se não for o modo super fácil, faz o shuffle
    if (speedMultiplier < 1000) {
        scheduleSwap();
    }
    
    for (let i = 0; i < 6; i++) {
        setTimeout(() => { if (shuffleActive) keys.forEach(k => k.win.webContents.send('flash')); }, 1000 + Math.random() * 8000);
    }
    setTimeout(stopShuffle, 10000);
}

function scheduleSwap() {
    if (!shuffleActive) return;
    const free = keys.filter(k => !k.busy);
    if (free.length >= 2) {
        for (let i = free.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [free[i], free[j]] = [free[j], free[i]];
        }
        free[0].busy = true; free[1].busy = true;
        const dur = (350 + Math.random() * 150) * speedMultiplier;
        doSwap(free[0], free[1], dur, () => {
            free[0].busy = false; free[1].busy = false;
        });
    }
    const delay = (200 + Math.random() * 200) * speedMultiplier;
    setTimeout(scheduleSwap, delay);
}

function doSwap(a, b, dur, cb) {
    const ax = a.x, ay = a.y, bx = b.x, by = b.y;
    const dx = bx - ax, dy = by - ay, arc = 0.35;
    const caX = (ax + bx) / 2 - dy * arc, caY = (ay + by) / 2 + dx * arc;
    const cbX = (ax + bx) / 2 + dy * arc, cbY = (ay + by) / 2 - dx * arc;
    const t0 = Date.now();
    function tick() {
        const el = Date.now() - t0;
        let t = Math.min(1, el / dur);
        t = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const u = 1 - t;
        a.x = u * u * ax + 2 * u * t * caX + t * t * bx;
        a.y = u * u * ay + 2 * u * t * caY + t * t * by;
        b.x = u * u * bx + 2 * u * t * cbX + t * t * ax;
        b.y = u * u * by + 2 * u * t * cbY + t * t * ay;
        try { a.win.setPosition(Math.round(a.x), Math.round(a.y)); } catch (e) { }
        try { b.win.setPosition(Math.round(b.x), Math.round(b.y)); } catch (e) { }
        if (el < dur) setTimeout(tick, 16); else if (cb) cb();
    }
    tick();
}

function stopShuffle() {
    shuffleActive = false;
    
    function checkFinished() {
        if (keys.some(k => k.busy)) {
            setTimeout(checkFinished, 50);
            return;
        }
        
        const imgs = [1, 2, 3, 4, 5, 6, 7, 8];
        for (let i = imgs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
        }

        keys.forEach((k, i) => {
            k.win.setPosition(Math.round(k.x), Math.round(k.y));
            k.win.webContents.send('change-img', 'images/key' + imgs[i] + '.png');
            k.win.webContents.send('clickable');
        });
        setTimeout(() => { if (!done) app.quit(); }, 6000);
    }
    checkFinished();
}

ipcMain.on('clicked', (e, id) => {
    if (done) return; done = true;
    const won = id === CORRECT;
    keys.forEach(k => { try { k.win.webContents.send('result', won); } catch (e) { } });
    audioWin.webContents.send('stop-music');
    setTimeout(() => app.quit(), 2500);
});

app.on('window-all-closed', () => app.quit());