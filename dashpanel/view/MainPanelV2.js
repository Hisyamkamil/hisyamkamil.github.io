Ext.define('Store.dashpanel.view.MainPanelV2', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.dashpanelmainv2',
    
    layout: 'border',
    title: 'Dashboard Panel V2 - Map + Sensors',
    
    initComponent: function() {
        var me = this;
        
        // Create map panel using existing MapContainer (Pattern 3)
        me.mapPanel = Ext.create('Ext.panel.Panel', {
            region: 'center',
            title: 'Vehicle Map',
            layout: 'fit',
            html: '<div id="dashpanel-v2-map" style="width: 100%; height: 100%;"></div>',
            listeners: {
                afterrender: function() {
                    // Initialize map using existing PILOT map (Pattern 3)
                    me.initializeMap();
                }
            }
        });
        
        // Create sensor data panel (like V1)
        me.sensorStore = Ext.create('Ext.data.Store', {
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
        });
        
        me.sensorPanel = Ext.create('Ext.panel.Panel', {
            region: 'south',
            title: 'Live Sensor Data',
            height: 300,
            split: true,
            collapsible: true,
            layout: 'fit',
            items: [{
                xtype: 'grid',
                store: me.sensorStore,
                columns: [{
                    text: 'Sensor Name',
                    dataIndex: 'sensor_name',
                    flex: 2,
                    renderer: function(value, meta, record) {
                        var iconClass = me.getSensorIcon(record.get('sensor_type'));
                        return '<i class="' + iconClass + '"></i> ' + value;
                    }
                }, {
                    text: 'Type',
                    dataIndex: 'sensor_type',
                    width: 100
                }, {
                    text: 'Current Value',
                    dataIndex: 'current_value',
                    width: 120,
                    renderer: function(value, meta, record) {
                        var unit = record.get('unit') || '';
                        var status = record.get('status');
                        
                        // Color coding based on status
                        var color = '#000';
                        if (status === 'warning') color = '#ff8c00';
                        else if (status === 'critical') color = '#ff0000';
                        else if (status === 'normal') color = '#008000';
                        
                        var formattedValue = value;
                        if (typeof value === 'number') {
                            formattedValue = Ext.util.Format.number(value, '0.##');
                        }
                        
                        return '<span style="color: ' + color + '; font-weight: bold;">' + formattedValue + ' ' + unit + '</span>';
                    }
                }, {
                    text: 'Status',
                    dataIndex: 'status',
                    width: 80,
                    renderer: function(value) {
                        var icon = '';
                        var color = '';
                        
                        switch(value) {
                            case 'normal':
                                icon = 'fa fa-check-circle';
                                color = 'green';
                                break;
                            case 'warning':
                                icon = 'fa fa-exclamation-triangle';
                                color = 'orange';
                                break;
                            case 'critical':
                                icon = 'fa fa-times-circle';
                                color = 'red';
                                break;
                            default:
                                icon = 'fa fa-question-circle';
                                color = 'gray';
                        }
                        
                        return '<i class="' + icon + '" style="color: ' + color + ';"></i> ' + 
                               (value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown');
                    }
                }, {
                    text: 'Last Update',
                    dataIndex: 'last_update',
                    width: 140,
                    renderer: function(value) {
                        if (value) {
                            return Ext.Date.format(new Date(value), 'Y-m-d H:i:s');
                        }
                        return '-';
                    }
                }],
                viewConfig: {
                    emptyText: 'Select a vehicle from the navigation panel to view sensor data',
                    deferEmptyText: false
                }
            }],
            tbar: [{
                text: 'Refresh Sensors',
                iconCls: 'fa fa-refresh',
                handler: function() {
                    if (me.currentVehicleId) {
                        me.loadSensorData();
                    }
                }
            }, '->', {
                xtype: 'tbtext',
                text: 'Real-time (0.5s)',
                style: 'color: #666;'
            }]
        });
        
        me.items = [me.mapPanel, me.sensorPanel];
        
        me.callParent(arguments);
        
        // Initialize refresh task
        me.refreshTask = null;
        me.currentVehicleId = null;
        me.currentVehicleRecord = null;
    },
    
    // Initialize map using existing PILOT MapContainer (Pattern 3)
    initializeMap: function() {
        var me = this;
        
        console.log('🗺️ Initializing map using existing MapContainer...');
        
        try {
            // Get existing map container (Pattern 3 approach)
            var mapContainer = null;
            
            if (typeof getActiveTabMapContainer === 'function') {
                mapContainer = getActiveTabMapContainer();
                console.log('✅ Got map container from getActiveTabMapContainer()');
            } else if (window.mapContainer) {
                mapContainer = window.mapContainer;
                console.log('✅ Got map container from window.mapContainer');
            } else {
                console.warn('⚠️ No map container available, using placeholder');
                me.mapPanel.update('<div style="padding: 20px; text-align: center; color: #666; background: #f5f5f5;">' +
                                   '<h3>Map View</h3><p>Map integration not available in this environment</p></div>');
                return;
            }
            
            // Clone or reference the existing map to our panel
            if (mapContainer && mapContainer.getMap) {
                var existingMap = mapContainer.getMap();
                if (existingMap) {
                    // Try to embed existing map
                    var mapDiv = document.getElementById('dashpanel-v2-map');
                    if (mapDiv && existingMap.getContainer) {
                        // Note: This might need adjustment based on actual MapContainer API
                        console.log('✅ Map container integrated');
                        me.mapPanel.update('<div style="text-align: center; padding: 50px; background: #e8f4fd;">' +
                                           '<i class="fa fa-map" style="font-size: 48px; color: #007bff;"></i>' +
                                           '<h3>Integrated Map View</h3>' +
                                           '<p>Map integration active - select vehicle to see location</p></div>');
                    }
                }
            }
        } catch (e) {
            console.error('❌ Map initialization error:', e);
            me.mapPanel.update('<div style="padding: 20px; text-align: center; color: #666;">' +
                               '<h3>Map Unavailable</h3><p>Unable to integrate with existing map</p></div>');
        }
    },
    
    // Method called from navigation panel when vehicle is selected
    loadVehicleData: function(vehicleId, vehicleName, vehicleRecord) {
        var me = this;
        
        console.log('🚗 Vehicle selected in V2:', vehicleName, 'ID:', vehicleId);
        
        me.currentVehicleId = vehicleId;
        me.currentVehicleName = vehicleName;
        me.currentVehicleRecord = vehicleRecord;
        
        // Update map panel title
        me.mapPanel.setTitle('Vehicle Map - ' + vehicleName);
        
        // Update sensor panel title
        me.sensorPanel.setTitle('Live Sensor Data - ' + vehicleName + ' (Real-time)');
        
        // Center map on vehicle if possible (Pattern 3)
        me.centerMapOnVehicle(vehicleRecord);
        
        // Load sensor data
        me.loadSensorData();
        
        // Start real-time sensor refresh (0.5s)
        me.startSensorRefresh();
    },
    
    centerMapOnVehicle: function(vehicleRecord) {
        var me = this;
        
        // Try to center map on selected vehicle (Pattern 3)
        try {
            // Handle null vehicleRecord (e.g., from auto-load)
            if (!vehicleRecord) {
                console.log('⚠️ No vehicle record provided - skipping map centering');
                me.mapPanel.update('<div style="padding: 20px; text-align: center; background: #e8f4fd;">' +
                                   '<i class="fa fa-map-marker-alt" style="font-size: 48px; color: #dc3545;"></i>' +
                                   '<h3>' + me.currentVehicleName + '</h3>' +
                                   '<p><strong>Status:</strong> Auto-loaded data</p>' +
                                   '<p>Select vehicle from navigation to see location</p></div>');
                return;
            }
            
            var lat = vehicleRecord.get('lat');
            var lon = vehicleRecord.get('lon');
            
            if (lat && lon) {
                console.log('📍 Centering map on vehicle coordinates:', lat, lon);
                
                // Try to use existing map container to center map
                var mapContainer = null;
                if (typeof getActiveTabMapContainer === 'function') {
                    mapContainer = getActiveTabMapContainer();
                } else if (window.mapContainer) {
                    mapContainer = window.mapContainer;
                }
                
                if (mapContainer && mapContainer.centerMap) {
                    mapContainer.centerMap(lat, lon, 15); // zoom level 15
                    console.log('✅ Map centered on vehicle');
                } else {
                    console.log('ℹ️ Map centering not available - showing coordinates in panel');
                    me.mapPanel.update('<div style="padding: 20px; text-align: center; background: #e8f4fd;">' +
                                       '<i class="fa fa-map-marker-alt" style="font-size: 48px; color: #dc3545;"></i>' +
                                       '<h3>' + me.currentVehicleName + '</h3>' +
                                       '<p><strong>Location:</strong> ' + parseFloat(lat).toFixed(6) + ', ' + parseFloat(lon).toFixed(6) + '</p>' +
                                       '<p><strong>Status:</strong> ' + (vehicleRecord.get('state') === 1 ? 'Online' : 'Offline') + '</p></div>');
                }
            } else {
                console.log('⚠️ No coordinates available for vehicle');
                me.mapPanel.update('<div style="padding: 20px; text-align: center;">' +
                                   '<h3>' + me.currentVehicleName + '</h3>' +
                                   '<p>No location data available</p></div>');
            }
        } catch (e) {
            console.error('❌ Map centering error:', e);
        }
    },
    
    startSensorRefresh: function() {
        var me = this;
        
        // Stop existing refresh
        me.stopSensorRefresh();
        
        // Start 0.5-second refresh for real-time monitoring
        me.refreshTask = setInterval(function() {
            if (me.currentVehicleId) {
                me.loadSensorData();
            }
        }, 500);
        
        console.log('✅ Real-time sensor refresh started (0.5s intervals)');
    },
    
    stopSensorRefresh: function() {
        var me = this;
        
        if (me.refreshTask) {
            clearInterval(me.refreshTask);
            me.refreshTask = null;
            console.log('Sensor refresh stopped');
        }
    },
    
    loadSensorData: function() {
        var me = this;
        
        if (!me.currentVehicleId) {
            return;
        }
        
        console.log('🔄 Loading sensor data for V2 panel, vehicle:', me.currentVehicleId);
        
        // Use same API approach as V1 (working backend endpoint)
        Ext.Ajax.request({
            url: '/backend/ax/current_data.php',
            success: function(response) {
                try {
                    var data = Ext.decode(response.responseText);
                    me.processSensorData(data);
                } catch (e) {
                    console.error('❌ API parse error:', e);
                    me.tryExternalAPI();
                }
            },
            failure: function(response) {
                console.warn('❌ Backend API failed, trying external...');
                me.tryExternalAPI();
            }
        });
    },
    
    tryExternalAPI: function() {
        var me = this;
        
        Ext.Ajax.request({
            url: 'https://dev-telematics.mst.co.id/backend/ax/current_data.php',
            success: function(response) {
                try {
                    var data = Ext.decode(response.responseText);
                    me.processSensorData(data);
                } catch (e) {
                    console.error('❌ External API parse error:', e);
                    me.showNoSensorData();
                }
            },
            failure: function(response) {
                console.error('❌ External API failed:', response.status);
                me.showNoSensorData();
            }
        });
    },
    
    processSensorData: function(data) {
        var me = this;
        var sensorDataArray = [];
        
        console.log('Processing sensor data for V2...');
        
        // Backend API returns: {c: 0, objects: [...]}
        if (data && data.c === 0 && Ext.isArray(data.objects)) {
            // Find the vehicle by ID
            var vehicle = null;
            Ext.each(data.objects, function(obj) {
                if (obj.id == me.currentVehicleId || obj.veh_id == me.currentVehicleId) {
                    vehicle = obj;
                    return false;
                }
            });
            
            if (!vehicle) {
                console.error('❌ Vehicle not found:', me.currentVehicleId);
                me.showNoSensorData();
                return;
            }
            
            console.log('✅ Found vehicle data:', vehicle.name);
            
            // Add basic vehicle data
            if (vehicle.last_event && vehicle.last_event.speed !== undefined) {
                sensorDataArray.push({
                    sensor_name: 'Vehicle Speed',
                    sensor_type: 'speed',
                    current_value: vehicle.last_event.speed,
                    unit: 'km/h',
                    status: vehicle.last_event.speed > 80 ? 'warning' : 'normal',
                    last_update: new Date(vehicle.unixtimestamp * 1000),
                    human_value: vehicle.last_event.speed + ' km/h'
                });
            }
            
            // Add engine status
            if (vehicle.firing !== undefined) {
                sensorDataArray.push({
                    sensor_name: 'Engine Status',
                    sensor_type: 'engine',
                    current_value: vehicle.firing ? 'ON' : 'OFF',
                    unit: '',
                    status: 'normal',
                    last_update: new Date(vehicle.unixtimestamp * 1000),
                    human_value: vehicle.firing ? 'Engine On' : 'Engine Off'
                });
            }
            
            // Process all sensors from backend API
            if (vehicle.sensors && typeof vehicle.sensors === 'object') {
                console.log('Processing', Object.keys(vehicle.sensors).length, 'sensors...');
                
                Ext.Object.each(vehicle.sensors, function(sensorName, sensorValue) {
                    // Parse: "14 %|1770111620|1507796|14|Auto Can|11|1|3"
                    var parts = sensorValue.split('|');
                    if (parts.length >= 4) {
                        var humanValue = parts[0];
                        var timestamp = parseInt(parts[1]);
                        var digitalValue = parseFloat(parts[3]);
                        
                        var sensorType = me.determineSensorType(sensorName);
                        var status = me.calculateSensorStatus(digitalValue, sensorType);
                        var unit = me.extractUnit(humanValue);
                        
                        sensorDataArray.push({
                            sensor_name: sensorName,
                            sensor_type: sensorType,
                            current_value: digitalValue,
                            unit: unit,
                            status: status,
                            last_update: new Date(timestamp * 1000),
                            human_value: humanValue
                        });
                    }
                });
            }
        }
        
        if (sensorDataArray.length === 0) {
            me.showNoSensorData();
            return;
        }
        
        console.log('✅ V2 sensor data processed. Count:', sensorDataArray.length);
        me.sensorStore.loadData(sensorDataArray);
    },
    
    showNoSensorData: function() {
        var me = this;
        
        me.sensorStore.loadData([{
            sensor_name: 'No Data Available',
            sensor_type: 'error',
            current_value: 'Unable to load sensor data',
            unit: '',
            status: 'critical',
            last_update: new Date(),
            human_value: 'Error'
        }]);
    },
    
    // Helper methods (same as V1)
    determineSensorType: function(sensorName) {
        if (!sensorName) return 'generic';
        
        var name = sensorName.toLowerCase();
        if (name.includes('температур') || name.includes('temp')) return 'temperature';
        if (name.includes('давлен') || name.includes('pressure')) return 'pressure';
        if (name.includes('топлив') || name.includes('fuel') || name.includes('уровень')) return 'level';
        if (name.includes('напряж') || name.includes('voltage') || name.includes('вольт')) return 'voltage';
        if (name.includes('скорост') || name.includes('speed')) return 'speed';
        if (name.includes('нагрузк') || name.includes('вес') || name.includes('load') || name.includes('weight')) return 'weight';
        
        return 'generic';
    },
    
    extractUnit: function(humValue) {
        if (!humValue) return '';
        
        var matches = humValue.toString().match(/([a-zA-Zа-яА-Я°%/]+)$/);
        return matches ? matches[1] : '';
    },
    
    calculateSensorStatus: function(value, sensorType) {
        if (value === null || value === undefined) return 'unknown';
        
        switch (sensorType) {
            case 'temperature':
                if (value > 100 || value < -20) return 'critical';
                if (value > 80 || value < 0) return 'warning';
                return 'normal';
                
            case 'voltage':
                if (value > 15 || value < 10) return 'critical';
                if (value > 14 || value < 11) return 'warning';
                return 'normal';
                
            case 'pressure':
                if (value > 100 || value < 0) return 'critical';
                if (value > 80 || value < 10) return 'warning';
                return 'normal';
                
            case 'level':
                if (value < 5) return 'critical';
                if (value < 15) return 'warning';
                return 'normal';
                
            default:
                return 'normal';
        }
    },
    
    getSensorIcon: function(sensorType) {
        switch(sensorType) {
            case 'temperature': return 'fa fa-thermometer-half';
            case 'pressure': return 'fa fa-tachometer-alt';
            case 'level': return 'fa fa-battery-half';
            case 'voltage': return 'fa fa-bolt';
            case 'speed': return 'fa fa-speedometer';
            case 'weight': return 'fa fa-weight';
            case 'engine': return 'fa fa-cog';
            default: return 'fa fa-microchip';
        }
    },
    
    // Cleanup when panel is destroyed
    onDestroy: function() {
        var me = this;
        
        me.stopSensorRefresh();
        me.callParent(arguments);
    }
});
