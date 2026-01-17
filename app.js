const Config = Object.freeze({
    BASE_XP: 10,
    BASE_MONEY: 5,
    STRESS_COST: 12,
    STRESS_HEAL: 30,
    REST_COST: 3,
    STUDY_COST: 75,
    STUDY_DURATION: 120000,
    STUDY_MULT: 0.15,
    LEVEL_MULT: 1.5,
    IDLE_STRESS_REDUCTION: 0.15,
    
    DIFFICULTIES: {
        easy: { id: 'easy', label: 'Easy Mode', xpMult: 2.0, stressMult: 0.5, bugChance: 0.01, powerupDuration: 120, studyDuration: 180 },
        mid: { id: 'mid', label: 'Normal', xpMult: 1.0, stressMult: 1.0, bugChance: 0.03, powerupDuration: 60, studyDuration: 120 },
        hard: { id: 'hard', label: 'Hard Mode', xpMult: 0.7, stressMult: 1.5, bugChance: 0.05, powerupDuration: 20, studyDuration: 60 }
    },
    
    AVATAR_SETS: {
        developer: { 
            id: 'developer', 
            label: 'Developer',
            emojis: ['👶', '🧒', '👦', '👨', '👨‍💻', '👨‍🔧', '🧑‍💼', '👔', '🎩', '👑', '🧙', '🧙‍♂️', '🦸', '🦸‍♂️', '🚀', '⚡', '💎', '🔥', '⭐', '🌟']
        },
        robot: {
            id: 'robot',
            label: 'Robot',
            emojis: ['🤖', '🦾', '🦿', '👾', '🛸', '🔧', '⚙️', '🔩', '⚡', '💡', '🔋', '📡', '🖥️', '💻', '⌨️', '🖱️', '💾', '📟', '🎮', '🕹️']
        },
        animal: {
            id: 'animal',
            label: 'Animal',
            emojis: ['🐣', '🐥', '🐤', '🐦', '🦅', '🦉', '🦆', '🐧', '🦜', '🦚', '🦩', '🐺', '🦁', '🐯', '🐲', '🐉', '🦄', '🐴', '🐎', '🦓']
        },
        space: {
            id: 'space',
            label: 'Space',
            emojis: ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '⭐', '🌟', '✨', '💫', '☄️', '🪐', '🌌', '🌠', '🚀', '🛸', '👽']
        }
    },
    
    BACKGROUNDS: [
        { id: 'dark', colors: ['#0f111a', '#1a1d2e'], label: 'Dark' },
        { id: 'blue', colors: ['#1e3a8a', '#3b82f6'], label: 'Ocean' },
        { id: 'purple', colors: ['#581c87', '#a855f7'], label: 'Cyber' },
        { id: 'green', colors: ['#14532d', '#22c55e'], label: 'Matrix' },
        { id: 'sunset', colors: ['#7c2d12', '#f97316'], label: 'Sunset' }
    ],
    
    POWERUPS: {
        autoStress: { 
            id: 'autoStress', 
            name: 'Auto Rest', 
            icon: '🧘',
            baseCost: 100, 
            desc: 'Slowly reduces burnout',
            effect: 5
        },
        autoClick: { 
            id: 'autoClick', 
            name: 'Auto Code', 
            icon: '🤖',
            baseCost: 150, 
            desc: 'Auto codes every 4s',
            effect: 1000
        },
        xpBoost: { 
            id: 'xpBoost', 
            name: 'XP Boost', 
            icon: '⚡',
            baseCost: 120, 
            desc: '2× XP gains',
            effect: 2
        },
        shield: { 
            id: 'shield', 
            name: 'Stress Shield', 
            icon: '🛡️',
            baseCost: 200, 
            desc: 'No burnout gain',
            effect: 0
        }
    }
});

