const Config = Object.freeze({
    BASE_XP: 10,
    BASE_MONEY: 5,
    STRESS_COST: 12,
    STRESS_HEAL: 30,
    REST_COST: 3,
    STUDY_COST: 50,
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
            effect: 2
        },
        autoClick: {
            id: 'autoClick',
            name: 'Auto Code',
            icon: '🤖',
            baseCost: 150,
            desc: 'Auto codes every 4s',
            effect: 4000
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
    }

    init() {
        if (this.ctx) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                this.enabled = false;
                return;
            }
            this.ctx = new AudioContext();
        } catch (e) {
            this.enabled = false;
        }
    }

    playTone(freq, type = 'sine', duration = 0.1) {
        if (!this.ctx) this.init();
        if (!this.enabled || !this.ctx) return;

        
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }

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

    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled && this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.enabled;
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
        if (!this.enabled) return;

        try {
            if (window.navigator && window.navigator.vibrate) {
                const patterns = {
                    light: 20,
                    medium: 40,
                    heavy: 60,
                    success: [30, 30, 60],
                    error: [100, 50, 100, 50, 200]
                };
                window.navigator.vibrate(patterns[type] || 30);
            }
        } catch (e) {
            console.log('Vibration not supported');
        }
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
        this.powerupAffordableTimestamps = {};
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
        this.powerupAffordableTimestamps = {};
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
        this.powerupAffordableTimestamps = {};
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

class AvatarDragController {
    constructor(avatarEl, bus, haptic) {
        this.avatar = avatarEl;
        this.bus = bus;
        this.haptic = haptic;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.originalX = 0;
        this.originalY = 0;

        this.init();
    }

    init() {
        this.avatar.addEventListener('touchstart', this.onStart.bind(this), { passive: false });
        this.avatar.addEventListener('touchmove', this.onMove.bind(this), { passive: false });
        this.avatar.addEventListener('touchend', this.onEnd.bind(this));

        this.avatar.addEventListener('mousedown', this.onStart.bind(this));
        document.addEventListener('mousemove', this.onMove.bind(this));
        document.addEventListener('mouseup', this.onEnd.bind(this));
    }

    onStart(e) {
        e.preventDefault();
        this.isDragging = true;
        this.avatar.classList.add('dragging');

        const touch = e.touches ? e.touches[0] : e;
        this.startX = touch.clientX;
        this.startY = touch.clientY;

        const rect = this.avatar.getBoundingClientRect();
        this.originalX = rect.left + rect.width / 2;
        this.originalY = rect.top + rect.height / 2;
    }

    onMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        const touch = e.touches ? e.touches[0] : e;
        this.currentX = touch.clientX;
        this.currentY = touch.clientY;

        const deltaX = this.currentX - this.startX;
        const deltaY = this.currentY - this.startY;

        this.avatar.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    onEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.avatar.classList.remove('dragging');

        this.avatar.style.transform = '';
        this.haptic.trigger('light');
    }
}

class UIController {
    constructor(state, bus, audio, haptic) {
        this.state = state;
        this.bus = bus;
        this.audio = audio;
        this.haptic = haptic;

        this.elements = {
            level: document.getElementById('level-display'),
            xpText: document.getElementById('xp-text'),
            xpBar: document.getElementById('xp-bar'),
            stressText: document.getElementById('stress-text'),
            stressBar: document.getElementById('stress-bar'),
            moneyText: document.getElementById('money-text'),
            studyMult: document.getElementById('study-mult'),
            avatar: document.getElementById('avatar'),
            speech: document.getElementById('speech'),
            tasksList: document.getElementById('tasks-list'),
            bgLayer: document.getElementById('bg-layer'),
            btnCode: document.getElementById('btn-code'),
            btnRest: document.getElementById('btn-rest'),
            btnStudy: document.getElementById('btn-study')
        };

        this.init();
        this.render();
        setInterval(() => this.render(), 100);
    }

    init() {
        // Init Toast Container
        if (!document.querySelector('.toast-container')) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        }

