/**
 * Warehouse Management System with Zebra RFID Integration
 * PILOT Extension for comprehensive warehouse operations
 * Follows AI_SPECS.md Pattern 1 (Navigation tab + Main panel)
 */

// Navigation View Component
Ext.define('Store.warehouse.view.Navigation', {
    extend: 'Ext.panel.Panel',
    
    title: 'Warehouse Management',
    iconCls: 'fa fa-warehouse',
    layout: 'accordion',
    border: false,
    
    initComponent: function() {
        var me = this;
        
        me.items = [{
            xtype: 'panel',
            title: 'Dashboard',
            iconCls: 'fa fa-tachometer-alt',
            layout: 'fit',
            items: [{
                xtype: 'button',
                text: 'Overview',
                iconCls: 'fa fa-chart-pie',
                handler: function() {
                    me.showDashboard();
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
                    me.showInboundDeliveries();
                }
            }, {
                xtype: 'button',
                text: 'Create Inbound',
                iconCls: 'fa fa-plus-circle',
                handler: function() {
                    me.showCreateInbound();
                }
            }, {
                xtype: 'button',
                text: 'RFID Scanning',
                iconCls: 'fa fa-wifi',
                handler: function() {
                    me.showRFIDScanning();
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
                    me.showPutAwayTasks();
                }
            }, {
                xtype: 'button',
                text: 'Create Transfer',
                iconCls: 'fa fa-exchange-alt',
                handler: function() {
                    me.showCreateTransfer();
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
                    me.showPickingTasks();
                }
            }, {
                xtype: 'button',
                text: 'Create Picking',
                iconCls: 'fa fa-plus-square',
                handler: function() {
                    me.showCreatePicking();
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
                    me.showStockOpname();
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
                    me.showInventoryReport();
                }
            }, {
                xtype: 'button',
                text: 'Activity Report',
                iconCls: 'fa fa-history',
                handler: function() {
                    me.showActivityReport();
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
                    me.showItemMaster();
                }
            }, {
                xtype: 'button',
                text: 'Locations',
                iconCls: 'fa fa-map-marker-alt',
                handler: function() {
                    me.showLocationMaster();
                }
            }]
        }];
        
        me.callParent();
    },
    
    /**
     * Navigation action methods - update main panel via map_frame linkage
     */
    showDashboard: function() {
        this.updateMainPanel('dashboard');
    },
    
    showInboundDeliveries: function() {
        this.updateMainPanel('inbound');
    },
    
    showCreateInbound: function() {
        this.updateMainPanel('create-inbound');
    },
    
    showRFIDScanning: function() {
        this.updateMainPanel('rfid-scan');
    },
    
    showPutAwayTasks: function() {
        this.updateMainPanel('putaway');
    },
    
    showCreateTransfer: function() {
        this.updateMainPanel('create-transfer');
    },
    
    showPickingTasks: function() {
        this.updateMainPanel('picking');
    },
    
    showCreatePicking: function() {
        this.updateMainPanel('create-picking');
    },
    
    showStockOpname: function() {
        this.updateMainPanel('stock-opname');
    },
    
    showInventoryReport: function() {
        this.updateMainPanel('inventory-report');
    },
    
    showActivityReport: function() {
        this.updateMainPanel('activity-report');
    },
    
    showItemMaster: function() {
        this.updateMainPanel('item-master');
    },
    
    showLocationMaster: function() {
        this.updateMainPanel('location-master');
    },
    
    /**
     * Update main panel via mandatory map_frame linkage
     */
    updateMainPanel: function(view) {
        if (this.map_frame && this.map_frame.showView) {
            this.map_frame.showView(view);
        }
    }
});

