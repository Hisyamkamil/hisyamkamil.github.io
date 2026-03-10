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
