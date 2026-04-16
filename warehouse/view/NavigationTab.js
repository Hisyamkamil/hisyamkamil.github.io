/**
 * Navigation Tab Component
 * Left sidebar navigation with warehouse management modules
 */
Ext.define('Store.warehouse.view.NavigationTab', {
    extend: 'Ext.tab.Panel',
    
    // Vertical navigation configuration
    tabPosition: 'left',
    tabRotation: 0,
    width: 250,
    
    config: {
        warehouseController: null
    },
    
    initComponent: function() {
        this.items = [
            {
                title: 'Dashboard',
                iconCls: 'fa fa-tachometer-alt',
                itemId: 'dashboard',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Dashboard</h2><p>Real-time warehouse metrics and alerts will be displayed here.</p></div>',
                listeners: {
                    activate: this.onDashboardActivate.bind(this)
                }
            },
            {
                title: 'Good Receive',
                iconCls: 'fa fa-truck-loading',
                itemId: 'goodreceive',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Good Receive</h2><p>Inbound delivery management and RFID confirmation interface.</p></div>',
                listeners: {
                    activate: this.onGoodReceiveActivate.bind(this)
                }
            },
            {
                title: 'Put Away',
                iconCls: 'fa fa-dolly',
                itemId: 'putaway',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Put Away</h2><p>Transfer orders from inbound area to storage locations.</p></div>',
                listeners: {
                    activate: this.onPutAwayActivate.bind(this)
                }
            },
            {
                title: 'Picking',
                iconCls: 'fa fa-hand-paper',
                itemId: 'picking',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Picking</h2><p>Outbound delivery and picking task management.</p></div>',
                listeners: {
                    activate: this.onPickingActivate.bind(this)
                }
            },
            {
                title: 'Stock Opname',
                iconCls: 'fa fa-clipboard-list',
                itemId: 'stockopname',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Stock Opname</h2><p>Physical inventory counting and reconciliation.</p></div>',
                listeners: {
                    activate: this.onStockOpnameActivate.bind(this)
                }
            },
            {
                title: 'Reports',
                iconCls: 'fa fa-chart-bar',
                itemId: 'reports',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Reports</h2><p>Warehouse activity reports and analytics.</p></div>',
                listeners: {
                    activate: this.onReportsActivate.bind(this)
                }
            },
            {
                title: 'Master Data',
                iconCls: 'fa fa-database',
                itemId: 'masterdata',
                layout: 'fit',
                html: '<div style="padding: 20px; text-align: center; color: #666;"><h2>Master Data</h2><p>Item and location master data management.</p></div>',
                listeners: {
                    activate: this.onMasterDataActivate.bind(this)
                }
            }
        ];

        this.callParent(arguments);
    },

    onDashboardActivate: function() {
        console.log('Dashboard tab activated - loading metrics');
        if (this.getWarehouseController()) {
            this.getWarehouseController().loadDashboardMetrics();
        }
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('dashboard');
        }
    },

    onGoodReceiveActivate: function() {
        console.log('🔄 Good Receive tab activated - loading inbound deliveries');
        
        // Multiple strategies to access controller
        var controller = this.getWarehouseController() || window.warehouseController;
        
        if (controller && controller.loadInboundDeliveries) {
            console.log('✅ Calling loadInboundDeliveries via controller');
            controller.loadInboundDeliveries();
        } else {
            console.error('❌ WarehouseController not available in NavigationTab');
            console.error('Debug - this.getWarehouseController():', !!this.getWarehouseController());
            console.error('Debug - window.warehouseController:', !!window.warehouseController);
        }
        
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('goodreceive');
        }
    },

    onPutAwayActivate: function() {
        console.log('🔄 Put Away tab activated - loading put away tasks');
        
        // Multiple strategies to access controller
        var controller = this.getWarehouseController() || window.warehouseController;
        
        if (controller && controller.loadPutAwayTasks) {
            console.log('✅ Calling loadPutAwayTasks via controller');
            controller.loadPutAwayTasks();
        } else {
            console.error('❌ WarehouseController not available for Put Away');
        }
        
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('putaway');
        }
    },

    onPickingActivate: function() {
        console.log('Picking tab activated - loading picking tasks');
        if (this.getWarehouseController()) {
            this.getWarehouseController().loadPickingTasks();
        }
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('picking');
        }
    },

    onStockOpnameActivate: function() {
        console.log('🔄 Stock Opname tab activated - loading stock opname sessions');
        
        // Multiple strategies to access controller
        var controller = this.getWarehouseController() || window.warehouseController;
        
        if (controller && controller.loadStockOpnameSessions) {
            console.log('✅ Calling loadStockOpnameSessions via controller');
            controller.loadStockOpnameSessions();
        } else {
            console.error('❌ WarehouseController not available for Stock Opname');
        }
        
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('stockopname');
        }
    },

    onReportsActivate: function() {
        console.log('Reports tab activated');
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('reports');
        }
    },

    onMasterDataActivate: function() {
        console.log('Master Data tab activated - loading items');
        if (this.getWarehouseController()) {
            this.getWarehouseController().loadItems();
        }
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('masterdata');
        }
    }
});
