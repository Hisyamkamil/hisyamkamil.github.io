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
        'Store.rdmtoken.view.LocationMonitoringPanel',
        'Store.rdmtoken.view.ContractPanel',
        'Store.rdmtoken.view.ApprovalPanel',
        'Store.rdmtoken.view.ReportPanel'
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
            Ext.apply(Ext.create('Store.rdmtoken.view.ContractPanel'), {
                itemId: 'contract'
            }),
            Ext.apply(Ext.create('Store.rdmtoken.view.ApprovalPanel'), {
                itemId: 'approval'
            }),
            Ext.apply(Ext.create('Store.rdmtoken.view.ReportPanel'), {
                itemId: 'report'
            })
        ];

        this.callParent(arguments);
    }
});
