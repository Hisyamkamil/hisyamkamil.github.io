/**
 * API Configuration for Warehouse Management Extension
 * Central configuration for all API endpoints
 */
Ext.define('Store.warehouse.config.ApiConfig', {
    singleton: true,
    
    config: {
        // AWS API Gateway base URL - ALIGNED WITH ACTUAL POSTMAN COLLECTION
        baseUrl: 'https://y82rydc0yi.execute-api.us-east-1.amazonaws.com/dev',
        
        // API endpoints based on ACTUAL POSTMAN COLLECTION CONTRACT
        endpoints: {
            // Health Check endpoint
            healthCheck: '/api/warehouse/health',
            
            // Dashboard endpoints
            dashboard: '/api/warehouse/dashboard',
            alerts: '/api/warehouse/alerts',
            
            // Inbound delivery endpoints - ALIGNED WITH POSTMAN COLLECTION
            inboundList: '/api/warehouse/inbound',
            inboundCreate: '/api/warehouse/inbound',
            inboundById: '/api/warehouse/inbound/{deliveryId}',
            inboundUpdate: '/api/warehouse/inbound/{deliveryId}',
            inboundCancel: '/api/warehouse/inbound/{deliveryId}',
            
            // Good receive processing - ALIGNED WITH POSTMAN COLLECTION
            goodReceiveCreate: '/api/warehouse/goodreceive',
            goodReceiveConfirm: '/api/warehouse/goodreceive/confirm',
            goodReceiveReverse: '/api/warehouse/goodreceive/reverse',
            
            // Put away task endpoints - ALIGNED WITH POSTMAN COLLECTION
            putAwayList: '/api/warehouse/putaway',
            putAwayCreate: '/api/warehouse/putaway',
            putAwayStart: '/api/warehouse/putaway/start',
            putAwayConfirm: '/api/warehouse/putaway/confirm',
            putAwayReverse: '/api/warehouse/putaway/reverse',
            
            // Picking task endpoints - ALIGNED WITH POSTMAN COLLECTION
            pickingList: '/api/warehouse/picking',
            pickingCreate: '/api/warehouse/picking',
            pickingStart: '/api/warehouse/picking/start',
            pickingValidate: '/api/warehouse/picking/validate',
            pickingConfirm: '/api/warehouse/picking/confirm',
            pickingReverse: '/api/warehouse/picking/reverse',
            
            // RFID operations - ALIGNED WITH POSTMAN COLLECTION
            rfidScan: '/api/warehouse/rfid/scan',
            rfidGenerateTags: '/api/warehouse/rfid/generate-tags',
            rfidValidate: '/api/warehouse/rfid/validate',
            rfidProcess: '/api/warehouse/rfid/process',
            rfidValidateMovement: '/api/warehouse/rfid/validate-movement',
            
            // Barcode operations - ALIGNED WITH POSTMAN COLLECTION
            barcodeScan: '/api/warehouse/barcode/scan',
            
            // EPC management - ALIGNED WITH POSTMAN COLLECTION
            epcGenerate: '/api/epc/generate',
            epcDecode: '/api/epc/decode/{epc}',
            epcValidate: '/api/epc/validate',
            epcAssign: '/api/epc/assign',
            epcHistory: '/api/epc/history/{epc}',
            
            // Master data endpoints - ALIGNED WITH POSTMAN COLLECTION
            itemsList: '/api/warehouse/items',
            itemsById: '/api/warehouse/items/{itemId}',
            itemsCreate: '/api/warehouse/items',
            itemsUpdate: '/api/warehouse/items/{itemId}',
            itemsDelete: '/api/warehouse/items/{itemId}',
            locationsList: '/api/warehouse/locations',
            inventoryList: '/api/warehouse/inventory',
            
            // Reports endpoints - ALIGNED WITH POSTMAN COLLECTION
            reports: '/api/warehouse/reports',
            
            // Stock Opname operations - ALIGNED WITH POSTMAN COLLECTION
            stockOpnameList: '/api/warehouse/stockopname',
            stockOpnameCreate: '/api/warehouse/stockopname',
            stockOpnameStart: '/api/warehouse/stockopname/{sessionId}/start',
            stockOpnameComplete: '/api/warehouse/stockopname/{sessionId}/complete'
        }
    },
    
    constructor: function(config) {
        this.initConfig(config);
        this.callParent([config]);
    },
    
    /**
     * Get full URL for an endpoint
     * @param {string} endpoint - Endpoint key from config
     * @param {object} params - URL parameters to replace (e.g., {deliveryId: '123'})
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
     * Update base URL (useful for switching environments)
     * @param {string} newBaseUrl
     */
    updateBaseUrl: function(newBaseUrl) {
        this.setBaseUrl(newBaseUrl);
        console.log('Warehouse API base URL updated to:', newBaseUrl);
    },
    
    /**
     * Get environment-specific configuration - ALIGNED WITH ACTUAL AWS DEPLOYMENT
     * @return {object} Environment config
     */
    getEnvironmentConfig: function() {
        return {
            development: {
                baseUrl: 'https://y82rydc0yi.execute-api.us-east-1.amazonaws.com/dev',
                timeout: 30000,
                retryAttempts: 3
            },
            staging: {
                baseUrl: 'https://y82rydc0yi.execute-api.us-east-1.amazonaws.com/staging',
                timeout: 30000,
                retryAttempts: 3
            },
            production: {
                baseUrl: 'https://y82rydc0yi.execute-api.us-east-1.amazonaws.com/prod',
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
            console.log('Switched to warehouse environment:', environment);
        } else {
            console.error('Unknown warehouse environment:', environment);
        }
    },
    
    /**
     * Create standardized request headers for warehouse API
     * CORS-safe headers - no Content-Type for GET requests
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @return {object} Standard headers
     */
    getStandardHeaders: function(method) {
        // GET requests must not have Content-Type header to avoid CORS preflight
        if (method && method.toLowerCase() === 'get') {
            return {}; // No headers for GET requests
        }
        
        // POST/PUT requests need Content-Type
        return {
            'Content-Type': 'application/json'
        };
    },
    
    /**
     * Create request configuration with standard settings
     * @param {string} endpoint - Endpoint key
     * @param {string} method - HTTP method
     * @param {object} data - Request data
     * @param {object} urlParams - URL parameters
     * @return {object} Request configuration
     */
    createRequestConfig: function(endpoint, method, data, urlParams) {
        return {
            url: this.getUrl(endpoint, urlParams),
            method: method || 'GET',
            headers: this.getStandardHeaders(method || 'GET'), // Pass method for header logic
            jsonData: data,
            timeout: 15000
        };
    }
});
