// personnage.js - Version avec réactions au tutoriel
document.addEventListener("DOMContentLoaded", function() {
    // Créer le conteneur
    const container = document.createElement('div');
    container.id = 'character-container';
    container.innerHTML = `
        <div id="character-bubble" style="display:none;background:white;border-radius:16px;padding:12px 18px;max-width:220px;box-shadow:0 8px 30px rgba(0,0,0,0.12);border:2px solid #c98a3e;font-family:'Montserrat',sans-serif;font-size:13px;color:#4a2f17;margin-bottom:8px;">
            <div id="character-text">Bonjour ! 🎨</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;cursor:pointer;">
            <div id="character-emoji" style="font-size:48px;animation:bounce 2s ease-in-out infinite;">🧑‍🎨</div>
            <button id="character-toggle" style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#c98a3e,#e3a544);border:none;color:white;font-size:22px;cursor:pointer;box-shadow:0 4px 15px rgba(201,138,62,0.4);">💬</button>
        </div>
        <style>
            #character-container {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 8px;
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }
            @media (max-width:640px) {
                #character-container { bottom: 15px; right: 15px; }
                #character-emoji { font-size: 36px; }
                #character-bubble { max-width: 160px; font-size: 12px; padding: 10px 14px; }
                #character-toggle { width: 40px; height: 40px; font-size: 18px; }
            }
        </style>
    `;
    document.body.appendChild(container);

    // Éléments
    const bubble = document.getElementById('character-bubble');
    const text = document.getElementById('character-text');
    const toggle = document.getElementById('character-toggle');
    const emoji = document.getElementById('character-emoji');
    
    const messages = [
        "Bonjour ! Prêt à créer ? 🎨",
        "J'adore ce que tu fais ! 🌟",
        "Un nouveau dessin ? Je suis excité ! ✨",
        "Tu es un véritable artiste ! 👨‍🎨",
        "Laisse parler ton imagination ! 💡",
        "Superbe travail ! Continue ! 💪",
        "Une petite pause ? ☕",
        "Je suis là si tu as besoin d'aide ! 🤗",
        "Magnifique création ! 😍",
        "Tu as du talent, c'est certain ! 🌟"
    ];

    const tutorialMessages = [
        "🎨 La couleur, c'est la vie !",
        "📏 La taille parfaite !",
        "🖌️ J'adore ce pinceau !",
        "✏️ Le crayon, mon préféré !",
        "🧹 La gomme magique !",
        "↩️ Ctrl+Z, le meilleur ami des artistes !",
        "↪️ Ctrl+Y, comme par magie !",
        "🖼️ Importe une image, c'est amusant !",
        "💾 Sauvegarde ton chef-d'œuvre !",
        "📥 Télécharge et partage !"
    ];

    let timeout = null;

    function showMessage(msg) {
        text.textContent = msg;
        bubble.style.display = 'block';
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            bubble.style.display = 'none';
        }, 4000);
        
        // Changer l'emoji
        const emojis = ['🧑‍🎨', '🎨', '✨', '🌟', '💪', '🎉', '😊', '🤗'];
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    }

    function interact() {
        showMessage(messages[Math.floor(Math.random() * messages.length)]);
    }

    // Clic sur le personnage
    emoji.addEventListener('click', interact);
    
    // Clic sur le bouton
    let visible = true;
    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        if (visible) {
            document.querySelector('#character-container > div:first-child').style.display = 'none';
            emoji.style.display = 'none';
            visible = false;
            toggle.textContent = '👻';
        } else {
            document.querySelector('#character-container > div:first-child').style.display = 'block';
            emoji.style.display = 'block';
            visible = true;
            toggle.textContent = '💬';
            showMessage("Je suis de retour ! 🎉");
        }
    });

    // Raccourci clavier
    document.addEventListener('keydown', function(e) {
        if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
            interact();
        }
    });

    // ===============================
    // ÉVÉNEMENTS DU DESSIN
    // ===============================
    document.addEventListener('drawing:saved', function() {
        showMessage("Superbe création ! Sauvegardé ! 💾");
    });
    
    document.addEventListener('drawing:undo', function() {
        showMessage("Annulé ! Pas de panique ! 👍");
    });
    
    document.addEventListener('drawing:redo', function() {
        showMessage("Et voilà, rétabli ! ✨");
    });
    
    document.addEventListener('drawing:cleared', function() {
        showMessage("Nouvelle toile, nouvelle inspiration ! 🎨");
    });

    document.addEventListener('image:imported', function() {
        showMessage("J'adore cette image ! Qu'en feras-tu ? 🖼️");
    });

    document.addEventListener('drawing:downloaded', function() {
        showMessage("Ton œuvre est prête à être partagée ! 📥");
    });

    // ===============================
    // ÉVÉNEMENTS DU TUTORIEL
    // ===============================
    document.addEventListener('tutorial:start', function() {
        showMessage("🎓 C'est parti pour le tutoriel ! Je suis là pour t'aider !");
    });

    document.addEventListener('tutorial:step', function(e) {
        const step = e.detail?.step || 0;
        if (tutorialMessages[step]) {
            setTimeout(() => showMessage(tutorialMessages[step]), 800);
        }
    });

    document.addEventListener('tutorial:end', function() {
        showMessage("🎉 Bravo ! Tu es prêt à créer des merveilles !");
    });

    // Message de bienvenue
    setTimeout(interact, 2000);

    console.log('🧑‍🎨 Pépito le personnage est chargé ! Appuie sur "?" pour interagir.');
});