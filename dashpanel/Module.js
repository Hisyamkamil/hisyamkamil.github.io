Ext.define('Store.dashpanel.Module', {
    extend: 'Ext.Component',

    initModule: function () {
        var me = this;
        
        console.log('Dashpanel V2 (Sub-panel + MainPanelV2) extension initializing...');
        
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
                                    me.showMainPanelV2(vehicleId, vehicleName, record);
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
    
    showMainPanelV2: function(vehicleId, vehicleName, vehicleRecord) {
        var me = this;
        
        console.log('🚗 Vehicle selected from sub-panel:', vehicleName, 'ID:', vehicleId);
        console.log('🔍 Will show MainPanelV2 in main content area...');
        
        // Check if MainPanelV2 already exists
        var existingPanel = Ext.getCmp('dashpanel-main-v2');
        if (existingPanel) {
            console.log('✅ MainPanelV2 exists, updating with new vehicle');
            existingPanel.loadVehicleData(vehicleId, vehicleName, vehicleRecord);
            return;
        }
        
        // Create MainPanelV2 component (map + sensors)
        console.log('🚀 Creating MainPanelV2 component...');
        var mainPanel = Ext.create('Store.dashpanel.view.MainPanelV2', {
            id: 'dashpanel-main-v2'
        });
        
        console.log('📊 MainPanelV2 created, adding to main content area...');
        
        // Create overlay sensor panel (foreground) while map stays in background
        console.log('🎯 Creating overlay sensor panel (map stays as background)...');
        
        me.createOverlaySensorPanel(vehicleId, vehicleName, vehicleRecord);
    },
    
    createOverlaySensorPanel: function(vehicleId, vehicleName, vehicleRecord) {
        var me = this;
        
        // Close existing overlay if present
        var existingOverlay = Ext.getCmp('dashpanel-sensor-overlay');
        if (existingOverlay) {
            existingOverlay.destroy();
        }
        
        // Create floating sensor panel that overlays the map
        var sensorOverlay = Ext.create('Ext.panel.Panel', {
            id: 'dashpanel-sensor-overlay',
            title: '🔧 Dashboard Panel - ' + vehicleName + ' (Real-time)',
            width: 800,
            height: 400,
            floating: true,
            closable: true,
            collapsible: true,
            resizable: true,
            draggable: true,
            shadow: true,
            layout: 'fit',
            
            // Position at bottom-center of screen
            x: (Ext.getBody().getViewSize().width - 800) / 2,
            y: Ext.getBody().getViewSize().height - 450,
            
            items: [{
                xtype: 'grid',
                store: Ext.create('Ext.data.Store', {
                    fields: [
                        'sensor_name',
                        'sensor_type',
                        'current_value',
                        'unit',
                        'status',
                        'last_update',
                        'human_value'
                    ],
                    data: []
                }),
                columns: [{
                    text: 'Sensor Name',
                    dataIndex: 'sensor_name',
                    flex: 2,
                    renderer: function(value, meta, record) {
                        var iconClass = me.getSensorIcon(record.get('sensor_type'));
                        return '<i class="' + iconClass + '"></i> ' + value;
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
                        return '<i class="' + icon + '" style="color: ' + color + ';"></i>';
                    }
                }, {
                    text: 'Last Update',
                    dataIndex: 'last_update',
                    width: 140,
                    renderer: function(value) {
                        return value ? Ext.Date.format(new Date(value), 'H:i:s') : '-';
                    }
                }],
                viewConfig: {
                    emptyText: 'Loading sensor data...',
                    deferEmptyText: false
                }
            }],
            
            tbar: [{
                text: 'Refresh',
                iconCls: 'fa fa-refresh',
                handler: function() {
                    me.loadOverlaySensorData(vehicleId, sensorOverlay.down('grid'));
                }
            }, '->', {
                xtype: 'tbtext',
                text: 'Real-time (0.5s)',
                style: 'color: #666; font-size: 11px;'
            }],
            
            listeners: {
                afterrender: function() {
                    console.log('🚀 Overlay sensor panel rendered');
                    me.loadOverlaySensorData(vehicleId, sensorOverlay.down('grid'));
                    me.startOverlayRefresh(vehicleId, sensorOverlay.down('grid'));
                },
                close: function() {
                    console.log('🚪 Overlay panel closed');
                    me.stopOverlayRefresh();
                },
                collapse: function() {
                    console.log('📦 Overlay panel collapsed - map visible');
                },
                expand: function() {
                    console.log('📂 Overlay panel expanded');
                }
            }
        });
        
        // Show the floating overlay panel
        sensorOverlay.show();
        console.log('✅ Sensor overlay panel created (map stays as background)');
        
        // Store reference
        me.currentOverlay = sensorOverlay;
    },
    
    loadOverlaySensorData: function(vehicleId, grid) {
        var me = this;
        
        console.log('🔄 Loading sensor data for overlay panel...');
        
        Ext.Ajax.request({
            url: '/backend/ax/current_data.php',
            success: function(response) {
                try {
                    var data = Ext.decode(response.responseText);
                    me.processOverlaySensorData(data, vehicleId, grid);
                } catch (e) {
                    console.error('❌ API parse error:', e);
                }
            },
            failure: function() {
                console.warn('❌ API failed');
            }
        });
    },
    
    processOverlaySensorData: function(data, vehicleId, grid) {
        var me = this;
        var sensorArray = [];
        
        if (data && data.c === 0 && Ext.isArray(data.objects)) {
            var vehicle = null;
            Ext.each(data.objects, function(obj) {
                if (obj.id == vehicleId) {
                    vehicle = obj;
                    return false;
                }
            });
            
            if (vehicle && vehicle.sensors) {
                Ext.Object.each(vehicle.sensors, function(name, value) {
                    var parts = value.split('|');
                    if (parts.length >= 4) {
                        sensorArray.push({
                            sensor_name: name,
                            sensor_type: me.determineSensorType(name),
                            current_value: parseFloat(parts[3]),
                            unit: me.extractUnit(parts[0]),
                            status: me.calculateSensorStatus(parseFloat(parts[3]), me.determineSensorType(name)),
                            last_update: new Date(parseInt(parts[1]) * 1000),
                            human_value: parts[0]
                        });
                    }
                });
            }
        }
        
        console.log('✅ Processed', sensorArray.length, 'sensors for overlay');
        grid.getStore().loadData(sensorArray);
    },
    
    startOverlayRefresh: function(vehicleId, grid) {
        var me = this;
        
        me.stopOverlayRefresh();
        
        me.overlayRefreshTask = setInterval(function() {
            me.loadOverlaySensorData(vehicleId, grid);
        }, 500);
        
        console.log('🔄 Overlay real-time refresh started (0.5s)');
    },
    
    stopOverlayRefresh: function() {
        var me = this;
        
        if (me.overlayRefreshTask) {
            clearInterval(me.overlayRefreshTask);
            me.overlayRefreshTask = null;
            console.log('Overlay refresh stopped');
        }
    },
    
    // Helper methods
    determineSensorType: function(name) {
        if (!name) return 'generic';
        var n = name.toLowerCase();
        if (n.includes('temp')) return 'temperature';
        if (n.includes('fuel') || n.includes('level')) return 'level';
        if (n.includes('voltage')) return 'voltage';
        if (n.includes('pressure')) return 'pressure';
        if (n.includes('speed')) return 'speed';
        return 'generic';
    },
    
    extractUnit: function(humValue) {
        if (!humValue) return '';
        var matches = humValue.toString().match(/([a-zA-Z°%]+)$/);
        return matches ? matches[1] : '';
    },
    
    calculateSensorStatus: function(value, sensorType) {
        if (value === null || value === undefined) return 'normal';
        
        switch (sensorType) {
            case 'temperature':
                if (value > 100 || value < -20) return 'critical';
                if (value > 80 || value < 0) return 'warning';
                return 'normal';
            case 'voltage':
                if (value > 15 || value < 10) return 'critical';
                if (value > 14 || value < 11) return 'warning';
                return 'normal';
            case 'level':
                if (value < 5) return 'critical';
                if (value < 15) return 'warning';
                return 'normal';
            default:
                return 'normal';
        }
    },
    
    getSensorIcon: function(type) {
        switch(type) {
            case 'temperature': return 'fa fa-thermometer-half';
            case 'level': return 'fa fa-battery-half';
            case 'voltage': return 'fa fa-bolt';
            case 'pressure': return 'fa fa-tachometer-alt';
            case 'speed': return 'fa fa-speedometer';
            case 'engine': return 'fa fa-cog';
            default: return 'fa fa-microchip';
        }
    }
});
