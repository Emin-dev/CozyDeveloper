const GAME_CONFIG = Object.freeze({
    BASE_XP: 10,
    BASE_MONEY: 5,
    STRESS_COST: 12,
    STRESS_HEAL: 30,
    LEVEL_MULT: 1.5,
    TITLES: [
        { name: "Intern", skin: "👶" },
        { name: "Junior", skin: "💻" },
        { name: "Mid-Level", skin: "👨‍💻" },
        { name: "Senior", skin: "🧙‍♂️" },
        { name: "Lead", skin: "🚀" },
        { name: "God Mode", skin: "⚡" }
    ],
    UPGRADES: {
        keyboard: { id: 'kb', name: "Mech Keyboard", baseCost: 50, xpMult: 1.5 },
        chair: { id: 'chair', name: "Ergo Chair", baseCost: 100, stressReduct: 0.8 }
    }
});

class AudioEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    playTone(freq, type = 'sine', duration = 0.1) {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    sfxClick() { this.playTone(600, 'square', 0.05); } 
    sfxRest() { this.playTone(300, 'sine', 0.3); } 
    sfxBuy() { this.playTone(1200, 'triangle', 0.1); this.playTone(1800, 'triangle', 0.1); } 
    sfxCrash() { this.playTone(100, 'sawtooth', 1.0); this.playTone(80, 'sawtooth', 1.0); }
}

class GameState {
    constructor() {
        this.xp = 0;
        this.xpMax = 100;
        this.money = 0;
        this.stress = 0;
        this.level = 1;
        this.isGameOver = false;
        
        this.xpMultiplier = 1;
        this.stressMultiplier = 1;
        this.costs = { kb: 50, chair: 100 };
    }

    code() {
        if (this.isGameOver) return null;
        
        let efficiency = 1.0;
        if (this.stress > 80) efficiency = 0.5; 

        const gainXP = Math.floor(GAME_CONFIG.BASE_XP * this.xpMultiplier * efficiency);
        const gainMoney = Math.floor(GAME_CONFIG.BASE_MONEY * this.xpMultiplier * efficiency);
        const addStress = GAME_CONFIG.STRESS_COST * this.stressMultiplier;

        this.xp += gainXP;
        this.money += gainMoney;
        this.stress += addStress;

        this.checkLevelUp();
        
        if (this.stress >= 100) {
            this.triggerGameOver();
            return { gameOver: true };
        }

        return { xp: gainXP, money: gainMoney, efficiency: efficiency };
    }

    rest() {
        if (this.isGameOver) return false;
        this.stress = Math.max(0, this.stress - GAME_CONFIG.STRESS_HEAL);
        return true;
    }

    buyUpgrade(type) {
        if (this.isGameOver) return false;
        const cost = this.costs[type];
        if (this.money >= cost) {
            this.money -= cost;
            this.costs[type] = Math.floor(this.costs[type] * 1.5); 
            
            if (type === 'kb') this.xpMultiplier += 0.5;
            if (type === 'chair') this.stressMultiplier *= 0.8;
            
            return true;
        }
        return false;
    }

    checkLevelUp() {
        if (this.xp >= this.xpMax) {
            this.level++;
            this.xp = 0;
            this.xpMax = Math.floor(this.xpMax * GAME_CONFIG.LEVEL_MULT);
            this.stress = 0; 
            return true;
        }
        return false;
    }

    triggerGameOver() {
        this.isGameOver = true;
        this.stress = 100;
    }

    reboot() {
        this.isGameOver = false;
        this.level = 1;
        this.xp = 0;
        this.xpMax = 100;
        this.stress = 0;
    }

    getTitle() {
        const idx = Math.min(this.level - 1, GAME_CONFIG.TITLES.length - 1);
        return GAME_CONFIG.TITLES[idx];
    }
}

