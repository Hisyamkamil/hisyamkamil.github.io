/**
 * Token Controller
 * Handles all business logic for token operations
 */
Ext.define('Store.rdmtoken.controller.TokenController', {
    extend: 'Ext.Base',
    
    requires: [
        'Store.rdmtoken.config.ApiConfig'
    ],

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
        console.log('Token Management activated - loading token data...');
        this.loadTokenData();
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
        var apiConfig = Store.rdmtoken.config.ApiConfig;
        Ext.Ajax.request({
            url: apiConfig.getUrl('tokenReports'),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
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
    loadTokenData: function() {
        if (window.RDMStores && window.RDMStores.tokens) {
            console.log('Loading token data from API...');
            window.RDMStores.tokens.load({
                callback: function(records, operation, success) {
                    if (success) {
                        console.log('Token data loaded successfully:', records.length, 'tokens');
                        
                        // Find and refresh the grid
                        var grid = Ext.ComponentQuery.query('gridpanel[itemId=tokenGrid]')[0];
                        if (grid) {
                            console.log('Refreshing token grid view...');
                            grid.getView().refresh();
                        }
                    } else {
                        console.error('Failed to load token data from API');
                        if (operation && operation.getError()) {
                            console.error('API Error:', operation.getError());
                        }
                    }
                }
            });
        } else {
            console.warn('Token store not available - stores may not be initialized');
        }
    },

    refreshTokenGrid: function() {
        // Alias for loadTokenData for backward compatibility
        this.loadTokenData();
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
        console.log('=== SHOWING NEW CREATE REQUEST MODAL ===');
        
        // Get viewport dimensions for responsive sizing
        var viewport = Ext.getBody().getViewSize();
        var modalWidth = Math.min(750, viewport.width - 40);
        var modalHeight = Math.min(650, viewport.height - 60);
        
        var modal = Ext.create('Ext.window.Window', {
            title: '<i class="fa fa-plus-circle"></i> Create Request Token',
            modal: true,
            width: modalWidth,
            height: modalHeight,
            layout: 'fit',
            closable: true,
            resizable: true,
            constrainHeader: true,
            maximizable: true,
            cls: 'token-request-modal',
            items: [{
                xtype: 'form',
                itemId: 'tokenRequestForm',
                bodyPadding: '20 25 20 25',
                autoScroll: true,
                layout: 'anchor',
                bodyStyle: 'background: #f8f9fa;',
                defaults: {
                    anchor: '100%',
                    labelWidth: 130,
                    margin: '0 0 12 0',
                    labelStyle: 'font-weight: 600; color: #495057;'
                },
                items: [
                    // Device Information Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-microchip"></i> Device Information',
                        margin: '0 0 15 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'Serial Number *',
                                        name: 'serialNumber',
                                        allowBlank: false,
                                        emptyText: 'Enter serial number...',
                                        cls: 'required-field',
                                        listeners: {
                                            change: this.onSerialNumberChange.bind(this)
                                        }
                                    },
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'IMEI *',
                                        name: 'imei',
                                        allowBlank: false,
                                        emptyText: 'Enter IMEI...',
                                        cls: 'required-field',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            }
                        ]
                    },
                    
                    // Customer Information Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-user"></i> Customer Information',
                        margin: '0 0 15 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'Customer Name *',
                                        name: 'customerName',
                                        allowBlank: false,
                                        emptyText: 'Enter customer name...',
                                        cls: 'required-field'
                                    },
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'RO Number *',
                                        name: 'roNumber',
                                        allowBlank: false,
                                        emptyText: 'Enter RO number...',
                                        cls: 'required-field',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            }
                        ]
                    },
                    
                    // Contract & Period Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-calendar"></i> Contract & Period Details',
                        margin: '0 0 15 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'datefield',
                                        fieldLabel: 'Contract Start *',
                                        name: 'contractStart',
                                        allowBlank: false,
                                        format: 'd M Y',
                                        emptyText: 'DD MMM YYYY',
                                        cls: 'required-field'
                                    },
                                    {
                                        xtype: 'datefield',
                                        fieldLabel: 'Contract Expired *',
                                        name: 'contractExpired',
                                        allowBlank: false,
                                        format: 'd M Y',
                                        emptyText: 'DD MMM YYYY',
                                        cls: 'required-field',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            },
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                margin: '10 0 0 0',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'datefield',
                                        fieldLabel: 'Period Start *',
                                        name: 'periodStart',
                                        allowBlank: false,
                                        format: 'd M Y',
                                        emptyText: 'DD MMM YYYY',
                                        cls: 'required-field'
                                    },
                                    {
                                        xtype: 'datefield',
                                        fieldLabel: 'Period Expired *',
                                        name: 'periodExpiredToken',
                                        allowBlank: false,
                                        format: 'd M Y',
                                        emptyText: 'DD MMM YYYY',
                                        cls: 'required-field',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            }
                        ]
                    },
                    
                    // Duration & Value Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-clock-o"></i> Duration & Financial Details',
                        margin: '0 0 15 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        fieldLabel: 'Duration (Hours) *',
                                        name: 'duration',
                                        allowBlank: false,
                                        emptyText: 'Enter duration...',
                                        cls: 'required-field',
                                        minValue: 1,
                                        step: 1
                                    },
                                    {
                                        xtype: 'numberfield',
                                        fieldLabel: 'Additional Duration',
                                        name: 'additionalDuration',
                                        emptyText: 'Enter additional hours...',
                                        minValue: 0,
                                        value: 0,
                                        step: 1,
                                        margin: '0 0 0 8'
                                    }
                                ]
                            },
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                margin: '10 0 0 0',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        fieldLabel: 'Contract Value *',
                                        name: 'contractValue',
                                        allowBlank: false,
                                        emptyText: 'Enter contract value...',
                                        cls: 'required-field',
                                        decimalPrecision: 2,
                                        minValue: 0
                                    },
                                    {
                                        xtype: 'combobox',
                                        fieldLabel: 'Geofence *',
                                        name: 'geofence',
                                        allowBlank: false,
                                        emptyText: 'Select geofence...',
                                        cls: 'required-field',
                                        margin: '0 0 0 8',
                                        store: {
                                            data: [
                                                {value: 'default', text: 'Default Geofence'},
                                                {value: 'mining_area_1', text: 'Mining Area 1'},
                                                {value: 'mining_area_2', text: 'Mining Area 2'},
                                                {value: 'processing_area', text: 'Processing Area'}
                                            ]
                                        },
                                        displayField: 'text',
                                        valueField: 'value',
                                        queryMode: 'local',
                                        editable: false
                                    }
                                ]
                            }
                        ]
                    },
                    
                    // Location Information Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-map-marker"></i> Location Information',
                        margin: '0 0 5 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'fieldcontainer',
                                fieldLabel: 'Last Known Location',
                                layout: 'hbox',
                                items: [
                                    {
                                        xtype: 'displayfield',
                                        value: '<span style="color: #28a745; font-weight: 600;">02 Mar 2026</span>',
                                        width: 120,
                                        margin: '0 10 0 0'
                                    },
                                    {
                                        xtype: 'displayfield',
                                        value: '<span style="color: #28a745; font-weight: 600;">16:20:43</span>',
                                        width: 100
                                    },
                                    {
                                        xtype: 'displayfield',
                                        value: '<i class="fa fa-circle" style="color: #28a745; margin-left: 10px;"></i> <span style="color: #28a745;">Online</span>',
                                        margin: '0 0 0 10'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                ui: 'footer',
                padding: '10 20',
                style: 'background: #ffffff; border-top: 1px solid #dee2e6;',
                items: [
                    '->',
                    {
                        text: '<i class="fa fa-times"></i> Cancel',
                        handler: function() { modal.close(); },
                        scale: 'medium',
                        width: 100,
                        ui: 'default-toolbar'
                    },
                    {
                        text: '<i class="fa fa-check"></i> Submit Request',
                        handler: this.onSubmitTokenRequest.bind(this, modal),
                        scale: 'medium',
                        width: 140,
                        ui: 'default-toolbar',
                        cls: 'x-btn-default-small-focus'
                    }
                ]
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
            var apiConfig = Store.rdmtoken.config.ApiConfig;
            
            Ext.Ajax.request({
                url: apiConfig.getUrl('tokenRequest'),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
        var apiConfig = Store.rdmtoken.config.ApiConfig;
        return Ext.Ajax.request({
            url: apiConfig.getUrl('tokenGenerate'),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            jsonData: tokenData
        });
    },

    validateToken: function(jwtToken, deviceInfo) {
        var apiConfig = Store.rdmtoken.config.ApiConfig;
        return Ext.Ajax.request({
            url: apiConfig.getUrl('tokenValidate'),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            jsonData: {
                jwtToken: jwtToken,
                deviceImei: deviceInfo.imei,
                serialNumber: deviceInfo.serialNumber,
                currentTimestamp: new Date().toISOString(), // Use ISO format for AWS API
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
        var apiConfig = Store.rdmtoken.config.ApiConfig;
        var actionEndpoints = {
            'renew': 'tokenRenew',
            'topup': 'tokenTopup'
            // Note: toggle and changeunit are not in the API spec, may need custom implementation
        };

        var endpoint = actionEndpoints[action];
        if (!endpoint) {
            console.error('Unknown or unsupported token action:', action);
            Ext.Msg.alert('Error', 'This action is not currently supported');
            return;
        }

        // For renew and topup, we need more data - show appropriate modal
        if (action === 'renew') {
            this.showRenewTokenModal(tokenId);
        } else if (action === 'topup') {
            this.showTopupTokenModal(tokenId);
        } else {
            // Generic action (if any are added in future)
            Ext.Ajax.request({
                url: apiConfig.getUrl(endpoint),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                jsonData: { tokenId: tokenId },
                success: function(response) {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        Ext.Msg.alert('Success', 'Token action completed successfully');
                        this.refreshTokenGrid();
                    } else {
                        Ext.Msg.alert('Error', result.body.message || 'Action failed');
                    }
                }.bind(this),
                failure: function() {
                    Ext.Msg.alert('Error', 'Network error occurred');
                }
            });
        }
    },
    
    showRenewTokenModal: function(tokenId) {
        // TODO: Implement renew token modal with required fields from API spec
        Ext.Msg.alert('Info', 'Renew token functionality will be implemented');
    },
    
    showTopupTokenModal: function(tokenId) {
        // TODO: Implement topup token modal with required fields from API spec
        Ext.Msg.alert('Info', 'Topup token functionality will be implemented');
    }
});
