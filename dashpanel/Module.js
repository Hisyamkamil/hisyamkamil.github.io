Ext.define('Store.dashpanel.Module', {
    extend: 'Ext.Component',

    initModule: function () {
        var me = this;
        
        console.log('Dashpanel V2 (Sub-panel in Online Navigation) extension initializing...');
        
        // Store reference for later use
        window.dashpanelModule = me;
        
        // Add sub-panel to existing Online navigation (left side)
        me.addSubPanelToOnlineNavigation();
    },
    
    addSubPanelToOnlineNavigation: function() {
        var me = this;
        
        // Access existing Online navigation panel
        if (skeleton && skeleton.navigation && skeleton.navigation.online) {
            var onlinePanel = skeleton.navigation.online;
            
            console.log('Found existing Online panel, adding Dashboard sub-panel...');
            
            // Create vehicle tree for dashboard (sub-panel in Online navigation)
            var dashboardSubPanel = Ext.create('Ext.panel.Panel', {
                title: 'Dashboard Panel',
                iconCls: 'fa fa-tachometer-alt',
                layout: 'fit',
                height: 300,
                collapsible: true,
                split: true,
                
                items: [{
                    xtype: 'treepanel',
                    title: 'Vehicles for Dashboard',
                    tools:[{
                        xtype:'button',
                        iconCls: 'fa fa-rotate',
                        tooltip: 'Refresh',
                        handler: function () {
                            this.up('treepanel').getStore().load();
                        }
                    }],
                    rootVisible: false,
                    useArrows: true,
                    border: false,
                    // Load vehicles from PILOT API
                    store: Ext.create('Ext.data.TreeStore', {
                        proxy: {
                            type: 'ajax',
                            url: '/ax/tree.php?vehs=1&state=1'
                        },
                        root: {
                            text: 'Vehicles',
                            expanded: true
                        },
                        autoLoad: true
                    }),
                    columns: [{
                        text: 'Vehicle',
                        xtype:'treecolumn',
                        dataIndex: 'name',
                        flex: 2,
                        renderer: function(value) {
                            return value || 'Unknown';
                        }
                    }, {
                        text: 'Status',
                        dataIndex: 'state',
                        width: 70,
                        renderer: function(value) {
                            if (value === 1) {
                                return '<span style="color: green;">●</span>';
                            }
                            return '<span style="color: red;">●</span>';
                        }
                    }],
                    listeners: {
                        selectionchange: function(tree, selected) {
                            if (selected.length > 0) {
                                var record = selected[0];
                                if (record.get('leaf') && (record.get('id') || record.get('vehicle_id'))) {
                                    var vehicleId = record.get('id') || record.get('vehicle_id');
                                    var vehicleName = record.get('name') || record.get('text') || 'Unknown Vehicle';
                                    me.showMainPanelWithMap(vehicleId, vehicleName, record);
                                }
                            }
                        }
                    }
                }]
            });
            
            // Add sub-panel to existing Online navigation
            if (onlinePanel.add) {
                onlinePanel.add(dashboardSubPanel);
                console.log('✅ Dashboard sub-panel added to Online navigation');
            } else {
                console.error('❌ Cannot add sub-panel to Online navigation');
            }
            
        } else {
            console.error('❌ Online navigation not available');
        }
    },
    
    showMainPanelWithMap: function(vehicleId, vehicleName, vehicleRecord) {
        var me = this;
        
        console.log('🚗 Showing main panel with map for vehicle:', vehicleName, 'ID:', vehicleId);
        
        // Check if main panel already exists
        var existingPanel = Ext.getCmp('dashpanel-main-v2');
        if (existingPanel) {
            console.log('Main panel exists, updating with new vehicle data');
            existingPanel.loadVehicleData(vehicleId, vehicleName, vehicleRecord);
            return;
        }
        
        // Create hybrid main panel: Map (top) + Sensors (bottom) 
        var mainPanel = Ext.create('Store.dashpanel.view.MainPanelV2', {
            id: 'dashpanel-main-v2'
        });
        
        console.log('🔍 Debugging mapframe structure...');
        console.log('skeleton.mapframe:', skeleton.mapframe);
        console.log('skeleton.mapframe methods:', skeleton.mapframe ? Object.keys(skeleton.mapframe).slice(0, 10) : 'N/A');
        
        // Try alternative approaches to create main panel (not modal)
        console.log('⚠️ Trying alternative main panel integration...');
        
        try {
            // Approach 1: Replace mapframe content entirely
            if (skeleton.mapframe.removeAll && skeleton.mapframe.add) {
                skeleton.mapframe.removeAll();
                skeleton.mapframe.add(mainPanel);
                console.log('✅ Replaced mapframe content with MainPanelV2');
                mainPanel.loadVehicleData(vehicleId, vehicleName, vehicleRecord);
                return;
            }
            
            // Approach 2: Use items collection directly
            if (skeleton.mapframe.items) {
                skeleton.mapframe.items.clear();
                skeleton.mapframe.items.add(mainPanel);
                skeleton.mapframe.doLayout();
                console.log('✅ Added MainPanelV2 via items collection');
                mainPanel.loadVehicleData(vehicleId, vehicleName, vehicleRecord);
                return;
            }
            
            // Approach 3: Direct DOM rendering
            if (skeleton.mapframe.body) {
                skeleton.mapframe.body.update('');
                mainPanel.render(skeleton.mapframe.body);
                console.log('✅ Rendered MainPanelV2 to mapframe body');
                mainPanel.loadVehicleData(vehicleId, vehicleName, vehicleRecord);
                return;
            }
            
            throw new Error('No suitable integration method found');
            
        } catch (e) {
            console.error('❌ All main panel approaches failed:', e);
            console.error('Available mapframe methods:', Object.keys(skeleton.mapframe));
            
            Ext.Msg.alert('Integration Issue',
                'Unable to integrate main panel with this PILOT version.<br>' +
                'Available methods: ' + Object.keys(skeleton.mapframe).join(', '));
        }
    },
    
    showModalWithMapAndSensors: function(vehicleId, vehicleName, vehicleRecord) {
        var me = this;
        
        console.log('📱 Creating modal with map + sensors for:', vehicleName);
        
        // Close existing modal if open
        var existingModal = Ext.getCmp('dashpanel-main-modal-v2');
        if (existingModal) {
            existingModal.close();
        }
        
        // Create modal window with map + sensors
        var mainModal = Ext.create('Ext.window.Window', {
            id: 'dashpanel-main-modal-v2',
            title: '🔧 Dashboard Panel V2 - ' + vehicleName,
            width: 1200,
            height: 800,
            layout: 'border',
            modal: true,
            maximizable: true,
            closable: true,
            
            items: [{
                // Top: Map area (reduced height to ensure sensor panel shows)
                region: 'north',
                title: 'Vehicle Location - ' + vehicleName,
                height: 250,
                split: true,
                html: '<div style="padding: 20px; text-align: center; background: #e8f4fd; height: 100%;">' +
                      '<i class="fa fa-map-marker-alt" style="font-size: 48px; color: #dc3545; margin-bottom: 15px;"></i>' +
                      '<h3 style="margin: 10px 0;">' + vehicleName + '</h3>' +
                      '<p><strong>ID:</strong> ' + vehicleId + ' | <strong>Location:</strong> ' + (vehicleRecord.get('lat') || 'N/A') + ', ' + (vehicleRecord.get('lon') || 'N/A') + '</p>' +
                      '<p><strong>Status:</strong> ' + (vehicleRecord.get('state') === 1 ? '<span style="color: green;">●Online</span>' : '<span style="color: red;">●Offline</span>') + '</p>' +
                      '</div>'
            }, {
                // Bottom: Sensor panel (center region to ensure it shows)
                region: 'center',
                title: 'Live Sensor Data - Real-time (0.5s)',
                layout: 'fit',
                split: true,
                items: [{
                    xtype: 'grid',
                    itemId: 'sensorGrid',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['sensor_name', 'sensor_type', 'current_value', 'unit', 'status', 'last_update'],
                        data: []
                    }),
                    columns: [{
                        text: 'Sensor Name',
                        dataIndex: 'sensor_name',
                        flex: 3,
                        renderer: function(value, meta, record) {
                            var iconClass = me.getSensorIcon(record.get('sensor_type'));
                            return '<i class="' + iconClass + '" style="margin-right: 5px;"></i>' + value;
                        }
                    }, {
                        text: 'Value',
                        dataIndex: 'current_value',
                        width: 120,
                        renderer: function(value, meta, record) {
                            var unit = record.get('unit') || '';
                            var status = record.get('status');
                            
                            // Color coding
                            var color = status === 'critical' ? '#ff0000' :
                                       status === 'warning' ? '#ff8c00' : '#008000';
                            
                            var formattedValue = typeof value === 'number' ?
                                               Ext.util.Format.number(value, '0.##') : value;
                            
                            return '<span style="color: ' + color + '; font-weight: bold;">' + formattedValue + ' ' + unit + '</span>';
                        }
                    }, {
                        text: 'Status',
                        dataIndex: 'status',
                        width: 80,
                        renderer: function(value) {
                            var icon = value === 'critical' ? 'fa fa-times-circle' :
                                      value === 'warning' ? 'fa fa-exclamation-triangle' : 'fa fa-check-circle';
                            var color = value === 'critical' ? 'red' :
                                       value === 'warning' ? 'orange' : 'green';
                            return '<i class="' + icon + '" style="color: ' + color + ';"></i> ' +
                                   (value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown');
                        }
                    }, {
                        text: 'Last Update',
                        dataIndex: 'last_update',
                        width: 140,
                        renderer: function(value) {
                            return value ? Ext.Date.format(new Date(value), 'Y-m-d H:i:s') : '-';
                        }
                    }],
                    viewConfig: {
                        emptyText: 'Loading sensor data...',
                        deferEmptyText: false
                    }
                }]
            }],
            
            listeners: {
                afterrender: function() {
                    console.log('🚀 Modal rendered, loading sensor data...');
                    
                    var sensorGrid = mainModal.down('#sensorGrid');
                    console.log('🔍 Sensor grid found:', !!sensorGrid);
                    
                    if (sensorGrid) {
                        // Load some test data first to ensure grid is visible
                        sensorGrid.getStore().loadData([{
                            sensor_name: 'Loading...',
                            sensor_type: 'info',
                            current_value: 'Please wait',
                            unit: '',
                            status: 'normal',
                            last_update: new Date()
                        }]);
                        
                        // Then load real data
                        Ext.defer(function() {
                            me.loadSensorData(vehicleId, sensorGrid);
                            me.startRefresh(vehicleId, sensorGrid);
                        }, 500);
                    } else {
                        console.error('❌ Sensor grid not found in modal');
                    }
                },
                close: function() {
                    console.log('🚪 Modal closing, stopping refresh...');
                    me.stopRefresh();
                }
            }
        });
        
        mainModal.show();
    },
    
    loadSensorData: function(vehicleId, grid) {
        var me = this;
        
        Ext.Ajax.request({
            url: '/backend/ax/current_data.php',
            success: function(response) {
                try {
                    var data = Ext.decode(response.responseText);
                    var vehicle = null;
                    
                    if (data && data.objects) {
                        Ext.each(data.objects, function(obj) {
                            if (obj.id == vehicleId) {
                                vehicle = obj;
                                return false;
                            }
                        });
                    }
                    
                    if (vehicle && vehicle.sensors) {
                        var sensors = [];
                        Ext.Object.each(vehicle.sensors, function(name, value) {
                            var parts = value.split('|');
                            if (parts.length >= 4) {
                                sensors.push({
                                    sensor_name: name,
                                    sensor_type: 'generic',
                                    current_value: parts[3],
                                    unit: me.extractUnit(parts[0]),
                                    status: 'normal',
                                    last_update: new Date(parseInt(parts[1]) * 1000)
                                });
                            }
                        });
                        
                        console.log('✅ Loading', sensors.length, 'sensors');
                        grid.getStore().loadData(sensors);
                    }
                } catch (e) {
                    console.error('❌ Parse error:', e);
                }
            }
        });
    },
    
    startRefresh: function(vehicleId, grid) {
        var me = this;
        me.stopRefresh();
        me.refreshTask = setInterval(function() {
            me.loadSensorData(vehicleId, grid);
        }, 500);
    },
    
    stopRefresh: function() {
        if (this.refreshTask) {
            clearInterval(this.refreshTask);
            this.refreshTask = null;
        }
    },
    
    extractUnit: function(humValue) {
        if (!humValue) return '';
        var matches = humValue.toString().match(/([a-zA-Z°%]+)$/);
        return matches ? matches[1] : '';
    }
});
