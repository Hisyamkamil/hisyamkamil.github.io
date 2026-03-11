/**
 * Token Management Panel Component
 * Main interface for token operations with grid and controls
 */
Ext.define('Store.rdmtoken.view.TokenManagementPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'rdmtokenmanagementpanel',
    layout: 'border',

    config: {
        controller: null
    },

    initComponent: function() {
        this.items = [
            this.createTokenManagementToolbar(),
            this.createTokenGrid()
        ];

        this.callParent(arguments);
    },

    createTokenManagementToolbar: function() {
        return {
            region: 'north',
            xtype: 'toolbar',
            height: 50,
            items: [
                {
                    xtype: 'textfield',
                    emptyText: 'Search by token, customer, requestor, RO...',
                    width: 250,
                    itemId: 'searchField',
                    enableKeyEvents: true,
                    listeners: {
                        keyup: {
                            fn: this.onTokenSearch.bind(this),
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
                            {value: 'pending', label: 'Pending'},
                            {value: 'cancelled', label: 'Cancelled'}
                        ]
                    },
                    listeners: {
                        change: this.onStatusFilter.bind(this)
                    }
                },
                {
                    xtype: 'datefield',
                    emptyText: 'Start Date',
                    width: 120,
                    itemId: 'startDateFilter',
                    listeners: {
                        change: this.onDateFilter.bind(this)
                    }
                },
                {
                    xtype: 'datefield',
                    emptyText: 'End Date',
                    width: 120,
                    itemId: 'endDateFilter',
                    listeners: {
                        change: this.onDateFilter.bind(this)
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
                    text: 'Create Request',
                    iconCls: 'fa fa-plus',
                    cls: 'btn-primary',
                    itemId: 'createRequestBtn',
                    handler: this.showCreateRequestModal.bind(this)
                }
            ]
        };
    },

    createTokenGrid: function() {
        return {
            region: 'center',
            xtype: 'gridpanel',
            itemId: 'tokenGrid',
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
                    width: 200,
                    renderer: this.actionColumnRenderer.bind(this)
                },
                {text: 'Requestor', dataIndex: 'requestor', flex: 1},
                {text: 'Token Number', dataIndex: 'tokenNumber', flex: 1},
                {text: 'RO Number', dataIndex: 'roNumber', flex: 1},
                {text: 'Customer Name', dataIndex: 'customerName', flex: 1},
                {
                    text: 'Remaining Hours',
                    dataIndex: 'remainingHours',
                    renderer: function(value) {
                        return value ? value + 'h' : '-';
                    }
                },
                {
                    text: 'Expiration Date',
                    dataIndex: 'expirationDate',
                    renderer: Ext.util.Format.dateRenderer('d M Y H:i')
                }
            ],
            listeners: {
                selectionchange: this.onTokenSelectionChange.bind(this)
            }
        };
    },

    actionColumnRenderer: function(value, metaData, record) {
        var me = this;
        var status = record.get('status');
        var tokenId = record.get('id') || record.get('tokenNumber');
        var html = '<div class="token-actions" style="display: flex; gap: 5px; align-items: center;">';
        
        // Conditional actions based on token status
        switch(status) {
            case 'pending':
                // Pending tokens can only be generated
                html += '<button class="action-btn btn-primary" onclick="rdmToken.generateToken(\'' + tokenId + '\')" style="padding: 4px 8px; font-size: 11px;">Generate Token</button>';
                break;
                
            case 'active':
                // Active tokens can be topped up or renewed
                html += '<button class="action-btn btn-success" onclick="rdmToken.renewToken(\'' + tokenId + '\')" style="padding: 4px 8px; font-size: 11px;">Renew</button>';
                html += '<button class="action-btn btn-warning" onclick="rdmToken.topUpToken(\'' + tokenId + '\')" style="padding: 4px 8px; font-size: 11px; margin-left: 3px;">Top Up</button>';
                break;
                
            case 'expired':
                // Expired tokens can be renewed
                html += '<button class="action-btn btn-info" onclick="rdmToken.renewToken(\'' + tokenId + '\')" style="padding: 4px 8px; font-size: 11px;">Renew</button>';
                break;
                
            case 'cancelled':
                // Cancelled tokens have no available actions
                html += '<span style="color: #6c757d; font-style: italic; font-size: 11px;">No actions available</span>';
                break;
                
            default:
                // Default fallback for unknown status
                html += '<span style="color: #6c757d; font-style: italic; font-size: 11px;">Status unknown</span>';
                break;
        }
        
        html += '</div>';
        return html;
    },

    statusRenderer: function(value) {
        var statusConfig = {
            'active': {color: '#28a745', text: 'Active'},
            'expired': {color: '#dc3545', text: 'Expired'},
            'pending': {color: '#ffc107', text: 'Pending'},
            'cancelled': {color: '#6c757d', text: 'Cancelled'}
        };
        
        var config = statusConfig[value] || {color: '#6c757d', text: value};
        return '<span style="color: ' + config.color + '; font-weight: bold;">' + config.text + '</span>';
    },

    onTokenSelectionChange: function(model, selected) {
        if (selected.length > 0) {
            this.showTokenDetails(selected[0]);
        }
    },

    showTokenDetails: function(record) {
        var controller = this.findController();
        if (controller) {
            controller.showTokenDetails(record);
        } else {
            console.log('Selected token:', record.getData());
        }
    },

    showCreateRequestModal: function() {
        var controller = this.findController();
        if (controller) {
            controller.showCreateRequestModal();
        } else {
            console.error('Controller not found for showCreateRequestModal');
            Ext.Msg.alert('Error', 'Unable to open create request modal - controller not found');
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
        console.warn('Creating temporary controller for token operations');
        return Ext.create('Store.rdmtoken.controller.TokenController');
    },

    // Helper method to get token store
    getTokenStore: function() {
        // Wait for global stores to be initialized
        if (window.RDMStores && window.RDMStores.tokens) {
            console.log('Using global token store');
            return window.RDMStores.tokens;
        }
        
        console.warn('Global RDMStores not available, will retry...');
        return null; // Don't create fallback, wait for global stores
    },
    
    // Method to bind store after component render
    afterRender: function() {
        this.callParent(arguments);
        
        // Ensure store is properly bound
        var grid = this.down('#tokenGrid');
        var store = this.getTokenStore();
        
        console.log('TokenManagementPanel afterRender - Grid:', !!grid);
        
        // Retry getting store if not available initially
        var retryCount = 0;
        var maxRetries = 10;
        
        var bindStore = function() {
            var store = this.getTokenStore();
            console.log('Attempt', retryCount + 1, '- Store available:', !!store);
            
            if (store && grid) {
                console.log('Binding token store to grid...');
                grid.setStore(store);
            
                // Add store listeners for debugging
                store.on('load', function(store, records, successful) {
                    console.log('Store load event - Success:', successful, 'Records:', records.length);
                    if (successful && records.length > 0) {
                        console.log('First record data:', records[0].getData());
                        console.log('Grid store after load:', grid.getStore().getCount());
                        
                        // Force grid refresh
                        setTimeout(function() {
                            console.log('Forcing grid view refresh...');
                            if (grid.getView()) {
                                grid.getView().refresh();
                            }
                        }, 100);
                    }
                });
                
                // Check if store already has data
                if (store.getCount() > 0) {
                    console.log('Store already has data:', store.getCount(), 'records');
                    grid.getView().refresh();
                }
            } else if (retryCount < maxRetries) {
                // Retry after 100ms
                retryCount++;
                setTimeout(bindStore.bind(this), 100);
            } else {
                console.error('Failed to get token store after', maxRetries, 'attempts');
            }
        }.bind(this);
        
        // Start trying to bind the store
        bindStore();
    },

    // Search and filter event handlers
    onTokenSearch: function(field, newValue) {
        console.log('Token search triggered:', newValue);
        var controller = this.findController();
        if (controller) {
            controller.applyFilters();
        } else {
            console.error('No controller found for token search');
        }
    },

    onSearchSpecialKey: function(field, e) {
        if (e.getKey() === e.ENTER) {
            console.log('Enter key pressed in search field');
            var controller = this.findController();
            if (controller) {
                controller.applyFilters();
            } else {
                console.error('No controller found for search special key');
            }
        }
    },

    onStatusFilter: function(combo, newValue) {
        console.log('Status filter changed:', newValue);
        var controller = this.findController();
        if (controller) {
            controller.applyFilters();
        } else {
            console.error('No controller found for status filter');
        }
    },

    onDateFilter: function(field, newValue) {
        console.log('Date filter changed:', field.getItemId(), newValue);
        var controller = this.findController();
        if (controller) {
            controller.applyFilters();
        } else {
            console.error('No controller found for date filter');
        }
    },


    clearAllFilters: function() {
        console.log('Clear all filters clicked');
        
        // Reset all filter fields
        var searchField = this.down('#searchField');
        var statusFilter = this.down('#statusFilter');
        var startDateFilter = this.down('#startDateFilter');
        var endDateFilter = this.down('#endDateFilter');
        
        if (searchField) searchField.setValue('');
        if (statusFilter) statusFilter.setValue('all');
        if (startDateFilter) startDateFilter.setValue(null);
        if (endDateFilter) endDateFilter.setValue(null);
        
        // Apply filters to reload data
        var controller = this.findController();
        if (controller) {
            controller.applyFilters();
        } else {
            console.error('No controller found for clear filters');
        }
        
        // Show user feedback
        Ext.toast({
            html: 'All filters have been cleared',
            title: 'Filters Reset',
            width: 200,
            align: 't'
        });
    },

    // Helper method to get current filter values
    getCurrentFilters: function() {
        var filters = {};
        
        var searchField = this.down('#searchField');
        var statusFilter = this.down('#statusFilter');
        var startDateFilter = this.down('#startDateFilter');
        var endDateFilter = this.down('#endDateFilter');
        
        if (searchField && searchField.getValue()) {
            filters.search = searchField.getValue();
        }
        
        if (statusFilter && statusFilter.getValue() !== 'all') {
            filters.status = statusFilter.getValue();
        }
        
        if (startDateFilter && startDateFilter.getValue()) {
            filters.startDate = Ext.Date.format(startDateFilter.getValue(), 'Y-m-d');
        }
        
        if (endDateFilter && endDateFilter.getValue()) {
            filters.endDate = Ext.Date.format(endDateFilter.getValue(), 'Y-m-d');
        }
        
        return filters;
    }
});
