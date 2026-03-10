/**
 * Navigation Tab Component
 * Left sidebar navigation with MainPanel card switching
 */
Ext.define('Store.rdmtoken.view.NavigationTab', {
    extend: 'Ext.tab.Panel',
    
    // Vertical navigation configuration
    tabPosition: 'left',
    tabRotation: 0,
    width: 250,
    
    initComponent: function() {
        this.items = [
            {
                title: 'Dashboard',
                iconCls: 'fa fa-tachometer-alt',
                itemId: 'dashboard',
                html: '<p style="padding: 20px;">Dashboard - Click to view content</p>',
                listeners: {
                    activate: this.onDashboardActivate.bind(this)
                }
            },
            {
                title: 'Token Management',
                iconCls: 'fa fa-key',
                itemId: 'tokenmanagement',
                html: '<p style="padding: 20px;">Token Management - Click to view content</p>',
                listeners: {
                    activate: this.onTokenManagementActivate.bind(this)
                }
            },
            {
                title: 'Location Monitoring',
                iconCls: 'fa fa-map-marker-alt',
                itemId: 'locationmonitoring',
                html: '<p style="padding: 20px;">Location Monitoring - Click to view content</p>',
                listeners: {
                    activate: this.onLocationMonitoringActivate.bind(this)
                }
            },
            {
                title: 'Contract',
                iconCls: 'fa fa-file-contract',
                itemId: 'contract',
                html: '<p style="padding: 20px;">Contract - Click to view content</p>',
                listeners: {
                    activate: this.onContractActivate.bind(this)
                }
            },
            {
                title: 'Approval',
                iconCls: 'fa fa-check-circle',
                itemId: 'approval',
                html: '<p style="padding: 20px;">Approval - Click to view content</p>',
                listeners: {
                    activate: this.onApprovalActivate.bind(this)
                }
            },
            {
                title: 'Report',
                iconCls: 'fa fa-chart-bar',
                itemId: 'report',
                html: '<p style="padding: 20px;">Report - Click to view content</p>',
                listeners: {
                    activate: this.onReportActivate.bind(this)
                }
            }
        ];

        this.callParent(arguments);
    },

    onDashboardActivate: function() {
        console.log('Dashboard tab activated');
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('dashboard');
        }
        if (window.RDMController) {
            window.RDMController.onDashboardActivate();
        }
    },

    onTokenManagementActivate: function() {
        console.log('Token Management tab activated');
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('tokenmanagement');
        }
        // Load vehicle tree for token management
        this.loadVehicleTreeForTokenManagement();
        if (window.RDMController) {
            window.RDMController.onTokenManagementActivate();
        }
    },

    /**
     * Load vehicle tree in main panel for token management
     */
    loadVehicleTreeForTokenManagement: function() {
        var me = this;
        
        if (!this.map_frame) return;
        
        // Get the token management panel
        var tokenPanel = this.map_frame.down('[itemId=tokenmanagement]');
        if (!tokenPanel) return;
        
        // Clear existing content
        tokenPanel.removeAll();
        
        // Create vehicle tree and token management interface
        var vehicleTreeContainer = Ext.create('Ext.container.Container', {
            layout: 'border',
            items: [
                // Vehicle tree panel (west)
                {
                    xtype: 'panel',
                    region: 'west',
                    width: 350,
                    split: true,
                    title: 'Select Vehicle',
                    layout: 'fit',
                    items: [{
                        xtype: 'treepanel',
                        title: 'Vehicle List',
                        tools: [{
                            xtype: 'button',
                            iconCls: 'fa fa-rotate',
                            tooltip: 'Refresh',
                            handler: function () {
                                this.up('treepanel').getStore().load();
                            }
                        }],
                        rootVisible: false,
                        useArrows: true,
                        border: false,
                        // Create tree store that loads vehicle data from PILOT API
                        store: Ext.create('Ext.data.TreeStore', {
                            proxy: {
                                type: 'ajax',
                                url: '/ax/tree.php?vehs=1&state=1'
                            },
                            root: {
                                text: 'Vehicles',
                                expanded: true
                            },
                            autoLoad: true
                        }),
                        // Define columns for the vehicle tree
                        columns: [{
                            text: 'Vehicle',
                            xtype: 'treecolumn',
                            dataIndex: 'name',
                            flex: 2,
                            renderer: function(value) {
                                return value || 'Unknown';
                            }
                        }, {
                            text: 'ID',
                            dataIndex: 'id',
                            flex: 1,
                            renderer: function(value) {
                                return value || 'N/A';
                            }
                        }, {
                            text: 'Status',
                            dataIndex: 'online',
                            flex: 1,
                            renderer: function(value) {
                                if (value === 1 || value === '1') {
                                    return '<span style="color: green;">●</span>';
                                } else {
                                    return '<span style="color: red;">●</span>';
                                }
                            }
                        }],
                        // Handle vehicle selection
                        listeners: {
                            selectionchange: function(tree, selected) {
                                if (selected.length > 0) {
                                    var record = selected[0];
                                    me.onVehicleSelect(record);
                                }
                            }
                        }
                    }]
                },
                // Token management panel (center)
                {
                    xtype: 'panel',
                    region: 'center',
                    title: 'RDM Token Management',
                    layout: 'fit',
                    itemId: 'tokenManagementArea',
                    items: [{
                        xtype: 'container',
                        html: '<div style="padding: 20px; text-align: center;">' +
                              '<h3>Select a vehicle to manage RDM tokens</h3>' +
                              '<p style="color: #666;">Choose a vehicle from the left panel to view and manage its RDM tokens</p>' +
                              '<div style="margin-top: 30px;">' +
                              '<i class="fa fa-microchip" style="font-size: 48px; color: #ccc;"></i>' +
                              '</div>' +
                              '</div>'
                    }]
                }
            ]
        });
        
        tokenPanel.add(vehicleTreeContainer);
    },

    /**
     * Handle vehicle selection from tree
     */
    onVehicleSelect: function(record) {
        var me = this;
        
        // Get vehicle data
        var vehicleName = record.get('name') || 'Unknown';
        var vehicleId = record.get('id') || '';
        var isOnline = record.get('online') === 1 || record.get('online') === '1';
        
        console.log('Vehicle selected:', vehicleName, 'ID:', vehicleId);
        
        // Update token management area
        this.updateTokenManagementArea(vehicleName, vehicleId, isOnline);
    },

    /**
     * Update token management area with vehicle-specific interface
     */
    updateTokenManagementArea: function(vehicleName, vehicleId, isOnline) {
        var me = this;
        
        if (!this.map_frame) return;
        
        var tokenArea = this.map_frame.down('#tokenManagementArea');
        if (!tokenArea) return;
        
        // Remove existing items
        tokenArea.removeAll();
        
        // Create token management interface
        var tokenManagementInterface = Ext.create('Ext.container.Container', {
            layout: 'border',
            items: [
                // Vehicle info header
                {
                    xtype: 'panel',
                    region: 'north',
                    height: 80,
                    bodyPadding: 10,
                    html: '<h2 style="margin: 0;">' + Ext.util.Format.htmlEncode(vehicleName) + '</h2>' +
                          '<p style="margin: 5px 0 0 0; color: #666;">Unit ID: ' + vehicleId + ' | ' +
                          'Status: <span style="color: ' + (isOnline ? 'green' : 'red') + ';">' +
                          (isOnline ? 'Online' : 'Offline') + '</span></p>'
                },
                // Token grid (center)
                {
                    xtype: 'grid',
                    region: 'center',
                    title: 'RDM Tokens',
                    store: me.createTokenStore(vehicleId),
                    columns: [
                        { text: 'Token ID', dataIndex: 'token_id', flex: 1 },
                        { text: 'Device Type', dataIndex: 'device_type', flex: 1 },
                        { text: 'Status', dataIndex: 'status', flex: 1,
                          renderer: function(value) {
                              var color = value === 'active' ? 'green' : value === 'inactive' ? 'red' : 'orange';
                              return '<span style="color: ' + color + ';">' + Ext.util.Format.capitalize(value) + '</span>';
                          }
                        },
                        { text: 'Last Sync', dataIndex: 'last_sync', flex: 1, xtype: 'datecolumn', format: 'Y-m-d H:i:s' },
                        { text: 'Actions', width: 120,
                          xtype: 'actioncolumn',
                          items: [{
                              iconCls: 'fa fa-edit',
                              tooltip: 'Edit Token',
                              handler: function(view, rowIndex, colIndex, item, e, record) {
                                  me.showTokenForm(record, true);
                              }
                          }, {
                              iconCls: 'fa fa-trash',
                              tooltip: 'Delete Token',
                              handler: function(view, rowIndex, colIndex, item, e, record) {
                                  me.deleteToken(record);
                              }
                          }]
                        }
                    ],
                    tbar: [{
                        text: 'New Token',
                        iconCls: 'fa fa-plus',
                        handler: function() {
                            me.showTokenForm(null, false);
                        }
                    }, '-', {
                        text: 'Refresh',
                        iconCls: 'fa fa-rotate',
                        handler: function() {
                            me.refreshTokens();
                        }
                    }, '->', {
                        text: 'Sync All',
                        iconCls: 'fa fa-sync',
                        handler: function() {
                            Ext.Msg.alert('Info', 'Token synchronization started for ' + vehicleName);
                        }
                    }]
                }
            ]
        });
        
        tokenArea.add(tokenManagementInterface);
    },

    /**
     * Create token store for selected vehicle
     */
    createTokenStore: function(vehicleId) {
        return Ext.create('Ext.data.Store', {
            fields: ['token_id', 'device_type', 'status', 'last_sync', 'created_date'],
            data: [
                // Sample data - replace with actual API calls based on vehicleId
                { token_id: 'RDM001_' + vehicleId, device_type: 'GPS Tracker', status: 'active', last_sync: new Date(), created_date: new Date() },
                { token_id: 'RDM002_' + vehicleId, device_type: 'Temperature Sensor', status: 'inactive', last_sync: new Date(Date.now() - 3600000), created_date: new Date() }
            ]
        });
    },

    /**
     * Show token creation/edit form
     */
    showTokenForm: function(record, isEdit) {
        var me = this;
        
        var form = Ext.create('Ext.window.Window', {
            title: (isEdit ? 'Edit' : 'Create') + ' RDM Token',
            modal: true,
            width: 400,
            layout: 'fit',
            items: [{
                xtype: 'form',
                bodyPadding: 15,
                items: [{
                    xtype: 'textfield',
                    name: 'token_id',
                    fieldLabel: 'Token ID',
                    allowBlank: false,
                    value: isEdit ? record.get('token_id') : ''
                }, {
                    xtype: 'combobox',
                    name: 'device_type',
                    fieldLabel: 'Device Type',
                    store: ['GPS Tracker', 'Temperature Sensor', 'Fuel Sensor', 'Door Sensor'],
                    value: isEdit ? record.get('device_type') : ''
                }, {
                    xtype: 'combobox',
                    name: 'status',
                    fieldLabel: 'Status',
                    store: ['active', 'inactive', 'pending'],
                    value: isEdit ? record.get('status') : 'active'
                }],
                buttons: [{
                    text: 'Cancel',
                    handler: function() {
                        form.close();
                    }
                }, {
                    text: isEdit ? 'Update' : 'Create',
                    formBind: true,
                    handler: function() {
                        var formValues = this.up('form').getValues();
                        console.log('Saving token:', formValues);
                        Ext.Msg.alert('Success', (isEdit ? 'Token updated' : 'Token created') + ' successfully');
                        form.close();
                        me.refreshTokens();
                    }
                }]
            }]
        });
        
        form.show();
    },

    /**
     * Delete token
     */
    deleteToken: function(record) {
        var me = this;
        Ext.Msg.confirm('Confirm Delete',
            'Are you sure you want to delete token "' + record.get('token_id') + '"?',
            function(btn) {
                if (btn === 'yes') {
                    console.log('Deleting token:', record.get('token_id'));
                    Ext.Msg.alert('Success', 'Token deleted successfully');
                    me.refreshTokens();
                }
            }
        );
    },

    /**
     * Refresh tokens grid
     */
    refreshTokens: function() {
        if (this.map_frame) {
            var tokenGrid = this.map_frame.down('grid[title="RDM Tokens"]');
            if (tokenGrid) {
                tokenGrid.getStore().load();
                console.log('Refreshing tokens grid');
            }
        }
    },

    onLocationMonitoringActivate: function() {
        console.log('Location Monitoring tab activated');
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('locationmonitoring');
        }
        if (window.RDMController) {
            window.RDMController.onLocationMonitoringActivate();
        }
    },

    onContractActivate: function() {
        console.log('Contract tab activated');
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('contract');
        }
        if (window.RDMController) {
            window.RDMController.onContractActivate();
        }
    },

    onApprovalActivate: function() {
        console.log('Approval tab activated');
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('approval');
        }
        if (window.RDMController) {
            window.RDMController.onApprovalActivate();
        }
    },

    onReportActivate: function() {
        console.log('Report tab activated');
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('report');
        }
        if (window.RDMController) {
            window.RDMController.onReportActivate();
        }
    }
});