class EventBus {
    constructor() {
        this.listeners = {};
    }
    
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
}

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            this.enabled = false;
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    playTone(freq, type = 'sine', duration = 0.1) {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }
    
    sfxClick() {
        this.playTone(240, 'sine', 0.12);
        setTimeout(() => this.playTone(480, 'sine', 0.08), 40);
    }
    
    sfxRest() {
        this.playTone(220, 'sine', 0.3);
        this.playTone(330, 'sine', 0.3);
    }
    
    sfxStudy() {
        this.playTone(330, 'sine', 0.15);
        setTimeout(() => this.playTone(440, 'sine', 0.15), 60);
    }
    
    sfxBuy() {
        this.playTone(440, 'sine', 0.15);
        setTimeout(() => this.playTone(660, 'sine', 0.15), 80);
        setTimeout(() => this.playTone(880, 'sine', 0.15), 160);
    }
    
    sfxLevelUp(intensity = 1) {
        this.playTone(523, 'sine', 0.2);
        setTimeout(() => this.playTone(659, 'sine', 0.2), 100);
        setTimeout(() => this.playTone(784, 'sine', 0.3), 200);
        if (intensity > 5) {
            setTimeout(() => this.playTone(1047, 'sine', 0.3), 300);
        }
    }
    
    sfxCrash(intensity = 1) {
        const baseFq = 160 - (intensity * 5);
        this.playTone(baseFq, 'triangle', 0.4);
        setTimeout(() => this.playTone(baseFq - 40, 'triangle', 0.5), 120);
        if (intensity > 5) {
            setTimeout(() => this.playTone(baseFq - 80, 'sawtooth', 0.6), 240);
        }
    }
    
    sfxTask() {
        [440, 554, 659, 880].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sine', 0.12), i * 80);
        });
    }
    
    sfxUIClick() {
        this.playTone(400, 'sine', 0.08);
    }
}

class HapticEngine {
    constructor() {
        this.enabled = true;
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    trigger(type = 'light') {
        if (!this.enabled || !navigator.vibrate) return;
        const patterns = {
            light: [20],
            medium: [40],
            heavy: [60],
            success: [30, 30, 60],
            error: [100, 50, 100, 50, 200]
        };
        try {
            navigator.vibrate(patterns[type] || [30]);
        } catch (e) {}
    }
}

class TaskGenerator {
    constructor() {
        this.baseTargets = {
            money: [500, 1000, 2000],
            level: [3, 5, 10, 15, 20],
            codes: [10, 25, 50, 100, 200]
        };
    }
    
    generateTasks(state) {
        const tasks = [];
        
        const nextMoneyTarget = this.getNextMoneyTarget(state.totalMoneyEarned);
        if (nextMoneyTarget) {
            tasks.push({
                id: `money_${nextMoneyTarget}`,
                desc: `Earn $${nextMoneyTarget} total`,
                check: s => s.totalMoneyEarned >= nextMoneyTarget,
                reward: { money: Math.floor(nextMoneyTarget * 0.2) }
            });
        }
        
        const nextLevelTarget = this.getNextLevelTarget(state.level);
        if (nextLevelTarget) {
            tasks.push({
                id: `level_${nextLevelTarget}`,
                desc: `Reach Level ${nextLevelTarget}`,
                check: s => s.level >= nextLevelTarget,
                reward: { money: nextLevelTarget * 50 }
            });
        }
        
        const nextCodeTarget = this.getNextCodeTarget(state.codeClicks);
        if (nextCodeTarget) {
            tasks.push({
                id: `codes_${nextCodeTarget}`,
                desc: `Code ${nextCodeTarget} times`,
                check: s => s.codeClicks >= nextCodeTarget,
                reward: { money: nextCodeTarget * 2 }
            });
        }
        
        if (state.restCount < 5) {
            tasks.push({
                id: 'rest_5',
                desc: 'Rest 5 times',
                check: s => s.restCount >= 5,
                reward: { money: 50 }
            });
        }
        
        if (state.studyCount < 3) {
            tasks.push({
                id: 'study_3',
                desc: 'Study 3 times',
                check: s => s.studyCount >= 3,
                reward: { money: 100 }
            });
        }
        
        return tasks.slice(0, 3);
    }
    
    getNextMoneyTarget(current) {
        for (let target of this.baseTargets.money) {
            if (current < target) return target;
        }
        const lastTarget = this.baseTargets.money[this.baseTargets.money.length - 1];
        const multiplier = Math.floor(current / lastTarget) + 1;
        return multiplier * 1000;
    }
    
    getNextLevelTarget(current) {
        for (let target of this.baseTargets.level) {
            if (current < target) return target;
        }
        return Math.ceil((current + 5) / 5) * 5;
    }
    
    getNextCodeTarget(current) {
        for (let target of this.baseTargets.codes) {
            if (current < target) return target;
        }
        const lastTarget = this.baseTargets.codes[this.baseTargets.codes.length - 1];
        return Math.ceil((current + lastTarget) / lastTarget) * lastTarget;
    }
}

class GameState {
    constructor(bus) {
        this.bus = bus;
        this.taskGenerator = new TaskGenerator();
        this.reset();
    }
    
