// ==========================================
// 1. GLOBAL CONFIGURATION & STATE
// ==========================================
// AGAR APKE PAAS WORKER NAHI HAI, TOH TEST KE LIYE YE URL USE KAREIN (Sample API)
const WORKER_URL = "https://your-worker-name.workers.dev"; 
let processedBlobs = {}; 

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
            startAiProcessing(id, file); // Asli Processing shuru
        };
        reader.readAsDataURL(file);
    });
}

// ==========================================
// 3. AI PROCESSING & DOWNLOAD LOGIC
// ==========================================
async function startAiProcessing(id, file) {
    const status = document.getElementById(`status-${id}`);
    const loader = document.getElementById(`loader-${id}`);
    const imgElement = document.getElementById(`preview-${id}`);

    // --- AGAR WORKER NAHI HAI TOH YE SECTION SIRF SIMULATION KAREGA ---
    // Asli removal ke liye Cloudflare Worker par @huggingface/rembg model hona chahiye
    try {
        // Simulation delay (Asli API call yahan hogi)
        await new Promise(r => setTimeout(r, 2500));

        // Processing khatam
        loader.classList.add('hidden');
        status.innerHTML = "4K READY ✨";
        status.className = "text-[8px] font-black text-green-500 uppercase";
        imgElement.style.opacity = "1";
        
        // Image ko "Transparent" look dena (Checkerboard pattern)
        imgElement.parentElement.classList.add("bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')]");

        // Blob save karna download ke liye
        processedBlobs[id] = file; // Yahan processed file blob aayegi

    } catch (error) {
        status.innerHTML = "FAILED";
        status.className = "text-[8px] font-black text-red-500 uppercase";
        loader.classList.add('hidden');
    }
}

// DOWNLOAD FUNCTION (Jo 6K Button se call hoga)
function startActualDownload() {
    const keys = Object.keys(processedBlobs);
    if (keys.length === 0) {
        alert("No images processed yet!");
        return;
    }

    // Pehli processed image uthao
    const firstId = keys[0];
    const blob = processedBlobs[firstId];
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `BORA-AI-Export-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Close modal if needed
    if(typeof closeModal === "function") closeModal();
}

// ==========================================
// 4. MODAL SYSTEM (PRIVACY, TERMS, API)
// ==========================================
const modalData = {
    privacy: {
        title: "Privacy <span class='gradient-text'>Policy</span>",
        desc: "Aapka data aapki amanat hai. BORA AI aapki images ko server par store nahi karta.",
        content: `<ul class="space-y-6 mt-8 text-slate-600">
                    <li class="flex gap-4"><span class="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">1</span><p><b>Local Processing:</b> Images are wiped instantly after processing.</p></li>
                  </ul>`
    },
    terms: {
        title: "Terms of <span class='gradient-text'>Service</span>",
        desc: "BORA AI ko use karne ke usool aur zawabit.",
        content: `<div class="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">"BORA AI is for professional & educational use only."</div>`
    },
    api: {
        title: "Neural <span class='gradient-text'>API</span> Access",
        desc: "Connect your apps with the world's most precise removal engine.",
        content: `<code class="block p-4 bg-slate-900 text-indigo-300 rounded-2xl text-xs font-mono mt-4">POST /api/v1/remove-bg</code>`
    }
};

window.openModal = function(type) {
    const modal = document.getElementById('infoModal');
    const contentArea = document.getElementById('modalContent');
    const data = modalData[type];

    contentArea.innerHTML = `
        <h2 class="text-4xl font-black text-slate-900 tracking-tighter mb-2">${data.title}</h2>
        <p class="text-slate-500 font-medium">${data.desc}</p>
        ${data.content}
    `;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

window.closeModal = function() {
    const modal = document.getElementById('infoModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

// ==========================================
// 5. EXPORT & AD-GATE SYSTEM
// ==========================================
if(exportBtn) {
    exportBtn.addEventListener('click', openAdGate);
}

function openAdGate() {
    const modal = document.getElementById('infoModal');
    const contentArea = document.getElementById('modalContent');

    contentArea.innerHTML = `
        <div class="text-center py-6">
            <div class="mb-8 relative inline-block">
                <div class="w-24 h-24 border-4 border-slate-100 rounded-[30px] flex items-center justify-center">
                    <svg class="w-10 h-10 text-indigo-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/></svg>
                </div>
            </div>
            <h3 class="text-2xl font-black text-slate-800 tracking-tighter uppercase">Initializing 6K Export</h3>
            <div class="w-full bg-slate-100 h-4 rounded-full overflow-hidden my-6 border border-slate-200">
                <div id="progressBar" class="h-full bg-indigo-600 transition-all duration-300 ease-out" style="width: 0%"></div>
            </div>
            <p id="statusText" class="text-xs font-black text-indigo-600 uppercase italic">0% Completed</p>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        document.getElementById('progressBar').style.width = progress + '%';
        document.getElementById('statusText').innerText = Math.floor(progress) + '% COMPLETED';

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(showDownloadButton, 800);
        }
    }, 400);
}

function showDownloadButton() {
    const contentArea = document.getElementById('modalContent');
    contentArea.innerHTML = `
        <div class="text-center py-6 animate-fade-in">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 class="text-3xl font-black text-slate-900 tracking-tighter">6K READY!</h3>
            <button onclick="startDownload()" class="btn-premium w-full py-5 rounded-[25px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl mt-6">
                Download Now
            </button>
        </div>
    `;
}

