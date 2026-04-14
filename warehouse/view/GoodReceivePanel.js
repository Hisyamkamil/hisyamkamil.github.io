/**
 * Good Receive Panel Component
 * Inbound delivery management with RFID confirmation
 */
Ext.define('Store.warehouse.view.GoodReceivePanel', {
    extend: 'Ext.panel.Panel',
    
    title: 'Good Receive - Inbound Delivery Management',
    layout: 'border',
    border: false,
    
    initComponent: function() {
        var me = this;
        
        // Create inbound deliveries store
        var deliveriesStore = Ext.create('Ext.data.Store', {
            fields: [
                'deliveryNumber',
                'supplierCode',
                'supplierName',
                'expectedDate',
                'actualDate',
                'purchaseOrder',
                'totalItems',
                'receivedItems',
                'status',
                'createdBy',
                'createdDate',
                'confirmedBy',
                'confirmedDate'
            ],
            data: [
                {
                    deliveryNumber: 'GRN-2024-001',
                    supplierCode: 'CAT001',
                    supplierName: 'Caterpillar Inc.',
                    expectedDate: '2024-04-15',
                    actualDate: '2024-04-15',
                    purchaseOrder: 'PO-2024-100',
                    totalItems: 5,
                    receivedItems: 5,
                    status: 'Confirmed',
                    createdBy: 'admin',
                    createdDate: '2024-04-10',
                    confirmedBy: 'warehouse_staff',
                    confirmedDate: '2024-04-15'
                },
                {
                    deliveryNumber: 'GRN-2024-002',
                    supplierCode: 'CAT002',
                    supplierName: 'Caterpillar Parts',
                    expectedDate: '2024-04-16',
                    actualDate: null,
                    purchaseOrder: 'PO-2024-101',
                    totalItems: 3,
                    receivedItems: 0,
                    status: 'Created',
                    createdBy: 'admin',
                    createdDate: '2024-04-12',
                    confirmedBy: null,
                    confirmedDate: null
                },
                {
                    deliveryNumber: 'GRN-2024-003',
                    supplierCode: 'CAT003',
                    supplierName: 'Caterpillar Equipment',
                    expectedDate: '2024-04-17',
                    actualDate: null,
                    purchaseOrder: 'PO-2024-102',
                    totalItems: 8,
                    receivedItems: 0,
                    status: 'Pending',
                    createdBy: 'admin',
                    createdDate: '2024-04-14',
                    confirmedBy: null,
                    confirmedDate: null
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
                        text: 'Create Inbound Delivery',
                        iconCls: 'fa fa-plus',
                        scale: 'medium',
                        handler: function() {
                            me.showDeliveryForm();
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
                                me.showDeliveryDetails(selection[0]);
                            }
                        }
                    },
                    '-',
                    {
                        text: 'RFID Scanning',
                        iconCls: 'fa fa-wifi',
                        scale: 'medium',
                        disabled: true,
                        itemId: 'rfidBtn',
                        handler: function() {
                            var grid = me.down('grid');
                            var selection = grid.getSelection();
                            if (selection.length > 0) {
                                me.showRFIDScanning(selection[0]);
                            }
                        }
                    },
                    '-',
                    {
                        text: 'Cancel Delivery',
                        iconCls: 'fa fa-times',
                        scale: 'medium',
                        disabled: true,
                        itemId: 'cancelBtn',
                        handler: function() {
                            me.cancelDelivery();
                        }
                    },
                    '->',
                    {
                        xtype: 'combobox',
                        emptyText: 'Filter by status...',
                        width: 150,
                        store: ['All', 'Created', 'Pending', 'Confirmed', 'Cancelled'],
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
                            deliveriesStore.reload();
                            Ext.Msg.alert('Info', 'Deliveries list refreshed');
                        }
                    }
                ]
            },
            
            // Deliveries Grid
            {
                region: 'center',
                xtype: 'grid',
                store: deliveriesStore,
                columns: [
                    {
                        text: 'Delivery Number',
                        dataIndex: 'deliveryNumber',
                        width: 140,
                        renderer: function(value) {
                            return '<strong>' + value + '</strong>';
                        }
                    },
                    {
                        text: 'Supplier',
                        dataIndex: 'supplierName',
                        flex: 2
                    },
                    {
                        text: 'PO Number',
                        dataIndex: 'purchaseOrder',
                        width: 120
                    },
                    {
                        text: 'Expected Date',
                        dataIndex: 'expectedDate',
                        width: 110,
                        renderer: Ext.util.Format.dateRenderer('d M Y')
                    },
                    {
                        text: 'Actual Date',
                        dataIndex: 'actualDate',
                        width: 110,
                        renderer: function(value) {
                            return value ? Ext.util.Format.date(new Date(value), 'd M Y') : '-';
                        }
                    },
                    {
                        text: 'Items',
                        dataIndex: 'totalItems',
                        width: 80,
                        align: 'center',
                        renderer: function(value, metaData, record) {
                            var received = record.get('receivedItems');
                            var color = received === value ? 'green' : received > 0 ? 'orange' : 'black';
                            return '<span style="color: ' + color + ';">' + received + '/' + value + '</span>';
                        }
                    },
                    {
                        text: 'Status',
                        dataIndex: 'status',
                        width: 100,
                        renderer: function(value) {
                            var colorMap = {
                                'Created': '#007bff',
                                'Pending': '#ffc107', 
                                'Confirmed': '#28a745',
                                'Cancelled': '#dc3545'
                            };
                            var color = colorMap[value] || '#6c757d';
                            return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                        }
                    },
                    {
                        text: 'Created By',
                        dataIndex: 'createdBy',
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
                        var rfidBtn = me.down('#rfidBtn');
                        var cancelBtn = me.down('#cancelBtn');
                        
                        if (selected.length > 0) {
                            var record = selected[0];
                            var status = record.get('status');
                            
                            viewBtn.setDisabled(false);
                            rfidBtn.setDisabled(status === 'Confirmed' || status === 'Cancelled');
                            cancelBtn.setDisabled(status === 'Confirmed' || status === 'Cancelled');
                        } else {
                            viewBtn.setDisabled(true);
                            rfidBtn.setDisabled(true);
                            cancelBtn.setDisabled(true);
                        }
                    },
                    itemdblclick: function(view, record) {
                        me.showDeliveryDetails(record);
                    }
                }
            }
        ];

        this.callParent(arguments);
    },

    showDeliveryForm: function(record) {
        var me = this;
        var isEdit = !!record;
        
        // Create items store from master data
        var itemsStore = Ext.create('Ext.data.Store', {
            fields: ['itemCode', 'itemName', 'category', 'unitOfMeasure', 'expectedQuantity'],
            data: []
        });

        // Master data items (should be loaded from Master Data module)
        var masterDataItems = [
            { itemCode: 'ITM001', itemName: 'Steel Pipe 6 inch', category: 'Piping', unitOfMeasure: 'PCS' },
            { itemCode: 'ITM002', itemName: 'Hydraulic Hose', category: 'Hydraulics', unitOfMeasure: 'MTR' },
            { itemCode: 'ITM003', itemName: 'Mining Drill Bit', category: 'Tools', unitOfMeasure: 'PCS' },
            { itemCode: 'ITM004', itemName: 'Safety Helmet', category: 'Safety', unitOfMeasure: 'PCS' },
            { itemCode: 'ITM005', itemName: 'Industrial Grease', category: 'Lubricants', unitOfMeasure: 'KG' }
        ];

        var formPanel = Ext.create('Ext.form.Panel', {
            region: 'north',
            height: 280,
            bodyPadding: 15,
            title: 'Delivery Information',
            defaults: {
                anchor: '100%',
                labelWidth: 150
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'deliveryNumber',
                    fieldLabel: 'Delivery Number *',
                    allowBlank: false,
                    readOnly: isEdit,
                    value: isEdit ? record.get('deliveryNumber') : 'GRN-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
                },
                {
                    xtype: 'textfield',
                    name: 'supplierCode',
                    fieldLabel: 'Supplier Code *',
                    allowBlank: false,
                    value: isEdit ? record.get('supplierCode') : 'CAT001'
                },
                {
                    xtype: 'textfield',
                    name: 'supplierName',
                    fieldLabel: 'Supplier Name *',
                    allowBlank: false,
                    value: isEdit ? record.get('supplierName') : 'Caterpillar Inc.'
                },
                {
                    xtype: 'textfield',
                    name: 'purchaseOrder',
                    fieldLabel: 'Purchase Order *',
                    allowBlank: false,
                    value: isEdit ? record.get('purchaseOrder') : 'PO-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 999) + 100)
                },
                {
                    xtype: 'datefield',
                    name: 'expectedDate',
                    fieldLabel: 'Expected Date *',
                    allowBlank: false,
                    format: 'Y-m-d',
                    value: isEdit ? new Date(record.get('expectedDate')) : new Date()
                },
                {
                    xtype: 'textarea',
                    name: 'notes',
                    fieldLabel: 'Notes',
                    height: 50
                }
            ]
        });

        var itemsPanel = Ext.create('Ext.panel.Panel', {
            region: 'center',
            layout: 'border',
            title: 'Delivery Items',
            items: [
                {
                    region: 'north',
                    xtype: 'toolbar',
                    items: [
                        {
                            text: 'Add Item',
                            iconCls: 'fa fa-plus',
                            handler: function() {
                                me.showItemSelectionWindow(itemsStore, masterDataItems);
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
                            text: 'Expected Qty',
                            dataIndex: 'expectedQuantity',
                            width: 100,
                            renderer: function(value) {
                                return '<strong>' + (value || 0) + '</strong>';
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
            title: isEdit ? 'Edit Delivery: ' + record.get('deliveryNumber') : 'Create Inbound Delivery',
            modal: true,
            width: 700,
            height: 600,
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
                    text: isEdit ? 'Update Delivery' : 'Create Delivery',
                    handler: function() {
                        if (formPanel.isValid() && itemsStore.getCount() > 0) {
                            var values = formPanel.getValues();
                            var totalItems = 0;
                            
                            // Calculate total items from the items store
                            itemsStore.each(function(record) {
                                totalItems += parseInt(record.get('expectedQuantity') || 0);
                            });
                            
                            values.totalItems = totalItems;
                            
                            if (isEdit) {
                                record.set(values);
                                Ext.Msg.alert('Success', 'Delivery "' + values.deliveryNumber + '" updated successfully!');
                            } else {
                                values.status = 'Created';
                                values.createdBy = 'current_user';
                                values.createdDate = new Date().toISOString().split('T')[0];
                                values.receivedItems = 0;
                                var store = me.down('grid').getStore();
                                store.add(values);
                                Ext.Msg.alert('Success', 'Delivery "' + values.deliveryNumber + '" created successfully with ' + totalItems + ' items!');
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

    showItemSelectionWindow: function(itemsStore, masterDataItems) {
        var me = this;
        
        var selectionStore = Ext.create('Ext.data.Store', {
            fields: ['itemCode', 'itemName', 'category', 'unitOfMeasure'],
            data: masterDataItems
        });

        var form = Ext.create('Ext.form.Panel', {
            region: 'south',
            height: 80,
            bodyPadding: 10,
            items: [
                {
                    xtype: 'numberfield',
                    name: 'expectedQuantity',
                    fieldLabel: 'Expected Quantity *',
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
                { text: 'Unit', dataIndex: 'unitOfMeasure', width: 80 }
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
                    html: '<div style="padding: 10px; background: #f0f0f0;">Select an item from the master data and specify the expected quantity:</div>',
                    height: 40
                },
                grid,
                form
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: 'Add Item to Delivery',
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
                        var quantity = form.getValues().expectedQuantity;
                        
                        if (selection.length > 0 && quantity > 0) {
                            var selectedItem = selection[0];
                            
                            // Check if item already exists
                            var existingItem = itemsStore.findRecord('itemCode', selectedItem.get('itemCode'));
                            if (existingItem) {
                                Ext.Msg.alert('Warning', 'Item "' + selectedItem.get('itemCode') + '" already exists in the delivery.');
                                return;
                            }
                            
                            // Add item to delivery
                            var newItem = {
                                itemCode: selectedItem.get('itemCode'),
                                itemName: selectedItem.get('itemName'),
                                category: selectedItem.get('category'),
                                unitOfMeasure: selectedItem.get('unitOfMeasure'),
                                expectedQuantity: quantity
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
            totalItems += parseInt(record.get('expectedQuantity') || 0);
        });
        
        var display = formPanel.up().down('#totalItemsDisplay');
        if (display) {
            display.setValue(totalItems);
        }
    },

    showDeliveryDetails: function(record) {
        var me = this;
        
        var detailsPanel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            items: [
                // Delivery Info
                {
                    region: 'north',
                    height: 150,
                    title: 'Delivery Information',
                    bodyPadding: 15,
                    html: '<table style="width: 100%; border-collapse: collapse;">' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Delivery Number:</td><td style="padding: 5px;">' + record.get('deliveryNumber') + '</td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Supplier:</td><td style="padding: 5px;">' + record.get('supplierName') + ' (' + record.get('supplierCode') + ')</td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Purchase Order:</td><td style="padding: 5px;">' + record.get('purchaseOrder') + '</td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Expected Date:</td><td style="padding: 5px;">' + record.get('expectedDate') + '</td></tr>' +
                          '<tr><td style="font-weight: bold; padding: 5px;">Status:</td><td style="padding: 5px;"><strong style="color: ' + me.getStatusColor(record.get('status')) + ';">' + record.get('status') + '</strong></td></tr>' +
                          '</table>'
                },
                // Items Grid
                {
                    region: 'center',
                    title: 'Delivery Items',
                    xtype: 'grid',
                    store: Ext.create('Ext.data.Store', {
                        fields: [
                            'itemCode',
                            'itemName',
                            'category',
                            'unitOfMeasure',
                            'expectedQuantity',
                            'receivedQuantity',
                            'epcCode',
                            'scanningStatus',
                            'lotNumber',
                            'expiryDate'
                        ],
                        data: [
                            {
                                itemCode: 'ITM001',
                                itemName: 'Steel Pipe 6 inch',
                                category: 'Piping',
                                unitOfMeasure: 'PCS',
                                expectedQuantity: 2,
                                receivedQuantity: record.get('status') === 'Confirmed' ? 2 : 0,
                                epcCode: record.get('status') === 'Confirmed' ? '3014257BF7194E4000001A85' : 'Not Generated',
                                scanningStatus: record.get('status') === 'Confirmed' ? 'Confirmed' : 'Pending',
                                lotNumber: 'LOT-2024-001',
                                expiryDate: null
                            },
                            {
                                itemCode: 'ITM002',
                                itemName: 'Hydraulic Hose',
                                category: 'Hydraulics',
                                unitOfMeasure: 'MTR',
                                expectedQuantity: 50,
                                receivedQuantity: record.get('status') === 'Confirmed' ? 50 : 0,
                                epcCode: record.get('status') === 'Confirmed' ? '3014257BF7194E4000001A86' : 'Not Generated',
                                scanningStatus: record.get('status') === 'Confirmed' ? 'Confirmed' : 'Pending',
                                lotNumber: 'LOT-2024-002',
                                expiryDate: null
                            },
                            {
                                itemCode: 'ITM005',
                                itemName: 'Industrial Grease',
                                category: 'Lubricants',
                                unitOfMeasure: 'KG',
                                expectedQuantity: 10,
                                receivedQuantity: record.get('status') === 'Confirmed' ? 10 : 0,
                                epcCode: record.get('status') === 'Confirmed' ? '3014257BF7194E4000001A87' : 'Not Generated',
                                scanningStatus: record.get('status') === 'Confirmed' ? 'Confirmed' : 'Pending',
                                lotNumber: 'LOT-2024-003',
                                expiryDate: '2025-12-31'
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
                            width: 120
                        },
                        {
                            text: 'Unit',
                            dataIndex: 'unitOfMeasure',
                            width: 60,
                            align: 'center'
                        },
                        {
                            text: 'Expected Qty',
                            dataIndex: 'expectedQuantity',
                            width: 100,
                            align: 'center',
                            renderer: function(value) {
                                return '<strong>' + value + '</strong>';
                            }
                        },
                        {
                            text: 'Received Qty',
                            dataIndex: 'receivedQuantity',
                            width: 100,
                            align: 'center',
                            renderer: function(value, metaData, record) {
                                var expected = record.get('expectedQuantity');
                                var color = value === expected ? 'green' : value > 0 ? 'orange' : 'black';
                                return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                            }
                        },
                        {
                            text: 'EPC Code',
                            dataIndex: 'epcCode',
                            width: 180,
                            renderer: function(value) {
                                var color = value === 'Not Generated' ? '#6c757d' : '#007bff';
                                var style = 'color: ' + color + '; font-family: monospace; font-size: 11px;';
                                return '<span style="' + style + '">' + value + '</span>';
                            }
                        },
                        {
                            text: 'Scanning Status',
                            dataIndex: 'scanningStatus',
                            width: 120,
                            renderer: function(value) {
                                var colorMap = {
                                    'Confirmed': 'green',
                                    'Pending': 'orange',
                                    'Error': 'red'
                                };
                                var color = colorMap[value] || '#6c757d';
                                return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                            }
                        },
                        {
                            text: 'Lot Number',
                            dataIndex: 'lotNumber',
                            width: 110
                        },
                        {
                            text: 'Expiry Date',
                            dataIndex: 'expiryDate',
                            width: 100,
                            renderer: function(value) {
                                return value ? Ext.util.Format.date(new Date(value), 'd M Y') : '-';
                            }
                        }
                    ],
                    tbar: [
                        {
                            text: 'Generate EPC Codes',
                            iconCls: 'fa fa-tags',
                            disabled: record.get('status') !== 'Created',
                            handler: function() {
                                Ext.Msg.alert('EPC Generation', 'EPC codes would be generated for all items in this delivery.');
                            }
                        },
                        '-',
                        {
                            text: 'Start RFID Scanning',
                            iconCls: 'fa fa-wifi',
                            disabled: record.get('status') === 'Confirmed',
                            handler: function() {
                                me.showRFIDScanning(record);
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
            title: 'Delivery Details - ' + record.get('deliveryNumber'),
            modal: true,
            width: 800,
            height: 600,
            layout: 'fit',
            items: [detailsPanel],
            buttons: [
                {
                    text: 'Start RFID Scanning',
                    iconCls: 'fa fa-wifi',
                    disabled: record.get('status') === 'Confirmed' || record.get('status') === 'Cancelled',
                    handler: function() {
                        window.close();
                        me.showRFIDScanning(record);
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

    showRFIDScanning: function(record) {
        var me = this;
        
        // Simulate RFID scanning interface
        var scanPanel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            items: [
                // Scan Status
                {
                    region: 'west',
                    width: 300,
                    title: 'RFID Scanner Status',
                    bodyPadding: 15,
                    html: '<div style="text-align: center;">' +
                          '<div style="font-size: 48px; color: #28a745; margin: 20px 0;"><i class="fa fa-wifi"></i></div>' +
                          '<h3>Scanner Ready</h3>' +
                          '<p>Delivery: <strong>' + record.get('deliveryNumber') + '</strong></p>' +
                          '<p>Expected Items: <strong>' + record.get('totalItems') + '</strong></p>' +
                          '<div id="scanProgress" style="margin: 20px 0;">' +
                          '<div style="background: #e0e0e0; height: 20px; border-radius: 10px;">' +
                          '<div style="background: #28a745; height: 20px; width: 0%; border-radius: 10px; transition: width 0.3s;"></div>' +
                          '</div>' +
                          '<p style="margin: 10px 0 0 0;">Scanned: 0/' + record.get('totalItems') + ' items</p>' +
                          '</div>' +
                          '</div>',
                    tbar: [
                        {
                            text: 'Start Scanning',
                            iconCls: 'fa fa-play',
                            itemId: 'startBtn',
                            handler: function() {
                                me.startRFIDScan(record);
                            }
                        },
                        {
                            text: 'Stop Scanning',
                            iconCls: 'fa fa-stop',
                            disabled: true,
                            itemId: 'stopBtn'
                        }
                    ]
                },
                // Scanned Items
                {
                    region: 'center',
                    title: 'Scanned Items',
                    xtype: 'grid',
                    itemId: 'scanGrid',
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
                                var color = value === 'Confirmed' ? 'green' : 'orange';
                                return '<span style="color:' + color + '; font-weight:bold;">' + value + '</span>';
                            }
                        },
                        { text: 'RSSI', dataIndex: 'rssi', width: 80 },
                        { text: 'Timestamp', dataIndex: 'timestamp', width: 160 }
                    ]
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: 'RFID Scanning - ' + record.get('deliveryNumber'),
            modal: true,
            width: 900,
            height: 700,
            layout: 'fit',
            items: [scanPanel],
            buttons: [
                {
                    text: 'Confirm Receipt',
                    iconCls: 'fa fa-check',
                    disabled: true,
                    itemId: 'confirmBtn',
                    handler: function() {
                        me.confirmReceipt(record);
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

    startRFIDScan: function(record) {
        // Simulate RFID scanning with demo data
        var scanGrid = Ext.ComponentQuery.query('#scanGrid')[0];
        var store = scanGrid.getStore();
        
        var demoItems = [
            { epc: '3014257BF7194E4000001A85', itemCode: 'ITM001', itemName: 'Steel Pipe 6 inch', status: 'Confirmed', rssi: '-42 dBm' },
            { epc: '3014257BF7194E4000001A86', itemCode: 'ITM002', itemName: 'Hydraulic Hose', status: 'Confirmed', rssi: '-38 dBm' },
            { epc: '3014257BF7194E4000001A87', itemCode: 'ITM003', itemName: 'Mining Drill Bit', status: 'Confirmed', rssi: '-45 dBm' }
        ];
        
        var index = 0;
        var interval = setInterval(function() {
            if (index < demoItems.length && index < record.get('totalItems')) {
                var item = demoItems[index];
                item.timestamp = new Date().toLocaleString();
                store.add(item);
                index++;
                
                // Update progress
                var progress = (index / record.get('totalItems')) * 100;
                // Note: In real implementation, you'd update the progress bar DOM element
                
                if (index >= record.get('totalItems')) {
                    clearInterval(interval);
                    var confirmBtn = Ext.ComponentQuery.query('#confirmBtn')[0];
                    if (confirmBtn) confirmBtn.setDisabled(false);
                    Ext.Msg.alert('Scan Complete', 'All items scanned successfully!');
                }
            } else {
                clearInterval(interval);
            }
        }, 2000);
    },

    confirmReceipt: function(record) {
        var me = this;
        
        Ext.Msg.confirm('Confirm Receipt', 
            'Confirm receipt for delivery "' + record.get('deliveryNumber') + '"?',
            function(btn) {
                if (btn === 'yes') {
                    record.set({
                        status: 'Confirmed',
                        actualDate: new Date().toISOString().split('T')[0],
                        receivedItems: record.get('totalItems'),
                        confirmedBy: 'current_user',
                        confirmedDate: new Date().toISOString().split('T')[0]
                    });
                    Ext.Msg.alert('Success', 'Receipt confirmed successfully!');
                }
            }
        );
    },

    cancelDelivery: function() {
        var me = this;
        var grid = me.down('grid');
        var selection = grid.getSelection();
        
        if (selection.length > 0) {
            var record = selection[0];
            Ext.Msg.confirm('Cancel Delivery', 
                'Are you sure you want to cancel delivery "' + record.get('deliveryNumber') + '"?',
                function(btn) {
                    if (btn === 'yes') {
                        record.set('status', 'Cancelled');
                        Ext.Msg.alert('Success', 'Delivery cancelled successfully!');
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

    getStatusColor: function(status) {
        var colorMap = {
            'Created': '#007bff',
            'Pending': '#ffc107', 
            'Confirmed': '#28a745',
            'Cancelled': '#dc3545'
        };
        return colorMap[status] || '#6c757d';
    }
});
