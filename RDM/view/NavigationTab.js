/**
 * Navigation Tab Component
 * Left sidebar navigation with actual panel components
 */
Ext.define('Store.rdmtoken.view.NavigationTab', {
    extend: 'Ext.tab.Panel',
    
    requires: [
        'Store.rdmtoken.view.DashboardPanel',
        'Store.rdmtoken.view.TokenManagementPanel',
        'Store.rdmtoken.view.LocationMonitoringPanel',
        'Store.rdmtoken.view.ContractPanel',
        'Store.rdmtoken.view.ApprovalPanel',
        'Store.rdmtoken.view.ReportPanel'
    ],
    
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
                layout: 'fit',
                items: [
                    Ext.create('Store.rdmtoken.view.DashboardPanel')
                ],
                listeners: {
                    activate: this.onDashboardActivate.bind(this)
                }
            },
            {
                title: 'Token Management',
                iconCls: 'fa fa-key',
                itemId: 'tokenmanagement',
                layout: 'fit',
                items: [{
                    xtype: 'treepanel',
                    title: 'Select Vehicle for RDM Tokens',
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
                        text: 'Unit ID',
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
                                return '<span style="color: green;">Online</span>';
                            } else {
                                return '<span style="color: red;">Offline</span>';
                            }
                        }
                    }],
                    // Handle vehicle selection
                    listeners: {
                        selectionchange: function(tree, selected) {
                            if (selected.length > 0) {
                                var record = selected[0];
                                // Update main panel with selected vehicle info
                                if (tree.up('navigationtab').map_frame) {
                                    var tokenPanel = tree.up('navigationtab').map_frame.down('[itemId=tokenmanagement]');
                                    if (tokenPanel) {
                                        // Update the TokenManagementPanel with vehicle info
                                        console.log('Vehicle selected from nav tree:', record.get('name'), 'ID:', record.get('id'));
                                        // You can call a method on the TokenManagementPanel to update it
                                    }
                                }
                            }
                        }
                    }
                }],
                listeners: {
                    activate: this.onTokenManagementActivate.bind(this)
                }
            },
            {
                title: 'Location Monitoring',
                iconCls: 'fa fa-map-marker-alt',
                itemId: 'locationmonitoring',
                layout: 'fit',
                items: [
                    Ext.create('Store.rdmtoken.view.LocationMonitoringPanel')
                ],
                listeners: {
                    activate: this.onLocationMonitoringActivate.bind(this)
                }
            },
            {
                title: 'Contract',
                iconCls: 'fa fa-file-contract',
                itemId: 'contract',
                layout: 'fit',
                items: [
                    Ext.create('Store.rdmtoken.view.ContractPanel')
                ],
                listeners: {
                    activate: this.onContractActivate.bind(this)
                }
            },
            {
                title: 'Approval',
                iconCls: 'fa fa-check-circle',
                itemId: 'approval',
                layout: 'fit',
                items: [
                    Ext.create('Store.rdmtoken.view.ApprovalPanel')
                ],
                listeners: {
                    activate: this.onApprovalActivate.bind(this)
                }
            },
            {
                title: 'Report',
                iconCls: 'fa fa-chart-bar',
                itemId: 'report',
                layout: 'fit',
                items: [
                    Ext.create('Store.rdmtoken.view.ReportPanel')
                ],
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
        if (window.RDMController) {
            window.RDMController.onTokenManagementActivate();
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
