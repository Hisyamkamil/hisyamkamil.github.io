/**
 * Put Away Panel Component
 * Transfer orders from inbound area to storage locations
 */
Ext.define('Store.warehouse.view.PutAwayPanel', {
    extend: 'Ext.panel.Panel',
    
    title: 'Put Away - Transfer Orders Management',
    layout: 'border',
    border: false,
    
    initComponent: function() {
        var me = this;
        
        // Create put away tasks store
        var putAwayStore = Ext.create('Ext.data.Store', {
            fields: [
                'transferNumber',
                'sourceDelivery',
                'fromLocation',
                'toLocation',
                'totalItems',
                'movedItems',
                'status',
                'assignedTo',
                'priority',
                'createdBy',
                'createdDate',
                'startedDate',
                'completedBy',
                'completedDate',
                'estimatedTime'
            ],
            data: [
                {
                    transferNumber: 'TRF-2024-001',
                    sourceDelivery: 'GRN-2024-001',
                    fromLocation: 'INBOUND-A01',
                    toLocation: 'GOLD-ROOM-A',
                    totalItems: 5,
                    movedItems: 5,
                    status: 'Completed',
                    assignedTo: 'operator_001',
                    priority: 'High',
                    createdBy: 'admin',
                    createdDate: '2024-04-15',
                    startedDate: '2024-04-15',
                    completedBy: 'operator_001',
                    completedDate: '2024-04-15',
                    estimatedTime: '2 hours'
                },
                {
                    transferNumber: 'TRF-2024-002',
                    sourceDelivery: 'GRN-2024-002',
                    fromLocation: 'INBOUND-A02',
                    toLocation: 'GOLD-ROOM-B',
                    totalItems: 3,
                    movedItems: 1,
                    status: 'In Progress',
                    assignedTo: 'operator_002',
                    priority: 'Medium',
                    createdBy: 'admin',
                    createdDate: '2024-04-16',
                    startedDate: '2024-04-16',
                    completedBy: null,
                    completedDate: null,
                    estimatedTime: '1.5 hours'
                },
                {
                    transferNumber: 'TRF-2024-003',
                    sourceDelivery: 'GRN-2024-003',
                    fromLocation: 'INBOUND-A03',
                    toLocation: 'GOLD-ROOM-C',
                    totalItems: 8,
                    movedItems: 0,
                    status: 'Created',
                    assignedTo: 'operator_003',
                    priority: 'Normal',
                    createdBy: 'admin',
                    createdDate: '2024-04-17',
                    startedDate: null,
                    completedBy: null,
                    completedDate: null,
                    estimatedTime: '3 hours'
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
                            putAwayStore.reload();
                            Ext.Msg.alert('Info', 'Transfer orders refreshed');
                        }
                    }
                ]
            },
            
            // Put Away Tasks Grid
            {
                region: 'center',
                xtype: 'grid',
                store: putAwayStore,
                columns: [
                    {
                        text: 'Transfer Number',
                        dataIndex: 'transferNumber',
                        width: 140,
                        renderer: function(value) {
                            return '<strong>' + value + '</strong>';
                        }
                    },
                    {
                        text: 'Source Delivery',
                        dataIndex: 'sourceDelivery',
                        width: 130
                    },
                    {
                        text: 'From Location',
                        dataIndex: 'fromLocation',
                        flex: 1
                    },
                    {
                        text: 'To Location',
                        dataIndex: 'toLocation',
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
                            return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                        }
                    },
                    {
                        text: 'Items',
                        dataIndex: 'totalItems',
                        width: 80,
                        align: 'center',
                        renderer: function(value, metaData, record) {
                            var moved = record.get('movedItems');
                            var color = moved === value ? 'green' : moved > 0 ? 'orange' : 'black';
                            return '<span style="color: ' + color + ';">' + moved + '/' + value + '</span>';
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
                            return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                        }
                    },
                    {
                        text: 'Assigned To',
                        dataIndex: 'assignedTo',
                        width: 120
                    },
                    {
                        text: 'Est. Time',
                        dataIndex: 'estimatedTime',
                        width: 100
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

    showTransferForm: function(record) {
        var me = this;
        var isEdit = !!record;
        
        // Available inbound deliveries (from Good Receive)
        var inboundDeliveries = [
            { deliveryNumber: 'GRN-2024-001', supplier: 'Caterpillar Inc.', location: 'INBOUND-A01', items: 5 },
            { deliveryNumber: 'GRN-2024-002', supplier: 'Caterpillar Parts', location: 'INBOUND-A02', items: 3 },
            { deliveryNumber: 'GRN-2024-003', supplier: 'Caterpillar Equipment', location: 'INBOUND-A03', items: 8 }
        ];

        // Available storage locations
        var storageLocations = [
            'GOLD-ROOM-A', 'GOLD-ROOM-B', 'GOLD-ROOM-C', 
            'STORAGE-A1', 'STORAGE-A2', 'STORAGE-B1', 
            'HIGH-VALUE-01', 'BULK-STORAGE-01'
        ];

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
                        data: inboundDeliveries
                    }),
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
                    store: ['operator_001', 'operator_002', 'operator_003', 'operator_004'],
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
                            } else {
                                // Find selected delivery to get item count
                                var selectedDelivery = inboundDeliveries.find(d => d.deliveryNumber === values.sourceDelivery);
                                values.totalItems = selectedDelivery ? selectedDelivery.items : 0;
                                values.movedItems = 0;
                                values.status = 'Created';
                                values.createdBy = 'current_user';
                                values.createdDate = new Date().toISOString().split('T')[0];
                                
                                var store = me.down('grid').getStore();
                                store.add(values);
                                Ext.Msg.alert('Success', 'Transfer order "' + values.transferNumber + '" created successfully!');
                            }
                            window.close();
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
                // Items List (placeholder)
                {
                    region: 'center',
                    title: 'Items to Transfer',
                    html: '<div style="padding: 20px; text-align: center; color: #666;"><p>Items list for transfer order <strong>' + record.get('transferNumber') + '</strong> would be displayed here.</p><p>Features: Item details, source bins, destination bins, transfer status per item.</p></div>'
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
            'Start put away process for transfer "' + record.get('transferNumber') + '"?',
            function(btn) {
                if (btn === 'yes') {
                    record.set({
                        status: 'In Progress',
                        startedDate: new Date().toISOString().split('T')[0]
                    });
                    Ext.Msg.alert('Success', 'Put away process started! Operator can now begin moving items.');
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
        // Simulate source location RFID scanning
        var sourceGrid = Ext.ComponentQuery.query('#sourceGrid')[0];
        var store = sourceGrid.getStore();
        
        var demoItems = [
            { epc: '3014257BF7194E4000001A85', itemCode: 'ITM001', itemName: 'Steel Pipe 6 inch', status: 'Found' },
            { epc: '3014257BF7194E4000001A86', itemCode: 'ITM002', itemName: 'Hydraulic Hose', status: 'Found' },
            { epc: '3014257BF7194E4000001A87', itemCode: 'ITM003', itemName: 'Mining Drill Bit', status: 'Found' }
        ];
        
        var index = 0;
        var interval = setInterval(function() {
            if (index < demoItems.length && index < record.get('totalItems')) {
                store.add(demoItems[index]);
                index++;
                
                if (index >= record.get('totalItems')) {
                    clearInterval(interval);
                    var scanDestBtn = Ext.ComponentQuery.query('#scanDestBtn')[0];
                    if (scanDestBtn) scanDestBtn.setDisabled(false);
                    Ext.Msg.alert('Source Scan Complete', 'All items validated at source location!');
                }
            } else {
                clearInterval(interval);
            }
        }, 1500);
    },

    performDestinationScan: function(record) {
        // Simulate destination scanning and placement
        var destGrid = Ext.ComponentQuery.query('#destGrid')[0];
        var store = destGrid.getStore();
        
        var demoItems = [
            { itemCode: 'ITM001', itemName: 'Steel Pipe 6 inch', binLocation: 'A-01-01', status: 'Placed' },
            { itemCode: 'ITM002', itemName: 'Hydraulic Hose', binLocation: 'A-01-02', status: 'Placed' },
            { itemCode: 'ITM003', itemName: 'Mining Drill Bit', binLocation: 'A-01-03', status: 'Placed' }
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
                    Ext.Msg.alert('Placement Complete', 'All items placed in destination location!');
                }
            } else {
                clearInterval(interval);
            }
        }, 2000);
    },

    completePutAway: function(record) {
        var me = this;
        
        Ext.Msg.confirm('Complete Put Away', 
            'Complete put away for transfer "' + record.get('transferNumber') + '"?',
            function(btn) {
                if (btn === 'yes') {
                    record.set({
                        status: 'Completed',
                        movedItems: record.get('totalItems'),
                        completedBy: 'current_user',
                        completedDate: new Date().toISOString().split('T')[0]
                    });
                    Ext.Msg.alert('Success', 'Put away completed successfully! All items transferred to storage.');
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
    }
});
