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
        console.log('🔍 DEBUG: Starting Warehouse Management System initialization...');

        try {
            // Debug: Check if all required classes exist
            console.log('🔍 DEBUG: Checking required dependencies...');
            
            if (!Store.warehouse.config.ApiConfig) {
                console.error('❌ ERROR: ApiConfig class not found');
                return;
            }
            console.log('✅ DEBUG: ApiConfig found');

            if (!Store.warehouse.controller.WarehouseController) {
                console.error('❌ ERROR: WarehouseController class not found');
                return;
            }
            console.log('✅ DEBUG: WarehouseController found');

            if (!Store.warehouse.view.NavigationTab) {
                console.error('❌ ERROR: NavigationTab class not found');
                return;
            }
            console.log('✅ DEBUG: NavigationTab found');

            if (!Store.warehouse.view.MainPanel) {
                console.error('❌ ERROR: MainPanel class not found');
                return;
            }
            console.log('✅ DEBUG: MainPanel found');

            if (!Store.warehouse.view.Dashboard) {
                console.error('❌ ERROR: Dashboard class not found');
                return;
            }
            console.log('✅ DEBUG: Dashboard found');

            // Initialize API configuration
            console.log('🔍 DEBUG: Initializing API configuration...');
            var apiConfig = Store.warehouse.config.ApiConfig;
            console.log('✅ DEBUG: API Config initialized:', apiConfig.getBaseUrl());
            
            // Create warehouse controller
            console.log('🔍 DEBUG: Creating WarehouseController...');
            var warehouseController = Ext.create('Store.warehouse.controller.WarehouseController');
            console.log('✅ DEBUG: WarehouseController created successfully');

            // 1. CREATE NAVIGATION TAB COMPONENT
            console.log('🔍 DEBUG: Creating NavigationTab...');
            var navTab = Ext.create('Store.warehouse.view.NavigationTab', {
                title: 'warehouse',
                iconCls: 'fa fa-warehouse',
                iconAlign: 'top',
                warehouseController: warehouseController
            });
            console.log('✅ DEBUG: NavigationTab created successfully');

            // 2. CREATE MAIN CONTENT COMPONENT
            console.log('🔍 DEBUG: Creating MainPanel...');
            var mainPanel = Ext.create('Store.warehouse.view.MainPanel', {
                warehouseController: warehouseController
            });
            console.log('✅ DEBUG: MainPanel created successfully');

            // 3. LINK COMPONENTS TOGETHER (MANDATORY)
            console.log('🔍 DEBUG: Linking components...');
            navTab.map_frame = mainPanel;
            
            // Link controller to components
            warehouseController.setMainPanel(mainPanel);
            warehouseController.setNavigationTab(navTab);
            console.log('✅ DEBUG: Components linked successfully');

            // 4. ADD TO PILOT INTERFACE
            console.log('🔍 DEBUG: Adding to PILOT interface...');
            if (!skeleton) {
                console.error('❌ ERROR: skeleton object not found');
                return;
            }
            if (!skeleton.navigation) {
                console.error('❌ ERROR: skeleton.navigation not found');
                return;
            }
            if (!skeleton.mapframe) {
                console.error('❌ ERROR: skeleton.mapframe not found');
                return;
            }
            
            skeleton.navigation.add(navTab);
            skeleton.mapframe.add(mainPanel);
            console.log('✅ DEBUG: Added to PILOT interface successfully');

            console.log('✅ Warehouse Management System loaded successfully with API integration');
            
            // Load initial dashboard data
            setTimeout(function() {
                try {
                    console.log('🔍 DEBUG: Loading initial dashboard data...');
                    warehouseController.loadDashboardMetrics();
                    console.log('✅ DEBUG: Dashboard data loading initiated');
                } catch (dashboardError) {
                    console.error('❌ ERROR loading dashboard data:', dashboardError);
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ CRITICAL ERROR in Warehouse Module initialization:', error);
            console.error('❌ Error stack:', error.stack);
            
            // Try to provide more specific error information
            if (error.message.includes('not a constructor')) {
                console.error('❌ CONSTRUCTOR ERROR: One of the required classes is not properly defined');
                console.error('❌ Check that all files are loaded and classes are properly defined');
            }
            
            throw error; // Re-throw to see the full error in console
        }
    }
});
