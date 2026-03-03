// Menggunakan proxy internal Vercel untuk menghindari CORS pada API Pterodactyl
const domainProxy = "/api-proxy";
const { apikey, nestid, egg, loc, resourceMap, subdomain } = config;
const output = document.getElementById('output-box');

// Auto Load Dropdown saat halaman dibuka
window.onload = () => {
    const pkgSelect = document.getElementById('pkgSelect');
    const domSelect = document.getElementById('domSelect');
    if (pkgSelect) Object.keys(resourceMap).forEach(key => pkgSelect.add(new Option(key.toUpperCase(), key)));
    if (domSelect) Object.keys(subdomain).forEach(dom => domSelect.add(new Option(dom, dom)));
};

function randomStr(len = 3) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// 1. CREATE SERVER & USER (FIXED)
document.getElementById('btnCreate').addEventListener('click', async () => {
    const user = document.getElementById('userInput').value.toLowerCase().trim();
    const pkg = document.getElementById('pkgSelect').value;
    if(!user) return alert("Isi username pembeli!");

    output.innerText = "⏳ Sedang memproses User & Server via Proxy...";
    const { ram, disk, cpu } = resourceMap[pkg];
    const password = user + randomStr(3);
    const uniqueEmail = `${user}.${randomStr(3)}@reyzcloud.com`; // Fix email duplikat

    try {
        // Step 1: Create User
        const uRes = await fetch(`${domainProxy}/application/users`, {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": `Bearer ${apikey}` },
            body: JSON.stringify({ 
                email: uniqueEmail, 
                username: user, 
                first_name: user.toUpperCase(), 
                last_name: "Server", 
                language: "en", 
                password 
            })
        });
        
        const uData = await uRes.json();
        
        // Safety Check User
        if(uData.errors) throw new Error("Gagal User: " + uData.errors[0].detail);
        if(!uData.attributes) throw new Error("Data User tidak ditemukan dalam respon API.");

        const userId = uData.attributes.id;

        // Step 2: Create Server
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
        
        // Safety Check Server
        if(sData.errors) throw new Error("Gagal Server: " + sData.errors[0].detail);
  output.innerHTML = `
✅ <b>BERHASIL DIBUAT!</b>
------------------------------
🌐 <b>domain:</b> <a href="${config.domain}" target="_blank" style="color: var(--accent); text-decoration: underline;">${config.domain}</a>
👤 <b>User:</b> ${user}
🔑 <b>Pass:</b> ${password}
💾 <b>RAM:</b> ${ram}MB
🆔 <b>ID Server:</b> ${sData.attributes.id}
📧 <b>Email:</b> ${uniqueEmail}
------------------------------
<i>Silahkan simpan data ini baik-baik!</i>
`;
    } catch(e) { 
        console.error(e);
        output.innerText = "❌ Error: " + e.message; 
    }
});

// 2. LIST SERVER (FIXED)
document.getElementById('btnList').addEventListener('click', async () => {
    output.innerText = "⏳ Loading server list...";
    try {
        const res = await fetch(`${domainProxy}/application/servers`, { 
            headers: { "Authorization": `Bearer ${apikey}`, "Accept": "application/json" } 
        });
        const data = await res.json();
        
        if(!data.data) throw new Error("Gagal mengambil data server.");

        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = "";
        data.data.forEach(srv => {
            const s = srv.attributes;
            tbody.innerHTML += `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.limits.memory}MB</td><td>${s.limits.disk}MB</td></tr>`;
        });
        output.innerText = `✅ Berhasil memuat ${data.data.length} server.`;
    } catch(e) { output.innerText = "❌ Gagal: " + e.message; }
});

