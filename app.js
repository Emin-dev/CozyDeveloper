const CONFIG = Object.freeze({
    XP_BASE: 10,
    XP_SCALER: 2,
    STRESS_GAIN: 15,
    STRESS_HEAL: 40,
    LEVEL_SCALER: 1.5,
    BURNOUT_THRESHOLD: 100,
    RECOVERY_THRESHOLD: 50,
    TITLES: [
        { name: "Junior", skin: "👶", msg: "I broke production..." },
        { name: "Mid-Level", skin: "👨‍💻", msg: "It works on my machine!" },
        { name: "Senior", skin: "🧙‍♂️", msg: "Let's rewrite it in Rust." },
        { name: "Lead", skin: "🧛‍♀️", msg: "I need that ticket by 5pm." },
        { name: "CTO", skin: "👽", msg: "AI will replace us." },
        { name: "God", skin: "⚡", msg: "I dream in binary." }
    ],
    PREFIXES: ["Cyber", "Neon", "Void", "Hyper", "Mega", "Omni"],
    ROLES: ["Coder", "Hacker", "Mind", "Core", "Flux", "Node"],
    VIBRATION_PATTERN: 10,
    QUOTES: [
        "Compiling...", "Forgot semicolon", "Git push --force", 
        "It's a feature", "Refactoring...", "Deploying..."
    ]
});

class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(listener);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(data));
        }
    }
}

class GameState extends EventEmitter {
    constructor() {
        super();
        this.state = {
            xp: 0,
            xpNeeded: 100,
            level: 1,
            stress: 0,
            isBurnedOut: false
        };
    }

    get() {
        return { ...this.state };
    }

    performAction(actionType) {
        if (this.state.isBurnedOut && actionType === 'CODE') {
            this.emit('error', 'I need rest!');
            return;
        }

        if (actionType === 'CODE') {
            this._handleCodeAction();
        } else if (actionType === 'SLEEP') {
            this._handleSleepAction();
        }

        this._checkStateThresholds();
        this.emit('update', this.get());
    }

    _handleCodeAction() {
        const gain = CONFIG.XP_BASE + (this.state.level * CONFIG.XP_SCALER);
        this.state.xp += gain;
        this.state.stress = Math.min(100, this.state.stress + CONFIG.STRESS_GAIN);
        this.emit('action_code');
    }

    _handleSleepAction() {
        this.state.stress = Math.max(0, this.state.stress - CONFIG.STRESS_HEAL);
        this.emit('action_sleep');
    }

    _checkStateThresholds() {
        if (this.state.xp >= this.state.xpNeeded) {
            this._levelUp();
        }

        if (this.state.stress >= CONFIG.BURNOUT_THRESHOLD && !this.state.isBurnedOut) {
            this.state.isBurnedOut = true;
            this.emit('burnout_start');
        } else if (this.state.stress < CONFIG.RECOVERY_THRESHOLD && this.state.isBurnedOut) {
            this.state.isBurnedOut = false;
            this.emit('burnout_end');
        }
    }

    _levelUp() {
        this.state.level++;
        this.state.xp = 0;
        this.state.xpNeeded = Math.floor(this.state.xpNeeded * CONFIG.LEVEL_SCALER);
        this.state.stress = 0;
        this.emit('level_up');
    }

    getTitleData() {
        const { level } = this.state;
        if (level <= CONFIG.TITLES.length) {
            return CONFIG.TITLES[level - 1];
        }
        
        const pIndex = (level) % CONFIG.PREFIXES.length;
        const rIndex = (level) % CONFIG.ROLES.length;
        
        return { 
            name: `${CONFIG.PREFIXES[pIndex]} ${CONFIG.ROLES[rIndex]} ${level}`, 
            skin: CONFIG.TITLES[CONFIG.TITLES.length - 1].skin,
            msg: "Systems optimal."
        };
    }
}

class DOMRenderer {
    constructor() {
        this.elements = {
            xpBar: document.getElementById('xp-bar'),
            xpText: document.getElementById('xp-text'),
            stressBar: document.getElementById('stress-bar'),
            stressText: document.getElementById('stress-text'),
            level: document.getElementById('level-display'),
            avatar: document.getElementById('avatar'),
            bubble: document.getElementById('speech'),
            btnCode: document.getElementById('btn-code'),
            btnSleep: document.getElementById('btn-sleep'),
            body: document.body
        };
        this.timeouts = { bubble: null, lock: null };
    }

