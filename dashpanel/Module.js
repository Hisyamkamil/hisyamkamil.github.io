Ext.define('Store.dashpanel.Module', {
    extend: 'Ext.Component',

    // Module properties
    config: null,
    navigationComponent: null,
    mainPanelComponent: null,
    sensorTagsCache: null,
    sensorTagsById: null,

    /**
     * Main initialization function (following template-app pattern)
     */
    initModule: function() {
        var me = this;
        
        console.log('Dashpanel (Configuration-driven) extension initializing...');
        
        // Store global reference
        window.dashpanelModule = me;
        
        // Load configuration and sensor tags first, then setup components
        me.loadConfiguration(function(success) {
            if (success) {
                me.loadSensorTags(function() {
                    me.setupComponents();
                });
            } else {
                console.error('❌ Failed to initialize module due to configuration error');
            }
        });
    },

    /**
     * Setup all components (following template-app pattern)
     */
    setupComponents: function() {
        var me = this;
        
        // 1. CREATE NAVIGATION COMPONENT (CONDITIONAL)
        if (me.isNavigationEnabled()) {
            me.navigationComponent = me.createNavigationComponent();
        }
        
        // 2. CREATE MAIN PANEL COMPONENT
        me.mainPanelComponent = me.createMainPanelComponent();
        
        // 3. LINK COMPONENTS TOGETHER
        // Navigation will trigger main panel via global reference (if enabled)
        
        // 4. ADD TO PILOT INTERFACE
        me.addToPilotInterface();
        
        // 5. LOAD CUSTOM STYLES
        me.loadStyles();
        
        console.log('✅', me.config.module.name, 'initialized successfully');
    },

    /**
     * Check if navigation is enabled in configuration
     * @returns {boolean} True if navigation should be shown
     */
    isNavigationEnabled: function() {
        var me = this;
        return me.config &&
               me.config.ui &&
               me.config.ui.navigation !== false; // Default to true if not specified
    },

    /**
     * Create navigation component
     * @returns {Object} Navigation component
     */
    createNavigationComponent: function() {
        var me = this;
        
        return Ext.create('Store.dashpanel.view.Navigation', {
            title: 'Sensor Monitor',
            iconCls: 'fa fa-tachometer-alt',
            height: 300,
            collapsible: true,
            split: true
        });
    },

    /**
     * Create main panel component
     * @returns {Object} Main panel component
     */
    createMainPanelComponent: function() {
        var me = this;
        
        return Ext.create('Store.dashpanel.view.MainPanel', {
            moduleConfig: me.config // Pass configuration to main panel
        });
    },

    /**
     * Add components to PILOT interface
     */
    addToPilotInterface: function() {
        var me = this;
        
        // Add navigation to existing Online navigation panel (if enabled)
        if (me.isNavigationEnabled()) {
            if (me.isOnlineNavigationAvailable()) {
                var onlinePanel = skeleton.navigation.online;
                onlinePanel.add(me.navigationComponent);
                me.setupNavigationListeners(onlinePanel);
                console.log('✅ Navigation component added to PILOT interface');
            } else {
                console.error('❌ Online navigation not available');
            }
        } else {
            console.log('ℹ️ Navigation disabled in configuration - main panel will be always visible');
        }
        
        // Add main panel to mapframe
        if (me.isMapFrameAvailable()) {
            me.dockMainPanelToMapFrame();
            console.log('✅ Main panel docked to PILOT mapframe');
            
            // If navigation is disabled, show main panel immediately
            if (!me.isNavigationEnabled()) {
                me.showMainPanel();
                console.log('✅ Main panel shown automatically (no navigation)');
            }
        } else {
            console.error('❌ Map frame not available');
        }
    },

    /**
     * Check if online navigation is available
     * @returns {boolean} True if available
     */
    isOnlineNavigationAvailable: function() {
        return skeleton && 
               skeleton.navigation && 
               skeleton.navigation.online &&
               skeleton.navigation.online.add;
    },

    /**
     * Check if map frame is available
     * @returns {boolean} True if available
     */
    isMapFrameAvailable: function() {
        return skeleton && skeleton.mapframe;
    },

    /**
     * Setup navigation event listeners
     * @param {Object} onlinePanel - Online navigation panel
     */
    setupNavigationListeners: function(onlinePanel) {
        var me = this;
        
        // Only setup listeners if navigation is enabled
        if (!me.isNavigationEnabled()) {
            return;
        }
        
        if (onlinePanel.on) {
            onlinePanel.on('tabchange', function(tabPanel, newCard) {
                me.handleTabChange(newCard);
            });
            
            me.navigationComponent.on('activate', function() {
                me.showMainPanel();
            });
            
            me.navigationComponent.on('deactivate', function() {
                me.hideMainPanel();
            });
        }
    },

    /**
     * Handle tab change event
     * @param {Object} newCard - New active tab
     */
    handleTabChange: function(newCard) {
        var me = this;
        
        // Only handle tab changes if navigation is enabled
        if (!me.isNavigationEnabled()) {
            return;
        }
        
        if (newCard && newCard.title === 'Sensor Monitor') {
            me.showMainPanel();
        } else {
            me.hideMainPanel();
        }
    },

    /**
     * Dock main panel to map frame
     */
    dockMainPanelToMapFrame: function() {
        var me = this;
        
        try {
            var mapFramePanel = skeleton.mapframe.down('panel');
            if (mapFramePanel && mapFramePanel.addDocked) {
                mapFramePanel.addDocked(me.mainPanelComponent);
            } else if (skeleton.mapframe.addDocked) {
                skeleton.mapframe.addDocked(me.mainPanelComponent);
            } else {
                console.warn('❌ No docking method available for main panel');
            }
        } catch (e) {
            console.error('❌ Failed to dock main panel:', e.message);
        }
    },

    /**
     * Show main panel
     */
    showMainPanel: function() {
        var me = this;
        
        if (me.mainPanelComponent && me.mainPanelComponent.showPanel) {
            me.mainPanelComponent.showPanel();
        }
    },

    /**
     * Hide main panel
     */
    hideMainPanel: function() {
        var me = this;
        
        if (me.mainPanelComponent && me.mainPanelComponent.hidePanel) {
            me.mainPanelComponent.hidePanel();
        }
    },

    /**
     * Load custom CSS styles (following template-app pattern)
     */
    loadStyles: function() {
        var cssLink = document.createElement("link");
        cssLink.setAttribute("rel", "stylesheet");
        cssLink.setAttribute("type", "text/css");
        cssLink.setAttribute("href", window.location.origin + '/store/dashpanel/style.css');
        document.head.appendChild(cssLink);
        console.log('✅ Custom styles loaded');
    },

    /**
     * Show vehicle sensors (called from Navigation component)
     * @param {string} vehicleId - Vehicle ID
     * @param {string} vehicleName - Vehicle name
     * @param {Object} vehicleRecord - Vehicle record
     */
    showVehicleSensors: function(vehicleId, vehicleName, vehicleRecord) {
        var me = this;
        
        console.log('🚗 Module: Vehicle selected:', vehicleName, 'ID:', vehicleId);
        
        if (me.mainPanelComponent && me.mainPanelComponent.showVehicleSensors) {
            me.mainPanelComponent.showVehicleSensors(vehicleId, vehicleName, vehicleRecord);
            console.log('✅ Module: Delegated to main panel component');
        } else {
            console.error('❌ Module: Main panel component not available');
        }
    },

    /**
     * Load configuration from JSON file (following template-app pattern)
     * @param {Function} callback - Callback with success boolean
     */
    loadConfiguration: function(callback) {
        var me = this;
        
        Ext.Ajax.request({
            url: window.location.origin + '/store/dashpanel/config.json',
            method: 'GET',
            timeout: 30000,
            success: function(response) {
                try {
                    me.config = Ext.decode(response.responseText);
                    console.log('✅ Configuration loaded:', me.config.module.name, 'v' + me.config.module.version);
                    callback(true);
                } catch (e) {
                    console.error('❌ Failed to parse configuration:', e);
                    me.setFallbackConfig();
                    callback(false);
                }
            },
            failure: function(response) {
                console.warn('⚠️ Failed to load configuration file, using fallback');
                me.setFallbackConfig();
                callback(false);
            }
        });
    },

    /**
     * Load sensor tags from API for dynamic icons
     * @param {Function} callback - Callback function
     */
    loadSensorTags: function(callback) {
        var me = this;
        
        console.log('🔄 Loading sensor tags for dynamic icons...');
        
        Ext.Ajax.request({
            url: 'ax/sensors/tags.php',
            method: 'GET',
            timeout: 30000,
            success: function(response) {
                try {
                    var tags = Ext.decode(response.responseText);
                    me.processSensorTags(tags);
                    console.log('✅ Sensor tags loaded:', Object.keys(me.sensorTagsCache || {}).length, 'tags');
                } catch (e) {
                    console.warn('⚠️ Failed to parse sensor tags, using fallback icons:', e);
                    me.sensorTagsCache = {}; // Set empty cache
                }
                callback();
            },
            failure: function(response) {
                console.warn('⚠️ Failed to load sensor tags, using fallback icons:', response.status);
                me.sensorTagsCache = {}; // Set empty cache
                callback();
            }
        });
    },

    /**
     * Process sensor tags response and create icon cache
     * @param {Array} tags - Array of sensor tag objects
     */
    processSensorTags: function(tags) {
        var me = this;
        me.sensorTagsCache = {};
        me.sensorTagsById = {};
        
        if (Ext.isArray(tags)) {
            Ext.each(tags, function(tag) {
                if (tag.tag_name) {
                    var iconClass;
                    if (tag.icon) {
                        // Convert icon name to FontAwesome class
                        iconClass = me.convertIconToFontAwesome(tag.icon);
                    } else {
                        // Use default icon for null icons
                        iconClass = 'fa fa-microchip';
                    }
                    
                    me.sensorTagsCache[tag.tag_name.toLowerCase()] = iconClass;
                    
                    // Create reverse lookup by tag ID
                    if (tag.id) {
                        me.sensorTagsById[tag.id] = iconClass;
                    }
                }
            });
        }
        
        console.log('✅ Sensor icon cache created with', Object.keys(me.sensorTagsCache).length, 'name mappings and', Object.keys(me.sensorTagsById).length, 'ID mappings');
    },

    /**
     * Convert icon name to FontAwesome class
     * @param {string} iconName - Icon name from API
     * @returns {string} FontAwesome CSS class
     */
    convertIconToFontAwesome: function(iconName) {
        if (!iconName) return 'fa fa-microchip';
        
        // Map specific icons that might need conversion
        var iconMap = {
            'car-battery': 'fa fa-car-battery',
            'car-crash': 'fa fa-car-crash',
            'shield-alt': 'fa fa-shield-alt',
            'satellite-dish': 'fa fa-satellite-dish'
        };
        
        return iconMap[iconName] || 'fa fa-' + iconName;
    },

    /**
     * Get sensor icon from cache or fallback to config
     * @param {string} sensorName - Sensor name
     * @param {string} sensorType - Sensor type (fallback)
     * @returns {string} FontAwesome CSS class
     */
    getSensorIcon: function(sensorName, sensorType) {
        var me = this;
        
        // First check sensor tags cache by exact name match
        if (me.sensorTagsCache && sensorName) {
            var cacheKey = sensorName.toLowerCase();
            if (me.sensorTagsCache[cacheKey]) {
                return me.sensorTagsCache[cacheKey];
            }
        }
        
        // Fallback to config icons by type
        if (me.config && me.config.icons && me.config.icons[sensorType]) {
            return me.config.icons[sensorType];
        }
        
        // Final fallback
        return me.config && me.config.icons ? me.config.icons.default : 'fa fa-microchip';
    },

    /**
     * Set fallback configuration if loading fails
     */
    setFallbackConfig: function() {
        var me = this;
        me.config = {
            module: { name: 'Sensor Monitor (Fallback)', version: '4.0.0' },
            api: { url: '/ax/current_data.php', timeout: 30000 },
            refresh: { interval: 500, minInterval: 100, maxInterval: 10000 },
            ui: { panelHeight: 325, deferredInitDelay: 1000, tabIcon: 'fa fa-list-alt', collapsible: true, resizable: true, animCollapse: 300, navigation: true },
            sensors: { dtcDetectionKeyword: 'group by active dtc', defaultColumns: 3 },
            colors: { normal: '#008000', warning: '#ff8c00', critical: '#ff0000', unknown: '#666666' },
            icons: { default: 'fa fa-microchip', temperature: 'fa fa-thermometer-half', pressure: 'fa fa-tachometer-alt', level: 'fa fa-battery-half', voltage: 'fa fa-bolt', speed: 'fa fa-speedometer', weight: 'fa fa-weight', engine: 'fa fa-cog' },
            thresholds: { temperature: { critical: { min: -20, max: 100 }, warning: { min: 0, max: 80 } }, voltage: { critical: { min: 10, max: 15 }, warning: { min: 11, max: 14 } }, pressure: { critical: { min: 0, max: 100 }, warning: { min: 10, max: 80 } }, level: { critical: { min: 5 }, warning: { min: 15 } } }
        };
    }
});
