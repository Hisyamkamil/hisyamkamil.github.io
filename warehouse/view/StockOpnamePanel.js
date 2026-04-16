/**
 * Stock Opname Panel Component
 * Physical inventory counting and reconciliation
 */
Ext.define('Store.warehouse.view.StockOpnamePanel', {
    extend: 'Ext.panel.Panel',
    
    title: 'Stock Opname - Physical Inventory Counting',
    layout: 'border',
    border: false,
    
    initComponent: function() {
        var me = this;
        
        // Create stock opname sessions store - INTEGRATED WITH BACKEND API
        var sessionsStore = Ext.create('Ext.data.Store', {
            fields: [
                'session_id',
                'session_name',
                'location',
                'status',
                'scheduled_date',
                'started_date',
                'completed_date',
                'total_items',
                'counted_items',
                'variance_items',
                'created_by_name',
                'assigned_to'
            ],
            data: [] // Will be loaded from API
        });
        
        // Load data after component is fully rendered
        me.on('afterrender', function() {
            setTimeout(function() {
                me.loadStockOpnameSessions();
            }, 50);
        });

        this.items = [
            // Toolbar
            {
                region: 'north',
                xtype: 'toolbar',
                height: 50,
                items: [
                    {
                        text: 'Create Session',
                        iconCls: 'fa fa-plus',
                        scale: 'medium',
                        handler: function() {
                            me.showSessionForm();
                        }
                    },
                    '-',
                    {
                        text: 'Start Counting',
                        iconCls: 'fa fa-play',
                        scale: 'medium',
                        disabled: true,
                        itemId: 'startBtn',
                        handler: function() {
                            var grid = me.down('grid');
                            var selection = grid.getSelection();
                            if (selection.length > 0) {
                                me.startCounting(selection[0]);
                            }
                        }
                    },
                    '-',
                    {
                        text: 'RFID Count',
                        iconCls: 'fa fa-wifi',
                        scale: 'medium',
                        disabled: true,
                        itemId: 'rfidBtn',
                        handler: function() {
                            var grid = me.down('grid');
                            var selection = grid.getSelection();
                            if (selection.length > 0) {
                                me.showRFIDCounting(selection[0]);
                            }
                        }
                    },
                    '-',
                    {
                        text: 'Generate Report',
                        iconCls: 'fa fa-file-alt',
                        scale: 'medium',
                        disabled: true,
                        itemId: 'reportBtn',
                        handler: function() {
                            var grid = me.down('grid');
                            var selection = grid.getSelection();
                            if (selection.length > 0) {
                                me.generateReport(selection[0]);
                            }
                        }
                    },
                    '->',
                    {
                        xtype: 'combobox',
                        emptyText: 'Filter by status...',
                        width: 150,
                        store: ['All', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'],
                        value: 'All',
                        listeners: {
                            select: function(combo, record) {
                                me.filterByStatus(record.get('field1'));
                            }
                        }
                    },
                    {
                        text: 'Refresh',
                        iconCls: 'fa fa-refresh',
                        handler: function() {
                            me.loadStockOpnameSessions();
                            Ext.Msg.alert('Info', 'Loading stock opname sessions from backend...');
                        }
                    }
                ]
            },
            
            // Sessions Grid
            {
                region: 'center',
                xtype: 'grid',
                itemId: 'stockOpnameGrid',  // CRITICAL: Add itemId for WarehouseController to find this grid
                store: sessionsStore,
                columns: [
                    {
                        text: 'Session ID',
                        dataIndex: 'session_id',
                        width: 120,
                        renderer: function(value) {
                            return '<strong>' + value + '</strong>';
                        }
                    },
                    {
                        text: 'Session Name',
                        dataIndex: 'session_name',
                        flex: 2
                    },
                    {
                        text: 'Location',
                        dataIndex: 'location',
                        width: 120
                    },
                    {
                        text: 'Status',
                        dataIndex: 'status',
                        width: 100,
                        renderer: function(value) {
                            var colorMap = {
                                'Scheduled': '#007bff',
                                'In Progress': '#ffc107',
                                'Completed': '#28a745',
                                'Cancelled': '#dc3545'
                            };
                            var color = colorMap[value] || '#6c757d';
                            return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                        }
                    },
                    {
                        text: 'Progress',
                        dataIndex: 'counted_items',
                        width: 100,
                        renderer: function(value, metaData, record) {
                            var total = record.get('total_items') || 0;
                            var counted = value || 0;
                            var percentage = total > 0 ? Math.round((counted / total) * 100) : 0;
                            var color = percentage === 100 ? 'green' : percentage > 50 ? 'orange' : 'red';
                            return '<span style="color: ' + color + ';">' + counted + '/' + total + ' (' + percentage + '%)</span>';
                        }
                    },
                    {
                        text: 'Variance',
                        dataIndex: 'variance_items',
                        width: 80,
                        align: 'center',
                        renderer: function(value) {
                            var color = value === 0 ? 'green' : 'red';
                            return '<span style="color: ' + color + '; font-weight: bold;">' + (value || 0) + '</span>';
                        }
                    },
                    {
                        text: 'Assigned To',
                        dataIndex: 'assigned_to',
                        width: 120
                    },
                    {
                        text: 'Scheduled Date',
                        dataIndex: 'scheduled_date',
                        width: 110,
                        renderer: function(value) {
                            return value ? Ext.util.Format.date(new Date(value), 'd M Y') : 'N/A';
                        }
                    },
                    {
                        text: 'Completed Date',
                        dataIndex: 'completed_date',
                        width: 130,
                        renderer: function(value) {
                            return value ? Ext.util.Format.date(new Date(value), 'd M Y H:i') : '-';
                        }
                    }
                ],
                listeners: {
                    selectionchange: function(model, selected) {
                        var startBtn = me.down('#startBtn');
                        var rfidBtn = me.down('#rfidBtn');
                        var reportBtn = me.down('#reportBtn');
                        
                        if (selected.length > 0) {
                            var record = selected[0];
                            var status = record.get('status');
                            
                            startBtn.setDisabled(status !== 'Scheduled');
                            rfidBtn.setDisabled(status !== 'In Progress');
                            reportBtn.setDisabled(status !== 'Completed');
                        } else {
                            startBtn.setDisabled(true);
                            rfidBtn.setDisabled(true);
                            reportBtn.setDisabled(true);
                        }
                    },
                    itemdblclick: function(view, record) {
                        me.showSessionDetails(record);
                    }
                }
            }
        ];

        this.callParent(arguments);
    },

    // Load stock opname sessions from backend API
    loadStockOpnameSessions: function() {
        var me = this;
        
        // Access the global warehouse controller
        var controller = window.warehouseController;
        
        if (controller && controller.loadStockOpnameSessions) {
            console.log('✅ Loading stock opname sessions via global warehouse controller');
            controller.loadStockOpnameSessions();
        } else {
            console.error('❌ WarehouseController not available globally for Stock Opname');
            console.error('Debug info - window.warehouseController:', !!window.warehouseController);
            console.error('Debug info - loadStockOpnameSessions method:', !!(window.warehouseController && window.warehouseController.loadStockOpnameSessions));
            
            // Clear grid and show error message
            var grid = me.down('grid');
            if (grid && grid.getStore) {
                var store = grid.getStore();
                store.removeAll();
                console.log('⚠️ Stock Opname grid cleared due to missing controller');
            }
            
            // Show user-friendly error
            Ext.Msg.alert('API Error', 'Unable to connect to warehouse backend for Stock Opname sessions. Please refresh the page or contact IT support.');
        }
    },

    showSessionForm: function(record) {
        var me = this;
        var isEdit = !!record;
        
        var form = Ext.create('Ext.form.Panel', {
            bodyPadding: 15,
            defaults: {
                anchor: '100%',
                labelWidth: 150
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'session_name',
                    fieldLabel: 'Session Name *',
                    allowBlank: false,
                    value: isEdit ? record.get('session_name') : ''
                },
                {
                    xtype: 'combobox',
                    name: 'location',
                    fieldLabel: 'Location *',
                    allowBlank: false,
                    store: ['GOLD-ROOM-A', 'GOLD-ROOM-B', 'STORAGE-A1', 'STORAGE-B1', 'HIGH-VALUE-01'],
                    value: isEdit ? record.get('location') : ''
                },
                {
                    xtype: 'datefield',
                    name: 'scheduled_date',
                    fieldLabel: 'Scheduled Date *',
                    allowBlank: false,
                    format: 'Y-m-d',
                    value: isEdit ? new Date(record.get('scheduled_date')) : new Date()
                },
                {
                    xtype: 'combobox',
                    name: 'assigned_to',
                    fieldLabel: 'Assign To *',
                    allowBlank: false,
                    store: ['stockkeeper_001', 'stockkeeper_002', 'stockkeeper_003'],
                    value: isEdit ? record.get('assigned_to') : 'stockkeeper_001'
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: isEdit ? 'Edit Session: ' + record.get('session_id') : 'Create Stock Opname Session',
            modal: true,
            width: 500,
            height: 300,
            layout: 'fit',
            items: [form],
            buttons: [
                {
                    text: 'Cancel',
                    handler: function() {
                        window.close();
                    }
                },
                {
                    text: isEdit ? 'Update Session' : 'Create Session',
                    formBind: true,
                    handler: function() {
                        if (form.isValid()) {
                            var values = form.getValues();
                            
                            if (isEdit) {
                                record.set(values);
                                Ext.Msg.alert('Success', 'Session "' + values.session_name + '" updated successfully!');
                                window.close();
                            } else {
                                // Integration with backend API - Task 19
                                var controller = window.warehouseController;
                                
                                if (controller && controller.createStockOpnameSession) {
                                    console.log('✅ Creating stock opname session via backend API');
                                    
                                    // Map form data to API format - aligned with backend schema
                                    var sessionData = {
                                        sessionName: values.session_name,
                                        locationId: values.location || 'loc-default-001',
                                        plannedDate: values.scheduled_date, // Fixed: use 'plannedDate' not 'scheduledDate'
                                        description: 'Stock opname session created via warehouse management system',
                                        itemFilter: {} // Default empty filter
                                    };
                                    
                                    controller.createStockOpnameSession(sessionData);
                                    window.close();
                                    
                                } else {
                                    console.error('❌ WarehouseController not available for createStockOpnameSession');
                                    Ext.Msg.alert('Error', 'Backend integration not available for Stock Opname session creation.');
                                }
                            }
                        }
                    }
                }
            ]
        });
        
        window.show();
    },

    startCounting: function(record) {
        var me = this;
        
        Ext.Msg.confirm('Start Counting',
            'Start physical counting for session "' + record.get('session_name') + '"?',
            function(btn) {
                if (btn === 'yes') {
                    // Integration with backend API - Task 20
                    var controller = window.warehouseController;
                    
                    if (controller && controller.startStockOpnameSession) {
                        console.log('✅ Starting stock opname session via backend API');
                        
                        // Map record data to API format
                        var sessionData = {
                            sessionId: record.get('session_id'),
                            session_id: record.get('session_id'),
                            startedBy: 'current_user'
                        };
                        
                        controller.startStockOpnameSession(sessionData);
                        
                    } else {
                        console.error('❌ WarehouseController not available for startStockOpnameSession');
                        Ext.Msg.alert('Error', 'Backend integration not available for starting Stock Opname session.');
                    }
                }
            }
        );
    },

    showRFIDCounting: function(record) {
        var me = this;
        
        // RFID counting interface
        var countingPanel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            items: [
                {
                    region: 'west',
                    width: 300,
                    title: 'RFID Scanner Status',
                    bodyPadding: 15,
                    html: '<div style="text-align: center;">' +
                          '<div style="font-size: 48px; color: #007bff; margin: 20px 0;"><i class="fa fa-wifi"></i></div>' +
                          '<h3>RFID Scanner Ready</h3>' +
                          '<p>Session: <strong>' + record.get('session_name') + '</strong></p>' +
                          '<p>Location: <strong>' + record.get('location') + '</strong></p>' +
                          '</div>',
                    tbar: [
                        {
                            text: 'Start RFID Scan',
                            iconCls: 'fa fa-play',
                            handler: function() {
                                Ext.Msg.alert('RFID Scanning', 'RFID bulk scanning started for location: ' + record.get('location'));
                            }
                        }
                    ]
                },
                {
                    region: 'center',
                    title: 'Counted Items',
                    xtype: 'grid',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['epc', 'item_code', 'item_name', 'system_qty', 'counted_qty', 'variance', 'status']
                    }),
                    columns: [
                        { text: 'EPC Code', dataIndex: 'epc', width: 180, style: 'font-family: monospace;' },
                        { text: 'Item Code', dataIndex: 'item_code', width: 100 },
                        { text: 'Item Name', dataIndex: 'item_name', flex: 2 },
                        { text: 'System Qty', dataIndex: 'system_qty', width: 90, align: 'center' },
                        { text: 'Counted Qty', dataIndex: 'counted_qty', width: 100, align: 'center' },
                        { 
                            text: 'Variance', 
                            dataIndex: 'variance', 
                            width: 80, 
                            align: 'center',
                            renderer: function(value) {
                                var color = value === 0 ? 'green' : 'red';
                                return '<span style="color: ' + color + '; font-weight: bold;">' + (value || 0) + '</span>';
                            }
                        },
                        { text: 'Status', dataIndex: 'status', width: 100 }
                    ]
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: 'RFID Stock Counting - ' + record.get('session_name'),
            modal: true,
            width: 900,
            height: 600,
            layout: 'fit',
            items: [countingPanel],
            buttons: [
                {
                    text: 'Complete Session',
                    iconCls: 'fa fa-check',
                    handler: function() {
                        me.completeSession(record);
                        window.close();
                    }
                },
                {
                    text: 'Close',
                    handler: function() {
                        window.close();
                    }
                }
            ]
        });
        
        window.show();
    },

    completeSession: function(record) {
        var me = this;
        
        Ext.Msg.confirm('Complete Session',
            'Complete stock opname session "' + record.get('session_name') + '"?',
            function(btn) {
                if (btn === 'yes') {
                    // Integration with backend API - Task 21
                    var controller = window.warehouseController;
                    
                    if (controller && controller.completeStockOpnameSession) {
                        console.log('✅ Completing stock opname session via backend API');
                        
                        // Map record data to API format
                        var sessionData = {
                            sessionId: record.get('session_id'),
                            session_id: record.get('session_id'),
                            completedBy: 'current_user',
                            notes: 'Stock opname session completed via warehouse management system'
                        };
                        
                        controller.completeStockOpnameSession(sessionData);
                        
                    } else {
                        console.error('❌ WarehouseController not available for completeStockOpnameSession');
                        Ext.Msg.alert('Error', 'Backend integration not available for completing Stock Opname session.');
                    }
                }
            }
        );
    },

    generateReport: function(record) {
        Ext.Msg.alert('Stock Opname Report',
            'Stock opname report generated for session: "' + record.get('session_name') + '"\n\n' +
            'Report includes:\n' +
            '• Physical count results\n' +
            '• Variance analysis\n' +
            '• System vs Physical comparison\n' +
            '• Adjustment recommendations'
        );
    },

    showSessionDetails: function(record) {
        // Implementation for detailed session view
        Ext.Msg.alert('Session Details', 'Session details view for: ' + record.get('session_name'));
    },

    filterByStatus: function(status) {
        var grid = this.down('grid');
        var store = grid.getStore();
        
        store.clearFilter();
        
        if (status && status !== 'All') {
            store.filter('status', status);
        }
    }
});
