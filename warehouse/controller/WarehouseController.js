/**
 * Warehouse Controller
 * Handles all business logic and API operations for warehouse management
 */
Ext.define('Store.warehouse.controller.WarehouseController', {
    extend: 'Ext.Base',
    
    requires: [
        'Store.warehouse.config.ApiConfig'
    ],

    config: {
        mainPanel: null,
        navigationTab: null
    },

    constructor: function(config) {
        this.callParent([config]);
        this.initializeGlobalWarehouseFunctions();
    },

    // ===== DASHBOARD METHODS =====
    
    /**
     * Load dashboard metrics from API
     */
    loadDashboardMetrics: function() {
        console.log('Loading warehouse dashboard metrics...');
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestConfig = apiConfig.createRequestConfig('dashboard', 'GET');
        
        Ext.Ajax.request(Ext.apply(requestConfig, {
            success: this.onDashboardMetricsLoaded.bind(this),
            failure: this.onDashboardLoadFailure.bind(this)
        }));
    },
    
    onDashboardMetricsLoaded: function(response) {
        console.log('Dashboard metrics loaded successfully');
        
        try {
            var result = Ext.decode(response.responseText);
            console.log('Dashboard API Response:', result);
            
            // Handle direct response format from Postman collection
            var responseData = result;
            if (result.status && result.body) {
                responseData = result.body;
            }
            
            if (responseData && responseData.inventoryStatus) {
                var dashboardData = {
                    totalItems: responseData.inventoryStatus.totalItems || 0,
                    totalQuantity: responseData.inventoryStatus.totalQuantity || 0,
                    physicalStock: responseData.inventoryStatus.physicalStock || 0,
                    systemStock: responseData.inventoryStatus.systemStock || 0,
                    variance: responseData.inventoryStatus.variance || 0,
                    activeAlerts: responseData.activeAlerts?.length || 0,
                    todayGoodReceive: responseData.todayActivity?.goodReceiveCount || 0,
                    todayPutAway: responseData.todayActivity?.putAwayCount || 0,
                    todayPicking: responseData.todayActivity?.pickingCount || 0,
                    locationSummary: responseData.locationSummary || []
                };
                
                console.log('Key Dashboard Metrics:', dashboardData);
                this.updateDashboardUI(dashboardData);
                
            } else {
                console.error('Invalid dashboard response format:', result);
                this.showDashboardError();
            }
        } catch (e) {
            console.error('Error parsing dashboard metrics:', e);
            this.showDashboardError();
        }
    },
    
    onDashboardLoadFailure: function(response) {
        console.error('Failed to load dashboard metrics:', response);
        this.showDashboardError();
    },
    
    updateDashboardUI: function(dashboardData) {
        var dashboardPanel = this.findDashboardPanel();
        if (dashboardPanel && dashboardPanel.updateDashboard) {
            dashboardPanel.updateDashboard(dashboardData);
            console.log('✅ Dashboard UI updated successfully');
        } else {
            console.warn('Dashboard panel not found or updateDashboard method missing');
        }
    },
    
    showDashboardError: function() {
        var dashboardData = {
            totalItems: 0, totalQuantity: 0, physicalStock: 0, systemStock: 0,
            variance: 0, activeAlerts: 0, todayGoodReceive: 0, todayPutAway: 0,
            todayPicking: 0, locationSummary: []
        };
        this.updateDashboardUI(dashboardData);
        Ext.Msg.alert('Dashboard Warning', 'Could not load latest dashboard data. Showing default values.');
    },
    
    // ===== GOOD RECEIVE METHODS =====
    
    /**
     * Load inbound deliveries from API
     */
    loadInboundDeliveries: function(filters) {
        console.log('Loading inbound deliveries from API...');
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var params = this.buildQueryParams(filters);
        var url = apiConfig.getUrl('inboundList') + (params ? '?' + params : '');
        
        Ext.Ajax.request({
            url: url,
            method: 'GET',
            headers: apiConfig.getStandardHeaders(),
            timeout: 15000,
            success: function(response) {
                console.log('Inbound deliveries loaded successfully');
                this.processInboundDeliveries(response);
            }.bind(this),
            failure: function(response) {
                console.error('Failed to load inbound deliveries:', response);
                this.handleInboundLoadFailure(response);
            }.bind(this)
        });
    },
    
    processInboundDeliveries: function(response) {
        try {
            var result = Ext.decode(response.responseText);
            console.log('Inbound deliveries API Response:', result);
            
            // Handle direct response format from Postman collection
            var deliveries = null;
            var pagination = null;
            
            if (result.inboundDeliveries) {
                // Direct format from Postman collection
                deliveries = result.inboundDeliveries;
                pagination = result.pagination;
            } else if (result.status === 200 && result.body && result.body.inboundDeliveries) {
                // Wrapped format
                deliveries = result.body.inboundDeliveries;
                pagination = result.body.pagination;
            }
            
            if (deliveries) {
                this.updateInboundGrid(deliveries);
                
                // Update pagination info if available
                if (pagination) {
                    this.updatePaginationInfo(pagination);
                }
            } else {
                console.error('Invalid inbound response format:', result);
                this.handleInboundLoadFailure();
            }
        } catch (e) {
            console.error('Error parsing inbound response:', e);
            this.handleInboundLoadFailure();
        }
    },
    
    updateInboundGrid: function(deliveries) {
        var grid = Ext.ComponentQuery.query('gridpanel[itemId=goodReceiveGrid]')[0];
        if (grid && grid.getStore()) {
            var store = grid.getStore();
            
            // Convert API response to grid format
            var gridData = deliveries.map(function(delivery) {
                return {
                    id: delivery.inboundDeliveryId,
                    deliveryNumber: delivery.deliveryNumber,
                    supplierName: delivery.supplierName,
                    supplierCode: delivery.supplierCode,
                    expectedDeliveryDate: delivery.expectedDeliveryDate,
                    actualDeliveryDate: delivery.actualDeliveryDate,
                    totalItems: delivery.totalItems,
                    totalQuantity: delivery.totalQuantity,
                    status: delivery.status,
                    createdBy: delivery.createdBy,
                    createdDate: delivery.createdDate
                };
            });
            
            store.loadData(gridData);
            console.log('✅ Inbound grid updated with', gridData.length, 'deliveries');
        }
    },
    
    handleInboundLoadFailure: function(response) {
        console.error('Inbound load failure:', response);
        Ext.Msg.alert('Error', 'Failed to load inbound deliveries. Please try again.');
        
        // Clear grid
        var grid = Ext.ComponentQuery.query('gridpanel[itemId=goodReceiveGrid]')[0];
        if (grid && grid.getStore()) {
            grid.getStore().removeAll();
        }
    },
    
    /**
     * Create new inbound delivery
     */
    createInboundDelivery: function(deliveryData) {
        console.log('Creating inbound delivery:', deliveryData);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestConfig = apiConfig.createRequestConfig('inboundCreate', 'POST', deliveryData);
        
        Ext.Ajax.request(Ext.apply(requestConfig, {
            success: function(response) {
                console.log('Inbound delivery created successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    
                    // Handle direct response format from Postman collection
                    if (result.inboundDeliveryId || (result.status === 200 || response.status === 201)) {
                        var deliveryInfo = result.inboundDeliveryId ? result : result.body;
                        var message = 'Inbound delivery created successfully!\n\n' +
                                    'Delivery ID: ' + (deliveryInfo.inboundDeliveryId || 'Generated') + '\n' +
                                    'Delivery Number: ' + (deliveryInfo.deliveryNumber || 'N/A');
                        
                        Ext.Msg.alert('Success', message);
                        this.loadInboundDeliveries(); // Refresh grid
                    } else {
                        Ext.Msg.alert('Error', result.message || 'Failed to create inbound delivery');
                    }
                } catch (e) {
                    console.error('Error parsing create response:', e);
                    Ext.Msg.alert('Error', 'Invalid response from server');
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to create inbound delivery:', response);
                Ext.Msg.alert('Error', 'Failed to create inbound delivery. Network error occurred.');
            }
        }));
    },

    /**
     * Create Good Receive record - aligns with GOOD RECEIVE SEQUENCE DIAGRAM
     * POST /api/warehouse/goodreceive
     */
    createGoodReceive: function(goodReceiveData) {
        console.log('Creating good receive record:', goodReceiveData);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestConfig = apiConfig.createRequestConfig('goodReceiveCreate', 'POST', goodReceiveData);
        
        Ext.Ajax.request(Ext.apply(requestConfig, {
            success: function(response) {
                console.log('Good receive record created successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    
                    // Handle response format from Postman collection
                    if (result.goodReceiveId || (result.status === 200 || response.status === 201)) {
                        var goodReceiveInfo = result.goodReceiveId ? result : result.body;
                        this.handleGoodReceiveCreated(goodReceiveInfo);
                    } else {
                        Ext.Msg.alert('Error', result.message || 'Failed to create good receive');
                    }
                } catch (e) {
                    console.error('Error parsing good receive response:', e);
                    Ext.Msg.alert('Error', 'Invalid response from server');
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to create good receive:', response);
                Ext.Msg.alert('Error', 'Failed to create good receive. Network error occurred.');
            }
        }));
    },

    /**
     * Confirm Good Receive via RFID scanning - aligns with GOOD RECEIVE SEQUENCE DIAGRAM
     * POST /api/warehouse/goodreceive/confirm
     */
    confirmGoodReceive: function(goodReceiveId, rfidScanData) {
        console.log('Confirming good receive via RFID:', goodReceiveId);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestData = {
            goodReceiveId: goodReceiveId,
            rfidScanData: {
                readerId: rfidScanData.readerId || 'RFID-READER-001',
                location: rfidScanData.location || 'INBOUND-STAGING',
                scannedTags: rfidScanData.scannedTags || [],
                scannedBy: 'operator@company.com'
            }
        };
        
        Ext.Ajax.request({
            url: apiConfig.getUrl('goodReceiveConfirm'),
            method: 'POST',
            headers: apiConfig.getStandardHeaders(),
            jsonData: requestData,
            timeout: 15000,
            success: function(response) {
                console.log('Good receive confirmed successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    
                    // Handle response format from Postman collection
                    if (result.goodReceiveId || result.status === 'rfid_confirmed' || response.status === 200) {
                        var confirmData = result.goodReceiveId ? result : result;
                        this.handleGoodReceiveRFIDConfirmed(confirmData);
                        this.loadInboundDeliveries(); // Refresh grid
                        this.loadDashboardMetrics(); // Update dashboard
                    } else {
                        Ext.Msg.alert('Error', result.message || 'Failed to confirm good receive');
                    }
                } catch (e) {
                    console.error('Error parsing confirm good receive response:', e);
                    Ext.Msg.alert('Error', 'Invalid response from server');
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to confirm good receive:', response);
                Ext.Msg.alert('Error', 'Failed to confirm good receive. Please try again.');
            }
        });
    },

    /**
     * Reverse Good Receive - aligns with API CONTRACTS SPECIFICATION
     * POST /api/warehouse/goodreceive/reverse
     */
    reverseGoodReceive: function(goodReceiveId, reverseReason) {
        console.log('Reversing good receive:', goodReceiveId);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestData = {
            goodReceiveId: goodReceiveId,
            reverseReason: reverseReason,
            reversedBy: 'current_user', // Replace with actual user
            reverseTime: new Date().toISOString()
        };
        
        Ext.Ajax.request({
            url: apiConfig.getUrl('goodReceiveReverse'),
            method: 'POST',
            headers: apiConfig.getStandardHeaders(),
            jsonData: requestData,
            timeout: 15000,
            success: function(response) {
                console.log('Good receive reversed successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        Ext.Msg.alert('Success', 'Good receive reversed successfully!');
                        this.loadInboundDeliveries(); // Refresh grid
                        this.loadDashboardMetrics(); // Update dashboard
                    }
                } catch (e) {
                    console.error('Error parsing reverse good receive response:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to reverse good receive:', response);
                Ext.Msg.alert('Error', 'Failed to reverse good receive. Please try again.');
            }
        });
    },

    /**
     * Generate RFID tags after SAP Goods Receipt - NEW METHOD aligned with Demo Scenario
     * POST /api/warehouse/rfid/generate-tags
     */
    generateRFIDTags: function(goodReceiveId) {
        console.log('Generating RFID tags for good receive:', goodReceiveId);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestData = {
            itemCode: 'ITM001', // Default item - should be passed from UI
            quantity: 100, // Default quantity - should be passed from UI
            companyPrefix: '0123456',
            itemReference: '789012',
            lotNumber: 'LOT-2024-001',
            expiryDate: '2025-12-15',
            generatedBy: 'current_user',
            purpose: 'new_inventory',
            printLabels: true,
            printerName: 'ZEBRA-PRINTER-001'
        };
        
        Ext.Ajax.request({
            url: apiConfig.getUrl('rfidGenerateTags'), // Use correct endpoint from Postman collection
            method: 'POST',
            headers: apiConfig.getStandardHeaders(),
            jsonData: requestData,
            timeout: 15000,
            success: function(response) {
                console.log('RFID tags generated successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    this.handleRFIDTagsGenerated(result);
                } catch (e) {
                    console.error('Error parsing tag generation response:', e);
                    Ext.Msg.alert('Error', 'Failed to process tag generation response');
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to generate RFID tags:', response);
                Ext.Msg.alert('Error', 'Failed to generate RFID tags. Please try again.');
            }
        });
    },

    /**
     * CRITICAL: RFID Confirmation method - WHERE INVENTORY QUANTITY INCREASES
     * This replaces the old confirmGoodReceive method for the actual inventory update
     * POST /api/warehouse/rfid/confirm-goodreceive
     */
    confirmGoodReceiveRFID: function(goodReceiveId, rfidScanData) {
        console.log('🔥 CRITICAL: RFID confirmation - INVENTORY WILL INCREASE:', goodReceiveId);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestData = {
            goodReceiveId: goodReceiveId,
            operation: 'goods_receipt_confirm',
            scannedTags: rfidScanData.scannedTags,
            location: 'inbound_area',
            confirmedBy: 'current_user',
            confirmationTime: new Date().toISOString()
        };
        
        Ext.Ajax.request({
            url: apiConfig.getUrl('rfidScan'),
            method: 'POST',
            headers: apiConfig.getStandardHeaders(),
            jsonData: requestData,
            timeout: 15000,
            success: function(response) {
                console.log('🎉 INVENTORY INCREASED: Good receive RFID confirmation completed');
                try {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        this.handleGoodReceiveRFIDConfirmed(result.body);
                        this.loadInboundDeliveries(); // Refresh grid
                        this.loadDashboardMetrics(); // Update dashboard with new inventory
                    }
                } catch (e) {
                    console.error('Error parsing RFID confirmation response:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to confirm good receive via RFID:', response);
                Ext.Msg.alert('Error', 'Failed to confirm good receive via RFID. Please try again.');
            }
        });
    },

    handleRFIDTagsGenerated: function(tagData) {
        console.log('RFID tags generated:', tagData);
        
        // Handle response format from Postman collection
        var generatedTags = tagData.generatedEPCs || tagData.epcCodes || [];
        
        var message = [
            'RFID Tags Generated Successfully!',
            '',
            'Generated EPC Tags: ' + generatedTags.length,
            '',
            '⚠️ NEXT STEPS:',
            '1. Print tags and manually attach to gold item boxes',
            '2. Perform RFID scan confirmation to increase inventory'
        ].join('\n');
        
        Ext.Msg.alert('RFID Tags Generated', message);
    },

    handleGoodReceiveRFIDConfirmed: function(confirmationData) {
        console.log('🎉 INVENTORY UPDATED: Good receive RFID confirmed:', confirmationData);
        
        // Handle response format from Postman collection
        var scanResults = confirmationData.scanResults || {};
        var inventoryUpdate = confirmationData.inventoryUpdate || {};
        
        var message = [
            '✅ Good Receive RFID Confirmation Completed!',
            '',
            '📦 Total Scanned: ' + (scanResults.totalScanned || 0),
            '📦 Found Tags: ' + (scanResults.foundTags || 0),
            '📦 Missing Tags: ' + (scanResults.missingTags || 0),
            '📈 ' + (inventoryUpdate.message || 'Items added to inventory'),
            '📍 Location: ' + (inventoryUpdate.location || 'inbound_area'),
            '',
            '🔄 ' + (confirmationData.nextAction || 'Items are now ready for Put Away operations')
        ].join('\n');
        
        Ext.Msg.alert('✅ Inventory Updated', message);
    },

    handleGoodReceiveCreated: function(goodReceiveData) {
        console.log('Good receive created - awaiting RFID confirmation:', goodReceiveData);
        
        // Handle response format from Postman collection
        var generatedEPCs = goodReceiveData.generatedEPCs || [];
        
        var message = [
            'Good Receive Created Successfully!',
            '',
            'Good Receive ID: ' + (goodReceiveData.goodReceiveId || 'Generated'),
            'Delivery Number: ' + (goodReceiveData.deliveryNumber || 'N/A'),
            'Status: ' + (goodReceiveData.status || 'pending_confirmation'),
            'Expected Items: ' + (goodReceiveData.expectedItems || 0),
            'Total Quantity: ' + (goodReceiveData.totalQuantity || 0),
            'Generated EPCs: ' + generatedEPCs.length,
            '',
            '⚠️ NOTE: Inventory will increase only after RFID confirmation.'
        ].join('\n');
        
        Ext.Msg.alert('Good Receive Created', message);
        this.loadInboundDeliveries(); // Refresh grid
    },
    
    // ===== PUT AWAY METHODS =====
    
    /**
     * Load put away tasks from API
     * Aligns with GET /api/warehouse/putaway from sequence diagrams
     */
    loadPutAwayTasks: function(filters) {
        console.log('Loading put away tasks from API...');
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var params = this.buildQueryParams(filters);
        var url = apiConfig.getUrl('putAwayList') + (params ? '?' + params : '');
        
        Ext.Ajax.request({
            url: url,
            method: 'GET',
            headers: apiConfig.getStandardHeaders(),
            timeout: 15000,
            success: function(response) {
                console.log('Put away tasks loaded successfully');
                this.processPutAwayTasks(response);
            }.bind(this),
            failure: function(response) {
                console.error('Failed to load put away tasks:', response);
                this.handlePutAwayLoadFailure(response);
            }.bind(this)
        });
    },

    /**
     * Start put away task - aligns with PUT AWAY SEQUENCE DIAGRAM
     * POST /api/warehouse/putaway/start
     */
    startPutAwayTask: function(putAwayId) {
        console.log('Starting put away task:', putAwayId);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestData = {
            putAwayId: putAwayId,
            startedBy: 'current_user', // Replace with actual user
            startTime: new Date().toISOString()
        };
        
        Ext.Ajax.request({
            url: apiConfig.getUrl('putAwayList') + '/start', // Extends putaway endpoint
            method: 'POST',
            headers: apiConfig.getStandardHeaders(),
            jsonData: requestData,
            timeout: 15000,
            success: function(response) {
                console.log('Put away task started successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        Ext.Msg.alert('Success', 'Put away task started. Proceed with RFID scanning.');
                        this.loadPutAwayTasks(); // Refresh tasks
                    }
                } catch (e) {
                    console.error('Error parsing start put away response:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to start put away task:', response);
                Ext.Msg.alert('Error', 'Failed to start put away task. Please try again.');
            }
        });
    },

    /**
     * Confirm put away completion - aligns with PUT AWAY SEQUENCE DIAGRAM
     * POST /api/warehouse/putaway/confirm
     */
    confirmPutAway: function(putAwayId, validationData) {
        console.log('Confirming put away completion:', putAwayId);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestData = {
            putAwayId: putAwayId,
            validationData: validationData,
            completedBy: 'current_user', // Replace with actual user
            completionTime: new Date().toISOString()
        };
        
        Ext.Ajax.request({
            url: apiConfig.getUrl('putAwayList') + '/confirm', // Extends putaway endpoint
            method: 'POST',
            headers: apiConfig.getStandardHeaders(),
            jsonData: requestData,
            timeout: 15000,
            success: function(response) {
                console.log('Put away confirmed successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        Ext.Msg.alert('Success', 'Put away completed successfully!');
                        this.loadPutAwayTasks(); // Refresh tasks
                        this.loadDashboardMetrics(); // Update dashboard
                    }
                } catch (e) {
                    console.error('Error parsing confirm put away response:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to confirm put away:', response);
                Ext.Msg.alert('Error', 'Failed to confirm put away. Please try again.');
            }
        });
    },
    
    processPutAwayTasks: function(response, textStatus, jqXHR) {
        console.log('Put Away API Response:', response);
        
        try {
            var result = Ext.decode(response.responseText);
            console.log('Put away tasks API Response:', result);
            
            // Handle direct response format from Postman collection
            var tasks = null;
            var pagination = null;
            
            if (result.putAwayTasks && Array.isArray(result.putAwayTasks)) {
                // Direct format from Postman collection
                tasks = result.putAwayTasks;
                pagination = result.pagination;
                console.log(`Processing ${tasks.length} put away tasks from API`);
            } else if (result.status === 200 && result.body && result.body.putAwayTasks) {
                // Wrapped format (fallback)
                tasks = result.body.putAwayTasks;
                pagination = result.body.pagination;
                console.log(`Processing ${tasks.length} put away tasks from wrapped API`);
            } else {
                console.error('Invalid put away response format:', result);
                this.showAlert('Invalid API response format', 'error');
                this.handlePutAwayLoadFailure();
                return;
            }
            
            if (tasks !== null) {
                this.updatePutAwayGrid(tasks);
                
                // Update pagination info if available
                if (pagination) {
                    this.updatePaginationInfo(pagination);
                }
                
                console.log('✅ Put away tasks loaded successfully');
                this.showAlert(`Loaded ${tasks.length} put away tasks`, 'success');
            }
            
        } catch (e) {
            console.error('Error parsing put away response:', e);
            this.showAlert('Error processing put away tasks: ' + e.message, 'error');
            this.handlePutAwayLoadFailure();
        }
    },
    
    updatePutAwayGrid: function(tasks) {
        var grid = Ext.ComponentQuery.query('gridpanel[itemId=putAwayGrid]')[0];
        if (grid && grid.getStore()) {
            var store = grid.getStore();
            
            // Convert API response to grid format - tasks is already the correct array
            var gridData = tasks.map(function(task) {
                return {
                    id: task.putAwayId,
                    transferOrderNumber: task.transferOrderNumber,
                    fromLocation: task.fromLocation,
                    toLocation: task.toLocation,
                    totalItems: task.totalItems || 0,
                    totalQuantity: task.totalQuantity || 0,
                    status: task.status,
                    priority: task.priority,
                    assignedTo: task.assignedTo,
                    createdBy: task.createdBy,
                    createdDate: task.createdDate,
                    estimatedCompletion: task.estimatedCompletion,
                    startedAt: task.startedAt,
                    completedAt: task.completedAt,
                    sapConfirmed: task.sapConfirmed
                };
            });
            
            store.loadData(gridData);
            console.log('✅ Put away grid updated with', gridData.length, 'tasks');
        }
    },
    
    /**
     * Show alert message to user
     */
    showAlert: function(message, type) {
        type = type || 'info';
        var title = type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Information';
        var iconType = type === 'error' ? Ext.Msg.ERROR : type === 'success' ? Ext.Msg.INFO : Ext.Msg.INFO;
        
        Ext.Msg.show({
            title: title,
            message: message,
            buttons: Ext.Msg.OK,
            icon: iconType
        });
    },
    
    /**
     * Get put away store - utility method
     */
    getPutAwayStore: function() {
        var grid = Ext.ComponentQuery.query('gridpanel[itemId=putAwayGrid]')[0];
        return grid ? grid.getStore() : null;
    },
    
    handlePutAwayLoadFailure: function(response) {
        console.error('Put away load failure:', response);
        Ext.Msg.alert('Error', 'Failed to load put away tasks. Please try again.');
        
        // Clear grid
        var grid = Ext.ComponentQuery.query('gridpanel[itemId=putAwayGrid]')[0];
        if (grid && grid.getStore()) {
            grid.getStore().removeAll();
        }
    },
    
    // ===== PICKING METHODS =====
    
    /**
     * Load picking tasks from API
     * Aligns with GET /api/warehouse/picking from sequence diagrams
     */
    loadPickingTasks: function(filters) {
        console.log('Loading picking tasks from API...');
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var params = this.buildQueryParams(filters);
        var url = apiConfig.getUrl('pickingList') + (params ? '?' + params : '');
        
        Ext.Ajax.request({
            url: url,
            method: 'GET',
            headers: apiConfig.getStandardHeaders(),
            timeout: 15000,
            success: function(response) {
                console.log('Picking tasks loaded successfully');
                this.processPickingTasks(response);
            }.bind(this),
            failure: function(response) {
                console.error('Failed to load picking tasks:', response);
                this.handlePickingLoadFailure(response);
            }.bind(this)
        });
    },

    /**
     * Start picking task - aligns with PICKING SEQUENCE DIAGRAM
     * POST /api/warehouse/picking/start
     */
    startPickingTask: function(pickingId) {
        console.log('Starting picking task:', pickingId);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestData = {
            pickingId: pickingId,
            startedBy: 'current_user', // Replace with actual user
            startTime: new Date().toISOString()
        };
        
        Ext.Ajax.request({
            url: apiConfig.getUrl('pickingStart'),
            method: 'POST',
            headers: apiConfig.getStandardHeaders(),
            jsonData: requestData,
            timeout: 15000,
            success: function(response) {
                console.log('Picking task started successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        Ext.Msg.alert('Success', 'Picking task started. Begin RFID scanning at pick locations.');
                        this.loadPickingTasks(); // Refresh tasks
                    }
                } catch (e) {
                    console.error('Error parsing start picking response:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to start picking task:', response);
                Ext.Msg.alert('Error', 'Failed to start picking task. Please try again.');
            }
        });
    },

    /**
     * Validate picking scan - aligns with PICKING SEQUENCE DIAGRAM
     * POST /api/warehouse/picking/validate
     */
    validatePickingScan: function(pickingId, scanData) {
        console.log('Validating picking scan for task:', pickingId);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestData = {
            pickingId: pickingId,
            scannedTags: scanData.scannedTags,
            location: scanData.location,
            scannedBy: 'current_user' // Replace with actual user
        };
        
        Ext.Ajax.request({
            url: apiConfig.getUrl('pickingValidate'),
            method: 'POST',
            headers: apiConfig.getStandardHeaders(),
            jsonData: requestData,
            timeout: 15000,
            success: function(response) {
                console.log('Picking scan validated successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        this.handlePickingValidationSuccess(result.body);
                    }
                } catch (e) {
                    console.error('Error parsing picking validation response:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to validate picking scan:', response);
                Ext.Msg.alert('Error', 'Failed to validate picking scan. Please try again.');
            }
        });
    },

    /**
     * Confirm picking completion - aligns with PICKING SEQUENCE DIAGRAM
     * POST /api/warehouse/picking/confirm
     */
    confirmPickingCompletion: function(pickingId, gateExitData) {
        console.log('Confirming picking completion:', pickingId);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestData = {
            pickingId: pickingId,
            gateExitScan: gateExitData,
            completedBy: 'current_user', // Replace with actual user
            completionTime: new Date().toISOString()
        };
        
        Ext.Ajax.request({
            url: apiConfig.getUrl('pickingConfirm'),
            method: 'POST',
            headers: apiConfig.getStandardHeaders(),
            jsonData: requestData,
            timeout: 15000,
            success: function(response) {
                console.log('Picking completion confirmed successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        Ext.Msg.alert('Success', 'Picking completed successfully! Items have exited gold room.');
                        this.loadPickingTasks(); // Refresh tasks
                        this.loadDashboardMetrics(); // Update dashboard
                    }
                } catch (e) {
                    console.error('Error parsing confirm picking response:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to confirm picking completion:', response);
                Ext.Msg.alert('Error', 'Failed to confirm picking completion. Please try again.');
            }
        });
    },

    handlePickingValidationSuccess: function(validationResult) {
        console.log('Picking validation result:', validationResult);
        
        var message = [
            'Picking Validation Results:',
            '',
            'Items validated for picking:',
            validationResult.validatedItems?.length || 0,
            '',
            'Proceed to gate exit for completion.'
        ].join('\n');
        
        Ext.Msg.alert('Picking Validation', message);
    },
    
    processPickingTasks: function(response) {
        try {
            var result = Ext.decode(response.responseText);
            console.log('Picking tasks API Response:', result);
            
            // Handle direct response format from Postman collection
            var tasks = null;
            var pagination = null;
            
            if (result.pickingTasks && Array.isArray(result.pickingTasks)) {
                // Direct format from Postman collection
                tasks = result.pickingTasks;
                pagination = result.pagination;
                console.log(`Processing ${tasks.length} picking tasks from API`);
            } else if (result.status === 200 && result.body && result.body.pickingTasks) {
                // Wrapped format (fallback)
                tasks = result.body.pickingTasks;
                pagination = result.body.pagination;
                console.log(`Processing ${tasks.length} picking tasks from wrapped API`);
            } else {
                console.error('Invalid picking response format:', result);
                console.error('Expected pickingTasks array, got:', typeof result.pickingTasks);
                this.handlePickingLoadFailure();
                return;
            }
            
            if (tasks !== null) {
                this.updatePickingGrid(tasks);
                
                // Update pagination info if available
                if (pagination) {
                    this.updatePaginationInfo(pagination);
                }
                
                console.log('✅ Picking tasks loaded successfully');
            }
            
        } catch (e) {
            console.error('Error parsing picking response:', e);
            this.handlePickingLoadFailure();
        }
    },
    
    updatePickingGrid: function(tasks) {
        var grid = Ext.ComponentQuery.query('gridpanel[itemId=pickingGrid]')[0];
        if (!grid) {
            // Try alternative grid queries with valid selectors
            var grids = Ext.ComponentQuery.query('grid');
            for (var i = 0; i < grids.length; i++) {
                var testGrid = grids[i];
                if (testGrid.getStore) {
                    var store = testGrid.getStore();
                    if (store && store.getFields) {
                        try {
                            var fields = store.getFields();
                            var hasPickingFields = false;
                            for (var j = 0; j < fields.length; j++) {
                                var fieldName = fields[j].name;
                                if (fieldName === 'outbound_delivery_number' ||
                                    fieldName === 'customer_name' ||
                                    fieldName === 'sales_order_number') {
                                    hasPickingFields = true;
                                    break;
                                }
                            }
                            if (hasPickingFields) {
                                grid = testGrid;
                                console.log('✅ Found picking grid via field detection');
                                break;
                            }
                        } catch (e) {
                            // Skip this grid if field detection fails
                            continue;
                        }
                    }
                }
            }
        }
        
        if (grid && grid.getStore()) {
            var store = grid.getStore();
            
            // Convert API response to grid format - tasks is already the correct array
            var gridData = tasks.map(function(task) {
                return {
                    id: task.picking_task_id || task.pickingId,
                    outbound_delivery_number: task.outbound_delivery_number,
                    customer_name: task.customer_name,
                    customer_code: task.customer_code,
                    delivery_date: task.delivery_date,
                    sales_order_number: task.sales_order_number,
                    total_items: task.total_items || 0,
                    picked_items: task.picked_items || 0,
                    status: task.status,
                    priority: task.priority,
                    assigned_to: task.assigned_to,
                    created_at: task.created_at,
                    created_by_name: task.created_by_name,
                    completed_at: task.completed_at,
                    completed_by_name: task.completed_by_name
                };
            });
            
            store.loadData(gridData);
            console.log('✅ Picking grid updated with', gridData.length, 'tasks');
        } else {
            console.error('❌ Picking grid not found - Available grids:',
                Ext.ComponentQuery.query('grid').length);
            console.error('❌ Looking for picking panel store directly...');
            
            // Try to find picking panel and get its grid
            var pickingPanel = Ext.ComponentQuery.query('Store\\.warehouse\\.view\\.PickingPanel')[0];
            if (pickingPanel) {
                var panelGrid = pickingPanel.down('grid');
                if (panelGrid && panelGrid.getStore()) {
                    panelGrid.getStore().loadData(tasks.map(function(task) {
                        return {
                            id: task.picking_task_id || task.pickingId,
                            outbound_delivery_number: task.outbound_delivery_number,
                            customer_name: task.customer_name,
                            customer_code: task.customer_code,
                            delivery_date: task.delivery_date,
                            sales_order_number: task.sales_order_number,
                            total_items: task.total_items || 0,
                            picked_items: task.picked_items || 0,
                            status: task.status,
                            priority: task.priority,
                            assigned_to: task.assigned_to,
                            created_at: task.created_at,
                            created_by_name: task.created_by_name,
                            completed_at: task.completed_at,
                            completed_by_name: task.completed_by_name
                        };
                    }));
                    console.log('✅ Found picking grid via panel query, updated with', tasks.length, 'tasks');
                } else {
                    console.error('❌ No grid found in picking panel');
                }
            } else {
                console.error('❌ Picking panel not found');
            }
        }
    },
    
    handlePickingLoadFailure: function(response) {
        console.error('Picking load failure:', response);
        Ext.Msg.alert('Error', 'Failed to load picking tasks. Please try again.');
        
        // Clear grid
        var grid = Ext.ComponentQuery.query('gridpanel[itemId=pickingGrid]')[0];
        if (grid && grid.getStore()) {
            grid.getStore().removeAll();
        }
    },
    
    // ===== RFID SCANNING METHODS =====
    
    /**
     * Process RFID scan data
     */
    processRFIDScan: function(scanData) {
        console.log('Processing RFID scan:', scanData);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestConfig = apiConfig.createRequestConfig('rfidScan', 'POST', scanData);
        
        Ext.Ajax.request(Ext.apply(requestConfig, {
            success: function(response) {
                console.log('RFID scan processed successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        this.handleRFIDScanSuccess(result.body);
                    } else {
                        this.handleRFIDScanFailure(result.body?.message || 'RFID scan failed');
                    }
                } catch (e) {
                    console.error('Error parsing RFID scan response:', e);
                    this.handleRFIDScanFailure('Invalid response from server');
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to process RFID scan:', response);
                this.handleRFIDScanFailure('Network error occurred');
            }.bind(this)
        }));
    },
    
    handleRFIDScanSuccess: function(scanResult) {
        console.log('RFID scan result:', scanResult);
        
        // Update UI with scan results
        var summary = scanResult.summary || {};
        var message = [
            'RFID Scan Completed',
            '',
            'Total Scanned: ' + (summary.totalScanned || 0),
            'Expected Tags: ' + (summary.expectedTags || 0), 
            'Found Tags: ' + (summary.foundTags || 0),
            'Missing Tags: ' + (summary.missingTags || 0),
            'Unexpected Tags: ' + (summary.unexpectedTags || 0)
        ].join('\n');
        
        Ext.Msg.alert('RFID Scan Results', message);
        
        // Trigger UI updates based on operation type
        if (scanResult.operationStatus === 'completed') {
            this.refreshCurrentModule();
        }
    },
    
    handleRFIDScanFailure: function(errorMessage) {
        Ext.Msg.alert('RFID Scan Failed', errorMessage);
    },

    /**
     * Validate RFID location for put away - aligns with PUT AWAY SEQUENCE DIAGRAM
     * POST /api/warehouse/rfid/validate
     */
    validateRFIDLocation: function(putAwayId, locationScanData) {
        console.log('Validating RFID location for put away:', putAwayId);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestData = {
            putAwayId: putAwayId,
            location: locationScanData.location,
            scannedTags: locationScanData.scannedTags,
            validationType: 'putaway_location',
            scannedBy: 'current_user' // Replace with actual user
        };
        
        Ext.Ajax.request({
            url: apiConfig.getUrl('rfidScan'), // Uses same endpoint with different operation type
            method: 'POST',
            headers: apiConfig.getStandardHeaders(),
            jsonData: requestData,
            timeout: 15000,
            success: function(response) {
                console.log('RFID location validation completed');
                try {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        this.handleLocationValidationSuccess(result.body);
                    } else {
                        this.handleLocationValidationFailure(result.body?.message || 'Location validation failed');
                    }
                } catch (e) {
                    console.error('Error parsing location validation response:', e);
                    this.handleLocationValidationFailure('Invalid response from server');
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to validate RFID location:', response);
                this.handleLocationValidationFailure('Network error occurred');
            }.bind(this)
        });
    },

    handleLocationValidationSuccess: function(validationResult) {
        console.log('Location validation result:', validationResult);
        
        var summary = validationResult.summary || {};
        var message = [
            'Location Validation Results:',
            '',
            'Items validated at location: ' + (summary.validatedItems || 0),
            'Mismatched items: ' + (summary.mismatchedItems || 0),
            '',
            validationResult.allValid ? 'Proceed with put away confirmation.' : 'Please resolve mismatches before continuing.'
        ].join('\n');
        
        Ext.Msg.alert('Location Validation', message);
        
        if (validationResult.allValid) {
            // Auto-trigger put away confirmation if all items validated
            this.confirmPutAway(validationResult.putAwayId, validationResult);
        }
    },

    handleLocationValidationFailure: function(errorMessage) {
        Ext.Msg.alert('Location Validation Failed', errorMessage);
    },
    
    // ===== MASTER DATA METHODS =====
    
    /**
     * Load items from API
     */
    loadItems: function(filters) {
        console.log('Loading items from API...');
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var params = this.buildQueryParams(filters);
        var url = apiConfig.getUrl('itemsList') + (params ? '?' + params : '');
        
        Ext.Ajax.request({
            url: url,
            method: 'GET',
            headers: apiConfig.getStandardHeaders(),
            timeout: 15000,
            success: function(response) {
                console.log('Items loaded successfully');
                this.processItems(response);
            }.bind(this),
            failure: function(response) {
                console.error('Failed to load items:', response);
                this.handleItemsLoadFailure(response);
            }.bind(this)
        });
    },
    
    processItems: function(response) {
        try {
            var result = Ext.decode(response.responseText);
            console.log('Items API Response:', result);
            
            // Handle direct response format from backend: {items: Array, pagination: Object}
            var items = null;
            var pagination = null;
            
            if (result.items && Array.isArray(result.items)) {
                // Direct format from backend
                items = result.items;
                pagination = result.pagination;
                console.log(`Processing ${items.length} items from direct API response`);
            } else if (result.status === 200 && result.body && result.body.items) {
                // Wrapped format (fallback)
                items = result.body.items;
                pagination = result.body.pagination;
                console.log(`Processing ${items.length} items from wrapped API response`);
            } else {
                console.error('Invalid items response format:', result);
                console.error('Expected items array, got:', typeof result.items);
                this.handleItemsLoadFailure();
                return;
            }
            
            if (items !== null) {
                this.updateItemsGrid(items);
                
                // Update pagination info if available
                if (pagination) {
                    this.updatePaginationInfo(pagination);
                }
                
                console.log('✅ Items loaded successfully');
            }
            
        } catch (e) {
            console.error('Error parsing items response:', e);
            this.handleItemsLoadFailure();
        }
    },
    
    updateItemsGrid: function(items) {
        var grid = Ext.ComponentQuery.query('gridpanel[itemId=itemsGrid]')[0];
        if (!grid) {
            // Try fallback grid detection methods
            var grids = Ext.ComponentQuery.query('grid');
            for (var i = 0; i < grids.length; i++) {
                var testGrid = grids[i];
                if (testGrid.getStore) {
                    var store = testGrid.getStore();
                    if (store && store.getFields) {
                        try {
                            var fields = store.getFields();
                            var hasItemFields = false;
                            for (var j = 0; j < fields.length; j++) {
                                var fieldName = fields[j].name;
                                if (fieldName === 'item_code' ||
                                    fieldName === 'item_name' ||
                                    fieldName === 'material_type') {
                                    hasItemFields = true;
                                    break;
                                }
                            }
                            if (hasItemFields) {
                                grid = testGrid;
                                console.log('✅ Found items grid via field detection');
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }
        }
        
        if (grid && grid.getStore()) {
            var store = grid.getStore();
            
            // Convert API response to grid format with camelCase to snake_case mapping
            var gridData = items.map(function(item) {
                return {
                    id: item.itemId || item.item_id,
                    item_code: item.itemCode || item.item_code,
                    item_name: item.itemName || item.item_name,
                    material_type: item.materialType || item.material_type,
                    base_unit: item.baseUnit || item.base_unit,
                    item_group: item.itemGroup || item.item_group,
                    storage_location: item.storageLocation || item.storage_location,
                    current_stock: item.currentStock || item.current_stock || 0,
                    reserved_stock: item.reservedStock || item.reserved_stock || 0,
                    available_stock: item.availableStock || item.available_stock || 0,
                    last_movement_date: item.lastMovementDate || item.last_movement_date,
                    created_by: item.createdBy || item.created_by,
                    created_date: item.createdDate || item.created_date,
                    updated_by: item.updatedBy || item.updated_by,
                    updated_date: item.updatedDate || item.updated_date,
                    status: item.status || 'active'
                };
            });
            
            store.loadData(gridData);
            console.log('✅ Items grid updated with', gridData.length, 'items');
        } else {
            console.error('❌ Items grid not found - Available grids:',
                Ext.ComponentQuery.query('grid').length);
            
            // Try to find master data panel and get its grid
            var masterDataPanel = Ext.ComponentQuery.query('Store\\.warehouse\\.view\\.MasterDataPanel')[0];
            if (masterDataPanel) {
                var panelGrid = masterDataPanel.down('grid');
                if (panelGrid && panelGrid.getStore()) {
                    var gridData = items.map(function(item) {
                        return {
                            id: item.itemId || item.item_id,
                            item_code: item.itemCode || item.item_code,
                            item_name: item.itemName || item.item_name,
                            material_type: item.materialType || item.material_type,
                            base_unit: item.baseUnit || item.base_unit,
                            item_group: item.itemGroup || item.item_group,
                            storage_location: item.storageLocation || item.storage_location,
                            current_stock: item.currentStock || item.current_stock || 0,
                            reserved_stock: item.reservedStock || item.reserved_stock || 0,
                            available_stock: item.availableStock || item.available_stock || 0,
                            last_movement_date: item.lastMovementDate || item.last_movement_date,
                            created_by: item.createdBy || item.created_by,
                            created_date: item.createdDate || item.created_date,
                            updated_by: item.updatedBy || item.updated_by,
                            updated_date: item.updatedDate || item.updated_date,
                            status: item.status || 'active'
                        };
                    });
                    panelGrid.getStore().loadData(gridData);
                    console.log('✅ Found items grid via panel query, updated with', items.length, 'items');
                } else {
                    console.error('❌ No grid found in master data panel');
                }
            } else {
                console.error('❌ Master data panel not found');
            }
        }
    },
    
    handleItemsLoadFailure: function(response) {
        console.error('Items load failure:', response);
        Ext.Msg.alert('Error', 'Failed to load items. Please try again.');
        
        // Clear grid
        var grid = Ext.ComponentQuery.query('gridpanel[itemId=itemsGrid]')[0];
        if (grid && grid.getStore()) {
            grid.getStore().removeAll();
        }
    },
    
    // ===== UTILITY METHODS =====
    
    /**
     * Build query parameters string from filters object
     */
    buildQueryParams: function(filters) {
        if (!filters) return '';
        
        var params = [];
        Object.keys(filters).forEach(function(key) {
            var value = filters[key];
            if (value !== null && value !== undefined && value !== '') {
                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
        });
        
        return params.join('&');
    },
    
    /**
     * Format date to ISO string for API
     */
    formatDateToISO: function(dateValue) {
        if (!dateValue) return null;
        
        var date = dateValue instanceof Date ? dateValue : new Date(dateValue);
        return isNaN(date.getTime()) ? null : date.toISOString();
    },
    
    /**
     * Refresh current active module
     */
    refreshCurrentModule: function() {
        // Determine which module is currently active and refresh its data
        var navTab = this.getNavigationTab();
        if (navTab && navTab.getActiveTab) {
            var activeTab = navTab.getActiveTab();
            if (activeTab) {
                var tabId = activeTab.getItemId();
                switch(tabId) {
                    case 'dashboardTab':
                        this.loadDashboardMetrics();
                        break;
                    case 'goodReceiveTab':
                        this.loadInboundDeliveries();
                        break;
                    case 'putAwayTab':
                        this.loadPutAwayTasks();
                        break;
                    case 'pickingTab':
                        this.loadPickingTasks();
                        break;
                    case 'masterDataTab':
                        this.loadItems();
                        break;
                }
            }
        }
    },
    
    /**
     * Find dashboard panel
     */
    findDashboardPanel: function() {
        return Ext.ComponentQuery.query('Store\\.warehouse\\.view\\.Dashboard')[0];
    },
    
    /**
     * Update pagination info
     */
    updatePaginationInfo: function(pagination) {
        console.log('Pagination info:', pagination);
        // Update pagination controls if implemented
    },
    
    /**
     * Initialize global warehouse functions - FULLY ALIGNED WITH SEQUENCE DIAGRAMS
     */
    initializeGlobalWarehouseFunctions: function() {
        window.warehouseController = this;
        
        window.warehouse = {
            // Dashboard methods
            refreshDashboard: function() {
                this.loadDashboardMetrics();
            }.bind(this),
            
            // Good Receive workflow methods - aligned with GOOD RECEIVE SEQUENCE DIAGRAM
            refreshInbound: function() {
                this.loadInboundDeliveries();
            }.bind(this),
            
            createGoodReceive: function(goodReceiveData) {
                this.createGoodReceive(goodReceiveData);
            }.bind(this),
            
            confirmGoodReceive: function(goodReceiveId, rfidScanData) {
                this.confirmGoodReceive(goodReceiveId, rfidScanData);
            }.bind(this),
            
            reverseGoodReceive: function(goodReceiveId, reason) {
                this.reverseGoodReceive(goodReceiveId, reason);
            }.bind(this),
            
            // Put Away workflow methods - aligned with PUT AWAY SEQUENCE DIAGRAM
            refreshPutAway: function() {
                this.loadPutAwayTasks();
            }.bind(this),
            
            startPutAway: function(putAwayId) {
                this.startPutAwayTask(putAwayId);
            }.bind(this),
            
            validateLocation: function(putAwayId, locationScanData) {
                this.validateRFIDLocation(putAwayId, locationScanData);
            }.bind(this),
            
            confirmPutAway: function(putAwayId, validationData) {
                this.confirmPutAway(putAwayId, validationData);
            }.bind(this),
            
            // Picking workflow methods - aligned with PICKING SEQUENCE DIAGRAM
            refreshPicking: function() {
                this.loadPickingTasks();
            }.bind(this),
            
            startPicking: function(pickingId) {
                this.startPickingTask(pickingId);
            }.bind(this),
            
            validatePicking: function(pickingId, scanData) {
                this.validatePickingScan(pickingId, scanData);
            }.bind(this),
            
            confirmPicking: function(pickingId, gateExitData) {
                this.confirmPickingCompletion(pickingId, gateExitData);
            }.bind(this),
            
            // Master Data methods
            refreshItems: function() {
                this.loadItems();
            }.bind(this),
            
            // RFID processing methods - aligned with RFID INTEGRATION FLOW
            processRFID: function(scanData) {
                this.processRFIDScan(scanData);
            }.bind(this),
            
            // NEW METHODS FOR DEMO SCENARIO ALIGNMENT
            generateRFIDTags: function(goodReceiveId) {
                this.generateRFIDTags(goodReceiveId);
            }.bind(this),
            
            confirmRFIDGoodReceive: function(goodReceiveId, scanData) {
                this.confirmGoodReceiveRFID(goodReceiveId, scanData);
            }.bind(this),
            
            processBarcodePicking: function(pickingId, barcodeData) {
                this.processPickingBarcodeScan(pickingId, barcodeData);
            }.bind(this),
            
            validateMovement: function(movementData) {
                this.validateRFIDMovement(movementData);
            }.bind(this),
            
            processGoodsExit: function(exitData) {
                this.processGoodsIssueExit(exitData);
            }.bind(this)
        };
        
        // Add shortcuts for common workflow operations
        window.warehouse.workflow = {
            goodReceive: {
                create: window.warehouse.createGoodReceive,
                generateTags: window.warehouse.generateRFIDTags,
                confirmRFID: window.warehouse.confirmRFIDGoodReceive, // CRITICAL: Inventory increase method
                reverse: window.warehouse.reverseGoodReceive
            },
            putAway: {
                start: window.warehouse.startPutAway,
                validate: window.warehouse.validateLocation,
                confirm: window.warehouse.confirmPutAway
            },
            picking: {
                start: window.warehouse.startPicking,
                scanBarcode: window.warehouse.processBarcodePicking, // NEW: Barcode scan for picking
                validate: window.warehouse.validatePicking,
                confirm: window.warehouse.confirmPicking
            },
            security: {
                validateMovement: window.warehouse.validateMovement,
                processGoodsExit: window.warehouse.processGoodsExit
            }
        };
        
        console.log('✅ Warehouse global functions initialized with full workflow support');
        console.log('Available workflow methods:', Object.keys(window.warehouse.workflow));
    },
    
    // ===== NEW METHODS FOR DEMO SCENARIO ALIGNMENT =====
    
    /**
     * Process barcode scan for picking - aligns with DEMO SCENARIO
     * POST /api/warehouse/barcode/scan
     */
    processPickingBarcodeScan: function(pickingId, barcodeData) {
        console.log('Processing barcode scan for picking:', pickingId);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestData = {
            pickingId: pickingId,
            operation: 'picking_barcode',
            scannedBarcode: barcodeData.barcode,
            location: 'gold_room',
            scannedBy: 'current_user'
        };
        
        Ext.Ajax.request({
            url: apiConfig.getUrl('barcodeScan'),
            method: 'POST',
            headers: apiConfig.getStandardHeaders(),
            jsonData: requestData,
            timeout: 15000,
            success: function(response) {
                console.log('Barcode scan processed successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        this.handleBarcodePickingSuccess(result.body);
                    }
                } catch (e) {
                    console.error('Error parsing barcode scan response:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to process barcode scan:', response);
                Ext.Msg.alert('Error', 'Failed to process barcode scan. Please try again.');
            }
        });
    },

    /**
     * Validate RFID movement detection - aligns with DEMO SCENARIO Alert System
     * POST /api/warehouse/rfid/movement-detected
     */
    validateRFIDMovement: function(movementData) {
        console.log('🚨 RFID Movement Detected - Validating authorization:', movementData);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestData = {
            operation: 'movement_validation',
            detectedEPC: movementData.epc,
            location: movementData.location,
            timestamp: new Date().toISOString()
        };
        
        Ext.Ajax.request({
            url: apiConfig.getUrl('rfidScan'),
            method: 'POST',
            headers: apiConfig.getStandardHeaders(),
            jsonData: requestData,
            timeout: 15000,
            success: function(response) {
                console.log('Movement validation completed');
                try {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        if (result.body.authorized) {
                            console.log('✅ Authorized movement detected');
                        } else {
                            this.handleUnauthorizedMovement(result.body.alertType, result.body);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing movement validation:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to validate movement:', response);
            }
        });
    },

    /**
     * Process Goods Issue workflow - NEW from updated sequence diagram
     * POST /api/warehouse/goodsissue/validate-exit
     */
    processGoodsIssueExit: function(exitScanData) {
        console.log('Processing goods issue exit gate validation:', exitScanData);
        
        var apiConfig = Store.warehouse.config.ApiConfig;
        var requestData = {
            operation: 'goods_issue_exit',
            scannedTags: exitScanData.scannedTags,
            location: 'exit_gate',
            exitTime: new Date().toISOString()
        };
        
        Ext.Ajax.request({
            url: apiConfig.getUrl('rfidScan'),
            method: 'POST',
            headers: apiConfig.getStandardHeaders(),
            jsonData: requestData,
            timeout: 15000,
            success: function(response) {
                console.log('Goods issue exit validation completed');
                try {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        if (result.body.authorized) {
                            this.handleAuthorizedGoodsExit(result.body);
                        } else {
                            this.handleUnauthorizedMovement('unauthorized_exit', result.body);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing goods issue exit:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to process goods issue exit:', response);
                Ext.Msg.alert('Error', 'Failed to validate goods exit. Please try again.');
            }
        });
    },

    /**
     * Handle unauthorized movement alerts - CRITICAL for Demo Scenario Test Cases 8-11
     */
    handleUnauthorizedMovement: function(alertType, alertData) {
        console.error('🚨 UNAUTHORIZED MOVEMENT DETECTED:', alertType);
        
        var alertMessages = {
            'unauthorized_putaway': '🚨 ALERT: Item moved from Inbound area without PUT AWAY authorization!',
            'unauthorized_picking': '🚨 ALERT: Item moved to Outbound area without GOODS ISSUE authorization!',
            'unauthorized_loading': '🚨 ALERT: Item leaving Staging area without LOADING authorization!',
            'unauthorized_exit': '🚨 ALERT: Unauthorized goods exit detected - No Goods Issue posting!'
        };
        
        var message = alertMessages[alertType] || '🚨 ALERT: Unauthorized movement detected!';
        
        // Show critical alert to user
        Ext.Msg.show({
            title: '🚨 SECURITY ALERT',
            message: message + '\n\nEPC: ' + (alertData.epc || 'Unknown') + '\nLocation: ' + (alertData.location || 'Unknown'),
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.WARNING
        });
        
        // Trigger dashboard refresh to show new alerts
        this.loadDashboardMetrics();
    },

    handleAuthorizedGoodsExit: function(exitData) {
        console.log('✅ Authorized goods exit confirmed:', exitData);
        
        var message = [
            '✅ Goods Legitimately Released',
            '',
            'Items: ' + (exitData.processedItems || 0),
            'Moved to Staging Area',
            'Ready for loading and dispatch'
        ].join('\n');
        
        Ext.Msg.alert('✅ Goods Exit Authorized', message);
        this.loadDashboardMetrics(); // Update dashboard
    },

    handleBarcodePickingSuccess: function(barcodeResult) {
        console.log('Barcode picking processed:', barcodeResult);
        
        var message = [
            '📱 Barcode Picking Scan Completed',
            '',
            'Scanned Items: ' + (barcodeResult.scannedItems || 0),
            'Items ready for SAP Transfer Order confirmation',
            '',
            '⏭️ Next: Confirm Transfer Order in SAP system'
        ].join('\n');
        
        Ext.Msg.alert('📱 Barcode Scan Success', message);
    }
});
