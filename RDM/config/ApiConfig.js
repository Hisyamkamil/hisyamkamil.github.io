/**
 * API Configuration for RDM Token Extension
 * Central configuration for all API endpoints
 */
Ext.define('Store.rdmtoken.config.ApiConfig', {
    singleton: true,
    
    config: {
        // AWS API Gateway base URL
        baseUrl: 'https://oqh9j15uwe.execute-api.us-east-1.amazonaws.com/development',
        
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
            tokenReports: '/api/rdm/token/reports',
            healthCheck: '/api/rdm/token/health'
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
        var endpointPath = this.getEndpoints()[endpoint];
        
        if (!endpointPath) {
            console.error('Unknown endpoint:', endpoint);
            return baseUrl;
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
