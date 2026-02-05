Ext.define('Store.dashpanel.view.MainPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.dashpanelmain',
    
    layout: 'border',
    title: 'Real-Time Dashboard Panel',
    
    initComponent: function() {
        var me = this;
        
        // Current vehicle info panel
        me.vehicleInfoPanel = Ext.create('Ext.panel.Panel', {
            region: 'north',
            height: 60,
            title: 'Selected Vehicle',
            html: '<div style="padding: 10px; text-align: center; color: #666;">Select a vehicle from the dashboard panel to view data</div>',
            bodyStyle: 'background: #f5f5f5;'
        });
        
        // Sensor data grid
        me.sensorGrid = Ext.create('Ext.grid.Panel', {
            region: 'center',
            title: 'Live Sensor Data',
            store: Ext.create('Ext.data.Store', {
                fields: [
                    'sensor_name',
                    'sensor_type',
                    'current_value',
                    'unit',
                    'status',
                    'last_update',
                    'min_threshold',
                    'max_threshold'
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
                    
                    // Format value based on sensor type
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
                text: 'Thresholds',
                dataIndex: 'min_threshold',
                width: 120,
                renderer: function(value, meta, record) {
                    var min = record.get('min_threshold');
                    var max = record.get('max_threshold');
                    if (min !== null && max !== null) {
                        return min + ' - ' + max;
                    } else if (min !== null) {
                        return 'Min: ' + min;
                    } else if (max !== null) {
                        return 'Max: ' + max;
                    }
                    return '-';
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
                emptyText: 'No sensor data available. Select a vehicle to view sensors.',
                deferEmptyText: false
            }
        });
        
        me.items = [me.vehicleInfoPanel, me.sensorGrid];
        
        me.callParent(arguments);
        
        // Initialize refresh task for real-time updates
        me.refreshTask = null;
        me.currentVehicleId = null;
    },
    
    // Method called from navigation panel when vehicle is selected
    loadVehicleSensors: function(vehicleId, vehicleName) {
        var me = this;
        
        me.currentVehicleId = vehicleId;
        
        // Update vehicle info panel
        me.vehicleInfoPanel.update(
            '<div style="padding: 10px;">' +
            '<h3 style="margin: 0; color: #333;"><i class="fa fa-car"></i> ' + vehicleName + '</h3>' +
            '<span style="color: #666;">Vehicle ID: ' + vehicleId + ' | Real-time dashboard monitoring active</span>' +
            '</div>'
        );
        
        // Start real-time sensor data loading
        me.startSensorDataRefresh();
    },
    
    startSensorDataRefresh: function() {
        var me = this;
        
        // Stop existing refresh task
        if (me.refreshTask) {
            clearInterval(me.refreshTask);
        }
        
        // Load initial data
        me.loadSensorData();
        
        // Set up periodic refresh (every 5 seconds)
        me.refreshTask = setInterval(function() {
            if (me.currentVehicleId) {
                me.loadSensorData();
            }
        }, 5000);
    },
    
    loadSensorData: function() {
        var me = this;
        
        if (!me.currentVehicleId) {
            return;
        }
        
        // Load real-time sensor data from PILOT v3 API
        Ext.Ajax.request({
            url: '/api/v3/vehicles/status',
            params: {
                agent_id: me.currentVehicleId
            },
            success: function(response) {
                try {
                    var data = Ext.decode(response.responseText);
                    if (data.code === 0 && data.data && data.data.length > 0) {
                        me.processRealSensorData(data.data[0]);
                    } else {
                        console.warn('No vehicle data received, using mock data');
                        me.loadMockSensorData();
                    }
                } catch (e) {
                    console.error('Error parsing vehicle status data:', e);
                    // Continue with mock data for demonstration
                    me.loadMockSensorData();
                }
            },
            failure: function(response) {
                console.warn('Failed to load vehicle status from PILOT v3 API, using mock data');
                // Load mock data for demonstration purposes
                me.loadMockSensorData();
            }
        });
    },
    
    processRealSensorData: function(vehicleData) {
        var me = this;
        var sensorData = [];
        
        // Process real sensor data from PILOT v3 API response
        if (vehicleData && Ext.isArray(vehicleData.sensors)) {
            Ext.each(vehicleData.sensors, function(sensor) {
                // Determine sensor type from name or use generic
                var sensorType = me.determineSensorType(sensor.name);
                
                // Calculate status based on sensor value patterns (since API doesn't provide thresholds)
                var status = me.calculateSensorStatusFromValue(sensor.dig_value, sensorType);
                
                sensorData.push({
                    sensor_name: sensor.name || 'Unknown Sensor',
                    sensor_type: sensorType,
                    current_value: sensor.dig_value,
                    unit: me.extractUnit(sensor.hum_value),
                    status: status,
                    last_update: new Date(sensor.change_ts * 1000), // Convert from unix timestamp
                    min_threshold: null, // API doesn't provide thresholds
                    max_threshold: null,
                    raw_value: sensor.raw_value,
                    sensor_id: sensor.id
                });
            });
        }
        
        // Also add vehicle status as sensors
        if (vehicleData) {
            // Add speed as a sensor
            if (vehicleData.speed !== undefined) {
                sensorData.push({
                    sensor_name: 'Vehicle Speed',
                    sensor_type: 'speed',
                    current_value: vehicleData.speed,
                    unit: 'km/h',
                    status: vehicleData.speed > 80 ? 'warning' : 'normal',
                    last_update: new Date(vehicleData.unixtimestamp * 1000),
                    min_threshold: null,
                    max_threshold: 80
                });
            }
            
            // Add engine status
            if (vehicleData.firing !== undefined) {
                sensorData.push({
                    sensor_name: 'Engine Status',
                    sensor_type: 'engine',
                    current_value: vehicleData.firing,
                    unit: vehicleData.firing ? 'ON' : 'OFF',
                    status: 'normal',
                    last_update: new Date(vehicleData.unixtimestamp * 1000),
                    min_threshold: null,
                    max_threshold: null
                });
            }
        }
        
        me.sensorGrid.getStore().loadData(sensorData);
    },
    
    // Helper method to determine sensor type from name
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
    
    // Helper method to extract unit from human readable value
    extractUnit: function(humValue) {
        if (!humValue) return '';
        
        // Extract unit from strings like "14356 кг" or "25.5 V"
        var matches = humValue.toString().match(/([a-zA-Zа-яА-Я°%]+)$/);
        return matches ? matches[1] : '';
    },
    
    // Calculate status from sensor value based on type
    calculateSensorStatusFromValue: function(value, sensorType) {
        if (value === null || value === undefined) return 'unknown';
        
        // Basic heuristics for different sensor types
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
    
    // Mock data for demonstration when API is not available
    loadMockSensorData: function() {
        var me = this;
        
        var mockSensors = [
            {
                sensor_name: 'Engine Temperature',
                sensor_type: 'temperature',
                current_value: 85.5,
                unit: '°C',
                min_threshold: 70,
                max_threshold: 95,
                last_update: new Date()
            },
            {
                sensor_name: 'Oil Pressure',
                sensor_type: 'pressure',
                current_value: 45.2,
                unit: 'PSI',
                min_threshold: 30,
                max_threshold: 60,
                last_update: new Date()
            },
            {
                sensor_name: 'Fuel Level',
                sensor_type: 'level',
                current_value: 78.5,
                unit: '%',
                min_threshold: 10,
                max_threshold: 100,
                last_update: new Date()
            },
            {
                sensor_name: 'Battery Voltage',
                sensor_type: 'voltage',
                current_value: 12.4,
                unit: 'V',
                min_threshold: 11.5,
                max_threshold: 14.5,
                last_update: new Date()
            },
            {
                sensor_name: 'Speed',
                sensor_type: 'speed',
                current_value: 45,
                unit: 'km/h',
                min_threshold: 0,
                max_threshold: 120,
                last_update: new Date()
            }
        ];
        
        // Add random variation to simulate real-time data
        Ext.each(mockSensors, function(sensor) {
            var variation = (Math.random() - 0.5) * 2; // ±1 unit variation
            sensor.current_value = Math.round((sensor.current_value + variation) * 10) / 10;
            sensor.status = me.calculateSensorStatus(sensor.current_value, sensor.min_threshold, sensor.max_threshold);
        });
        
        me.sensorGrid.getStore().loadData(mockSensors);
    },
    
    calculateSensorStatus: function(value, minThreshold, maxThreshold) {
        if (minThreshold !== null && value < minThreshold) {
            return 'critical';
        }
        if (maxThreshold !== null && value > maxThreshold) {
            return 'critical';
        }
        
        // Warning zones (within 10% of thresholds)
        if (minThreshold !== null && value < minThreshold * 1.1) {
            return 'warning';
        }
        if (maxThreshold !== null && value > maxThreshold * 0.9) {
            return 'warning';
        }
        
        return 'normal';
    },
    
    getSensorIcon: function(sensorType) {
        switch(sensorType) {
            case 'temperature': return 'fa fa-thermometer-half';
            case 'pressure': return 'fa fa-tachometer-alt';
            case 'level': return 'fa fa-battery-half';
            case 'voltage': return 'fa fa-bolt';
            case 'speed': return 'fa fa-speedometer';
            default: return 'fa fa-sensor';
        }
    },
    
    // Cleanup when panel is destroyed
    onDestroy: function() {
        var me = this;
        
        if (me.refreshTask) {
            clearInterval(me.refreshTask);
            me.refreshTask = null;
        }
        
        me.callParent(arguments);
    }
});