    reset() {
        this.xp = 0;
        this.xpMax = 100;
        this.money = 0;
        this.stress = 0;
        this.level = 1;
        this.isGameOver = false;
        this.xpMultiplier = 1;
        this.studyMultiplier = 1;
        this.stressMultiplier = 1;
        this.completedTasks = new Set();
        this.difficultyId = 'mid';
        this.avatarSetId = 'developer';
        this.backgroundId = 'dark';
        this.codeClicks = 0;
        this.restCount = 0;
        this.studyCount = 0;
        this.totalMoneyEarned = 0;
        this.activePowerups = {};
        this.powerupCosts = { autoStress: 100, autoClick: 150, xpBoost: 120, shield: 200 };
        this.highStressTime = 0;
        this.studyEndTime = 0;
        this.lastActionTime = Date.now();
        this.currentTasks = [];
        this.updateTasks();
    }
    
    updateTasks() {
        this.currentTasks = this.taskGenerator.generateTasks(this);
    }
    
    getDifficulty() {
        return Config.DIFFICULTIES[this.difficultyId];
    }
    
    getAvatarSet() {
        return Config.AVATAR_SETS[this.avatarSetId] || Config.AVATAR_SETS.developer;
    }
    
    getCurrentAvatar() {
        const set = this.getAvatarSet();
        if (this.level <= 20) {
            const index = Math.min(this.level - 1, set.emojis.length - 1);
            return set.emojis[index];
        } else {
            const availableEmojis = set.emojis.slice(5);
            const randomIndex = Math.floor(Math.random() * availableEmojis.length);
            return availableEmojis[randomIndex];
        }
    }
    
    getBackground() {
        return Config.BACKGROUNDS.find(b => b.id === this.backgroundId) || Config.BACKGROUNDS[0];
    }
    
    getMood() {
        if (this.stress < 30) return 'calm';
        if (this.stress < 60) return 'focused';
        if (this.stress < 80) return 'stressed';
        return 'panic';
    }
    
    isPowerupActive(id) {
        return this.activePowerups[id] && this.activePowerups[id] > Date.now();
    }
    
    isStudyActive() {
        return this.studyEndTime > Date.now();
    }
    
    updateIdleStress() {
        const now = Date.now();
        const timeSinceAction = now - this.lastActionTime;
        if (timeSinceAction > 1000 && this.stress > 0) {
            this.stress = Math.max(0, this.stress - Config.IDLE_STRESS_REDUCTION);
        }
    }
    
    code() {
        if (this.isGameOver) return null;
        
        this.lastActionTime = Date.now();
        const diff = this.getDifficulty();
        let efficiency = 1.0;
        if (this.stress > 80) efficiency = 0.5;
        
        let xpBoost = this.isPowerupActive('xpBoost') ? 2 : 1;
        let studyBoost = this.isStudyActive() ? this.studyMultiplier : 1;
        let stressBlock = this.isPowerupActive('shield') ? 0 : 1;
        
        const gainXP = Math.floor(Config.BASE_XP * this.xpMultiplier * studyBoost * diff.xpMult * efficiency * xpBoost);
        const gainMoney = Math.floor(Config.BASE_MONEY * this.xpMultiplier * diff.xpMult * efficiency);
        const addStress = Config.STRESS_COST * this.stressMultiplier * diff.stressMult * stressBlock;
        
        this.xp += gainXP;
        this.money += gainMoney;
        this.totalMoneyEarned += gainMoney;
        this.stress = Math.min(100, this.stress + addStress);
        this.codeClicks++;
        
        const leveledUp = this.checkLevelUp();
        
        if (this.stress >= 100) {
            this.triggerGameOver();
            return { gameOver: true };
        }
        
        if (this.stress > 70) {
            this.highStressTime++;
            const bugMultiplier = Math.floor(this.highStressTime / 10);
            const bugChance = diff.bugChance * (1 + bugMultiplier);
            
            if (Math.random() < bugChance) {
                this.bus.emit('spawnBug');
            }
        } else {
            this.highStressTime = Math.max(0, this.highStressTime - 1);
        }
        
        this.checkTasks();
        
        return { xp: gainXP, money: gainMoney, efficiency, leveledUp };
    }
    
    rest() {
        if (this.isGameOver || this.money < Config.REST_COST) return false;
        
        this.lastActionTime = Date.now();
        this.money -= Config.REST_COST;
        this.stress = Math.max(0, this.stress - Config.STRESS_HEAL);
        this.restCount++;
        this.highStressTime = Math.max(0, this.highStressTime - 2);
        this.checkTasks();
        return true;
    }
    
