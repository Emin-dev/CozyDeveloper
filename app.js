const Game = {
    xp: 0,
    xpNeeded: 100,
    level: 1,
    stress: 0,
    isBurnedOut: false,

    titles: [
        { name: "Junior", skin: "👶", msg: "I broke production..." },
        { name: "Mid-Level", skin: "👨‍💻", msg: "It works on my machine!" },
        { name: "Senior", skin: "🧙‍♂️", msg: "Let's rewrite it in Rust." },
        { name: "Lead", skin: "🧛‍♀️", msg: "I need that ticket by 5pm." },
        { name: "CTO", skin: "👽", msg: "AI will replace us." },
        { name: "God", skin: "⚡", msg: "I dream in binary." }
    ],
    
    prefixes: ["Cyber", "Neon", "Void", "Hyper", "Mega", "Omni"],
    roles: ["Coder", "Hacker", "Mind", "Core", "Flux", "Node"],

    ui: {
        xpBar: document.getElementById('xp-bar'),
        xpText: document.getElementById('xp-text'),
        stressBar: document.getElementById('stress-bar'),
        stressText: document.getElementById('stress-text'),
        level: document.getElementById('level-display'),
        avatar: document.getElementById('avatar'),
        bubble: document.getElementById('speech'),
        btnCode: document.getElementById('btn-code'),
        btnSleep: document.getElementById('btn-sleep')
    },

    init() {
        this.updateUI();
        this.bindEvents();
    },

    bindEvents() {
        const handleAction = (e, type) => {
            e.preventDefault();
            this.action(type);
        };

        ['touchstart', 'click'].forEach(evt => {
            this.ui.btnCode.addEventListener(evt, (e) => handleAction(e, 'code'), { passive: false });
            this.ui.btnSleep.addEventListener(evt, (e) => handleAction(e, 'sleep'), { passive: false });
        });
    },

    action(type) {
        if (this.locked) return;
        this.locked = true;
        setTimeout(() => this.locked = false, 50);

        if (this.isBurnedOut && type === 'code') {
            this.say("I need rest!", 1000);
            return;
        }

        if (type === 'code') {
            const gain = 10 + (this.level * 2); 
            const stressCost = 15;
            
            this.xp += gain;
            this.stress = Math.min(100, this.stress + stressCost);
            
            if (window.navigator.vibrate) window.navigator.vibrate(10);
            
            if (Math.random() > 0.8) this.sayRandomQuote();
        } 
        else if (type === 'sleep') {
            this.stress = Math.max(0, this.stress - 40);
            this.say("Refreshing...");
        }

        this.checkState();
        this.updateUI();
    },

    checkState() {
        if (this.xp >= this.xpNeeded) {
            this.levelUp();
        }

        if (this.stress >= 100 && !this.isBurnedOut) {
            this.triggerBurnout();
        } else if (this.stress < 50 && this.isBurnedOut) {
            this.endBurnout();
        }
    },

    levelUp() {
        this.level++;
        this.xp = 0;
        this.xpNeeded = Math.floor(this.xpNeeded * 1.5);
        this.stress = 0;
        
        this.say("LEVEL UP!");
        this.ui.avatar.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        this.ui.avatar.style.transform = "scale(1.5) rotate(360deg)";
        setTimeout(() => {
            this.ui.avatar.style.transform = "scale(1)";
        }, 400);
    },

    triggerBurnout() {
        this.isBurnedOut = true;
        this.ui.btnCode.classList.add('disabled');
        this.ui.avatar.innerText = "🔥";
        this.say("BURNOUT!");
        document.body.style.background = "#2a0a0a";
    },

    endBurnout() {
        this.isBurnedOut = false;
        this.ui.btnCode.classList.remove('disabled');
        this.updateAvatarSkin();
        this.say("Back online.");
        document.body.style.background = "#0f111a";
    },

    getTitle() {
        if (this.level <= this.titles.length) {
            return this.titles[this.level - 1];
        }
        const p = this.prefixes[(this.level) % this.prefixes.length];
        const r = this.roles[(this.level) % this.roles.length];
        return { 
            name: `${p} ${r} ${this.level}`, 
            skin: this.titles[this.titles.length-1].skin,
            msg: "Systems optimal."
        };
    },

    updateAvatarSkin() {
        if (this.isBurnedOut) return;
        const currentData = this.getTitle();
        this.ui.avatar.innerText = currentData.skin;
    },

    updateUI() {
        const currentData = this.getTitle();
        
        this.ui.level.innerText = `LVL ${this.level} ${currentData.name}`;
        this.ui.xpText.innerText = `${Math.floor(this.xp)} / ${this.xpNeeded}`;
        this.ui.stressText.innerText = `${this.stress}%`;
        
        this.ui.xpBar.style.width = `${(this.xp / this.xpNeeded) * 100}%`;
        this.ui.stressBar.style.width = `${this.stress}%`;
        
        const stressColor = this.stress > 80 ? '#ef4444' : 
                          this.stress > 50 ? '#f59e0b' : '#10b981';
        this.ui.stressBar.style.background = stressColor;

        if (!this.isBurnedOut) this.ui.avatar.innerText = currentData.skin;
    },

    say(text, time = 2000) {
        this.ui.bubble.innerText = text;
        this.ui.bubble.classList.add('show');
        clearTimeout(this.bubbleTimer);
        this.bubbleTimer = setTimeout(() => {
            this.ui.bubble.classList.remove('show');
        }, time);
    },

    sayRandomQuote() {
        const quotes = [
            "Compiling...", "Forgot semicolon", "Git push --force", 
            "It's a feature", "Refactoring...", "Deploying..."
        ];
        this.say(quotes[Math.floor(Math.random() * quotes.length)]);
    }
};

Game.init();
