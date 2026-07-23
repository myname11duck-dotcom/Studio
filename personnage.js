// personnage.js - Assistant virtuel Studio Créatif
(function() {
    'use strict';
    
    document.addEventListener("DOMContentLoaded", () => {
        // ===============================
        // CONFIGURATION DU PERSONNAGE
        // ===============================
        const config = {
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
                    "Magnifique ! J'adore ce que tu as fait ! 😍"
                ],
                undo: [
                    "Oups, je retire ça ! 😅",
                    "Annulé ! Pas de panique ! 👍"
                ],
                redo: [
                    "Et voilà, rétabli ! ✨",
                    "Comme par magie, c'est revenu ! 🪄"
                ],
                clear: [
                    "Nouvelle toile, nouvelle inspiration ! 🎨",
                    "Un nouveau départ, c'est excitant ! 🌈"
                ],
                import: [
                    "J'adore cette image ! Qu'en feras-tu ? 🖼️",
                    "Une image parfaite pour créer ! 🌟"
                ],
                download: [
                    "Ton œuvre est prête à être partagée ! 📥",
                    "Un chef-d'œuvre à garder précieusement ! 💎"
                ],
                idle: [
                    "Un petit café ? ☕",
                    "Que vais-je dessiner aujourd'hui ? 🤔",
                    "Je t'attends, prêt à créer ! 🎨"
                ]
            }
        };

        // ===============================
        // CRÉATION DU PERSONNAGE
        // ===============================
        const characterHTML = `
            <div id="character-container">
                <div id="character-bubble" class="hidden">
                    <div id="character-text"></div>
                    <div class="bubble-tail"></div>
                </div>
                
                <div id="character-body">
                    <div id="character">
                        <div id="head">
                            <div id="face">
                                <div id="eyes-container">
                                    <div class="eye" id="left-eye">${config.emotions.normal.eyes}</div>
                                    <div class="eye" id="right-eye">${config.emotions.normal.eyes}</div>
                                </div>
                                <div id="mouth">${config.emotions.normal.mouth}</div>
                            </div>
                        </div>
                        <div id="torso">
                            <div id="body-color" style="background: ${config.emotions.normal.color};"></div>
                        </div>
                        <div id="feet">
                            <div class="foot"></div>
                            <div class="foot"></div>
                        </div>
                    </div>
                </div>
                
                <button id="character-toggle" aria-label="Afficher/cacher l'assistant">
                    <span id="toggle-icon">💬</span>
                </button>
            </div>
        `;

        // ===============================
        // STYLES DU PERSONNAGE
        // ===============================
        const style = document.createElement('style');
        style.textContent = `
            #character-container {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 12px;
            }

            #character-bubble {
                background: #fff;
                border-radius: 18px;
                padding: 16px 20px;
                max-width: 280px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.15);
                position: relative;
                margin-bottom: 4px;
                border: 2px solid #c98a3e;
                transition: all 0.3s ease;
            }

            #character-bubble.hidden {
                display: none;
            }

            #character-bubble.show {
                animation: bubbleIn 0.4s ease;
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

            #character-body {
                cursor: pointer;
                transition: transform 0.3s ease;
            }

            #character-body:hover {
                transform: scale(1.05);
            }

            #character {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100px;
                user-select: none;
            }

            #head {
                position: relative;
                width: 70px;
                height: 70px;
                border-radius: 50%;
                background: #f5e6d3;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                border: 3px solid #dcc9b8;
                z-index: 2;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s ease;
            }

            #face {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 10px 8px 8px;
            }

            #eyes-container {
                display: flex;
                gap: 16px;
                margin-top: 2px;
            }

            .eye {
                font-size: 20px;
                line-height: 1;
                transition: all 0.3s ease;
            }

            #mouth {
                font-size: 18px;
                margin-top: 0px;
                transition: all 0.3s ease;
            }

            #torso {
                position: relative;
                width: 44px;
                height: 40px;
                margin-top: -6px;
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

            #feet {
                display: flex;
                gap: 14px;
                margin-top: -2px;
            }

            .foot {
                width: 14px;
                height: 7px;
                border-radius: 0 0 8px 8px;
                background: #dcc9b8;
                border: 2px solid #c0a894;
                border-top: none;
            }

            #character-toggle {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: linear-gradient(135deg, #c98a3e, #e3a544);
                border: none;
                color: white;
                font-size: 22px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(201, 138, 62, 0.4);
                transition: all 0.3s ease;
            }

            #character-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(201, 138, 62, 0.5);
            }

            #character-toggle:active {
                transform: scale(0.9);
            }

            @media (max-width: 640px) {
                #character-container {
                    bottom: 15px;
                    right: 15px;
                }
                
                #character {
                    width: 80px;
                }
                
                #head {
                    width: 55px;
                    height: 55px;
                }
                
                .eye {
                    font-size: 16px;
                }
                
                #mouth {
                    font-size: 14px;
                }
                
                #torso {
                    width: 36px;
                    height: 32px;
                }
                
                #character-bubble {
                    max-width: 200px;
                    padding: 12px 16px;
                }
                
                #character-text {
                    font-size: 12px;
                }
                
                #character-toggle {
                    width: 40px;
                    height: 40px;
                    font-size: 18px;
                }
            }

            @media (max-width: 480px) {
                #character-bubble {
                    max-width: 160px;
                    padding: 10px 14px;
                }
                
                #character-text {
                    font-size: 11px;
                }
                
                #head {
                    width: 45px;
                    height: 45px;
                }
                
                .eye {
                    font-size: 14px;
                }
                
                #mouth {
                    font-size: 12px;
                }
                
                #torso {
                    width: 30px;
                    height: 26px;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.insertAdjacentHTML('beforeend', characterHTML);

        // ===============================
        // LOGIQUE DU PERSONNAGE
        // ===============================
        const character = {
            body: document.getElementById('character-body'),
            bubble: document.getElementById('character-bubble'),
            text: document.getElementById('character-text'),
            toggleBtn: document.getElementById('character-toggle'),
            leftEye: document.getElementById('left-eye'),
            rightEye: document.getElementById('right-eye'),
            mouth: document.getElementById('mouth'),
            bodyColor: document.getElementById('body-color'),
            
            isVisible: true,
            messageTimeout: null,
            isTyping: false,
            
            init() {
                this.body.style.display = 'block';
                this.setEmotion('normal');
                this.setupListeners();
                
                setTimeout(() => {
                    this.say(config.messages.welcome);
                }, 1500);
            },
            
            setupListeners() {
                this.body.addEventListener('click', () => {
                    this.interact();
                });
                
                this.toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggle();
                });
                
                document.addEventListener('click', (e) => {
                    if (!document.getElementById('character-container').contains(e.target)) {
                        this.hideBubble();
                    }
                });
                
                // Raccourci clavier
                document.addEventListener('keydown', (e) => {
                    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
                        this.interact();
                    }
                });
            },
            
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
            
            interact() {
                const interactions = [
                    "Salut ! Tu veux créer quelque chose ? 🎨",
                    "Je suis tout à toi ! Qu'est-ce qu'on fait ? ✨",
                    "Tu as une idée en tête ? Dis-moi ! 💡",
                    "J'adore quand tu dessines ! Continue ! 🌟",
                    "Un petit conseil ? Laisse parler ton cœur ! ❤️",
                    "Tu es un véritable artiste ! 👨‍🎨",
                    "Et si on essayait une nouvelle couleur ? 🎨"
                ];
                
                const emotions = ['happy', 'excited', 'thinking', 'wink'];
                const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
                
                this.setEmotion(randomEmotion);
                this.say(interactions[Math.floor(Math.random() * interactions.length)]);
            },
            
            say(message) {
                if (!message) return;
                
                if (Array.isArray(message)) {
                    message = message[Math.floor(Math.random() * message.length)];
                }
                
                this.showBubble();
                this.text.textContent = message;
                this.resetTimer();
            },
            
            showBubble() {
                this.bubble.classList.remove('hidden');
                this.bubble.classList.add('show');
            },
            
            hideBubble() {
                this.bubble.classList.add('hidden');
                this.bubble.classList.remove('show');
            },
            
            resetTimer() {
                clearTimeout(this.messageTimeout);
                this.messageTimeout = setTimeout(() => {
                    this.hideBubble();
                }, 5000);
            },
            
            setEmotion(emotion) {
                if (!config.emotions[emotion]) return;
                
                const emo = config.emotions[emotion];
                
                this.leftEye.textContent = emo.eyes;
                this.rightEye.textContent = emo.eyes;
                this.mouth.textContent = emo.mouth;
                this.bodyColor.style.background = emo.color;
                
                const head = document.getElementById('head');
                switch(emotion) {
                    case 'happy': head.style.transform = 'rotate(-3deg) scale(1.02)'; break;
                    case 'sad': head.style.transform = 'rotate(3deg) scale(0.98)'; break;
                    case 'surprised': head.style.transform = 'scale(1.05)'; break;
                    case 'thinking': head.style.transform = 'rotate(5deg)'; break;
                    case 'excited': head.style.transform = 'rotate(-5deg) scale(1.04)'; break;
                    default: head.style.transform = 'rotate(0deg) scale(1)';
                }
            },
            
            getMessage(category) {
                if (config.messages[category]) {
                    const messages = config.messages[category];
                    return Array.isArray(messages) ? messages[Math.floor(Math.random() * messages.length)] : messages;
                }
                return null;
            }
        };

        // ===============================
        // ÉVÉNEMENTS GLOBAUX
        // ===============================
        document.addEventListener('drawing:saved', () => {
            character.say(config.messages.save);
            character.setEmotion('happy');
        });
        
        document.addEventListener('drawing:undo', () => {
            character.say(config.messages.undo);
            character.setEmotion('thinking');
        });
        
        document.addEventListener('drawing:redo', () => {
            character.say(config.messages.redo);
            character.setEmotion('excited');
        });
        
        document.addEventListener('drawing:cleared', () => {
            character.say(config.messages.clear);
            character.setEmotion('surprised');
        });
        
        document.addEventListener('image:imported', () => {
            character.say(config.messages.import);
            character.setEmotion('excited');
        });
        
        document.addEventListener('drawing:downloaded', () => {
            character.say(config.messages.download);
            character.setEmotion('happy');
        });

        // ===============================
        // INITIALISATION
        // ===============================
        character.init();
        
        // Exposer globalement
        window.Pepito = character;
        
        console.log('🎭 Pépito est prêt !');
    });
})();