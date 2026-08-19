Ext.define('Store.rdmtoken.view.MainPanel', {
    extend: 'Ext.panel.Panel',
    layout: 'card',

    requires: [
        'Store.rdmtoken.view.DashboardPanel',
        'Store.rdmtoken.view.TokenManagementPanel',
        'Store.rdmtoken.view.ContractPanel'
    ],

    initComponent: function() {
        this.items = [
            Ext.apply(Ext.create('Store.rdmtoken.view.DashboardPanel'), { itemId: 'dashboard' }),
            Ext.apply(Ext.create('Store.rdmtoken.view.TokenManagementPanel'), { itemId: 'tokenmanagement' }),
            Ext.apply(Ext.create('Store.rdmtoken.view.ContractPanel'), { itemId: 'contract' })
        ];

        this.callParent(arguments);
    }
});