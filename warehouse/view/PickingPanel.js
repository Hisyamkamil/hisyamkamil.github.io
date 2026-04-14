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
        
        // Create picking tasks store
        var pickingStore = Ext.create('Ext.data.Store', {
            fields: [
                'pickingNumber',
                'customerCode',
                'customerName',
                'deliveryDate',
                'shippingAddress',
                'salesOrder',
                'totalItems',
                'pickedItems',
                'status',
                'assignedTo',
                'createdBy',
                'createdDate',
                'completedBy',
                'completedDate',
                'priority'
            ],
            data: [
                {
                    pickingNumber: 'PKG-2024-001',
                    customerCode: 'CUST001',
                    customerName: 'PT Mining Solutions',
                    deliveryDate: '2024-04-16',
                    shippingAddress: 'Jakarta Industrial Estate',
                    salesOrder: 'SO-2024-100',
                    totalItems: 3,
                    pickedItems: 3,
                    status: 'Completed',
                    assignedTo: 'picker_001',
                    createdBy: 'admin',
                    createdDate: '2024-04-15',
                    completedBy: 'picker_001',
                    completedDate: '2024-04-16',
                    priority: 'High'
                },
                {
                    pickingNumber: 'PKG-2024-002',
                    customerCode: 'CUST002',
                    customerName: 'CV Equipment Rental',
                    deliveryDate: '2024-04-17',
                    shippingAddress: 'Surabaya Mining Complex',
                    salesOrder: 'SO-2024-101',
                    totalItems: 5,
                    pickedItems: 2,
                    status: 'Picking',
                    assignedTo: 'picker_002',
                    createdBy: 'admin',
                    createdDate: '2024-04-16',
                    completedBy: null,
                    completedDate: null,
                    priority: 'Medium'
                },
                {
                    pickingNumber: 'PKG-2024-003',
                    customerCode: 'CUST003',
                    customerName: 'PT Heavy Machinery',
                    deliveryDate: '2024-04-18',
                    shippingAddress: 'Bandung Industrial Park',
                    salesOrder: 'SO-2024-102',
                    totalItems: 8,
                    pickedItems: 0,
                    status: 'Created',
                    assignedTo: 'picker_003',
                    createdBy: 'admin',
                    createdDate: '2024-04-17',
                    completedBy: null,
                    completedDate: null,
                    priority: 'Normal'
                }
            ]
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
                            pickingStore.reload();
                            Ext.Msg.alert('Info', 'Picking tasks refreshed');
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
                        dataIndex: 'pickingNumber',
                        width: 140,
                        renderer: function(value) {
                            return '<strong>' + value + '</strong>';
                        }
                    },
                    {
                        text: 'Customer',
                        dataIndex: 'customerName',
                        flex: 2
                    },
                    {
                        text: 'Sales Order',
                        dataIndex: 'salesOrder',
                        width: 120
                    },
                    {
                        text: 'Delivery Date',
                        dataIndex: 'deliveryDate',
                        width: 110,
                        renderer: Ext.util.Format.dateRenderer('d M Y')
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
                        dataIndex: 'totalItems',
                        width: 80,
                        align: 'center',
                        renderer: function(value, metaData, record) {
                            var picked = record.get('pickedItems');
                            var color = picked === value ? 'green' : picked > 0 ? 'orange' : 'black';
                            return '<span style="color: ' + color + ';">' + picked + '/' + value + '</span>';
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
                        dataIndex: 'assignedTo',
                        width: 120
                    },
                    {
                        text: 'Created Date',
                        dataIndex: 'createdDate',
                        width: 110,
                        renderer: Ext.util.Format.dateRenderer('d M Y')
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
                            } else {
                                values.status = 'Created';
                                values.createdBy = 'current_user';
                                values.createdDate = new Date().toISOString().split('T')[0];
                                values.pickedItems = 0;
                                var store = me.down('grid').getStore();
                                store.add(values);
                                Ext.Msg.alert('Success', 'Picking task "' + values.pickingNumber + '" created successfully with ' + totalItems + ' items!');
                            }
                            window.close();
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
                // Items List (placeholder)
                {
                    region: 'center',
                    title: 'Picking List',
                    html: '<div style="padding: 20px; text-align: center; color: #666;"><p>Items list for picking task <strong>' + record.get('pickingNumber') + '</strong> would be displayed here.</p><p>Features: Item details, quantities, locations, pick status.</p></div>'
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
            'Start picking process for task "' + record.get('pickingNumber') + '"?',
            function(btn) {
                if (btn === 'yes') {
                    record.set('status', 'Picking');
                    Ext.Msg.alert('Success', 'Picking process started! Picker can now collect items from warehouse.');
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
        // Simulate gate RFID scanning
        var gateGrid = Ext.ComponentQuery.query('#gateGrid')[0];
        var store = gateGrid.getStore();
        
        var demoItems = [
            { epc: '3014257BF7194E4000001A85', itemCode: 'ITM001', itemName: 'Steel Pipe 6 inch', status: 'Exit Confirmed', rssi: '-35 dBm' },
            { epc: '3014257BF7194E4000001A86', itemCode: 'ITM002', itemName: 'Hydraulic Hose', status: 'Exit Confirmed', rssi: '-32 dBm' },
            { epc: '3014257BF7194E4000001A87', itemCode: 'ITM003', itemName: 'Mining Drill Bit', status: 'Exit Confirmed', rssi: '-40 dBm' }
        ];
        
        var index = 0;
        var interval = setInterval(function() {
            if (index < demoItems.length && index < record.get('totalItems')) {
                var item = demoItems[index];
                item.timestamp = new Date().toLocaleString();
                store.add(item);
                index++;
                
                if (index >= record.get('totalItems')) {
                    clearInterval(interval);
                    var completeBtn = Ext.ComponentQuery.query('#completeBtn')[0];
                    if (completeBtn) completeBtn.setDisabled(false);
                    Ext.Msg.alert('Gate Scan Complete', 'All items have exited the warehouse gate!');
                }
            } else {
                clearInterval(interval);
            }
        }, 2000);
    },

    completePicking: function(record) {
        var me = this;
        
        Ext.Msg.confirm('Complete Picking', 
            'Complete picking task "' + record.get('pickingNumber') + '"?',
            function(btn) {
                if (btn === 'yes') {
                    record.set({
                        status: 'Completed',
                        pickedItems: record.get('totalItems'),
                        completedBy: 'current_user',
                        completedDate: new Date().toISOString().split('T')[0]
                    });
                    Ext.Msg.alert('Success', 'Picking task completed successfully!');
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
    }
});
