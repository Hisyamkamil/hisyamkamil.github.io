/**
 * Dashboard Panel Component
 * Real-time warehouse metrics and analytics dashboard
 */
Ext.define('Store.warehouse.view.Dashboard', {
    extend: 'Ext.panel.Panel',
    
    config: {
        warehouseController: null
    },
    
    title: 'Warehouse Dashboard',
    layout: 'fit',
    border: false,
    
    initComponent: function() {
        var me = this;
        
        // Simplified dashboard to avoid layout constructor errors
        this.items = [
            {
                xtype: 'panel',
                layout: 'vbox',
                items: [
                    {
                        xtype: 'panel',
                        height: 120,
                        layout: 'hbox',
                        margin: '10',
                        items: [
                            {
                                xtype: 'panel',
                                flex: 1,
                                margin: '0 5 0 0',
                                bodyStyle: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 20px;',
                                html: '<div id="totalDeliveries"><h2 style="margin: 0; color: white;">0</h2><p style="margin: 5px 0 0 0; color: #e0e0e0;">Total Deliveries</p></div>'
                            },
                            {
                                xtype: 'panel',
                                flex: 1,
                                margin: '0 5 0 0',
                                bodyStyle: 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-align: center; padding: 20px;',
                                html: '<div id="pendingTasks"><h2 style="margin: 0; color: white;">0</h2><p style="margin: 5px 0 0 0; color: #e0e0e0;">Pending Tasks</p></div>'
                            },
                            {
                                xtype: 'panel',
                                flex: 1,
                                margin: '0 5 0 0',
                                bodyStyle: 'background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; text-align: center; padding: 20px;',
                                html: '<div id="totalItems"><h2 style="margin: 0; color: white;">0</h2><p style="margin: 5px 0 0 0; color: #e0e0e0;">Items in Stock</p></div>'
                            },
                            {
                                xtype: 'panel',
                                flex: 1,
                                bodyStyle: 'background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; text-align: center; padding: 20px;',
                                html: '<div id="rfidScans"><h2 style="margin: 0; color: white;">0</h2><p style="margin: 5px 0 0 0; color: #e0e0e0;">RFID Scans Today</p></div>'
                            }
                        ]
                    },
                    {
                        xtype: 'panel',
                        flex: 1,
                        layout: 'hbox',
                        margin: '0 10 10 10',
                        items: [
                            {
                                xtype: 'grid',
                                flex: 1,
                                title: 'Recent Activities',
                                margin: '0 5 0 0',
                                itemId: 'activitiesGrid',
                                store: Ext.create('Ext.data.Store', {
                                    fields: [
                                        'activity_id',
                                        'activity_type',
                                        'description',
                                        'user_name',
                                        'timestamp',
                                        'status'
                                    ],
                                    data: []
                                }),
                                columns: [
                                    {
                                        text: 'Activity',
                                        dataIndex: 'activity_type',
                                        width: 100,
                                        renderer: function(value) {
                                            return '<span style="font-weight: bold;">' + (value || 'N/A') + '</span>';
                                        }
                                    },
                                    {
                                        text: 'Description',
                                        dataIndex: 'description',
                                        flex: 2
                                    },
                                    {
                                        text: 'User',
                                        dataIndex: 'user_name',
                                        width: 80
                                    },
                                    {
                                        text: 'Time',
                                        dataIndex: 'timestamp',
                                        width: 100,
                                        renderer: function(value) {
                                            return value ? Ext.util.Format.date(new Date(value), 'H:i') : '';
                                        }
                                    }
                                ]
                            },
                            {
                                xtype: 'panel',
                                flex: 1,
                                title: 'System Status',
                                margin: '0 0 0 5',
                                bodyStyle: 'padding: 15px;',
                                html: '<div>' +
                                      '<h4>RFID Readers</h4>' +
                                      '<div><strong>FX9600:</strong> <span style="color: #28a745;">● Online</span></div>' +
                                      '<div><strong>MC3330R:</strong> <span style="color: #28a745;">● Online</span></div><br>' +
                                      '<h4>Database</h4>' +
                                      '<div><strong>PostgreSQL:</strong> <span style="color: #28a745;">● Connected</span></div>' +
                                      '<div><strong>API Backend:</strong> <span style="color: #28a745;">● Online</span></div>' +
                                      '</div>',
                                tbar: [
                                    {
                                        text: 'Refresh',
                                        iconCls: 'fa fa-refresh',
                                        handler: function() {
                                            me.loadDashboardData();
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

        this.callParent(arguments);
        
        // Load dashboard data after component is fully initialized
        setTimeout(function() {
            me.loadDashboardData();
        }, 100);
    },

    // Load dashboard data from backend APIs
    loadDashboardData: function() {
        var me = this;
        var controller = me.getWarehouseController();
        
        console.log('🔍 DEBUG: Loading dashboard data, controller available:', !!controller);
        
        if (!controller) {
            console.log('⚠️ INFO: WarehouseController not available, using demo data');
            me.loadDemoData();
            return;
        }
        
        try {
            // Load dashboard metrics
            controller.getDashboardMetrics()
                .then(function(metrics) {
                    console.log('✅ DEBUG: Dashboard metrics loaded:', metrics);
                    me.updateMetricsCards(metrics);
                })
                .catch(function(error) {
                    console.error('❌ ERROR loading dashboard metrics:', error);
                    me.loadDemoData();
                });
            
            // Load recent activities
            controller.getDashboardActivities()
                .then(function(activities) {
                    console.log('✅ DEBUG: Dashboard activities loaded:', activities);
                    var activitiesGrid = me.down('#activitiesGrid');
                    if (activitiesGrid) {
                        var store = activitiesGrid.getStore();
                        store.removeAll();
                        if (activities && activities.length > 0) {
                            store.add(activities);
                        }
                    }
                })
                .catch(function(error) {
                    console.error('❌ ERROR loading dashboard activities:', error);
                });
        } catch (error) {
            console.error('❌ ERROR in loadDashboardData:', error);
            me.loadDemoData();
        }
    },

    // Load demo data when controller not available
    loadDemoData: function() {
        console.log('📊 INFO: Loading demo dashboard data');
        
        // Update metrics with demo data
        this.updateMetricsCards({
            total_deliveries: 15,
            pending_tasks: 8,
            total_items: 1247,
            rfid_scans_today: 342
        });
        
        // Load demo activities
        var activitiesGrid = this.down('#activitiesGrid');
        if (activitiesGrid) {
            var store = activitiesGrid.getStore();
            store.removeAll();
            store.add([
                {
                    activity_type: 'Good Receive',
                    description: 'Delivery GRN-2024-001 received',
                    user_name: 'admin',
                    timestamp: new Date()
                },
                {
                    activity_type: 'Put Away',
                    description: 'Items moved to GOLD-ROOM-A',
                    user_name: 'operator1',
                    timestamp: new Date(Date.now() - 300000)
                }
            ]);
        }
    },

    // Update metrics cards with real data
    updateMetricsCards: function(metrics) {
        if (!metrics) return;
        
        // Update total deliveries
        var totalDeliveriesEl = document.getElementById('totalDeliveries');
        if (totalDeliveriesEl && metrics.total_deliveries !== undefined) {
            totalDeliveriesEl.innerHTML = '<h2 style="margin: 0; color: white;">' + metrics.total_deliveries + '</h2><p style="margin: 5px 0 0 0; color: #e0e0e0;">Total Deliveries</p>';
        }
        
        // Update pending tasks
        var pendingTasksEl = document.getElementById('pendingTasks');
        if (pendingTasksEl && metrics.pending_tasks !== undefined) {
            pendingTasksEl.innerHTML = '<h2 style="margin: 0; color: white;">' + metrics.pending_tasks + '</h2><p style="margin: 5px 0 0 0; color: #e0e0e0;">Pending Tasks</p>';
        }
        
        // Update total items
        var totalItemsEl = document.getElementById('totalItems');
        if (totalItemsEl && metrics.total_items !== undefined) {
            totalItemsEl.innerHTML = '<h2 style="margin: 0; color: white;">' + metrics.total_items + '</h2><p style="margin: 5px 0 0 0; color: #e0e0e0;">Items in Stock</p>';
        }
        
        // Update RFID scans
        var rfidScansEl = document.getElementById('rfidScans');
        if (rfidScansEl && metrics.rfid_scans_today !== undefined) {
            rfidScansEl.innerHTML = '<h2 style="margin: 0; color: white;">' + metrics.rfid_scans_today + '</h2><p style="margin: 5px 0 0 0; color: #e0e0e0;">RFID Scans Today</p>';
        }
    },

    // Clean up auto-refresh task when component is destroyed
    onDestroy: function() {
        if (this.refreshTask) {
            Ext.TaskManager.stop(this.refreshTask);
        }
        this.callParent(arguments);
    }
});
