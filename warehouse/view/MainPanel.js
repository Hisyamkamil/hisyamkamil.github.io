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
        'Store.warehouse.view.PutAwayPanel',
        'Store.warehouse.view.StockOpnamePanel'
    ],
    
    config: {
        warehouseController: null
    },
    
    layout: 'card',
    border: false,
    
    initComponent: function() {
        var warehouseController = this.getWarehouseController();
        
        console.log('🔍 DEBUG: MainPanel initComponent');
        console.log('🔍 DEBUG: MainPanel controller available:', !!warehouseController);
        console.log('🔍 DEBUG: MainPanel controller type:', warehouseController ? warehouseController.$className : 'null');
        console.log('🔍 DEBUG: MainPanel config:', this.config);
        
        if (!warehouseController) {
            console.error('❌ ERROR: MainPanel - WarehouseController not received from Module.js');
        }
        
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
                items: [
                    Ext.create('Store.warehouse.view.StockOpnamePanel', {
                        warehouseController: warehouseController
                    })
                ]
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
        
        // Add layout listeners after component initialization
        this.on('afterrender', function() {
            console.log('🔧 MainPanel afterrender - setting up layout listeners');
            
            var layout = this.getLayout();
            if (layout && layout.on) {
                layout.on('activeitemchange', function(layout, newCard, oldCard) {
                    if (newCard && newCard.itemId) {
                        console.log('🔄 MainPanel card changed to:', newCard.itemId);
                        
                        // Trigger API calls when cards activate
                        var controller = warehouseController || window.warehouseController;
                        if (controller) {
                            switch(newCard.itemId) {
                                case 'goodreceive':
                                    console.log('✅ MainPanel triggering loadInboundDeliveries');
                                    controller.loadInboundDeliveries();
                                    break;
                                case 'putaway':
                                    console.log('✅ MainPanel triggering loadPutAwayTasks');
                                    controller.loadPutAwayTasks();
                                    break;
                                case 'picking':
                                    console.log('✅ MainPanel triggering loadPickingTasks');
                                    controller.loadPickingTasks();
                                    break;
                                case 'stockopname':
                                    console.log('✅ MainPanel triggering loadStockOpnameSessions');
                                    controller.loadStockOpnameSessions();
                                    break;
                                case 'masterdata':
                                    console.log('✅ MainPanel triggering loadItems');
                                    controller.loadItems();
                                    break;
                            }
                        }
                    }
                });
                console.log('✅ MainPanel layout listeners configured');
            } else {
                console.warn('⚠️ MainPanel layout not available for listeners');
            }
        }, this);
    }
});
