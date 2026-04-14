/**
 * Warehouse Management System
 * Entry point module - loads and initializes all components
 */
Ext.define('Store.warehouse.Module', {
    extend: 'Ext.Component',

    requires: [
        'Store.warehouse.view.NavigationTab',
        'Store.warehouse.view.MainPanel'
    ],

    initModule: function() {
        console.log('Warehouse Management System initialized');

        // 1. CREATE NAVIGATION TAB COMPONENT
        var navTab = Ext.create('Store.warehouse.view.NavigationTab', {
            title: 'warehouse',
            iconCls: 'fa fa-warehouse',
            iconAlign: 'top'
        });

        // 2. CREATE MAIN CONTENT COMPONENT
        var mainPanel = Ext.create('Store.warehouse.view.MainPanel');

        // 3. LINK COMPONENTS TOGETHER (MANDATORY)
        navTab.map_frame = mainPanel;

        // 4. ADD TO PILOT INTERFACE
        skeleton.navigation.add(navTab);
        skeleton.mapframe.add(mainPanel);

        console.log('Warehouse Management System loaded successfully');
    }
});
