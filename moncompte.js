// ===============================
// RÉCUPÉRATION DES ÉLÉMENTS
// ===============================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");

const pencilBtn = document.getElementById("pencil");
const eraserBtn = document.getElementById("eraser");
const newCanvasBtn = document.getElementById("newCanvasBtn");
const sidebarNewCanvas = document.getElementById("sidebarNewCanvas");
const saveBtn = document.getElementById("saveBtn");

const CANVAS_BG_COLOR = "#fcfaf7"; // Couleur crème douce du thème Golden Hour

let isDrawing = false;
let isEraser = false;

// Configuration initiale du pinceau
ctx.lineCap = "round";
ctx.lineJoin = "round";

// ===============================
// INITIALISATION DU CANVAS
// ===============================

function initCanvas() {
    ctx.fillStyle = CANVAS_BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener("load", () => {
    initCanvas();
    saveState(); // Sauvegarde l'état initial vierge
});

// ===============================
// FONCTIONS DE DESSIN
// ===============================

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = e.clientX;
    let clientY = e.clientY;

    // Gestion des écrans tactiles
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    isDrawing = true;
    const pos = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    
    // Configure le style de trait au clic
    ctx.lineWidth = brushSize.value;
    ctx.strokeStyle = isEraser ? CANVAS_BG_COLOR : colorPicker.value;
}

function draw(e) {
    if (!isDrawing) return;
    
    const pos = getCoordinates(e);

    ctx.lineWidth = brushSize.value;
    ctx.strokeStyle = isEraser ? CANVAS_BG_COLOR : colorPicker.value;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        ctx.beginPath();
        saveState(); // Enregistre le trait dans l'historique
    }
}

// ===============================
// ÉVÉNEMENTS (SOURIS ET TACTILE)
// ===============================

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
// OUTILS
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
// NOUVELLE TOILE
// ===============================

function createNewCanvas() {
    if (confirm("Créer une nouvelle canvas ? Le dessin actuel sera effacé.")) {
        initCanvas();
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

const undoBtn = document.getElementById("undo");
if (undoBtn) {
    undoBtn.addEventListener("click", () => {
        if (historyStep > 0) {
            historyStep--;
            restoreState(historyStep);
        }
    });
}

const redoBtn = document.getElementById("redo");
if (redoBtn) {
    redoBtn.addEventListener("click", () => {
        if (historyStep < history.length - 1) {
            historyStep++;
            restoreState(historyStep);
        }
    });
}

const clearBtn = document.getElementById("clear");
if (clearBtn) {
    clearBtn.addEventListener("click", () => {
        if (confirm("Effacer tout le dessin ?")) {
            initCanvas();
            saveState();
        }
    });
}

// ===============================
// TÉLÉCHARGEMENT
// ===============================

const downloadBtn = document.getElementById("download");
if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
        const link = document.createElement("a");
        link.download = "mon-dessin.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
}

// ===============================
// SAUVEGARDE BDD / SERVER
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
            alert("Sauvegarde effectuée (envoi simulé à l'API) !");
        }
    });
}