    study() {
        if (this.isGameOver || this.money < Config.STUDY_COST) return false;
        
        this.lastActionTime = Date.now();
        this.money -= Config.STUDY_COST;
        this.studyMultiplier += Config.STUDY_MULT;
        this.stress = Math.min(100, this.stress + 5);
        this.studyCount++;
        
        const duration = this.getDifficulty().studyDuration * 1000;
        this.studyEndTime = Date.now() + duration;
        
        this.checkTasks();
        return { newMult: this.studyMultiplier, duration };
    }
    
    activatePowerup(type) {
        if (this.isGameOver) return false;
        const powerup = Config.POWERUPS[type];
        const cost = this.powerupCosts[type];
        
        if (this.money >= cost && powerup) {
            this.money -= cost;
            this.powerupCosts[type] = Math.floor(this.powerupCosts[type] * 1.3);
            
            const duration = this.getDifficulty().powerupDuration * 1000;
            this.activePowerups[type] = Date.now() + duration;
            
            this.bus.emit('powerupActivated', { type, duration });
            return true;
        }
        return false;
    }
    
    checkLevelUp() {
        if (this.xp >= this.xpMax) {
            this.level++;
            this.xp = 0;
            this.xpMax = Math.floor(this.xpMax * Config.LEVEL_MULT);
            this.stress = Math.max(0, this.stress - 30);
            this.bus.emit('levelUp', { level: this.level });
            this.checkTasks();
            return true;
        }
        return false;
    }
    
    triggerGameOver() {
        this.isGameOver = true;
        this.stress = 100;
        this.bus.emit('gameOver', { level: this.level });
    }
    
    checkTasks() {
        let taskCompleted = false;
        this.currentTasks.forEach(task => {
            if (!this.completedTasks.has(task.id) && task.check(this)) {
                this.completedTasks.add(task.id);
                if (task.reward.money) {
                    this.money += task.reward.money;
                    this.totalMoneyEarned += task.reward.money;
                }
                if (task.reward.xp) this.xp += task.reward.xp;
                this.bus.emit('taskComplete', task);
                taskCompleted = true;
            }
        });
        
        if (taskCompleted) {
            this.updateTasks();
        }
    }
    
    serialize() {
        return {
            xp: this.xp,
            xpMax: this.xpMax,
            money: this.money,
            stress: this.stress,
            level: this.level,
            xpMultiplier: this.xpMultiplier,
            studyMultiplier: this.studyMultiplier,
            stressMultiplier: this.stressMultiplier,
            completedTasks: Array.from(this.completedTasks),
            difficultyId: this.difficultyId,
            avatarSetId: this.avatarSetId,
            backgroundId: this.backgroundId,
            codeClicks: this.codeClicks,
            restCount: this.restCount,
            studyCount: this.studyCount,
            totalMoneyEarned: this.totalMoneyEarned,
            powerupCosts: this.powerupCosts,
            highStressTime: this.highStressTime
        };
    }
    
    deserialize(data) {
        Object.assign(this, data);
        this.completedTasks = new Set(data.completedTasks || []);
        this.isGameOver = false;
        this.activePowerups = {};
        this.studyEndTime = 0;
        this.lastActionTime = Date.now();
        this.updateTasks();
    }
}

class BugController {
    constructor(state, bus, audio, haptic) {
        this.state = state;
        this.bus = bus;
        this.audio = audio;
        this.haptic = haptic;
        this.activeBugs = [];
        
        bus.on('spawnBug', () => this.spawn());
    }
    
    spawn() {
        if (this.state.isGameOver) return;
        
        const bug = {
            id: Date.now() + Math.random(),
            el: null,
            eatTimer: null,
            despawnTimer: null
        };
        
        bug.el = document.createElement('div');
        bug.el.className = 'bug';
        bug.el.innerText = '🐛';
        document.getElementById('click-zone').appendChild(bug.el);
        
        const avatar = document.getElementById('avatar').getBoundingClientRect();
        bug.el.style.left = `${avatar.left + avatar.width / 2}px`;
        bug.el.style.top = `${avatar.top}px`;
        
        this.activeBugs.push(bug);
        
        setTimeout(() => this.flyToBar(bug), 100);
    }
    
