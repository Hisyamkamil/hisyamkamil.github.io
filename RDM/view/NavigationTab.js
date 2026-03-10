/**
 * Navigation Tab Component
 * Left sidebar navigation with multiple RDM sections
 */
Ext.define('Store.rdmtoken.view.NavigationTab', {
    extend: 'Ext.tab.Panel',
    
    // Vertical navigation configuration
    tabPosition: 'left',
    tabRotation: 0,
    width: 250,
    
    // Hide tab content panel - we only want the navigation tabs
    bodyStyle: 'display: none !important;',
    tabBar: {
        // Make tab bar take full width when content is hidden
        flex: 1
    },
    
    initComponent: function() {
        // Hide tab content panels - using empty items with content commented out
        this.items = [
            {
                title: 'Dashboard',
                iconCls: 'fa fa-tachometer-alt',
                itemId: 'dashboard',
                // html: '', // Empty content - panel hidden via CSS
                listeners: {
                    activate: this.onDashboardActivate.bind(this)
                }
            },
            {
                title: 'Token Management',
                iconCls: 'fa fa-key',
                itemId: 'tokenmanagement',
                // html: '', // Empty content - panel hidden via CSS
                listeners: {
                    activate: this.onTokenManagementActivate.bind(this)
                }
            },
            // Temporarily disabled - Real Time Monitoring
            /*
            {
                title: 'Location Monitoring',
                iconCls: 'fa fa-map-marker-alt',
                itemId: 'locationmonitoring',
                listeners: {
                    activate: this.onLocationMonitoringActivate.bind(this)
                }
            },
            */
            {
                title: 'Contract',
                iconCls: 'fa fa-file-contract',
                itemId: 'contract',
                // html: '', // Empty content - panel hidden via CSS
                listeners: {
                    activate: this.onContractActivate.bind(this)
                }
            },
            {
                title: 'Approval',
                iconCls: 'fa fa-check-circle',
                itemId: 'approval',
                // html: '', // Empty content - panel hidden via CSS
                listeners: {
                    activate: this.onApprovalActivate.bind(this)
                }
            },
            {
                title: 'Report',
                iconCls: 'fa fa-chart-bar',
                itemId: 'report',
                // html: '', // Empty content - panel hidden via CSS
                listeners: {
                    activate: this.onReportActivate.bind(this)
                }
            }
        ];

        this.callParent(arguments);
    },

    onDashboardActivate: function() {
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('dashboard');
            if (window.RDMController) {
                window.RDMController.onDashboardActivate();
            }
        }
    },

    onTokenManagementActivate: function() {
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('tokenmanagement');
            if (window.RDMController) {
                window.RDMController.onTokenManagementActivate();
            }
        }
    },

    // Temporarily disabled - Real Time Monitoring function
    /*
    onLocationMonitoringActivate: function() {
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('locationmonitoring');
            if (window.RDMController) {
                window.RDMController.onLocationMonitoringActivate();
            }
        }
    },
    */

    onContractActivate: function() {
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('contract');
            if (window.RDMController) {
                window.RDMController.onContractActivate();
            }
        }
    },

    onApprovalActivate: function() {
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('approval');
            if (window.RDMController) {
                window.RDMController.onApprovalActivate();
            }
        }
    },

    onReportActivate: function() {
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('report');
            if (window.RDMController) {
                window.RDMController.onReportActivate();
            }
        }
    }
});