    render(state, titleData) {
        const xpPercent = (state.xp / state.xpNeeded) * 100;
        
        this.elements.level.innerText = `LVL ${state.level} ${titleData.name}`;
        this.elements.xpText.innerText = `${Math.floor(state.xp)} / ${state.xpNeeded}`;
        this.elements.stressText.innerText = `${state.stress}%`;
        
        requestAnimationFrame(() => {
            this.elements.xpBar.style.width = `${xpPercent}%`;
            this.elements.stressBar.style.width = `${state.stress}%`;
            this.elements.stressBar.style.background = this._getStressColor(state.stress);
            
            if (!state.isBurnedOut) {
                this.elements.avatar.innerText = titleData.skin;
            }
        });
    }

    setBurnoutState(isBurnedOut) {
        if (isBurnedOut) {
            this.elements.btnCode.classList.add('disabled');
            this.elements.avatar.innerText = "🔥";
            this.elements.body.style.background = "#2a0a0a";
            this.showBubble("BURNOUT!");
        } else {
            this.elements.btnCode.classList.remove('disabled');
            this.elements.body.style.background = "#0f111a";
            this.showBubble("Back online.");
        }
    }

    triggerLevelUpEffect() {
        this.showBubble("LEVEL UP!");
        this.elements.avatar.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        this.elements.avatar.style.transform = "scale(1.5) rotate(360deg)";
        setTimeout(() => {
            this.elements.avatar.style.transform = "scale(1)";
        }, 400);
    }

    showBubble(text) {
        this.elements.bubble.innerText = text;
        this.elements.bubble.classList.add('show');
        
        if (this.timeouts.bubble) clearTimeout(this.timeouts.bubble);
        this.timeouts.bubble = setTimeout(() => {
            this.elements.bubble.classList.remove('show');
        }, 2000);
    }

    _getStressColor(value) {
        if (value > 80) return '#ef4444';
        if (value > 50) return '#f59e0b';
        return '#10b981';
    }
}

class InputSystem {
    constructor(handlers) {
        this.handlers = handlers;
        this.locked = false;
        this._bind();
    }

    _bind() {
        const events = ['touchstart', 'click'];
        const btnCode = document.getElementById('btn-code');
        const btnSleep = document.getElementById('btn-sleep');

        events.forEach(evt => {
            btnCode.addEventListener(evt, (e) => this._handle(e, 'CODE'), { passive: false });
            btnSleep.addEventListener(evt, (e) => this._handle(e, 'SLEEP'), { passive: false });
        });
    }

    _handle(e, action) {
        e.preventDefault();
        if (this.locked) return;
        
        this.locked = true;
        setTimeout(() => this.locked = false, 50);
        
        if (window.navigator.vibrate) window.navigator.vibrate(CONFIG.VIBRATION_PATTERN);
        
        this.handlers.onAction(action);
    }
}

class Game {
    constructor() {
        this.store = new GameState();
        this.renderer = new DOMRenderer();
        
        this.input = new InputSystem({
            onAction: (type) => this.store.performAction(type)
        });

        this._bindEvents();
        this._refresh();
    }

    _bindEvents() {
        this.store.on('update', () => this._refresh());
        this.store.on('level_up', () => this.renderer.triggerLevelUpEffect());
        this.store.on('burnout_start', () => this.renderer.setBurnoutState(true));
        this.store.on('burnout_end', () => this.renderer.setBurnoutState(false));
        
        this.store.on('action_code', () => {
            if (Math.random() > 0.8) this._sayRandomQuote();
        });
        
        this.store.on('action_sleep', () => {
            this.renderer.showBubble("Refreshing...");
        });
        
        this.store.on('error', (msg) => this.renderer.showBubble(msg));
    }

    _refresh() {
        const state = this.store.get();
        const titleData = this.store.getTitleData();
        this.renderer.render(state, titleData);
    }

    _sayRandomQuote() {
        const quote = CONFIG.QUOTES[Math.floor(Math.random() * CONFIG.QUOTES.length)];
        this.renderer.showBubble(quote);
    }
}

document.addEventListener('DOMContentLoaded', () => new Game());
