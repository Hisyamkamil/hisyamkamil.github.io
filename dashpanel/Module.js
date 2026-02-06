Ext.define('Store.dashpanel.Module', {
    extend: 'Ext.Component',

    initModule: function () {
        var me = this;
        
        console.log('Dashpanel V2 (Hybrid Pattern 1+3) extension initializing...');
        
        // Create navigation tab component (Pattern 1)
        var navTab = Ext.create('Store.dashpanel.view.Navigation');
        
        // Create main panel component with map + sensors (Pattern 1 + 3 hybrid)
        var mainPanel = Ext.create('Store.dashpanel.view.MainPanelV2');
        
        // Link navigation tab to main panel (mandatory Pattern 1 requirement)
        navTab.map_frame = mainPanel;
        
        // Add to PILOT skeleton (Pattern 1)
        skeleton.navigation.add(navTab);
        skeleton.mapframe.add(mainPanel);
        
        console.log('✅ V2 navigation tab and hybrid main panel added');
    }
});
