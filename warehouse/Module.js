/**
 * Warehouse Management System - Good Receive Module Only
 * Simple PILOT Extension focusing on inbound delivery management
 */

Ext.define('Store.warehouse.Module', {
    extend: 'Ext.Component',

    initModule: function() {
        console.log('Warehouse Management - Good Receive Module initialized');

        // 1. CREATE NAVIGATION TAB COMPONENT
        var navTab = Ext.create('Ext.panel.Panel', {
            title: 'Good Receive',
            iconCls: 'fa fa-truck-loading',
            iconAlign: 'top',
            layout: 'vbox',
            border: false,
            bodyPadding: 10,
            
            items: [{
                xtype: 'button',
                text: 'Inbound Deliveries',
                iconCls: 'fa fa-list',
                width: '100%',
                margin: '0 0 10 0',
                scale: 'large',
                handler: function() {
                    if (navTab.map_frame && navTab.map_frame.showInboundList) {
                        navTab.map_frame.showInboundList();
                    }
                }
            }, {
                xtype: 'button',
                text: 'Create Inbound',
                iconCls: 'fa fa-plus-circle',
                width: '100%',
                margin: '0 0 10 0',
                scale: 'large',
                handler: function() {
                    if (navTab.map_frame && navTab.map_frame.showCreateForm) {
                        navTab.map_frame.showCreateForm();
                    }
                }
            }, {
                xtype: 'button',
                text: 'RFID Scanning',
                iconCls: 'fa fa-wifi',
                width: '100%',
                scale: 'large',
                handler: function() {
                    if (navTab.map_frame && navTab.map_frame.showRFIDScan) {
                        navTab.map_frame.showRFIDScan();
                    }
                }
            }]
        });

        // 2. CREATE MAIN CONTENT COMPONENT  
        var mainPanel = Ext.create('Ext.panel.Panel', {
            layout: 'card',
            border: false,
            
            items: [{
                itemId: 'welcome',
                xtype: 'panel',
                html: '<div style="padding: 20px; text-align: center;"><h2>Good Receive Module</h2><p>Select an option from the left navigation to get started.</p></div>'
            }]
        });

        // Add methods to mainPanel
        mainPanel.showInboundList = function() {
            var panel = this.down('#inboundList');
            if (!panel) {
                panel = Ext.create('Ext.grid.Panel', {
                    itemId: 'inboundList',
                    title: 'Inbound Deliveries',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['deliveryNumber', 'supplierName', 'status', 'expectedDate', 'totalItems'],
                        data: [
                            { deliveryNumber: 'GRN-001', supplierName: 'Supplier Alpha', status: 'Pending', expectedDate: '2024-04-15', totalItems: 5 },
                            { deliveryNumber: 'GRN-002', supplierName: 'Supplier Beta', status: 'Confirmed', expectedDate: '2024-04-16', totalItems: 3 },
                            { deliveryNumber: 'GRN-003', supplierName: 'Supplier Gamma', status: 'Processing', expectedDate: '2024-04-17', totalItems: 8 }
                        ]
                    }),
                    columns: [{
                        text: 'Delivery Number',
                        dataIndex: 'deliveryNumber',
                        flex: 1
                    }, {
                        text: 'Supplier Name',
                        dataIndex: 'supplierName',
                        flex: 2
                    }, {
                        text: 'Status',
                        dataIndex: 'status',
                        width: 100,
                        renderer: function(value) {
                            var color = value === 'Confirmed' ? 'green' : value === 'Pending' ? 'orange' : 'blue';
                            return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                        }
                    }, {
                        text: 'Expected Date',
                        dataIndex: 'expectedDate',
                        width: 120
                    }, {
                        text: 'Total Items',
                        dataIndex: 'totalItems',
                        width: 100
                    }],
                    tbar: [{
                        text: 'Create New',
                        iconCls: 'fa fa-plus',
                        handler: function() {
                            mainPanel.showCreateForm();
                        }
                    }, {
                        text: 'Refresh',
                        iconCls: 'fa fa-sync',
                        handler: function() {
                            Ext.Msg.alert('Info', 'Data refreshed');
                        }
                    }]
                });
                this.add(panel);
            }
            this.getLayout().setActiveItem(panel);
        };
        
        mainPanel.showCreateForm = function() {
            var me = this;
            
            var form = Ext.create('Ext.form.Panel', {
                bodyPadding: 15,
                defaults: {
                    anchor: '100%',
                    labelWidth: 150
                },
                items: [{
                    xtype: 'textfield',
                    name: 'deliveryNumber',
                    fieldLabel: 'Delivery Number *',
                    allowBlank: false,
                    value: 'GRN-' + Math.floor(Math.random() * 1000)
                }, {
                    xtype: 'textfield',
                    name: 'supplierName',
                    fieldLabel: 'Supplier Name *',
                    allowBlank: false
                }, {
                    xtype: 'datefield',
                    name: 'expectedDate',
                    fieldLabel: 'Expected Date *',
                    allowBlank: false,
                    value: new Date()
                }, {
                    xtype: 'numberfield',
                    name: 'totalItems',
                    fieldLabel: 'Total Items',
                    value: 1,
                    minValue: 1
                }, {
                    xtype: 'textarea',
                    name: 'notes',
                    fieldLabel: 'Notes',
                    height: 80
                }]
            });
            
            Ext.create('Ext.window.Window', {
                title: 'Create Inbound Delivery',
                width: 450,
                height: 350,
                modal: true,
                layout: 'fit',
                items: [form],
                buttons: [{
                    text: 'Save',
                    iconCls: 'fa fa-save',
                    formBind: true,
                    handler: function(btn) {
                        var formData = form.getValues();
                        Ext.Msg.alert('Success', 'Inbound delivery "' + formData.deliveryNumber + '" created successfully!');
                        btn.up('window').close();
                        // Refresh list if it's visible
                        var listPanel = me.down('#inboundList');
                        if (listPanel) {
                            me.showInboundList();
                        }
                    }
                }, {
                    text: 'Cancel',
                    handler: function(btn) {
                        btn.up('window').close();
                    }
                }]
            }).show();
        };
        
        mainPanel.showRFIDScan = function() {
            var me = this;
            var panel = this.down('#rfidScan');
            if (!panel) {
                panel = Ext.create('Ext.panel.Panel', {
                    itemId: 'rfidScan',
                    title: 'RFID Scanning Interface',
                    layout: 'border',
                    items: [{
                        region: 'west',
                        width: 280,
                        title: 'Scan Controls',
                        bodyPadding: 15,
                        items: [{
                            xtype: 'displayfield',
                            fieldLabel: 'Reader Status',
                            value: '<span style="color: green;">Ready</span>'
                        }, {
                            xtype: 'button',
                            text: 'Start RFID Scan',
                            iconCls: 'fa fa-wifi',
                            width: '100%',
                            scale: 'large',
                            margin: '10 0',
                            handler: function() {
                                me.performRFIDScan();
                            }
                        }, {
                            xtype: 'displayfield',
                            fieldLabel: 'Last Scan',
                            itemId: 'lastScanField',
                            value: 'No scans yet'
                        }]
                    }, {
                        region: 'center',
                        title: 'Scanned RFID Tags',
                        xtype: 'grid',
                        itemId: 'scannedGrid',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['epc', 'rssi', 'timestamp', 'itemCode', 'status']
                        }),
                        columns: [{
                            text: 'EPC Code',
                            dataIndex: 'epc',
                            flex: 2
                        }, {
                            text: 'Signal (dBm)',
                            dataIndex: 'rssi',
                            width: 100
                        }, {
                            text: 'Timestamp',
                            dataIndex: 'timestamp',
                            width: 160
                        }, {
                            text: 'Item Code',
                            dataIndex: 'itemCode',
                            width: 120
                        }, {
                            text: 'Status',
                            dataIndex: 'status',
                            width: 100,
                            renderer: function(value) {
                                return '<span style="color: green;">' + value + '</span>';
                            }
                        }]
                    }]
                });
                this.add(panel);
            }
            this.getLayout().setActiveItem(panel);
        };
        
        mainPanel.performRFIDScan = function() {
            var me = this;
            var grid = me.down('#scannedGrid');
            var lastScanField = me.down('#lastScanField');
            
            if (grid && lastScanField) {
                // Simulate RFID scanning with demo data
                setTimeout(function() {
                    var store = grid.getStore();
                    var now = new Date();
                    
                    // Add simulated scan results
                    store.add([
                        {
                            epc: '3014257BF7194E4000001A85',
                            rssi: '-42',
                            timestamp: now.toLocaleString(),
                            itemCode: 'ITM-' + Math.floor(Math.random() * 1000),
                            status: 'Identified'
                        },
                        {
                            epc: '3014257BF7194E4000001A86',
                            rssi: '-38',
                            timestamp: now.toLocaleString(),
                            itemCode: 'ITM-' + Math.floor(Math.random() * 1000),
                            status: 'Identified'
                        }
                    ]);
                    
                    lastScanField.setValue('<span style="color: green;">Scan completed - 2 tags found</span>');
                    Ext.Msg.alert('RFID Scan Complete', '2 RFID tags successfully identified and processed');
                }, 1500);
                
                lastScanField.setValue('<span style="color: blue;">Scanning in progress...</span>');
            }
        };

        // 3. LINK COMPONENTS TOGETHER (MANDATORY)
        navTab.map_frame = mainPanel;

        // 4. ADD TO PILOT INTERFACE
        skeleton.navigation.add(navTab);
        skeleton.mapframe.add(mainPanel);

        console.log('Good Receive module successfully loaded');
    }
});
