// ===============================
// RÉCUPÉRATION DES ÉLÉMENTS
// ===============================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");

const pencilBtn = document.getElementById("pencil");
const eraserBtn = document.getElementById("eraser");

let drawing = false;
let eraser = false;

ctx.lineCap = "round";
ctx.lineJoin = "round";

// ===============================
// CANVAS RESPONSIVE
// ===============================

function resizeCanvas() {

    const image = ctx.getImageData(0,0,canvas.width,canvas.height);

    canvas.width = canvas.offsetWidth;
    canvas.height = 700;

    ctx.putImageData(image,0,0);

}

window.addEventListener("load",resizeCanvas);
window.addEventListener("resize",resizeCanvas);

// ===============================
// DÉBUT DU DESSIN
// ===============================

function startDrawing(e){

    drawing = true;

    draw(e);

}

// ===============================
// FIN DU DESSIN
// ===============================

function stopDrawing(){

    drawing = false;

    ctx.beginPath();

}

// ===============================
// DESSIN
// ===============================

function draw(e){

    if(!drawing) return;

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;

    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize.value;

    ctx.strokeStyle = eraser ? "#FFFFFF" : colorPicker.value;

    ctx.lineTo(x,y);

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(x,y);

}

// ===============================
// SOURIS
// ===============================

canvas.addEventListener("mousedown",startDrawing);

canvas.addEventListener("mouseup",stopDrawing);

canvas.addEventListener("mouseleave",stopDrawing);

canvas.addEventListener("mousemove",draw);

// ===============================
// ÉCRAN TACTILE
// ===============================

canvas.addEventListener("touchstart",(e)=>{

    e.preventDefault();

    const touch = e.touches[0];

    startDrawing({

        clientX:touch.clientX,

        clientY:touch.clientY

    });

});

canvas.addEventListener("touchmove",(e)=>{

    e.preventDefault();

    const touch = e.touches[0];

    draw({

        clientX:touch.clientX,

        clientY:touch.clientY

    });

});

canvas.addEventListener("touchend",stopDrawing);

// ===============================
// OUTILS
// ===============================

pencilBtn.addEventListener("click",()=>{

    eraser = false;

    pencilBtn.classList.add("active");

    eraserBtn.classList.remove("active");

});

eraserBtn.addEventListener("click",()=>{

    eraser = true;

    eraserBtn.classList.add("active");

    pencilBtn.classList.remove("active");

});

// ===============================
// CURSEUR
// ===============================

brushSize.addEventListener("input",()=>{

    canvas.style.cursor="crosshair";

});

colorPicker.addEventListener("change",()=>{

    eraser=false;

});

// ===============================
// FOND BLANC
// ===============================

function initCanvas(){

    ctx.fillStyle="#FFFFFF";

    ctx.fillRect(0,0,canvas.width,canvas.height);

}

window.onload=()=>{

    resizeCanvas();

    initCanvas();

}
// =====================================
// HISTORIQUE (ANNULER / REFAIRE)
// =====================================

let history = [];
let historyStep = -1;

// Sauvegarde l'état du canvas
function saveState() {

    historyStep++;

    // Si on dessine après un annuler,
    // on supprime les états suivants.
    if (historyStep < history.length) {
        history.length = historyStep;
    }

    history.push(canvas.toDataURL());

}

// Recharge une image
function restoreState(index){

    const img = new Image();

    img.src = history[index];

    img.onload = () => {

        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.drawImage(img,0,0);

    }

}

// Sauvegarde après chaque trait
canvas.addEventListener("mouseup",saveState);
canvas.addEventListener("touchend",saveState);

// =====================================
// ANNULER
// =====================================

const undoBtn = document.getElementById("undo");

undoBtn.addEventListener("click",()=>{

    if(historyStep > 0){

        historyStep--;

        restoreState(historyStep);

    }

});

// =====================================
// REFAIRE
// =====================================

const redoBtn = document.getElementById("redo");

redoBtn.addEventListener("click",()=>{

    if(historyStep < history.length-1){

        historyStep++;

        restoreState(historyStep);

    }

});

// =====================================
// EFFACER
// =====================================

const clearBtn = document.getElementById("clear");

clearBtn.addEventListener("click",()=>{

    if(confirm("Effacer tout le dessin ?")){

        ctx.fillStyle="#FFFFFF";

        ctx.fillRect(0,0,canvas.width,canvas.height);

        saveState();

    }

});

// =====================================
// TELECHARGEMENT
// =====================================

const downloadBtn=document.getElementById("download");

downloadBtn.addEventListener("click",()=>{

    const link=document.createElement("a");

    link.download="dessin.png";

    link.href=canvas.toDataURL("image/png");

    link.click();

});

// =====================================
// PREMIERE SAUVEGARDE
// =====================================

window.addEventListener("load",()=>{

    setTimeout(saveState,200);

});