/**
 * Token Management Panel Component
 * Main interface for token operations with grid and controls
 */
Ext.define('Store.rdmtoken.view.TokenManagementPanel', {
    extend: 'Ext.panel.Panel',
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
                    emptyText: 'Search tokens...',
                    width: 200,
                    itemId: 'searchField',
                    listeners: {
                        change: this.onTokenSearch.bind(this)
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
                            {value: 'all', label: 'All'},
                            {value: 'active', label: 'Active'},
                            {value: 'expired', label: 'Expired'},
                            {value: 'pending', label: 'Pending'}
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
                    itemId: 'startDateFilter'
                },
                {
                    xtype: 'datefield',
                    emptyText: 'End Date',
                    width: 120,
                    itemId: 'endDateFilter'
                },
                {
                    xtype: 'button',
                    text: 'Advanced Filter',
                    iconCls: 'fa fa-filter'
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
                    text: 'Actions',
                    width: 200,
                    renderer: this.actionColumnRenderer.bind(this)
                },
                {text: 'Requestor', dataIndex: 'requestor', flex: 1},
                {text: 'Token Number', dataIndex: 'tokenNumber', flex: 1},
                {text: 'RO Number', dataIndex: 'roNumber', flex: 1},
                {text: 'Customer Name', dataIndex: 'customerName', flex: 1},
                {
                    text: 'Status',
                    dataIndex: 'status',
                    renderer: this.statusRenderer.bind(this)
                },
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
        var actions = record.get('actions') || {};
        var html = '<div class="token-actions">';
        
        // Toggle switch
        var toggleStatus = actions.toggleStatus || 'enabled';
        var toggleClass = toggleStatus === 'enabled' ? 'toggle-on' : 'toggle-off';
        html += '<span class="toggle-switch ' + toggleClass + '" onclick="rdmToken.toggleToken(\'' + record.get('id') + '\')"></span>';
        
        // Action buttons
        if (actions.canRenew) {
            html += '<button class="action-btn btn-success" onclick="rdmToken.renewToken(\'' + record.get('id') + '\')">Renew</button>';
        }
        if (actions.canTopUp) {
            html += '<button class="action-btn btn-warning" onclick="rdmToken.topUpToken(\'' + record.get('id') + '\')">Top Up</button>';
        }
        if (actions.canChangeUnit) {
            html += '<button class="action-btn btn-info" onclick="rdmToken.changeUnit(\'' + record.get('id') + '\')">Change Unit</button>';
        }
        
        html += '</div>';
        return html;
    },

    statusRenderer: function(value) {
        var statusConfig = {
            'active': {color: '#28a745', text: 'Active'},
            'expired': {color: '#dc3545', text: 'Expired'},
            'pending': {color: '#ffc107', text: 'Pending'},
            'revoked': {color: '#6c757d', text: 'Revoked'}
        };
        
        var config = statusConfig[value] || {color: '#6c757d', text: value};
        return '<span style="color: ' + config.color + '; font-weight: bold;">' + config.text + '</span>';
    },

    onTokenSearch: function(field, newValue) {
        if (this.getController()) {
            this.getController().onTokenSearch(newValue);
        }
    },

    onStatusFilter: function(combo, newValue) {
        if (this.getController()) {
            this.getController().onStatusFilter(newValue);
        }
    },

    onTokenSelectionChange: function(model, selected) {
        if (selected.length > 0) {
            this.showTokenDetails(selected[0]);
        }
    },

    showTokenDetails: function(record) {
        if (this.getController()) {
            this.getController().showTokenDetails(record);
        } else {
            console.log('Selected token:', record.getData());
        }
    },

    showCreateRequestModal: function() {
        // Direct access to controller through global reference or create one
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
                            grid.getView().refresh();
                            grid.doLayout();
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
    }
});