// 3. SUBDOMAIN CLOUDFLARE (FIXED VIA PROXY)
document.getElementById('btnSubdo').addEventListener('click', async () => {
    const tld = document.getElementById('domSelect').value;
    const host = document.getElementById('hostInput').value.trim().toLowerCase();
    const ip = document.getElementById('ipInput').value.trim();
    if(!host || !ip) return alert("Input tidak lengkap!");

    output.innerText = "⏳ Menghubungkan ke Cloudflare via Proxy...";
    
    // Kita gunakan /cf-proxy/ sebagai jembatan
    const cfReq = (name) => fetch(`/cf-proxy/zones/${subdomain[tld].zone}/dns_records`, {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${subdomain[tld].apitoken}`, 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
            type: "A", 
            name: `${name}.${tld}`, 
            content: ip, 
            ttl: 3600, 
            proxied: false 
        })
    }).then(r => r.json());

    try {
        const r1 = await cfReq(host);
        if(!r1.success) throw new Error(r1.errors[0].message);
        
        // Buat record kedua untuk node (opsional)
        const r2 = await cfReq(`node-${randomStr(2)}.${host}`);
        
        output.innerHTML = `✅ <b>Subdomain Aktif!</b>\n🌍 IP: ${ip}\n📌 Panel: ${r1.result.name}\n🖥️ Node: ${r2.result.name}`;
    } catch(e) { 
        output.innerText = "❌ CF Error: " + e.message; 
    }
});

// 4. DELETE SERVER & USER (FIXED)
document.getElementById('btnDelServer').addEventListener('click', async () => {
    const id = document.getElementById('idTarget').value;
    if(!id || !confirm("Yakin hapus server & user ini?")) return;
    output.innerText = "⏳ Sedang menghapus via Proxy...";
    try {
        // Ambil info server
        const sRes = await fetch(`${domainProxy}/application/servers/${id}`, { 
            headers: { "Authorization": `Bearer ${apikey}`, "Accept": "application/json" } 
        });
        const sData = await sRes.json();
        if(!sData.attributes) throw new Error("Server tidak ditemukan.");
        
        const uId = sData.attributes.user;

        // Hapus Server
        await fetch(`${domainProxy}/application/servers/${id}`, { 
            method: "DELETE", 
            headers: { "Authorization": `Bearer ${apikey}` } 
        });

        // Hapus User secara langsung pakai ID user dari server
        await fetch(`${domainProxy}/application/users/${uId}`, { 
            method: "DELETE", 
            headers: { "Authorization": `Bearer ${apikey}` } 
        });

        output.innerText = "✅ Server & Akun berhasil dihapus!";
    } catch(e) { output.innerText = "❌ Gagal: " + e.message; }
});

// 5. ADMIN MANAGE (FIXED)
document.getElementById('btnCreateAdmin').addEventListener('click', async () => {
    const user = document.getElementById('adminUsername').value.toLowerCase().trim();
    if(!user) return alert("Username admin kosong!");
    const pass = user + randomStr(3);
    const email = `admin.${randomStr(2)}@reyzcloud.com`;

    try {
        const res = await fetch(`${domainProxy}/application/users`, {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": `Bearer ${apikey}` },
            body: JSON.stringify({ 
                email: email, 
                username: user, 
                first_name: user.toUpperCase(), 
                last_name: "ROOT", 
                root_admin: true, 
                language: "en", 
                password: pass 
            })
        });
        const data = await res.json();
        if(data.errors) throw new Error(data.errors[0].detail);
        output.innerHTML = `👑 <b>ADMIN DIBUAT!</b>\n\n👤 User: ${user}\n🔑 Pass: ${pass}\n📧 Email: ${email}`;
    } catch(e) { output.innerText = "❌ Error: " + e.message; }
});

document.getElementById('btnDelAdmin').addEventListener('click', async () => {
    const id = document.getElementById('idAdminTarget').value;
    if(!id || !confirm("Hapus Admin ID: " + id + "?")) return;
    try {
        const res = await fetch(`${domainProxy}/application/users/${id}`, { 
            method: "DELETE", 
            headers: { "Authorization": `Bearer ${apikey}` } 
        });
        if(!res.ok) throw new Error("Gagal menghapus admin (Mungkin ID salah).");
        output.innerText = "✅ Akun Admin berhasil dihapus!";
    } catch(e) { output.innerText = "❌ Error: " + e.message; }
});
