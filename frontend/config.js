// Configuration for different environments
const config = {
    // For local development
    development: {
        apiBaseUrl: 'http://localhost:8000'
    },
    // For AWS deployment with Apache proxy
    production: {
        apiBaseUrl: '/api'  // Apache will proxy /api/* to backend:8000
    },
    // For AWS deployment without proxy (direct access)
    productionDirect: {
        apiBaseUrl: 'http://YOUR-EC2-PUBLIC-IP:8000'  // Replace with your EC2 IP
    }
};

// Auto-detect environment
// If running on localhost, use development config
// Otherwise, use production config
const currentConfig = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? config.development 
    : config.production;

// Export for use in script.js
window.API_CONFIG = currentConfig;