        this.elements.btnCode.addEventListener('click', () => this.handleCode());
        this.elements.btnRest.addEventListener('click', () => this.handleRest());
        this.elements.btnStudy.addEventListener('click', () => this.handleStudy());

        Object.keys(Config.POWERUPS).forEach(type => {
            const btn = document.getElementById(`btn-${type}`);
            btn.addEventListener('click', () => this.handlePowerup(type));
        });

        document.getElementById('btn-settings').addEventListener('click', () => {
            document.getElementById('settings-panel').classList.add('open');
            this.audio.sfxUIClick();
        });

        document.getElementById('btn-close-settings').addEventListener('click', () => {
            document.getElementById('settings-panel').classList.remove('open');
            this.audio.sfxUIClick();
        });

        document.getElementById('btn-sound').addEventListener('click', () => {
            this.audio.toggle();
            this.audio.sfxUIClick();
        });

        document.getElementById('btn-haptic').addEventListener('click', () => {
            this.haptic.toggle();
            this.haptic.trigger('light');
        });

        document.getElementById('btn-reboot').addEventListener('click', () => {
            this.handleReboot();
        });

        this.setupSettings();

        this.bus.on('levelUp', (data) => this.onLevelUp(data));
        this.bus.on('gameOver', (data) => this.onGameOver(data));
        this.bus.on('taskComplete', (task) => this.onTaskComplete(task));
        this.bus.on('autoCode', () => this.handleCode(true));
        this.bus.on('powerupActivated', (data) => this.onPowerupActivated(data));
    }

    setupSettings() {
        const diffOptions = document.getElementById('diff-options');
        Object.values(Config.DIFFICULTIES).forEach(diff => {
            const btn = document.createElement('button');
            btn.className = 'setting-option';
            btn.textContent = diff.label;
            btn.addEventListener('click', () => {
                this.state.difficultyId = diff.id;
                this.updateSettingsUI();
                this.audio.sfxUIClick();
            });
            diffOptions.appendChild(btn);
        });

        const avatarOptions = document.getElementById('avatar-options');
        Object.values(Config.AVATAR_SETS).forEach(set => {
            const btn = document.createElement('button');
            btn.className = 'setting-option';
            btn.textContent = set.label;
            btn.addEventListener('click', () => {
                this.state.avatarSetId = set.id;
                this.updateSettingsUI();
                this.render();
                this.audio.sfxUIClick();
            });
            avatarOptions.appendChild(btn);
        });

        const bgOptions = document.getElementById('bg-options');
        Config.BACKGROUNDS.forEach(bg => {
            const btn = document.createElement('button');
            btn.className = 'setting-option bg';
            btn.style.background = `linear-gradient(135deg, ${bg.colors[0]}, ${bg.colors[1]})`;
            btn.addEventListener('click', () => {
                this.state.backgroundId = bg.id;
                this.updateSettingsUI();
                this.updateBackground();
                this.audio.sfxUIClick();
            });
            bgOptions.appendChild(btn);
        });

        this.updateSettingsUI();
    }

    updateSettingsUI() {
        document.querySelectorAll('#diff-options .setting-option').forEach((btn, i) => {
            const diff = Object.values(Config.DIFFICULTIES)[i];
            btn.classList.toggle('active', diff.id === this.state.difficultyId);
        });

        document.querySelectorAll('#avatar-options .setting-option').forEach((btn, i) => {
            const set = Object.values(Config.AVATAR_SETS)[i];
            btn.classList.toggle('active', set.id === this.state.avatarSetId);
        });

        document.querySelectorAll('#bg-options .setting-option').forEach((btn, i) => {
            const bg = Config.BACKGROUNDS[i];
            btn.classList.toggle('active', bg.id === this.state.backgroundId);
        });
    }

    handleCode(isAuto = false) {
        if (this.state.isGameOver) return;

        const result = this.state.code();
        if (!result) return;

        if (result.gameOver) return;

        if (!isAuto) {
            this.audio.sfxClick();
            this.haptic.trigger('light');
        }

        
        this.showFloater(`+${result.xp} XP`, this.elements.avatar, 'xp', -30);
        this.showFloater(`+$${result.money}`, this.elements.avatar, 'money', 30);

        if (result.efficiency < 1) {
            this.showSpeech('Stressed! Lower efficiency!', 2000);
        }

        this.render();
    }

    handleRest() {
        if (this.state.rest()) {
            this.audio.sfxRest();
            this.haptic.trigger('medium');
            this.showSpeech('Feeling better! ☕', 1500);
            this.showFloater('-30 Burnout', this.elements.avatar, 'xp', 0);
            this.render();
        }
    }

    handleStudy() {
        const result = this.state.study();
        if (result) {
            this.audio.sfxStudy();
            this.haptic.trigger('medium');
            this.showSpeech(`Studying! Multiplier: ${result.newMult.toFixed(1)}×`, 2000);
            this.render();
        }
    }

    handlePowerup(type) {
        if (this.state.activatePowerup(type)) {
            this.audio.sfxBuy();
            this.haptic.trigger('success');
            this.showToast(`${Config.POWERUPS[type].name} activated!`, 'success');
            this.render();
        }
    }

    onPowerupActivated(data) {
        const duration = data.duration / 1000;
        this.updatePowerupTimer(data.type, duration);
    }

    updatePowerupTimer(type, remainingSeconds) {
        const timerEl = document.getElementById(`timer-${type}`);
        if (remainingSeconds > 0) {
            timerEl.style.display = 'block';
            timerEl.textContent = `${Math.ceil(remainingSeconds)}s`;
        } else {
            timerEl.style.display = 'none';
        }
    }

    handleReboot() {
        this.state.reset();
        document.getElementById('game-over-overlay').style.display = 'none';
        this.audio.sfxUIClick();
        this.render();
    }

    onLevelUp(data) {
        this.audio.sfxLevelUp(data.level);
        this.haptic.trigger('success');
        this.showSpeech(`LEVEL UP! Now Level ${data.level}!`, 3000);
        this.showCelebration();
        this.render();
    }

    onGameOver(data) {
        this.audio.sfxCrash(data.level);
        this.haptic.trigger('error');
        
        const overlay = document.getElementById('game-over-overlay');
        document.getElementById('final-level').textContent = data.level;
        document.getElementById('final-codes').textContent = this.state.codeClicks;
        overlay.style.display = 'flex';

        const body = document.body;
        body.classList.add('shake-heavy');
        setTimeout(() => body.classList.remove('shake-heavy'), 1000);
    }

    onTaskComplete(task) {
        this.audio.sfxTask();
        this.haptic.trigger('success');
        this.showToast(`Task Complete! +$${task.reward.money}`, 'success');
        this.render();
    }

    render() {
        this.state.updateIdleStress();

        const diff = this.state.getDifficulty();
        this.elements.level.textContent = `LVL ${this.state.level} • ${diff.label}`;

        this.elements.xpText.textContent = `${this.state.xp} / ${this.state.xpMax}`;
        this.elements.xpBar.style.width = `${(this.state.xp / this.state.xpMax) * 100}%`;

        this.elements.stressText.textContent = `${Math.floor(this.state.stress)}%`;
        this.elements.stressBar.style.width = `${this.state.stress}%`;

        if (this.state.stress < 30) {
            this.elements.stressBar.style.background = '#10b981';
        } else if (this.state.stress < 60) {
            this.elements.stressBar.style.background = '#f59e0b';
        } else {
            this.elements.stressBar.style.background = '#ef4444';
        }

        this.elements.moneyText.textContent = `$${this.state.money}`;
        this.elements.studyMult.textContent = `×${this.state.studyMultiplier.toFixed(1)}`;

        this.elements.avatar.textContent = this.state.getCurrentAvatar();

        this.renderTasks();
        this.renderPowerups();
        this.updateBackground();
    }

    renderTasks() {
        this.elements.tasksList.innerHTML = '';
        this.state.currentTasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';
            taskEl.innerHTML = `
                <span class="task-icon">🎯</span>
                <span class="task-text">${task.desc}</span>
                <span class="task-reward">+$${task.reward.money}</span>
            `;
            this.elements.tasksList.appendChild(taskEl);
        });
    }

    renderPowerups() {
        Object.keys(Config.POWERUPS).forEach(type => {
            const btn = document.getElementById(`btn-${type}`);
            const cost = this.state.powerupCosts[type];
            const canAfford = this.state.money >= cost;
            const isActive = this.state.isPowerupActive(type);

            document.getElementById(`cost-${type}`).textContent = `$${cost}`;

            btn.classList.remove('disabled', 'can-afford', 'newly-affordable');

            if (isActive) {
                btn.classList.add('active');
                const remaining = (this.state.activePowerups[type] - Date.now()) / 1000;
                this.updatePowerupTimer(type, remaining);
            } else {
                btn.classList.remove('active');
                document.getElementById(`timer-${type}`).style.display = 'none';
            }

            if (canAfford && !isActive) {
                btn.classList.add('can-afford');

                if (!this.state.powerupAffordableTimestamps[type]) {
                    this.state.powerupAffordableTimestamps[type] = Date.now();
                    btn.classList.add('newly-affordable');

                    setTimeout(() => {
                        btn.classList.remove('newly-affordable');
                    }, 10000);
                } else {
                    const timeSinceAffordable = Date.now() - this.state.powerupAffordableTimestamps[type];
                    if (timeSinceAffordable < 10000) {
                        btn.classList.add('newly-affordable');
                    }
                }
            } else if (!canAfford) {
                btn.classList.add('disabled');
                delete this.state.powerupAffordableTimestamps[type];
            }
        });
    }

    updateBackground() {
        const bg = this.state.getBackground();
        this.elements.bgLayer.style.background = `linear-gradient(135deg, ${bg.colors[0]}, ${bg.colors[1]})`;
    }

    showSpeech(text, duration = 2000) {
        this.elements.speech.textContent = text;
        this.elements.speech.classList.add('show');
        setTimeout(() => {
            this.elements.speech.classList.remove('show');
        }, duration);
    }

    showFloater(text, target, type, baseOffset = 0) {
        const floater = document.createElement('div');
        floater.className = `floater float-${type}`;
        floater.textContent = text;

        const rect = target.getBoundingClientRect();
        
        
        const jitterX = (Math.random() - 0.5) * 40;
        const jitterY = (Math.random() - 0.5) * 20;

        const startX = rect.left + (rect.width / 2) + baseOffset + jitterX;
        const startY = rect.top + jitterY;

        floater.style.left = `${startX}px`;
        floater.style.top = `${startY}px`;

        document.body.appendChild(floater);

        setTimeout(() => floater.remove(), 800);
    }

    showCelebration() {
        const emojis = ['🎉', '✨', '🌟', '⭐', '💫'];
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'celebration-particle';
                particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];

                const rect = this.elements.avatar.getBoundingClientRect();
                particle.style.left = `${rect.left + rect.width / 2}px`;
                particle.style.top = `${rect.top + rect.height / 2}px`;

                const tx = (Math.random() - 0.5) * 200;
                const ty = -Math.random() * 150 - 50;
                particle.style.setProperty('--tx', `${tx}px`);
                particle.style.setProperty('--ty', `${ty}px`);

                document.body.appendChild(particle);

                setTimeout(() => particle.remove(), 2000);
            }, i * 100);
        }
    }

    showToast(message, type = 'info') {
        if (!this.toastContainer) {
             this.toastContainer = document.querySelector('.toast-container');
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        this.toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
            setTimeout(() => toast.classList.add('show'), 10);
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}


const bus = new EventBus();
const audio = new AudioEngine();
const haptic = new HapticEngine();
const state = new GameState(bus);
const bugController = new BugController(state, bus, audio, haptic);
const powerupManager = new PowerupManager(state, bus);
const ui = new UIController(state, bus, audio, haptic);
const avatarDrag = new AvatarDragController(document.getElementById('avatar'), bus, haptic);


document.body.addEventListener('touchstart', () => audio.init(), { once: true });
document.body.addEventListener('click', () => audio.init(), { once: true });
