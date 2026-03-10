/**
 * Navigation Tab Component
 * Left sidebar navigation with actual panel content
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
                xtype: 'Store.rdmtoken.view.DashboardPanel',
                listeners: {
                    activate: this.onDashboardActivate.bind(this)
                }
            },
            {
                title: 'Token Management',
                iconCls: 'fa fa-key',
                itemId: 'tokenmanagement',
                xtype: 'Store.rdmtoken.view.TokenManagementPanel',
                listeners: {
                    activate: this.onTokenManagementActivate.bind(this)
                }
            },
            {
                title: 'Location Monitoring',
                iconCls: 'fa fa-map-marker-alt',
                itemId: 'locationmonitoring',
                xtype: 'Store.rdmtoken.view.LocationMonitoringPanel',
                listeners: {
                    activate: this.onLocationMonitoringActivate.bind(this)
                }
            },
            {
                title: 'Contract',
                iconCls: 'fa fa-file-contract',
                itemId: 'contract',
                xtype: 'Store.rdmtoken.view.ContractPanel',
                listeners: {
                    activate: this.onContractActivate.bind(this)
                }
            },
            {
                title: 'Approval',
                iconCls: 'fa fa-check-circle',
                itemId: 'approval',
                xtype: 'Store.rdmtoken.view.ApprovalPanel',
                listeners: {
                    activate: this.onApprovalActivate.bind(this)
                }
            },
            {
                title: 'Report',
                iconCls: 'fa fa-chart-bar',
                itemId: 'report',
                xtype: 'Store.rdmtoken.view.ReportPanel',
                listeners: {
                    activate: this.onReportActivate.bind(this)
                }
            }
        ];

        this.callParent(arguments);
    },

    onDashboardActivate: function() {
        console.log('Dashboard tab activated');
        if (window.RDMController) {
            window.RDMController.onDashboardActivate();
        }
    },

    onTokenManagementActivate: function() {
        console.log('Token Management tab activated');
        if (window.RDMController) {
            window.RDMController.onTokenManagementActivate();
        }
    },

    onLocationMonitoringActivate: function() {
        console.log('Location Monitoring tab activated');
        if (window.RDMController) {
            window.RDMController.onLocationMonitoringActivate();
        }
    },

    onContractActivate: function() {
        console.log('Contract tab activated');
        if (window.RDMController) {
            window.RDMController.onContractActivate();
        }
    },

    onApprovalActivate: function() {
        console.log('Approval tab activated');
        if (window.RDMController) {
            window.RDMController.onApprovalActivate();
        }
    },

    onReportActivate: function() {
        console.log('Report tab activated');
        if (window.RDMController) {
            window.RDMController.onReportActivate();
        }
    }
});
