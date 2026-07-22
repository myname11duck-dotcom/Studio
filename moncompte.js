// moncompte.js
document.addEventListener("DOMContentLoaded", () => {
    // ===============================
    // 1. RÉCUPÉRATION DES ÉLÉMENTS
    // ===============================
    const canvas = document.getElementById("canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const colorPicker = document.getElementById("colorPicker");
    const brushSize = document.getElementById("brushSize");

    const pencilBtn = document.getElementById("pencil");
    const eraserBtn = document.getElementById("eraser");
    const newCanvasBtn = document.getElementById("newCanvasBtn");
    const saveBtn = document.getElementById("saveBtn");
    const clearBtn = document.getElementById("clear");
    const undoBtn = document.getElementById("undo");
    const redoBtn = document.getElementById("redo");
    const downloadBtn = document.getElementById("download");
    const galleryGrid = document.querySelector(".gallery-grid");

    const CANVAS_BG_COLOR = "#fcfaf7";

    let isDrawing = false;
    let isEraser = false;

    // ===============================
    // 2. INITIALISATION ET TAILLE
    // ===============================
    function setupCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width || 1200;
        canvas.height = 600;

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        resetCanvas();
    }

    function resetCanvas() {
        ctx.fillStyle = CANVAS_BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    setupCanvas();

    // ===============================
    // 3. CALCUL DES COORDONNÉES
    // ===============================
    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    // ===============================
    // 4. ACTION DE DESSIN
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
            saveState();
        }
    }

    // Événements Souris & Tactile
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    canvas.addEventListener("touchstart", (e) => { e.preventDefault(); startDrawing(e); });
    canvas.addEventListener("touchmove", (e) => { e.preventDefault(); draw(e); });
    canvas.addEventListener("touchend", stopDrawing);

    // ===============================
    // 5. BOUTONS OUTILS
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
    // 6. CREATION D'UNE NOUVELLE TOILE
    // ===============================
    function createNewCanvas() {
        if (confirm("Créer une nouvelle canvas ? Le dessin actuel sera effacé.")) {
            resetCanvas();
            history = [];
            historyStep = -1;
            saveState();
            canvas.scrollIntoView({ behavior: 'smooth' });
        }
    }

    if (newCanvasBtn) newCanvasBtn.addEventListener("click", createNewCanvas);

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (confirm("Effacer tout le dessin ?")) {
                resetCanvas();
                saveState();
            }
        });
    }

    // ===============================
    // 7. HISTORIQUE (ANNULER / REFAIRE)
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
    // 8. GALERIE & SAUVEGARDE DANS LE SITE
    // ===============================
    function loadSavedDrawings() {
        if (!galleryGrid) return;

        const savedImages = JSON.parse(localStorage.getItem("mes_creations") || "[]");
        galleryGrid.innerHTML = "";

        savedImages.forEach((dataUrl, index) => {
            const div = document.createElement("div");
            div.className = "drawing";
            div.style.position = "relative";
            div.innerHTML = `
                <img src="${dataUrl}" alt="Création ${index + 1}">
                <button class="delete-btn" data-index="${index}" style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.6); color:white; border:none; border-radius:50%; width:28px; height:28px; cursor:pointer;">✕</button>
            `;
            
            div.querySelector("img").addEventListener("click", () => {
                const img = new Image();
                img.src = dataUrl;
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    saveState();
                    canvas.scrollIntoView({ behavior: 'smooth' });
                };
            });

            galleryGrid.appendChild(div);
        });

        const addDiv = document.createElement("div");
        addDiv.className = "drawing add";
        addDiv.id = "addDrawingBtn";
        addDiv.innerHTML = `<i class="fa-solid fa-plus"></i>`;
        addDiv.addEventListener("click", createNewCanvas);
        galleryGrid.appendChild(addDiv);

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute("data-index"));
                deleteDrawing(idx);
            });
        });
    }

    function saveDrawingToSite() {
        const imageData = canvas.toDataURL("image/png");
        let savedImages = JSON.parse(localStorage.getItem("mes_creations") || "[]");

        savedImages.unshift(imageData);
        localStorage.setItem("mes_creations", JSON.stringify(savedImages));

        loadSavedDrawings();
        alert("Votre création a été enregistrée dans la galerie ! 🎨");
    }

    function deleteDrawing(index) {
        if (confirm("Voulez-vous supprimer ce dessin ?")) {
            let savedImages = JSON.parse(localStorage.getItem("mes_creations") || "[]");
            savedImages.splice(index, 1);
            localStorage.setItem("mes_creations", JSON.stringify(savedImages));
            loadSavedDrawings();
        }
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", saveDrawingToSite);
    }

    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const link = document.createElement("a");
            link.download = "mon-dessin.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        });
    }

    loadSavedDrawings();
    saveState();
});