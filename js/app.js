// ==========================================
// 1. GLOBAL CONFIGURATION
// ==========================================
const WORKER_URL = "https://bora-ai.skillswithitsolution.workers.dev/"; 
let processedFiles = {}; 

const fileInput = document.getElementById('fileInput');
const grid = document.getElementById('grid');
const exportBtn = document.getElementById('exportBtn');
const dropzone = document.getElementById('dropzone');

// ==========================================
// 2. CORE ENGINE (IMAGE SELECTION)
// ==========================================
if(dropzone) {
    dropzone.addEventListener('click', () => fileInput.click());
}

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files).slice(0, 20);
    if (files.length === 0) return;
    handleFiles(files);
});

function handleFiles(files) {
    if(exportBtn) {
        exportBtn.disabled = false;
        exportBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    files.forEach(file => {
        const id = 'img-' + Math.random().toString(36).substr(2, 9);
        const card = document.createElement('div');
        card.id = id;
        card.className = "deep-card p-4 rounded-[35px] group relative animate-fade-in border border-slate-100";
        card.innerHTML = `
            <div class="relative aspect-square rounded-[25px] overflow-hidden bg-slate-50 border border-slate-100">
                <img id="preview-${id}" class="w-full h-full object-cover opacity-60">
                <div id="loader-${id}" class="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
                    <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
            <div class="mt-3 flex justify-between items-center">
                <p class="text-[9px] font-bold text-slate-400 uppercase truncate w-24">${file.name}</p>
                <span id="status-${id}" class="text-[8px] font-black text-indigo-600 uppercase">Processing</span>
            </div>
        `;
        grid.appendChild(card);

        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById(`preview-${id}`).src = ev.target.result;
            startAiProcessing(id, file); 
        };
        reader.readAsDataURL(file);
    });
}

// ==========================================
// 3. AI PROCESSING ENGINE (WORKER VERSION)
// ==========================================
async function startAiProcessing(id, file) {
    const status = document.getElementById(`status-${id}`);
    const loader = document.getElementById(`loader-${id}`);
    const imgElement = document.getElementById(`preview-${id}`);

    const formData = new FormData();
    formData.append("image", file); // Worker isi 'image' key ko dhoond raha hai

    try {
        status.innerHTML = "NEURAL SCANNING...";
        
        const response = await fetch(WORKER_URL, {
            method: "POST",
            body: formData, // HEADERS NAHI DALNE, Browser khud set karega
            mode: 'cors'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Worker Error");
        }

        const blob = await response.blob();
        const processedUrl = URL.createObjectURL(blob);

        // UI Update
        loader.classList.add('hidden');
        status.innerHTML = "4K READY ✨";
        status.className = "text-[8px] font-black text-green-500 uppercase";
        
        imgElement.src = processedUrl;
        imgElement.style.opacity = "1";
        imgElement.parentElement.classList.add("bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')]");
        
        processedFiles[id] = blob;

    } catch (error) {
        console.error("BORA Engine Error:", error);
        status.innerHTML = "ENGINE BUSY";
        status.className = "text-[8px] font-black text-red-500 uppercase";
        loader.classList.add('hidden');
    }
}

// ==========================================
// 4. EXPORT SYSTEM (AD-GATE)
// ==========================================
if(exportBtn) {
    exportBtn.addEventListener('click', openAdGate);
}

function openAdGate() {
    const modal = document.getElementById('infoModal');
    const contentArea = document.getElementById('modalContent');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    contentArea.innerHTML = `<div class="text-center py-10 uppercase font-black">Preparing High-Res Export...</div>`;
    
    setTimeout(renderDownloadBtn, 2000); // 2 second ka fake wait for ads
}

function renderDownloadBtn() {
    document.getElementById('modalContent').innerHTML = `
        <div class="text-center py-10">
            <h3 class="text-2xl font-black mb-6">READY FOR DOWNLOAD</h3>
            <button onclick="startActualDownload()" class="btn-premium px-8 py-4 rounded-xl font-bold">Download All Assets</button>
        </div>
    `;
}

function startActualDownload() {
    Object.keys(processedFiles).forEach((id, index) => {
        const url = URL.createObjectURL(processedFiles[id]);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SWITS-Bora-${index + 1}.png`;
        a.click();
    });
    closeModal();
}

window.closeModal = function() {
    document.getElementById('infoModal').classList.add('hidden');
}
