/**
 * Units Store
 * Data store for PILOT vehicle/unit data with hierarchical parsing
 */
Ext.define('Store.rdmtoken.store.UnitsStore', {
    extend: 'Ext.data.Store',

    proxy: {
        type: 'ajax',
        url: '/ax/tree.php',
        extraParams: { 
            vehs: 1, 
            state: 1 
        },
        reader: {
            type: 'json'
        }
    },

    fields: [
        'vehid', 
        'name', 
        'vin', 
        'model', 
        'year',
        'serialnumber', 
        'imei', 
        'status',
        'lat',
        'lng',
        'speed',
        'fuel',
        'battery'
    ],

    listeners: {
        beforeload: function(store, operation) {
            console.log('Loading units from PILOT...');
        },
        
        load: function(store, records, successful) {
            if (successful) {
                // Parse hierarchical response (groups -> children)
                // AI_SPECS.md requirement: parse groups → children
                var vehicles = [];
                
                Ext.each(records, function(group) {
                    var groupData = group.getData();
                    
                    // Check if this record has children (vehicles)
                    if (groupData.children && Ext.isArray(groupData.children)) {
                        Ext.each(groupData.children, function(child) {
                            vehicles.push(child);
                        });
                    }
                    
                    // Some responses might have vehicles at root level
                    if (groupData.vehid && !groupData.children) {
                        vehicles.push(groupData);
                    }
                });
                
                // Clear original records and add parsed vehicles
                store.removeAll();
                store.add(vehicles);
                
                console.log('Units loaded and parsed:', vehicles.length, 'vehicles from', records.length, 'groups');
            } else {
                console.error('Failed to load units from PILOT');
            }
        },
        
        exception: function(proxy, response, operation) {
            console.error('Units store exception:', response.status, response.statusText);
        }
    },

    // Helper method to find unit by serial number
    findBySerialNumber: function(serialNumber) {
        return this.findRecord('serialnumber', serialNumber);
    },

    // Helper method to get active units only
    getActiveUnits: function() {
        return this.queryBy(function(record) {
            return record.get('status') === 'online' || record.get('status') === 'active';
        });
    },

    // Filter units with token capability
    getTokenCapableUnits: function() {
        return this.queryBy(function(record) {
            // Filter based on unit type or capability
            // This would depend on actual data structure
            return record.get('serialnumber') && record.get('imei');
        });
    }
});