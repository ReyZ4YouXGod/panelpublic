<div align="center">

# 🛡️ REYZCLOUD MANAGER PRO v2
**The Ultimate Pterodactyl & Cloudflare Automation Dashboard**

[![Deployment](https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Language](https://img.shields.io/badge/Language-JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://javascript.info)
[![Security](https://img.shields.io/badge/Security-CORS_Proxy-blue?style=for-the-badge&logo=shield-halved)](https://vercel.com/docs/concepts/projects/project-configuration#rewrites)
[![License](https://img.shields.io/badge/License-Protected-red?style=for-the-badge)](https://github.com)

---

"Solusi modern untuk manajemen Hosting & DNS tanpa ribet. Cepat, Aman, dan Responsif."

[Explore Features](#-fitur-unggulan) • [Installation](#-panduan-instalasi) • [Legal](#-hak-cipta-dan-lisensi)

</div>

## 🚀 Fitur Unggulan

* **⚡ Instant Server Creation**: Automasi pembuatan User & Server Pterodactyl dalam hitungan detik.
* **🌐 DNS Automation**: Integrasi Cloudflare API untuk pembuatan subdomain (A Record) otomatis.
* **📂 Multi-Tab System**: Desain Single Page Application (SPA) dengan navigasi Hamburger Menu yang halus.
* **📡 Real-time Monitoring**: Daftar server aktif langsung dari panel ke dashboard kamu.
* **🔒 Secure Proxy**: Menggunakan *Vercel Rewrites* untuk menembus proteksi CORS secara aman.

---

## 🛠️ Panduan Instalasi

### 1. Kloning & Persiapan
Pastikan semua file berikut berada dalam satu direktori:
* `index.html` (UI/UX)
* `script.js` (Logic)
* `vercel.json` (Proxy Gateway)
* `settings/config.js` (Credentials)

### 2. Konfigurasi Gateway (vercel.json)
Ubah file `vercel.json` untuk mengaktifkan jalur **Proxy Internal**:
```json
{
  "rewrites": [
    {
      "source": "/api-proxy/:path*",
      "destination": "[https://kurodev.apcb.biz.id/api/:path](https://kurodev.apcb.biz.id/api/:path)*"
    }
  ]
}
