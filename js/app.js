// ==========================================
// 1. GLOBAL CONFIGURATION & STATE
// ==========================================
const WORKER_URL = "https://patient-dream-51c0.skillswithitsolution.workers.dev/"; 
let processedFiles = {}; 

const fileInput = document.getElementById('fileInput');
const grid = document.getElementById('grid');
const exportBtn = document.getElementById('exportBtn');
const dropzone = document.getElementById('dropzone');

// ==========================================
// 2. CORE ENGINE (IMAGE SELECTION & UI)
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
        exportBtn.classList.remove('cursor-not-allowed', 'opacity-50');
        exportBtn.classList.add('btn-premium');
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
            <button id="btn-${id}" onclick="reProcess('${id}')" class="hidden absolute top-2 right-2 p-2 bg-white/80 rounded-full text-[8px] font-bold">Retry</button>
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
// 3. AI PROCESSING ENGINE (UPDATED TO CLIENT-SIDE)
// ==========================================
async function startAiProcessing(id, file) {
    const status = document.getElementById(`status-${id}`);
    const loader = document.getElementById(`loader-${id}`);
    const imgElement = document.getElementById(`preview-${id}`);
    const retryBtn = document.getElementById(`btn-${id}`);

    try {
        // Step 1: Status Update
        status.innerHTML = "NEURAL SCANNING...";
        
        // Step 2: Direct Background Removal (No Worker Needed)
        // Ensure you added the imgly script tag in your HTML head
        const blob = await imglyRemoveBackground(file); 

        if (!blob) throw new Error("Processing Failed");

        const processedUrl = URL.createObjectURL(blob);

        // UI Update
        loader.classList.add('hidden');
        status.innerHTML = "4K READY ✨";
        status.className = "text-[8px] font-black text-green-500 uppercase";
        
        imgElement.src = processedUrl;
        imgElement.style.opacity = "1";
        
        // Transparent checkerboard effect
        imgElement.parentElement.classList.add("bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')]");
        
        // Save for Export
        processedFiles[id] = blob;

    } catch (error) {
        console.error("BORA Engine Error:", error);
        status.innerHTML = "ENGINE BUSY";
        status.className = "text-[8px] font-black text-red-500 uppercase";
        loader.classList.add('hidden');
        if(retryBtn) retryBtn.classList.remove('hidden');
    }
}
// ==========================================
// 4. EXPORT & AD-GATE SYSTEM
// ==========================================
if(exportBtn) {
    exportBtn.addEventListener('click', openAdGate);
}

function openAdGate() {
    const modal = document.getElementById('infoModal');
    const contentArea = document.getElementById('modalContent');
    if (!modal) return;

    contentArea.innerHTML = `
        <div class="text-center py-10 animate-fade-in">
            <div class="inline-block p-4 bg-indigo-50 rounded-3xl mb-6">
                <svg class="w-12 h-12 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
            <h3 class="text-3xl font-black text-slate-900 tracking-tighter uppercase">PREPARING 6K EXPORT</h3>
            <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 mb-8">SWITS Neural Engine is finalising assets</p>
            <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                <div id="p-bar" class="h-full bg-indigo-600 transition-all duration-500" style="width: 0%"></div>
            </div>
            <p id="p-text" class="text-[10px] font-black text-indigo-600 mt-4 uppercase">0% Synchronized</p>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    let val = 0;
    const timer = setInterval(() => {
        val += Math.floor(Math.random() * 20) + 5;
        if (val >= 100) {
            val = 100;
            clearInterval(timer);
            setTimeout(renderDownloadBtn, 800);
        }
        document.getElementById('p-bar').style.width = val + '%';
        document.getElementById('p-text').innerText = val + '% Synchronized';
    }, 400);
}

function renderDownloadBtn() {
    document.getElementById('modalContent').innerHTML = `
        <div class="text-center py-10 animate-fade-in">
            <div class="w-20 h-20 bg-green-500 text-white rounded-[30px] flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 class="text-4xl font-black text-slate-900 tracking-tighter uppercase">Ready for Export</h3>
            <p class="text-slate-500 text-sm font-medium mt-2 mb-8 italic">Your Ultra-HD images are secured.</p>
            <button onclick="startActualDownload()" class="btn-premium w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                Download All Assets
            </button>
        </div>
    `;
}

function startActualDownload() {
    const keys = Object.keys(processedFiles);
    if (keys.length === 0) return alert("Pehle image process karein!");

    keys.forEach((id, index) => {
        const blob = processedFiles[id];
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `BORA-Result-${index + 1}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });

    setTimeout(() => {
        alert("Success! SWITS Engine has delivered your files.");
        closeModal();
    }, 1000);
}

// ==========================================
// 5. MODAL SYSTEM & HELPERS
// ==========================================
window.openModal = function(type) {
    const modal = document.getElementById('infoModal');
    const contentArea = document.getElementById('modalContent');
    const data = {
        privacy: { title: "Privacy Policy", desc: "Data is wiped instantly.", content: "Local processing only." },
        terms: { title: "Terms of Service", desc: "BORA AI usage terms.", content: "Educational use only." }
    };

    if(data[type]) {
        contentArea.innerHTML = `<h2 class="text-4xl font-black mb-2">${data[type].title}</h2><p>${data[type].desc}</p>`;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

window.closeModal = function() {
    const modal = document.getElementById('infoModal');
    if(modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }
}
