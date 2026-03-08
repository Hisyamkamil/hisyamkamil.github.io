/**
 * Contracts Store
 * Data store for contract information with dynamic URL support
 */
Ext.define('Store.rdmtoken.store.ContractsStore', {
    extend: 'Ext.data.Store',

    proxy: {
        type: 'ajax',
        url: '/api/contracts/{serialNumber}',
        reader: {
            type: 'json'
        }
    },

    fields: [
        'contractStartDate',
        'contractExpirationDate', 
        'customerName',
        'customerCode', 
        'salesRepresentative', 
        'rentalOrderNumber',
        'geofenceDetails',
        'contractValue',
        'contractStatus',
        'paymentTerms',
        'renewalOptions'
    ],

    // Load contract by serial number
    loadBySerialNumber: function(serialNumber, callback) {
        var proxy = this.getProxy();
        var originalUrl = proxy.getUrl();
        
        // Replace placeholder with actual serial number
        var url = originalUrl.replace('{serialNumber}', serialNumber);
        proxy.setUrl(url);
        
        this.load({
            callback: function(records, operation, success) {
                // Restore original URL template
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
        var endDate = new Date(contractData.contractExpirationDate);
        
        // Contract must be active (current date between start and end)
        if (now < startDate || now > endDate) {
            return false;
        }
        
        // Contract status must be active
        if (contractData.contractStatus !== 'active') {
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
        
        if (contractData.contractExpirationDate) {
            var endDate = new Date(contractData.contractExpirationDate);
            if (now > endDate) {
                issues.push('Contract has expired');
            }
        }
        
        if (contractData.contractStatus !== 'active') {
            issues.push('Contract status is not active: ' + contractData.contractStatus);
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