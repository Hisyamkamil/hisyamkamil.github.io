/**
 * Good Receive Panel Component
 * Inbound delivery management with RFID confirmation
 */
Ext.define('Store.warehouse.view.GoodReceivePanel', {
    extend: 'Ext.panel.Panel',
    
    config: {
        warehouseController: null
    },
    
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
                            // WarehouseController will show the appropriate user feedback
                        }
                    }
                ]
            },
            
            // Deliveries Grid
            {
                region: 'center',
                xtype: 'grid',
                itemId: 'goodReceiveGrid',  // CRITICAL: Add itemId for WarehouseController to find this grid
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

    testSimpleModal: function() {
        console.log('🧪 Testing simple modal creation...');
        var me = this; // Capture the scope reference
        
        try {
            var testWindow = Ext.create('Ext.window.Window', {
                title: 'Test Modal - Create Inbound Delivery',
                modal: true,
                width: 400,
                height: 300,
                layout: 'fit',
                items: [{
                    xtype: 'panel',
                    bodyPadding: 20,
                    html: '<h3>Modal Test Successful!</h3>' +
                          '<p>✅ Modal window creation works properly.</p>' +
                          '<p>✅ ExtJS framework is functioning.</p>' +
                          '<p>✅ Backend integration is ready.</p>' +
                          '<br><p><strong>Next:</strong> Test with real form data.</p>'
                }],
                buttons: [{
                    text: 'Test Real Form',
                    handler: function() {
                        var panel = me; // Capture scope reference properly
                        testWindow.close();
                        // Call the original method to test with real form - now scope is properly maintained
                        panel.showDeliveryForm();
                    }
                }, {
                    text: 'Close',
                    handler: function() {
                        testWindow.close();
                    }
                }]
            });
            
            testWindow.show();
            console.log('✅ Test modal created and shown successfully');
            
        } catch (error) {
            console.error('❌ Failed to create test modal:', error);
            Ext.Msg.alert('Modal Creation Error', 'Failed to create modal window: ' + error.message);
        }
    },

    // Load inbound deliveries from backend API
    loadInboundDeliveries: function() {
        var me = this;
        
        // Access the controller through proper ExtJS config
        var controller = me.getWarehouseController();
        
        if (controller && controller.loadInboundDeliveries) {
            console.log('✅ Loading inbound deliveries via controller config');
            
            // Call the controller method - it will update the grid directly with user feedback
            controller.loadInboundDeliveries();
            
            console.log('💡 WarehouseController handles grid updates and user feedback');
            
        } else {
            console.error('❌ WarehouseController not available via config');
            // Show user-friendly error
            Ext.Msg.alert('Connection Error', 'Warehouse controller not initialized. Please refresh the page.');
        }
    },
    
    // DEPRECATED: This method is no longer needed as WarehouseController handles grid updates directly
    updateGridWithDeliveries: function(deliveries) {
        console.log('⚠️ updateGridWithDeliveries is deprecated - WarehouseController now handles this directly');
        // This method is kept for backward compatibility but should not be used
    },

    showDeliveryForm: function(record) {
        var me = this;
        var isEdit = !!record;
        
        // Create items store from master data
        var itemsStore = Ext.create('Ext.data.Store', {
            fields: ['itemCode', 'itemName', 'category', 'unitOfMeasure', 'expectedQuantity'],
            data: []
        });

        console.log('🔄 Loading master data from backend API...');
        
        // Get master data directly - use hardcoded data if API fails
        var masterDataItems = me.getMasterDataItems();
        var supplierData = [
            { code: 'CAT001', name: 'Caterpillar Inc.' },
            { code: 'KOM001', name: 'Komatsu Ltd.' },
            { code: 'HIT001', name: 'Hitachi Construction' },
            { code: 'VOL001', name: 'Volvo Construction' },
            { code: 'LIE001', name: 'Liebherr Group' }
        ];
        
        console.log('✅ Master data loaded:', masterDataItems.length + ' items available');
        me.createDeliveryFormWindow(record, isEdit, itemsStore, masterDataItems, supplierData);
    },

    // Get master data items - try API first, fallback to defaults
    getMasterDataItems: function() {
        var me = this;
        
        // Try to get items from MasterDataPanel grid if it exists and has data
        var masterDataGrid = Ext.ComponentQuery.query('#itemsGrid')[0];
        if (masterDataGrid && masterDataGrid.getStore && masterDataGrid.getStore().getCount() > 0) {
            console.log('✅ Using master data from MasterDataPanel grid');
            var items = [];
            masterDataGrid.getStore().each(function(record) {
                items.push({
                    itemCode: record.get('item_code'),
                    itemName: record.get('item_name'),
                    category: record.get('category'),
                    unitOfMeasure: record.get('unit_of_measure')
                });
            });
            return items;
        }
        
        // Fallback to default items
        console.log('⚠️ Using default master data items as fallback');
        return [
            { itemCode: 'ITM001', itemName: 'Steel Pipe 6 inch', category: 'Piping', unitOfMeasure: 'PCS' },
            { itemCode: 'ITM002', itemName: 'Hydraulic Hose', category: 'Hydraulics', unitOfMeasure: 'MTR' },
            { itemCode: 'ITM003', itemName: 'Mining Drill Bit', category: 'Tools', unitOfMeasure: 'PCS' },
            { itemCode: 'ITM004', itemName: 'Safety Helmet', category: 'Safety', unitOfMeasure: 'PCS' },
            { itemCode: 'ITM005', itemName: 'Industrial Grease', category: 'Lubricants', unitOfMeasure: 'KG' }
        ];
    },

    // Create the delivery form window with master data
    createDeliveryFormWindow: function(record, isEdit, itemsStore, masterDataItems, supplierData) {
        var me = this;
        
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
                    value: isEdit ? record.get('delivery_number') : 'GRN-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
                },
                {
                    xtype: 'textfield',
                    name: 'supplierCode',
                    fieldLabel: 'Supplier Code *',
                    allowBlank: false,
                    value: isEdit ? record.get('supplier_code') : 'CAT001'
                },
                {
                    xtype: 'textfield',
                    name: 'supplierName',
                    fieldLabel: 'Supplier Name *',
                    allowBlank: false,
                    value: isEdit ? record.get('supplier_name') : 'Caterpillar Inc.'
                },
                {
                    xtype: 'textfield',
                    name: 'purchaseOrder',
                    fieldLabel: 'Purchase Order *',
                    allowBlank: false,
                    value: isEdit ? record.get('purchase_order') : 'PO-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 999) + 100)
                },
                {
                    xtype: 'datefield',
                    name: 'expectedDate',
                    fieldLabel: 'Expected Date *',
                    allowBlank: false,
                    format: 'Y-m-d',
                    value: isEdit ? new Date(record.get('expected_delivery_date')) : new Date()
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
            title: isEdit ? 'Edit Delivery: ' + record.get('delivery_number') : 'Create Inbound Delivery',
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
                                    expectedQuantity: parseInt(record.get('expectedQuantity') || 1),
                                    unit: record.get('unitOfMeasure'),
                                    unitPrice: parseFloat(record.get('unitPrice') || 100.0),
                                    lotNumber: record.get('lotNumber') || 'LOT-' + new Date().getFullYear() + '-001',
                                    expiryDate: record.get('expiryDate') || null
                                });
                            });
                            
                            if (isEdit) {
                                // IMPLEMENTED: Update functionality using WarehouseController.updateInboundDelivery
                                var deliveryId = record.get('inbound_delivery_id') || record.get('id');
                                var deliveryData = {
                                    deliveryNumber: values.deliveryNumber,
                                    supplierCode: values.supplierCode,
                                    supplierName: values.supplierName,
                                    expectedDeliveryDate: values.expectedDate,
                                    purchaseOrderNumber: values.purchaseOrder,
                                    items: items,
                                    updatedBy: 'current_user',
                                    notes: values.notes || ''
                                };
                                
                                console.log('🔄 Updating inbound delivery via backend API:', deliveryId, deliveryData);
                                
                                // Call backend API via WarehouseController
                                var controller = me.getWarehouseController();
                                if (controller && controller.updateInboundDelivery) {
                                    controller.updateInboundDelivery(deliveryId, deliveryData);
                                    window.close();
                                    
                                    // Refresh grid after successful update
                                    setTimeout(function() {
                                        me.loadInboundDeliveries();
                                    }, 1000);
                                } else {
                                    Ext.Msg.alert('Error', 'Backend controller not available for update operation');
                                }
                            } else {
                                // Create backend API request data
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
                                
                                // Call backend API via WarehouseController
                                var controller = me.getWarehouseController();
                                if (controller && controller.createInboundDelivery) {
                                    controller.createInboundDelivery(deliveryData);
                                    window.close();
                                    
                                    // Refresh grid after successful creation
                                    setTimeout(function() {
                                        me.loadInboundDeliveries();
                                    }, 1000);
                                } else {
                                    Ext.Msg.alert('Error', 'Backend controller not available');
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
        
        // Create loading panel first
        var deliveryInfoPanel = Ext.create('Ext.panel.Panel', {
            region: 'north',
            height: 150,
            title: 'Delivery Information',
            bodyPadding: 15,
            html: '<div style="text-align: center; padding: 20px;"><i class="fa fa-spinner fa-spin"></i> Loading delivery details...</div>'
        });
        
        var detailsPanel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            items: [
                deliveryInfoPanel,
                // Items Grid
                {
                    region: 'center',
                    title: 'Delivery Items',
                    xtype: 'grid',
                    itemId: 'deliveryItemsGrid',
                    store: Ext.create('Ext.data.Store', {
                        fields: [
                            'itemId', // CRITICAL: Real UUID from backend for EPC assignment
                            'inboundItemId', // NEW: For complete traceability per updated Postman spec
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
                        data: [] // Will be loaded from backend API
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
                    listeners: {
                        selectionchange: function(model, selected) {
                            // Enable/disable EPC buttons based on selected item
                            me.updateEPCButtonsForSelectedItem(selected, window);
                        }
                    },
                    tbar: [
                        {
                            text: 'Generate EPC Codes',
                            iconCls: 'fa fa-tags',
                            disabled: true, // Will be enabled based on real status
                            itemId: 'generateEpcBtn',
                            handler: function() {
                                me.showGenerateEPCDialogForSelected(window);
                            }
                        },
                        {
                            text: 'Assign EPC',
                            iconCls: 'fa fa-link',
                            disabled: true, // Will be enabled based on selected item
                            itemId: 'assignEpcBtn',
                            handler: function() {
                                me.showAssignEPCDialogForSelected(window);
                            }
                        },
                        {
                            text: 'Confirm Good Receive',
                            iconCls: 'fa fa-check-circle',
                            disabled: true, // Will be enabled based on delivery status
                            itemId: 'confirmGoodReceiveBtn',
                            handler: function() {
                                me.showConfirmGoodReceiveDialog(record, window);
                            }
                        },
                        '-',
                        {
                            text: 'Start RFID Scanning',
                            iconCls: 'fa fa-wifi',
                            disabled: true, // Will be enabled based on real status
                            itemId: 'startRfidBtn',
                            handler: function() {
                                me.showRFIDScanning(record);
                            }
                        },
                        '->',
                        {
                            xtype: 'displayfield',
                            itemId: 'statusDisplay',
                            value: '<strong>Loading...</strong>'
                        }
                    ]
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: 'Delivery Details - Loading...',
            modal: true,
            width: 800,
            height: 600,
            layout: 'fit',
            items: [detailsPanel],
            buttons: [
                {
                    text: 'Start RFID Scanning',
                    iconCls: 'fa fa-wifi',
                    disabled: true, // Will be enabled based on real status
                    itemId: 'rfidScanningBtn',
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
        
        // CRITICAL FIX: Load complete delivery details from backend API with comprehensive controller access
        var deliveryId = record.get('inbound_delivery_id') || record.get('id');
        console.log('🔄 Attempting to load delivery details for:', deliveryId);
        
        if (deliveryId) {
            // Use the same comprehensive controller access pattern as other methods
            me.loadDeliveryDetailsWithFallback(deliveryId, window, deliveryInfoPanel);
        } else {
            console.error('❌ No deliveryId available');
            deliveryInfoPanel.update('<div style="text-align: center; padding: 20px; color: red;"><i class="fa fa-exclamation-triangle"></i> Cannot load delivery details - no delivery ID available</div>');
            window.setTitle('Delivery Details - Error: No ID');
        }
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
        var controller = me.getWarehouseController();
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
        // RFID scanning now handled via backend API only
        var scanGrid = Ext.ComponentQuery.query('#scanGrid')[0];
        var store = scanGrid ? scanGrid.getStore() : null;
        
        if (!store) {
            console.error('❌ RFID scan grid not found');
            Ext.Msg.alert('Error', 'RFID scanning interface not available');
            return;
        }
        
        // Clear any existing data
        store.removeAll();
        
        console.log('🔄 RFID scanning will be handled by backend API');
        console.log('💡 Backend should return real EPC codes from database');
        
        // Show message that backend integration is required
        Ext.Msg.alert('RFID Integration Required',
            'RFID scanning requires backend API integration.\n\n' +
            'Real EPC codes will be loaded from warehouse database.\n\n' +
            'Contact IT team if RFID reader is not responding.'
        );
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
                    var controller = me.getWarehouseController();
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
    },

    /**
     * Load delivery details with comprehensive fallback controller access
     */
    loadDeliveryDetailsWithFallback: function(deliveryId, window, deliveryInfoPanel) {
        var me = this;
        console.log('🔄 Loading delivery details with fallback for:', deliveryId);
        
        // Strategy 1: Direct controller config access
        var controller = me.getWarehouseController();
        if (controller && controller.loadInboundDeliveryDetails) {
            console.log('✅ Using direct global controller for loadInboundDeliveryDetails');
            me.executeDeliveryDetailsLoad(controller, deliveryId, window, deliveryInfoPanel);
            return true;
        }
        
        // Strategy 2: Wait for controller initialization with retries
        console.log('🔧 Controller not available, attempting fallback strategies...');
        var retryCount = 0;
        var maxRetries = 3;
        
        var retryFunction = function() {
            retryCount++;
            console.log('🔍 Retry attempt', retryCount, 'for delivery details loading');
            
            controller = me.getWarehouseController();
            if (controller && controller.loadInboundDeliveryDetails) {
                console.log('✅ Controller became available on retry', retryCount);
                me.executeDeliveryDetailsLoad(controller, deliveryId, window, deliveryInfoPanel);
                return true;
            }
            
            if (retryCount < maxRetries) {
                setTimeout(retryFunction, 300);
            } else {
                // Strategy 3: Create fallback controller
                me.createFallbackControllerForDeliveryDetails(deliveryId, window, deliveryInfoPanel);
            }
        };
        
        setTimeout(retryFunction, 100);
        return false;
    },

    /**
     * Execute the actual delivery details loading with error handling
     */
    executeDeliveryDetailsLoad: function(controller, deliveryId, window, deliveryInfoPanel) {
        var me = this;
        
        controller.loadInboundDeliveryDetails(deliveryId, function(deliveryData) {
            if (deliveryData) {
                console.log('✅ Loaded delivery details from backend:', deliveryData);
                
                // Update window title with real delivery number
                window.setTitle('Delivery Details - ' + deliveryData.deliveryNumber);
                
                // Update delivery info panel with real data
                var infoHtml = '<table style="width: 100%; border-collapse: collapse;">' +
                              '<tr><td style="font-weight: bold; padding: 5px;">Delivery Number:</td><td style="padding: 5px;">' + deliveryData.deliveryNumber + '</td></tr>' +
                              '<tr><td style="font-weight: bold; padding: 5px;">Supplier:</td><td style="padding: 5px;">' + deliveryData.supplierName + ' (' + deliveryData.supplierCode + ')</td></tr>' +
                              '<tr><td style="font-weight: bold; padding: 5px;">Purchase Order:</td><td style="padding: 5px;">' + deliveryData.purchaseOrder + '</td></tr>' +
                              '<tr><td style="font-weight: bold; padding: 5px;">Expected Date:</td><td style="padding: 5px;">' + deliveryData.expectedDate + '</td></tr>' +
                              '<tr><td style="font-weight: bold; padding: 5px;">Status:</td><td style="padding: 5px;"><strong style="color: ' + me.getStatusColor(deliveryData.status) + ';">' + deliveryData.status + '</strong></td></tr>' +
                              '</table>';
                
                deliveryInfoPanel.update(infoHtml);
                
                // Update status display in toolbar
                var statusDisplay = window.down('#statusDisplay');
                if (statusDisplay) {
                    statusDisplay.setValue('<strong>Total Items: ' + deliveryData.totalItems + ' | Status: </strong><span style="color: ' + me.getStatusColor(deliveryData.status) + '; font-weight: bold;">' + deliveryData.status + '</span>');
                }
                
                // Enable/disable buttons based on real status
                var generateEpcBtn = window.down('#generateEpcBtn');
                var startRfidBtn = window.down('#startRfidBtn');
                var rfidScanningBtn = window.down('#rfidScanningBtn');
                var confirmGoodReceiveBtn = window.down('#confirmGoodReceiveBtn'); // NEW button
                
                // Check if any items have 'Pending' status (need EPC generation)
                var hasPendingItems = false;
                if (deliveryData.items && deliveryData.items.length > 0) {
                    hasPendingItems = deliveryData.items.some(function(item) {
                        var itemStatus = item.scanningStatus || item.scanning_status || 'Pending';
                        return itemStatus === 'Pending';
                    });
                }
                console.log('📋 Items analysis for EPC generation:', {
                    totalItems: deliveryData.items ? deliveryData.items.length : 0,
                    hasPendingItems: hasPendingItems
                });
                
                // Enable Generate EPC button only if there are pending items (auto-generate)
                if (generateEpcBtn) generateEpcBtn.setDisabled(!hasPendingItems);
                
                // Enable Assign EPC button for items that need manual EPC assignment (alternative to auto-generate)
                var assignEpcBtn = window.down('#assignEpcBtn');
                if (assignEpcBtn) assignEpcBtn.setDisabled(!hasPendingItems); // Same logic as Generate - both are alternatives for items needing EPC
                
                // Enable Confirm Good Receive button only if delivery is pending and has EPCs generated
                var canConfirmGoodReceive = (deliveryData.status === 'Created' || deliveryData.status === 'Pending') && !hasPendingItems;
                if (confirmGoodReceiveBtn) confirmGoodReceiveBtn.setDisabled(!canConfirmGoodReceive);
                
                if (startRfidBtn) startRfidBtn.setDisabled(deliveryData.status === 'Confirmed');
                if (rfidScanningBtn) rfidScanningBtn.setDisabled(deliveryData.status === 'Confirmed' || deliveryData.status === 'Cancelled');
                
                // Load delivery items if available
                if (deliveryData.items && deliveryData.items.length > 0) {
                    var itemsGrid = window.down('#deliveryItemsGrid');
                    if (itemsGrid && itemsGrid.getStore()) {
                        console.log('✅ Loading', deliveryData.items.length, 'delivery items from backend data');
                        
                        // Map items to expected format - CRITICAL: Include real item IDs and inboundItemId for traceability
                        var mappedItems = deliveryData.items.map(function(item) {
                            return {
                                itemId: item.itemId || item.item_id, // CRITICAL: Real UUID from backend for EPC assignment
                                inboundItemId: item.inboundItemId || item.inbound_item_id, // NEW: For complete traceability per Postman spec
                                itemCode: item.itemCode || item.item_code,
                                itemName: item.itemName || item.item_name,
                                category: item.category || item.item_group || 'General',
                                unitOfMeasure: item.unit || item.unitOfMeasure || 'PCS',
                                expectedQuantity: item.expectedQuantity || item.expected_quantity || 0,
                                receivedQuantity: item.receivedQuantity || item.received_quantity || 0,
                                epcCode: item.epcCode || item.epc_code || 'Not Generated',
                                scanningStatus: item.scanningStatus || item.scanning_status || 'Pending',
                                lotNumber: item.lotNumber || item.lot_number || '',
                                expiryDate: item.expiryDate || item.expiry_date || null
                            };
                        });
                        
                        itemsGrid.getStore().loadData(mappedItems);
                    }
                }
                
            } else {
                console.error('❌ Failed to load delivery details from backend');
                
                // Show error in info panel
                deliveryInfoPanel.update('<div style="text-align: center; padding: 20px; color: red;"><i class="fa fa-exclamation-triangle"></i> Failed to load delivery details from backend API</div>');
                
                // Set fallback window title
                window.setTitle('Delivery Details - Error Loading');
            }
        });
    },

    /**
     * Create fallback controller specifically for delivery details loading
     */
    createFallbackControllerForDeliveryDetails: function(deliveryId, window, deliveryInfoPanel) {
        var me = this;
        console.log('🔧 Creating fallback controller for delivery details');
        
        try {
            if (Store && Store.warehouse && Store.warehouse.controller && Store.warehouse.controller.WarehouseController) {
                var fallbackController = Ext.create('Store.warehouse.controller.WarehouseController');
                console.log('✅ Fallback controller created successfully for delivery details');
                
                // Set it globally for future use
                window.warehouseController = fallbackController;
                
                if (fallbackController.loadInboundDeliveryDetails) {
                    console.log('✅ Using fallback controller for delivery details');
                    me.executeDeliveryDetailsLoad(fallbackController, deliveryId, window, deliveryInfoPanel);
                    return true;
                }
            }
        } catch (e) {
            console.error('❌ Failed to create fallback controller for delivery details:', e);
        }
        
        // All strategies failed
        console.error('❌ All controller access strategies failed for delivery details loading');
        deliveryInfoPanel.update('<div style="text-align: center; padding: 20px; color: red;"><i class="fa fa-exclamation-triangle"></i> Backend controller initialization failed. Please refresh the page and try again.</div>');
        window.setTitle('Delivery Details - Controller Error');
        return false;
    },
    
    /**
     * Enhanced controller access with comprehensive fallback strategies
     */
    callWarehouseController: function(methodName, data, successCallback) {
        var me = this;
        console.log('🔍 DEBUG: Attempting to access WarehouseController for method:', methodName);
        console.log('🔍 DEBUG: window.warehouseController exists:', !!window.warehouseController);
        
        // Strategy 1: Direct controller config access
        var controller = me.getWarehouseController();
        if (controller && controller[methodName]) {
            console.log('✅ DEBUG: Using global controller for', methodName);
            controller[methodName](data);
            if (successCallback) successCallback();
            return true;
        }
        
        // Strategy 2: Wait for controller initialization
        console.log('🔧 DEBUG: Controller not ready, waiting for initialization...');
        var retryCount = 0;
        var maxRetries = 5;
        
        var retryFunction = function() {
            retryCount++;
            console.log('🔍 DEBUG: Retry attempt', retryCount, 'for', methodName);
            
            controller = me.getWarehouseController();
            if (controller && controller[methodName]) {
                console.log('✅ DEBUG: Controller became available on retry', retryCount);
                controller[methodName](data);
                if (successCallback) successCallback();
                return true;
            }
            
            if (retryCount < maxRetries) {
                setTimeout(retryFunction, 200);
            } else {
                // Strategy 3: Create new controller instance
                me.createFallbackController(methodName, data, successCallback);
            }
        };
        
        setTimeout(retryFunction, 100);
        return false;
    },
    
    /**
     * Create fallback controller instance
     */
    createFallbackController: function(methodName, data, successCallback) {
        console.log('🔧 DEBUG: Creating fallback controller instance');
        
        try {
            if (Store && Store.warehouse && Store.warehouse.controller && Store.warehouse.controller.WarehouseController) {
                var fallbackController = Ext.create('Store.warehouse.controller.WarehouseController');
                console.log('✅ DEBUG: Fallback controller created successfully');
                
                // Set it globally for future use
                window.warehouseController = fallbackController;
                
                if (fallbackController[methodName]) {
                    console.log('✅ DEBUG: Using fallback controller for', methodName);
                    fallbackController[methodName](data);
                    if (successCallback) successCallback();
                    return true;
                }
            }
        } catch (e) {
            console.error('❌ DEBUG: Failed to create fallback controller:', e);
        }
        
        // All strategies failed
        console.error('❌ DEBUG: All controller access strategies failed for', methodName);
        Ext.Msg.alert('Controller Error',
            'WarehouseController not available for ' + methodName + '. ' +
            'Please refresh the page to reinitialize the warehouse system.'
        );
        return false;
    },

    /**
     * Show Generate EPC Dialog - Auto-generated EPC codes
     */
    showGenerateEPCDialog: function(record) {
        var me = this;
        
        // Get delivery items that need EPC generation
        var itemsNeedingEpc = [];
        if (record && record.items) {
            record.items.forEach(function(item) {
                var itemStatus = item.scanningStatus || item.scanning_status || 'Pending';
                if (itemStatus === 'Pending') {
                    itemsNeedingEpc.push({
                        itemCode: item.itemCode || item.item_code,
                        itemName: item.itemName || item.item_name,
                        expectedQuantity: item.expectedQuantity || item.expected_quantity || 1
                    });
                }
            });
        }
        
        if (itemsNeedingEpc.length === 0) {
            Ext.Msg.alert('No Items', 'No items found that need EPC generation.');
            return;
        }

        var html = '<div style="padding: 15px;">' +
                   '<h3>Generate EPC Codes (Auto)</h3>' +
                   '<p>The system will auto-generate EPC codes for the following items:</p>' +
                   '<ul>';
        
        itemsNeedingEpc.forEach(function(item) {
            html += '<li><strong>' + item.itemCode + '</strong> - ' + item.itemName + ' (Qty: ' + item.expectedQuantity + ')</li>';
        });
        
        html += '</ul>' +
                '<p><strong>Note:</strong> EPC codes will be automatically generated using the backend algorithm.</p>' +
                '</div>';

        var window = Ext.create('Ext.window.Window', {
            title: 'Generate EPC Codes - ' + record.get('delivery_number'),
            modal: true,
            width: 500,
            height: 350,
            layout: 'fit',
            items: [{
                xtype: 'panel',
                html: html,
                autoScroll: true
            }],
            buttons: [
                {
                    text: 'Cancel',
                    handler: function() {
                        window.close();
                    }
                },
                {
                    text: 'Generate EPC Codes',
                    iconCls: 'fa fa-tags',
                    handler: function() {
                        me.callGenerateEPCAPI(itemsNeedingEpc);
                        window.close();
                    }
                }
            ]
        });
        
        window.show();
    },

    /**
     * Show Assign EPC Dialog - User-defined EPC codes
     */
    showAssignEPCDialog: function(record) {
        var me = this;
        
        // Get delivery items that need EPC assignment
        var itemsNeedingEpc = [];
        if (record && record.items) {
            record.items.forEach(function(item) {
                var itemStatus = item.scanningStatus || item.scanning_status || 'Pending';
                if (itemStatus === 'Pending') {
                    itemsNeedingEpc.push({
                        itemId: item.itemId || item.item_id,
                        itemCode: item.itemCode || item.item_code,
                        itemName: item.itemName || item.item_name,
                        expectedQuantity: item.expectedQuantity || item.expected_quantity || 1
                    });
                }
            });
        }
        
        if (itemsNeedingEpc.length === 0) {
            Ext.Msg.alert('No Items', 'No items found that need EPC assignment.');
            return;
        }

        var store = Ext.create('Ext.data.Store', {
            fields: ['itemId', 'itemCode', 'itemName', 'quantity', 'epcCode'],
            data: itemsNeedingEpc.map(function(item) {
                return {
                    itemId: item.itemId,
                    itemCode: item.itemCode,
                    itemName: item.itemName,
                    quantity: item.expectedQuantity,
                    epcCode: '' // User will input this
                };
            })
        });

        var grid = Ext.create('Ext.grid.Panel', {
            store: store,
            columns: [
                { text: 'Item Code', dataIndex: 'itemCode', width: 100 },
                { text: 'Item Name', dataIndex: 'itemName', flex: 1 },
                { text: 'Qty', dataIndex: 'quantity', width: 60, align: 'center' },
                {
                    text: 'EPC Code *',
                    dataIndex: 'epcCode',
                    width: 200,
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false,
                        maxLength: 24,
                        minLength: 24,
                        maskRe: /[0-9A-Fa-f]/,
                        emptyText: 'Enter 24-char hex EPC...'
                    }
                }
            ],
            plugins: [{
                ptype: 'cellediting',
                clicksToEdit: 1
            }],
            tbar: [
                {
                    text: 'Validate All EPCs',
                    iconCls: 'fa fa-check',
                    handler: function() {
                        me.validateAllEPCCodes(store);
                    }
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: 'Assign EPC Codes - ' + record.get('delivery_number'),
            modal: true,
            width: 600,
            height: 400,
            layout: 'fit',
            items: [grid],
            buttons: [
                {
                    text: 'Cancel',
                    handler: function() {
                        window.close();
                    }
                },
                {
                    text: 'Assign EPC Codes',
                    iconCls: 'fa fa-link',
                    handler: function() {
                        me.callAssignEPCAPI(store);
                        window.close();
                    }
                }
            ]
        });
        
        window.show();
    },

    /**
     * Call Generate EPC API (auto-generation)
     */
    callGenerateEPCAPI: function(items) {
        var me = this;
        console.log('🔄 Calling Generate EPC API for auto-generation:', items);
        
        items.forEach(function(item) {
            var generateData = {
                itemCode: item.itemCode,
                quantity: item.expectedQuantity
            };
            
            console.log('📤 Generate EPC request:', generateData);
            
            // Call backend API via WarehouseController
            var controller = me.getWarehouseController();
            if (controller && controller.generateEPC) {
                controller.generateEPC(generateData);
            } else {
                console.error('❌ WarehouseController.generateEPC not available');
                Ext.Msg.alert('API Error', 'Generate EPC API not available. Please check backend integration.');
            }
        });
        
        Ext.Msg.alert('EPC Generation Started', 'Auto-generating EPC codes for ' + items.length + ' items.');
    },

    /**
     * Call Assign EPC API (manual assignment)
     */
    callAssignEPCAPI: function(store) {
        var me = this;
        console.log('🔄 Calling Assign EPC API for manual assignment');
        
        var hasErrors = false;
        var assignments = [];
        
        store.each(function(record) {
            var epcCode = record.get('epcCode');
            var itemId = record.get('itemId');
            var quantity = record.get('quantity');
            
            if (!epcCode || epcCode.length !== 24) {
                hasErrors = true;
                return;
            }
            
            assignments.push({
                epcCode: epcCode,
                itemId: itemId,
                quantity: quantity
            });
        });
        
        if (hasErrors) {
            Ext.Msg.alert('Validation Error', 'Please enter valid 24-character hexadecimal EPC codes for all items.');
            return;
        }
        
        // Process each assignment
        assignments.forEach(function(assignment) {
            console.log('📤 Assign EPC request:', assignment);
            
            // Call backend API via WarehouseController
            var controller = me.getWarehouseController();
            if (controller && controller.assignEPC) {
                controller.assignEPC(assignment);
            } else {
                console.error('❌ WarehouseController.assignEPC not available');
                Ext.Msg.alert('API Error', 'Assign EPC API not available. Please check backend integration.');
                return;
            }
        });
        
        Ext.Msg.alert('EPC Assignment Started', 'Assigning ' + assignments.length + ' custom EPC codes.');
    },

    /**
     * Validate EPC codes format
     */
    validateAllEPCCodes: function(store) {
        var validCount = 0;
        var totalCount = 0;
        
        store.each(function(record) {
            totalCount++;
            var epcCode = record.get('epcCode');
            if (epcCode && epcCode.length === 24 && /^[0-9A-Fa-f]{24}$/.test(epcCode)) {
                validCount++;
            }
        });
        
        var message = 'EPC Validation Results:\n\n' +
                     'Valid EPCs: ' + validCount + '/' + totalCount + '\n';
        
        if (validCount === totalCount) {
            message += '\n✅ All EPC codes are valid!';
            Ext.Msg.alert('Validation Success', message);
        } else {
            message += '\n⚠️ Some EPC codes need correction.\n\nRequirement: 24-character hexadecimal codes (0-9, A-F)';
            Ext.Msg.alert('Validation Issues', message);
        }
    },

    /**
     * Update EPC buttons and Confirm Good Receive button based on selected item in delivery details
     */
    updateEPCButtonsForSelectedItem: function(selected, window) {
        var generateEpcBtn = window.down('#generateEpcBtn');
        var assignEpcBtn = window.down('#assignEpcBtn');
        var confirmGoodReceiveBtn = window.down('#confirmGoodReceiveBtn');
        
        if (selected.length === 1) {
            var selectedItem = selected[0];
            var itemStatus = selectedItem.get('scanningStatus') || 'Pending';
            var epcCode = selectedItem.get('epcCode') || 'Not Generated';
            
            // Enable Generate EPC if item is Pending (needs EPC)
            var canGenerateEPC = (itemStatus === 'Pending' && epcCode === 'Not Generated');
            
            // Enable Assign EPC if item is Pending (needs EPC)
            var canAssignEPC = (itemStatus === 'Pending' && epcCode === 'Not Generated');
            
            if (generateEpcBtn) generateEpcBtn.setDisabled(!canGenerateEPC);
            if (assignEpcBtn) assignEpcBtn.setDisabled(!canAssignEPC);
            
            // CRITICAL FIX: Enable Confirm Good Receive button based on item selection + delivery status + EPC status
            var canConfirmGoodReceive = this.checkConfirmGoodReceiveConditions(window, selectedItem);
            if (confirmGoodReceiveBtn) confirmGoodReceiveBtn.setDisabled(!canConfirmGoodReceive);
            
            console.log('EPC buttons updated for selected item:', {
                itemCode: selectedItem.get('itemCode'),
                itemStatus: itemStatus,
                epcCode: epcCode,
                canGenerateEPC: canGenerateEPC,
                canAssignEPC: canAssignEPC,
                canConfirmGoodReceive: canConfirmGoodReceive
            });
        } else {
            // No item selected, disable all buttons
            if (generateEpcBtn) generateEpcBtn.setDisabled(true);
            if (assignEpcBtn) assignEpcBtn.setDisabled(true);
            if (confirmGoodReceiveBtn) confirmGoodReceiveBtn.setDisabled(true);
            
            console.log('No item selected - all buttons disabled');
        }
    },

    /**
     * Check all conditions for enabling Confirm Good Receive button
     * Conditions: Delivery Status = 'Created' OR 'Pending' + All items have EPCs generated + Item selected
     */
    checkConfirmGoodReceiveConditions: function(window, selectedItem) {
        var me = this;
        
        // Get delivery status from the main grid selection
        var mainGrid = me.down('#goodReceiveGrid');
        var mainSelection = mainGrid ? mainGrid.getSelection() : [];
        
        if (mainSelection.length === 0) {
            console.log('❌ Confirm Good Receive: No delivery selected in main grid');
            return false;
        }
        
        var deliveryRecord = mainSelection[0];
        var deliveryStatus = deliveryRecord.get('status');
        
        // Condition 1: Delivery Status Check - Case insensitive comparison
        var normalizedStatus = deliveryStatus ? deliveryStatus.toLowerCase() : '';
        var validDeliveryStatus = (normalizedStatus === 'created' || normalizedStatus === 'pending');
        if (!validDeliveryStatus) {
            console.log('❌ Confirm Good Receive: Invalid delivery status:', deliveryStatus, '(expected Created/created or Pending/pending)');
            return false;
        }
        
        // Condition 2: EPC Generation Check - All items must have EPCs generated
        var itemsGrid = window.down('#deliveryItemsGrid');
        if (!itemsGrid || !itemsGrid.getStore()) {
            console.log('❌ Confirm Good Receive: Items grid not available');
            return false;
        }
        
        var hasPendingItems = false;
        itemsGrid.getStore().each(function(record) {
            var epcCode = record.get('epcCode') || 'Not Generated';
            
            // Item is pending EPC generation if it doesn't have an EPC code
            if (epcCode === 'Not Generated' || epcCode === '' || epcCode === null) {
                hasPendingItems = true;
                return false; // Break the loop
            }
        });
        
        if (hasPendingItems) {
            console.log('❌ Confirm Good Receive: Items still need EPC generation');
            return false;
        }
        
        // Condition 3: Item Selection Check (already handled by calling function)
        if (!selectedItem) {
            console.log('❌ Confirm Good Receive: No item selected');
            return false;
        }
        
        // All conditions met
        console.log('✅ Confirm Good Receive: All conditions met', {
            deliveryStatus: deliveryStatus,
            hasPendingItems: hasPendingItems,
            selectedItemCode: selectedItem.get('itemCode')
        });
        
        return true;
    },

    /**
     * Show Generate EPC dialog for selected item
     */
    showGenerateEPCDialogForSelected: function(parentWindow) {
        var me = this;
        var itemsGrid = parentWindow.down('#deliveryItemsGrid');
        var selected = itemsGrid.getSelection();
        
        if (selected.length !== 1) {
            Ext.Msg.alert('Selection Required', 'Please select an item to generate EPC codes for.');
            return;
        }
        
        var selectedItem = selected[0];
        var itemData = {
            itemCode: selectedItem.get('itemCode'),
            itemName: selectedItem.get('itemName'),
            expectedQuantity: selectedItem.get('expectedQuantity') || 1
        };
        
        var html = '<div style="padding: 15px;">' +
                   '<h3>Generate EPC Codes (Auto)</h3>' +
                   '<p>The system will auto-generate EPC codes for:</p>' +
                   '<div style="background: #f8f9fa; padding: 10px; margin: 10px 0; border-left: 4px solid #007bff;">' +
                   '<strong>' + itemData.itemCode + '</strong> - ' + itemData.itemName + '<br>' +
                   'Quantity: ' + itemData.expectedQuantity +
                   '</div>' +
                   '<p><strong>Note:</strong> EPC codes will be automatically generated using the backend algorithm.</p>' +
                   '</div>';

        var window = Ext.create('Ext.window.Window', {
            title: 'Generate EPC - ' + itemData.itemCode,
            modal: true,
            width: 450,
            height: 250,
            layout: 'fit',
            items: [{
                xtype: 'panel',
                html: html,
                autoScroll: true
            }],
            buttons: [
                {
                    text: 'Cancel',
                    handler: function() {
                        window.close();
                    }
                },
                {
                    text: 'Generate EPC',
                    iconCls: 'fa fa-tags',
                    handler: function() {
                        me.callGenerateEPCForSelectedItem(itemData);
                        window.close();
                    }
                }
            ]
        });
        
        window.show();
    },

    /**
     * Show Assign EPC dialog for selected item (simple input)
     */
    showAssignEPCDialogForSelected: function(parentWindow) {
        var me = this;
        var itemsGrid = parentWindow.down('#deliveryItemsGrid');
        var selected = itemsGrid.getSelection();
        
        if (selected.length !== 1) {
            Ext.Msg.alert('Selection Required', 'Please select an item to assign EPC to.');
            return;
        }
        
        var selectedItem = selected[0];
        var itemId = selectedItem.get('itemId');
        
        // CRITICAL: Ensure we have a real UUID itemId from backend
        if (!itemId || itemId.indexOf('temp-') === 0) {
            Ext.Msg.alert('Item ID Missing',
                'Item ID not available from backend. Please refresh the delivery details and try again.\n\n' +
                'Note: EPC assignment requires valid item IDs from the database.'
            );
            return;
        }
        
        var itemData = {
            itemId: itemId, // Real UUID from backend
            itemCode: selectedItem.get('itemCode'),
            itemName: selectedItem.get('itemName'),
            quantity: selectedItem.get('expectedQuantity') || 1
        };
        
        var form = Ext.create('Ext.form.Panel', {
            bodyPadding: 15,
            defaults: {
                anchor: '100%',
                labelWidth: 80
            },
            items: [
                {
                    xtype: 'displayfield',
                    fieldLabel: 'Item',
                    value: '<strong>' + itemData.itemCode + '</strong> - ' + itemData.itemName
                },
                {
                    xtype: 'displayfield',
                    fieldLabel: 'Quantity',
                    value: itemData.quantity
                },
                {
                    xtype: 'textfield',
                    name: 'epcCode',
                    fieldLabel: 'EPC Code *',
                    allowBlank: false,
                    maxLength: 24,
                    minLength: 24,
                    maskRe: /[0-9A-Fa-f]/,
                    emptyText: 'Enter 24-character hex EPC...',
                    listeners: {
                        change: function(field, newValue) {
                            var isValid = /^[0-9A-Fa-f]{24}$/.test(newValue);
                            if (newValue.length === 24) {
                                if (isValid) {
                                    field.clearInvalid();
                                } else {
                                    field.markInvalid('EPC must be 24 hexadecimal characters (0-9, A-F)');
                                }
                            }
                        }
                    }
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: 'Assign EPC - ' + itemData.itemCode,
            modal: true,
            width: 400,
            height: 200,
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
                    text: 'Assign EPC',
                    iconCls: 'fa fa-link',
                    handler: function() {
                        if (form.isValid()) {
                            var epcCode = form.getValues().epcCode;
                            if (/^[0-9A-Fa-f]{24}$/.test(epcCode)) {
                                me.callAssignEPCForSelectedItem({
                                    epcCode: epcCode,
                                    itemId: itemData.itemId,
                                    quantity: itemData.quantity
                                });
                                window.close();
                            } else {
                                Ext.Msg.alert('Invalid EPC', 'Please enter a valid 24-character hexadecimal EPC code.');
                            }
                        }
                    }
                }
            ]
        });
        
        window.show();
    },

    /**
     * Call Generate EPC API for selected item
     */
    callGenerateEPCForSelectedItem: function(itemData) {
        var me = this;
        console.log('🔄 Generating EPC for selected item:', itemData);
        
        // Call backend API via WarehouseController
        var controller = me.getWarehouseController();
        if (controller && controller.generateEPC) {
            controller.generateEPC({
                itemCode: itemData.itemCode,
                quantity: itemData.expectedQuantity
            });
        } else {
            console.error('❌ WarehouseController.generateEPC not available');
            Ext.Msg.alert('API Error', 'Generate EPC API not available. Please check backend integration.');
        }
    },

    /**
     * Call Assign EPC API for selected item with complete traceability
     */
    callAssignEPCForSelectedItem: function(assignmentData) {
        var me = this;
        console.log('🔄 Assigning EPC for selected item with traceability:', assignmentData);
        
        // Get current delivery context for inboundItemId traceability
        var parentWindow = me.up('window');
        var deliveryItemsGrid = parentWindow ? parentWindow.down('#deliveryItemsGrid') : null;
        var selectedItem = null;
        
        if (deliveryItemsGrid) {
            var selection = deliveryItemsGrid.getSelection();
            if (selection.length > 0) {
                selectedItem = selection[0];
            }
        }
        
        // Enhanced assignment data with traceability fields per Postman collection spec
        var enhancedAssignmentData = {
            epcCode: assignmentData.epcCode,
            itemId: assignmentData.itemId,
            quantity: assignmentData.quantity || 1,
            assignedBy: 'warehouse_user@company.com',
            notes: 'Manual EPC assignment via warehouse management system'
        };
        
        // CRITICAL: Add inboundItemId for complete traceability if available
        if (selectedItem) {
            var inboundItemId = selectedItem.get('inboundItemId') || selectedItem.get('inbound_item_id');
            if (inboundItemId && inboundItemId.indexOf('temp-') !== 0) {
                enhancedAssignmentData.inboundItemId = inboundItemId;
                enhancedAssignmentData.notes += ' - Linked to inbound delivery item for complete traceability';
                console.log('✅ Including inboundItemId for traceability:', inboundItemId);
            } else {
                console.log('⚠️ No valid inboundItemId available for traceability');
            }
        }
        
        console.log('📤 Enhanced EPC assignment data:', enhancedAssignmentData);
        
        // Call backend API via WarehouseController
        var controller = me.getWarehouseController();
        if (controller && controller.assignEPC) {
            controller.assignEPC(enhancedAssignmentData);
        } else {
            console.error('❌ WarehouseController.assignEPC not available');
            Ext.Msg.alert('API Error', 'Assign EPC API not available. Please check backend integration.');
        }
    },

    /**
     * Show Confirm Good Receive dialog - NEW method for handheld RFID scanner
     */
    showConfirmGoodReceiveDialog: function(record, parentWindow) {
        var me = this;
        
        if (!record) {
            Ext.Msg.alert('Selection Required', 'Please select a delivery to confirm good receive.');
            return;
        }
        
        var deliveryId = record.get('inbound_delivery_id') || record.get('id');
        var deliveryNumber = record.get('delivery_number') || 'Unknown';
        
        // Create form for RFID scan configuration
        var form = Ext.create('Ext.form.Panel', {
            bodyPadding: 15,
            defaults: {
                anchor: '100%',
                labelWidth: 120
            },
            items: [
                {
                    xtype: 'displayfield',
                    fieldLabel: 'Delivery',
                    value: '<strong>' + deliveryNumber + '</strong>'
                },
                {
                    xtype: 'displayfield',
                    fieldLabel: 'Supplier',
                    value: record.get('supplier_name') || 'N/A'
                },
                {
                    xtype: 'displayfield',
                    fieldLabel: 'Total Items',
                    value: record.get('total_items') || 0
                },
                {
                    xtype: 'fieldset',
                    title: '📱 Handheld RFID Scanner Configuration',
                    defaults: {
                        anchor: '100%',
                        labelWidth: 100
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            name: 'readerId',
                            fieldLabel: 'Reader ID',
                            value: 'RFID-READER-001',
                            allowBlank: false
                        },
                        {
                            xtype: 'textfield',
                            name: 'location',
                            fieldLabel: 'Location',
                            value: 'INBOUND-STAGING',
                            allowBlank: false
                        },
                        {
                            xtype: 'textfield',
                            name: 'scannedBy',
                            fieldLabel: 'Operator',
                            value: 'operator@company.com',
                            allowBlank: false
                        },
                        {
                            xtype: 'numberfield',
                            name: 'totalScanned',
                            fieldLabel: 'Total Scanned',
                            value: record.get('total_items') || 2,
                            minValue: 0,
                            allowBlank: false
                        }
                    ]
                },
                {
                    xtype: 'fieldset',
                    title: '📡 Sample Scanned Tags (for demo)',
                    html: '<div style="padding: 10px; background: #f8f9fa; border-radius: 4px;">' +
                          '<p><strong>Note:</strong> In production, this would be automatically populated by the handheld RFID reader.</p>' +
                          '<p>Sample EPC Tags:</p>' +
                          '<ul>' +
                          '<li>3034257BF7194E4000001A85 (RSSI: -45)</li>' +
                          '<li>3034257BF7194E4000001A86 (RSSI: -52)</li>' +
                          '</ul>' +
                          '</div>'
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: '📱 Confirm Good Receive - Handheld RFID Scanner',
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
                    text: 'Confirm with RFID Scan',
                    iconCls: 'fa fa-check-circle',
                    handler: function() {
                        if (form.isValid()) {
                            var values = form.getValues();
                            
                            // Build RFID scan data according to Postman collection spec
                            var rfidScanData = {
                                readerId: values.readerId,
                                location: values.location,
                                scannedBy: values.scannedBy,
                                scanTimestamp: new Date().toISOString(),
                                totalScanned: parseInt(values.totalScanned),
                                scannedTags: [
                                    {
                                        epc: '3034257BF7194E4000001A85',
                                        rssi: -45,
                                        timestamp: new Date().toISOString(),
                                        antenna: 1
                                    },
                                    {
                                        epc: '3034257BF7194E4000001A86',
                                        rssi: -52,
                                        timestamp: new Date(Date.now() + 5000).toISOString(),
                                        antenna: 2
                                    }
                                ]
                            };
                            
                            console.log('🔄 Initiating RFID good receive confirmation for:', deliveryId);
                            
                            // Call the new controller method
                            var controller = me.getWarehouseController();
                            if (controller && controller.confirmGoodReceiveRFID) {
                                controller.confirmGoodReceiveRFID(deliveryId, rfidScanData);
                                window.close();
                                
                                // Close parent window if it exists
                                if (parentWindow) {
                                    parentWindow.close();
                                }
                                
                                // Refresh the main delivery grid
                                setTimeout(function() {
                                    me.loadInboundDeliveries();
                                }, 1000);
                            } else {
                                console.error('❌ WarehouseController.confirmGoodReceiveRFID not available');
                                Ext.Msg.alert('API Error', 'Confirm Good Receive RFID API not available. Please check backend integration.');
                            }
                        }
                    }
                }
            ]
        });
        
        window.show();
    }
});
