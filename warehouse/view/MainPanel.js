/**
 * Main Panel Component
 * Main content area that switches views based on navigation selection
 */
Ext.define('Store.warehouse.view.MainPanel', {
    extend: 'Ext.panel.Panel',
    
    requires: [
        'Store.warehouse.view.MasterDataPanel'
    ],
    
    layout: 'card',
    border: false,
    
    initComponent: function() {
        this.items = [
            {
                itemId: 'dashboard',
                title: 'Dashboard',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Dashboard</h2><p>Real-time warehouse metrics and alerts will be displayed here.</p></div>'
            },
            {
                itemId: 'goodreceive',
                title: 'Good Receive',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Good Receive</h2><p>Inbound delivery management and RFID confirmation interface.</p></div>'
            },
            {
                itemId: 'putaway',
                title: 'Put Away',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Put Away</h2><p>Transfer orders from inbound area to storage locations.</p></div>'
            },
            {
                itemId: 'picking',
                title: 'Picking',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Picking</h2><p>Outbound delivery and picking task management.</p></div>'
            },
            {
                itemId: 'stockopname',
                title: 'Stock Opname',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Stock Opname</h2><p>Physical inventory counting and reconciliation.</p></div>'
            },
            {
                itemId: 'reports',
                title: 'Reports',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Reports</h2><p>Warehouse activity reports and analytics.</p></div>'
            },
            {
                itemId: 'masterdata',
                title: 'Master Data',
                layout: 'fit',
                items: [
                    Ext.create('Store.warehouse.view.MasterDataPanel')
                ]
            }
        ];

        // Set default active item
        this.activeItem = 0;

        this.callParent(arguments);
    }
});