window.startDownload = function() {
    const keys = Object.keys(processedBlobs);
    if(keys.length === 0) return alert("No images processed yet!");

    keys.forEach((id, index) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(processedBlobs[id]);
        link.download = `BORA_6K_${index + 1}.png`;
        link.click();
    });

    setTimeout(() => {
        alert("Success! SWITS Engine has exported your files.");
        closeModal();
    }, 1000);
}

// unlock 6k-------------------------------------------
function openAdGate() {
    // 1. Modal element ko dhoondna
    const modal = document.getElementById('infoModal');
    if (!modal) {
        console.error("Error: 'infoModal' ID wala element nahi mila!");
        return;
    }

    // 2. Modal content ko Ad-style loading mein badalna
    const contentArea = document.getElementById('modalContent');
    contentArea.innerHTML = `
        <div class="text-center py-10 animate-fade-in">
            <div class="inline-block p-4 bg-indigo-50 rounded-3xl mb-6">
                <svg class="w-12 h-12 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
            <h3 class="text-3xl font-black text-slate-900 tracking-tighter">PREPARING 6K EXPORT</h3>
            <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 mb-8">SWITS Neural Engine is processing your request</p>
            
            <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                <div id="p-bar" class="h-full bg-indigo-600 transition-all duration-500" style="width: 0%"></div>
            </div>
            <p id="p-text" class="text-[10px] font-black text-indigo-600 mt-4 uppercase">0% Synchronized</p>
        </div>
    `;

    // 3. Modal show karna
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // 4. Progress Simulation
    let val = 0;
    const timer = setInterval(() => {
        val += Math.floor(Math.random() * 15) + 5;
        if (val >= 100) {
            val = 100;
            clearInterval(timer);
            setTimeout(renderDownloadBtn, 600);
        }
        document.getElementById('p-bar').style.width = val + '%';
        document.getElementById('p-text').innerText = val + '% Synchronized';
    }, 300);
}

function renderDownloadBtn() {
    document.getElementById('modalContent').innerHTML = `
        <div class="text-center py-10 animate-bounce-in">
            <div class="w-20 h-20 bg-green-500 text-white rounded-[30px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-200">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 class="text-4xl font-black text-slate-900 tracking-tighter uppercase">Ready for Export</h3>
            <p class="text-slate-500 text-sm font-medium mt-2 mb-8 italic">Your 6K Ultra-HD images are secured and ready.</p>
            <button onclick="window.location.reload()" class="btn-premium w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                Download ZIP Archive
            </button>
        </div>
    `;
}

// Is function ko apne script mein update karein
function startActualDownload() {
    // Check agar koi processed file hai
    const fileKeys = Object.keys(processedFiles);
    
    if (fileKeys.length === 0) {
        alert("Pehle image process karein!");
        return;
    }

    // Pehli image ko download karne ka tareeka
    const link = document.createElement('a');
    link.href = processedFiles[fileKeys[0]]; // Processed image ka URL
    link.download = 'BORA-6K-Result.png'; // File name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert("Download Started! SWITS Engine has delivered your file.");
}

// Ab apne "showDownloadSuccess" function mein button ko update karein:
function showDownloadSuccess() {
    document.getElementById('modalContent').innerHTML = `
        <div class="text-center py-10 animate-fade-in">
            <div class="w-20 h-20 bg-green-500 text-white rounded-[30px] flex items-center justify-center mx-auto mb-6">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 class="text-3xl font-black text-slate-900 tracking-tighter">6K FILE SECURED</h3>
            <p class="text-slate-500 text-sm mt-2 mb-8">Ready to save to your device.</p>
            <button onclick="startActualDownload()" class="btn-premium w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest">
                Download Now
            </button>
        </div>
    `;
}

//---------------------------------------------------------------
async function startAiProcessing(id, file) {
    const status = document.getElementById(`badge-${id}`);
    const btn = document.getElementById(`btn-${id}`);
    const imgElement = document.getElementById(`preview-${id}`);
    
    const formData = new FormData();
    formData.append("image", file);

    try {
        // Yahan aapka Cloudflare Worker URL aayega
        const response = await fetch("https://your-worker.workers.dev", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("API Limit reached");

        const blob = await response.blob();
        const processedUrl = URL.createObjectURL(blob);

        // UI Update with Processed Image
        imgElement.src = processedUrl;
        imgElement.style.opacity = "1";
        imgElement.parentElement.classList.add("bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')]");
        
        // Save Blob for Download
        processedFiles[id] = blob; 

        status.innerHTML = "Success ✨";
        status.className = "text-[8px] font-black text-green-500 uppercase";
        btn.innerHTML = "Processed";
        btn.classList.add('hidden'); // Hide button after success

    } catch (error) {
        console.error("AI Error:", error);
        status.innerHTML = "Engine Busy";
    }
}

//----------------------------------------------------------------------------------------------
function startActualDownload() {
    const keys = Object.keys(processedFiles);
    if (keys.length === 0) return alert("Pehle image process karein!");

    // Sari processed images ko download karne ka loop
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
    });
}