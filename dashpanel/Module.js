Ext.define('Store.dashpanel.Module', {
    extend: 'Ext.Component',

    initModule: function () {
        var me = this;
        
        console.log('Dashpanel V2 (Context Menu → Main Panel) extension initializing...');
        
        // Store reference for later use in context menu handlers
        window.dashpanelModule = me;
        
        // Initialize context menu on existing online tree (NO new navigation tab)
        me.initializeContextMenu();
    },
    
    initializeContextMenu: function() {
        var me = this;
        
        // Access existing online tree (don't create new navigation)
        if (skeleton && skeleton.navigation && skeleton.navigation.online && skeleton.navigation.online.online_tree) {
            var tree = skeleton.navigation.online.online_tree;
            
            console.log('Found existing online tree, adding context menu item...');
            
            // Handle both possible context menu property names
            var contextMenu = tree.context_menu || tree.contextmenu;
            
            if (contextMenu) {
                // Add menu item to existing context menu
                contextMenu.add({
                    text: 'View Dashboard Panel',
                    iconCls: 'fa fa-tachometer-alt',
                    scope: tree,
                    handler: function() {
                        // 'this' refers to the tree due to scope
                        if (this.record) {
                            console.log('Context menu clicked for vehicle:', this.record.get('name'));
                            me.showMainPanel(this.record);
                        } else {
                            console.warn('No vehicle record selected');
                        }
                    }
                });
                
                console.log('✅ Context menu item added to existing online tree');
            } else {
                console.error('❌ Context menu not found on online tree');
            }
        } else {
            console.error('❌ Online tree not available');
        }
    },
    
    showMainPanel: function(vehicleRecord) {
        var me = this;
        
        var vehicleName = vehicleRecord.get('name') || vehicleRecord.get('text') || 'Unknown Vehicle';
        var vehicleId = vehicleRecord.get('id') || vehicleRecord.get('imei') || vehicleRecord.get('agent_id');
        
        console.log('🚗 Showing main panel for vehicle:', vehicleName, 'ID:', vehicleId);
        
        // Check if main panel already exists in mapframe
        var existingPanel = Ext.getCmp('dashpanel-main-v2');
        if (existingPanel) {
            console.log('Main panel exists, updating with new vehicle data');
            existingPanel.loadVehicleData(vehicleId, vehicleName, vehicleRecord);
            return;
        }
        
        // Create main panel with map (top) + sensors (bottom)
        var mainPanel = Ext.create('Store.dashpanel.view.MainPanelV2', {
            id: 'dashpanel-main-v2'
        });
        
        // Add to mapframe (main content area)
        try {
            skeleton.mapframe.add(mainPanel);
            console.log('✅ Main panel added to mapframe');
            
            // Load vehicle data
            mainPanel.loadVehicleData(vehicleId, vehicleName, vehicleRecord);
            
        } catch (e) {
            console.error('❌ Failed to add main panel to mapframe:', e);
            console.error('Mapframe structure:', skeleton.mapframe);
            
            // Fallback: show alert with error
            Ext.Msg.alert('Error', 'Unable to create main panel. This PILOT version may not support panel integration.');
        }
    }
});
