/**
 * Token Store
 * Data store for RDM tokens with pagination and filtering
 */
Ext.define('Store.rdmtoken.store.TokenStore', {
    extend: 'Ext.data.Store',
    
    requires: [
        'Store.rdmtoken.config.ApiConfig'
    ],

    proxy: {
        type: 'ajax',
        url: Store.rdmtoken.config.ApiConfig.getUrl('tokenList'),
        reader: {
            type: 'json',
            rootProperty: 'body.tokens',  // AWS API Gateway response format
            totalProperty: 'body.totalRecords'
        },
        extraParams: {
            page: 1,
            limit: 50,
            status: 'all',
            sortBy: 'issuedDate',
            sortOrder: 'desc'
        },
        headers: {
            'Content-Type': 'application/json'
        }
    },

    fields: [
        'id', 
        'requestId', 
        'tokenNumber', 
        'serialNumber', 
        'imei',
        'requestor', 
        'customerName', 
        'roNumber', 
        'status', 
        'tokenStatus',
        'issuedDate', 
        'expirationDate', 
        'remainingHours', 
        'durationHours',
        'contractValue', 
        'actions', 
        'unitDetails', 
        'contractDetails'
    ],

    pageSize: 50,
    remoteSort: true,
    remoteFilter: true,

    sorters: [{
        property: 'issuedDate',
        direction: 'DESC'
    }],

    listeners: {
        beforeload: function(store, operation) {
            console.log('Loading tokens...');
        },
        load: function(store, records, successful) {
            if (successful) {
                console.log('Tokens loaded:', records.length);
            } else {
                console.error('Failed to load tokens');
            }
        }
    }
});
