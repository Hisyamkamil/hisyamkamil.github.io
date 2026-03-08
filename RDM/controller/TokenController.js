/**
 * Token Controller
 * Handles all business logic for token operations
 */
Ext.define('Store.rdmtoken.controller.TokenController', {
    extend: 'Ext.Base',

    config: {
        mainPanel: null,
        navigationTab: null
    },

    constructor: function(config) {
        this.callParent([config]);
        this.initializeGlobalTokenFunctions();
    },

    // Navigation event handlers
    onDashboardActivate: function() {
        console.log('Dashboard activated');
        this.loadDashboardMetrics();
    },

    onTokenManagementActivate: function() {
        console.log('Token Management activated');
        this.refreshTokenGrid();
    },

    onLocationMonitoringActivate: function() {
        console.log('Location Monitoring activated');
        this.loadLocationData();
    },

    onContractActivate: function() {
        console.log('Contract activated');
    },

    onApprovalActivate: function() {
        console.log('Approval activated');
    },

    onReportActivate: function() {
        console.log('Report activated');
    },

    // Dashboard methods
    loadDashboardMetrics: function() {
        Ext.Ajax.request({
            url: '/api/rdm/token/reports',
            method: 'GET',
            success: this.onDashboardMetricsLoaded.bind(this),
            failure: function() {
                console.warn('Failed to load dashboard metrics');
            }
        });
    },

    onDashboardMetricsLoaded: function(response) {
        try {
            var result = Ext.decode(response.responseText);
            if (result.status === 200 && result.body.summary) {
                var dashboardPanel = this.findDashboardPanel();
                if (dashboardPanel && dashboardPanel.updateMetricCards) {
                    dashboardPanel.updateMetricCards(result.body.summary);
                }
            }
        } catch (e) {
            console.error('Error parsing dashboard metrics:', e);
        }
    },

    // Token Management methods
    refreshTokenGrid: function() {
        if (window.RDMStores && window.RDMStores.tokens) {
            window.RDMStores.tokens.reload();
        }
    },

    onTokenSearch: function(searchValue) {
        var store = window.RDMStores.tokens;
        if (!store) return;
        
        store.clearFilter();
        if (searchValue) {
            store.filterBy(function(record) {
                var searchFields = ['requestor', 'tokenNumber', 'roNumber', 'customerName'];
                return searchFields.some(function(fieldName) {
                    var fieldValue = record.get(fieldName);
                    return fieldValue && fieldValue.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1;
                });
            });
        }
    },

    onStatusFilter: function(statusValue) {
        var store = window.RDMStores.tokens;
        if (!store) return;
        
        store.clearFilter();
        if (statusValue && statusValue !== 'all') {
            store.filter('status', statusValue);
        }
    },

    showTokenDetails: function(record) {
        console.log('Token details:', record.getData());
        // Could show a detailed popup or side panel
        this.openTokenDetailsWindow(record);
    },

    openTokenDetailsWindow: function(record) {
        var window = Ext.create('Ext.window.Window', {
            title: 'Token Details - ' + (record.get('tokenNumber') || 'Unknown'),
            modal: true,
            width: 600,
            height: 400,
            layout: 'fit',
            items: [{
                xtype: 'panel',
                bodyPadding: 20,
                html: this.generateTokenDetailsHtml(record)
            }],
            buttons: [{
                text: 'Close',
                handler: function() { window.close(); }
            }]
        });
        window.show();
    },

    generateTokenDetailsHtml: function(record) {
        var data = record.getData();
        return [
            '<h3>Token Information</h3>',
            '<table style="width: 100%; border-collapse: collapse;">',
            '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Token Number:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + (data.tokenNumber || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + (data.customerName || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>RO Number:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + (data.roNumber || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Status:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + (data.status || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Remaining Hours:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + (data.remainingHours || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Expiration Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + (data.expirationDate || 'N/A') + '</td></tr>',
            '</table>'
        ].join('');
    },

    showCreateRequestModal: function() {
        var modal = Ext.create('Ext.window.Window', {
            title: 'Create Token Request',
            modal: true,
            width: 600,
            height: 700,
            layout: 'fit',
            items: [{
                xtype: 'form',
                itemId: 'tokenRequestForm',
                bodyPadding: 20,
                defaults: {
                    xtype: 'textfield',
                    anchor: '100%',
                    labelWidth: 150,
                    margin: '0 0 10 0'
                },
                items: [
                    {
                        fieldLabel: 'Serial Number *',
                        name: 'serialNumber',
                        allowBlank: false,
                        listeners: {
                            change: this.onSerialNumberChange.bind(this)
                        }
                    },
                    {
                        fieldLabel: 'IMEI *',
                        name: 'imei',
                        allowBlank: false,
                        readOnly: true
                    },
                    {
                        fieldLabel: 'Customer Name *',
                        name: 'customerName',
                        allowBlank: false
                    },
                    {
                        fieldLabel: 'RO Number *',
                        name: 'roNumber',
                        allowBlank: false
                    },
                    {
                        xtype: 'datefield',
                        fieldLabel: 'Contract Start *',
                        name: 'contractStart',
                        allowBlank: false
                    },
                    {
                        xtype: 'datefield',
                        fieldLabel: 'Contract Expired *',
                        name: 'contractExpired',
                        allowBlank: false
                    },
                    {
                        xtype: 'datefield',
                        fieldLabel: 'Period Start *',
                        name: 'periodStart',
                        allowBlank: false
                    },
                    {
                        xtype: 'datefield',
                        fieldLabel: 'Period Expired Token *',
                        name: 'periodExpiredToken',
                        allowBlank: false
                    },
                    {
                        xtype: 'numberfield',
                        fieldLabel: 'Duration (hours) *',
                        name: 'duration',
                        allowBlank: false,
                        minValue: 1
                    },
                    {
                        xtype: 'numberfield',
                        fieldLabel: 'Additional Duration',
                        name: 'additionalDuration',
                        minValue: 0,
                        value: 0
                    },
                    {
                        xtype: 'numberfield',
                        fieldLabel: 'Contract Value *',
                        name: 'contractValue',
                        allowBlank: false,
                        decimalPrecision: 2
                    },
                    {
                        xtype: 'combobox',
                        fieldLabel: 'Geofence *',
                        name: 'geofence',
                        allowBlank: false,
                        store: {
                            data: [{value: 'default', text: 'Default Geofence'}]
                        },
                        displayField: 'text',
                        valueField: 'value'
                    },
                    {
                        xtype: 'displayfield',
                        fieldLabel: 'Last Time Location',
                        name: 'lastTimeLocation',
                        value: '02 Mar 2026 16:20:43'
                    }
                ]
            }],
            buttons: [{
                text: 'Cancel',
                handler: function() { modal.close(); }
            }, {
                text: 'Submit',
                cls: 'btn-primary',
                handler: this.onSubmitTokenRequest.bind(this, modal)
            }]
        });

        modal.show();
    },

    onSerialNumberChange: function(field, newValue) {
        if (newValue && window.RDMStores && window.RDMStores.units) {
            this.loadUnitDetails(newValue, field.up('form'));
        }
    },

    loadUnitDetails: function(serialNumber, form) {
        var store = window.RDMStores.units;
        if (!store) return;
        
        store.load({
            callback: function(records) {
                var unit = null;
                Ext.each(records, function(record) {
                    if (record.get('serialnumber') === serialNumber) {
                        unit = record;
                        return false;
                    }
                });
                
                if (unit) {
                    form.down('field[name=imei]').setValue(unit.get('imei'));
                    form.down('field[name=lastTimeLocation]').setValue(new Date().toLocaleString());
                }
            }
        });
    },

    onSubmitTokenRequest: function(modal) {
        var form = modal.down('#tokenRequestForm');
        if (form.isValid()) {
            var values = form.getValues();
            
            Ext.Ajax.request({
                url: '/api/rdm/token/request',
                method: 'POST',
                jsonData: {
                    serialNumber: values.serialNumber,
                    imei: values.imei,
                    customerName: values.customerName,
                    roNumber: values.roNumber,
                    contractStart: values.contractStart,
                    contractExpired: values.contractExpired,
                    periodStart: values.periodStart,
                    periodExpiredToken: values.periodExpiredToken,
                    duration: values.duration,
                    additionalDuration: values.additionalDuration || 0,
                    contractValue: values.contractValue,
                    geofence: values.geofence,
                    requestorName: 'Current User'
                },
                success: function(response) {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        Ext.Msg.alert('Success', 'Token request created successfully');
                        modal.close();
                        this.refreshTokenGrid();
                    } else {
                        Ext.Msg.alert('Error', result.body.message || 'Failed to create token request');
                    }
                }.bind(this),
                failure: function() {
                    Ext.Msg.alert('Error', 'Network error occurred');
                }
            });
        }
    },

    // Location Monitoring methods
    loadLocationData: function() {
        if (window.RDMStores && window.RDMStores.units) {
            window.RDMStores.units.load();
        }
    },

    onUnitSearch: function(searchValue) {
        console.log('Unit search:', searchValue);
        // Implement unit filtering logic
    },

    // JWT and Security methods
    generateJWTToken: function(tokenData) {
        return Ext.Ajax.request({
            url: '/api/rdm/token/generate',
            method: 'POST',
            jsonData: tokenData
        });
    },

    validateToken: function(jwtToken, deviceInfo) {
        return Ext.Ajax.request({
            url: '/api/rdm/token/validate',
            method: 'POST',
            jsonData: {
                jwtToken: jwtToken,
                deviceImei: deviceInfo.imei,
                serialNumber: deviceInfo.serialNumber,
                currentTimestamp: new Date().getTime(),
                deviceSignature: this.generateDeviceSignature(deviceInfo)
            }
        });
    },

    generateDeviceSignature: function(deviceInfo) {
        // Generate device-specific signature for security
        var data = deviceInfo.imei + deviceInfo.serialNumber + new Date().getTime();
        // In real implementation, use proper cryptographic signature
        return btoa(data);
    },

    // Helper methods
    findDashboardPanel: function() {
        return Ext.ComponentQuery.query('Store\\.rdmtoken\\.view\\.DashboardPanel')[0];
    },

    initializeGlobalTokenFunctions: function() {
        // Initialize global token management functions for UI interactions
        window.rdmToken = {
            toggleToken: function(tokenId) {
                console.log('Toggle token:', tokenId);
                this.performTokenAction('toggle', tokenId);
            }.bind(this),
            
            renewToken: function(tokenId) {
                console.log('Renew token:', tokenId);
                this.performTokenAction('renew', tokenId);
            }.bind(this),
            
            topUpToken: function(tokenId) {
                console.log('Top up token:', tokenId);
                this.performTokenAction('topup', tokenId);
            }.bind(this),
            
            changeUnit: function(tokenId) {
                console.log('Change unit for token:', tokenId);
                this.performTokenAction('changeunit', tokenId);
            }.bind(this)
        };
    },

    performTokenAction: function(action, tokenId) {
        // Generic method to handle token actions
        var actionUrls = {
            'toggle': '/api/rdm/token/toggle',
            'renew': '/api/rdm/token/renew',
            'topup': '/api/rdm/token/topup',
            'changeunit': '/api/rdm/token/changeunit'
        };

        var url = actionUrls[action];
        if (!url) {
            console.error('Unknown token action:', action);
            return;
        }

        Ext.Ajax.request({
            url: url,
            method: 'POST',
            jsonData: { tokenId: tokenId },
            success: function(response) {
                var result = Ext.decode(response.responseText);
                if (result.status === 200) {
                    Ext.Msg.alert('Success', 'Token action completed successfully');
                    this.refreshTokenGrid();
                } else {
                    Ext.Msg.alert('Error', result.message || 'Action failed');
                }
            }.bind(this),
            failure: function() {
                Ext.Msg.alert('Error', 'Network error occurred');
            }
        });
    }
});