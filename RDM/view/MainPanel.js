/**
 * Main Panel Component
 * Card layout container for all RDM sections
 */
Ext.define('Store.rdmtoken.view.MainPanel', {
    extend: 'Ext.panel.Panel',
    layout: 'card',

    requires: [
        'Store.rdmtoken.view.DashboardPanel',
        'Store.rdmtoken.view.TokenManagementPanel',
        'Store.rdmtoken.view.LocationMonitoringPanel'
    ],

    initComponent: function() {
        this.items = [
            Ext.apply(Ext.create('Store.rdmtoken.view.DashboardPanel'), {
                itemId: 'dashboard'
            }),
            Ext.apply(Ext.create('Store.rdmtoken.view.TokenManagementPanel'), {
                itemId: 'tokenmanagement'
            }),
            Ext.apply(Ext.create('Store.rdmtoken.view.LocationMonitoringPanel'), {
                itemId: 'locationmonitoring'
            }),
            {
                itemId: 'contract',
                xtype: 'panel',
                title: 'Contract Management',
                html: '<div style="padding: 20px; text-align: center;"><h2>Contract Management Interface</h2><p>Contract management features will be implemented here.</p></div>'
            },
            {
                itemId: 'approval',
                xtype: 'panel',
                title: 'Token Approval Workflow',
                html: '<div style="padding: 20px; text-align: center;"><h2>Approval Workflow</h2><p>Token approval features will be implemented here.</p></div>'
            },
            {
                itemId: 'report',
                xtype: 'panel',
                title: 'Reports & Analytics',
                html: '<div style="padding: 20px; text-align: center;"><h2>Reports & Analytics</h2><p>Reporting features will be implemented here.</p></div>'
            }
        ];

        this.callParent(arguments);
    }
});
