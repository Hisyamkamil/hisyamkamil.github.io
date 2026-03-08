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
            store: window.RDMStores ? window.RDMStores.tokens : null,
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
        if (this.getController()) {
            this.getController().showCreateRequestModal();
        }
    }
});