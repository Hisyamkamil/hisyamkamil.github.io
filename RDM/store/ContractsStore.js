/**
 * Contracts Store
 * Data store for contract information with dynamic URL support
 */
Ext.define('Store.rdmtoken.store.ContractsStore', {
    extend: 'Ext.data.Store',

    proxy: {
        type: 'ajax',
        url: Store.rdmtoken && Store.rdmtoken.config && Store.rdmtoken.config.ApiConfig
            ? Store.rdmtoken.config.ApiConfig.getUrl('contractList')
            : '/api/rdm/contracts',
        reader: {
            type: 'json',
            // Top-level contracts list with pagination
            rootProperty: 'contracts',
            totalProperty: 'pagination.totalRecords'
        },
        headers: {
            'Accept': 'application/json'
        }
    },

    fields: [
        'contractStartDate',
        'contractEndDate',
        'contractExpirationDate', 
        'customerName',
        'customerCode', 
        'salesRepresentative', 
        'rentalOrderNumber',
        'geofenceDetails',
        'contractValue',
        'status',
        'contractStatus',
        'paymentTerms',
        'renewalOptions'
    ],

    // Load contract by serial number
    loadBySerialNumber: function(serialNumber, callback) {
        var proxy = this.getProxy();
        var originalUrl = proxy.getUrl();
        var api = Store.rdmtoken && Store.rdmtoken.config && Store.rdmtoken.config.ApiConfig;
        var baseUrl = api ? api.getUrl('contractList') : '/api/rdm/contracts';
        var url = baseUrl + '?serialNumber=' + encodeURIComponent(serialNumber);

        proxy.setUrl(url);

        this.load({
            callback: function(records, operation, success) {
                // Restore original URL
                proxy.setUrl(originalUrl);

                if (callback) {
                    callback(records, operation, success);
                }
            },
            scope: this
        });
    },

    // Validate contract status for token generation
    validateContractForToken: function(serialNumber, callback) {
        this.loadBySerialNumber(serialNumber, function(records, operation, success) {
            if (success && records.length > 0) {
                var contract = records[0];
                var contractData = contract.getData();
                
                var isValid = this.isContractValid(contractData);
                var validationResult = {
                    isValid: isValid,
                    contract: contractData,
                    issues: []
                };
                
                if (!isValid) {
                    validationResult.issues = this.getContractIssues(contractData);
                }
                
                if (callback) {
                    callback(validationResult);
                }
            } else {
                if (callback) {
                    callback({
                        isValid: false,
                        contract: null,
                        issues: ['Contract not found']
                    });
                }
            }
        }.bind(this));
    },

    // Check if contract is valid for token generation
    isContractValid: function(contractData) {
        var now = new Date();
        var startDate = new Date(contractData.contractStartDate);
        var endDateValue = contractData.contractEndDate || contractData.contractExpirationDate;
        var endDate = new Date(endDateValue);
        var contractStatus = contractData.status || contractData.contractStatus;
        
        // Contract must be active (current date between start and end)
        if (now < startDate || now > endDate) {
            return false;
        }
        
        // Contract status must be active
        if (contractStatus !== 'active') {
            return false;
        }
        
        // Must have required fields
        if (!contractData.customerName || !contractData.rentalOrderNumber) {
            return false;
        }
        
        return true;
    },

    // Get list of contract validation issues
    getContractIssues: function(contractData) {
        var issues = [];
        var now = new Date();
        
        if (contractData.contractStartDate) {
            var startDate = new Date(contractData.contractStartDate);
            if (now < startDate) {
                issues.push('Contract has not started yet');
            }
        }
        
        var endDateValue = contractData.contractEndDate || contractData.contractExpirationDate;
        if (endDateValue) {
            var endDate = new Date(endDateValue);
            if (now > endDate) {
                issues.push('Contract has expired');
            }
        }
        
        var contractStatus = contractData.status || contractData.contractStatus;
        if (contractStatus !== 'active') {
            issues.push('Contract status is not active: ' + contractStatus);
        }
        
        if (!contractData.customerName) {
            issues.push('Customer name is missing');
        }
        
        if (!contractData.rentalOrderNumber) {
            issues.push('Rental order number is missing');
        }
        
        return issues;
    },

    listeners: {
        beforeload: function(store, operation) {
            console.log('Loading contract data...');
        },
        
        load: function(store, records, successful) {
            if (successful) {
                console.log('Contract loaded:', records.length, 'records');
            } else {
                console.error('Failed to load contract');
            }
        },
        
        exception: function(proxy, response, operation) {
            console.error('Contract store exception:', response.status, response.statusText);
        }
    }
});
