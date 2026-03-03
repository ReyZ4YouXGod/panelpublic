// Menggunakan proxy internal Vercel untuk menghindari CORS pada API Pterodactyl
const domainProxy = "/api-proxy";
const { apikey, nestid, egg, loc, resourceMap, subdomain, roles, cpanelPackages } = config;
const output = document.getElementById('output-box');

// --- LOGIKA SISTEM KASTA (FIXED) ---
function applyRolePermissions() {
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');

    // Debugging ke Console (Tekan F12 untuk cek)
    console.log("Checking Session...", { username, userRole });

    // Jika data tidak ada, paksa login ulang
    if (!userRole || !username) {
        console.warn("Sesi tidak ditemukan, mengalihkan ke login...");
        window.location.href = "login.html";
        return;
    }

    const roleData = roles[userRole];
    if (!roleData) {
        alert("Role tidak valid! Hubungi Creator.");
        return;
    }

    // UPDATE UI PROFIL (Solusi agar tidak stuck di 'Memuat...')
    const nameEl = document.getElementById('sess-user');
    const roleEl = document.getElementById('sess-role');
    
    if(nameEl) nameEl.innerText = username;
    if(roleEl) {
        roleEl.innerText = userRole;
        roleEl.className = `u-role ${roleData.badgeClass}`;
    }

    // FILTER MENU SIDEBAR
    const allMenus = ["nav-create", "nav-subdo", "nav-list", "nav-cpanel", "nav-admin", "nav-danger"];
    allMenus.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = roleData.allowedMenus.includes(id) ? 'flex' : 'none';
        }
    });
}

// FUNGSI MENGISI DROPDOWN (Penting agar pilihan RAM & Domain muncul)
function loadDropdowns() {
    const pkgSelect = document.getElementById('pkgSelect');
    const domSelect = document.getElementById('domSelect');
    const cpPkg = document.getElementById('cpPkg');

    if (pkgSelect) {
        pkgSelect.innerHTML = "";
        Object.keys(resourceMap).forEach(key => pkgSelect.add(new Option(key.toUpperCase(), key)));
    }
    if (domSelect) {
        domSelect.innerHTML = "";
        Object.keys(subdomain).forEach(dom => domSelect.add(new Option(dom, dom)));
    }
    if (cpPkg && cpanelPackages) {
        cpPkg.innerHTML = "";
        Object.keys(cpanelPackages).forEach(key => cpPkg.add(new Option(cpanelPackages[key], key)));
    }
}

// INISIALISASI SAAT HALAMAN DIBUKA
window.onload = () => {
    if(!localStorage.getItem('isLoggedIn')) {
        window.location.href = "login.html";
        return;
    }

    applyRolePermissions();
    loadDropdowns();
};

function randomStr(len = 3) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// --- FUNGSI UTAMA (PTERODACTYL, CLOUDFLARE, DLL) ---

// 1. CREATE SERVER
const btnCreate = document.getElementById('btnCreate');
if(btnCreate) {
    btnCreate.addEventListener('click', async () => {
        const user = document.getElementById('userInput').value.toLowerCase().trim();
        const pkg = document.getElementById('pkgSelect').value;
        if(!user) return alert("Isi username pembeli!");

        output.innerText = "⏳ Sedang memproses User & Server...";
        const { ram, disk, cpu } = resourceMap[pkg];
        const password = user + randomStr(3);
        const uniqueEmail = `${user}.${randomStr(3)}@reyzcloud.com`;

        try {
            const uRes = await fetch(`${domainProxy}/application/users`, {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": `Bearer ${apikey}` },
                body: JSON.stringify({ 
                    email: uniqueEmail, username: user, first_name: user.toUpperCase(), 
                    last_name: "Server", language: "en", password 
                })
            });
            const uData = await uRes.json();
            if(uData.errors) throw new Error("Gagal User: " + uData.errors[0].detail);
            const userId = uData.attributes.id;

            const sRes = await fetch(`${domainProxy}/application/servers`, {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": `Bearer ${apikey}` },
                body: JSON.stringify({
                    name: user.toUpperCase() + " SERVER",
                    user: userId,
                    egg: parseInt(egg),
                    docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
                    startup: "npm start",
                    environment: { INST: "npm", USER_UPLOAD: "0", AUTO_UPDATE: "0", CMD_RUN: "npm start" },
                    limits: { memory: ram, swap: 0, disk: disk, io: 500, cpu },
                    feature_limits: { databases: 5, backups: 5, allocations: 5 },
                    deploy: { locations: [parseInt(loc)], dedicated_ip: false, port_range: [] }
                })
            });
            const sData = await sRes.json();
            if(sData.errors) throw new Error("Gagal Server: " + sData.errors[0].detail);

            output.innerHTML = `✅ <b>BERHASIL!</b><br>👤 User: ${user}<br>🔑 Pass: ${password}<br>🆔 ID: ${sData.attributes.id}`;
        } catch(e) { output.innerText = "❌ Error: " + e.message; }
    });
}

