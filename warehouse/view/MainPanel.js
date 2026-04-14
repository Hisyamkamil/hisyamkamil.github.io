/**
 * Main Panel Component
 * Main content area that switches views based on navigation selection
 */
Ext.define('Store.warehouse.view.MainPanel', {
    extend: 'Ext.panel.Panel',
    
    requires: [
        'Store.warehouse.view.Dashboard',
        'Store.warehouse.view.MasterDataPanel',
        'Store.warehouse.view.GoodReceivePanel',
        'Store.warehouse.view.PickingPanel',
        'Store.warehouse.view.PutAwayPanel'
    ],
    
    config: {
        warehouseController: null
    },
    
    layout: 'card',
    border: false,
    
    initComponent: function() {
        var warehouseController = this.getWarehouseController();
        
        this.items = [
            {
                itemId: 'dashboard',
                title: 'Dashboard',
                layout: 'fit',
                items: [
                    Ext.create('Store.warehouse.view.Dashboard', {
                        warehouseController: warehouseController
                    })
                ]
            },
            {
                itemId: 'goodreceive',
                title: 'Good Receive',
                layout: 'fit',
                items: [
                    Ext.create('Store.warehouse.view.GoodReceivePanel', {
                        warehouseController: warehouseController
                    })
                ]
            },
            {
                itemId: 'putaway',
                title: 'Put Away',
                layout: 'fit',
                items: [
                    Ext.create('Store.warehouse.view.PutAwayPanel', {
                        warehouseController: warehouseController
                    })
                ]
            },
            {
                itemId: 'picking',
                title: 'Picking',
                layout: 'fit',
                items: [
                    Ext.create('Store.warehouse.view.PickingPanel', {
                        warehouseController: warehouseController
                    })
                ]
            },
            {
                itemId: 'stockopname',
                title: 'Stock Opname',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Stock Opname</h2><p>Physical inventory counting and reconciliation.<br>API integration ready for stock opname data.</p></div>'
            },
            {
                itemId: 'reports',
                title: 'Reports',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Reports</h2><p>Warehouse activity reports and analytics.<br>API integration ready for reports data.</p></div>'
            },
            {
                itemId: 'masterdata',
                title: 'Master Data',
                layout: 'fit',
                items: [
                    Ext.create('Store.warehouse.view.MasterDataPanel', {
                        warehouseController: warehouseController
                    })
                ]
            }
        ];

        // Set default active item
        this.activeItem = 0;

        this.callParent(arguments);
    }
});
