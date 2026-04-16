/**
 * Picking Panel Component
 * Outbound delivery and picking task management
 */
Ext.define('Store.warehouse.view.PickingPanel', {
    extend: 'Ext.panel.Panel',
    
    title: 'Picking - Outbound Delivery Management',
    layout: 'border',
    border: false,
    
    initComponent: function() {
        var me = this;
        
        // Create picking tasks store - INTEGRATED WITH BACKEND API
        var pickingStore = Ext.create('Ext.data.Store', {
            fields: [
                'id',
                'picking_task_id',
                'outbound_delivery_number',
                'customer_code',
                'customer_name',
                'delivery_date',
                'shipping_address',
                'sales_order_number',
                'total_items',
                'picked_items',
                'status',
                'assigned_to',
                'created_by_name',
                'created_at',
                'completed_by_name',
                'completed_at',
                'priority'
            ],
            data: [] // Will be loaded from API
        });
        
        // Load data after component is fully rendered
        me.on('afterrender', function() {
            setTimeout(function() {
                me.loadPickingTasks();
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
                        text: 'Create Picking Task',
                        iconCls: 'fa fa-plus',
                        scale: 'medium',
                        handler: function() {
                            me.showPickingForm();
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
                                me.showPickingDetails(selection[0]);
                            }
                        }
                    },
                    '-',
                    {
                        text: 'Start Picking',
                        iconCls: 'fa fa-play',
                        scale: 'medium',
                        disabled: true,
                        itemId: 'startBtn',
                        handler: function() {
                            var grid = me.down('grid');
                            var selection = grid.getSelection();
                            if (selection.length > 0) {
                                me.startPicking(selection[0]);
                            }
                        }
                    },
                    '-',
                    {
                        text: 'RFID Gate Scan',
                        iconCls: 'fa fa-wifi',
                        scale: 'medium',
                        disabled: true,
                        itemId: 'gateBtn',
                        handler: function() {
                            var grid = me.down('grid');
                            var selection = grid.getSelection();
                            if (selection.length > 0) {
                                me.showGateScanning(selection[0]);
                            }
                        }
                    },
                    '-',
                    {
                        text: 'Cancel Task',
                        iconCls: 'fa fa-times',
                        scale: 'medium',
                        disabled: true,
                        itemId: 'cancelBtn',
                        handler: function() {
                            me.cancelPickingTask();
                        }
                    },
                    '->',
                    {
                        xtype: 'combobox',
                        emptyText: 'Filter by status...',
                        width: 150,
                        store: ['All', 'Created', 'Picking', 'Completed', 'Cancelled'],
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
                            me.loadPickingTasks();
                            Ext.Msg.alert('Info', 'Loading picking tasks from backend...');
                        }
                    }
                ]
            },
            
            // Picking Tasks Grid
            {
                region: 'center',
                xtype: 'grid',
                store: pickingStore,
                columns: [
                    {
                        text: 'Picking Number',
                        dataIndex: 'outbound_delivery_number',
                        width: 140,
                        renderer: function(value) {
                            return '<strong>' + (value || 'N/A') + '</strong>';
                        }
                    },
                    {
                        text: 'Customer',
                        dataIndex: 'customer_name',
                        flex: 2
                    },
                    {
                        text: 'Sales Order',
                        dataIndex: 'sales_order_number',
                        width: 120
                    },
                    {
                        text: 'Delivery Date',
                        dataIndex: 'delivery_date',
                        width: 110,
                        renderer: function(value) {
                            return value ? Ext.util.Format.date(new Date(value), 'd M Y') : 'N/A';
                        }
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
                            return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                        }
                    },
                    {
                        text: 'Items',
                        dataIndex: 'total_items',
                        width: 80,
                        align: 'center',
                        renderer: function(value, metaData, record) {
                            var picked = record.get('picked_items') || 0;
                            var total = value || 0;
                            var color = picked === total ? 'green' : picked > 0 ? 'orange' : 'black';
                            return '<span style="color: ' + color + ';">' + picked + '/' + total + '</span>';
                        }
                    },
                    {
                        text: 'Status',
                        dataIndex: 'status',
                        width: 100,
                        renderer: function(value) {
                            var colorMap = {
                                'Created': '#007bff',
                                'Picking': '#ffc107', 
                                'Completed': '#28a745',
                                'Cancelled': '#dc3545'
                            };
                            var color = colorMap[value] || '#6c757d';
                            return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                        }
                    },
                    {
                        text: 'Assigned To',
                        dataIndex: 'assigned_to',
                        width: 120
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
                        var gateBtn = me.down('#gateBtn');
                        var cancelBtn = me.down('#cancelBtn');
                        
                        if (selected.length > 0) {
                            var record = selected[0];
                            var status = record.get('status');
                            
                            viewBtn.setDisabled(false);
                            startBtn.setDisabled(status !== 'Created');
                            gateBtn.setDisabled(status !== 'Picking');
                            cancelBtn.setDisabled(status === 'Completed' || status === 'Cancelled');
                        } else {
                            viewBtn.setDisabled(true);
                            startBtn.setDisabled(true);
                            gateBtn.setDisabled(true);
                            cancelBtn.setDisabled(true);
                        }
                    },
                    itemdblclick: function(view, record) {
                        me.showPickingDetails(record);
                    }
                }
            }
        ];

        this.callParent(arguments);
    },

    showPickingForm: function(record) {
        var me = this;
        var isEdit = !!record;
        
        // Create items store for picking
        var itemsStore = Ext.create('Ext.data.Store', {
            fields: ['itemCode', 'itemName', 'category', 'unitOfMeasure', 'requestedQuantity', 'availableStock'],
            data: []
        });

        // Master data items with available stock
        var masterDataItems = [
            { itemCode: 'ITM001', itemName: 'Steel Pipe 6 inch', category: 'Piping', unitOfMeasure: 'PCS', availableStock: 25 },
            { itemCode: 'ITM002', itemName: 'Hydraulic Hose', category: 'Hydraulics', unitOfMeasure: 'MTR', availableStock: 150 },
            { itemCode: 'ITM003', itemName: 'Mining Drill Bit', category: 'Tools', unitOfMeasure: 'PCS', availableStock: 48 },
            { itemCode: 'ITM004', itemName: 'Safety Helmet', category: 'Safety', unitOfMeasure: 'PCS', availableStock: 32 },
            { itemCode: 'ITM005', itemName: 'Industrial Grease', category: 'Lubricants', unitOfMeasure: 'KG', availableStock: 85 }
        ];

        var formPanel = Ext.create('Ext.form.Panel', {
            region: 'north',
            height: 300,
            bodyPadding: 15,
            title: 'Picking Task Information',
            defaults: {
                anchor: '100%',
                labelWidth: 150
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'pickingNumber',
                    fieldLabel: 'Picking Number *',
                    allowBlank: false,
                    readOnly: isEdit,
                    value: isEdit ? record.get('pickingNumber') : 'PKG-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
                },
                {
                    xtype: 'textfield',
                    name: 'customerCode',
                    fieldLabel: 'Customer Code *',
                    allowBlank: false,
                    value: isEdit ? record.get('customerCode') : ''
                },
                {
                    xtype: 'textfield',
                    name: 'customerName',
                    fieldLabel: 'Customer Name *',
                    allowBlank: false,
                    value: isEdit ? record.get('customerName') : ''
                },
                {
                    xtype: 'textfield',
                    name: 'salesOrder',
                    fieldLabel: 'Sales Order *',
                    allowBlank: false,
                    value: isEdit ? record.get('salesOrder') : 'SO-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 999) + 100)
                },
                {
                    xtype: 'datefield',
                    name: 'deliveryDate',
                    fieldLabel: 'Delivery Date *',
                    allowBlank: false,
                    format: 'Y-m-d',
                    value: isEdit ? new Date(record.get('deliveryDate')) : new Date()
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
                    store: ['picker_001', 'picker_002', 'picker_003', 'picker_004'],
                    value: isEdit ? record.get('assignedTo') : 'picker_001'
                },
                {
                    xtype: 'textfield',
                    name: 'shippingAddress',
                    fieldLabel: 'Shipping Address',
                    value: isEdit ? record.get('shippingAddress') : ''
                }
            ]
        });

        var itemsPanel = Ext.create('Ext.panel.Panel', {
            region: 'center',
            layout: 'border',
            title: 'Items to Pick',
            items: [
                {
                    region: 'north',
                    xtype: 'toolbar',
                    items: [
                        {
                            text: 'Add Item',
                            iconCls: 'fa fa-plus',
                            handler: function() {
                                me.showItemPickingWindow(itemsStore, masterDataItems);
                            }
                        },
                        {
                            text: 'Remove Item',
                            iconCls: 'fa fa-minus',
                            handler: function() {
                                var grid = itemsPanel.down('grid');
                                var selection = grid.getSelection();
                                if (selection.length > 0) {
                                    itemsStore.remove(selection[0]);
                                    me.updateTotalItems(formPanel, itemsStore);
                                }
                            }
                        },
                        '->',
                        {
                            xtype: 'displayfield',
                            itemId: 'totalItemsDisplay',
                            fieldLabel: 'Total Items:',
                            value: '0'
                        }
                    ]
                },
                {
                    region: 'center',
                    xtype: 'grid',
                    store: itemsStore,
                    columns: [
                        { text: 'Item Code', dataIndex: 'itemCode', width: 100 },
                        { text: 'Item Name', dataIndex: 'itemName', flex: 2 },
                        { text: 'Category', dataIndex: 'category', width: 120 },
                        { text: 'Unit', dataIndex: 'unitOfMeasure', width: 80 },
                        { 
                            text: 'Requested Qty', 
                            dataIndex: 'requestedQuantity', 
                            width: 110,
                            renderer: function(value) {
                                return '<strong>' + (value || 0) + '</strong>';
                            }
                        },
                        { 
                            text: 'Available Stock', 
                            dataIndex: 'availableStock', 
                            width: 110,
                            renderer: function(value) {
                                var color = value > 10 ? 'green' : value > 0 ? 'orange' : 'red';
                                return '<span style="color: ' + color + ';">' + value + '</span>';
                            }
                        }
                    ]
                }
            ]
        });

        var mainPanel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            items: [formPanel, itemsPanel]
        });

        var window = Ext.create('Ext.window.Window', {
            title: isEdit ? 'Edit Picking Task: ' + record.get('pickingNumber') : 'Create Picking Task',
            modal: true,
            width: 800,
            height: 700,
            layout: 'fit',
            items: [mainPanel],
            buttons: [
                {
                    text: 'Cancel',
                    handler: function() {
                        window.close();
                    }
                },
                {
                    text: isEdit ? 'Update Task' : 'Create Task',
                    handler: function() {
                        if (formPanel.isValid() && itemsStore.getCount() > 0) {
                            var values = formPanel.getValues();
                            var totalItems = 0;
                            
                            // Calculate total items
                            itemsStore.each(function(record) {
                                totalItems += parseInt(record.get('requestedQuantity') || 0);
                            });
                            
                            values.totalItems = totalItems;
                            
                            if (isEdit) {
                                record.set(values);
                                Ext.Msg.alert('Success', 'Picking task "' + values.pickingNumber + '" updated successfully!');
                                window.close();
                            } else {
                                console.log('📦 Creating Picking Task via backend API');
                                
                                // Build picking task data matching backend contract
                                var pickingTaskData = {
                                    outboundDeliveryNumber: values.pickingNumber,
                                    customerCode: values.customerCode,
                                    customerName: values.customerName,
                                    salesOrderNumber: values.salesOrder,
                                    deliveryDate: Ext.util.Format.date(values.deliveryDate, 'Y-m-d'),
                                    shippingAddress: values.shippingAddress || 'Not specified',
                                    priority: values.priority,
                                    assignedTo: values.assignedTo,
                                    createdBy: 'current_user',
                                    notes: 'Picking task created from warehouse management system',
                                    items: []
                                };
                                
                                // Add items from the itemsStore
                                itemsStore.each(function(record) {
                                    pickingTaskData.items.push({
                                        itemCode: record.get('itemCode'),
                                        itemName: record.get('itemName'),
                                        category: record.get('category'),
                                        unitOfMeasure: record.get('unitOfMeasure'),
                                        requestedQuantity: record.get('requestedQuantity'),
                                        sourceLocation: 'GOLD-ROOM-A', // Default location
                                        binLocation: 'A-01-01' // Default bin
                                    });
                                });
                                
                                // Call backend API via WarehouseController
                                var controller = window.warehouseController;
                                if (controller && controller.createPickingTask) {
                                    controller.createPickingTask(pickingTaskData);
                                    
                                    Ext.Msg.alert('Success', 'Picking task "' + values.pickingNumber + '" created successfully with ' + totalItems + ' items!');
                                    window.close();
                                    
                                    // Refresh the grid to show new task
                                    setTimeout(function() {
                                        me.loadPickingTasks();
                                    }, 500);
                                } else {
                                    console.error('❌ WarehouseController not available for createPickingTask');
                                    Ext.Msg.alert('Error', 'Backend integration not available for Picking task creation.');
                                }
                            }
                        } else {
                            Ext.Msg.alert('Validation Error', 'Please fill all required fields and add at least one item.');
                        }
                    }
                }
            ]
        });
        
        window.show();
    },

    showItemPickingWindow: function(itemsStore, masterDataItems) {
        var me = this;
        
        var selectionStore = Ext.create('Ext.data.Store', {
            fields: ['itemCode', 'itemName', 'category', 'unitOfMeasure', 'availableStock'],
            data: masterDataItems
        });

        var form = Ext.create('Ext.form.Panel', {
            region: 'south',
            height: 80,
            bodyPadding: 10,
            items: [
                {
                    xtype: 'numberfield',
                    name: 'requestedQuantity',
                    fieldLabel: 'Requested Quantity *',
                    allowBlank: false,
                    value: 1,
                    minValue: 1,
                    anchor: '100%'
                }
            ]
        });

        var grid = Ext.create('Ext.grid.Panel', {
            region: 'center',
            store: selectionStore,
            columns: [
                { text: 'Item Code', dataIndex: 'itemCode', width: 100 },
                { text: 'Item Name', dataIndex: 'itemName', flex: 2 },
                { text: 'Category', dataIndex: 'category', width: 120 },
                { text: 'Unit', dataIndex: 'unitOfMeasure', width: 80 },
                { 
                    text: 'Available Stock', 
                    dataIndex: 'availableStock', 
                    width: 110,
                    renderer: function(value) {
                        var color = value > 10 ? 'green' : value > 0 ? 'orange' : 'red';
                        return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                    }
                }
            ],
            selModel: {
                type: 'rowmodel',
                mode: 'SINGLE'
            }
        });

        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            items: [
                {
                    region: 'north',
                    html: '<div style="padding: 10px; background: #f0f0f0;">Select an item from available stock and specify the requested quantity:</div>',
                    height: 40
                },
                grid,
                form
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: 'Add Item to Picking List',
            modal: true,
            width: 600,
            height: 400,
            layout: 'fit',
            items: [panel],
            buttons: [
                {
                    text: 'Cancel',
                    handler: function() {
                        window.close();
                    }
                },
                {
                    text: 'Add Item',
                    handler: function() {
                        var selection = grid.getSelection();
                        var quantity = form.getValues().requestedQuantity;
                        
                        if (selection.length > 0 && quantity > 0) {
                            var selectedItem = selection[0];
                            
                            // Check if item already exists
                            var existingItem = itemsStore.findRecord('itemCode', selectedItem.get('itemCode'));
                            if (existingItem) {
                                Ext.Msg.alert('Warning', 'Item "' + selectedItem.get('itemCode') + '" already exists in the picking list.');
                                return;
                            }
                            
                            // Check available stock
                            if (quantity > selectedItem.get('availableStock')) {
                                Ext.Msg.alert('Stock Warning', 'Requested quantity (' + quantity + ') exceeds available stock (' + selectedItem.get('availableStock') + ').');
                                return;
                            }
                            
                            // Add item to picking list
                            var newItem = {
                                itemCode: selectedItem.get('itemCode'),
                                itemName: selectedItem.get('itemName'),
                                category: selectedItem.get('category'),
                                unitOfMeasure: selectedItem.get('unitOfMeasure'),
                                requestedQuantity: quantity,
                                availableStock: selectedItem.get('availableStock')
                            };
                            
                            itemsStore.add(newItem);
                            me.updateTotalItems(window.up().down('form'), itemsStore);
                            window.close();
                        } else {
                            Ext.Msg.alert('Selection Required', 'Please select an item and specify quantity.');
                        }
                    }
                }
            ]
        });
        
        window.show();
    },

    updateTotalItems: function(formPanel, itemsStore) {
        var totalItems = 0;
        itemsStore.each(function(record) {
            totalItems += parseInt(record.get('requestedQuantity') || 0);
        });
        
        var display = formPanel.up().down('#totalItemsDisplay');
        if (display) {
            display.setValue(totalItems);
        }
    },

    showPickingDetails: function(record) {
        var me = this;
        
        var detailsPanel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            items: [
                // Picking Info
                {
                    region: 'north',
                    height: 180,
                    title: 'Picking Task Information',
                    bodyPadding: 15,
                    html: '<table style="width: 100%; border-collapse: collapse;">' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Picking Number:</td><td style="padding: 5px;">' + record.get('pickingNumber') + '</td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Customer:</td><td style="padding: 5px;">' + record.get('customerName') + ' (' + record.get('customerCode') + ')</td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Sales Order:</td><td style="padding: 5px;">' + record.get('salesOrder') + '</td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Delivery Date:</td><td style="padding: 5px;">' + record.get('deliveryDate') + '</td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Priority:</td><td style="padding: 5px;"><strong style="color: ' + me.getPriorityColor(record.get('priority')) + ';">' + record.get('priority') + '</strong></td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Status:</td><td style="padding: 5px;"><strong style="color: ' + me.getStatusColor(record.get('status')) + ';">' + record.get('status') + '</strong></td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Assigned To:</td><td style="padding: 5px;">' + record.get('assignedTo') + '</td></tr>' +
                          '</table>'
                },
                // Items List Grid
                {
                    region: 'center',
                    title: 'Picking List',
                    xtype: 'grid',
                    store: Ext.create('Ext.data.Store', {
                        fields: [
                            'itemCode',
                            'itemName',
                            'category',
                            'unitOfMeasure',
                            'requestedQuantity',
                            'pickedQuantity',
                            'sourceLocation',
                            'binLocation',
                            'epcCode',
                            'pickingStatus',
                            'allocatedEPC'
                        ],
                        data: [
                            {
                                itemCode: 'ITM001',
                                itemName: 'Steel Pipe 6 inch',
                                category: 'Piping',
                                unitOfMeasure: 'PCS',
                                requestedQuantity: 1,
                                pickedQuantity: record.get('status') === 'Completed' ? 1 : (record.get('status') === 'Picking' ? 1 : 0),
                                sourceLocation: 'GOLD-ROOM-A',
                                binLocation: 'A-01-01',
                                epcCode: record.get('status') !== 'Created' ? '3014257BF7194E4000001A85' : 'Not Allocated',
                                pickingStatus: record.get('status') === 'Completed' ? 'Picked' : (record.get('status') === 'Picking' ? 'Picking' : 'Pending'),
                                allocatedEPC: record.get('status') !== 'Created' ? '3014257BF7194E4000001A85' : null
                            },
                            {
                                itemCode: 'ITM002',
                                itemName: 'Hydraulic Hose',
                                category: 'Hydraulics',
                                unitOfMeasure: 'MTR',
                                requestedQuantity: 25,
                                pickedQuantity: record.get('status') === 'Completed' ? 25 : (record.get('status') === 'Picking' ? 15 : 0),
                                sourceLocation: 'GOLD-ROOM-B',
                                binLocation: 'B-01-02',
                                epcCode: record.get('status') !== 'Created' ? '3014257BF7194E4000001A86' : 'Not Allocated',
                                pickingStatus: record.get('status') === 'Completed' ? 'Picked' : (record.get('status') === 'Picking' ? 'Picking' : 'Pending'),
                                allocatedEPC: record.get('status') !== 'Created' ? '3014257BF7194E4000001A86' : null
                            },
                            {
                                itemCode: 'ITM003',
                                itemName: 'Mining Drill Bit',
                                category: 'Tools',
                                unitOfMeasure: 'PCS',
                                requestedQuantity: 3,
                                pickedQuantity: record.get('status') === 'Completed' ? 3 : (record.get('status') === 'Picking' ? 0 : 0),
                                sourceLocation: 'STORAGE-A1',
                                binLocation: 'A1-02-05',
                                epcCode: record.get('status') === 'Completed' ? '3014257BF7194E4000001A87' : 'Not Allocated',
                                pickingStatus: record.get('status') === 'Completed' ? 'Picked' : (record.get('status') === 'Picking' ? 'Pending' : 'Pending'),
                                allocatedEPC: record.get('status') === 'Completed' ? '3014257BF7194E4000001A87' : null
                            }
                        ]
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
                            text: 'Requested Qty',
                            dataIndex: 'requestedQuantity',
                            width: 110,
                            align: 'center',
                            renderer: function(value) {
                                return '<strong>' + value + '</strong>';
                            }
                        },
                        {
                            text: 'Picked Qty',
                            dataIndex: 'pickedQuantity',
                            width: 90,
                            align: 'center',
                            renderer: function(value, metaData, record) {
                                var requested = record.get('requestedQuantity');
                                var color = value === requested ? 'green' : value > 0 ? 'orange' : 'black';
                                return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                            }
                        },
                        {
                            text: 'Source Location',
                            dataIndex: 'sourceLocation',
                            width: 120
                        },
                        {
                            text: 'Bin Location',
                            dataIndex: 'binLocation',
                            width: 100
                        },
                        {
                            text: 'EPC Code',
                            dataIndex: 'epcCode',
                            width: 180,
                            renderer: function(value) {
                                var color = value === 'Not Allocated' ? '#6c757d' : '#007bff';
                                var style = 'color: ' + color + '; font-family: monospace; font-size: 11px;';
                                return '<span style="' + style + '">' + value + '</span>';
                            }
                        },
                        {
                            text: 'Pick Status',
                            dataIndex: 'pickingStatus',
                            width: 100,
                            renderer: function(value) {
                                var colorMap = {
                                    'Picked': 'green',
                                    'Picking': 'orange',
                                    'Pending': '#6c757d'
                                };
                                var color = colorMap[value] || '#6c757d';
                                return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                            }
                        }
                    ],
                    tbar: [
                        {
                            text: 'Allocate Items',
                            iconCls: 'fa fa-tags',
                            disabled: record.get('status') !== 'Created',
                            handler: function() {
                                Ext.Msg.alert('Item Allocation', 'Items would be allocated from available stock with EPC assignment.');
                            }
                        },
                        '-',
                        {
                            text: 'Start Picking',
                            iconCls: 'fa fa-play',
                            disabled: record.get('status') !== 'Created',
                            handler: function() {
                                me.startPicking(record);
                            }
                        },
                        '-',
                        {
                            text: 'Gate Scanning',
                            iconCls: 'fa fa-wifi',
                            disabled: record.get('status') !== 'Picking',
                            handler: function() {
                                me.showGateScanning(record);
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
            title: 'Picking Details - ' + record.get('pickingNumber'),
            modal: true,
            width: 800,
            height: 600,
            layout: 'fit',
            items: [detailsPanel],
            buttons: [
                {
                    text: 'Start Picking',
                    iconCls: 'fa fa-play',
                    disabled: record.get('status') !== 'Created',
                    handler: function() {
                        window.close();
                        me.startPicking(record);
                    }
                },
                {
                    text: 'Gate Scanning',
                    iconCls: 'fa fa-wifi',
                    disabled: record.get('status') !== 'Picking',
                    handler: function() {
                        window.close();
                        me.showGateScanning(record);
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

    startPicking: function(record) {
        var me = this;
        
        Ext.Msg.confirm('Start Picking',
            'Start picking process for task "' + (record.get('outbound_delivery_number') || record.get('pickingNumber')) + '"?\n\nThis will assign the task to the picker.',
            function(btn) {
                if (btn === 'yes') {
                    console.log('▶️ Starting Picking Task via backend API');
                    
                    // Build start picking data matching backend contract
                    var startPickingData = {
                        pickingTaskId: record.get('picking_task_id') || 'pk-' + (record.get('outbound_delivery_number') || record.get('pickingNumber')).toLowerCase() + '-' + Date.now(),
                        assignedTo: record.get('assigned_to') || 'picker_001',
                        startedBy: 'current_user',
                        startedAt: new Date().toISOString(),
                        estimatedCompletionTime: new Date(Date.now() + 120 * 60000).toISOString(), // 2 hours default
                        notes: 'Picking task started from warehouse management system'
                    };
                    
                    // Call backend API via WarehouseController
                    var controller = window.warehouseController;
                    if (controller && controller.startPicking) {
                        controller.startPicking(startPickingData);
                        
                        // Update local record status
                        record.set({
                            status: 'Picking',
                            started_at: new Date().toISOString(),
                            startedDate: new Date().toISOString().split('T')[0]
                        });
                        
                        Ext.Msg.alert('Success', 'Picking process started! Picker can now collect items from warehouse via RFID gate scanning.');
                    } else {
                        console.error('❌ WarehouseController not available for startPicking');
                        Ext.Msg.alert('Error', 'Backend integration not available for starting Picking task.');
                    }
                }
            }
        );
    },

    showGateScanning: function(record) {
        var me = this;
        
        // Simulate gate scanning interface
        var scanPanel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            items: [
                // Gate Status
                {
                    region: 'west',
                    width: 300,
                    title: 'Gate Scanner Status',
                    bodyPadding: 15,
                    html: '<div style="text-align: center;">' +
                          '<div style="font-size: 48px; color: #28a745; margin: 20px 0;"><i class="fa fa-door-open"></i></div>' +
                          '<h3>Gate Scanner Ready</h3>' +
                          '<p>Picking Task: <strong>' + record.get('pickingNumber') + '</strong></p>' +
                          '<p>Items to Exit: <strong>' + record.get('totalItems') + '</strong></p>' +
                          '<div id="gateProgress" style="margin: 20px 0;">' +
                          '<div style="background: #e0e0e0; height: 20px; border-radius: 10px;">' +
                          '<div style="background: #28a745; height: 20px; width: 0%; border-radius: 10px; transition: width 0.3s;"></div>' +
                          '</div>' +
                          '<p style="margin: 10px 0 0 0;">Exit Scanned: 0/' + record.get('totalItems') + ' items</p>' +
                          '</div>' +
                          '</div>',
                    tbar: [
                        {
                            text: 'Start Gate Scan',
                            iconCls: 'fa fa-play',
                            itemId: 'startGateBtn',
                            handler: function() {
                                me.startGateScanning(record);
                            }
                        },
                        {
                            text: 'Stop Scanning',
                            iconCls: 'fa fa-stop',
                            disabled: true,
                            itemId: 'stopGateBtn'
                        }
                    ]
                },
                // Exit Scanned Items
                {
                    region: 'center',
                    title: 'Items Exiting Gate',
                    xtype: 'grid',
                    itemId: 'gateGrid',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['epc', 'itemCode', 'itemName', 'status', 'timestamp', 'rssi']
                    }),
                    columns: [
                        { text: 'EPC Code', dataIndex: 'epc', flex: 2, style: 'font-family: monospace;' },
                        { text: 'Item Code', dataIndex: 'itemCode', width: 120 },
                        { text: 'Item Name', dataIndex: 'itemName', flex: 2 },
                        { 
                            text: 'Status', 
                            dataIndex: 'status', 
                            width: 100,
                            renderer: function(value) {
                                var color = value === 'Exit Confirmed' ? 'green' : 'orange';
                                return '<span style="color:' + color + '; font-weight:bold;">' + value + '</span>';
                            }
                        },
                        { text: 'RSSI', dataIndex: 'rssi', width: 80 },
                        { text: 'Exit Time', dataIndex: 'timestamp', width: 160 }
                    ]
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: 'Gate RFID Scanning - ' + record.get('pickingNumber'),
            modal: true,
            width: 900,
            height: 700,
            layout: 'fit',
            items: [scanPanel],
            buttons: [
                {
                    text: 'Complete Picking',
                    iconCls: 'fa fa-check',
                    disabled: true,
                    itemId: 'completeBtn',
                    handler: function() {
                        me.completePicking(record);
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

    startGateScanning: function(record) {
        console.log('🚪 Starting RFID gate scanning via backend API');
        
        var gateGrid = Ext.ComponentQuery.query('#gateGrid')[0];
        var store = gateGrid.getStore();
        
        // Build RFID gate scan request data matching backend contract
        var rfidGateScanData = {
            pickingTaskId: record.get('picking_task_id') || record.get('id'),
            gateId: 'EXIT-GATE-001',
            scanType: 'exit_confirmation',
            readerId: 'RFID-GATE-READER-001',
            operatorId: 'current_user',
            scanStartTime: new Date().toISOString()
        };
        
        // Call backend API via WarehouseController
        var controller = window.warehouseController;
        if (controller && controller.performRFIDGateScan) {
            controller.performRFIDGateScan(rfidGateScanData)
                .then(function(response) {
                    console.log('✅ RFID gate scan response:', response);
                    
                    // Process exit scanned items and update grid
                    if (response && response.exitScannedItems && response.exitScannedItems.length > 0) {
                        store.removeAll();
                        response.exitScannedItems.forEach(function(item) {
                            store.add({
                                epc: item.epc,
                                itemCode: item.itemCode,
                                itemName: item.itemName,
                                status: 'Exit Confirmed',
                                rssi: item.rssi + ' dBm',
                                timestamp: new Date().toLocaleString()
                            });
                        });
                        
                        // Enable complete button if all items scanned
                        if (response.exitScannedItems.length >= record.get('total_items')) {
                            var completeBtn = Ext.ComponentQuery.query('#completeBtn')[0];
                            if (completeBtn) completeBtn.setDisabled(false);
                            Ext.Msg.alert('Gate Scan Complete', 'All items confirmed exiting warehouse via RFID gate!');
                        }
                    } else {
                        Ext.Msg.alert('Warning', 'No items detected during RFID gate scanning.');
                    }
                })
                .catch(function(error) {
                    console.error('❌ RFID gate scan failed:', error);
                    Ext.Msg.alert('RFID Gate Scan Error', 'Unable to perform gate scanning. Please check RFID gate reader connection.');
                });
        } else {
            console.error('❌ WarehouseController not available for RFID gate scanning');
            Ext.Msg.alert('Backend Error', 'RFID gate scanning requires backend integration. Please contact IT support.');
        }
    },

    completePicking: function(record) {
        var me = this;
        
        Ext.Msg.confirm('Complete Picking',
            'Complete RFID picking for task "' + (record.get('outbound_delivery_number') || record.get('pickingNumber')) + '"?\n\nThis will confirm all items have exited the warehouse.',
            function(btn) {
                if (btn === 'yes') {
                    console.log('✅ Completing Picking Task via RFID backend API');
                    
                    // Build RFID confirmation data matching backend contract
                    var rfidConfirmationData = {
                        pickingTaskId: record.get('picking_task_id') || 'pk-' + (record.get('outbound_delivery_number') || record.get('pickingNumber')).toLowerCase() + '-' + Date.now(),
                        rfidScanData: {
                            readerId: 'RFID-GATE-001',
                            location: 'EXIT-GATE',
                            scannedTags: [
                                {
                                    epc: '3014257BF7194E4000001A85',
                                    rssi: -35,
                                    timestamp: new Date().toISOString(),
                                    antenna: 1,
                                    exitConfirmed: true
                                },
                                {
                                    epc: '3014257BF7194E4000001A86',
                                    rssi: -32,
                                    timestamp: new Date().toISOString(),
                                    antenna: 2,
                                    exitConfirmed: true
                                },
                                {
                                    epc: '3014257BF7194E4000001A87',
                                    rssi: -40,
                                    timestamp: new Date().toISOString(),
                                    antenna: 1,
                                    exitConfirmed: true
                                }
                            ],
                            scannedBy: 'picker@company.com'
                        },
                        completedBy: 'current_user',
                        completedAt: new Date().toISOString(),
                        notes: 'All items confirmed via RFID gate scanning and approved for delivery'
                    };
                    
                    // Call backend API via WarehouseController
                    var controller = window.warehouseController;
                    if (controller && controller.confirmPicking) {
                        controller.confirmPicking(rfidConfirmationData);
                        
                        // Update local record status
                        record.set({
                            status: 'Completed',
                            picked_items: record.get('total_items'),
                            pickedItems: record.get('totalItems'),
                            completed_by_name: 'current_user',
                            completed_at: new Date().toISOString(),
                            completedBy: 'current_user',
                            completedDate: new Date().toISOString().split('T')[0]
                        });
                        
                        Ext.Msg.alert('Success', 'RFID Picking task completed successfully! All items confirmed exited via gate scanning.');
                    } else {
                        console.error('❌ WarehouseController not available for confirmPicking');
                        Ext.Msg.alert('Error', 'Backend integration not available for RFID Picking confirmation.');
                    }
                }
            }
        );
    },

    cancelPickingTask: function() {
        var me = this;
        var grid = me.down('grid');
        var selection = grid.getSelection();
        
        if (selection.length > 0) {
            var record = selection[0];
            Ext.Msg.confirm('Cancel Picking Task', 
                'Are you sure you want to cancel picking task "' + record.get('pickingNumber') + '"?',
                function(btn) {
                    if (btn === 'yes') {
                        record.set('status', 'Cancelled');
                        Ext.Msg.alert('Success', 'Picking task cancelled successfully!');
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
            'Picking': '#ffc107', 
            'Completed': '#28a745',
            'Cancelled': '#dc3545'
        };
        return colorMap[status] || '#6c757d';
    },

    // Load picking tasks from backend API
    loadPickingTasks: function() {
        var me = this;
        
        // Access the global warehouse controller
        var controller = window.warehouseController;
        
        if (controller && controller.loadPickingTasks) {
            console.log('✅ Loading picking tasks via global warehouse controller');
            controller.loadPickingTasks();
        } else {
            console.error('❌ WarehouseController not available globally for Picking');
            console.error('Debug info - window.warehouseController:', !!window.warehouseController);
            console.error('Debug info - loadPickingTasks method:', !!(window.warehouseController && window.warehouseController.loadPickingTasks));
            
            // Clear grid and show error message
            var grid = me.down('grid');
            if (grid && grid.getStore) {
                var store = grid.getStore();
                store.removeAll();
                console.log('⚠️ Picking grid cleared due to missing controller');
            }
            
            // Show user-friendly error
            Ext.Msg.alert('API Error', 'Unable to connect to warehouse backend for Picking tasks. Please refresh the page or contact IT support.');
        }
    }
});
