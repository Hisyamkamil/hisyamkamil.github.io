/**
 * RDM Token 2.1 Extension
 * Entry point module - loads and initializes all components
 */
Ext.define('Store.rdmtoken.Module', {
    extend: 'Ext.Component',

    requires: [
        'Store.rdmtoken.config.ApiConfig',
        'Store.rdmtoken.view.NavigationTab',
        'Store.rdmtoken.view.MainPanel',
        'Store.rdmtoken.view.DashboardPanel',
        'Store.rdmtoken.view.TokenManagementPanel',
        'Store.rdmtoken.view.LocationMonitoringPanel',
        'Store.rdmtoken.view.ContractPanel',
        'Store.rdmtoken.view.ApprovalPanel',
        'Store.rdmtoken.view.ReportPanel',
        'Store.rdmtoken.controller.TokenController',
        'Store.rdmtoken.store.TokenStore',
        'Store.rdmtoken.store.UnitsStore',
        'Store.rdmtoken.store.ContractsStore'
    ],

    initModule: function() {
        console.log('RDM Token 2.1 Extension initialized');

        // Initialize controller
        var controller = Ext.create('Store.rdmtoken.controller.TokenController');

        // 1. CREATE NAVIGATION TAB COMPONENT
        var navTab = Ext.create('Store.rdmtoken.view.NavigationTab', {
            title: 'RDM Token',
            iconCls: 'fa fa-key',
            iconAlign: 'top'
        });

        // 2. CREATE MAIN CONTENT COMPONENT
        var mainPanel = Ext.create('Store.rdmtoken.view.MainPanel');

        // 3. LINK COMPONENTS TOGETHER (MANDATORY)
        navTab.map_frame = mainPanel;

        // 4. ADD TO PILOT INTERFACE
        skeleton.navigation.add(navTab);
        skeleton.mapframe.add(mainPanel);

        // 5. LOAD CUSTOM STYLES
        this.loadStyles();

        // 6. INITIALIZE GLOBAL STORES
        this.initializeGlobalStores();

        // 7. STORE CONTROLLER GLOBALLY FOR ACCESS
        window.RDMController = controller;
    },

    loadStyles: function() {
        var cssLink = document.createElement("link");
        cssLink.setAttribute("rel", "stylesheet");
        cssLink.setAttribute("type", "text/css");
        cssLink.setAttribute("href", '/store/rdmtoken/style.css');
        document.head.appendChild(cssLink);
    },

    initializeGlobalStores: function() {
        // Initialize global stores for cross-component access
        window.RDMStores = {
            units: Ext.create('Store.rdmtoken.store.UnitsStore'),
            tokens: Ext.create('Store.rdmtoken.store.TokenStore'),
            contracts: Ext.create('Store.rdmtoken.store.ContractsStore')
        };

        // Don't auto-load - load data only when needed per tab activation
        console.log('Global stores initialized (data will load on demand)');
    }
});
