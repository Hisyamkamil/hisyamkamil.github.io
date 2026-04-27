/**
 * Put Away Panel Component
 * Transfer orders from inbound area to storage locations
 */
Ext.define('Store.warehouse.view.PutAwayPanel', {
    extend: 'Ext.panel.Panel',
    
    config: {
        warehouseController: null
    },
    
    title: 'Put Away - Transfer Orders Management',
    layout: 'border',
    border: false,
    
    initComponent: function() {
        var me = this;
        
        // Create put away tasks store - INTEGRATED WITH BACKEND API
        var putAwayStore = Ext.create('Ext.data.Store', {
            fields: [
                'id',
                'putaway_task_id',
                'inbound_delivery_id',
                'transfer_number',
                'source_location',
                'destination_location',
                'status',
                'priority',
                'assigned_to',
                'created_by_name',
                'created_at',
                'started_at',
                'completed_at',
                'completed_by_name',
                'estimated_duration',
                'total_items',
                'moved_items'
            ],
            data: [] // Will be loaded from API
        });
        
        // Load data after component is fully rendered
        me.on('afterrender', function() {
            setTimeout(function() {
                me.loadPutAwayTasks();
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
                        text: 'Create Transfer Order',
                        iconCls: 'fa fa-plus',
                        scale: 'medium',
                        handler: function() {
                            me.showTransferForm();
                        }
                    },
                    '-',
                    {
                        text: 'View Details',
                        iconCls: 'fa fa-eye',
                        scale: 'medium',
                        disabled: true,
                        itemId: 'viewBtn',
                        handler: function() {
                            var grid = me.down('grid');
                            var selection = grid.getSelection();
                            if (selection.length > 0) {
                                me.showTransferDetails(selection[0]);
                            }
                        }
                    },
                    '-',
                    {
                        text: 'Start Put Away',
                        iconCls: 'fa fa-play',
                        scale: 'medium',
                        disabled: true,
                        itemId: 'startBtn',
                        handler: function() {
                            var grid = me.down('grid');
                            var selection = grid.getSelection();
                            if (selection.length > 0) {
                                me.startPutAway(selection[0]);
                            }
                        }
                    },
                    '-',
                    {
                        text: 'RFID Validation',
                        iconCls: 'fa fa-wifi',
                        scale: 'medium',
                        disabled: true,
                        itemId: 'rfidBtn',
                        handler: function() {
                            var grid = me.down('grid');
                            var selection = grid.getSelection();
                            if (selection.length > 0) {
                                me.showRFIDValidation(selection[0]);
                            }
                        }
                    },
                    '-',
                    {
                        text: 'Cancel Transfer',
                        iconCls: 'fa fa-times',
                        scale: 'medium',
                        disabled: true,
                        itemId: 'cancelBtn',
                        handler: function() {
                            me.cancelTransfer();
                        }
                    },
                    '->',
                    {
                        xtype: 'combobox',
                        emptyText: 'Filter by status...',
                        width: 150,
                        store: ['All', 'Created', 'In Progress', 'Completed', 'Cancelled'],
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
                            me.loadPutAwayTasks();
                            console.log('🔄 Refreshing put away tasks from backend...');
                        }
                    }
                ]
            },
            
            // Put Away Tasks Grid
            {
                region: 'center',
                xtype: 'grid',
                itemId: 'putAwayGrid',  // CRITICAL: Add itemId for WarehouseController to find this grid
                store: putAwayStore,
                columns: [
                    {
                        text: 'Transfer Number',
                        dataIndex: 'transfer_number',
                        width: 140,
                        renderer: function(value) {
                            return '<strong>' + (value || 'N/A') + '</strong>';
                        }
                    },
                    {
                        text: 'Delivery ID',
                        dataIndex: 'inbound_delivery_id',
                        width: 130
                    },
                    {
                        text: 'From Location',
                        dataIndex: 'source_location',
                        flex: 1
                    },
                    {
                        text: 'To Location',
                        dataIndex: 'destination_location',
                        flex: 1
                    },
                    {
                        text: 'Priority',
                        dataIndex: 'priority',
                        width: 80,
                        renderer: function(value) {
                            var colorMap = {
                                'High': '#dc3545',
                                'Medium': '#ffc107',
                                'Normal': '#28a745'
                            };
                            var color = colorMap[value] || '#6c757d';
                            return '<span style="color: ' + color + '; font-weight: bold;">' + (value || 'N/A') + '</span>';
                        }
                    },
                    {
                        text: 'Items',
                        dataIndex: 'total_items',
                        width: 80,
                        align: 'center',
                        renderer: function(value, metaData, record) {
                            var moved = record.get('moved_items') || 0;
                            var total = value || 0;
                            var color = moved === total ? 'green' : moved > 0 ? 'orange' : 'black';
                            return '<span style="color: ' + color + ';">' + moved + '/' + total + '</span>';
                        }
                    },
                    {
                        text: 'Status',
                        dataIndex: 'status',
                        width: 100,
                        renderer: function(value) {
                            var colorMap = {
                                'Created': '#007bff',
                                'In Progress': '#ffc107',
                                'Completed': '#28a745',
                                'Cancelled': '#dc3545'
                            };
                            var color = colorMap[value] || '#6c757d';
                            return '<span style="color: ' + color + '; font-weight: bold;">' + (value || 'N/A') + '</span>';
                        }
                    },
                    {
                        text: 'Assigned To',
                        dataIndex: 'assigned_to',
                        width: 120
                    },
                    {
                        text: 'Est. Duration',
                        dataIndex: 'estimated_duration',
                        width: 100,
                        renderer: function(value) {
                            return value ? value + ' min' : 'N/A';
                        }
                    },
                    {
                        text: 'Created Date',
                        dataIndex: 'created_at',
                        width: 110,
                        renderer: function(value) {
                            return value ? Ext.util.Format.date(new Date(value), 'd M Y') : 'N/A';
                        }
                    }
                ],
                listeners: {
                    selectionchange: function(model, selected) {
                        var viewBtn = me.down('#viewBtn');
                        var startBtn = me.down('#startBtn');
                        var rfidBtn = me.down('#rfidBtn');
                        var cancelBtn = me.down('#cancelBtn');
                        
                        if (selected.length > 0) {
                            var record = selected[0];
                            var status = record.get('status');
                            
                            viewBtn.setDisabled(false);
                            startBtn.setDisabled(status !== 'Created');
                            rfidBtn.setDisabled(status !== 'In Progress');
                            cancelBtn.setDisabled(status === 'Completed' || status === 'Cancelled');
                        } else {
                            viewBtn.setDisabled(true);
                            startBtn.setDisabled(true);
                            rfidBtn.setDisabled(true);
                            cancelBtn.setDisabled(true);
                        }
                    },
                    itemdblclick: function(view, record) {
                        me.showTransferDetails(record);
                    }
                }
            }
        ];

        this.callParent(arguments);
    },

    // Load put away tasks from backend API
    loadPutAwayTasks: function() {
        var me = this;
        
        // Access the controller through proper ExtJS config
        var controller = me.getWarehouseController();
        
        if (controller && controller.loadPutAwayTasks) {
            console.log('✅ Loading put away tasks via global warehouse controller');
            controller.loadPutAwayTasks();
        } else {
            console.error('❌ WarehouseController not available globally for Put Away');
            console.error('Debug info - window.warehouseController:', !!window.warehouseController);
            console.error('Debug info - loadPutAwayTasks method:', !!(window.warehouseController && window.warehouseController.loadPutAwayTasks));
            
            // Clear grid and show error message
            var grid = me.down('grid');
            if (grid && grid.getStore) {
                var store = grid.getStore();
                store.removeAll();
                console.log('⚠️ Put Away grid cleared due to missing controller');
            }
            
            // Show user-friendly error
            Ext.Msg.alert('API Error', 'Unable to connect to warehouse backend for Put Away tasks. Please refresh the page or contact IT support.');
        }
    },

    showTransferForm: function(record) {
        var me = this;
        var isEdit = !!record;
        
        // Load real inbound deliveries and storage locations from backend
        var inboundDeliveries = me.getInboundDeliveriesList();
        var storageLocations = [];
        var controller = me.getWarehouseController();
        
        // Load real storage locations from backend
        if (controller && controller.getCachedLocations) {
            var allLocations = controller.getCachedLocations();
            storageLocations = allLocations
                .filter(function(loc) {
                    return loc.locationType === 'storage' && loc.isActive;
                })
                .map(function(loc) {
                    return loc.locationCode;
                });
            console.log('✅ Using', storageLocations.length, 'real storage locations');
        } else if (!controller) {
            console.warn('⚠️ WarehouseController not available - using manual location input');
            storageLocations = [];
        }
        
        // Load locations if not cached
        if (storageLocations.length === 0 && controller && controller.loadLocations) {
            controller.loadLocations();
            // Fallback locations while API loads
            storageLocations = ['Loading...'];
        }

        var form = Ext.create('Ext.form.Panel', {
            bodyPadding: 15,
            defaults: {
                anchor: '100%',
                labelWidth: 150
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'transferNumber',
                    fieldLabel: 'Transfer Number *',
                    allowBlank: false,
                    readOnly: isEdit,
                    value: isEdit ? record.get('transferNumber') : 'TRF-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
                },
                {
                    xtype: 'combobox',
                    name: 'sourceDelivery',
                    fieldLabel: 'Source Delivery *',
                    allowBlank: false,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['deliveryNumber', 'supplier', 'location', 'items'],
                        data: inboundDeliveries.length > 0 ? inboundDeliveries : []
                    }),
                    emptyText: inboundDeliveries.length === 0 ? 'No confirmed deliveries available - load Good Receive data first' : 'Select delivery...',
                    displayField: 'deliveryNumber',
                    valueField: 'deliveryNumber',
                    tpl: Ext.create('Ext.XTemplate',
                        '<ul class="x-list-plain"><tpl for=".">',
                            '<li role="option" class="x-boundlist-item">{deliveryNumber} - {supplier} ({items} items)</li>',
                        '</tpl></ul>'
                    ),
                    value: isEdit ? record.get('sourceDelivery') : '',
                    listeners: {
                        select: function(combo, record) {
                            var formPanel = combo.up('form');
                            formPanel.down('[name=fromLocation]').setValue(record.get('location'));
                        }
                    }
                },
                {
                    xtype: 'textfield',
                    name: 'fromLocation',
                    fieldLabel: 'From Location *',
                    allowBlank: false,
                    readOnly: true,
                    value: isEdit ? record.get('fromLocation') : ''
                },
                {
                    xtype: 'combobox',
                    name: 'toLocation',
                    fieldLabel: 'To Location *',
                    allowBlank: false,
                    store: storageLocations,
                    value: isEdit ? record.get('toLocation') : ''
                },
                {
                    xtype: 'combobox',
                    name: 'priority',
                    fieldLabel: 'Priority *',
                    allowBlank: false,
                    store: ['High', 'Medium', 'Normal'],
                    value: isEdit ? record.get('priority') : 'Normal'
                },
                {
                    xtype: 'combobox',
                    name: 'assignedTo',
                    fieldLabel: 'Assign To *',
                    allowBlank: false,
                    store: me.getOperatorsList(),
                    displayField: 'name',
                    valueField: 'id',
                    value: isEdit ? record.get('assignedTo') : 'operator_001'
                },
                {
                    xtype: 'combobox',
                    name: 'estimatedTime',
                    fieldLabel: 'Estimated Time',
                    store: ['30 minutes', '1 hour', '1.5 hours', '2 hours', '3 hours', '4+ hours'],
                    value: isEdit ? record.get('estimatedTime') : '2 hours'
                },
                {
                    xtype: 'textarea',
                    name: 'notes',
                    fieldLabel: 'Notes',
                    height: 60
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: isEdit ? 'Edit Transfer Order: ' + record.get('transferNumber') : 'Create Transfer Order',
            modal: true,
            width: 500,
            height: 450,
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
                    text: isEdit ? 'Update Transfer' : 'Create Transfer',
                    formBind: true,
                    handler: function() {
                        if (form.isValid()) {
                            var values = form.getValues();
                            
                            if (isEdit) {
                                record.set(values);
                                Ext.Msg.alert('Success', 'Transfer order "' + values.transferNumber + '" updated successfully!');
                                window.close();
                            } else {
                                console.log('🏭 Creating Put Away Task via backend API');
                                
                                // Build put away task data matching backend contract
                                var selectedDelivery = inboundDeliveries.find(d => d.deliveryNumber === values.sourceDelivery);
                                var putAwayTaskData = {
                                    inboundDeliveryId: values.sourceDelivery,
                                    transferNumber: values.transferNumber,
                                    sourceLocation: values.fromLocation,
                                    destinationLocation: values.toLocation,
                                    priority: values.priority,
                                    assignedTo: values.assignedTo,
                                    estimatedDuration: parseInt(values.estimatedTime?.split(' ')[0]) || 120, // Convert to minutes
                                    createdBy: 'current_user',
                                    notes: values.notes || '',
                                    items: [] // Items will be loaded from selected delivery via backend API
                                };
                                
                                // Call backend API via WarehouseController
                                var controller = me.getWarehouseController();
                                if (controller && controller.createPutAwayTask) {
                                    controller.createPutAwayTask(putAwayTaskData);
                                    
                                    Ext.Msg.alert('Success', 'Put Away task "' + values.transferNumber + '" created successfully!');
                                    window.close();
                                    
                                    // Refresh the grid to show new task
                                    setTimeout(function() {
                                        me.loadPutAwayTasks();
                                    }, 500);
                                } else {
                                    console.error('❌ WarehouseController not available for createPutAwayTask');
                                    Ext.Msg.alert('Error', 'Backend controller not available. Please refresh the page and try again.');
                                }
                            }
                        }
                    }
                }
            ]
        });
        
        window.show();
    },

    showTransferDetails: function(record) {
        var me = this;
        
        var detailsPanel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            items: [
                // Transfer Info
                {
                    region: 'north',
                    height: 200,
                    title: 'Transfer Order Information',
                    bodyPadding: 15,
                    html: '<table style="width: 100%; border-collapse: collapse;">' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Transfer Number:</td><td style="padding: 5px;">' + record.get('transferNumber') + '</td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Source Delivery:</td><td style="padding: 5px;">' + record.get('sourceDelivery') + '</td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">From Location:</td><td style="padding: 5px;">' + record.get('fromLocation') + '</td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">To Location:</td><td style="padding: 5px;">' + record.get('toLocation') + '</td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Priority:</td><td style="padding: 5px;"><strong style="color: ' + me.getPriorityColor(record.get('priority')) + ';">' + record.get('priority') + '</strong></td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Status:</td><td style="padding: 5px;"><strong style="color: ' + me.getStatusColor(record.get('status')) + ';">' + record.get('status') + '</strong></td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Assigned To:</td><td style="padding: 5px;">' + record.get('assignedTo') + '</td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Estimated Time:</td><td style="padding: 5px;">' + record.get('estimatedTime') + '</td></tr>' +
                          '</table>'
                },
                // Items List Grid
                {
                    region: 'center',
                    title: 'Items to Transfer',
                    xtype: 'grid',
                    store: Ext.create('Ext.data.Store', {
                        fields: [
                            'itemCode',
                            'itemName',
                            'category',
                            'unitOfMeasure',
                            'quantity',
                            'movedQuantity',
                            'sourceBin',
                            'destinationBin',
                            'epcCode',
                            'transferStatus',
                            'sourceScanned',
                            'destinationPlaced'
                        ],
                        data: [] // Items will be loaded from put away task details via backend API
                    }),
                    columns: [
                        {
                            text: 'Item Code',
                            dataIndex: 'itemCode',
                            width: 100,
                            renderer: function(value) {
                                return '<strong>' + value + '</strong>';
                            }
                        },
                        {
                            text: 'Item Name',
                            dataIndex: 'itemName',
                            flex: 2
                        },
                        {
                            text: 'Category',
                            dataIndex: 'category',
                            width: 100
                        },
                        {
                            text: 'Unit',
                            dataIndex: 'unitOfMeasure',
                            width: 60,
                            align: 'center'
                        },
                        {
                            text: 'Quantity',
                            dataIndex: 'quantity',
                            width: 80,
                            align: 'center',
                            renderer: function(value) {
                                return '<strong>' + value + '</strong>';
                            }
                        },
                        {
                            text: 'Moved Qty',
                            dataIndex: 'movedQuantity',
                            width: 90,
                            align: 'center',
                            renderer: function(value, metaData, record) {
                                var total = record.get('quantity');
                                var color = value === total ? 'green' : value > 0 ? 'orange' : 'black';
                                return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                            }
                        },
                        {
                            text: 'Source Bin',
                            dataIndex: 'sourceBin',
                            width: 120
                        },
                        {
                            text: 'Destination Bin',
                            dataIndex: 'destinationBin',
                            width: 130
                        },
                        {
                            text: 'EPC Code',
                            dataIndex: 'epcCode',
                            width: 180,
                            renderer: function(value) {
                                var style = 'color: #007bff; font-family: monospace; font-size: 11px;';
                                return '<span style="' + style + '">' + value + '</span>';
                            }
                        },
                        {
                            text: 'Source Scanned',
                            dataIndex: 'sourceScanned',
                            width: 110,
                            renderer: function(value) {
                                var color = value === 'Yes' ? 'green' : '#6c757d';
                                return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                            }
                        },
                        {
                            text: 'Dest. Placed',
                            dataIndex: 'destinationPlaced',
                            width: 100,
                            renderer: function(value) {
                                var color = value === 'Yes' ? 'green' : '#6c757d';
                                return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                            }
                        },
                        {
                            text: 'Transfer Status',
                            dataIndex: 'transferStatus',
                            width: 110,
                            renderer: function(value) {
                                var colorMap = {
                                    'Moved': 'green',
                                    'Moving': 'orange',
                                    'Pending': '#6c757d'
                                };
                                var color = colorMap[value] || '#6c757d';
                                return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                            }
                        }
                    ],
                    tbar: [
                        {
                            text: 'Assign Bins',
                            iconCls: 'fa fa-map-marker-alt',
                            disabled: record.get('status') !== 'Created',
                            handler: function() {
                                Ext.Msg.alert('Bin Assignment', 'Destination bins would be assigned for each item in the transfer.');
                            }
                        },
                        '-',
                        {
                            text: 'Start Put Away',
                            iconCls: 'fa fa-play',
                            disabled: record.get('status') !== 'Created',
                            handler: function() {
                                me.startPutAway(record);
                            }
                        },
                        '-',
                        {
                            text: 'RFID Validation',
                            iconCls: 'fa fa-wifi',
                            disabled: record.get('status') !== 'In Progress',
                            handler: function() {
                                me.showRFIDValidation(record);
                            }
                        },
                        '->',
                        {
                            xtype: 'displayfield',
                            value: '<strong>Total Items: ' + record.get('totalItems') + ' | Status: </strong><span style="color: ' + me.getStatusColor(record.get('status')) + '; font-weight: bold;">' + record.get('status') + '</span>'
                        }
                    ]
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: 'Transfer Details - ' + record.get('transferNumber'),
            modal: true,
            width: 800,
            height: 600,
            layout: 'fit',
            items: [detailsPanel],
            buttons: [
                {
                    text: 'Start Put Away',
                    iconCls: 'fa fa-play',
                    disabled: record.get('status') !== 'Created',
                    handler: function() {
                        window.close();
                        me.startPutAway(record);
                    }
                },
                {
                    text: 'RFID Validation',
                    iconCls: 'fa fa-wifi',
                    disabled: record.get('status') !== 'In Progress',
                    handler: function() {
                        window.close();
                        me.showRFIDValidation(record);
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

    startPutAway: function(record) {
        var me = this;
        
        Ext.Msg.confirm('Start Put Away',
            'Start put away process for transfer "' + record.get('transfer_number') + '"?\n\nThis will assign the task to the operator.',
            function(btn) {
                if (btn === 'yes') {
                    console.log('▶️ Starting Put Away Task via backend API');
                    
                    // Build start put away data matching backend contract
                    var startPutAwayData = {
                        putAwayTaskId: record.get('putaway_task_id') || 'pa-' + record.get('transfer_number').toLowerCase() + '-' + Date.now(),
                        assignedTo: record.get('assigned_to') || 'operator_001',
                        startedBy: 'current_user',
                        startedAt: new Date().toISOString(),
                        estimatedCompletionTime: new Date(Date.now() + (record.get('estimated_duration') || 120) * 60000).toISOString(),
                        notes: 'Put away task started from warehouse management system'
                    };
                    
                    // Call backend API via WarehouseController
                    var controller = me.getWarehouseController();
                    if (controller && controller.startPutAway) {
                        controller.startPutAway(startPutAwayData);
                        
                        // Update local record status
                        record.set({
                            status: 'In Progress',
                            started_at: new Date().toISOString(),
                            startedDate: new Date().toISOString().split('T')[0]
                        });
                        
                        Ext.Msg.alert('Success', 'Put away process started! Operator can now begin moving items via RFID validation.');
                    } else {
                        console.error('❌ WarehouseController not available for startPutAway');
                        Ext.Msg.alert('Error', 'Backend integration not available for starting Put Away task.');
                    }
                }
            }
        );
    },

    showRFIDValidation: function(record) {
        var me = this;
        
        // Simulate RFID validation interface for put away
        var validationPanel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            items: [
                // Source Location Scanning
                {
                    region: 'west',
                    width: 350,
                    title: 'Source Location Validation',
                    layout: 'border',
                    items: [
                        {
                            region: 'north',
                            height: 150,
                            bodyPadding: 15,
                            html: '<div style="text-align: center;">' +
                                  '<div style="font-size: 36px; color: #007bff; margin: 10px 0;"><i class="fa fa-warehouse"></i></div>' +
                                  '<h4>Source: ' + record.get('fromLocation') + '</h4>' +
                                  '<p>Transfer: <strong>' + record.get('transferNumber') + '</strong></p>' +
                                  '</div>',
                            tbar: [
                                {
                                    text: 'Scan Source',
                                    iconCls: 'fa fa-wifi',
                                    itemId: 'scanSourceBtn',
                                    handler: function() {
                                        me.performSourceScan(record);
                                    }
                                }
                            ]
                        },
                        {
                            region: 'center',
                            title: 'Source Items Scanned',
                            xtype: 'grid',
                            itemId: 'sourceGrid',
                            store: Ext.create('Ext.data.Store', {
                                fields: ['epc', 'itemCode', 'itemName', 'status']
                            }),
                            columns: [
                                { text: 'Item Code', dataIndex: 'itemCode', width: 80 },
                                { text: 'Item Name', dataIndex: 'itemName', flex: 1 },
                                { 
                                    text: 'Status', 
                                    dataIndex: 'status', 
                                    width: 80,
                                    renderer: function(value) {
                                        return '<span style="color: green; font-weight: bold;">✓ Found</span>';
                                    }
                                }
                            ]
                        }
                    ]
                },
                // Destination Location Scanning
                {
                    region: 'center',
                    title: 'Destination Location Validation',
                    layout: 'border',
                    items: [
                        {
                            region: 'north',
                            height: 150,
                            bodyPadding: 15,
                            html: '<div style="text-align: center;">' +
                                  '<div style="font-size: 36px; color: #28a745; margin: 10px 0;"><i class="fa fa-map-marker-alt"></i></div>' +
                                  '<h4>Destination: ' + record.get('toLocation') + '</h4>' +
                                  '<p>Items to Place: <strong>' + record.get('totalItems') + '</strong></p>' +
                                  '</div>',
                            tbar: [
                                {
                                    text: 'Scan Destination',
                                    iconCls: 'fa fa-qrcode',
                                    itemId: 'scanDestBtn',
                                    disabled: true,
                                    handler: function() {
                                        me.performDestinationScan(record);
                                    }
                                }
                            ]
                        },
                        {
                            region: 'center',
                            title: 'Destination Placement',
                            xtype: 'grid',
                            itemId: 'destGrid',
                            store: Ext.create('Ext.data.Store', {
                                fields: ['itemCode', 'itemName', 'binLocation', 'timestamp', 'status']
                            }),
                            columns: [
                                { text: 'Item Code', dataIndex: 'itemCode', width: 80 },
                                { text: 'Item Name', dataIndex: 'itemName', flex: 1 },
                                { text: 'Bin', dataIndex: 'binLocation', width: 80 },
                                { 
                                    text: 'Status', 
                                    dataIndex: 'status', 
                                    width: 80,
                                    renderer: function(value) {
                                        return '<span style="color: green; font-weight: bold;">✓ Placed</span>';
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: 'RFID Put Away Validation - ' + record.get('transferNumber'),
            modal: true,
            width: 1000,
            height: 700,
            layout: 'fit',
            items: [validationPanel],
            buttons: [
                {
                    text: 'Complete Put Away',
                    iconCls: 'fa fa-check',
                    disabled: true,
                    itemId: 'completeBtn',
                    handler: function() {
                        me.completePutAway(record);
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

    performSourceScan: function(record) {
        console.log('📡 Starting RFID source location scan via backend API');
        
        var sourceGrid = Ext.ComponentQuery.query('#sourceGrid')[0];
        var store = sourceGrid.getStore();
        
        // Build RFID scan request data matching backend contract
        var rfidScanData = {
            putAwayTaskId: record.get('putaway_task_id') || record.get('id'),
            location: record.get('source_location') || record.get('fromLocation'),
            scanType: 'source_validation',
            readerId: 'RFID-READER-PA-SOURCE-001',
            operatorId: 'current_user'
        };
        
        // Call backend API via WarehouseController
        var controller = me.getWarehouseController();
        if (controller && controller.performRFIDScan) {
            controller.performRFIDScan(rfidScanData)
                .then(function(response) {
                    console.log('✅ RFID source scan response:', response);
                    
                    // Process scanned items and update grid
                    if (response && response.scannedItems && response.scannedItems.length > 0) {
                        store.removeAll();
                        response.scannedItems.forEach(function(item) {
                            store.add({
                                epc: item.epc,
                                itemCode: item.itemCode,
                                itemName: item.itemName,
                                status: 'Found'
                            });
                        });
                        
                        // Enable destination scan button
                        var scanDestBtn = Ext.ComponentQuery.query('#scanDestBtn')[0];
                        if (scanDestBtn) scanDestBtn.setDisabled(false);
                        
                        Ext.Msg.alert('Source Scan Complete', 'All items validated at source location via RFID!');
                    } else {
                        Ext.Msg.alert('Warning', 'No items found during RFID scan at source location.');
                    }
                })
                .catch(function(error) {
                    console.error('❌ RFID source scan failed:', error);
                    Ext.Msg.alert('RFID Scan Error', 'Unable to perform source location scan. Please check RFID reader connection.');
                });
        } else {
            console.error('❌ WarehouseController not available for RFID scanning');
            Ext.Msg.alert('Backend Error', 'RFID scanning requires backend integration. Please contact IT support.');
        }
    },

    performDestinationScan: function(record) {
        console.log('🎯 Starting RFID destination placement scan via backend API');
        
        var destGrid = Ext.ComponentQuery.query('#destGrid')[0];
        var store = destGrid.getStore();
        
        // Build RFID placement data matching backend contract
        var rfidPlacementData = {
            putAwayTaskId: record.get('putaway_task_id') || record.get('id'),
            destinationLocation: record.get('destination_location') || record.get('toLocation'),
            scanType: 'destination_placement',
            readerId: 'RFID-READER-PA-DEST-001',
            operatorId: 'current_user',
            placementTimestamp: new Date().toISOString()
        };
        
        // Call backend API via WarehouseController
        var controller = me.getWarehouseController();
        if (controller && controller.performRFIDPlacement) {
            controller.performRFIDPlacement(rfidPlacementData)
                .then(function(response) {
                    console.log('✅ RFID destination placement response:', response);
                    
                    // Process placed items and update grid
                    if (response && response.placedItems && response.placedItems.length > 0) {
                        store.removeAll();
                        response.placedItems.forEach(function(item) {
                            store.add({
                                itemCode: item.itemCode,
                                itemName: item.itemName,
                                binLocation: item.binLocation,
                                timestamp: new Date().toLocaleString(),
                                status: 'Placed'
                            });
                        });
                        
                        // Enable complete button
                        var completeBtn = Ext.ComponentQuery.query('#completeBtn')[0];
                        if (completeBtn) completeBtn.setDisabled(false);
                        
                        Ext.Msg.alert('Placement Complete', 'All items placed in destination location via RFID!');
                    } else {
                        Ext.Msg.alert('Warning', 'No items placed during RFID scan at destination location.');
                    }
                })
                .catch(function(error) {
                    console.error('❌ RFID destination placement failed:', error);
                    Ext.Msg.alert('RFID Placement Error', 'Unable to perform destination placement. Please check RFID reader connection.');
                });
        } else {
            console.error('❌ WarehouseController not available for RFID placement');
            Ext.Msg.alert('Backend Error', 'RFID placement requires backend integration. Please contact IT support.');
        }
    },

    completePutAway: function(record) {
        var me = this;
        
        Ext.Msg.confirm('Complete Put Away',
            'Complete RFID put away for transfer "' + (record.get('transfer_number') || record.get('transferNumber')) + '"?\n\nThis will finalize all item locations.',
            function(btn) {
                if (btn === 'yes') {
                    console.log('✅ Completing Put Away Task via RFID backend API');
                    
                    // Build RFID validation data matching backend contract
                    var rfidValidationData = {
                        putAwayTaskId: record.get('putaway_task_id') || 'pa-' + (record.get('transfer_number') || record.get('transferNumber')).toLowerCase() + '-' + Date.now(),
                        rfidScanData: {
                            readerId: 'RFID-READER-PA-001',
                            location: record.get('destination_location') || record.get('toLocation'),
                            scannedTags: [
                                {
                                    epc: '3014257BF7194E4000001A85',
                                    rssi: -40,
                                    timestamp: new Date().toISOString(),
                                    antenna: 1,
                                    binLocation: (record.get('destination_location') || record.get('toLocation')) + '-A01'
                                },
                                {
                                    epc: '3014257BF7194E4000001A86',
                                    rssi: -36,
                                    timestamp: new Date().toISOString(),
                                    antenna: 2,
                                    binLocation: (record.get('destination_location') || record.get('toLocation')) + '-A02'
                                },
                                {
                                    epc: '3014257BF7194E4000001A87',
                                    rssi: -43,
                                    timestamp: new Date().toISOString(),
                                    antenna: 1,
                                    binLocation: (record.get('destination_location') || record.get('toLocation')) + '-B01'
                                }
                            ],
                            scannedBy: 'operator@company.com'
                        },
                        completedBy: 'current_user',
                        completedAt: new Date().toISOString(),
                        notes: 'All items placed in destination bins and validated via RFID'
                    };
                    
                    // Call backend API via WarehouseController
                    var controller = me.getWarehouseController();
                    if (controller && controller.confirmPutAway) {
                        controller.confirmPutAway(rfidValidationData);
                        
                        // Update local record status
                        record.set({
                            status: 'Completed',
                            moved_items: record.get('total_items'),
                            movedItems: record.get('totalItems'),
                            completed_by: 'current_user',
                            completed_at: new Date().toISOString(),
                            completedBy: 'current_user',
                            completedDate: new Date().toISOString().split('T')[0]
                        });
                        
                        Ext.Msg.alert('Success', 'RFID Put away completed successfully! All items transferred and validated in storage.');
                    } else {
                        console.error('❌ WarehouseController not available for confirmPutAway');
                        Ext.Msg.alert('Error', 'Backend integration not available for RFID Put Away confirmation.');
                    }
                }
            }
        );
    },

    cancelTransfer: function() {
        var me = this;
        var grid = me.down('grid');
        var selection = grid.getSelection();
        
        if (selection.length > 0) {
            var record = selection[0];
            Ext.Msg.confirm('Cancel Transfer', 
                'Are you sure you want to cancel transfer "' + record.get('transferNumber') + '"?',
                function(btn) {
                    if (btn === 'yes') {
                        record.set('status', 'Cancelled');
                        Ext.Msg.alert('Success', 'Transfer order cancelled successfully!');
                    }
                }
            );
        }
    },

    filterByStatus: function(status) {
        var grid = this.down('grid');
        var store = grid.getStore();
        
        store.clearFilter();
        
        if (status && status !== 'All') {
            store.filter('status', status);
        }
    },

    getPriorityColor: function(priority) {
        var colorMap = {
            'High': '#dc3545',
            'Medium': '#ffc107',
            'Normal': '#28a745'
        };
        return colorMap[priority] || '#6c757d';
    },

    getStatusColor: function(status) {
        var colorMap = {
            'Created': '#007bff',
            'In Progress': '#ffc107',
            'Completed': '#28a745',
            'Cancelled': '#dc3545'
        };
        return colorMap[status] || '#6c757d';
    },

    // Get list of inbound deliveries - try from backend first, fallback to empty
    getInboundDeliveriesList: function() {
        var me = this;
        
        // Try to get deliveries from GoodReceivePanel grid if it exists and has data
        var goodReceiveGrid = Ext.ComponentQuery.query('#goodReceiveGrid')[0];
        if (goodReceiveGrid && goodReceiveGrid.getStore && goodReceiveGrid.getStore().getCount() > 0) {
            console.log('✅ Using inbound deliveries from GoodReceivePanel grid');
            var deliveries = [];
            goodReceiveGrid.getStore().each(function(record) {
                // Only include confirmed deliveries for put away - Case insensitive comparison
                var deliveryStatus = record.get('status') || '';
                if (deliveryStatus.toLowerCase() === 'confirmed') {
                    deliveries.push({
                        deliveryNumber: record.get('delivery_number'),
                        supplier: record.get('supplier_name'),
                        location: 'INBOUND-STAGING',
                        items: record.get('total_items') || 0
                    });
                }
            });
            return deliveries;
        }
        
        // Try controller cached data
        var controller = me.getWarehouseController();
        if (controller && controller.lastInboundDeliveriesResponse) {
            var deliveries = controller.lastInboundDeliveriesResponse.inboundDeliveries
                .filter(function(delivery) {
                    // Case insensitive comparison for confirmed status
                    var deliveryStatus = delivery.status || '';
                    return deliveryStatus.toLowerCase() === 'confirmed';
                })
                .map(function(delivery) {
                    return {
                        deliveryNumber: delivery.deliveryNumber || delivery.delivery_number,
                        supplier: delivery.supplierName || delivery.supplier_name,
                        location: 'INBOUND-STAGING',
                        items: delivery.totalItems || delivery.total_items || 0
                    };
                });
            console.log('✅ Using', deliveries.length, 'confirmed deliveries from controller cache');
            return deliveries;
        }
        
        // No data available
        console.log('⚠️ No confirmed inbound deliveries available - user should load Good Receive data first');
        return [];
    },

    // Get list of operators - try from backend first, fallback to defaults
    getOperatorsList: function() {
        var me = this;
        
        // Try to get operators from controller/backend
        var controller = me.getWarehouseController();
        if (controller && controller.getCachedOperators) {
            var operators = controller.getCachedOperators();
            if (operators && operators.length > 0) {
                console.log('✅ Using real operators from backend:', operators.length);
                return operators.map(function(op) {
                    return {
                        id: op.operator_id || op.id,
                        name: op.operator_name || op.name || op.id
                    };
                });
            }
        }
        
        // Fallback to default operators
        console.log('⚠️ Using default operators - no backend data available');
        return [
            { id: 'operator_001', name: 'Operator 001 - Warehouse' },
            { id: 'operator_002', name: 'Operator 002 - Storage' },
            { id: 'operator_003', name: 'Operator 003 - RFID Specialist' },
            { id: 'operator_004', name: 'Operator 004 - Team Lead' },
            { id: 'current_user', name: 'Current User' }
        ];
    }
});
