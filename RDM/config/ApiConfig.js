/**
 * API Configuration for RDM Token Extension
 * Central configuration for all API endpoints
 */
Ext.define('Store.rdmtoken.config.ApiConfig', {
    singleton: true,
    
    config: {
        // AWS API Gateway base URL
        baseUrl: 'https://oqh9j15uwe.execute-api.us-east-1.amazonaws.com/development',
        
        // Flespi direct command configuration (demo use – exposed in FE by request)
        // NOTE: This is intentionally committed per user's Option A for demo purposes.
        flespi: {
            baseUrl: 'https://flespi.io',
            deviceId: '8806162',
            token: 'MZj6ZkHo7gqKyrOJfgZcynXyELRXEufTvh3Kbmfn7An3gWVm7nsQLREXiTbTtzml',
            timeoutMs: 10000
        },
        
        // API endpoints based on api-gateway-import-corrected.json
        endpoints: {
            // Token management endpoints
            tokenList: '/api/rdm/token/list',
            tokenRequest: '/api/rdm/token/request',
            tokenGenerate: '/api/rdm/token/generate',
            tokenValidate: '/api/rdm/token/validate',
            tokenStatus: '/api/rdm/token/status/{serialNumber}',
            tokenTopup: '/api/rdm/token/topup',
            tokenRenew: '/api/rdm/token/renew',
            // Change Unit
            tokenChangeUnit: '/api/rdm/token/change-unit',
            tokenReports: '/api/rdm/token/reports',
            tokenDashboard: '/api/rdm/token/dashboard',
            healthCheck: '/api/rdm/token/health',
            
            // Contract management endpoints
            contractList: '/api/rdm/contracts',
            contractById: '/api/rdm/contracts/{contractId}',
            contractCreate: '/api/rdm/contracts'
        }
    },
    
    constructor: function(config) {
        this.initConfig(config);
        this.callParent([config]);
    },
    
    /**
     * Get full URL for an endpoint
     * @param {string} endpoint - Endpoint key from config
     * @param {object} params - URL parameters to replace (e.g., {serialNumber: '123'})
     * @return {string} Full URL
     */
    getUrl: function(endpoint, params) {
        var baseUrl = this.getBaseUrl();
        var endpoints = this.getEndpoints();
        var endpointPath = endpoints[endpoint];
        
        if (!endpointPath) {
            console.error('Unknown endpoint:', endpoint);
            console.error('Available endpoints:', Object.keys(endpoints));
            throw new Error('Unknown endpoint: ' + endpoint);
        }
        
        var fullUrl = baseUrl + endpointPath;
        
        // Replace URL parameters
        if (params) {
            Object.keys(params).forEach(function(key) {
                fullUrl = fullUrl.replace('{' + key + '}', params[key]);
            });
        }
        
        return fullUrl;
    },
    
    /**
     * Get full URL for Flespi command endpoint
     * @return {string} Full URL to POST commands to Flespi for the configured device
     */
    getFlespiUrl: function() {
        var cfg = this.getFlespi ? this.getFlespi() : (this.flespi || {});
        var base = (cfg.baseUrl || 'https://flespi.io').replace(/\/$/, '');
        var deviceId = String(cfg.deviceId || '8806162');
        return base + '/gw/devices/' + deviceId + '/commands';
    },
    
    /**
     * Get headers for Flespi request
     */
    getFlespiHeaders: function(extra) {
        var cfg = this.getFlespi ? this.getFlespi() : (this.flespi || {});
        var headers = {
            Authorization: 'FlespiToken ' + (cfg.token || ''),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        if (extra) {
            for (var k in extra) headers[k] = extra[k];
        }
        return headers;
    },
    
    /**
     * Get Flespi request timeout
     */
    getFlespiTimeout: function() {
        var cfg = this.getFlespi ? this.getFlespi() : (this.flespi || {});
        return cfg.timeoutMs || 10000;
    },
    
    /**
     * Update base URL (useful for switching environments)
     * @param {string} newBaseUrl
     */
    updateBaseUrl: function(newBaseUrl) {
        this.setBaseUrl(newBaseUrl);
        console.log('API base URL updated to:', newBaseUrl);
    },
    
    /**
     * Get environment-specific configuration
     * @return {object} Environment config
     */
    getEnvironmentConfig: function() {
        return {
            development: {
                baseUrl: 'https://oqh9j15uwe.execute-api.us-east-1.amazonaws.com/development',
                timeout: 30000,
                retryAttempts: 3
            },
            staging: {
                baseUrl: 'https://oqh9j15uwe.execute-api.us-east-1.amazonaws.com/staging',
                timeout: 30000,
                retryAttempts: 3
            },
            production: {
                baseUrl: 'https://oqh9j15uwe.execute-api.us-east-1.amazonaws.com/prod',
                timeout: 15000,
                retryAttempts: 2
            }
        };
    },
    
    /**
     * Switch to different environment
     * @param {string} environment - 'development', 'staging', or 'production'
     */
    switchEnvironment: function(environment) {
        var envConfig = this.getEnvironmentConfig()[environment];
        if (envConfig) {
            this.updateBaseUrl(envConfig.baseUrl);
            console.log('Switched to environment:', environment);
        } else {
            console.error('Unknown environment:', environment);
        }
    }
});