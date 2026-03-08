/**
 * Token Store
 * Data store for RDM tokens with pagination and filtering
 */
Ext.define('Store.rdmtoken.store.TokenStore', {
    extend: 'Ext.data.Store',

    proxy: {
        type: 'ajax',
        url: '/api/rdm/token/list',
        reader: {
            type: 'json',
            rootProperty: 'tokens',
            totalProperty: 'totalRecords'
        },
        extraParams: {
            page: 1,
            limit: 50
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