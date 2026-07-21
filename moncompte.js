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

let drawing = false;
let eraser = false;

ctx.lineCap = "round";
ctx.lineJoin = "round";

// ===============================
// CANVAS RESPONSIVE & INIT
// ===============================

function resizeCanvas() {
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.offsetWidth;
    canvas.height = 700;
    ctx.putImageData(image, 0, 0);
}

function initCanvas() {
    ctx.fillStyle = CANVAS_BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener("load", () => {
    resizeCanvas();
    initCanvas();
    setTimeout(saveState, 200);
});

window.addEventListener("resize", resizeCanvas);

// ===============================
// DÉBUT & FIN DU DESSIN
// ===============================

function startDrawing(e) {
    drawing = true;
    draw(e);
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

// ===============================
// DESSIN
// ===============================

function draw(e) {
    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize.value;
    ctx.strokeStyle = eraser ? CANVAS_BG_COLOR : colorPicker.value;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// Événements Souris
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);
canvas.addEventListener("mousemove", draw);

// Événements Tactiles
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
});

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    draw({ clientX: touch.clientX, clientY: touch.clientY });
});

canvas.addEventListener("touchend", stopDrawing);

// ===============================
// OUTILS ET BROSSE
// ===============================

pencilBtn.addEventListener("click", () => {
    eraser = false;
    pencilBtn.classList.add("active");
    eraserBtn.classList.remove("active");
});

eraserBtn.addEventListener("click", () => {
    eraser = true;
    eraserBtn.classList.add("active");
    pencilBtn.classList.remove("active");
});

brushSize.addEventListener("input", () => {
    canvas.style.cursor = "crosshair";
});

colorPicker.addEventListener("change", () => {
    eraser = false;
    pencilBtn.classList.add("active");
    eraserBtn.classList.remove("active");
});

// ===============================
// CREER UNE NOUVELLE TOILE
// ===============================

function createNewCanvas() {
    if (confirm("Voulez-vous créer une nouvelle toile ? Le dessin en cours sera effacé s'il n'est pas sauvegardé.")) {
        initCanvas();
        history = [];
        historyStep = -1;
        saveState();
    }
}

if (newCanvasBtn) newCanvasBtn.addEventListener("click", createNewCanvas);
if (sidebarNewCanvas) sidebarNewCanvas.addEventListener("click", (e) => {
    e.preventDefault();
    createNewCanvas();
});

// =====================================
// HISTORIQUE (ANNULER / REFAIRE)
// =====================================

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

canvas.addEventListener("mouseup", saveState);
canvas.addEventListener("touchend", saveState);

const undoBtn = document.getElementById("undo");
undoBtn.addEventListener("click", () => {
    if (historyStep > 0) {
        historyStep--;
        restoreState(historyStep);
    }
});

const redoBtn = document.getElementById("redo");
redoBtn.addEventListener("click", () => {
    if (historyStep < history.length - 1) {
        historyStep++;
        restoreState(historyStep);
    }
});

const clearBtn = document.getElementById("clear");
clearBtn.addEventListener("click", () => {
    if (confirm("Effacer tout le dessin ?")) {
        initCanvas();
        saveState();
    }
});

// =====================================
// TÉLÉCHARGEMENT
// =====================================

const downloadBtn = document.getElementById("download");
downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "dessin.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});

// =====================================
// SAUVEGARDE EN BASE DE DONNÉES (API)
// =====================================

if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
        const imageData = canvas.toDataURL("image/png");

        try {
            // Remplace l'URL ci-dessous par l'adresse de ton API / serveur
            const response = await fetch("/api/sauvegarder-dessin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    image: imageData,
                    date: new Date().toISOString()
                })
            });

            if (response.ok) {
                alert("Votre dessin a bien été enregistré dans la base de données ! 🎨");
            } else {
                alert("Erreur lors de l'enregistrement du dessin.");
            }
        } catch (error) {
            console.error("Erreur serveur :", error);
            // Fallback d'affichage si l'API backend n'est pas encore prête
            alert("Dessin capturé sous forme d'image ! (Assurez-vous que votre serveur API est bien configuré).");
        }
    });
}