// 2. LIST SERVER
const btnList = document.getElementById('btnList');
if(btnList) {
    btnList.addEventListener('click', async () => {
        output.innerText = "⏳ Loading server list...";
        try {
            const res = await fetch(`${domainProxy}/application/servers`, { 
                headers: { "Authorization": `Bearer ${apikey}`, "Accept": "application/json" } 
            });
            const data = await res.json();
            const tbody = document.getElementById('tableBody');
            if(tbody) {
                tbody.innerHTML = "";
                data.data.forEach(srv => {
                    const s = srv.attributes;
                    tbody.innerHTML += `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.limits.memory}MB</td><td>${s.limits.disk}MB</td></tr>`;
                });
            }
            output.innerText = `✅ Berhasil memuat ${data.data.length} server.`;
        } catch(e) { output.innerText = "❌ Gagal: " + e.message; }
    });
}

// 3. SUBDOMAIN CLOUDFLARE
const btnSubdo = document.getElementById('btnSubdo');
if(btnSubdo) {
    btnSubdo.addEventListener('click', async () => {
        const tld = document.getElementById('domSelect').value;
        const host = document.getElementById('hostInput').value.trim().toLowerCase();
        const ip = document.getElementById('ipInput').value.trim();
        if(!host || !ip) return alert("Input tidak lengkap!");

        output.innerText = "⏳ Menghubungkan ke Cloudflare...";
        const cfReq = (name) => fetch(`/cf-proxy/zones/${subdomain[tld].zone}/dns_records`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${subdomain[tld].apitoken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ type: "A", name: `${name}.${tld}`, content: ip, ttl: 3600, proxied: false })
        }).then(r => r.json());

        try {
            const r1 = await cfReq(host);
            if(!r1.success) throw new Error(r1.errors[0].message);
            output.innerHTML = `✅ <b>Subdomain Aktif!</b><br>📌 Panel: ${r1.result.name}`;
        } catch(e) { output.innerText = "❌ CF Error: " + e.message; }
    });
}

// 4. DELETE SERVER & USER
const btnDelServer = document.getElementById('btnDelServer');
if(btnDelServer) {
    btnDelServer.addEventListener('click', async () => {
        const id = document.getElementById('idTarget').value;
        if(!id || !confirm("Yakin hapus?")) return;
        try {
            const sRes = await fetch(`${domainProxy}/application/servers/${id}`, { headers: { "Authorization": `Bearer ${apikey}` } });
            const sData = await sRes.json();
            const uId = sData.attributes.user;
            await fetch(`${domainProxy}/application/servers/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${apikey}` } });
            await fetch(`${domainProxy}/application/users/${uId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${apikey}` } });
            output.innerText = "✅ Berhasil dihapus!";
        } catch(e) { output.innerText = "❌ Gagal: " + e.message; }
    });
}

// 5. ADMIN MANAGE
const btnCreateAdmin = document.getElementById('btnCreateAdmin');
if(btnCreateAdmin) {
    btnCreateAdmin.addEventListener('click', async () => {
        const user = document.getElementById('adminUsername').value.toLowerCase().trim();
        const pass = user + randomStr(3);
        try {
            const res = await fetch(`${domainProxy}/application/users`, {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": `Bearer ${apikey}` },
                body: JSON.stringify({ 
                    email: `admin.${randomStr(2)}@reyz.com`, username: user, first_name: user, 
                    last_name: "ROOT", root_admin: true, language: "en", password: pass 
                })
            });
            const data = await res.json();
            if(data.errors) throw new Error(data.errors[0].detail);
            output.innerHTML = `👑 <b>ADMIN DIBUAT!</b><br>👤 User: ${user}<br>🔑 Pass: ${pass}`;
        } catch(e) { output.innerText = "❌ Error: " + e.message; }
    });
}

// Fungsi Navigasi Tab
function showTab(e, tabId, title) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    if(e) e.currentTarget.classList.add('active');
    document.getElementById('tab-title').innerText = title;
}