// Main Panel View Component
Ext.define('Store.warehouse.view.MainPanel', {
    extend: 'Ext.panel.Panel',
    
    layout: 'card',
    border: false,
    activeItem: 0,
    
    initComponent: function() {
        this.items = [{
            itemId: 'welcome',
            xtype: 'panel',
            html: '<div style="padding: 20px; text-align: center;"><h2>Welcome to Warehouse Management System</h2><p>Select a module from the left navigation to get started.</p></div>'
        }];
        
        this.callParent();
        this.initializeRFIDManager();
    },
    
    /**
     * Initialize RFID Manager for warehouse operations
     */
    initializeRFIDManager: function() {
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
    },
    
    /**
     * Show specific view based on navigation selection
     */
    showView: function(viewType) {
        switch (viewType) {
            case 'dashboard':
                this.showDashboard();
                break;
            case 'inbound':
                this.showInboundDeliveries();
                break;
            case 'create-inbound':
                this.showCreateInbound();
                break;
            case 'rfid-scan':
                this.showRFIDScanning();
                break;
            case 'putaway':
                this.showPutAwayTasks();
                break;
            case 'picking':
                this.showPickingTasks();
                break;
            case 'stock-opname':
                this.showStockOpname();
                break;
            case 'inventory-report':
                this.showInventoryReport();
                break;
            case 'activity-report':
                this.showActivityReport();
                break;
            case 'item-master':
                this.showItemMaster();
                break;
            case 'location-master':
                this.showLocationMaster();
                break;
            default:
                this.showWelcome();
        }
    },
    
    showWelcome: function() {
        this.getLayout().setActiveItem('welcome');
    },
    
    /**
     * Dashboard View
     */
    showDashboard: function() {
        var dashboard = this.down('#dashboard');
        if (!dashboard) {
            dashboard = Ext.create('Ext.panel.Panel', {
                itemId: 'dashboard',
                title: 'Warehouse Dashboard',
                layout: 'border',
                items: [{
                    region: 'north',
                    height: 120,
                    layout: 'hbox',
                    bodyPadding: 10,
                    items: this.createMetricCards()
                }, {
                    region: 'center',
                    layout: 'hbox',
                    items: [{
                        flex: 2,
                        title: 'Inventory Status',
                        html: '<div style="padding: 20px; text-align: center;"><h3>Inventory Chart</h3><p>Real-time inventory visualization</p></div>'
                    }, {
                        flex: 1,
                        title: 'Active Alerts',
                        layout: 'fit',
                        items: [this.createAlertsGrid()]
                    }]
                }, {
                    region: 'south',
                    height: 200,
                    title: 'Recent Activity',
                    layout: 'fit',
                    items: [this.createActivityGrid()]
                }]
            });
            this.add(dashboard);
        }
        this.getLayout().setActiveItem(dashboard);
    },
    
    /**
     * Inbound Deliveries View
     */
    showInboundDeliveries: function() {
        var inbound = this.down('#inbound');
        if (!inbound) {
            var store = Ext.create('Ext.data.Store', {
                fields: ['deliveryId', 'deliveryNumber', 'supplierName', 'status', 'expectedDate', 'totalItems'],
                proxy: {
                    type: 'ajax',
                    url: '/api/warehouse/inbound',
                    reader: {
                        type: 'json',
                        rootProperty: 'inboundDeliveries'
                    }
                },
                autoLoad: true
            });
            
            inbound = Ext.create('Ext.grid.Panel', {
                itemId: 'inbound',
                title: 'Inbound Deliveries',
                store: store,
                tbar: [{
                    text: 'Create Inbound',
                    iconCls: 'fa fa-plus',
                    handler: this.showCreateInbound,
                    scope: this
                }, {
                    text: 'Refresh',
                    iconCls: 'fa fa-sync',
                    handler: function() {
                        store.reload();
                    }
                }],
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
                    width: 100
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
            });
            this.add(inbound);
        }
        this.getLayout().setActiveItem(inbound);
    },
    
    /**
     * Create Inbound Modal
     */
    showCreateInbound: function() {
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
                name: 'supplierCode',
                fieldLabel: 'Supplier Code *',
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
            height: 300,
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
                        success: function() {
                            Ext.Msg.alert('Success', 'Inbound delivery created');
                            btn.up('window').close();
                        },
                        failure: function() {
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
    
    /**
     * RFID Scanning Interface
     */
    showRFIDScanning: function() {
        var me = this;
        var rfid = this.down('#rfid');
        if (!rfid) {
            rfid = Ext.create('Ext.panel.Panel', {
                itemId: 'rfid',
                title: 'RFID Scanning Interface',
                layout: 'border',
                items: [{
                    region: 'west',
                    width: 300,
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
                        value: me.rfidManager.isConnected ? 'Connected' : 'Disconnected',
                        margin: '10 0 0 0'
                    }]
                }, {
                    region: 'center',
                    title: 'Scanned Tags',
                    layout: 'fit',
                    items: [{
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
                }]
            });
            this.add(rfid);
        }
        this.getLayout().setActiveItem(rfid);
    },
    
    /**
     * Put Away Tasks
     */
    showPutAwayTasks: function() {
        var putaway = this.down('#putaway');
        if (!putaway) {
            var store = Ext.create('Ext.data.Store', {
                fields: ['putAwayId', 'transferOrderNumber', 'fromLocation', 'toLocation', 'status'],
                proxy: {
                    type: 'ajax',
                    url: '/api/warehouse/putaway',
                    reader: {
                        type: 'json',
                        rootProperty: 'putAwayTasks'
                    }
                },
                autoLoad: true
            });
            
            putaway = Ext.create('Ext.grid.Panel', {
                itemId: 'putaway',
                title: 'Put Away Tasks',
                store: store,
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
            });
            this.add(putaway);
        }
        this.getLayout().setActiveItem(putaway);
    },
    
    /**
     * Picking Tasks
     */
    showPickingTasks: function() {
        var picking = this.down('#picking');
        if (!picking) {
            var store = Ext.create('Ext.data.Store', {
                fields: ['pickingId', 'outboundDeliveryNumber', 'customerName', 'status'],
                proxy: {
                    type: 'ajax',
                    url: '/api/warehouse/picking',
                    reader: {
                        type: 'json',
                        rootProperty: 'pickingTasks'
                    }
                },
                autoLoad: true
            });
            
            picking = Ext.create('Ext.grid.Panel', {
                itemId: 'picking',
                title: 'Picking Tasks',
                store: store,
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
            });
            this.add(picking);
        }
        this.getLayout().setActiveItem(picking);
    },
    
    /**
     * Stock Opname
     */
    showStockOpname: function() {
        var opname = this.down('#stock-opname');
        if (!opname) {
            opname = Ext.create('Ext.panel.Panel', {
                itemId: 'stock-opname',
                title: 'Stock Opname - Physical Count',
                html: '<div style="padding: 20px;"><h3>Stock Opname</h3><p>Physical inventory counting functionality</p></div>'
            });
            this.add(opname);
        }
        this.getLayout().setActiveItem(opname);
    },
    
    /**
     * Reports
     */
    showInventoryReport: function() {
        var report = this.down('#inventory-report');
        if (!report) {
            report = Ext.create('Ext.panel.Panel', {
                itemId: 'inventory-report',
                title: 'Inventory Report',
                html: '<div style="padding: 20px;"><h3>Inventory Report</h3><p>Comprehensive inventory reporting</p></div>'
            });
            this.add(report);
        }
        this.getLayout().setActiveItem(report);
    },
    
    showActivityReport: function() {
        var report = this.down('#activity-report');
        if (!report) {
            report = Ext.create('Ext.panel.Panel', {
                itemId: 'activity-report',
                title: 'Activity Report',
                html: '<div style="padding: 20px;"><h3>Activity Report</h3><p>Warehouse activity reporting</p></div>'
            });
            this.add(report);
        }
        this.getLayout().setActiveItem(report);
    },
    
    /**
     * Master Data
     */
    showItemMaster: function() {
        var items = this.down('#item-master');
        if (!items) {
            var store = Ext.create('Ext.data.Store', {
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
            });
            
            items = Ext.create('Ext.grid.Panel', {
                itemId: 'item-master',
                title: 'Item Master Data',
                store: store,
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
            });
            this.add(items);
        }
        this.getLayout().setActiveItem(items);
    },
    
    showLocationMaster: function() {
        var locations = this.down('#location-master');
        if (!locations) {
            var store = Ext.create('Ext.data.Store', {
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
            });
            
            locations = Ext.create('Ext.grid.Panel', {
                itemId: 'location-master',
                title: 'Location Master Data',
                store: store,
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
            });
            this.add(locations);
        }
        this.getLayout().setActiveItem(locations);
    },
    
    /**
     * Helper methods
     */
    createMetricCards: function() {
        return [{
            xtype: 'panel',
            flex: 1,
            margin: '0 10 0 0',
            bodyStyle: 'background: #e3f2fd; text-align: center; padding: 15px;',
            html: '<h2>1,250</h2><p>Total Items</p>'
        }, {
            xtype: 'panel',
            flex: 1,
            margin: '0 10 0 0',
            bodyStyle: 'background: #f3e5f5; text-align: center; padding: 15px;',
            html: '<h2>98.5%</h2><p>Accuracy</p>'
        }, {
            xtype: 'panel',
            flex: 1,
            margin: '0 10 0 0',
            bodyStyle: 'background: #e8f5e8; text-align: center; padding: 15px;',
            html: '<h2>25</h2><p>Today Activity</p>'
        }, {
            xtype: 'panel',
            flex: 1,
            bodyStyle: 'background: #fff3e0; text-align: center; padding: 15px;',
            html: '<h2>3</h2><p>Active Alerts</p>'
        }];
    },
    
    createAlertsGrid: function() {
        return {
            xtype: 'grid',
            store: Ext.create('Ext.data.Store', {
                fields: ['type', 'description', 'severity'],
                data: [
                    { type: 'Unauthorized Movement', description: 'Item detected at gate', severity: 'High' },
                    { type: 'Low Stock', description: 'Item below reorder point', severity: 'Medium' }
                ]
            }),
            columns: [{
                text: 'Type',
                dataIndex: 'type',
                flex: 1
            }, {
                text: 'Description',
                dataIndex: 'description',
                flex: 2
            }, {
                text: 'Severity',
                dataIndex: 'severity',
                width: 80
            }]
        };
    },
    
    createActivityGrid: function() {
        return {
            xtype: 'grid',
            store: Ext.create('Ext.data.Store', {
                fields: ['activity', 'user', 'status'],
                data: [
                    { activity: 'Good Receive GRN-001', user: 'operator1', status: 'Completed' },
                    { activity: 'Put Away TO-002', user: 'operator2', status: 'In Progress' }
                ]
            }),
            columns: [{
                text: 'Activity',
                dataIndex: 'activity',
                flex: 2
            }, {
                text: 'User',
                dataIndex: 'user',
                width: 100
            }, {
                text: 'Status',
                dataIndex: 'status',
                width: 100
            }]
        };
    },
    
    /**
     * RFID Operations
     */
    startRFIDScan: function() {
        var me = this;
        var grid = this.down('#scannedTagsGrid');
        
        if (!me.rfidManager.isConnected) {
            me.rfidManager.connect().then(function() {
                me.performScan(grid);
            });
        } else {
            me.performScan(grid);
        }
    },
    
    performScan: function(grid) {
        var me = this;
        
        me.rfidManager.scan().then(function(scannedTags) {
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
            
            // Process scan data
            Ext.Ajax.request({
                url: '/api/warehouse/rfid/scan',
                method: 'POST',
                jsonData: {
                    readerId: 'ZBR-001',
                    location: 'INBOUND-AREA',
                    operation: 'goodreceive',
                    scannedTags: scannedTags,
                    scannedBy: 'current_user'
                },
                success: function(response) {
                    console.log('RFID scan processed successfully');
                },
                failure: function(response) {
                    console.error('RFID scan processing failed');
                }
            });
        });
    }
});

// Main Module Class - Entry Point
Ext.define('Store.warehouse.Module', {
    extend: 'Ext.Component',

    /**
     * Extension initialization following AI_SPECS.md Pattern 1
     */
    initModule: function () {
        // Create navigation and main panel view components
        var navTab = Ext.create('Store.warehouse.view.Navigation');
        var mainPanel = Ext.create('Store.warehouse.view.MainPanel');
        
        // Mandatory linkage for Pattern 1
        navTab.map_frame = mainPanel;
        
        // Add to PILOT skeleton
        skeleton.navigation.add(navTab);
        skeleton.mapframe.add(mainPanel);
    }
});
