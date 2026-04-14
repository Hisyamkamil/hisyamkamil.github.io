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
    layout: 'border',
    border: false,
    
    initComponent: function() {
        var me = this;
        
        // Auto-refresh dashboard data every 30 seconds
        me.refreshTask = {
            run: function() {
                me.loadDashboardData();
            },
            interval: 30000 // 30 seconds
        };
        
        this.items = [
            // Key Metrics Cards
            {
                region: 'north',
                height: 120,
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                margin: '10 10 0 10',
                border: false,
                items: [
                    {
                        xtype: 'panel',
                        flex: 1,
                        margin: '0 5 0 0',
                        cls: 'dashboard-metric-card',
                        bodyStyle: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 20px;',
                        html: '<div id="totalDeliveries"><h2 style="margin: 0; color: white;">0</h2><p style="margin: 5px 0 0 0; color: #e0e0e0;">Total Deliveries</p></div>'
                    },
                    {
                        xtype: 'panel',
                        flex: 1,
                        margin: '0 5 0 0',
                        cls: 'dashboard-metric-card',
                        bodyStyle: 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-align: center; padding: 20px;',
                        html: '<div id="pendingTasks"><h2 style="margin: 0; color: white;">0</h2><p style="margin: 5px 0 0 0; color: #e0e0e0;">Pending Tasks</p></div>'
                    },
                    {
                        xtype: 'panel',
                        flex: 1,
                        margin: '0 5 0 0',
                        cls: 'dashboard-metric-card',
                        bodyStyle: 'background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; text-align: center; padding: 20px;',
                        html: '<div id="totalItems"><h2 style="margin: 0; color: white;">0</h2><p style="margin: 5px 0 0 0; color: #e0e0e0;">Items in Stock</p></div>'
                    },
                    {
                        xtype: 'panel',
                        flex: 1,
                        cls: 'dashboard-metric-card',
                        bodyStyle: 'background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; text-align: center; padding: 20px;',
                        html: '<div id="rfidScans"><h2 style="margin: 0; color: white;">0</h2><p style="margin: 5px 0 0 0; color: #e0e0e0;">RFID Scans Today</p></div>'
                    }
                ]
            },
            
            // Main Content Area
            {
                region: 'center',
                layout: 'border',
                margin: '10',
                items: [
                    // Recent Activities
                    {
                        region: 'west',
                        width: '50%',
                        layout: 'fit',
                        title: 'Recent Activities',
                        margin: '0 5 0 0',
                        items: [
                            {
                                xtype: 'grid',
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
                                        text: 'Activity Type',
                                        dataIndex: 'activity_type',
                                        width: 120,
                                        renderer: function(value) {
                                            var colorMap = {
                                                'Good Receive': '#007bff',
                                                'Put Away': '#28a745',
                                                'Picking': '#ffc107',
                                                'Stock Opname': '#17a2b8',
                                                'RFID Scan': '#6f42c1'
                                            };
                                            var color = colorMap[value] || '#6c757d';
                                            return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
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
                                        width: 100
                                    },
                                    {
                                        text: 'Time',
                                        dataIndex: 'timestamp',
                                        width: 120,
                                        renderer: function(value) {
                                            return value ? Ext.util.Format.date(new Date(value), 'H:i') : '';
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    
                    // System Alerts & Status
                    {
                        region: 'center',
                        layout: 'accordion',
                        margin: '0 0 0 5',
                        items: [
                            {
                                title: 'System Alerts',
                                layout: 'fit',
                                items: [
                                    {
                                        xtype: 'grid',
                                        itemId: 'alertsGrid',
                                        store: Ext.create('Ext.data.Store', {
                                            fields: [
                                                'alert_id',
                                                'alert_type',
                                                'message',
                                                'severity',
                                                'created_at',
                                                'status'
                                            ],
                                            data: []
                                        }),
                                        columns: [
                                            {
                                                text: 'Severity',
                                                dataIndex: 'severity',
                                                width: 80,
                                                renderer: function(value) {
                                                    var colorMap = {
                                                        'Critical': '#dc3545',
                                                        'Warning': '#ffc107',
                                                        'Info': '#17a2b8'
                                                    };
                                                    var color = colorMap[value] || '#6c757d';
                                                    return '<span style="color: ' + color + '; font-weight: bold;">●</span> ' + value;
                                                }
                                            },
                                            {
                                                text: 'Message',
                                                dataIndex: 'message',
                                                flex: 3
                                            },
                                            {
                                                text: 'Time',
                                                dataIndex: 'created_at',
                                                width: 120,
                                                renderer: function(value) {
                                                    return value ? Ext.util.Format.date(new Date(value), 'H:i') : '';
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                title: 'RFID Reader Status',
                                html: '<div style="padding: 15px;">' +
                                      '<div id="rfidStatus">' +
                                      '<div style="margin-bottom: 10px;"><strong>FX9600 Fixed Reader:</strong> <span id="fx9600Status" style="color: #28a745;">● Online</span></div>' +
                                      '<div style="margin-bottom: 10px;"><strong>MC3330R Mobile Reader:</strong> <span id="mc3330Status" style="color: #28a745;">● Online</span></div>' +
                                      '<div><strong>Last Scan:</strong> <span id="lastScan">--:--</span></div>' +
                                      '</div>' +
                                      '</div>'
                            },
                            {
                                title: 'Database Status',
                                html: '<div style="padding: 15px;">' +
                                      '<div id="dbStatus">' +
                                      '<div style="margin-bottom: 10px;"><strong>PostgreSQL:</strong> <span id="pgStatus" style="color: #28a745;">● Connected</span></div>' +
                                      '<div style="margin-bottom: 10px;"><strong>API Backend:</strong> <span id="apiStatus" style="color: #28a745;">● Online</span></div>' +
                                      '<div><strong>Last Health Check:</strong> <span id="lastHealthCheck">--:--</span></div>' +
                                      '</div>' +
                                      '</div>'
                            }
                        ]
                    }
                ]
            },
            
            // Bottom Status Bar
            {
                region: 'south',
                height: 40,
                xtype: 'toolbar',
                style: 'background: #f8f9fa; border-top: 1px solid #dee2e6;',
                items: [
                    {
                        xtype: 'displayfield',
                        itemId: 'statusField',
                        value: 'Dashboard loading...'
                    },
                    '->',
                    {
                        text: 'Refresh',
                        iconCls: 'fa fa-refresh',
                        handler: function() {
                            me.loadDashboardData();
                        }
                    },
                    {
                        xtype: 'displayfield',
                        itemId: 'lastUpdateField',
                        value: 'Last updated: --:--'
                    }
                ]
            }
        ];

        this.callParent(arguments);
        
        // Load initial dashboard data
        me.loadDashboardData();
        
        // Start auto-refresh task
        Ext.TaskManager.start(me.refreshTask);
    },

    // Load dashboard data from backend APIs
    loadDashboardData: function() {
        var me = this;
        var controller = me.getWarehouseController();
        
        if (!controller) {
            console.error('WarehouseController not found');
            return;
        }
        
        // Update status
        var statusField = me.down('#statusField');
        if (statusField) {
            statusField.setValue('Loading dashboard data...');
        }
        
        // Load dashboard metrics
        controller.getDashboardMetrics()
            .then(function(metrics) {
                me.updateMetricsCards(metrics);
            })
            .catch(function(error) {
                console.error('Error loading dashboard metrics:', error);
            });
        
        // Load recent activities
        controller.getDashboardActivities()
            .then(function(activities) {
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
                console.error('Error loading dashboard activities:', error);
            });
        
        // Load system alerts
        controller.getDashboardAlerts()
            .then(function(alerts) {
                var alertsGrid = me.down('#alertsGrid');
                if (alertsGrid) {
                    var store = alertsGrid.getStore();
                    store.removeAll();
                    if (alerts && alerts.length > 0) {
                        store.add(alerts);
                    }
                }
            })
            .catch(function(error) {
                console.error('Error loading dashboard alerts:', error);
            });
        
        // Update last refresh time
        var lastUpdateField = me.down('#lastUpdateField');
        if (lastUpdateField) {
            lastUpdateField.setValue('Last updated: ' + Ext.util.Format.date(new Date(), 'H:i:s'));
        }
        
        if (statusField) {
            statusField.setValue('Dashboard ready - Auto-refresh every 30s');
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
