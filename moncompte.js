// ===============================
// ATTENTE DU CHARGEMENT DU DOM
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    
    // Récupération du Canvas et du Contexte 2D
    const canvas = document.getElementById("canvas");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");

    // Récupération des commandes de l'interface
    const colorPicker = document.getElementById("colorPicker");
    const brushSize = document.getElementById("brushSize");

    const pencilBtn = document.getElementById("pencil");
    const eraserBtn = document.getElementById("eraser");
    const newCanvasBtn = document.getElementById("newCanvasBtn");
    const sidebarNewCanvas = document.getElementById("sidebarNewCanvas");
    const saveBtn = document.getElementById("saveBtn");
    const clearBtn = document.getElementById("clear");
    const undoBtn = document.getElementById("undo");
    const redoBtn = document.getElementById("redo");
    const downloadBtn = document.getElementById("download");

    // Couleur de fond (fond crème du thème Golden Hour)
    const CANVAS_BG_COLOR = "#fcfaf7";

    let isDrawing = false;
    let isEraser = false;

    // ===============================
    // INITIALISATION DE LA TOILE
    // ===============================

    function setupCanvas() {
        // Aligne la résolution du canvas sur sa taille réelle affichée à l'écran
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width || 1200;
        canvas.height = 600;

        // Configuration visuelle du trait
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Peindre le fond initial
        ctx.fillStyle = CANVAS_BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    setupCanvas();

    // ===============================
    // CALCUL PRÉCIS DU CURSEUR
    // ===============================

    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        
        let clientX = e.clientX;
        let clientY = e.clientY;

        // Support Écran Tactile (Mobile / Tablette)
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        // Calcul avec mise à l'échelle
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    // ===============================
    // TRAÇAGE ET DESSIN
    // ===============================

    function startDrawing(e) {
        isDrawing = true;
        const pos = getCoordinates(e);

        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);

        ctx.lineWidth = brushSize ? brushSize.value : 5;
        ctx.strokeStyle = isEraser ? CANVAS_BG_COLOR : (colorPicker ? colorPicker.value : "#1a1412");
    }

    function draw(e) {
        if (!isDrawing) return;

        const pos = getCoordinates(e);

        ctx.lineWidth = brushSize ? brushSize.value : 5;
        ctx.strokeStyle = isEraser ? CANVAS_BG_COLOR : (colorPicker ? colorPicker.value : "#1a1412");

        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }

    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            ctx.beginPath();
            saveState(); // Sauvegarde le trait dans l'historique
        }
    }

    // ===============================
    // ÉVÉNEMENTS (SOURIS & TACTILE)
    // ===============================

    // Souris
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    // Tactile
    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        startDrawing(e);
    });
    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        draw(e);
    });
    canvas.addEventListener("touchend", stopDrawing);

    // ===============================
    // GESTION DES OUTILS
    // ===============================

    if (pencilBtn) {
        pencilBtn.addEventListener("click", () => {
            isEraser = false;
            pencilBtn.classList.add("active");
            if (eraserBtn) eraserBtn.classList.remove("active");
        });
    }

    if (eraserBtn) {
        eraserBtn.addEventListener("click", () => {
            isEraser = true;
            eraserBtn.classList.add("active");
            if (pencilBtn) pencilBtn.classList.remove("active");
        });
    }

    if (colorPicker) {
        colorPicker.addEventListener("change", () => {
            isEraser = false;
            if (pencilBtn) pencilBtn.classList.add("active");
            if (eraserBtn) eraserBtn.classList.remove("active");
        });
    }

    // ===============================
    // NOUVELLE TOILE / CLEAR
    // ===============================

    function resetCanvas() {
        ctx.fillStyle = CANVAS_BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function createNewCanvas() {
        if (confirm("Voulez-vous créer une nouvelle canvas ? Le dessin actuel sera effacé.")) {
            resetCanvas();
            history = [];
            historyStep = -1;
            saveState();
        }
    }

    if (newCanvasBtn) newCanvasBtn.addEventListener("click", createNewCanvas);
    if (sidebarNewCanvas) {
        sidebarNewCanvas.addEventListener("click", (e) => {
            e.preventDefault();
            createNewCanvas();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (confirm("Effacer tout le dessin ?")) {
                resetCanvas();
                saveState();
            }
        });
    }

    // ===============================
    // HISTORIQUE (ANNULER / REFAIRE)
    // ===============================

    let history = [];
    let historyStep = -1;

    function saveState() {
        historyStep++;
        if (historyStep < history.length) {
            history.length = historyStep;
        }
        history.push(canvas.toDataURL());
    }

    function restoreState(index) {
        const img = new Image();
        img.src = history[index];
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }

    if (undoBtn) {
        undoBtn.addEventListener("click", () => {
            if (historyStep > 0) {
                historyStep--;
                restoreState(historyStep);
            }
        });
    }

    if (redoBtn) {
        redoBtn.addEventListener("click", () => {
            if (historyStep < history.length - 1) {
                historyStep++;
                restoreState(historyStep);
            }
        });
    }

    // ===============================
    // TÉLÉCHARGEMENT
    // ===============================

    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const link = document.createElement("a");
            link.download = "mon-dessin.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        });
    }

    // ===============================
    // SAUVEGARDE BASE DE DONNÉES
    // ===============================

    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            const imageData = canvas.toDataURL("image/png");

            try {
                const response = await fetch("/api/sauvegarder-dessin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: imageData })
                });

                if (response.ok) {
                    alert("Dessin enregistré dans la base de données ! 🎨");
                } else {
                    alert("Erreur lors de la sauvegarde.");
                }
            } catch (error) {
                alert("Image capturée ! (API backend non joignable)");
            }
        });
    }

    // Sauvegarder l'état vierge de départ
    saveState();
});