    flyToBar(bug) {
        const xpBar = document.getElementById('xp-bar');
        const rect = xpBar.getBoundingClientRect();
        const xpPct = (this.state.xp / this.state.xpMax);
        const targetX = rect.left + (rect.width * xpPct);
        const targetY = rect.top - 30;
        
        bug.el.style.transition = 'all 1.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
        bug.el.style.left = `${targetX}px`;
        bug.el.style.top = `${targetY}px`;
        
        setTimeout(() => this.startEating(bug), 1700);
    }
    
    startEating(bug) {
        bug.eatTimer = setInterval(() => {
            if (this.state.stress <= 0) {
                this.despawn(bug);
                return;
            }
            
            const damage = Math.floor(this.state.xp * 0.25);
            this.state.xp = Math.max(0, this.state.xp - damage);
            this.state.money = Math.max(0, this.state.money - 10);
            this.bus.emit('bugEat', { damage });
            this.updatePosition(bug);
            
        }, 2500);
        
        bug.despawnTimer = setTimeout(() => this.despawn(bug), 25000);
    }
    
    updatePosition(bug) {
        const xpBar = document.getElementById('xp-bar');
        const rect = xpBar.getBoundingClientRect();
        const xpPct = (this.state.xp / this.state.xpMax);
        const targetX = rect.left + (rect.width * xpPct);
        
        bug.el.style.transition = 'left 0.5s ease-out';
        bug.el.style.left = `${targetX}px`;
    }
    
    despawn(bug) {
        const index = this.activeBugs.indexOf(bug);
        if (index > -1) this.activeBugs.splice(index, 1);
        
        clearInterval(bug.eatTimer);
        clearTimeout(bug.despawnTimer);
        
        if (bug.el) {
            bug.el.style.opacity = '0';
            setTimeout(() => bug.el && bug.el.remove(), 300);
        }
    }
}

class PowerupManager {
    constructor(state, bus) {
        this.state = state;
        this.bus = bus;
        this.autoClickInterval = null;
        this.autoStressInterval = null;
        
        setInterval(() => this.update(), 100);
    }
    
    update() {
        if (this.state.isPowerupActive('autoClick') && !this.autoClickInterval) {
            this.autoClickInterval = setInterval(() => {
                if (this.state.isPowerupActive('autoClick')) {
                    this.bus.emit('autoCode');
                } else {
                    clearInterval(this.autoClickInterval);
                    this.autoClickInterval = null;
                }
            }, Config.POWERUPS.autoClick.effect);
        }
        
        if (this.state.isPowerupActive('autoStress') && !this.autoStressInterval) {
            this.autoStressInterval = setInterval(() => {
                if (this.state.isPowerupActive('autoStress')) {
                    this.state.stress = Math.max(0, this.state.stress - Config.POWERUPS.autoStress.effect);
                    this.bus.emit('render');
                } else {
                    clearInterval(this.autoStressInterval);
                    this.autoStressInterval = null;
                }
            }, 1000);
        }
    }
}

class UI {
    constructor(state, bus, audio, haptic) {
        this.state = state;
        this.bus = bus;
        this.audio = audio;
        this.haptic = haptic;
        this.settingsOpen = false;
        this.cacheElements();
        this.setupListeners();
    }
    
    cacheElements() {
        this.els = {
            xpBar: document.getElementById('xp-bar'),
            xpText: document.getElementById('xp-text'),
            stressBar: document.getElementById('stress-bar'),
            stressText: document.getElementById('stress-text'),
            moneyText: document.getElementById('money-text'),
            levelText: document.getElementById('level-display'),
            avatar: document.getElementById('avatar'),
            clickZone: document.getElementById('click-zone'),
            gameOverScreen: document.getElementById('game-over-overlay'),
            settingsPanel: document.getElementById('settings-panel'),
            tasksList: document.getElementById('tasks-list'),
            bgLayer: document.getElementById('bg-layer'),
            studyMultText: document.getElementById('study-mult'),
            speech: document.getElementById('speech')
        };
    }
    
    setupListeners() {
        this.bus.on('levelUp', data => this.onLevelUp(data));
        this.bus.on('gameOver', data => this.onGameOver(data));
        this.bus.on('taskComplete', task => this.onTaskComplete(task));
        this.bus.on('bugEat', () => this.onBugEat());
        this.bus.on('powerupActivated', data => this.onPowerupActivated(data));
        this.bus.on('render', () => this.render());
    }
    
