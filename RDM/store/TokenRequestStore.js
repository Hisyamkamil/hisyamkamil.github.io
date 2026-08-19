/**
 * Token Request Store
 * Data store for pending/issued token requests with pagination and filtering
 */
Ext.define('Store.rdmtoken.store.TokenRequestStore', {
    extend: 'Ext.data.Store',

    requires: [
        'Store.rdmtoken.config.ApiConfig'
    ],

    proxy: {
        type: 'ajax',
        url: Store.rdmtoken.config.ApiConfig.getUrl('tokenRequest'),
        reader: {
            type: 'json',
            // Backend returns top-level tokenRequests
            rootProperty: 'tokenRequests',
            totalProperty: 'pagination.totalRecords'
        },
        extraParams: {
            page: 1,
            limit: 50,
            status: 'pending',
            sortBy: 'requestDate',
            sortOrder: 'desc'
        },
        headers: {
            'Content-Type': 'application/json'
        }
    },

    // Normalize fields to match grid columns expected by TokenManagementPanel
    fields: [
        'id',
        'requestId',
        'serialNumber',
        'imei',
        'requestorName',
        'customerName',
        'roNumber',
        'status',
        'durationHours',
        'remainingQuotaHours',
        'requestDate',
        'periodStartDate',
        'periodEndDate',
        'tokenExpiryDate',
        'contractId',
        'unitDetails',
        'contractDetails',
        // Aliases for grid rendering
        { name: 'requestor', mapping: 'requestorName' },
        { name: 'tokenNumber', mapping: 'requestId' },
        {
            name: 'remainingHours',
            convert: function(v, record) {
                return v || record.get('remainingQuotaHours') || record.get('durationHours') || null;
            }
        },
        {
            name: 'expirationDate',
            convert: function(v, record) {
                return v || record.get('tokenExpiryDate') || null;
            }
        }
    ],

    pageSize: 50,
    remoteSort: true,
    remoteFilter: true,

    sorters: [{
        property: 'requestDate',
        direction: 'DESC'
    }],

    listeners: {
        beforeload: function(store) {
            console.log('Loading token requests...');
        },
        load: function(store, records, successful) {
            if (successful) {
                console.log('Token requests loaded:', records.length);
            } else {
                console.error('Failed to load token requests');
            }
        }
    }
});
