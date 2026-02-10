Ext.define('Store.dashpanel.view.Navigation', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.dashpanel.navigation',
    
    title: 'Sensor Monitor',
    iconCls: 'fa fa-tachometer-alt',
    iconAlign: 'left',
    layout: 'fit',
    
    /**
     * Initialize component
     */
    initComponent: function() {
        var me = this;
        
        // Create vehicle tree for dashboard panel (important comment from V3)
        me.vehicleTree = me.createVehicleTree();
        me.items = [me.vehicleTree];
        
        me.callParent(arguments);
        
        console.log('✅ Navigation component initialized with vehicle tree');
    },
    
    /**
     * Create vehicle tree using PILOT API (like V3)
     * @returns {Object} ExtJS tree panel
     */
    createVehicleTree: function() {
        var me = this;
        
        return Ext.create('Ext.tree.Panel', {
            title: 'Vehicles',
            tools: [{
                xtype: 'button',
                iconCls: 'fa fa-rotate',
                tooltip: 'Refresh',
                handler: function() {
                    this.up('treepanel').getStore().load();
                }
            }],
            rootVisible: false,
            useArrows: true,
            border: false,
            
            // Create tree store that loads vehicle data from PILOT API (correct approach from V3)
            store: me.createVehicleStore(),
            
            columns: me.createTreeColumns(),
            
            listeners: {
                selectionchange: me.onVehicleSelectionChange,
                scope: me
            }
        });
    },
    
    /**
     * Create vehicle store using PILOT API
     * @returns {Object} ExtJS tree store
     */
    createVehicleStore: function() {
        return Ext.create('Ext.data.TreeStore', {
            proxy: {
                type: 'ajax',
                url: '/ax/tree.php?vehs=1&state=1'  // Correct PILOT API endpoint from V3
                // Uses default tree reader - no custom reader needed
            },
            root: {
                text: 'Vehicles',
                expanded: true
            },
            autoLoad: true
        });
    },
    
    /**
     * Create tree columns
     * @returns {Array} Column configuration
     */
    createTreeColumns: function() {
        return [{
            xtype: 'treecolumn',
            text: 'Vehicle',
            dataIndex: 'name',
            flex: 2,
            renderer: function(value) {
                return value || 'Unknown';
            }
        }, {
            text: 'Status',
            dataIndex: 'state',
            width: 80,
            renderer: function(value) {
                if (value === 1) {
                    return '<span style="color: green;">●</span> Online';
                }
                return '<span style="color: red;">●</span> Offline';
            }
        }];
    },
    
    /**
     * Handle vehicle selection change
     * @param {Object} tree - Tree panel
     * @param {Array} selected - Selected records
     */
    onVehicleSelectionChange: function(tree, selected) {
        var me = this;
        
        if (selected.length > 0) {
            var record = selected[0];
            
            if (me.isValidVehicleRecord(record)) {
                var vehicleId = me.getVehicleId(record);
                var vehicleName = me.getVehicleName(record);
                
                console.log('🚗 Vehicle selected in Navigation:', vehicleName, 'ID:', vehicleId);
                
                // Trigger sensor panel (like V3 pattern)
                if (window.dashpanelModule && window.dashpanelModule.showVehicleSensors) {
                    window.dashpanelModule.showVehicleSensors(vehicleId, vehicleName, record);
                    console.log('✅ Sensor loading triggered');
                } else {
                    console.warn('❌ Dashboard module not available');
                }
            }
        }
    },
    
    /**
     * Check if record is valid vehicle
     * @param {Object} record - Tree record
     * @returns {boolean} True if valid vehicle
     */
    isValidVehicleRecord: function(record) {
        return record.get('leaf') &&
               (record.get('id') || record.get('vehicle_id'));
    },
    
    /**
     * Get vehicle ID from record
     * @param {Object} record - Tree record
     * @returns {string} Vehicle ID
     */
    getVehicleId: function(record) {
        return record.get('id') || record.get('vehicle_id');
    },
    
    /**
     * Get vehicle name from record
     * @param {Object} record - Tree record
     * @returns {string} Vehicle name
     */
    getVehicleName: function(record) {
        return record.get('name') ||
               record.get('text') ||
               'Unknown Vehicle';
    },
    
    /**
     * Refresh vehicle tree
     */
    refreshVehicles: function() {
        var me = this;
        
        if (me.vehicleTree && me.vehicleTree.getStore()) {
            console.log('🔄 Refreshing vehicle tree...');
            me.vehicleTree.getStore().load();
        }
    }
});