    render() {
        if (this.state.isGameOver) {
            this.els.gameOverScreen.style.display = 'flex';
            document.getElementById('final-level').innerText = this.state.level;
            document.getElementById('final-codes').innerText = this.state.codeClicks;
            return;
        }
        
        this.els.gameOverScreen.style.display = 'none';
        
        const xpPct = (this.state.xp / this.state.xpMax) * 100;
        this.els.xpBar.style.width = `${xpPct}%`;
        this.els.stressBar.style.width = `${this.state.stress}%`;
        
        const mood = this.state.getMood();
        if (mood === 'panic') {
            this.els.stressBar.style.background = '#ef4444';
            this.els.avatar.style.animation = 'shake 0.3s infinite';
        } else if (mood === 'stressed') {
            this.els.stressBar.style.background = '#f59e0b';
            this.els.avatar.style.animation = 'shake 0.6s infinite';
        } else {
            this.els.stressBar.style.background = '#10b981';
            this.els.avatar.style.animation = 'none';
        }
        
        this.els.levelText.innerText = `LVL ${this.state.level} • ${this.state.getDifficulty().label}`;
        this.els.xpText.innerText = `${this.state.xp} / ${this.state.xpMax}`;
        this.els.stressText.innerText = `${Math.floor(this.state.stress)}%`;
        this.els.moneyText.innerText = `$${this.state.money}`;
        this.els.avatar.innerText = this.state.getCurrentAvatar();
        
        const studyActive = this.state.isStudyActive();
        if (studyActive) {
            const remaining = Math.ceil((this.state.studyEndTime - Date.now()) / 1000);
            this.els.studyMultText.innerText = `×${this.state.studyMultiplier.toFixed(1)} (${remaining}s)`;
        } else {
            this.els.studyMultText.innerText = `×${this.state.studyMultiplier.toFixed(1)}`;
        }
        
        this.updatePowerups();
        this.updateBackground();
        this.updateTasks();
    }
    
    updatePowerups() {
        Object.values(Config.POWERUPS).forEach(powerup => {
            const btn = document.getElementById(`btn-${powerup.id}`);
            const cost = document.getElementById(`cost-${powerup.id}`);
            const timer = document.getElementById(`timer-${powerup.id}`);
            
            if (btn && cost) {
                cost.innerText = `$${this.state.powerupCosts[powerup.id]}`;
                const active = this.state.isPowerupActive(powerup.id);
                btn.classList.toggle('active', active);
                btn.classList.toggle('disabled', !active && this.state.money < this.state.powerupCosts[powerup.id]);
                
                if (timer) {
                    if (active) {
                        const remaining = Math.ceil((this.state.activePowerups[powerup.id] - Date.now()) / 1000);
                        timer.innerText = `${remaining}s`;
                        timer.style.display = 'block';
                    } else {
                        timer.style.display = 'none';
                    }
                }
            }
        });
    }
    
    updateBackground() {
        const bg = this.state.getBackground();
        this.els.bgLayer.style.background = `linear-gradient(135deg, ${bg.colors[0]}, ${bg.colors[1]})`;
    }
    
    updateTasks() {
        if (!this.els.tasksList) return;
        
        this.els.tasksList.innerHTML = '';
        this.state.currentTasks.forEach(task => {
            const div = document.createElement('div');
            div.className = 'task-item';
            const reward = task.reward.money ? `+$${task.reward.money}` : `+${task.reward.xp}XP`;
            div.innerHTML = `
                <span class="task-icon">○</span>
                <span class="task-text">${task.desc}</span>
                <span class="task-reward">${reward}</span>
            `;
            this.els.tasksList.appendChild(div);
        });
    }
    
    toggleSettings() {
        this.settingsOpen = !this.settingsOpen;
        this.els.settingsPanel.classList.toggle('open', this.settingsOpen);
        if (this.settingsOpen) {
            this.renderSettings();
        }
    }
    
