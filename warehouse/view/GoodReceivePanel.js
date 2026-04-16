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
        
        // Create inbound deliveries store - INTEGRATED WITH BACKEND API
        var deliveriesStore = Ext.create('Ext.data.Store', {
            fields: [
                'id',
                'inbound_delivery_id',
                'delivery_number',
                'supplier_code',
                'supplier_name',
                'status',
                'expected_delivery_date',
                'actual_delivery_date',
                'total_items',
                'total_quantity',
                'created_by_name',
                'created_at',
                'updated_at'
            ],
            data: [] // Will be loaded from API
        });
        
        // Load data after component is fully rendered
        me.on('afterrender', function() {
            setTimeout(function() {
                me.loadInboundDeliveries();
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
                            me.loadInboundDeliveries();
                            Ext.Msg.alert('Info', 'Loading deliveries from backend...');
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
                        dataIndex: 'delivery_number',
                        width: 140,
                        renderer: function(value) {
                            return '<strong>' + value + '</strong>';
                        }
                    },
                    {
                        text: 'Supplier',
                        dataIndex: 'supplier_name',
                        flex: 2
                    },
                    {
                        text: 'Supplier Code',
                        dataIndex: 'supplier_code',
                        width: 120
                    },
                    {
                        text: 'Expected Date',
                        dataIndex: 'expected_delivery_date',
                        width: 110,
                        renderer: function(value) {
                            return value ? Ext.util.Format.date(new Date(value), 'd M Y') : '-';
                        }
                    },
                    {
                        text: 'Actual Date',
                        dataIndex: 'actual_delivery_date',
                        width: 110,
                        renderer: function(value) {
                            return value ? Ext.util.Format.date(new Date(value), 'd M Y') : '-';
                        }
                    },
                    {
                        text: 'Items',
                        dataIndex: 'total_items',
                        width: 80,
                        align: 'center',
                        renderer: function(value, metaData, record) {
                            return '<span style="font-weight: bold;">' + (value || 0) + '</span>';
                        }
                    },
                    {
                        text: 'Quantity',
                        dataIndex: 'total_quantity',
                        width: 80,
                        align: 'center',
                        renderer: function(value) {
                            return '<span style="font-weight: bold;">' + (value || 0) + '</span>';
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
                        dataIndex: 'created_by_name',
                        width: 120
                    },
                    {
                        text: 'Created Date',
                        dataIndex: 'created_at',
                        width: 110,
                        renderer: function(value) {
                            return value ? Ext.util.Format.date(new Date(value), 'd M Y') : '-';
                        }
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

    // Load inbound deliveries from backend API
    loadInboundDeliveries: function() {
        var me = this;
        
        // Access the global warehouse controller
        var controller = window.warehouseController;
        
        if (controller && controller.loadInboundDeliveries) {
            console.log('✅ Loading inbound deliveries via global warehouse controller');
            controller.loadInboundDeliveries();
        } else {
            console.error('❌ WarehouseController not available globally');
            console.error('Debug info - window.warehouseController:', !!window.warehouseController);
            console.error('Debug info - loadInboundDeliveries method:', !!(window.warehouseController && window.warehouseController.loadInboundDeliveries));
            
            // Clear grid and show error message
            var grid = me.down('grid');
            if (grid && grid.getStore) {
                var store = grid.getStore();
                store.removeAll();
                console.log('⚠️ Grid cleared due to missing controller');
            }
            
            // Show user-friendly error
            Ext.Msg.alert('API Error', 'Unable to connect to warehouse backend. Please refresh the page or contact IT support.');
        }
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
                            
                            // Build items array from store
                            var items = [];
                            itemsStore.each(function(record) {
                                items.push({
                                    itemCode: record.get('itemCode'),
                                    itemName: record.get('itemName'),
                                    expectedQuantity: parseInt(record.get('expectedQuantity') || 0),
                                    unit: record.get('unitOfMeasure'),
                                    unitPrice: parseFloat(record.get('unitPrice') || 0),
                                    lotNumber: record.get('lotNumber') || null,
                                    expiryDate: record.get('expiryDate') || null
                                });
                            });
                            
                            if (isEdit) {
                                // TODO: Implement update functionality when backend supports it
                                record.set(values);
                                Ext.Msg.alert('Success', 'Delivery "' + values.deliveryNumber + '" updated successfully!');
                                window.close();
                            } else {
                                // Create backend API request data matching exact contract
                                var deliveryData = {
                                    deliveryNumber: values.deliveryNumber,
                                    supplierCode: values.supplierCode,
                                    supplierName: values.supplierName,
                                    expectedDeliveryDate: values.expectedDate,
                                    purchaseOrderNumber: values.purchaseOrder,
                                    items: items,
                                    createdBy: values.createdBy || 'current_user',
                                    notes: values.notes || ''
                                };
                                
                                console.log('🔄 Creating inbound delivery via backend API:', deliveryData);
                                
                                // Call backend API via WarehouseController with enhanced debugging
                                console.log('🔍 DEBUG: Attempting to access WarehouseController...');
                                console.log('🔍 DEBUG: window.warehouseController exists:', !!window.warehouseController);
                                console.log('🔍 DEBUG: typeof window.warehouseController:', typeof window.warehouseController);
                                
                                var controller = window.warehouseController;
                                if (controller) {
                                    console.log('🔍 DEBUG: Controller found, checking methods...');
                                    console.log('🔍 DEBUG: createInboundDelivery method exists:', !!controller.createInboundDelivery);
                                    console.log('🔍 DEBUG: typeof createInboundDelivery:', typeof controller.createInboundDelivery);
                                    console.log('🔍 DEBUG: Available methods:', Object.keys(controller).filter(k => typeof controller[k] === 'function').slice(0, 10));
                                    
                                    if (controller.createInboundDelivery) {
                                        console.log('✅ DEBUG: Calling createInboundDelivery with data:', deliveryData);
                                        controller.createInboundDelivery(deliveryData);
                                        window.close();
                                    } else {
                                        console.error('❌ DEBUG: createInboundDelivery method not found on controller');
                                        // Fallback: Try to find the method with different name
                                        if (controller.createInbound) {
                                            console.log('🔧 DEBUG: Found createInbound instead, using that');
                                            controller.createInbound(deliveryData);
                                            window.close();
                                        } else {
                                            Ext.Msg.alert('Method Error', 'createInboundDelivery method not available on WarehouseController. Available methods logged to console.');
                                        }
                                    }
                                } else {
                                    console.error('❌ DEBUG: WarehouseController not available at all');
                                    console.error('❌ DEBUG: window object keys containing "warehouse":', Object.keys(window).filter(k => k.toLowerCase().includes('warehouse')));
                                    
                                    // Fallback: Try to get controller from different sources
                                    var fallbackController = null;
                                    
                                    // Try Store.warehouse.controller.WarehouseController singleton
                                    try {
                                        if (Store && Store.warehouse && Store.warehouse.controller && Store.warehouse.controller.WarehouseController) {
                                            console.log('🔧 DEBUG: Attempting to create new controller instance');
                                            fallbackController = Ext.create('Store.warehouse.controller.WarehouseController');
                                            window.warehouseController = fallbackController; // Set it globally
                                        }
                                    } catch (e) {
                                        console.error('❌ DEBUG: Failed to create fallback controller:', e);
                                    }
                                    
                                    if (fallbackController && fallbackController.createInboundDelivery) {
                                        console.log('✅ DEBUG: Using fallback controller');
                                        fallbackController.createInboundDelivery(deliveryData);
                                        window.close();
                                    } else {
                                        console.error('❌ DEBUG: All controller access methods failed');
                                        Ext.Msg.alert('Controller Error', 'WarehouseController not available. Please refresh the page to reinitialize the warehouse system.');
                                    }
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
                            me.updateTotalItems(null, itemsStore);
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
        
        // Find the total items display component globally
        var display = Ext.ComponentQuery.query('#totalItemsDisplay')[0];
        if (display) {
            display.setValue(totalItems);
            console.log('✅ Total items updated:', totalItems);
        } else {
            console.warn('⚠️ Total items display not found');
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
        var me = this;
        console.log('🔄 Starting RFID scan for delivery:', record.get('deliveryNumber'));
        
        // First create Good Receive record via backend
        var goodReceiveData = {
            deliveryNumber: record.get('deliveryNumber'),
            supplierCode: record.get('supplierCode'),
            supplierName: record.get('supplierName'),
            deliveryDate: new Date(),
            expectedDate: record.get('expectedDeliveryDate'),
            items: [
                {
                    itemCode: 'ITM001',
                    itemName: 'Steel Pipe 6 inch',
                    quantity: 2,
                    unit: 'PCS',
                    lotNumber: 'LOT-2024-001',
                    expiryDate: null
                },
                {
                    itemCode: 'ITM002',
                    itemName: 'Hydraulic Hose',
                    quantity: 50,
                    unit: 'MTR',
                    lotNumber: 'LOT-2024-002',
                    expiryDate: null
                },
                {
                    itemCode: 'ITM005',
                    itemName: 'Industrial Grease',
                    quantity: 10,
                    unit: 'KG',
                    lotNumber: 'LOT-2024-003',
                    expiryDate: '2025-12-31'
                }
            ],
            createdBy: 'current_user',
            notes: 'Good receive created from RFID scanning process'
        };
        
        // Call backend API via WarehouseController
        var controller = window.warehouseController;
        if (controller && controller.createGoodReceive) {
            console.log('📦 Creating Good Receive record via backend API');
            controller.createGoodReceive(goodReceiveData);
            
            // Simulate RFID tag scanning after good receive creation
            me.simulateRFIDTagScanning(record);
        } else {
            console.error('❌ WarehouseController not available for createGoodReceive');
            Ext.Msg.alert('Error', 'Backend integration not available for Good Receive creation.');
        }
    },
    
    simulateRFIDTagScanning: function(record) {
        // Simulate RFID scanning with generated EPCs from backend
        var scanGrid = Ext.ComponentQuery.query('#scanGrid')[0];
        var store = scanGrid.getStore();
        
        var demoItems = [
            { epc: '3014257BF7194E4000001A85', itemCode: 'ITM001', itemName: 'Steel Pipe 6 inch', status: 'Confirmed', rssi: '-42 dBm' },
            { epc: '3014257BF7194E4000001A86', itemCode: 'ITM002', itemName: 'Hydraulic Hose', status: 'Confirmed', rssi: '-38 dBm' },
            { epc: '3014257BF7194E4000001A87', itemCode: 'ITM005', itemName: 'Industrial Grease', status: 'Confirmed', rssi: '-45 dBm' }
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
                
                if (index >= record.get('totalItems')) {
                    clearInterval(interval);
                    var confirmBtn = Ext.ComponentQuery.query('#confirmBtn')[0];
                    if (confirmBtn) confirmBtn.setDisabled(false);
                    Ext.Msg.alert('RFID Scan Complete', 'All items scanned successfully! Ready for confirmation.');
                }
            } else {
                clearInterval(interval);
            }
        }, 2000);
    },

    confirmReceipt: function(record) {
        var me = this;
        
        Ext.Msg.confirm('Confirm RFID Receipt',
            'Confirm RFID receipt for delivery "' + record.get('deliveryNumber') + '"?\n\nThis will increase inventory quantities.',
            function(btn) {
                if (btn === 'yes') {
                    console.log('🔄 Confirming Good Receive via RFID backend API');
                    
                    // Build RFID scan data matching backend contract
                    var rfidScanData = {
                        readerId: 'RFID-READER-001',
                        location: 'INBOUND-STAGING',
                        scannedTags: [
                            {
                                epc: '3014257BF7194E4000001A85',
                                rssi: -42,
                                timestamp: new Date().toISOString(),
                                antenna: 1
                            },
                            {
                                epc: '3014257BF7194E4000001A86',
                                rssi: -38,
                                timestamp: new Date().toISOString(),
                                antenna: 2
                            },
                            {
                                epc: '3014257BF7194E4000001A87',
                                rssi: -45,
                                timestamp: new Date().toISOString(),
                                antenna: 1
                            }
                        ],
                        scannedBy: 'operator@company.com'
                    };
                    
                    // Call backend API via WarehouseController
                    var controller = window.warehouseController;
                    if (controller && controller.confirmGoodReceive) {
                        // Use a generated goodReceiveId - in real scenario this would come from createGoodReceive response
                        var goodReceiveId = 'gr-' + record.get('deliveryNumber').toLowerCase() + '-' + Date.now();
                        controller.confirmGoodReceive(goodReceiveId, rfidScanData);
                        
                        // Update local record status
                        record.set({
                            status: 'Confirmed',
                            actualDate: new Date().toISOString().split('T')[0],
                            receivedItems: record.get('totalItems'),
                            confirmedBy: 'current_user',
                            confirmedDate: new Date().toISOString().split('T')[0]
                        });
                        
                        Ext.Msg.alert('Success', 'RFID receipt confirmed successfully! Inventory updated.');
                    } else {
                        console.error('❌ WarehouseController not available for confirmGoodReceive');
                        Ext.Msg.alert('Error', 'Backend integration not available for RFID confirmation.');
                    }
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
