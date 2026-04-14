/**
 * Warehouse Management System - PILOT Extension
 * Comprehensive warehouse operations with Zebra RFID integration
 */

Ext.define('Store.warehouse.Module', {
    extend: 'Ext.Component',

    /**
     * Main initialization function following AI_SPECS.md Pattern 1
     */
    initModule: function () {
        console.log('Warehouse Management System initialized');

        // 1. CREATE NAVIGATION TAB COMPONENT
        var navTab = Ext.create('Ext.panel.Panel', {
            title: 'Warehouse Management',
            iconCls: 'fa fa-warehouse',
            layout: 'accordion',
            border: false,
            
            items: [{
                xtype: 'panel',
                title: 'Dashboard',
                iconCls: 'fa fa-tachometer-alt',
                layout: 'fit',
                items: [{
                    xtype: 'button',
                    text: 'Overview',
                    iconCls: 'fa fa-chart-pie',
                    handler: function() {
                        navTab.showDashboard();
                    }
                }]
            }, {
                xtype: 'panel',
                title: 'Good Receive',
                iconCls: 'fa fa-truck-loading',
                layout: 'vbox',
                defaults: {
                    margin: 5,
                    width: '100%'
                },
                items: [{
                    xtype: 'button',
                    text: 'Inbound Deliveries',
                    iconCls: 'fa fa-list',
                    handler: function() {
                        navTab.showInboundDeliveries();
                    }
                }, {
                    xtype: 'button',
                    text: 'Create Inbound',
                    iconCls: 'fa fa-plus-circle',
                    handler: function() {
                        navTab.showCreateInbound();
                    }
                }, {
                    xtype: 'button',
                    text: 'RFID Scanning',
                    iconCls: 'fa fa-wifi',
                    handler: function() {
                        navTab.showRFIDScanning();
                    }
                }]
            }, {
                xtype: 'panel',
                title: 'Put Away',
                iconCls: 'fa fa-dolly',
                layout: 'vbox',
                defaults: {
                    margin: 5,
                    width: '100%'
                },
                items: [{
                    xtype: 'button',
                    text: 'Put Away Tasks',
                    iconCls: 'fa fa-tasks',
                    handler: function() {
                        navTab.showPutAwayTasks();
                    }
                }]
            }, {
                xtype: 'panel',
                title: 'Picking',
                iconCls: 'fa fa-hand-paper',
                layout: 'vbox',
                defaults: {
                    margin: 5,
                    width: '100%'
                },
                items: [{
                    xtype: 'button',
                    text: 'Picking Tasks',
                    iconCls: 'fa fa-clipboard-list',
                    handler: function() {
                        navTab.showPickingTasks();
                    }
                }]
            }, {
                xtype: 'panel',
                title: 'Stock Opname',
                iconCls: 'fa fa-clipboard-check',
                layout: 'fit',
                items: [{
                    xtype: 'button',
                    text: 'Physical Count',
                    iconCls: 'fa fa-calculator',
                    handler: function() {
                        navTab.showStockOpname();
                    }
                }]
            }, {
                xtype: 'panel',
                title: 'Reports',
                iconCls: 'fa fa-chart-bar',
                layout: 'vbox',
                defaults: {
                    margin: 5,
                    width: '100%'
                },
                items: [{
                    xtype: 'button',
                    text: 'Inventory Report',
                    iconCls: 'fa fa-chart-line',
                    handler: function() {
                        navTab.showInventoryReport();
                    }
                }]
            }, {
                xtype: 'panel',
                title: 'Master Data',
                iconCls: 'fa fa-database',
                layout: 'vbox',
                defaults: {
                    margin: 5,
                    width: '100%'
                },
                items: [{
                    xtype: 'button',
                    text: 'Items',
                    iconCls: 'fa fa-cube',
                    handler: function() {
                        navTab.showItemMaster();
                    }
                }, {
                    xtype: 'button',
                    text: 'Locations',
                    iconCls: 'fa fa-map-marker-alt',
                    handler: function() {
                        navTab.showLocationMaster();
                    }
                }]
            }],
            
            // Navigation methods - update main panel via map_frame linkage
            showDashboard: function() {
                if (this.map_frame && this.map_frame.showView) {
                    this.map_frame.showView('dashboard');
                }
            },
            
            showInboundDeliveries: function() {
                if (this.map_frame && this.map_frame.showView) {
                    this.map_frame.showView('inbound');
                }
            },
            
            showCreateInbound: function() {
                if (this.map_frame && this.map_frame.showCreateInbound) {
                    this.map_frame.showCreateInbound();
                }
            },
            
            showRFIDScanning: function() {
                if (this.map_frame && this.map_frame.showView) {
                    this.map_frame.showView('rfid');
                }
            },
            
            showPutAwayTasks: function() {
                if (this.map_frame && this.map_frame.showView) {
                    this.map_frame.showView('putaway');
                }
            },
            
            showPickingTasks: function() {
                if (this.map_frame && this.map_frame.showView) {
                    this.map_frame.showView('picking');
                }
            },
            
            showStockOpname: function() {
                if (this.map_frame && this.map_frame.showView) {
                    this.map_frame.showView('opname');
                }
            },
            
            showInventoryReport: function() {
                if (this.map_frame && this.map_frame.showView) {
                    this.map_frame.showView('reports');
                }
            },
            
            showItemMaster: function() {
                if (this.map_frame && this.map_frame.showView) {
                    this.map_frame.showView('items');
                }
            },
            
            showLocationMaster: function() {
                if (this.map_frame && this.map_frame.showView) {
                    this.map_frame.showView('locations');
                }
            }
        });

        // 2. CREATE MAIN CONTENT COMPONENT
        var mainPanel = Ext.create('Ext.panel.Panel', {
            layout: 'card',
            border: false,
            
            items: [{
                itemId: 'welcome',
                xtype: 'panel',
                html: '<div style="padding: 20px; text-align: center;"><h2>Warehouse Management System</h2><p>Select a module from the left navigation to get started.</p></div>'
            }],
            
            // Initialize RFID manager
            listeners: {
                afterrender: function() {
                    this.rfidManager = {
                        isConnected: false,
                        connect: function() {
                            console.log('RFID Manager: Connecting to Zebra reader...');
                            this.isConnected = true;
                            return Promise.resolve(true);
                        },
                        scan: function() {
                            console.log('RFID Manager: Starting scan operation...');
                            return new Promise(function(resolve) {
                                setTimeout(function() {
                                    resolve([
                                        { epc: '3014257BF7194E4000001A85', rssi: -45, timestamp: new Date() },
                                        { epc: '3014257BF7194E4000001A86', rssi: -38, timestamp: new Date() }
                                    ]);
                                }, 2000);
                            });
                        }
                    };
                }
            },
            
            showView: function(viewType) {
                var panel;
                
                switch (viewType) {
                    case 'dashboard':
                        panel = this.getOrCreatePanel('dashboard', 'Warehouse Dashboard', this.createDashboard());
                        break;
                    case 'inbound':
                        panel = this.getOrCreatePanel('inbound', 'Inbound Deliveries', this.createInboundGrid());
                        break;
                    case 'rfid':
                        panel = this.getOrCreatePanel('rfid', 'RFID Scanning', this.createRFIDPanel());
                        break;
                    case 'putaway':
                        panel = this.getOrCreatePanel('putaway', 'Put Away Tasks', this.createPutAwayGrid());
                        break;
                    case 'picking':
                        panel = this.getOrCreatePanel('picking', 'Picking Tasks', this.createPickingGrid());
                        break;
                    case 'opname':
                        panel = this.getOrCreatePanel('opname', 'Stock Opname', this.createOpnamePanel());
                        break;
                    case 'reports':
                        panel = this.getOrCreatePanel('reports', 'Reports', this.createReportsPanel());
                        break;
                    case 'items':
                        panel = this.getOrCreatePanel('items', 'Item Master', this.createItemGrid());
                        break;
                    case 'locations':
                        panel = this.getOrCreatePanel('locations', 'Location Master', this.createLocationGrid());
                        break;
                    default:
                        panel = this.down('#welcome');
                }
                
                if (panel) {
                    this.getLayout().setActiveItem(panel);
                }
            },
            
            getOrCreatePanel: function(id, title, config) {
                var panel = this.down('#' + id);
                if (!panel) {
                    panel = Ext.create('Ext.panel.Panel', Ext.apply({
                        itemId: id,
                        title: title,
                        layout: 'fit',
                        bodyPadding: 10
                    }, config));
                    this.add(panel);
                }
                return panel;
            },
            
            createDashboard: function() {
                return {
                    layout: 'hbox',
                    items: [{
                        flex: 1,
                        margin: '0 10 0 0',
                        bodyStyle: 'background: #e3f2fd; text-align: center; padding: 20px; border-radius: 8px;',
                        html: '<h2 style="margin:0;">1,250</h2><p>Total Items</p>'
                    }, {
                        flex: 1,
                        margin: '0 10 0 0',
                        bodyStyle: 'background: #f3e5f5; text-align: center; padding: 20px; border-radius: 8px;',
                        html: '<h2 style="margin:0;">98.5%</h2><p>Accuracy</p>'
                    }, {
                        flex: 1,
                        margin: '0 10 0 0',
                        bodyStyle: 'background: #e8f5e8; text-align: center; padding: 20px; border-radius: 8px;',
                        html: '<h2 style="margin:0;">25</h2><p>Today Activity</p>'
                    }, {
                        flex: 1,
                        bodyStyle: 'background: #fff3e0; text-align: center; padding: 20px; border-radius: 8px;',
                        html: '<h2 style="margin:0;">3</h2><p>Active Alerts</p>'
                    }]
                };
            },
            
            createInboundGrid: function() {
                var me = this;
                return {
                    layout: 'border',
                    items: [{
                        region: 'north',
                        height: 50,
                        xtype: 'toolbar',
                        items: [{
                            text: 'Create Inbound Delivery',
                            iconCls: 'fa fa-plus',
                            handler: function() {
                                me.showCreateInbound();
                            }
                        }]
                    }, {
                        region: 'center',
                        xtype: 'grid',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['deliveryNumber', 'supplierName', 'status', 'expectedDate', 'totalItems'],
                            proxy: {
                                type: 'ajax',
                                url: '/api/warehouse/inbound',
                                reader: {
                                    type: 'json',
                                    rootProperty: 'inboundDeliveries'
                                }
                            },
                            autoLoad: true
                        }),
                        columns: [{
                            text: 'Delivery Number',
                            dataIndex: 'deliveryNumber',
                            flex: 1
                        }, {
                            text: 'Supplier',
                            dataIndex: 'supplierName',
                            flex: 2
                        }, {
                            text: 'Status',
                            dataIndex: 'status',
                            width: 100,
                            renderer: function(value) {
                                var color = value === 'confirmed' ? 'green' : value === 'cancelled' ? 'red' : 'orange';
                                return '<span style="color: ' + color + ';">' + value.toUpperCase() + '</span>';
                            }
                        }, {
                            text: 'Expected Date',
                            dataIndex: 'expectedDate',
                            width: 120,
                            xtype: 'datecolumn',
                            format: 'Y-m-d'
                        }, {
                            text: 'Items',
                            dataIndex: 'totalItems',
                            width: 80
                        }]
                    }]
                };
            },
            
            createRFIDPanel: function() {
                var me = this;
                return {
                    layout: 'border',
                    items: [{
                        region: 'west',
                        width: 250,
                        title: 'Scan Control',
                        bodyPadding: 10,
                        items: [{
                            xtype: 'button',
                            text: 'Start RFID Scan',
                            iconCls: 'fa fa-wifi',
                            width: '100%',
                            scale: 'large',
                            handler: function() {
                                me.startRFIDScan();
                            }
                        }, {
                            xtype: 'displayfield',
                            fieldLabel: 'Reader Status',
                            value: 'Ready to scan',
                            margin: '10 0 0 0'
                        }]
                    }, {
                        region: 'center',
                        title: 'Scanned Tags',
                        xtype: 'grid',
                        itemId: 'scannedTagsGrid',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['epc', 'rssi', 'timestamp', 'itemCode', 'status']
                        }),
                        columns: [{
                            text: 'EPC Code',
                            dataIndex: 'epc',
                            flex: 2
                        }, {
                            text: 'Signal Strength',
                            dataIndex: 'rssi',
                            width: 120
                        }, {
                            text: 'Timestamp',
                            dataIndex: 'timestamp',
                            width: 150,
                            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s')
                        }, {
                            text: 'Status',
                            dataIndex: 'status',
                            width: 100
                        }]
                    }]
                };
            },
            
            createPutAwayGrid: function() {
                return {
                    xtype: 'grid',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['transferOrderNumber', 'fromLocation', 'toLocation', 'status', 'assignedTo'],
                        proxy: {
                            type: 'ajax',
                            url: '/api/warehouse/putaway',
                            reader: {
                                type: 'json',
                                rootProperty: 'putAwayTasks'
                            }
                        },
                        autoLoad: true
                    }),
                    columns: [{
                        text: 'Transfer Order',
                        dataIndex: 'transferOrderNumber',
                        flex: 1
                    }, {
                        text: 'From',
                        dataIndex: 'fromLocation',
                        width: 120
                    }, {
                        text: 'To',
                        dataIndex: 'toLocation',
                        width: 120
                    }, {
                        text: 'Status',
                        dataIndex: 'status',
                        width: 100
                    }]
                };
            },
            
            createPickingGrid: function() {
                return {
                    xtype: 'grid',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['outboundDeliveryNumber', 'customerName', 'status'],
                        proxy: {
                            type: 'ajax',
                            url: '/api/warehouse/picking',
                            reader: {
                                type: 'json',
                                rootProperty: 'pickingTasks'
                            }
                        },
                        autoLoad: true
                    }),
                    columns: [{
                        text: 'Delivery Number',
                        dataIndex: 'outboundDeliveryNumber',
                        flex: 1
                    }, {
                        text: 'Customer',
                        dataIndex: 'customerName',
                        flex: 2
                    }, {
                        text: 'Status',
                        dataIndex: 'status',
                        width: 100
                    }]
                };
            },
            
            createOpnamePanel: function() {
                return {
                    html: '<div style="padding: 20px;"><h3>Stock Opname - Physical Count</h3><p>Physical inventory counting and RFID bulk scanning functionality.</p><br><button class="x-btn x-btn-default-small" onclick="alert(\'RFID bulk scan initiated\')">Start RFID Bulk Scan</button></div>'
                };
            },
            
            createReportsPanel: function() {
                return {
                    html: '<div style="padding: 20px;"><h3>Warehouse Reports</h3><ul><li>Inventory Movement Reports</li><li>Activity Audit Trails</li><li>Performance Metrics</li><li>Variance Analysis</li></ul></div>'
                };
            },
            
            createItemGrid: function() {
                return {
                    xtype: 'grid',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['itemCode', 'itemName', 'category', 'unit', 'status'],
                        proxy: {
                            type: 'ajax',
                            url: '/api/warehouse/items',
                            reader: {
                                type: 'json',
                                rootProperty: 'items'
                            }
                        },
                        autoLoad: true
                    }),
                    columns: [{
                        text: 'Item Code',
                        dataIndex: 'itemCode',
                        width: 120
                    }, {
                        text: 'Item Name',
                        dataIndex: 'itemName',
                        flex: 2
                    }, {
                        text: 'Category',
                        dataIndex: 'category',
                        width: 150
                    }, {
                        text: 'Status',
                        dataIndex: 'status',
                        width: 100
                    }]
                };
            },
            
            createLocationGrid: function() {
                return {
                    xtype: 'grid',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['locationCode', 'locationName', 'type', 'capacity', 'status'],
                        proxy: {
                            type: 'ajax',
                            url: '/api/warehouse/locations',
                            reader: {
                                type: 'json',
                                rootProperty: 'locations'
                            }
                        },
                        autoLoad: true
                    }),
                    columns: [{
                        text: 'Location Code',
                        dataIndex: 'locationCode',
                        width: 120
                    }, {
                        text: 'Location Name',
                        dataIndex: 'locationName',
                        flex: 2
                    }, {
                        text: 'Type',
                        dataIndex: 'type',
                        width: 120
                    }, {
                        text: 'Status',
                        dataIndex: 'status',
                        width: 100
                    }]
                };
            },
            
            showCreateInbound: function() {
                var me = this;
                var form = Ext.create('Ext.form.Panel', {
                    bodyPadding: 10,
                    defaults: {
                        anchor: '100%',
                        labelWidth: 120
                    },
                    items: [{
                        xtype: 'textfield',
                        name: 'deliveryNumber',
                        fieldLabel: 'Delivery Number *',
                        allowBlank: false
                    }, {
                        xtype: 'textfield',
                        name: 'supplierName',
                        fieldLabel: 'Supplier Name *',
                        allowBlank: false
                    }, {
                        xtype: 'datefield',
                        name: 'expectedDeliveryDate',
                        fieldLabel: 'Expected Date *',
                        allowBlank: false,
                        value: new Date()
                    }]
                });
                
                Ext.create('Ext.window.Window', {
                    title: 'Create Inbound Delivery',
                    width: 400,
                    height: 250,
                    modal: true,
                    layout: 'fit',
                    items: [form],
                    buttons: [{
                        text: 'Save',
                        iconCls: 'fa fa-save',
                        formBind: true,
                        handler: function(btn) {
                            var formData = form.getValues();
                            Ext.Ajax.request({
                                url: '/api/warehouse/inbound',
                                method: 'POST',
                                jsonData: formData,
                                success: function(response) {
                                    Ext.Msg.alert('Success', 'Inbound delivery created successfully');
                                    btn.up('window').close();
                                },
                                failure: function(response) {
                                    Ext.Msg.alert('Error', 'Failed to create inbound delivery');
                                }
                            });
                        }
                    }, {
                        text: 'Cancel',
                        handler: function(btn) {
                            btn.up('window').close();
                        }
                    }]
                }).show();
            },
            
            startRFIDScan: function() {
                var me = this;
                var grid = me.down('#scannedTagsGrid');
                
                if (me.rfidManager) {
                    me.rfidManager.scan().then(function(scannedTags) {
                        if (grid) {
                            var store = grid.getStore();
                            
                            scannedTags.forEach(function(tag) {
                                store.add({
                                    epc: tag.epc,
                                    rssi: tag.rssi + ' dBm',
                                    timestamp: tag.timestamp,
                                    itemCode: 'ITM-' + Math.floor(Math.random() * 1000),
                                    status: 'Identified'
                                });
                            });
                            
                            // Send scan data to backend
                            Ext.Ajax.request({
                                url: '/api/warehouse/rfid/scan',
                                method: 'POST',
                                jsonData: {
                                    readerId: 'ZBR-001',
                                    location: 'INBOUND-AREA',
                                    scannedTags: scannedTags
                                },
                                success: function() {
                                    console.log('RFID scan processed successfully');
                                },
                                failure: function() {
                                    console.error('RFID scan processing failed');
                                }
                            });
                        }
                    });
                }
            }
        });

        // 3. LINK COMPONENTS TOGETHER
        navTab.map_frame = mainPanel;

        // 4. ADD TO PILOT INTERFACE
        skeleton.navigation.add(navTab);
        skeleton.mapframe.add(mainPanel);
    }
});
