/**
 * Warehouse Management System
 * Entry point module with API integration - loads and initializes all components
 */
Ext.define('Store.warehouse.Module', {
    extend: 'Ext.Component',

    requires: [
        'Store.warehouse.config.ApiConfig',
        'Store.warehouse.controller.WarehouseController',
        'Store.warehouse.view.NavigationTab',
        'Store.warehouse.view.MainPanel',
        'Store.warehouse.view.Dashboard'
    ],

    initModule: function() {
        console.log('Warehouse Management System initialized with API integration');

        // Initialize API configuration
        var apiConfig = Store.warehouse.config.ApiConfig;
        console.log('API Config initialized:', apiConfig.getBaseUrl());
        
        // Create warehouse controller
        var warehouseController = Ext.create('Store.warehouse.controller.WarehouseController');

        // 1. CREATE NAVIGATION TAB COMPONENT
        var navTab = Ext.create('Store.warehouse.view.NavigationTab', {
            title: 'warehouse',
            iconCls: 'fa fa-warehouse',
            iconAlign: 'top',
            warehouseController: warehouseController
        });

        // 2. CREATE MAIN CONTENT COMPONENT
        var mainPanel = Ext.create('Store.warehouse.view.MainPanel', {
            warehouseController: warehouseController
        });

        // 3. LINK COMPONENTS TOGETHER (MANDATORY)
        navTab.map_frame = mainPanel;
        
        // Link controller to components
        warehouseController.setMainPanel(mainPanel);
        warehouseController.setNavigationTab(navTab);

        // 4. ADD TO PILOT INTERFACE
        skeleton.navigation.add(navTab);
        skeleton.mapframe.add(mainPanel);

        console.log('✅ Warehouse Management System loaded successfully with API integration');
        
        // Load initial dashboard data
        setTimeout(function() {
            warehouseController.loadDashboardMetrics();
        }, 100);
    }
});
