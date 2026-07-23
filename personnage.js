// personnage.js - Assistant virtuel Studio Créatif
document.addEventListener("DOMContentLoaded", () => {
    // ===============================
    // CONFIGURATION DU PERSONNAGE
    // ===============================
    const config = {
        // Émotions et expressions
        emotions: {
            normal: { eyes: '👀', mouth: '👄', color: '#c98a3e' },
            happy: { eyes: '😊', mouth: '😃', color: '#e3a544' },
            sad: { eyes: '😢', mouth: '😔', color: '#8a6d4e' },
            surprised: { eyes: '😮', mouth: '😲', color: '#f6c667' },
            thinking: { eyes: '🤔', mouth: '🧐', color: '#d48b47' },
            excited: { eyes: '🌟', mouth: '🤩', color: '#ffd700' },
            sleepy: { eyes: '😴', mouth: '💤', color: '#a67c5b' },
            wink: { eyes: '😉', mouth: '😏', color: '#c98a3e' }
        },
        
        // Messages du personnage
        messages: {
            welcome: [
                "Bonjour ! Je suis Pépito, ton assistant créatif ! 🎨",
                "Prêt à créer quelque chose de magnifique ? ✨",
                "Laisse ton imagination s'envoler ! 🌟",
                "Un nouveau dessin ? Je suis tout excité ! 🎉"
            ],
            save: [
                "Superbe création ! Je l'ai bien gardée ! 💾",
                "Ton chef-d'œuvre est en sécurité ! 🖼️",
                "Magnifique ! J'adore ce que tu as fait ! 😍",
                "Encore un super dessin ! Bravo ! 👏"
            ],
            undo: [
                "Oups, je retire ça ! 😅",
                "Annulé ! Pas de panique ! 👍",
                "Et hop, un pas en arrière ! 🔄"
            ],
            redo: [
                "Et voilà, rétabli ! ✨",
                "Comme par magie, c'est revenu ! 🪄",
                "Parfait, je l'ai refait ! 💪"
            ],
            clear: [
                "Nouvelle toile, nouvelle inspiration ! 🎨",
                "Un nouveau départ, c'est excitant ! 🌈",
                "La toile est prête pour tes idées ! ✨"
            ],
            import: [
                "J'adore cette image ! Qu'en feras-tu ? 🖼️",
                "Une image parfaite pour créer ! 🌟",
                "Je suis curieux de voir ce que tu vas faire ! 🤔"
            ],
            download: [
                "Ton œuvre est prête à être partagée ! 📥",
                "Un chef-d'œuvre à garder précieusement ! 💎",
                "Tu peux être fier de toi ! 🌟"
            ],
            error: [
                "Oups, quelque chose s'est mal passé... 😅",
                "Pas de panique, réessayons ! 💪",
                "Erreur technique, mais je suis là ! 🔧"
            ],
            idle: [
                "Un petit café ? ☕",
                "Que vais-je dessiner aujourd'hui ? 🤔",
                "Je t'attends, prêt à créer ! 🎨",
                "Tu as une idée en tête ? ✨"
            ],
            night: [
                "Il est tard, tu ne devrais pas dormir ? 🌙",
                "L'inspiration vient parfois la nuit... 🌃",
                "Une dernière création avant de dormir ? 😴"
            ],
            morning: [
                "Bonjour ! Prêt pour une nouvelle journée créative ? ☀️",
                "Le soleil est levé, les idées aussi ! 🌅",
                "Un nouveau jour, une nouvelle œuvre ! 🌄"
            ]
        }
    };

    // ===============================
    // CRÉATION DU PERSONNAGE
    // ===============================
    const characterHTML = `
        <div id="character-container">
            <!-- Bulle de dialogue -->
            <div id="character-bubble" class="hidden">
                <div id="character-text"></div>
                <div class="bubble-tail"></div>
            </div>
            
            <!-- Corps du personnage -->
            <div id="character-body" style="display: none;">
                <div id="character">
                    <!-- Tête -->
                    <div id="head">
                        <div id="face">
                            <div id="eyes-container">
                                <div class="eye" id="left-eye">${config.emotions.normal.eyes}</div>
                                <div class="eye" id="right-eye">${config.emotions.normal.eyes}</div>
                            </div>
                            <div id="mouth">${config.emotions.normal.mouth}</div>
                            <div id="cheeks">
                                <div class="cheek"></div>
                                <div class="cheek"></div>
                            </div>
                        </div>
                        <!-- Accessoires -->
                        <div id="accessories">
                            <div id="hat" class="hidden">🧢</div>
                            <div id="glasses" class="hidden">👓</div>
                        </div>
                    </div>
                    
                    <!-- Corps -->
                    <div id="torso">
                        <div id="body-color" style="background: ${config.emotions.normal.color};"></div>
                        <div id="arms">
                            <div class="arm" id="left-arm">✋</div>
                            <div class="arm" id="right-arm">✋</div>
                        </div>
                    </div>
                    
                    <!-- Pieds -->
                    <div id="feet">
                        <div class="foot"></div>
                        <div class="foot"></div>
                    </div>
                </div>
            </div>
            
            <!-- Bouton de contrôle -->
            <button id="character-toggle" aria-label="Afficher/cacher l'assistant">
                <span id="toggle-icon">💬</span>
            </button>
        </div>
    `;

    // Ajouter le personnage à la page
    const style = document.createElement('style');
    style.textContent = `
        /* ===============================
           PERSONNAGE - STYLES
        =============================== */
        #character-container {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 12px;
        }

        /* BULLE DE DIALOGUE */
        #character-bubble {
            background: #fff;
            border-radius: 18px;
            padding: 16px 20px;
            max-width: 280px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            position: relative;
            margin-bottom: 4px;
            animation: bubbleIn 0.4s ease;
            border: 2px solid #c98a3e;
        }

        #character-bubble.hidden {
            display: none;
        }

        @keyframes bubbleIn {
            from {
                opacity: 0;
                transform: translateY(20px) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        @keyframes bubbleOut {
            from {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            to {
                opacity: 0;
                transform: translateY(20px) scale(0.9);
            }
        }

        #character-bubble.bubble-out {
            animation: bubbleOut 0.3s ease forwards;
        }

        #character-text {
            font-family: 'Montserrat', sans-serif;
            font-size: 13px;
            line-height: 1.6;
            color: #4a2f17;
        }

        .bubble-tail {
            position: absolute;
            bottom: -18px;
            right: 30px;
            width: 0;
            height: 0;
            border-left: 12px solid transparent;
            border-right: 12px solid transparent;
            border-top: 18px solid #fff;
            filter: drop-shadow(0 4px 4px rgba(0,0,0,0.05));
        }

        .bubble-tail::before {
            content: '';
            position: absolute;
            top: -20px;
            left: -14px;
            width: 28px;
            height: 20px;
            border-left: 2px solid #c98a3e;
            border-right: 2px solid #c98a3e;
            border-bottom: 2px solid #c98a3e;
            border-radius: 0 0 50% 50%;
            border-top: none;
        }

        /* ===== PERSONNAGE ===== */
        #character-body {
            cursor: pointer;
            transition: transform 0.3s ease;
            position: relative;
        }

        #character-body:hover {
            transform: scale(1.05) rotate(-2deg);
        }

        #character {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 120px;
            user-select: none;
        }

        /* TÊTE */
        #head {
            position: relative;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #f5e6d3;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border: 3px solid #dcc9b8;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Visage */
        #face {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 15px 10px 12px;
        }

        #eyes-container {
            display: flex;
            gap: 18px;
            margin-top: 6px;
        }

        .eye {
            font-size: 22px;
            line-height: 1;
            transition: all 0.3s ease;
            animation: blink 3s ease-in-out infinite;
        }

        @keyframes blink {
            0%, 94%, 100% { transform: scaleY(1); }
            96%, 98% { transform: scaleY(0.1); }
        }

        #mouth {
            font-size: 20px;
            margin-top: 2px;
            transition: all 0.3s ease;
        }

        #cheeks {
            position: absolute;
            bottom: 10px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            padding: 0 6px;
            pointer-events: none;
        }

        .cheek {
            width: 14px;
            height: 10px;
            border-radius: 50%;
            background: rgba(255, 150, 150, 0.4);
            opacity: 0.6;
        }

        /* Accessoires */
        #accessories {
            position: absolute;
            top: -6px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: center;
            pointer-events: none;
            font-size: 28px;
        }

        #hat, #glasses {
            transition: all 0.5s ease;
        }

        #hat.hidden, #glasses.hidden {
            display: none;
        }

        #hat:not(.hidden), #glasses:not(.hidden) {
            animation: accessoryAppear 0.5s ease;
        }

        @keyframes accessoryAppear {
            from {
                transform: translateY(-20px) scale(0);
                opacity: 0;
            }
            to {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
        }

        /* TORSE */
        #torso {
            position: relative;
            width: 50px;
            height: 45px;
            margin-top: -8px;
            border-radius: 0 0 20px 20px;
            background: #c98a3e;
            border: 3px solid #dcc9b8;
            border-top: none;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #body-color {
            width: 60%;
            height: 60%;
            border-radius: 50%;
            background: #c98a3e;
            transition: background 0.5s ease;
        }

        /* BRAS */
        #arms {
            position: absolute;
            top: -5px;
            left: -20px;
            right: -20px;
            display: flex;
            justify-content: space-between;
            pointer-events: none;
        }

        .arm {
            font-size: 18px;
            animation: armWave 2s ease-in-out infinite;
        }

        #left-arm {
            animation-delay: 0.2s;
            transform: rotate(-15deg);
        }

        #right-arm {
            animation-delay: 0.6s;
            transform: rotate(15deg);
        }

        @keyframes armWave {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(20deg); }
        }

        /* PIEDS */
        #feet {
            display: flex;
            gap: 18px;
            margin-top: -2px;
        }

        .foot {
            width: 16px;
            height: 8px;
            border-radius: 0 0 8px 8px;
            background: #dcc9b8;
            border: 2px solid #c0a894;
            border-top: none;
        }

        /* BOUTON DE BASCULE */
        #character-toggle {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #c98a3e, #e3a544);
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(201, 138, 62, 0.4);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }

        #character-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 25px rgba(201, 138, 62, 0.5);
        }

        #character-toggle:active {
            transform: scale(0.9);
        }

        /* PETIT BADGE DE NOTIFICATION */
        #character-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #f44336;
            color: white;
            font-size: 10px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            animation: pulse 1.5s ease-in-out infinite;
        }

        #character-badge.hidden {
            display: none;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        /* POINTS DE PENSEE */
        .thought-dots {
            position: absolute;
            right: -20px;
            top: -10px;
            display: flex;
            gap: 4px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .thought-dots.visible {
            opacity: 1;
        }

        .thought-dots span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #c98a3e;
            animation: dotPulse 1s ease-in-out infinite;
        }

        .thought-dots span:nth-child(2) { animation-delay: 0.2s; }
        .thought-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
            0%, 100% { transform: scale(0.8); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 1; }
        }

        /* RESPONSIVE */
        @media (max-width: 640px) {
            #character-container {
                bottom: 15px;
                right: 15px;
            }
            
            #character {
                width: 90px;
            }
            
            #head {
                width: 60px;
                height: 60px;
            }
            
            .eye {
                font-size: 16px;
            }
            
            #mouth {
                font-size: 14px;
            }
            
            #torso {
                width: 38px;
                height: 35px;
            }
            
            #character-bubble {
                max-width: 200px;
                font-size: 12px;
                padding: 12px 16px;
            }
            
            #character-toggle {
                width: 44px;
                height: 44px;
                font-size: 20px;
            }
            
            .arm {
                font-size: 14px;
            }
        }

        @media (max-width: 480px) {
            #character-bubble {
                max-width: 160px;
                font-size: 11px;
                padding: 10px 14px;
            }
            
            #head {
                width: 50px;
                height: 50px;
            }
            
            .eye {
                font-size: 14px;
            }
            
            #mouth {
                font-size: 12px;
            }
            
            #torso {
                width: 32px;
                height: 28px;
            }
        }
    `;

    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', characterHTML);

    // ===============================
    // LOGIQUE DU PERSONNAGE
    // ===============================
    const character = {
        // Éléments DOM
        container: document.getElementById('character-container'),
        body: document.getElementById('character-body'),
        bubble: document.getElementById('character-bubble'),
        text: document.getElementById('character-text'),
        toggleBtn: document.getElementById('character-toggle'),
        leftEye: document.getElementById('left-eye'),
        rightEye: document.getElementById('right-eye'),
        mouth: document.getElementById('mouth'),
        bodyColor: document.getElementById('body-color'),
        hat: document.getElementById('hat'),
        glasses: document.getElementById('glasses'),
        badge: document.getElementById('character-badge'),
        
        // État
        isVisible: true,
        currentEmotion: 'normal',
        messageTimeout: null,
        isTyping: false,
        idleInterval: null,
        conversationHistory: [],
        
        // Initialisation
        init() {
            this.body.style.display = 'block';
            this.setEmotion('normal');
            this.setupListeners();
            this.startIdleMode();
            
            // Salutation après 1.5s
            setTimeout(() => {
                this.say(config.messages.welcome);
            }, 1500);
            
            // Vérifier l'heure pour les messages spéciaux
            this.checkTimeOfDay();
            
            console.log('🎭 Pépito l\'assistant est prêt !');
        },
        
        // Vérifier l'heure
        checkTimeOfDay() {
            const hour = new Date().getHours();
            if (hour >= 22 || hour < 6) {
                setTimeout(() => {
                    this.say(config.messages.night);
                }, 5000);
            } else if (hour >= 6 && hour < 10) {
                setTimeout(() => {
                    this.say(config.messages.morning);
                }, 5000);
            }
        },
        
        // Configurer les écouteurs
        setupListeners() {
            // Clic sur le personnage
            this.body.addEventListener('click', () => {
                this.interact();
            });
            
            // Clic sur le bouton
            this.toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
            
            // Clic en dehors pour fermer la bulle
            document.addEventListener('click', (e) => {
                if (!this.container.contains(e.target)) {
                    this.hideBubble();
                }
            });
            
            // Écouter les événements personnalisés
            document.addEventListener('character:say', (e) => {
                if (e.detail && e.detail.message) {
                    this.say(e.detail.message, e.detail.emotion);
                }
            });
            
            document.addEventListener('character:emotion', (e) => {
                if (e.detail && e.detail.emotion) {
                    this.setEmotion(e.detail.emotion);
                }
            });
            
            // Raccourci clavier pour interagir
            document.addEventListener('keydown', (e) => {
                if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
                    this.interact();
                }
            });
        },
        
        // Basculer l'affichage
        toggle() {
            if (this.body.style.display === 'none') {
                this.body.style.display = 'block';
                this.isVisible = true;
                this.toggleBtn.innerHTML = '💬';
                this.say(config.messages.welcome);
            } else {
                this.body.style.display = 'none';
                this.isVisible = false;
                this.hideBubble();
                this.toggleBtn.innerHTML = '👻';
            }
        },
        
        // Interagir avec le personnage
        interact() {
            const interactions = [
                "Salut ! Tu veux créer quelque chose ? 🎨",
                "Je suis tout à toi ! Qu'est-ce qu'on fait ? ✨",
                "Tu as une idée en tête ? Dis-moi ! 💡",
                "J'adore quand tu dessines ! Continue ! 🌟",
                "Un petit conseil ? Laisse parler ton cœur ! ❤️",
                "Tu es un véritable artiste ! 👨‍🎨",
                "Et si on essayait une nouvelle couleur ? 🎨",
                "La créativité n'a pas de limites ! 🚀"
            ];
            
            // Émotions aléatoires
            const emotions = ['happy', 'excited', 'thinking', 'wink'];
            const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
            
            this.setEmotion(randomEmotion);
            this.say(interactions[Math.floor(Math.random() * interactions.length)]);
        },
        
        // Parler
        say(message, emotion = null) {
            if (!message) return;
            
            // Si c'est un tableau, choisir un message aléatoire
            if (Array.isArray(message)) {
                message = message[Math.floor(Math.random() * message.length)];
            }
            
            // Appliquer l'émotion si spécifiée
            if (emotion) {
                this.setEmotion(emotion);
            }
            
            // Afficher la bulle
            this.showBubble();
            
            // Effet de frappe
            this.typeMessage(message);
            
            // Ajouter à l'historique
            this.conversationHistory.push(message);
            if (this.conversationHistory.length > 20) {
                this.conversationHistory.shift();
            }
            
            // Réinitialiser le timer d'inactivité
            this.resetIdleTimer();
        },
        
        // Effet de frappe
        typeMessage(message) {
            this.isTyping = true;
            this.text.textContent = '';
            
            let index = 0;
            const speed = 30 + Math.random() * 20;
            
            const interval = setInterval(() => {
                if (index < message.length) {
                    this.text.textContent += message.charAt(index);
                    index++;
                } else {
                    clearInterval(interval);
                    this.isTyping = false;
                }
            }, speed);
        },
        
        // Afficher la bulle
        showBubble() {
            this.bubble.classList.remove('hidden', 'bubble-out');
            // Réinitialiser l'animation
            this.bubble.style.animation = 'none';
            requestAnimationFrame(() => {
                this.bubble.style.animation = 'bubbleIn 0.4s ease';
            });
        },
        
        // Cacher la bulle
        hideBubble() {
            if (!this.bubble.classList.contains('hidden')) {
                this.bubble.classList.add('bubble-out');
                setTimeout(() => {
                    this.bubble.classList.add('hidden');
                    this.bubble.classList.remove('bubble-out');
                }, 300);
            }
        },
        
        // Changer l'émotion
        setEmotion(emotion) {
            if (!config.emotions[emotion]) return;
            
            const emo = config.emotions[emotion];
            this.currentEmotion = emotion;
            
            // Mettre à jour les yeux et la bouche
            this.leftEye.textContent = emo.eyes;
            this.rightEye.textContent = emo.eyes;
            this.mouth.textContent = emo.mouth;
            
            // Mettre à jour la couleur du corps
            this.bodyColor.style.background = emo.color;
            
            // Animation du visage
            this.headAnimation(emotion);
        },
        
        // Animation de la tête
        headAnimation(emotion) {
            const head = document.getElementById('head');
            
            switch(emotion) {
                case 'happy':
                    head.style.transform = 'rotate(-3deg) scale(1.02)';
                    break;
                case 'sad':
                    head.style.transform = 'rotate(3deg) scale(0.98)';
                    break;
                case 'surprised':
                    head.style.transform = 'scale(1.05)';
                    break;
                case 'thinking':
                    head.style.transform = 'rotate(5deg)';
                    break;
                case 'excited':
                    head.style.transform = 'rotate(-5deg) scale(1.04)';
                    break;
                case 'sleepy':
                    head.style.transform = 'rotate(2deg) scale(0.95)';
                    break;
                default:
                    head.style.transform = 'rotate(0deg) scale(1)';
            }
        },
        
        // Mode inactif
        startIdleMode() {
            this.idleInterval = setInterval(() => {
                if (!this.isVisible || this.isTyping || this.bubble.classList.contains('hidden')) {
                    return;
                }
                
                // 20% de chance de parler en idle
                if (Math.random() < 0.2) {
                    const idleMessages = config.messages.idle;
                    this.say(idleMessages);
                }
            }, 15000);
        },
        
        resetIdleTimer() {
            // Réinitialiser le timer d'inactivité
            clearTimeout(this.idleTimeout);
            this.idleTimeout = setTimeout(() => {
                if (!this.bubble.classList.contains('hidden')) {
                    this.hideBubble();
                }
            }, 8000);
        },
        
        // Accéder aux messages
        getMessage(category) {
            if (config.messages[category]) {
                const messages = config.messages[category];
                return Array.isArray(messages) ? messages[Math.floor(Math.random() * messages.length)] : messages;
            }
            return null;
        }
    };

    // ===============================
    // ÉVÉNEMENTS GLOBAUX POUR LE PERSONNAGE
    // ===============================
    
    // Sauvegarde
    document.addEventListener('drawing:saved', () => {
        character.say(config.messages.save, 'happy');
    });
    
    // Annulation
    document.addEventListener('drawing:undo', () => {
        character.say(config.messages.undo, 'thinking');
    });
    
    // Rétablissement
    document.addEventListener('drawing:redo', () => {
        character.say(config.messages.redo, 'excited');
    });
    
    // Effacement
    document.addEventListener('drawing:cleared', () => {
        character.say(config.messages.clear, 'surprised');
    });
    
    // Import d'image
    document.addEventListener('image:imported', () => {
        character.say(config.messages.import, 'excited');
    });
    
    // Téléchargement
    document.addEventListener('drawing:downloaded', () => {
        character.say(config.messages.download, 'happy');
    });
    
    // Erreur
    document.addEventListener('error:occured', () => {
        character.say(config.messages.error, 'sad');
    });

    // ===============================
    // INITIALISATION
    // ===============================
    character.init();
    
    // Exposer l'objet globalement
    window.Pepito = character;
    
    // ===============================
    // INTERACTIONS AVEC LE DESSIN
    // ===============================
    // Surveiller les actions de dessin
    const canvas = document.getElementById('canvas');
    if (canvas) {
        let lastInteraction = Date.now();
        
        canvas.addEventListener('mousedown', () => {
            lastInteraction = Date.now();
            character.hideBubble();
        });
        
        canvas.addEventListener('touchstart', () => {
            lastInteraction = Date.now();
            character.hideBubble();
        });
        
        // Réagir après un long moment sans interaction
        setInterval(() => {
            if (Date.now() - lastInteraction > 30000) {
                // Après 30s d'inactivité sur le canvas
                if (Math.random() < 0.15) {
                    character.say(config.messages.idle, 'sleepy');
                }
            }
        }, 60000);
    }
    
    console.log('🎭 Pépito est prêt à t\'accompagner !');
    console.log('💡 Astuce : Appuie sur "?" pour interagir avec Pépito');
});