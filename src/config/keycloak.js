// Ganti nilai-nilai berikut dengan detail server Keycloak Anda
const keycloakConfig = {
    url: 'http://auth-glm.zone.id', // URL Keycloak Anda
    realm: 'warehouse', // Nama Realm Anda
    clientId: 'warehouse', // Client ID Anda
};

// Opsi inisialisasi Keycloak.js
const initOptions = {
    onLoad: 'login-required', // 'login-required' untuk aplikasi yang wajib login, 'check-sso' untuk SSO
    // checkLoginIframe: false, // Mungkin diperlukan untuk menghindari masalah iframe di beberapa browser
};

export {
    keycloakConfig,
    initOptions
};