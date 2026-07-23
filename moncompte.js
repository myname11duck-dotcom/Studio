// moncompte.js - Version avec tutoriel
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
    let autosaveInterval = null;

    // ===============================
    // TOAST HELPER
    // ===============================
    function showToast(message, type = 'success') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    function showAutosave() {
        if (window.showAutosave) {
            window.showAutosave();
        }
    }

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
    let importedImage = null;
    let baseImg = null;
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
        const backupSrc = canvas.toDataURL();
        baseImg = new Image();
        baseImg.onload = () => renderImagePreview();
        baseImg.src = backupSrc;

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
        if (imageEditPanel) imageEditPanel.classList.add('active');
        canvas.style.cursor = "move";
    }

    function endImageImport(commit) {
        if (commit) {
            saveState();
            showToast('Image appliquée à la toile !', 'success');
            document.dispatchEvent(new CustomEvent('image:imported'));
        } else if (baseImg) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
            showToast('Import annulé', 'info');
        }
        imageEditMode = false;
        importedImage = null;
        baseImg = null;
        isDraggingImage = false;
        canvas.style.cursor = "crosshair";
        if (imageEditPanel) imageEditPanel.classList.remove('active');
    }

    if (importImageBtn && importImageInput) {
        importImageBtn.addEventListener("click", () => importImageInput.click());
        importImageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
                showToast('Veuillez sélectionner une image.', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => startImageImport(img);
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
            importImageInput.value = "";
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
    // 5. ACTION DE DESSIN
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
            showToast('Nouvelle toile créée !', 'success');
            document.dispatchEvent(new CustomEvent('drawing:cleared'));
        }
    }

    if (newCanvasBtn) newCanvasBtn.addEventListener("click", createNewCanvas);

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (confirm("Effacer tout le dessin ?")) {
                if (imageEditMode) endImageImport(false);
                resetCanvas();
                saveState();
                showToast('Toile effacée', 'info');
                document.dispatchEvent(new CustomEvent('drawing:cleared'));
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
                document.dispatchEvent(new CustomEvent('drawing:undo'));
            } else {
                showToast('Aucune action à annuler', 'info');
            }
        });
    }

    if (redoBtn) {
        redoBtn.addEventListener("click", () => {
            if (historyStep < history.length - 1) {
                historyStep++;
                restoreState(historyStep);
                document.dispatchEvent(new CustomEvent('drawing:redo'));
            } else {
                showToast('Aucune action à refaire', 'info');
            }
        });
    }

    // ===============================
    // 9. AUTO-SAVE
    // ===============================
    function startAutosave() {
        if (autosaveInterval) clearInterval(autosaveInterval);
        autosaveInterval = setInterval(() => {
            const user = JSON.parse(localStorage.getItem('utilisateur') || '{}');
            const currentState = canvas.toDataURL();
            const lastState = localStorage.getItem('autosave_' + (user.email || 'guest'));
            
            if (currentState !== lastState) {
                localStorage.setItem('autosave_' + (user.email || 'guest'), currentState);
                showAutosave();
            }
        }, 30000);
    }

    function restoreAutosave() {
        const user = JSON.parse(localStorage.getItem('utilisateur') || '{}');
        const saved = localStorage.getItem('autosave_' + (user.email || 'guest'));
        if (saved && history.length === 0) {
            const restore = confirm('💾 Une sauvegarde automatique a été trouvée. Voulez-vous la restaurer ?');
            if (restore) {
                const img = new Image();
                img.src = saved;
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    saveState();
                    showToast('Sauvegarde automatique restaurée !', 'success');
                };
            }
        }
    }

    startAutosave();
    restoreAutosave();

    // ===============================
    // 10. EXPORT
    // ===============================
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const formats = ['PNG', 'JPG', 'WEBP'];
            const format = prompt('Choisissez le format d\'export (PNG, JPG, WEBP) :', 'PNG');
            
            if (!format) return;
            
            const formatLower = format.toLowerCase();
            let mimeType = 'image/png';
            let extension = 'png';
            
            if (formatLower === 'jpg' || formatLower === 'jpeg') {
                mimeType = 'image/jpeg';
                extension = 'jpg';
            } else if (formatLower === 'webp') {
                mimeType = 'image/webp';
                extension = 'webp';
            }
            
            const quality = mimeType === 'image/png' ? undefined : 0.92;
            
            const link = document.createElement("a");
            link.download = `mon-dessin.${extension}`;
            link.href = canvas.toDataURL(mimeType, quality);
            link.click();
            
            showToast(`Dessin exporté en ${format.toUpperCase()} !`, 'success');
            document.dispatchEvent(new CustomEvent('drawing:downloaded'));
        });
    }

    // ===============================
    // 11. GALERIE & SAUVEGARDE
    // ===============================
    function loadSavedDrawings() {
        if (!galleryGrid) return;

        const savedImages = JSON.parse(localStorage.getItem("mes_creations") || "[]");
        galleryGrid.innerHTML = "";

        savedImages.forEach((dataUrl, index) => {
            const div = document.createElement("div");
            div.className = "drawing";
            div.style.position = "relative";
            
            const imageSrc = typeof dataUrl === 'string' ? dataUrl : (dataUrl.image || '');
            const drawingName = typeof dataUrl === 'string' ? 'Sans nom' : (dataUrl.nom || 'Sans nom');
            
            div.innerHTML = `
                <img src="${imageSrc}" alt="${drawingName}" loading="lazy">
                <div class="drawing-name">${drawingName}</div>
                <button class="delete-btn" data-index="${index}">✕</button>
            `;
            
            div.querySelector("img").addEventListener("click", () => {
                if (imageEditMode) endImageImport(false);
                const img = new Image();
                img.src = imageSrc;
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    saveState();
                    canvas.scrollIntoView({ behavior: 'smooth' });
                    showToast(`"${drawingName}" chargé !`, 'success');
                };
            });

            galleryGrid.appendChild(div);
        });

        // Bouton Ajouter
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
            showToast('Connectez-vous pour sauvegarder un dessin.', 'error');
            return;
        }

        const drawingName = prompt('Donnez un nom à votre création :', 'Mon dessin');
        if (drawingName === null) return;

        const imageData = canvas.toDataURL("image/png");
        let savedImages = JSON.parse(localStorage.getItem("mes_creations") || "[]");

        const drawingObject = {
            image: imageData,
            nom: drawingName || 'Sans nom',
            email: user.email,
            date: new Date().toISOString(),
            favori: false
        };

        savedImages.unshift(drawingObject);
        localStorage.setItem("mes_creations", JSON.stringify(savedImages));

        const studioDrawings = JSON.parse(localStorage.getItem('studio_dessins') || '[]');
        studioDrawings.unshift({
            id: Date.now().toString(),
            image: imageData,
            nom: drawingName || 'Sans nom',
            email: user.email,
            date: new Date().toISOString(),
            favori: false
        });
        localStorage.setItem('studio_dessins', JSON.stringify(studioDrawings));

        loadSavedDrawings();
        showToast(`"${drawingName || 'Sans nom'}" sauvegardé ! 🎨`, 'success');
        
        // Événement pour le personnage
        document.dispatchEvent(new CustomEvent('drawing:saved'));
    }

    function deleteDrawing(index) {
        if (confirm("Voulez-vous supprimer ce dessin ?")) {
            let savedImages = JSON.parse(localStorage.getItem("mes_creations") || "[]");
            const deleted = savedImages[index];
            savedImages.splice(index, 1);
            localStorage.setItem("mes_creations", JSON.stringify(savedImages));
            
            const studioDrawings = JSON.parse(localStorage.getItem('studio_dessins') || '[]');
            const newStudioDrawings = savedImages.map((img, i) => ({
                id: Date.now().toString() + i,
                image: img.image || img,
                nom: img.nom || 'Sans nom',
                email: img.email || '',
                date: img.date || new Date().toISOString(),
                favori: img.favori || false
            }));
            localStorage.setItem('studio_dessins', JSON.stringify(newStudioDrawings));
            
            loadSavedDrawings();
            showToast(`"${deleted?.nom || 'Dessin'}" supprimé`, 'info');
        }
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", saveDrawingToSite);
    }

    loadSavedDrawings();
    saveState();

    // ===============================
    // 12. RACCOURCIS CLAVIER
    // ===============================
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            if (undoBtn) undoBtn.click();
        }
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            if (redoBtn) redoBtn.click();
        }
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (saveBtn) saveBtn.click();
        }
        if (e.key === 'e' && !e.ctrlKey && !e.metaKey) {
            if (eraserBtn) eraserBtn.click();
        }
        if (e.key === 'p' && !e.ctrlKey && !e.metaKey) {
            if (pencilBtn) pencilBtn.click();
        }
    });

    // ===============================
    // 13. RESIZE DU CANVAS
    // ===============================
    function resizeCanvas() {
        const container = document.querySelector('.canvas-wrapper');
        if (!container) return;
        
        const containerWidth = container.clientWidth - 56;
        const ratio = 1200 / 700;
        const newWidth = Math.min(containerWidth, 1200);
        const newHeight = newWidth / ratio;
        
        if (Math.abs(canvas.width - newWidth) > 10 || Math.abs(canvas.height - newHeight) > 10) {
            const currentData = canvas.toDataURL();
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            const img = new Image();
            img.src = currentData;
            img.onload = () => {
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
            };
        }
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 250);
    });

    // ===============================
    // 14. TUTORIEL INTERACTIF
    // ===============================
    const tutorial = {
        steps: [
            {
                element: '#colorPicker',
                title: '🎨 Choisis ta couleur',
                message: 'Clique ici pour sélectionner la couleur de ton pinceau. Tu peux choisir n\'importe quelle couleur !',
                position: 'bottom'
            },
            {
                element: '#brushSize',
                title: '📏 Ajuste la taille',
                message: 'Fais glisser ce curseur pour modifier la taille de ton pinceau. Plus le chiffre est grand, plus le trait est épais !',
                position: 'bottom'
            },
            {
                element: '.brush-type[data-type="classic"]',
                title: '🖌️ Les pinceaux',
                message: 'Ici tu as différents pinceaux : classique, marqueur, aérosol, aquarelle, calligraphie et crayon. Essaie-les tous !',
                position: 'bottom'
            },
            {
                element: '#pencil',
                title: '✏️ Le crayon',
                message: 'Le crayon est ton outil principal pour dessiner. Clique dessus pour l\'activer.',
                position: 'bottom'
            },
            {
                element: '#eraser',
                title: '🧹 La gomme',
                message: 'La gomme efface ce que tu as dessiné. Utile pour corriger tes erreurs !',
                position: 'bottom'
            },
            {
                element: '#undo',
                title: '↩️ Annuler',
                message: 'Tu as fait une erreur ? Clique sur "Annuler" pour revenir en arrière. Raccourci : Ctrl+Z',
                position: 'bottom'
            },
            {
                element: '#redo',
                title: '↪️ Refaire',
                message: 'Tu as changé d\'avis ? Clique sur "Refaire" pour rétablir ce que tu as annulé. Raccourci : Ctrl+Y',
                position: 'bottom'
            },
            {
                element: '#importImageBtn',
                title: '🖼️ Importer une image',
                message: 'Tu peux importer une image depuis ton ordinateur pour la modifier ou dessiner dessus !',
                position: 'bottom'
            },
            {
                element: '#saveBtn',
                title: '💾 Sauvegarder',
                message: 'Quand ton chef-d\'œuvre est terminé, clique ici pour le sauvegarder dans ta galerie !',
                position: 'top'
            },
            {
                element: '#download',
                title: '📥 Télécharger',
                message: 'Tu peux aussi télécharger ton dessin en PNG, JPG ou WEBP pour le partager où tu veux !',
                position: 'top'
            }
        ],
        
        currentStep: 0,
        isActive: false,
        overlay: null,
        tooltip: null,
        highlightedElement: null,
        
        start() {
            if (this.isActive) return;
            
            // Vérifier si l'utilisateur a déjà vu le tutoriel
            if (localStorage.getItem('tutorial_seen') === 'true') {
                const restart = confirm('🔄 Voir le tutoriel à nouveau ?');
                if (!restart) return;
            }
            
            this.isActive = true;
            this.currentStep = 0;
            
            // Créer l'overlay
            this.overlay = document.createElement('div');
            this.overlay.className = 'tutorial-overlay active';
            document.body.appendChild(this.overlay);
            
            // Bloquer le scroll
            document.body.style.overflow = 'hidden';
            
            this.showStep();
            showToast('🎓 Bienvenue dans le tutoriel ! Suis les étapes.', 'info');
            
            // Événement pour le personnage
            document.dispatchEvent(new CustomEvent('tutorial:start'));
        },
        
        showStep() {
            if (this.currentStep >= this.steps.length) {
                this.end();
                return;
            }
            
            const step = this.steps[this.currentStep];
            const element = document.querySelector(step.element);
            
            if (!element) {
                // Si l'élément n'existe pas, passer à l'étape suivante
                this.currentStep++;
                this.showStep();
                return;
            }
            
            // Nettoyer l'ancien tooltip
            if (this.tooltip) {
                this.tooltip.remove();
                this.tooltip = null;
            }
            
            // Nettoyer l'ancien highlight
            if (this.highlightedElement) {
                this.highlightedElement.classList.remove('tutorial-highlight');
                this.highlightedElement = null;
            }
            
            // Mettre en surbrillance l'élément
            element.classList.add('tutorial-highlight');
            this.highlightedElement = element;
            
            // Faire défiler jusqu'à l'élément
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Créer le tooltip
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'tutorial-tooltip';
            
            const progress = ((this.currentStep + 1) / this.steps.length * 100).toFixed(0);
            
            this.tooltip.innerHTML = `
                <div class="tutorial-progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="tutorial-title">${step.title}</div>
                <div class="tutorial-message">${step.message}</div>
                <div class="tutorial-progress">Étape ${this.currentStep + 1} / ${this.steps.length}</div>
                <div class="tutorial-actions">
                    <button class="btn-skip" id="tutorialSkip">Passer</button>
                    <button class="btn-next" id="tutorialNext">
                        ${this.currentStep === this.steps.length - 1 ? '🎉 Terminer' : 'Suivant →'}
                    </button>
                </div>
                <div class="tutorial-arrow ${step.position}"></div>
            `;
            
            // Positionner le tooltip
            this.positionTooltip(element, step.position);
            
            document.body.appendChild(this.tooltip);
            
            // Événements
            this.tooltip.querySelector('#tutorialNext').addEventListener('click', () => {
                this.nextStep();
            });
            
            this.tooltip.querySelector('#tutorialSkip').addEventListener('click', () => {
                this.skip();
            });
            
            // Raccourci clavier
            document.addEventListener('keydown', this.keyHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.nextStep();
                }
                if (e.key === 'Escape') {
                    this.skip();
                }
            });
            
            // Événement pour le personnage
            document.dispatchEvent(new CustomEvent('tutorial:step', { 
                detail: { step: this.currentStep } 
            }));
        },
        
        positionTooltip(element, position) {
            const rect = element.getBoundingClientRect();
            const tooltip = this.tooltip;
            
            // Taille estimée du tooltip
            const tooltipWidth = Math.min(300, window.innerWidth - 40);
            const tooltipHeight = 200;
            
            let top, left;
            
            switch(position) {
                case 'top':
                    top = rect.top - tooltipHeight - 20;
                    left = rect.left + rect.width/2 - tooltipWidth/2;
                    break;
                case 'bottom':
                    top = rect.bottom + 20;
                    left = rect.left + rect.width/2 - tooltipWidth/2;
                    break;
                case 'left':
                    top = rect.top + rect.height/2 - tooltipHeight/2;
                    left = rect.left - tooltipWidth - 20;
                    break;
                case 'right':
                    top = rect.top + rect.height/2 - tooltipHeight/2;
                    left = rect.right + 20;
                    break;
                default:
                    top = rect.bottom + 20;
                    left = rect.left + rect.width/2 - tooltipWidth/2;
            }
            
            // S'assurer que le tooltip reste dans la fenêtre
            if (top < 10) top = 10;
            if (left < 10) left = 10;
            if (left + tooltipWidth > window.innerWidth - 10) {
                left = window.innerWidth - tooltipWidth - 10;
            }
            if (top + tooltipHeight > window.innerHeight - 10) {
                top = window.innerHeight - tooltipHeight - 10;
            }
            
            tooltip.style.top = top + 'px';
            tooltip.style.left = left + 'px';
            tooltip.style.maxWidth = tooltipWidth + 'px';
        },
        
        nextStep() {
            this.currentStep++;
            // Enlever le highlight
            if (this.highlightedElement) {
                this.highlightedElement.classList.remove('tutorial-highlight');
                this.highlightedElement = null;
            }
            this.showStep();
        },
        
        skip() {
            if (confirm('❓ Voulez-vous vraiment arrêter le tutoriel ?')) {
                this.end();
            }
        },
        
        end() {
            this.isActive = false;
            
            // Nettoyer
            if (this.tooltip) {
                this.tooltip.remove();
                this.tooltip = null;
            }
            if (this.overlay) {
                this.overlay.remove();
                this.overlay = null;
            }
            if (this.highlightedElement) {
                this.highlightedElement.classList.remove('tutorial-highlight');
                this.highlightedElement = null;
            }
            if (this.keyHandler) {
                document.removeEventListener('keydown', this.keyHandler);
                this.keyHandler = null;
            }
            
            document.body.style.overflow = '';
            
            // Marquer comme vu
            localStorage.setItem('tutorial_seen', 'true');
            
            showToast('🎉 Tutoriel terminé ! À toi de créer maintenant !', 'success');
            
            // Événement pour le personnage
            document.dispatchEvent(new CustomEvent('tutorial:end'));
        }
    };

    // Bouton tutoriel
    const tutorialBtn = document.getElementById('tutorialBtn');
    if (tutorialBtn) {
        tutorialBtn.addEventListener('click', () => {
            tutorial.start();
        });
    }

    // Raccourci clavier pour lancer le tutoriel
    document.addEventListener('keydown', (e) => {
        if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.target.closest('input, textarea')) {
            tutorial.start();
        }
    });

    // Si c'est la première visite, lancer le tutoriel automatiquement
    if (!localStorage.getItem('tutorial_seen')) {
        setTimeout(() => {
            const start = confirm('🎓 Bienvenue sur Studio Créatif ! Voulez-vous faire le tutoriel ?');
            if (start) {
                tutorial.start();
            } else {
                localStorage.setItem('tutorial_seen', 'true');
            }
        }, 3000);
    }

    console.log('🎨 Studio Créatif chargé !');
    console.log('💡 Raccourcis : Ctrl+Z (annuler), Ctrl+Y (refaire), Ctrl+S (sauvegarder), E (gomme), P (crayon)');
    console.log('📚 Appuie sur "T" pour lancer le tutoriel !');
    console.log('🧑‍🎨 Appuie sur "?" pour parler au personnage !');
});