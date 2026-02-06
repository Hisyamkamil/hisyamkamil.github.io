Ext.define('Store.dashpanel.Module', {
    extend: 'Ext.Component',

    initModule: function () {
        var me = this;
        
        console.log('Dashpanel V2 (Pattern 2 - Modal) extension initializing...');
        
        // Store reference for later use in context menu handlers
        window.dashpanelModule = me;
        
        // Initialize context menu (proper Pattern 2)
        me.initializeContextMenu();
    },
    
    initializeContextMenu: function() {
        var me = this;
        
        // Try to access online tree safely
        if (skeleton && skeleton.navigation && skeleton.navigation.online && skeleton.navigation.online.online_tree) {
            var tree = skeleton.navigation.online.online_tree;
            
            console.log('Found online tree, adding context menu item...');
            
            // Handle both possible context menu property names
            var contextMenu = tree.context_menu || tree.contextmenu;
            
            if (contextMenu) {
                // Add menu item to existing context menu (Pattern 2)
                contextMenu.add({
                    text: 'View Dashboard Panel',
                    iconCls: 'fa fa-tachometer-alt',
                    scope: tree,
                    handler: function() {
                        // 'this' refers to the tree due to scope
                        if (this.record) {
                            console.log('Context menu clicked for vehicle:', this.record.get('name'));
                            me.openSensorModal(this.record);
                        } else {
                            console.warn('No vehicle record selected');
                        }
                    }
                });
                
                console.log('✅ Context menu item added successfully');
            } else {
                console.error('❌ Context menu not found on online tree');
            }
        } else {
            console.error('❌ Online tree not available');
        }
    },
    
    openSensorModal: function(vehicleRecord) {
        var me = this;
        
        var vehicleName = vehicleRecord.get('name') || vehicleRecord.get('text') || 'Unknown Vehicle';
        var vehicleId = vehicleRecord.get('id') || vehicleRecord.get('imei') || vehicleRecord.get('agent_id');
        
        console.log('🚗 Opening sensor modal for vehicle:', vehicleName, 'ID:', vehicleId);
        
        // Close existing window if open
        var existingWindow = Ext.getCmp('dashpanel-sensor-window');
        if (existingWindow) {
            existingWindow.close();
        }
        
        // Store current vehicle info
        me.currentVehicleId = vehicleId;
        me.currentVehicleName = vehicleName;
        
        // Create sensor data store
        var sensorStore = Ext.create('Ext.data.Store', {
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
        
        // Create modal window (proper Pattern 2)
        var sensorWindow = Ext.create('Ext.window.Window', {
            id: 'dashpanel-sensor-window',
            title: '🔧 Dashboard Panel - ' + vehicleName,
            width: 1000,
            height: 700,
            modal: true,
            layout: 'border',
            closable: true,
            resizable: true,
            maximizable: true,
            
            items: [{
                // Top info panel
                region: 'north',
                xtype: 'panel',
                height: 60,
                html: '<div style="padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">' +
                      '<h3 style="margin: 0; color: white;"><i class="fa fa-car"></i> ' + vehicleName + '</h3>' +
                      '<span>Vehicle ID: ' + vehicleId + ' | Real-time sensor monitoring (0.5s refresh)</span>' +
                      '</div>',
                border: false
            }, {
                // Main sensor grid
                region: 'center',
                xtype: 'grid',
                store: sensorStore,
                columns: [{
                    text: 'Sensor Name',
                    dataIndex: 'sensor_name',
                    flex: 3,
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
                    emptyText: 'Loading sensor data...',
                    deferEmptyText: false
                }
            }],
            
            // Window toolbar
            tbar: [{
                text: 'Refresh',
                iconCls: 'fa fa-refresh',
                handler: function() {
                    me.loadSensorDataForModal(vehicleId, sensorStore);
                }
            }, '->', {
                xtype: 'tbtext',
                text: 'Real-time (0.5s)',
                style: 'color: #666;'
            }],
            
            listeners: {
                afterrender: function() {
                    // Load initial sensor data
                    me.loadSensorDataForModal(vehicleId, sensorStore);
                    
                    // Start real-time refresh
                    me.startAutoRefreshModal(vehicleId, sensorStore);
                },
                close: function() {
                    // Clean up auto-refresh on window close
                    me.stopAutoRefresh();
                }
            }
        });
        
        sensorWindow.show();
    },
    
    startAutoRefreshModal: function(vehicleId, store) {
        var me = this;
        
        // Stop existing refresh
        me.stopAutoRefresh();
        
        // Start new refresh every 0.5 seconds
        me.refreshTask = setInterval(function() {
            me.loadSensorDataForModal(vehicleId, store);
        }, 500);
        
        console.log('Real-time auto-refresh started for modal, vehicle:', vehicleId, '(every 0.5s)');
    },
    
    loadSensorDataForModal: function(vehicleId, store) {
        var me = this;
        
        console.log('🔄 Loading sensor data for modal, vehicle ID:', vehicleId);
        
        // Try backend API (working endpoint)
        Ext.Ajax.request({
            url: '/backend/ax/current_data.php',
            success: function(response) {
                try {
                    var data = Ext.decode(response.responseText);
                    me.processBackendSensorDataForModal(data, vehicleId, store);
                } catch (e) {
                    console.error('❌ Backend API parse error:', e);
                    // Try external URL
                    me.tryExternalBackendAPIForModal(vehicleId, store);
                }
            },
            failure: function(response) {
                console.warn('❌ Backend API failed, trying external...');
                me.tryExternalBackendAPIForModal(vehicleId, store);
            }
        });
    },
    
    tryExternalBackendAPIForModal: function(vehicleId, store) {
        var me = this;
        
        // Try external backend API
        Ext.Ajax.request({
            url: 'https://dev-telematics.mst.co.id/backend/ax/current_data.php',
            success: function(response) {
                try {
                    var data = Ext.decode(response.responseText);
                    me.processBackendSensorDataForModal(data, vehicleId, store);
                } catch (e) {
                    console.error('❌ External API parse error:', e);
                    me.showNoDataInModal(store);
                }
            },
            failure: function(response) {
                console.error('❌ External API failed:', response.status);
                me.showNoDataInModal(store);
            }
        });
    },
    
    processBackendSensorDataForModal: function(data, vehicleId, store) {
        var me = this;
        var sensorDataArray = [];
        
        console.log('Processing backend sensor data for modal, vehicle:', vehicleId);
        
        // Backend API returns: {c: 0, objects: [...]}
        if (data && data.c === 0 && Ext.isArray(data.objects)) {
            // Find the vehicle by ID
            var vehicle = null;
            Ext.each(data.objects, function(obj) {
                if (obj.id == vehicleId || obj.veh_id == vehicleId) {
                    vehicle = obj;
                    return false;
                }
            });
            
            if (!vehicle) {
                console.error('❌ Vehicle ID', vehicleId, 'not found');
                me.showNoDataInModal(store);
                return;
            }
            
            console.log('✅ Found vehicle for modal:', vehicle.name);
            
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
            
            // Process sensors object
            if (vehicle.sensors && typeof vehicle.sensors === 'object') {
                console.log('Processing', Object.keys(vehicle.sensors).length, 'sensors for modal...');
                
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
            me.showNoDataInModal(store);
            return;
        }
        
        console.log('✅ Backend sensor data processed for modal. Count:', sensorDataArray.length);
        store.loadData(sensorDataArray);
    },
    
    showNoDataInModal: function(store) {
        store.loadData([{
            sensor_name: 'No Data Available',
            sensor_type: 'error',
            current_value: 'Unable to load sensor data',
            unit: '',
            status: 'critical',
            last_update: new Date(),
            human_value: 'Error'
        }]);
    },
    
    stopAutoRefresh: function() {
        var me = this;
        
        if (me.refreshTask) {
            clearInterval(me.refreshTask);
            me.refreshTask = null;
            console.log('Auto-refresh stopped');
        }
    },
    
    // Helper methods
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
    }
});