    renderSettings() {
        const diffPanel = document.getElementById('diff-options');
        const avatarPanel = document.getElementById('avatar-options');
        const bgPanel = document.getElementById('bg-options');
        
        if (diffPanel) {
            diffPanel.innerHTML = '';
            Object.values(Config.DIFFICULTIES).forEach(diff => {
                const btn = document.createElement('button');
                btn.className = `setting-option ${diff.id === this.state.difficultyId ? 'active' : ''}`;
                btn.innerText = diff.label;
                btn.onclick = () => {
                    this.audio.sfxUIClick();
                    this.haptic.trigger('light');
                    this.state.difficultyId = diff.id;
                    this.showToast(`Difficulty: ${diff.label}`, 'info');
                    this.renderSettings();
                    this.render();
                    this.bus.emit('save');
                };
                diffPanel.appendChild(btn);
            });
        }
        
        if (avatarPanel) {
            avatarPanel.innerHTML = '';
            Object.values(Config.AVATAR_SETS).forEach(set => {
                const btn = document.createElement('button');
                btn.className = `setting-option ${set.id === this.state.avatarSetId ? 'active' : ''}`;
                btn.innerText = set.emojis[0];
                btn.title = set.label;
                btn.onclick = () => {
                    this.audio.sfxUIClick();
                    this.haptic.trigger('light');
                    this.state.avatarSetId = set.id;
                    this.showToast(`Avatar: ${set.label}`, 'info');
                    this.renderSettings();
                    this.render();
                    this.bus.emit('save');
                };
                avatarPanel.appendChild(btn);
            });
        }
        
        if (bgPanel) {
            bgPanel.innerHTML = '';
            Config.BACKGROUNDS.forEach(bg => {
                const btn = document.createElement('button');
                btn.className = `setting-option bg ${bg.id === this.state.backgroundId ? 'active' : ''}`;
                btn.style.background = `linear-gradient(135deg, ${bg.colors[0]}, ${bg.colors[1]})`;
                btn.title = bg.label;
                btn.onclick = () => {
                    this.audio.sfxUIClick();
                    this.haptic.trigger('light');
                    this.state.backgroundId = bg.id;
                    this.showToast(`Theme: ${bg.label}`, 'info');
                    this.renderSettings();
                    this.render();
                    this.bus.emit('save');
                };
                bgPanel.appendChild(btn);
            });
        }
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
    
    showToast(text, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerText = text;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
    
    showSpeech(text, duration = 2000) {
        this.els.speech.innerText = text;
        this.els.speech.classList.add('show');
        setTimeout(() => this.els.speech.classList.remove('show'), duration);
    }
    
    onLevelUp(data) {
        this.audio.sfxLevelUp(data.level);
        this.haptic.trigger('success');
        
        this.showToast(`🎉 Level ${data.level} Reached!`, 'success');
        this.showCelebration();
        
        const messages = [
            'Level up! Avatar evolved!',
            'You\'re growing stronger!',
            'Great progress!',
            'Keep climbing!',
            'Unstoppable!'
        ];
        this.showSpeech(messages[Math.floor(Math.random() * messages.length)]);
    }
    
    showCelebration() {
        const clickZone = this.els.clickZone;
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7'];
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'celebration-particle';
                particle.innerText = ['✨', '🎉', '⭐', '💫'][Math.floor(Math.random() * 4)];
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                particle.style.color = colors[Math.floor(Math.random() * colors.length)];
                clickZone.appendChild(particle);
                setTimeout(() => particle.remove(), 2000);
            }, i * 100);
        }
    }
    
    onGameOver(data) {
        const intensity = Math.min(data.level, 10);
        this.audio.sfxCrash(intensity);
        
        const shakeClass = intensity < 5 ? 'shake-light' : intensity < 8 ? 'shake-medium' : 'shake-heavy';
        this.els.gameOverScreen.classList.add(shakeClass);
        setTimeout(() => this.els.gameOverScreen.classList.remove(shakeClass), 1000);
        
        const vibPattern = intensity < 5 ? [100] : intensity < 8 ? [100, 50, 100] : [100, 50, 100, 50, 200];
        if (navigator.vibrate) navigator.vibrate(vibPattern);
    }
    
    onTaskComplete(task) {
        this.audio.sfxTask();
        this.haptic.trigger('success');
        this.showToast(`✓ ${task.desc}`, 'success');
        this.updateTasks();
    }
    
    onBugEat() {
        this.showSpeech('🐛 Bug eating progress!', 1500);
        this.render();
    }
    
    onPowerupActivated(data) {
        const powerup = Config.POWERUPS[data.type];
        this.showToast(`${powerup.icon} ${powerup.name} activated!`, 'info');
    }
}

class SaveManager {
    constructor(state, bus) {
        this.state = state;
        this.bus = bus;
        this.key = 'emindev_save_v4';
        
        bus.on('save', () => this.save());
        setInterval(() => this.save(), 30000);
    }
    
    save() {
        try {
            localStorage.setItem(this.key, JSON.stringify(this.state.serialize()));
        } catch (e) {}
    }
    
    load() {
        try {
            const data = localStorage.getItem(this.key);
            if (data) {
                this.state.deserialize(JSON.parse(data));
                return true;
            }
        } catch (e) {}
        return false;
    }
    
