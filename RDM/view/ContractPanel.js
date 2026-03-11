/**
 * Contract Panel Component  
 * Main interface for contract management with layout similar to TokenManagementPanel
 */
Ext.define('Store.rdmtoken.view.ContractPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'rdmcontractpanel',
    layout: 'border',

    config: {
        controller: null
    },

    initComponent: function() {
        this.items = [
            this.createContractToolbar(),
            this.createContractGrid()
        ];

        this.callParent(arguments);
    },

    createContractToolbar: function() {
        return {
            region: 'north',
            xtype: 'toolbar',
            height: 50,
            items: [
                {
                    xtype: 'textfield',
                    emptyText: 'Search by customer, serial number, RO...',
                    width: 280,
                    itemId: 'searchField',
                    enableKeyEvents: true,
                    listeners: {
                        keyup: {
                            fn: this.onContractSearch.bind(this),
                            buffer: 300 // Debounce search
                        },
                        specialkey: this.onSearchSpecialKey.bind(this)
                    }
                },
                {
                    xtype: 'combobox',
                    displayField: 'label',
                    valueField: 'value',
                    value: 'all',
                    width: 120,
                    itemId: 'statusFilter',
                    store: {
                        data: [
                            {value: 'all', label: 'All Status'},
                            {value: 'active', label: 'Active'},
                            {value: 'expired', label: 'Expired'},
                            {value: 'terminated', label: 'Terminated'}
                        ]
                    },
                    listeners: {
                        change: this.onStatusFilter.bind(this)
                    }
                },
                {
                    xtype: 'textfield',
                    emptyText: 'Sales Rep',
                    width: 120,
                    itemId: 'salesRepFilter',
                    enableKeyEvents: true,
                    listeners: {
                        keyup: {
                            fn: this.onSalesRepFilter.bind(this),
                            buffer: 300
                        }
                    }
                },
                {
                    xtype: 'button',
                    text: 'Clear',
                    iconCls: 'fa fa-times',
                    handler: this.clearAllFilters.bind(this)
                },
                '->',
                {
                    xtype: 'button',
                    text: 'Create Contract',
                    iconCls: 'fa fa-plus',
                    cls: 'btn-primary',
                    itemId: 'createContractBtn',
                    handler: this.showCreateContractModal.bind(this)
                }
            ]
        };
    },

    createContractGrid: function() {
        return {
            region: 'center',
            xtype: 'gridpanel',
            itemId: 'contractGrid',
            store: null, // Will be set later after stores are initialized
            columns: [
                {
                    text: 'Status',
                    dataIndex: 'status',
                    width: 100,
                    renderer: this.statusRenderer.bind(this)
                },
                {
                    text: 'Actions',
                    width: 180,
                    renderer: this.actionColumnRenderer.bind(this)
                },
                {
                    text: 'Customer Name',
                    dataIndex: 'customerName',
                    flex: 2
                },
                {
                    text: 'RO Number',
                    dataIndex: 'rentalOrderNumber',
                    flex: 1
                },
                {
                    text: 'Serial Number',
                    dataIndex: 'serialNumber',
                    flex: 1,
                    renderer: function(value, metaData, record) {
                        // Get from nested unitDetails
                        var unitDetails = record.get('unitDetails');
                        return unitDetails ? unitDetails.serialNumber : 'N/A';
                    }
                },
                {
                    text: 'Unit Name',
                    dataIndex: 'unitName',
                    flex: 1,
                    renderer: function(value, metaData, record) {
                        var unitDetails = record.get('unitDetails');
                        return unitDetails ? unitDetails.unitName : 'N/A';
                    }
                },
                {
                    text: 'Sales Rep',
                    dataIndex: 'salesRepresentative',
                    flex: 1,
                    renderer: function(value) {
                        return value || 'N/A';
                    }
                },
                {
                    text: 'Contract Value',
                    dataIndex: 'contractValue',
                    flex: 1,
                    renderer: function(value) {
                        if (value) {
                            return 'Rp ' + Ext.util.Format.number(value, '0,0');
                        }
                        return 'N/A';
                    }
                },
                {
                    text: 'Start Date',
                    dataIndex: 'contractStartDate',
                    flex: 1,
                    renderer: function(value) {
                        if (value) {
                            return Ext.util.Format.date(new Date(value), 'd M Y');
                        }
                        return 'N/A';
                    }
                },
                {
                    text: 'End Date',
                    dataIndex: 'contractEndDate',
                    flex: 1,
                    renderer: function(value) {
                        if (value) {
                            return Ext.util.Format.date(new Date(value), 'd M Y');
                        }
                        return 'N/A';
                    }
                }
            ],
            listeners: {
                selectionchange: this.onContractSelectionChange.bind(this)
            }
        };
    },

    actionColumnRenderer: function(value, metaData, record) {
        var contractId = record.get('id');
        var status = record.get('status');
        var html = '<div class="contract-actions" style="display: flex; gap: 5px; align-items: center;">';
        
        // Action buttons based on contract status
        switch(status) {
            case 'active':
                html += '<button class="action-btn btn-primary" onclick="rdmContract.viewContract(\'' + contractId + '\')" style="padding: 4px 8px; font-size: 11px;">View</button>';
                html += '<button class="action-btn btn-warning" onclick="rdmContract.editContract(\'' + contractId + '\')" style="padding: 4px 8px; font-size: 11px; margin-left: 3px;">Edit</button>';
                break;
                
            case 'expired':
                html += '<button class="action-btn btn-info" onclick="rdmContract.renewContract(\'' + contractId + '\')" style="padding: 4px 8px; font-size: 11px;">Renew</button>';
                html += '<button class="action-btn btn-secondary" onclick="rdmContract.viewContract(\'' + contractId + '\')" style="padding: 4px 8px; font-size: 11px; margin-left: 3px;">View</button>';
                break;
                
            case 'terminated':
                html += '<button class="action-btn btn-secondary" onclick="rdmContract.viewContract(\'' + contractId + '\')" style="padding: 4px 8px; font-size: 11px;">View Only</button>';
                break;
                
            default:
                html += '<button class="action-btn btn-primary" onclick="rdmContract.viewContract(\'' + contractId + '\')" style="padding: 4px 8px; font-size: 11px;">View</button>';
                html += '<button class="action-btn btn-warning" onclick="rdmContract.editContract(\'' + contractId + '\')" style="padding: 4px 8px; font-size: 11px; margin-left: 3px;">Edit</button>';
                break;
        }
        
        html += '</div>';
        return html;
    },

    statusRenderer: function(value) {
        var statusConfig = {
            'active': {color: '#28a745', text: 'Active'},
            'expired': {color: '#dc3545', text: 'Expired'},
            'terminated': {color: '#6c757d', text: 'Terminated'}
        };
        
        var config = statusConfig[value] || {color: '#6c757d', text: value || 'Unknown'};
        return '<span style="color: ' + config.color + '; font-weight: bold;">' + config.text + '</span>';
    },

    onContractSelectionChange: function(model, selected) {
        if (selected.length > 0) {
            this.showContractDetails(selected[0]);
        }
    },

    showContractDetails: function(record) {
        var controller = this.findController();
        if (controller) {
            controller.showContractDetails(record);
        } else {
            console.log('Selected contract:', record.getData());
        }
    },

    showCreateContractModal: function() {
        var controller = this.findController();
        if (controller) {
            controller.showCreateContractModal();
        } else {
            console.error('Controller not found for showCreateContractModal');
            Ext.Msg.alert('Error', 'Unable to open create contract modal - controller not found');
        }
    },

    // Helper method to find the controller
    findController: function() {
        // First try to get from this panel's config
        if (this.getController()) {
            return this.getController();
        }
        
        // Try global reference
        if (window.rdmTokenController) {
            return window.rdmTokenController;
        }
        
        // Try to find from parent MainPanel
        var mainPanel = Ext.ComponentQuery.query('Store\\.rdmtoken\\.view\\.MainPanel')[0];
        if (mainPanel && mainPanel.controller) {
            return mainPanel.controller;
        }
        
        // Create temporary controller if none found
        console.warn('Creating temporary controller for contract operations');
        return Ext.create('Store.rdmtoken.controller.TokenController');
    },

    // Helper method to get contract store
    getContractStore: function() {
        // Wait for global stores to be initialized
        if (window.RDMStores && window.RDMStores.contracts) {
            console.log('Using global contract store');
            return window.RDMStores.contracts;
        }
        
        console.warn('Global RDMStores not available, will retry...');
        return null; // Don't create fallback, wait for global stores
    },
    
    // Method to bind store after component render
    afterRender: function() {
        this.callParent(arguments);
        
        // Ensure store is properly bound
        var grid = this.down('#contractGrid');
        var store = this.getContractStore();
        
        console.log('ContractPanel afterRender - Grid:', !!grid);
        
        // Retry getting store if not available initially
        var retryCount = 0;
        var maxRetries = 10;
        
        var bindStore = function() {
            var store = this.getContractStore();
            console.log('Attempt', retryCount + 1, '- Contract Store available:', !!store);
            
            if (store && grid) {
                console.log('Binding contract store to grid...');
                grid.setStore(store);
            
                // Add store listeners for debugging
                store.on('load', function(store, records, successful) {
                    console.log('Contract Store load event - Success:', successful, 'Records:', records.length);
                    if (successful && records.length > 0) {
                        console.log('First contract record data:', records[0].getData());
                        console.log('Grid store after load:', grid.getStore().getCount());
                        
                        // Force grid refresh
                        setTimeout(function() {
                            console.log('Forcing contract grid view refresh...');
                            if (grid.getView()) {
                                grid.getView().refresh();
                            }
                        }, 100);
                    }
                });
                
                // Check if store already has data
                if (store.getCount() > 0) {
                    console.log('Contract store already has data:', store.getCount(), 'records');
                    grid.getView().refresh();
                }
            } else if (retryCount < maxRetries) {
                // Retry after 100ms
                retryCount++;
                setTimeout(bindStore.bind(this), 100);
            } else {
                console.error('Failed to get contract store after', maxRetries, 'attempts');
            }
        }.bind(this);
        
        // Start trying to bind the store
        bindStore();
    },

    // Search and filter event handlers
    onContractSearch: function(field, newValue) {
        console.log('Contract search triggered:', newValue);
        var controller = this.findController();
        if (controller && controller.applyContractFilters) {
            controller.applyContractFilters();
        } else {
            console.error('No controller found for contract search');
        }
    },

    onSearchSpecialKey: function(field, e) {
        if (e.getKey() === e.ENTER) {
            console.log('Enter key pressed in contract search field');
            var controller = this.findController();
            if (controller && controller.applyContractFilters) {
                controller.applyContractFilters();
            } else {
                console.error('No controller found for contract search special key');
            }
        }
    },

    onStatusFilter: function(combo, newValue) {
        console.log('Contract status filter changed:', newValue);
        var controller = this.findController();
        if (controller && controller.applyContractFilters) {
            controller.applyContractFilters();
        } else {
            console.error('No controller found for contract status filter');
        }
    },

    onSalesRepFilter: function(field, newValue) {
        console.log('Sales rep filter changed:', newValue);
        var controller = this.findController();
        if (controller && controller.applyContractFilters) {
            controller.applyContractFilters();
        } else {
            console.error('No controller found for sales rep filter');
        }
    },

    clearAllFilters: function() {
        console.log('Clear all contract filters clicked');
        
        // Reset all filter fields
        var searchField = this.down('#searchField');
        var statusFilter = this.down('#statusFilter');
        var salesRepFilter = this.down('#salesRepFilter');
        
        if (searchField) searchField.setValue('');
        if (statusFilter) statusFilter.setValue('all');
        if (salesRepFilter) salesRepFilter.setValue('');
        
        // Apply filters to reload data
        var controller = this.findController();
        if (controller && controller.applyContractFilters) {
            controller.applyContractFilters();
        } else {
            console.error('No controller found for clear contract filters');
        }
        
        // Show user feedback
        Ext.toast({
            html: 'All contract filters have been cleared',
            title: 'Filters Reset',
            width: 220,
            align: 't'
        });
    },

    // Helper method to get current filter values
    getCurrentFilters: function() {
        var filters = {};
        
        var searchField = this.down('#searchField');
        var statusFilter = this.down('#statusFilter');
        var salesRepFilter = this.down('#salesRepFilter');
        
        if (searchField && searchField.getValue()) {
            filters.search = searchField.getValue();
        }
        
        if (statusFilter && statusFilter.getValue() !== 'all') {
            filters.status = statusFilter.getValue();
        }
        
        if (salesRepFilter && salesRepFilter.getValue()) {
            filters.salesRepresentative = salesRepFilter.getValue();
        }
        
        return filters;
    }
});
