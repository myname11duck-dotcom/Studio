// moncompte.js - Version avec nom des créations
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
    let currentBrush = 'classic';

    // ===============================
    // IMPORT & ÉDITION D'IMAGE
    // ===============================
    const importImageBtn = document.getElementById("importImageBtn");
    const importImageInput = document.getElementById("importImageInput");
    const imageEditPanel = document.getElementById("imageEditPanel");
    const imgBrightness = document.getElementById("imgBrightness");
    const imgContrast = document.getElementById("imgContrast");
    const imgSaturation = document.getElementById("imgSaturation");
    const imgScale = document.getElementById("imgScale");
    const imgGrayscaleBtn = document.getElementById("imgGrayscale");
    const imgSepiaBtn = document.getElementById("imgSepia");
    const imgInvertBtn = document.getElementById("imgInvert");
    const imgRotateLeftBtn = document.getElementById("imgRotateLeft");
    const imgRotateRightBtn = document.getElementById("imgRotateRight");
    const imgFlipHBtn = document.getElementById("imgFlipH");
    const imgFlipVBtn = document.getElementById("imgFlipV");
    const imgResetFiltersBtn = document.getElementById("imgResetFilters");
    const imgCancelBtn = document.getElementById("imgCancelBtn");
    const imgApplyBtn = document.getElementById("imgApplyBtn");

    let imageEditMode = false;
    let importedImage = null; // { img, x, y, w, h, baseW, baseH, rotation, flipH, flipV }
    let baseImg = null; // image de la toile telle qu'elle était avant l'import (pour prévisualiser sans accumuler)
    let isDraggingImage = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let imageFilters = { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0, invert: 0 };

    function buildFilterString() {
        const f = imageFilters;
        return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) grayscale(${f.grayscale}%) sepia(${f.sepia}%) invert(${f.invert}%)`;
    }

    function renderImagePreview() {
        if (!importedImage || !baseImg) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

        const { img, x, y, w, h, rotation, flipH, flipV } = importedImage;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH, flipV);
        ctx.filter = buildFilterString();
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
        ctx.filter = "none";
    }

    function isPointInsideImage(pos) {
        if (!importedImage) return false;
        const { x, y, w, h } = importedImage;
        return pos.x >= x - w / 2 && pos.x <= x + w / 2 && pos.y >= y - h / 2 && pos.y <= y + h / 2;
    }

    function resetFilterControls() {
        imageFilters = { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0, invert: 0 };
        if (imgBrightness) imgBrightness.value = 100;
        if (imgContrast) imgContrast.value = 100;
        if (imgSaturation) imgSaturation.value = 100;
        if (imgScale) imgScale.value = 100;
        [imgGrayscaleBtn, imgSepiaBtn, imgInvertBtn].forEach(b => b && b.classList.remove("active"));
    }

    function startImageImport(img) {
        // Sauvegarde de l'état actuel de la toile pour prévisualiser sans l'altérer
        const backupSrc = canvas.toDataURL();
        baseImg = new Image();
        baseImg.onload = () => renderImagePreview();
        baseImg.src = backupSrc;

        // On ajuste l'image pour qu'elle rentre dans la toile (mode "contenir"), centrée
        const maxW = canvas.width * 0.8;
        const maxH = canvas.height * 0.8;
        const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        const w = img.width * ratio;
        const h = img.height * ratio;

        importedImage = {
            img,
            x: canvas.width / 2,
            y: canvas.height / 2,
            w, h,
            baseW: w,
            baseH: h,
            rotation: 0,
            flipH: 1,
            flipV: 1
        };

        resetFilterControls();
        imageEditMode = true;
        if (imageEditPanel) imageEditPanel.style.display = "flex";
        canvas.style.cursor = "move";
    }

    function endImageImport(commit) {
        if (commit) {
            // L'image est déjà dessinée sur la toile (dernier rendu de renderImagePreview)
            saveState();
        } else if (baseImg) {
            // On restaure la toile telle qu'elle était avant l'import
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
        }
        imageEditMode = false;
        importedImage = null;
        baseImg = null;
        isDraggingImage = false;
        canvas.style.cursor = "crosshair";
        if (imageEditPanel) imageEditPanel.style.display = "none";
    }

    if (importImageBtn && importImageInput) {
        importImageBtn.addEventListener("click", () => importImageInput.click());
        importImageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
                alert("Merci de sélectionner un fichier image.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => startImageImport(img);
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
            importImageInput.value = ""; // permet de réimporter le même fichier
        });
    }

    if (imgBrightness) imgBrightness.addEventListener("input", () => { imageFilters.brightness = imgBrightness.value; renderImagePreview(); });
    if (imgContrast) imgContrast.addEventListener("input", () => { imageFilters.contrast = imgContrast.value; renderImagePreview(); });
    if (imgSaturation) imgSaturation.addEventListener("input", () => { imageFilters.saturation = imgSaturation.value; renderImagePreview(); });
    if (imgScale) imgScale.addEventListener("input", () => {
        if (!importedImage) return;
        const scale = imgScale.value / 100;
        importedImage.w = importedImage.baseW * scale;
        importedImage.h = importedImage.baseH * scale;
        renderImagePreview();
    });

    if (imgGrayscaleBtn) imgGrayscaleBtn.addEventListener("click", () => {
        imageFilters.grayscale = imageFilters.grayscale ? 0 : 100;
        imgGrayscaleBtn.classList.toggle("active", !!imageFilters.grayscale);
        renderImagePreview();
    });
    if (imgSepiaBtn) imgSepiaBtn.addEventListener("click", () => {
        imageFilters.sepia = imageFilters.sepia ? 0 : 100;
        imgSepiaBtn.classList.toggle("active", !!imageFilters.sepia);
        renderImagePreview();
    });
    if (imgInvertBtn) imgInvertBtn.addEventListener("click", () => {
        imageFilters.invert = imageFilters.invert ? 0 : 100;
        imgInvertBtn.classList.toggle("active", !!imageFilters.invert);
        renderImagePreview();
    });
    if (imgRotateLeftBtn) imgRotateLeftBtn.addEventListener("click", () => {
        if (!importedImage) return;
        importedImage.rotation -= 90;
        renderImagePreview();
    });
    if (imgRotateRightBtn) imgRotateRightBtn.addEventListener("click", () => {
        if (!importedImage) return;
        importedImage.rotation += 90;
        renderImagePreview();
    });
    if (imgFlipHBtn) imgFlipHBtn.addEventListener("click", () => {
        if (!importedImage) return;
        importedImage.flipH *= -1;
        renderImagePreview();
    });
    if (imgFlipVBtn) imgFlipVBtn.addEventListener("click", () => {
        if (!importedImage) return;
        importedImage.flipV *= -1;
        renderImagePreview();
    });
    if (imgResetFiltersBtn) imgResetFiltersBtn.addEventListener("click", () => {
        if (!importedImage) return;
        importedImage.rotation = 0;
        importedImage.flipH = 1;
        importedImage.flipV = 1;
        importedImage.w = importedImage.baseW;
        importedImage.h = importedImage.baseH;
        importedImage.x = canvas.width / 2;
        importedImage.y = canvas.height / 2;
        resetFilterControls();
        renderImagePreview();
    });
    if (imgCancelBtn) imgCancelBtn.addEventListener("click", () => endImageImport(false));
    if (imgApplyBtn) imgApplyBtn.addEventListener("click", () => endImageImport(true));

    // ===============================
    // 2. GESTION DES PINCEAUX
    // ===============================
    const brushTypes = document.querySelectorAll('.brush-type');
    
    brushTypes.forEach(btn => {
        btn.addEventListener('click', () => {
            brushTypes.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBrush = btn.dataset.type;
            
            if (isEraser) {
                isEraser = false;
                if (pencilBtn) pencilBtn.classList.add('active');
                if (eraserBtn) eraserBtn.classList.remove('active');
            }
        });
    });

    // ===============================
    // 3. INITIALISATION ET TAILLE
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
    // 4. CALCUL DES COORDONNÉES
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
    // 5. ACTION DE DESSIN AVEC DIFFÉRENTS PINCEAUX
    // ===============================
    function getBrushStyle() {
        const size = parseInt(brushSize ? brushSize.value : 5);
        const color = isEraser ? CANVAS_BG_COLOR : (colorPicker ? colorPicker.value : "#1a1412");
        
        switch(currentBrush) {
            case 'marker':
                return { color, size: size * 1.2, opacity: 0.8, lineCap: 'square' };
            case 'spray':
                return { color, size: size * 2, opacity: 0.3, lineCap: 'round', spray: true };
            case 'watercolor':
                return { color, size: size * 1.5, opacity: 0.5, lineCap: 'round', watercolor: true };
            case 'calligraphy':
                return { color, size: size * 1.8, opacity: 0.9, lineCap: 'butt', calligraphy: true };
            case 'pencil':
                return { color, size: size * 0.8, opacity: 0.7, lineCap: 'round', pencil: true };
            default:
                return { color, size, opacity: 1, lineCap: 'round' };
        }
    }

    function startDrawing(e) {
        const pos = getCoordinates(e);

        if (imageEditMode) {
            if (isPointInsideImage(pos)) {
                isDraggingImage = true;
                dragOffsetX = pos.x - importedImage.x;
                dragOffsetY = pos.y - importedImage.y;
            }
            return;
        }

        isDrawing = true;

        const style = getBrushStyle();
        ctx.globalAlpha = style.opacity;
        ctx.lineCap = style.lineCap || 'round';
        ctx.lineWidth = style.size;

        if (currentBrush === 'spray') {
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * style.size;
                const x = pos.x + Math.cos(angle) * radius;
                const y = pos.y + Math.sin(angle) * radius;
                ctx.beginPath();
                ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
                ctx.fillStyle = style.color;
                ctx.fill();
            }
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        } else {
            ctx.strokeStyle = style.color;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        }
    }

    function draw(e) {
        if (imageEditMode) {
            if (!isDraggingImage || !importedImage) return;
            const pos = getCoordinates(e);
            importedImage.x = pos.x - dragOffsetX;
            importedImage.y = pos.y - dragOffsetY;
            renderImagePreview();
            return;
        }

        if (!isDrawing) return;

        const pos = getCoordinates(e);
        const style = getBrushStyle();

        if (currentBrush === 'spray') {
            ctx.globalAlpha = style.opacity;
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * style.size;
                const x = pos.x + Math.cos(angle) * radius;
                const y = pos.y + Math.sin(angle) * radius;
                ctx.beginPath();
                ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
                ctx.fillStyle = style.color;
                ctx.fill();
            }
            return;
        }

        ctx.globalAlpha = style.opacity;
        ctx.lineWidth = style.size;
        ctx.strokeStyle = isEraser ? CANVAS_BG_COLOR : style.color;
        ctx.lineCap = style.lineCap || 'round';

        if (currentBrush === 'calligraphy') {
            const angle = Math.atan2(pos.y - ctx.lastY || 1, pos.x - ctx.lastX || 1);
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(angle);
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillRect(-style.size/4, -style.size/2, style.size/2, style.size);
            ctx.restore();
            ctx.lastX = pos.x;
            ctx.lastY = pos.y;
            return;
        }

        if (currentBrush === 'watercolor') {
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = style.size * 0.3;
        } else {
            ctx.shadowBlur = 0;
        }

        if (currentBrush === 'pencil') {
            ctx.setLineDash([2, 1]);
        } else {
            ctx.setLineDash([]);
        }

        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);

        ctx.shadowBlur = 0;
        ctx.setLineDash([]);
    }

    function stopDrawing() {
        if (imageEditMode) {
            isDraggingImage = false;
            return;
        }
        if (isDrawing) {
            isDrawing = false;
            ctx.beginPath();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.setLineDash([]);
            saveState();
        }
    }

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    canvas.addEventListener("touchstart", (e) => { e.preventDefault(); startDrawing(e); });
    canvas.addEventListener("touchmove", (e) => { e.preventDefault(); draw(e); });
    canvas.addEventListener("touchend", stopDrawing);

    // ===============================
    // 6. BOUTONS OUTILS
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
    // 7. CREATION D'UNE NOUVELLE TOILE
    // ===============================
    function createNewCanvas() {
        if (confirm("Créer une nouvelle canvas ? Le dessin actuel sera effacé.")) {
            if (imageEditMode) endImageImport(false);
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
                if (imageEditMode) endImageImport(false);
                resetCanvas();
                saveState();
            }
        });
    }

    // ===============================
    // 8. HISTORIQUE (ANNULER / REFAIRE)
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
    // 9. GALERIE & SAUVEGARDE AVEC NOM
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
                <img src="${dataUrl.image || dataUrl}" alt="${dataUrl.nom || 'Création'}">
                <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.5); color:white; padding:4px 8px; font-size:11px; text-align:center; backdrop-filter:blur(4px);">${dataUrl.nom || 'Sans nom'}</div>
                <button class="delete-btn" data-index="${index}" style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.6); color:white; border:none; border-radius:50%; width:28px; height:28px; cursor:pointer;">✕</button>
            `;
            
            div.querySelector("img").addEventListener("click", () => {
                if (imageEditMode) endImageImport(false);
                const img = new Image();
                img.src = dataUrl.image || dataUrl;
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
        const user = JSON.parse(localStorage.getItem('utilisateur') || 'null');
        if (!user || !user.email) {
            alert('Vous devez être connecté pour sauvegarder un dessin.');
            return;
        }

        // Demander le nom du dessin
        const drawingName = prompt('Donnez un nom à votre création :', 'Mon dessin');
        if (drawingName === null) return; // Annulé

        const imageData = canvas.toDataURL("image/png");
        let savedImages = JSON.parse(localStorage.getItem("mes_creations") || "[]");

        // Créer l'objet avec le nom, l'email et l'image
        const drawingObject = {
            image: imageData,
            nom: drawingName || 'Sans nom',
            email: user.email,
            date: new Date().toLocaleDateString('fr-FR'),
            favori: false
        };

        savedImages.unshift(drawingObject);
        localStorage.setItem("mes_creations", JSON.stringify(savedImages));

        // Sauvegarder aussi dans studio_dessins pour la recherche
        const studioDrawings = JSON.parse(localStorage.getItem('studio_dessins') || '[]');
        studioDrawings.unshift({
            id: Date.now().toString(),
            image: imageData,
            nom: drawingName || 'Sans nom',
            email: user.email,
            date: new Date().toLocaleDateString('fr-FR'),
            favori: false
        });
        localStorage.setItem('studio_dessins', JSON.stringify(studioDrawings));

        loadSavedDrawings();
        alert(`Votre création "${drawingName || 'Sans nom'}" a été enregistrée ! 🎨`);
    }

    function deleteDrawing(index) {
        if (confirm("Voulez-vous supprimer ce dessin ?")) {
            let savedImages = JSON.parse(localStorage.getItem("mes_creations") || "[]");
            savedImages.splice(index, 1);
            localStorage.setItem("mes_creations", JSON.stringify(savedImages));
            
            // Mettre à jour aussi studio_dessins
            const studioDrawings = JSON.parse(localStorage.getItem('studio_dessins') || '[]');
            // On ne peut pas supprimer facilement par index, on recrée la liste
            // Pour simplifier, on vide et on recrée à partir de mes_creations
            const newStudioDrawings = savedImages.map((img, i) => ({
                id: Date.now().toString() + i,
                image: img.image || img,
                nom: img.nom || 'Sans nom',
                email: img.email || '',
                date: img.date || new Date().toLocaleDateString('fr-FR'),
                favori: img.favori || false
            }));
            localStorage.setItem('studio_dessins', JSON.stringify(newStudioDrawings));
            
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