    clear() {
        try {
            localStorage.removeItem(this.key);
        } catch (e) {}
    }
}

const bus = new EventBus();
const audio = new AudioEngine();
const haptic = new HapticEngine();
const state = new GameState(bus);
const ui = new UI(state, bus, audio, haptic);
const saveManager = new SaveManager(state, bus);
const bugController = new BugController(state, bus, audio, haptic);
const powerupManager = new PowerupManager(state, bus);

let locked = false;

function handleCode(e) {
    if (locked || state.isGameOver) return;
    locked = true;
    setTimeout(() => locked = false, 100);
    
    audio.init();
    const result = state.code();
    
    if (result && !result.gameOver) {
        audio.sfxClick();
        haptic.trigger('light');
        
        const rect = ui.els.avatar.getBoundingClientRect();
        const xpText = result.efficiency < 1 ? `+${result.xp} XP ⚠️` : `+${result.xp} XP`;
        const color = result.efficiency < 1 ? '#f87171' : '#3b82f6';
        
        ui.spawnFloater(xpText, color, rect.left + 30, rect.top);
        ui.spawnFloater(`+$${result.money}`, '#f59e0b', rect.left + 60, rect.top + 20);
    }
    
    ui.render();
    bus.emit('save');
}

function handleRest() {
    if (state.isGameOver) return;
    const success = state.rest();
    if (success) {
        audio.init();
        audio.sfxRest();
        haptic.trigger('light');
        ui.showSpeech(`Resting... (-$${Config.REST_COST})`, 1500);
        ui.render();
        bus.emit('save');
    } else {
        ui.showToast('Need $3 to rest!', 'info');
    }
}

function handleStudy() {
    if (state.isGameOver) return;
    const result = state.study();
    if (result) {
        audio.init();
        audio.sfxStudy();
        haptic.trigger('medium');
        ui.showToast(`Study boost! ×${result.newMult.toFixed(1)} for ${Math.floor(result.duration/1000)}s`, 'info');
        ui.render();
        bus.emit('save');
    } else {
        ui.showToast(`Need $${Config.STUDY_COST} to study!`, 'info');
    }
}

function handlePowerup(type) {
    if (state.activatePowerup(type)) {
        audio.init();
        audio.sfxBuy();
        haptic.trigger('medium');
    }
    ui.render();
    bus.emit('save');
}

function handleReboot() {
    saveManager.clear();
    state.reset();
    ui.render();
    ui.showToast('System rebooted', 'info');
}

bus.on('autoCode', () => {
    const result = state.code();
    if (result && !result.gameOver) {
        ui.render();
    }
});

setInterval(() => {
    if (!state.isGameOver) {
        state.updateIdleStress();
        ui.render();
    }
}, 2000);

document.addEventListener('DOMContentLoaded', () => {
    saveManager.load();
    ui.render();
    
    setInterval(() => ui.updatePowerups(), 500);
    
    document.getElementById('btn-code').addEventListener('touchstart', e => { e.preventDefault(); handleCode(e); });
    document.getElementById('btn-code').addEventListener('click', handleCode);
    document.getElementById('btn-rest').addEventListener('click', handleRest);
    document.getElementById('btn-study').addEventListener('click', handleStudy);
    
    Object.values(Config.POWERUPS).forEach(powerup => {
        const btn = document.getElementById(`btn-${powerup.id}`);
        if (btn) btn.addEventListener('click', () => handlePowerup(powerup.id));
    });
    
    document.getElementById('btn-settings').addEventListener('click', () => ui.toggleSettings());
    document.getElementById('btn-close-settings').addEventListener('click', () => ui.toggleSettings());
    
    document.getElementById('btn-sound').addEventListener('click', e => {
        audio.init();
        const isOn = audio.toggle();
        e.target.innerText = isOn ? '🔊 Sound' : '🔇 Sound';
        haptic.trigger('light');
        ui.showToast(isOn ? 'Sound enabled' : 'Sound disabled', 'info');
    });
    
    document.getElementById('btn-haptic').addEventListener('click', e => {
        const isOn = haptic.toggle();
        e.target.innerText = isOn ? '📳 Vibration' : '🔕 Vibration';
        if (isOn) haptic.trigger('medium');
        ui.showToast(isOn ? 'Vibration enabled' : 'Vibration disabled', 'info');
    });
    
    document.getElementById('btn-reboot').addEventListener('click', handleReboot);
});
