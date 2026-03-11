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
        console.log('=== SHOWING CREATE REQUEST MODAL ===');
        
        // Check if we have selected vehicle data for auto-fill
        var selectedVehicle = window.RDMSelectedVehicle;
        if (selectedVehicle && selectedVehicle.vin) {
            console.log('Selected vehicle found, showing auto-fill modal:', selectedVehicle);
            this.showCreateRequestModalWithVehicle(selectedVehicle);
        } else {
            console.log('No vehicle selected, showing empty modal');
            this.showCreateRequestModalEmpty();
        }
    },

    showCreateRequestModalWithVehicle: function(vehicleData) {
        console.log('=== AUTO-FILL MODAL WITH VEHICLE DATA ===');
        console.log('Vehicle data:', vehicleData);
        
        // Create the modal first, then fetch contract data
        var modal = this.createTokenRequestModal(true, vehicleData);
        modal.show();
        
        // Fetch contract data for auto-fill
        this.fetchContractBySerialNumber(vehicleData.vin, modal);
    },

    showCreateRequestModalEmpty: function() {
        console.log('=== EMPTY CREATE REQUEST MODAL ===');
        
        var modal = this.createTokenRequestModal(false, null);
        modal.show();
    },

    createTokenRequestModal: function(isAutoFill, vehicleData) {
        // Get viewport dimensions for responsive sizing
        var viewport = Ext.getBody().getViewSize();
        var modalWidth = Math.min(750, viewport.width - 40);
        var modalHeight = Math.min(650, viewport.height - 60);
        
        var titleSuffix = isAutoFill ? ' - ' + (vehicleData.model || 'Selected Vehicle') : '';
        
        var modal = Ext.create('Ext.window.Window', {
            title: '<i class="fa fa-key"></i> Create Request Token' + titleSuffix,
            modal: true,
            width: modalWidth,
            height: modalHeight,
            layout: 'fit',
            closable: true,
            resizable: true,
            constrainHeader: true,
            maximizable: true,
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
                cls: 'dark_form',
                ui: 'footer',
                items: [
                    '->',
                    {
                        text: 'Cancel',
                        iconCls: 'fa fa-times',
                        handler: function() { modal.close(); },
                        cls: 'x-btn-default-small',
                        minWidth: 100
                    },
                    {
                        text: 'Submit',
                        iconCls: 'fa fa-save',
                        handler: function() {
                            this.onSubmitTokenRequest(modal);
                        }.bind(this),
                        cls: 'x-btn-default-small',
                        minWidth: 100
                    }
                ]
            }]
        });

        // Auto-fill vehicle data if available
        if (isAutoFill && vehicleData) {
            // Pre-populate vehicle fields
            var form = modal.down('#tokenRequestForm');
            if (vehicleData.vin) {
                form.down('field[name=serialNumber]').setValue(vehicleData.vin);
                form.down('field[name=serialNumber]').setReadOnly(true);
            }
            if (vehicleData.uniqid) {
                form.down('field[name=imei]').setValue(vehicleData.uniqid);
                form.down('field[name=imei]').setReadOnly(true);
            }
        }

        return modal;
    },

    fetchContractBySerialNumber: function(serialNumber, modal) {
        console.log('Fetching contract for serial number:', serialNumber);
        
        // Access singleton correctly
        var apiConfig = Store.rdmtoken.config.ApiConfig;
        if (!apiConfig) {
            console.error('ApiConfig singleton not available');
            return;
        }
        
        try {
            var apiUrl = apiConfig.getUrl('contractList') + '?serialNumber=' + encodeURIComponent(serialNumber);
            console.log('Contract API URL:', apiUrl);
        } catch (e) {
            console.error('Error getting contract URL:', e);
            return;
        }
        
        Ext.Ajax.request({
            url: apiUrl,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000,
            success: function(response) {
                console.log('Contract fetch success:', response.responseText);
                
                try {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200 && result.body && result.body.contracts && result.body.contracts.length > 0) {
                        var contract = result.body.contracts[0]; // Use first contract
                        console.log('Contract found:', contract);
                        this.populateFormWithContract(modal, contract);
                    } else {
                        console.warn('No contract found for serial number:', serialNumber);
                        // Form remains with vehicle data only
                    }
                } catch (e) {
                    console.error('Error parsing contract response:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to fetch contract data:', response);
                // Form remains with vehicle data only
            }
        });
    },

    populateFormWithContract: function(modal, contractData) {
        console.log('Populating form with contract data:', contractData);
        
        var form = modal.down('#tokenRequestForm');
        if (!form) return;
        
        // Auto-fill contract fields with correct API field mapping
        if (contractData.customerName) {
            var customerField = form.down('field[name=customerName]');
            if (customerField) {
                customerField.setValue(contractData.customerName);
                customerField.setReadOnly(true);
                console.log('✓ Customer Name filled:', contractData.customerName);
            }
        }
        
        // Map rentalOrderNumber to roNumber form field
        if (contractData.rentalOrderNumber) {
            var roField = form.down('field[name=roNumber]');
            if (roField) {
                roField.setValue(contractData.rentalOrderNumber);
                roField.setReadOnly(true);
                console.log('✓ RO Number filled:', contractData.rentalOrderNumber);
            }
        }
        
        // Map contractStartDate to contractStart form field
        if (contractData.contractStartDate) {
            var startField = form.down('field[name=contractStart]');
            if (startField) {
                startField.setValue(new Date(contractData.contractStartDate));
                startField.setReadOnly(true);
                console.log('✓ Contract Start filled:', contractData.contractStartDate);
            }
        }
        
        // Map contractEndDate to contractExpired form field
        if (contractData.contractEndDate) {
            var expiredField = form.down('field[name=contractExpired]');
            if (expiredField) {
                expiredField.setValue(new Date(contractData.contractEndDate));
                expiredField.setReadOnly(true);
                console.log('✓ Contract End filled:', contractData.contractEndDate);
            }
        }
        
        if (contractData.contractValue) {
            var valueField = form.down('field[name=contractValue]');
            if (valueField) {
                valueField.setValue(contractData.contractValue);
                valueField.setReadOnly(true);
                console.log('✓ Contract Value filled:', contractData.contractValue);
            }
        }
        
        console.log('✅ Form population complete with correct field mapping');
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
        console.log('=== SUBMIT BUTTON CLICKED ===');
        
        var form = modal.down('#tokenRequestForm');
        console.log('Form found:', !!form);
        
        if (form.isValid()) {
            var values = form.getValues();
            var apiConfig = Store.rdmtoken.config.ApiConfig;
            
            // Log form values
            console.log('Form values:', values);
            
            // Prepare API data with correct formatting
            var requestData = {
                serialNumber: values.serialNumber,
                imei: values.imei,
                customerName: values.customerName,
                roNumber: values.roNumber,
                // Convert dates to ISO 8601 format with .000Z suffix
                contractStart: this.formatDateToISO(values.contractStart),
                contractExpired: this.formatDateToISO(values.contractExpired),
                periodStart: this.formatDateToISO(values.periodStart),
                periodExpiredToken: this.formatDateToISO(values.periodExpiredToken),
                // Ensure numeric values
                duration: parseInt(values.duration) + parseInt(values.additionalDuration || 0),
                contractValue: parseFloat(values.contractValue),
                requestorName: 'Current User'
            };
            
            var apiUrl = apiConfig.getUrl('tokenRequest');
            console.log('=== API REQUEST DETAILS ===');
            console.log('API URL:', apiUrl);
            console.log('Request Data:', requestData);
            console.log('API Config:', apiConfig);
            
            // Show loading mask to prevent duplicate submissions
            Ext.Msg.wait('Submitting token request...', 'Please wait');
            
            Ext.Ajax.request({
                url: apiUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                jsonData: requestData,
                timeout: 30000, // 30 second timeout
                success: function(response) {
                    Ext.Msg.hide(); // Hide loading mask
                    console.log('=== API SUCCESS RESPONSE ===');
                    console.log('Raw Response:', response);
                    console.log('Response Text:', response.responseText);
                    console.log('Response Status:', response.status);
                    
                    try {
                        var result = Ext.decode(response.responseText);
                        console.log('Parsed Result:', result);
                        
                        if (result.status === 200) {
                            console.log('✅ Token request created successfully');
                            Ext.Msg.alert('Success', 'Token request created successfully');
                            modal.close();
                            this.refreshTokenGrid();
                        } else {
                            console.error('❌ API returned error status:', result.status);
                            console.error('Error message:', result.body ? result.body.message : 'Unknown error');
                            Ext.Msg.alert('Error', result.body.message || 'Failed to create token request');
                        }
                    } catch (parseError) {
                        console.error('❌ Error parsing API response:', parseError);
                        console.error('Raw response was:', response.responseText);
                        Ext.Msg.alert('Error', 'Invalid response from server');
                    }
                }.bind(this),
                failure: function(response, options) {
                    console.log('=== API FAILURE RESPONSE ===');
                    console.error('❌ API Request failed');
                    console.error('Response:', response);
                    console.error('Response Status:', response.status);
                    console.error('Response Text:', response.responseText);
                    console.error('Options:', options);
                    
                    var errorMessage = 'Network error occurred';
                    if (response.responseText) {
                        try {
                            var errorResult = Ext.decode(response.responseText);
                            errorMessage = errorResult.body ? errorResult.body.message : errorResult.message || errorMessage;
                            console.error('Parsed error:', errorResult);
                        } catch (e) {
                            console.error('Could not parse error response:', e);
                        }
                    }
                    
                    Ext.Msg.alert('Error', errorMessage);
                }
            });
        } else {
            console.log('❌ Form validation failed');
            var invalidFields = [];
            form.getForm().getFields().each(function(field) {
                if (!field.isValid()) {
                    invalidFields.push(field.getName() + ': ' + field.getActiveError());
                }
            });
            console.log('Invalid fields:', invalidFields);
            
            Ext.Msg.alert('Validation Error', 'Please fill in all required fields correctly.');
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

    /**
     * Format date to ISO 8601 format required by API
     */
    formatDateToISO: function(dateValue) {
        if (!dateValue) return null;
        
        var date;
        if (dateValue instanceof Date) {
            date = dateValue;
        } else if (typeof dateValue === 'string') {
            date = new Date(dateValue);
        } else {
            return null;
        }
        
        // Ensure valid date
        if (isNaN(date.getTime())) {
            return null;
        }
        
        // Format to ISO string with .000Z suffix
        return date.toISOString();
    },

    // Helper methods
    findDashboardPanel: function() {
        return Ext.ComponentQuery.query('Store\\.rdmtoken\\.view\\.DashboardPanel')[0];
    },

    initializeGlobalTokenFunctions: function() {
        // Initialize global token management functions for UI interactions
        window.rdmToken = {
            generateToken: function(tokenId) {
                console.log('Generate token:', tokenId);
                this.generateToken(tokenId);
            }.bind(this),
            
            renewToken: function(tokenId) {
                console.log('Renew token:', tokenId);
                this.renewToken(tokenId);
            }.bind(this),
            
            topUpToken: function(tokenId) {
                console.log('Top up token:', tokenId);
                this.topUpToken(tokenId);
            }.bind(this),
            
            toggleToken: function(tokenId) {
                console.log('Toggle token:', tokenId);
                this.performTokenAction('toggle', tokenId);
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
    
    /**
     * Generate token for pending rental requests
     */
    generateToken: function(tokenId) {
        var me = this;
        
        Ext.Msg.confirm('Generate Token',
            'Generate RDM token for rental request "' + tokenId + '"?<br><br>' +
            'This will activate the token and make it available for use.',
            function(btn) {
                if (btn === 'yes') {
                    console.log('Generating token for:', tokenId);
                    
                    // Show loading mask
                    Ext.Msg.wait('Generating token...', 'Processing');
                    
                    // Prepare API request data
                    var apiConfig = Store.rdmtoken.config.ApiConfig;
                    var requestData = {
                        tokenId: tokenId,
                        action: 'generate',
                        timestamp: new Date().toISOString()
                    };
                    
                    console.log('=== GENERATE TOKEN API REQUEST ===');
                    console.log('API URL:', apiConfig.getUrl('tokenGenerate'));
                    console.log('Request Data:', requestData);
                    
                    // Call the actual API
                    Ext.Ajax.request({
                        url: apiConfig.getUrl('tokenGenerate'),
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        jsonData: requestData,
                        success: function(response) {
                            console.log('=== GENERATE TOKEN API SUCCESS ===');
                            console.log('Response:', response);
                            console.log('Response Text:', response.responseText);
                            
                            Ext.Msg.hide();
                            
                            try {
                                var result = Ext.decode(response.responseText);
                                console.log('Parsed Result:', result);
                                
                                if (result.status === 200) {
                                    console.log('✅ Token generated successfully');
                                    Ext.Msg.alert('Success',
                                        'Token generated successfully!<br><br>' +
                                        'Token ID: ' + tokenId + '<br>' +
                                        'Status: Active<br>' +
                                        'JWT Token: ' + (result.body.jwtToken ? result.body.jwtToken.substring(0, 20) + '...' : 'Generated') + '<br>' +
                                        'Valid until: ' + (result.body.expirationDate || Ext.util.Format.date(new Date(Date.now() + 30*24*60*60*1000), 'Y-m-d H:i'))
                                    );
                                } else {
                                    console.error('❌ API returned error status:', result.status);
                                    Ext.Msg.alert('Error', result.body ? result.body.message : 'Failed to generate token');
                                }
                            } catch (parseError) {
                                console.error('❌ Error parsing API response:', parseError);
                                Ext.Msg.alert('Error', 'Invalid response from server');
                            }
                            
                            // Refresh token grid regardless of success/error to show updated status
                            me.refreshTokenGrid();
                        },
                        failure: function(response, options) {
                            console.log('=== GENERATE TOKEN API FAILURE ===');
                            console.error('❌ API Request failed');
                            console.error('Response:', response);
                            console.error('Response Status:', response.status);
                            console.error('Response Text:', response.responseText);
                            
                            Ext.Msg.hide();
                            
                            var errorMessage = 'Failed to generate token - Network error occurred';
                            if (response.responseText) {
                                try {
                                    var errorResult = Ext.decode(response.responseText);
                                    errorMessage = errorResult.body ? errorResult.body.message : errorResult.message || errorMessage;
                                    console.error('Parsed error:', errorResult);
                                } catch (e) {
                                    console.error('Could not parse error response:', e);
                                }
                            }
                            
                            Ext.Msg.alert('Generate Token Failed', errorMessage);
                        }
                    });
                }
            }
        );
    },

    /**
     * Renew existing active or expired tokens
     */
    renewToken: function(tokenId) {
        var me = this;
        
        var renewForm = Ext.create('Ext.window.Window', {
            title: 'Renew Token - ' + tokenId,
            modal: true,
            width: 400,
            layout: 'fit',
            items: [{
                xtype: 'form',
                bodyPadding: 20,
                defaults: {
                    labelWidth: 120,
                    anchor: '100%',
                    margin: '0 0 15 0'
                },
                items: [{
                    xtype: 'numberfield',
                    name: 'renewal_days',
                    fieldLabel: 'Renewal Period',
                    value: 30,
                    minValue: 1,
                    maxValue: 365,
                    allowBlank: false,
                    fieldStyle: 'text-align: right',
                    listeners: {
                        change: function(field, newValue) {
                            var newExpiry = new Date(Date.now() + (newValue || 30) * 24 * 60 * 60 * 1000);
                            field.up('form').down('[name=new_expiry_preview]').setValue(
                                Ext.util.Format.date(newExpiry, 'Y-m-d H:i')
                            );
                        }
                    }
                }, {
                    xtype: 'displayfield',
                    name: 'new_expiry_preview',
                    fieldLabel: 'New Expiry Date',
                    value: Ext.util.Format.date(new Date(Date.now() + 30*24*60*60*1000), 'Y-m-d H:i')
                }, {
                    xtype: 'textarea',
                    name: 'renewal_notes',
                    fieldLabel: 'Notes',
                    height: 80,
                    emptyText: 'Optional notes for renewal...'
                }],
                buttons: [{
                    text: 'Cancel',
                    handler: function() {
                        renewForm.close();
                    }
                }, {
                    text: 'Renew Token',
                    formBind: true,
                    cls: 'btn-success',
                    handler: function() {
                        var formValues = this.up('form').getValues();
                        console.log('Renewing token:', tokenId, 'for', formValues.renewal_days, 'days');
                        
                        Ext.Msg.wait('Processing token renewal...', 'Please wait');
                        
                        // Simulate API call
                        setTimeout(function() {
                            Ext.Msg.hide();
                            renewForm.close();
                            Ext.Msg.alert('Success',
                                'Token renewed successfully!<br><br>' +
                                'Token ID: ' + tokenId + '<br>' +
                                'Extended by: ' + formValues.renewal_days + ' days<br>' +
                                'New expiry: ' + formValues.new_expiry_preview
                            );
                            
                            me.refreshTokenGrid();
                        }, 1500);
                    }
                }]
            }]
        });
        
        renewForm.show();
    },

    /**
     * Top up active tokens with additional credit/time
     */
    topUpToken: function(tokenId) {
        var me = this;
        
        var topUpForm = Ext.create('Ext.window.Window', {
            title: 'Top Up Token - ' + tokenId,
            modal: true,
            width: 450,
            layout: 'fit',
            items: [{
                xtype: 'form',
                bodyPadding: 20,
                defaults: {
                    labelWidth: 130,
                    anchor: '100%',
                    margin: '0 0 15 0'
                },
                items: [{
                    xtype: 'radiogroup',
                    fieldLabel: 'Top Up Type',
                    name: 'topup_type',
                    value: {topup_type: 'time'},
                    items: [
                        {boxLabel: 'Time Extension', name: 'topup_type', inputValue: 'time'},
                        {boxLabel: 'Usage Credit', name: 'topup_type', inputValue: 'credit'}
                    ],
                    listeners: {
                        change: function(radiogroup, newValue) {
                            var form = radiogroup.up('form');
                            var isTime = newValue.topup_type === 'time';
                            
                            form.down('[name=time_extension]').setVisible(isTime);
                            form.down('[name=credit_amount]').setVisible(!isTime);
                        }
                    }
                }, {
                    xtype: 'numberfield',
                    name: 'time_extension',
                    fieldLabel: 'Additional Days',
                    value: 15,
                    minValue: 1,
                    maxValue: 180,
                    allowBlank: false,
                    fieldStyle: 'text-align: right'
                }, {
                    xtype: 'numberfield',
                    name: 'credit_amount',
                    fieldLabel: 'Credit Amount',
                    value: 100,
                    minValue: 1,
                    maxValue: 10000,
                    allowBlank: false,
                    fieldStyle: 'text-align: right',
                    hidden: true
                }, {
                    xtype: 'textarea',
                    name: 'topup_notes',
                    fieldLabel: 'Notes',
                    height: 80,
                    emptyText: 'Reason for top up...'
                }],
                buttons: [{
                    text: 'Cancel',
                    handler: function() {
                        topUpForm.close();
                    }
                }, {
                    text: 'Apply Top Up',
                    formBind: true,
                    cls: 'btn-warning',
                    handler: function() {
                        var formValues = this.up('form').getValues();
                        console.log('Topping up token:', tokenId, formValues);
                        
                        Ext.Msg.wait('Processing token top up...', 'Please wait');
                        
                        // Prepare API request data
                        var apiConfig = Store.rdmtoken.config.ApiConfig;
                        var requestData = {
                            tokenId: tokenId,
                            topUpType: formValues.topup_type,
                            timeExtension: formValues.topup_type === 'time' ? parseInt(formValues.time_extension) : 0,
                            creditAmount: formValues.topup_type === 'credit' ? parseInt(formValues.credit_amount) : 0,
                            notes: formValues.topup_notes || '',
                            timestamp: new Date().toISOString()
                        };
                        
                        console.log('=== TOP UP TOKEN API REQUEST ===');
                        console.log('API URL:', apiConfig.getUrl('tokenTopup'));
                        console.log('Request Data:', requestData);
                        
                        // Call the actual API
                        Ext.Ajax.request({
                            url: apiConfig.getUrl('tokenTopup'),
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            jsonData: requestData,
                            success: function(response) {
                                console.log('=== TOP UP TOKEN API SUCCESS ===');
                                console.log('Response:', response.responseText);
                                
                                Ext.Msg.hide();
                                topUpForm.close();
                                
                                try {
                                    var result = Ext.decode(response.responseText);
                                    
                                    if (result.status === 200) {
                                        console.log('✅ Token topped up successfully');
                                        
                                        var topUpText = formValues.topup_type === 'time'
                                            ? formValues.time_extension + ' days added'
                                            : formValues.credit_amount + ' credits added';
                                            
                                        Ext.Msg.alert('Success',
                                            'Token topped up successfully!<br><br>' +
                                            'Token ID: ' + tokenId + '<br>' +
                                            'Top up: ' + topUpText
                                        );
                                    } else {
                                        console.error('❌ API returned error:', result.status);
                                        Ext.Msg.alert('Error', result.body ? result.body.message : 'Failed to top up token');
                                    }
                                } catch (parseError) {
                                    console.error('❌ Error parsing API response:', parseError);
                                    Ext.Msg.alert('Error', 'Invalid response from server');
                                }
                                
                                me.refreshTokenGrid();
                            },
                            failure: function(response) {
                                console.log('=== TOP UP TOKEN API FAILURE ===');
                                console.error('❌ API Request failed:', response);
                                
                                Ext.Msg.hide();
                                topUpForm.close();
                                
                                var errorMessage = 'Failed to top up token - Network error occurred';
                                if (response.responseText) {
                                    try {
                                        var errorResult = Ext.decode(response.responseText);
                                        errorMessage = errorResult.body ? errorResult.body.message : errorResult.message || errorMessage;
                                    } catch (e) {
                                        console.error('Could not parse error response:', e);
                                    }
                                }
                                
                                Ext.Msg.alert('Top Up Token Failed', errorMessage);
                            }
                        });
                    }
                }]
            }]
        });
        
        topUpForm.show();
    },
    
    showRenewTokenModal: function(tokenId) {
        // Delegate to main renewToken method
        this.renewToken(tokenId);
    },
    
    showTopupTokenModal: function(tokenId) {
        // Delegate to main topUpToken method
        this.topUpToken(tokenId);
    }
});
