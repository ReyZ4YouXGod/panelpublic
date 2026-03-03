const config = {
    // --- API Pterodactyl Settings ---
    domain: "https://kurodev.apcb.biz.id", 
    apikey: "ptla_X6SsMJgB3hxBU7hsdxuOjIL5wlUXbcXxpwW6dE6pMGO",
    nestid: "5",
    egg: "15",
    loc: "1",

    // --- SISTEM KASTA (ROLE PERMISSIONS) ---
    roles: {
        "Creator": {
            badgeClass: "role-creator",
            allowedMenus: ["nav-create", "nav-subdo", "nav-list", "nav-cpanel", "nav-admin", "nav-danger"]
        },
        "Admin Panel": {
            badgeClass: "role-admin",
            allowedMenus: ["nav-create", "nav-subdo", "nav-list", "nav-cpanel", "nav-admin"]
        },
        "Reseller": {
            badgeClass: "role-reseller",
            allowedMenus: ["nav-create", "nav-subdo", "nav-cpanel"] 
        }
    },

    // --- RESOURCE MAP (PANEL GAME) ---
    resourceMap: {
        "1gb": { ram: "1024", disk: "1024", cpu: "100" },
        "2gb": { ram: "2048", disk: "2048", cpu: "150" },
        "3gb": { ram: "3072", disk: "3072", cpu: "200" },
        "4gb": { ram: "4096", disk: "4096", cpu: "250" },
        "5gb": { ram: "5120", disk: "5120", cpu: "300" },
        "6gb": { ram: "6144", disk: "6144", cpu: "350" },
        "7gb": { ram: "7168", disk: "7168", cpu: "400" },
        "8gb": { ram: "8192", disk: "8192", cpu: "450" },
        "9gb": { ram: "9216", disk: "9216", cpu: "500" },
        "10gb": { ram: "10240", disk: "10240", cpu: "550" },
        "unlimited": { ram: "0", disk: "0", cpu: "0" }
    },

    // --- CLOUDFLARE SUBDOMAIN SETTINGS ---
    subdomain: {
      "xyzid.store": { "zone": "e93173606e90f52fa3288799c45a293e", "apitoken": "DvtCrbOd1L-dohyju6-dJEV3jjyK2nWZZjCGK6DQ" },
      "galangoffc.biz.id": { "zone": "de6ecce0e30520f02a55ef47c132aee6", "apitoken": "SgsTW6PzCAbeKN38TWPald2NmwO_TgvxkwDHMOyw" }, 
      "pteroweb.my.id": { "zone": "714e0f2e54a90875426f8a6819f782d0", "apitoken": "vOn3NN5HJPut8laSwCjzY-gBO0cxeEdgSLH9WBEH" },
      "panelwebsite.biz.id": { "zone": "2d6aab40136299392d66eed44a7b1122", "apitoken": "CcavVSmQ6ZcGSrTnOos-oXnawq4yf86TUhmQW29S" },
      "privatserver.my.id": { "zone": "699bb9eb65046a886399c91daacb1968", "apitoken": "CcavVSmQ6ZcGSrTnOos-oXnawq4yf86TUhmQW29S" }
    },

    // --- CPANEL PACKAGES ---
    cpanelPackages: {
        "starter": "Starter (500MB Disk)",
        "premium": "Premium (Unlimited Disk)",
        "business": "Business (Unlimited + SSH)"
    }
};