class UI {
    constructor(audio) {
        this.audio = audio;
        this.els = {
            xpBar: document.getElementById('xp-bar'),
            xpText: document.getElementById('xp-text'),
            stressBar: document.getElementById('stress-bar'),
            stressText: document.getElementById('stress-text'),
            moneyText: document.getElementById('money-text'),
            avatar: document.getElementById('avatar'),
            lvlTitle: document.getElementById('level-display'),
            btnKb: document.getElementById('btn-upgrade-kb'),
            btnChair: document.getElementById('btn-upgrade-chair'),
            costKb: document.getElementById('cost-kb'),
            costChair: document.getElementById('cost-chair'),
            clickZone: document.getElementById('click-zone'),
            gameOverScreen: document.getElementById('game-over-overlay')
        };
    }

    render(state) {
        if (state.isGameOver) {
            this.els.gameOverScreen.style.display = 'flex';
            return;
        }
        this.els.gameOverScreen.style.display = 'none';

        const xpPct = (state.xp / state.xpMax) * 100;
        this.els.xpBar.style.width = `${xpPct}%`;
        this.els.stressBar.style.width = `${state.stress}%`;
        
        if (state.stress > 80) {
            this.els.stressBar.style.background = '#ef4444';
            this.els.avatar.style.animation = 'shake 0.5s infinite';
        } else {
            this.els.stressBar.style.background = '#10b981';
            this.els.avatar.style.animation = 'none';
        }

        const title = state.getTitle();
        this.els.lvlTitle.innerText = `LVL ${state.level} ${title.name}`;
        this.els.xpText.innerText = `${state.xp} / ${state.xpMax}`;
        this.els.stressText.innerText = `${Math.floor(state.stress)}%`;
        this.els.moneyText.innerText = `$${state.money}`;
        this.els.avatar.innerText = title.skin;

        this.els.btnKb.classList.toggle('disabled', state.money < state.costs.kb);
        this.els.btnChair.classList.toggle('disabled', state.money < state.costs.chair);
        this.els.costKb.innerText = `$${state.costs.kb}`;
        this.els.costChair.innerText = `$${state.costs.chair}`;
    }

    spawnFloater(text, color, x, y) {
        const el = document.createElement('div');
        el.className = 'floater';
        el.innerText = text;
        el.style.color = color;
        const randomX = (Math.random() - 0.5) * 40;
        el.style.left = `${x + randomX}px`;
        el.style.top = `${y}px`;
        this.els.clickZone.appendChild(el);
        setTimeout(() => el.remove(), 800);
    }
}

const audio = new AudioEngine();
const state = new GameState();
const ui = new UI(audio);
let locked = false;

function handleCode(e) {
    if (locked) return;
    locked = true; setTimeout(() => locked = false, 50);

    const result = state.code();
    if (result && !result.gameOver) {
        audio.sfxClick();
        const rect = document.getElementById('avatar').getBoundingClientRect();
        
        const xpText = result.efficiency < 1 ? `+${result.xp} XP (⚠️)` : `+${result.xp} XP`;
        const color = result.efficiency < 1 ? '#f87171' : '#3b82f6';
        
        ui.spawnFloater(xpText, color, rect.left + 50, rect.top);
        ui.spawnFloater(`+$${result.money}`, '#f59e0b', rect.left + 80, rect.top + 20);
    } else if (result && result.gameOver) {
        audio.sfxCrash();
    }
    ui.render(state);
}

function handleRest() {
    state.rest();
    audio.sfxRest();
    ui.render(state);
}

function handleBuy(type) {
    if (state.buyUpgrade(type)) {
        audio.sfxBuy();
        ui.spawnFloater("UPGRADED!", '#10b981', window.innerWidth/2 - 50, window.innerHeight/2);
    }
    ui.render(state);
}

function handleReboot() {
    state.reboot();
    ui.render(state);
}

document.getElementById('btn-code').addEventListener('touchstart', (e) => { e.preventDefault(); handleCode(e); });
document.getElementById('btn-code').addEventListener('click', handleCode);
document.getElementById('btn-sleep').addEventListener('click', handleRest);
document.getElementById('btn-upgrade-kb').addEventListener('click', () => handleBuy('kb'));
document.getElementById('btn-upgrade-chair').addEventListener('click', () => handleBuy('chair'));
document.getElementById('btn-sound').addEventListener('click', (e) => {
    const isOn = audio.toggle();
    e.target.innerText = isOn ? "🔊" : "🔇";
});
document.getElementById('btn-reboot').addEventListener('click', handleReboot);

ui.render(state);
