/**
 * Warehouse Management System with Zebra RFID Integration
 * PILOT Extension for comprehensive warehouse operations
 */
Ext.define('Store.warehouse.Module', {
    extend: 'Ext.Component',

    /**
     * Extension initialization - creates navigation and main panel
     * Follows AI_SPECS.md Pattern 1 (Navigation tab + Main panel)
     */
    initModule: function () {
        // Create navigation panel with warehouse modules
        var navTab = this.createNavigationPanel();
        
        // Create main content panel (mapframe)
        var mainPanel = this.createMainPanel();
        
        // Mandatory linkage for Pattern 1
        navTab.map_frame = mainPanel;
        
        // Add to PILOT skeleton
        skeleton.navigation.add(navTab);
        skeleton.mapframe.add(mainPanel);
        
        // Initialize supporting managers
        this.initializeManagers();
    },

    /**
     * Creates the left navigation panel with warehouse modules
     */
    createNavigationPanel: function () {
        var me = this;
        
        return Ext.create('Ext.panel.Panel', {
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
            }]
        });
    },

    /**
     * Creates the main content panel (mapframe)
     */
    createMainPanel: function () {
        return Ext.create('Ext.panel.Panel', {
            layout: 'card',
            border: false,
            activeItem: 0,
            
            items: [{
                xtype: 'panel',
                html: '<div style="padding: 20px; text-align: center;"><h2>Welcome to Warehouse Management System</h2><p>Select a module from the left navigation to get started.</p></div>'
            }]
        });
    },

    /**
     * Initialize RFID and supporting managers
     */
    initializeManagers: function () {
        // Initialize RFID Manager for Zebra integration
        this.rfidManager = {
            isConnected: false,
            currentReader: null,
            
            connect: function() {
                // Simulated RFID connection for demonstration
                console.log('RFID Manager: Connecting to Zebra reader...');
                this.isConnected = true;
                return Promise.resolve(true);
            },
            
            scan: function() {
                // Simulated RFID scanning
                console.log('RFID Manager: Starting scan operation...');
                return new Promise(function(resolve) {
                    setTimeout(function() {
                        // Simulate scanned EPC codes
                        resolve([
                            { epc: '3014257BF7194E4000001A85', rssi: -45, timestamp: new Date() },
                            { epc: '3014257BF7194E4000001A86', rssi: -38, timestamp: new Date() }
                        ]);
                    }, 2000);
                });
            }
        };
        
        // Initialize EPC Generator
        this.epcGenerator = {
            generate: function(itemCode, serialNumber) {
                // Simplified EPC generation for demonstration
                var companyPrefix = '301425'; // Example company prefix
                var itemRef = itemCode.padStart(7, '0');
                var serial = serialNumber.toString(16).padStart(12, '0').toUpperCase();
                return companyPrefix + '7BF7194E' + itemRef.substring(0, 6) + serial;
            }
        };
        
        // Initialize Alert Manager
        this.alertManager = {
            alerts: [],
            
            createAlert: function(type, description, location, itemCode) {
                var alert = {
                    id: 'ALT-' + Date.now(),
                    type: type,
                    description: description,
                    location: location,
                    itemCode: itemCode,
                    timestamp: new Date(),
                    status: 'active',
                    severity: 'medium'
                };
                this.alerts.push(alert);
                return alert;
            },
            
            getActiveAlerts: function() {
                return this.alerts.filter(function(alert) {
                    return alert.status === 'active';
                });
            }
        };
    },

    /**
     * Dashboard - Real-time warehouse metrics and alerts
     */
    showDashboard: function () {
        var mainPanel = this.getMainPanel();
        
        var dashboardPanel = Ext.create('Ext.panel.Panel', {
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
                    layout: 'fit',
                    items: [this.createInventoryChart()]
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
        
        mainPanel.removeAll();
        mainPanel.add(dashboardPanel);
    },

    /**
     * Good Receive - Inbound delivery management
     */
    showInboundDeliveries: function () {
        var me = this;
        var mainPanel = this.getMainPanel();
        
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
        
        var grid = Ext.create('Ext.grid.Panel', {
            title: 'Inbound Deliveries',
            store: store,
            
            tbar: [{
                text: 'Create Inbound',
                iconCls: 'fa fa-plus',
                handler: function() {
                    me.showCreateInbound();
                }
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
            }, {
                text: 'Actions',
                width: 150,
                renderer: function(value, metaData, record) {
                    if (record.get('status') === 'created') {
                        return '<button onclick="Store.warehouseModule.confirmGoodReceive(\'' + 
                               record.get('deliveryId') + '\')">Confirm Receipt</button>';
                    }
                    return '';
                }
            }]
        });
        
        mainPanel.removeAll();
        mainPanel.add(grid);
    },

    /**
     * Create Inbound Delivery Modal
     */
    showCreateInbound: function () {
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
            }, {
                xtype: 'textfield',
                name: 'purchaseOrderNumber',
                fieldLabel: 'PO Number'
            }, {
                xtype: 'textarea',
                name: 'notes',
                fieldLabel: 'Notes',
                height: 60
            }]
        });
        
        var win = Ext.create('Ext.window.Window', {
            title: 'Create Inbound Delivery',
            width: 400,
            height: 350,
            modal: true,
            layout: 'fit',
            items: [form],
            
            buttons: [{
                text: 'Save',
                iconCls: 'fa fa-save',
                formBind: true,
                handler: function() {
                    var formData = form.getValues();
                    me.createInboundDelivery(formData, win);
                }
            }, {
                text: 'Cancel',
                handler: function() {
                    win.close();
                }
            }]
        });
        
        win.show();
    },

    /**
     * Put Away Tasks Management
     */
    showPutAwayTasks: function () {
        var me = this;
        var mainPanel = this.getMainPanel();
        
        var store = Ext.create('Ext.data.Store', {
            fields: ['putAwayId', 'transferOrderNumber', 'fromLocation', 'toLocation', 'status', 'assignedTo', 'totalItems'],
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
        
        var grid = Ext.create('Ext.grid.Panel', {
            title: 'Put Away Tasks',
            store: store,
            
            tbar: [{
                text: 'Create Transfer Order',
                iconCls: 'fa fa-plus',
                handler: function() {
                    me.showCreateTransfer();
                }
            }],
            
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
                width: 100,
                renderer: function(value) {
                    var colors = {
                        'pending': 'orange',
                        'in_progress': 'blue',
                        'completed': 'green'
                    };
                    return '<span style="color: ' + (colors[value] || 'black') + ';">' + 
                           value.replace('_', ' ').toUpperCase() + '</span>';
                }
            }, {
                text: 'Assigned To',
                dataIndex: 'assignedTo',
                width: 120
            }, {
                text: 'Items',
                dataIndex: 'totalItems',
                width: 80
            }, {
                text: 'Actions',
                width: 120,
                renderer: function(value, metaData, record) {
                    var status = record.get('status');
                    if (status === 'pending') {
                        return '<button onclick="Store.warehouseModule.startPutAway(\'' + 
                               record.get('putAwayId') + '\')">Start</button>';
                    } else if (status === 'in_progress') {
                        return '<button onclick="Store.warehouseModule.completePutAway(\'' + 
                               record.get('putAwayId') + '\')">Complete</button>';
                    }
                    return 'Completed';
                }
            }]
        });
        
        mainPanel.removeAll();
        mainPanel.add(grid);
    },

    /**
     * Picking Tasks Management
     */
    showPickingTasks: function () {
        var me = this;
        var mainPanel = this.getMainPanel();
        
        var store = Ext.create('Ext.data.Store', {
            fields: ['pickingId', 'outboundDeliveryNumber', 'customerName', 'deliveryDate', 'status', 'totalItems'],
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
        
        var grid = Ext.create('Ext.grid.Panel', {
            title: 'Picking Tasks',
            store: store,
            
            tbar: [{
                text: 'Create Picking Task',
                iconCls: 'fa fa-plus',
                handler: function() {
                    me.showCreatePicking();
                }
            }],
            
            columns: [{
                text: 'Delivery Number',
                dataIndex: 'outboundDeliveryNumber',
                flex: 1
            }, {
                text: 'Customer',
                dataIndex: 'customerName',
                flex: 2
            }, {
                text: 'Delivery Date',
                dataIndex: 'deliveryDate',
                width: 120,
                xtype: 'datecolumn',
                format: 'Y-m-d'
            }, {
                text: 'Status',
                dataIndex: 'status',
                width: 100,
                renderer: function(value) {
                    var colors = {
                        'pending': 'orange',
                        'picking': 'blue',
                        'completed': 'green'
                    };
                    return '<span style="color: ' + (colors[value] || 'black') + ';">' + 
                           value.toUpperCase() + '</span>';
                }
            }, {
                text: 'Items',
                dataIndex: 'totalItems',
                width: 80
            }, {
                text: 'Actions',
                width: 120,
                renderer: function(value, metaData, record) {
                    var status = record.get('status');
                    if (status === 'pending') {
                        return '<button onclick="Store.warehouseModule.startPicking(\'' + 
                               record.get('pickingId') + '\')">Start</button>';
                    } else if (status === 'picking') {
                        return '<button onclick="Store.warehouseModule.completePicking(\'' + 
                               record.get('pickingId') + '\')">Complete</button>';
                    }
                    return 'Completed';
                }
            }]
        });
        
        mainPanel.removeAll();
        mainPanel.add(grid);
    },

    /**
     * RFID Scanning Interface
     */
    showRFIDScanning: function () {
        var me = this;
        var mainPanel = this.getMainPanel();
        
        var scanPanel = Ext.create('Ext.panel.Panel', {
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
                }, {
                    xtype: 'displayfield',
                    fieldLabel: 'Last Scan',
                    value: 'No recent scans',
                    itemId: 'lastScanField'
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
                        text: 'Item Code',
                        dataIndex: 'itemCode',
                        width: 120
                    }, {
                        text: 'Status',
                        dataIndex: 'status',
                        width: 100
                    }]
                }]
            }]
        });
        
        mainPanel.removeAll();
        mainPanel.add(scanPanel);
    },

    /**
     * Stock Opname (Physical Count)
     */
    showStockOpname: function () {
        var mainPanel = this.getMainPanel();
        
        var opnamePanel = Ext.create('Ext.panel.Panel', {
            title: 'Stock Opname - Physical Count',
            layout: 'border',
            
            items: [{
                region: 'north',
                height: 80,
                bodyPadding: 10,
                items: [{
                    xtype: 'toolbar',
                    items: [{
                        text: 'Start Count',
                        iconCls: 'fa fa-play',
                        handler: function() {
                            Ext.Msg.alert('Info', 'Physical count started');
                        }
                    }, {
                        text: 'RFID Bulk Scan',
                        iconCls: 'fa fa-wifi',
                        handler: function() {
                            Ext.Msg.alert('Info', 'RFID bulk scanning initiated');
                        }
                    }]
                }]
            }, {
                region: 'center',
                layout: 'fit',
                items: [{
                    xtype: 'grid',
                    title: 'Inventory Variance Analysis',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['itemCode', 'itemName', 'systemQty', 'physicalQty', 'variance', 'location'],
                        data: [] // Will be loaded from API
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
                        text: 'System Qty',
                        dataIndex: 'systemQty',
                        width: 100
                    }, {
                        text: 'Physical Qty',
                        dataIndex: 'physicalQty',
                        width: 100
                    }, {
                        text: 'Variance',
                        dataIndex: 'variance',
                        width: 100,
                        renderer: function(value) {
                            var color = value === 0 ? 'green' : 'red';
                            return '<span style="color: ' + color + ';">' + value + '</span>';
                        }
                    }, {
                        text: 'Location',
                        dataIndex: 'location',
                        width: 120
                    }]
                }]
            }]
        });
        
        mainPanel.removeAll();
        mainPanel.add(opnamePanel);
    },

    /**
     * Item Master Data Management
     */
    showItemMaster: function () {
        var mainPanel = this.getMainPanel();
        
        var itemGrid = Ext.create('Ext.grid.Panel', {
            title: 'Item Master Data',
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
            
            tbar: [{
                text: 'Add Item',
                iconCls: 'fa fa-plus',
                handler: function() {
                    Ext.Msg.alert('Info', 'Add new item functionality');
                }
            }],
            
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
                text: 'Unit',
                dataIndex: 'unit',
                width: 80
            }, {
                text: 'Status',
                dataIndex: 'status',
                width: 100
            }]
        });
        
        mainPanel.removeAll();
        mainPanel.add(itemGrid);
    },

    /**
     * Location Master Data Management
     */
    showLocationMaster: function () {
        var mainPanel = this.getMainPanel();
        
        var locationGrid = Ext.create('Ext.grid.Panel', {
            title: 'Location Master Data',
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
                text: 'Capacity',
                dataIndex: 'capacity',
                width: 100
            }, {
                text: 'Status',
                dataIndex: 'status',
                width: 100
            }]
        });
        
        mainPanel.removeAll();
        mainPanel.add(locationGrid);
    },

    /**
     * Report Methods - Placeholder implementations
     */
    showInventoryReport: function () {
        var mainPanel = this.getMainPanel();
        var reportPanel = Ext.create('Ext.panel.Panel', {
            title: 'Inventory Report',
            html: '<div style="padding: 20px;"><h3>Inventory Report</h3><p>Comprehensive inventory reporting functionality would be implemented here.</p></div>'
        });
        mainPanel.removeAll();
        mainPanel.add(reportPanel);
    },

    showActivityReport: function () {
        var mainPanel = this.getMainPanel();
        var reportPanel = Ext.create('Ext.panel.Panel', {
            title: 'Activity Report',
            html: '<div style="padding: 20px;"><h3>Activity Report</h3><p>Warehouse activity reporting functionality would be implemented here.</p></div>'
        });
        mainPanel.removeAll();
        mainPanel.add(reportPanel);
    },

    /**
     * Transfer and Picking Methods - Placeholder implementations
     */
    showCreateTransfer: function () {
        Ext.Msg.alert('Info', 'Create Transfer Order functionality would be implemented here.');
    },

    showCreatePicking: function () {
        Ext.Msg.alert('Info', 'Create Picking Task functionality would be implemented here.');
    },

    /**
     * Helper Methods
     */
    
    getMainPanel: function () {
        // Access main panel via navigation linkage
        var nav = skeleton.navigation.getComponent('Store.warehouse.Module');
        return nav ? nav.map_frame : null;
    },

    createMetricCards: function () {
        return [{
            xtype: 'panel',
            flex: 1,
            margin: '0 10 0 0',
            bodyStyle: 'background: #e3f2fd; text-align: center; padding: 15px;',
            html: '<h2 style="margin:0;">1,250</h2><p>Total Items</p>'
        }, {
            xtype: 'panel',
            flex: 1,
            margin: '0 10 0 0',
            bodyStyle: 'background: #f3e5f5; text-align: center; padding: 15px;',
            html: '<h2 style="margin:0;">98.5%</h2><p>Accuracy</p>'
        }, {
            xtype: 'panel',
            flex: 1,
            margin: '0 10 0 0',
            bodyStyle: 'background: #e8f5e8; text-align: center; padding: 15px;',
            html: '<h2 style="margin:0;">25</h2><p>Today Activity</p>'
        }, {
            xtype: 'panel',
            flex: 1,
            bodyStyle: 'background: #fff3e0; text-align: center; padding: 15px;',
            html: '<h2 style="margin:0;">3</h2><p>Active Alerts</p>'
        }];
    },

    createInventoryChart: function () {
        return {
            xtype: 'panel',
            html: '<div style="padding: 20px; text-align: center;"><h3>Inventory Chart Placeholder</h3><p>Real-time inventory visualization would be implemented here</p></div>'
        };
    },

    createAlertsGrid: function () {
        return {
            xtype: 'grid',
            store: Ext.create('Ext.data.Store', {
                fields: ['type', 'description', 'timestamp', 'severity'],
                data: [
                    { type: 'Unauthorized Movement', description: 'Item detected at gate without authorization', timestamp: new Date(), severity: 'High' },
                    { type: 'Low Stock', description: 'Item ABC-123 below reorder point', timestamp: new Date(), severity: 'Medium' }
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

    createActivityGrid: function () {
        return {
            xtype: 'grid',
            store: Ext.create('Ext.data.Store', {
                fields: ['activity', 'user', 'timestamp', 'status'],
                data: [
                    { activity: 'Good Receive GRN-001', user: 'operator1', timestamp: new Date(), status: 'Completed' },
                    { activity: 'Put Away TO-002', user: 'operator2', timestamp: new Date(), status: 'In Progress' }
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
                text: 'Timestamp',
                dataIndex: 'timestamp',
                width: 150,
                renderer: Ext.util.Format.dateRenderer('H:i:s')
            }, {
                text: 'Status',
                dataIndex: 'status',
                width: 100
            }]
        };
    },

    /**
     * API Integration Methods
     */
    
    createInboundDelivery: function (formData, window) {
        var me = this;
        
        Ext.Ajax.request({
            url: '/api/warehouse/inbound',
            method: 'POST',
            jsonData: formData,
            
            success: function (response) {
                var result = Ext.decode(response.responseText);
                Ext.Msg.alert('Success', 'Inbound delivery created successfully');
                window.close();
                // Refresh inbound deliveries grid if visible
                me.showInboundDeliveries();
            },
            
            failure: function (response) {
                Ext.Msg.alert('Error', 'Failed to create inbound delivery');
            }
        });
    },

    startRFIDScan: function () {
        var me = this;
        var scanPanel = me.getMainPanel().down('#scannedTagsGrid');
        
        if (!me.rfidManager.isConnected) {
            me.rfidManager.connect().then(function () {
                me.performScan(scanPanel);
            });
        } else {
            me.performScan(scanPanel);
        }
    },

    performScan: function (grid) {
        var me = this;
        
        me.rfidManager.scan().then(function (scannedTags) {
            // Process scanned tags and update grid
            var store = grid.getStore();
            
            scannedTags.forEach(function (tag) {
                store.add({
                    epc: tag.epc,
                    rssi: tag.rssi + ' dBm',
                    timestamp: tag.timestamp,
                    itemCode: 'ITM-' + Math.floor(Math.random() * 1000), // Demo mapping
                    status: 'Identified'
                });
            });
            
            // Send scan data to backend
            me.processRFIDScan(scannedTags);
        });
    },

    processRFIDScan: function (scannedTags) {
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
            
            success: function (response) {
                var result = Ext.decode(response.responseText);
                console.log('RFID scan processed successfully', result);
            },
            
            failure: function (response) {
                console.error('RFID scan processing failed');
            }
        });
    }
});

// Global reference for button onclick handlers (demonstration purposes)
Store = Store || {};
Store.warehouseModule = null;

// Set global reference after module initialization
Ext.onReady(function() {
    // This will be set when the module is initialized
    if (window.skeleton && skeleton.navigation) {
        var moduleComponent = skeleton.navigation.getComponent('Store.warehouse.Module');
        if (moduleComponent) {
            Store.warehouseModule = moduleComponent;
        }
    }
});
