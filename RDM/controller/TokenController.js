/**
 * Token Controller
 * Handles all business logic for token operations
 */
Ext.define('Store.rdmtoken.controller.TokenController', {
    extend: 'Ext.Base',
    
    requires: [
        'Store.rdmtoken.config.ApiConfig'
    ],

    config: {
        mainPanel: null,
        navigationTab: null
    },

    constructor: function(config) {
        this.callParent([config]);
        this.initializeGlobalTokenFunctions();
        this.initializeGlobalContractFunctions();
    },

    // Navigation event handlers
    onDashboardActivate: function() {
        console.log('Dashboard activated');
        this.loadDashboardMetrics();
    },

    onTokenManagementActivate: function() {
        console.log('Token Management activated - loading token data...');
        this.loadTokenData();
    },

    // onLocationMonitoringActivate: function() {
    //     console.log('Location Monitoring activated');
    //     this.loadLocationData();
    // },

    onContractActivate: function() {
        console.log('Contract activated - loading contract data...');
        this.loadContractData();
    },

    // onApprovalActivate: function() {
    //     console.log('Approval activated');
    // },

    // onReportActivate: function() {
    //     console.log('Report activated');
    // },

    // Dashboard methods
    loadDashboardMetrics: function() {
        console.log('Loading dashboard metrics...');
        
        var apiConfig = Store.rdmtoken.config.ApiConfig;
        Ext.Ajax.request({
            url: apiConfig.getUrl('tokenDashboard'),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000,
            success: this.onDashboardMetricsLoaded.bind(this),
            failure: function(response) {
                console.error('Failed to load dashboard metrics:', response);
                this.showDashboardError();
            }.bind(this)
        });
    },

    onDashboardMetricsLoaded: function(response) {
        console.log('Dashboard metrics loaded successfully');
        
        try {
            var result = Ext.decode(response.responseText);
            console.log('Dashboard API Response:', result);
            
            if (result.status === 200 && result.body && result.body.overview) {
                var overview = result.body.overview;
                
                // Extract the 4 key metrics
                var dashboardData = {
                    totalRequestedTokens: overview.totalRequestedTokens || 0,
                    totalActiveTokens: overview.totalActiveTokens || 0,
                    totalExpiredTokens: overview.totalExpiredTokens || 0,
                    pendingApprovals: overview.pendingApprovals || 0
                };
                
                console.log('Key Dashboard Metrics:', dashboardData);
                
                // Update dashboard UI
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

    updateDashboardUI: function(dashboardData) {
        var dashboardPanel = this.findDashboardPanel();
        if (dashboardPanel) {
            // Update metric cards with new data
            if (dashboardPanel.updateMetricCards) {
                dashboardPanel.updateMetricCards(dashboardData);
                console.log('✅ Dashboard UI updated successfully');
            } else {
                // Fallback: update individual metric components
                this.updateMetricComponents(dashboardData);
            }
        } else {
            console.warn('Dashboard panel not found');
        }
    },

    updateMetricComponents: function(data) {
        // Update individual metric display components
        var requestedCard = Ext.ComponentQuery.query('[itemId=totalRequestedTokens]')[0];
        var activeCard = Ext.ComponentQuery.query('[itemId=totalActiveTokens]')[0];
        var expiredCard = Ext.ComponentQuery.query('[itemId=totalExpiredTokens]')[0];
        var pendingCard = Ext.ComponentQuery.query('[itemId=pendingApprovals]')[0];

        if (requestedCard) this.updateMetricCard(requestedCard, data.totalRequestedTokens, 'Total Requested');
        if (activeCard) this.updateMetricCard(activeCard, data.totalActiveTokens, 'Active Tokens');
        if (expiredCard) this.updateMetricCard(expiredCard, data.totalExpiredTokens, 'Expired Tokens');
        if (pendingCard) this.updateMetricCard(pendingCard, data.pendingApprovals, 'Pending Approvals');

        console.log('✅ Metric components updated individually');
    },

    updateMetricCard: function(card, value, label) {
        if (card && card.update) {
            var html = this.generateMetricCardHtml(value, label);
            card.update(html);
        }
    },

    generateMetricCardHtml: function(value, label) {
        return [
            '<div class="metric-card">',
            '<div class="metric-value">' + (value || 0) + '</div>',
            '<div class="metric-label">' + label + '</div>',
            '</div>'
        ].join('');
    },

    showDashboardError: function() {
        var dashboardPanel = this.findDashboardPanel();
        if (dashboardPanel) {
            // Show error state with fallback data
            var fallbackData = {
                totalRequestedTokens: 0,
                totalActiveTokens: 0,
                totalExpiredTokens: 0,
                pendingApprovals: 0
            };
            this.updateDashboardUI(fallbackData);
            
            // Optional: Show error message
            Ext.Msg.alert('Dashboard Warning', 'Could not load latest dashboard data. Showing default values.');
        }
    },

    // Token Management methods
    loadTokenData: function(filters) {
        console.log('Loading token data from API...');
        
        var apiConfig = Store.rdmtoken.config.ApiConfig;
        
        // Build query parameters for token request listing
        var params = {
            page: 1,
            limit: 20,
            status: 'all'
        };
        
        // Apply filters if provided
        if (filters) {
            if (filters.status) params.status = filters.status;
            if (filters.customerName) params.customerName = filters.customerName;
            if (filters.requestor) params.requestor = filters.requestor;
            if (filters.serialNumber) params.serialNumber = filters.serialNumber;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;
        }
        
        // Build query string
        var queryString = Object.keys(params).map(function(key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');
        
        var apiUrl = apiConfig.getUrl('tokenRequest') + '?' + queryString;
        console.log('Token API URL:', apiUrl);
        
        Ext.Ajax.request({
            url: apiUrl,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000,
            success: function(response) {
                console.log('Token data loaded successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    console.log('Token API Response:', result);
                    
                    if (result.status === 200 && result.body && result.body.tokenRequests) {
                        this.processTokenData(result.body);
                    } else {
                        console.error('Invalid token response format:', result);
                    }
                } catch (e) {
                    console.error('Error parsing token response:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to load token data:', response);
                this.handleTokenLoadFailure(response);
            }.bind(this)
        });
    },

    processTokenData: function(data) {
        console.log('Processing token data:', data.tokenRequests.length, 'records');
        
        // Update grid with token data
        var grid = Ext.ComponentQuery.query('gridpanel[itemId=tokenGrid]')[0];
        if (grid && grid.getStore()) {
            var store = grid.getStore();
            
            // Convert API response to grid format
            var gridData = data.tokenRequests.map(function(request) {
                return {
                    id: request.id,
                    requestId: request.requestId,
                    tokenNumber: request.requestId, // Use requestId as token number
                    requestorName: request.requestorName,
                    requestor: request.requestorName,
                    customerName: request.customerName,
                    roNumber: request.roNumber,
                    serialNumber: request.serialNumber,
                    imei: request.imei, // Add IMEI field from API response
                    status: request.status,
                    tokenStatus: request.tokenStatus,
                    requestDate: request.requestDate,
                    periodStart: request.periodStartDate,
                    periodEnd: request.periodEndDate,
                    expirationDate: request.tokenExpiryDate,
                    remainingHours: request.remainingHours,
                    durationHours: request.durationHours,
                    contractValue: request.contractValue,
                    contractId: request.contractId || request.id, // Add contractId for generate token
                    unitDetails: request.unitDetails,
                    contractDetails: request.contractDetails, // Add contract details
                    actions: request.actions
                };
            });
            
            store.loadData(gridData);
            console.log('✅ Grid data updated with', gridData.length, 'token records');
            
            // Update pagination info if available
            if (data.pagination) {
                this.updatePaginationInfo(data.pagination);
            }
        }
        
        // Update filters info if available
        if (data.filters) {
            this.updateFiltersInfo(data.filters);
        }
    },

    handleTokenLoadFailure: function(response) {
        console.error('Token load failure:', response);
        
        // Show error message
        Ext.Msg.alert('Error', 'Failed to load token data. Please try again.');
        
        // Clear grid if it exists
        var grid = Ext.ComponentQuery.query('gridpanel[itemId=tokenGrid]')[0];
        if (grid && grid.getStore()) {
            grid.getStore().removeAll();
        }
    },

    updatePaginationInfo: function(pagination) {
        console.log('Pagination info:', pagination);
        // Update pagination controls if implemented
    },

    updateFiltersInfo: function(filters) {
        console.log('Filters info:', filters);
        // Update filter components if implemented
    },

    refreshTokenGrid: function() {
        // Alias for loadTokenData for backward compatibility
        this.loadTokenData();
    },

    // Enhanced filtering methods for comprehensive search and filter functionality
    applyFilters: function() {
        console.log('Applying filters from UI...');
        
        // Get current filter values from TokenManagementPanel using xtype selector
        var tokenPanel = Ext.ComponentQuery.query('rdmtokenmanagementpanel')[0];
        if (!tokenPanel) {
            console.warn('TokenManagementPanel not found, trying alternative selectors...');
            // Fallback selectors
            tokenPanel = Ext.ComponentQuery.query('panel[xtype=rdmtokenmanagementpanel]')[0] ||
                        Ext.ComponentQuery.query('Store\\.rdmtoken\\.view\\.TokenManagementPanel')[0];
        }
        
        if (!tokenPanel) {
            console.error('TokenManagementPanel still not found - check if panel is rendered');
            return;
        }
        
        console.log('TokenManagementPanel found:', tokenPanel.getXType());
        
        var filters = tokenPanel.getCurrentFilters ? tokenPanel.getCurrentFilters() : {};
        console.log('Current UI filters:', filters);
        
        // Convert UI filters to API parameters
        var apiFilters = this.convertUIFiltersToAPI(filters);
        console.log('API filters to be sent to server:', apiFilters);
        
        // Reload data with filters
        this.loadTokenData(apiFilters);
    },

    convertUIFiltersToAPI: function(uiFilters) {
        var apiFilters = {
            page: 1, // Reset to first page when applying filters
            limit: 20
        };
        
        // Status filter
        if (uiFilters.status && uiFilters.status !== 'all') {
            apiFilters.status = uiFilters.status;
        }
        
        // Date filters
        if (uiFilters.startDate) {
            apiFilters.startDate = uiFilters.startDate;
        }
        if (uiFilters.endDate) {
            apiFilters.endDate = uiFilters.endDate;
        }
        
        // Multi-field search - convert to specific API parameters
        if (uiFilters.search) {
            var searchTerm = uiFilters.search.toLowerCase();
            // Since API supports individual field searches, we'll use the search term for multiple fields
            // This is a limitation of the current API design - ideally it would support general search
            // For now, we'll search by customer name as it's most commonly searched
            apiFilters.customerName = uiFilters.search;
        }
        
        return apiFilters;
    },

    applyAdvancedFilters: function(advancedFilterWindow) {
        console.log('Applying advanced filters...');
        
        if (!advancedFilterWindow) {
            console.error('Advanced filter window not provided');
            return;
        }
        
        // Get values from advanced filter modal
        var customerNameField = advancedFilterWindow.down('#customerNameFilter');
        var requestorField = advancedFilterWindow.down('#requestorFilter');
        var serialNumberField = advancedFilterWindow.down('#serialNumberFilter');
        var roNumberField = advancedFilterWindow.down('#roNumberFilter');
        var requestTypeField = advancedFilterWindow.down('#requestTypeFilter');
        var sortByField = advancedFilterWindow.down('#sortByFilter');
        var sortOrderField = advancedFilterWindow.down('#sortOrderFilter');
        
        // Also get basic filters from main panel
        var basicFilters = this.getCurrentBasicFilters();
        
        // Build advanced filter parameters
        var advancedFilters = Object.assign({}, basicFilters, {
            page: 1,
            limit: 20
        });
        
        if (customerNameField && customerNameField.getValue()) {
            advancedFilters.customerName = customerNameField.getValue();
        }
        if (requestorField && requestorField.getValue()) {
            advancedFilters.requestor = requestorField.getValue();
        }
        if (serialNumberField && serialNumberField.getValue()) {
            advancedFilters.serialNumber = serialNumberField.getValue();
        }
        if (roNumberField && roNumberField.getValue()) {
            advancedFilters.roNumber = roNumberField.getValue();
        }
        if (requestTypeField && requestTypeField.getValue() !== 'all') {
            advancedFilters.requestType = requestTypeField.getValue();
        }
        if (sortByField && sortByField.getValue()) {
            advancedFilters.sortBy = sortByField.getValue();
        }
        if (sortOrderField && sortOrderField.getValue()) {
            advancedFilters.sortOrder = sortOrderField.getValue();
        }
        
        console.log('Advanced filters:', advancedFilters);
        
        // Apply advanced filters
        this.loadTokenData(advancedFilters);
        
        // Show feedback to user
        Ext.toast({
            html: 'Advanced filters applied successfully',
            title: 'Filters Applied',
            width: 250,
            align: 't'
        });
    },

    getCurrentBasicFilters: function() {
        var filters = {};
        
        // Get basic filters from main toolbar using correct selector
        var tokenPanel = Ext.ComponentQuery.query('rdmtokenmanagementpanel')[0];
        if (!tokenPanel) {
            console.warn('TokenManagementPanel not found in getCurrentBasicFilters');
            return filters;
        }
        
        var searchField = tokenPanel.down('#searchField');
        var statusFilter = tokenPanel.down('#statusFilter');
        var startDateFilter = tokenPanel.down('#startDateFilter');
        var endDateFilter = tokenPanel.down('#endDateFilter');
        
        console.log('Filter components found:', {
            searchField: !!searchField,
            statusFilter: !!statusFilter,
            startDateFilter: !!startDateFilter,
            endDateFilter: !!endDateFilter
        });
        
        if (searchField && searchField.getValue()) {
            filters.customerName = searchField.getValue(); // Use search as customer name filter
            console.log('Search filter:', filters.customerName);
        }
        if (statusFilter && statusFilter.getValue() !== 'all') {
            filters.status = statusFilter.getValue();
            console.log('Status filter:', filters.status);
        }
        if (startDateFilter && startDateFilter.getValue()) {
            filters.startDate = Ext.Date.format(startDateFilter.getValue(), 'Y-m-d');
            console.log('Start date filter:', filters.startDate);
        }
        if (endDateFilter && endDateFilter.getValue()) {
            filters.endDate = Ext.Date.format(endDateFilter.getValue(), 'Y-m-d');
            console.log('End date filter:', filters.endDate);
        }
        
        console.log('Final basic filters:', filters);
        return filters;
    },

    // Updated methods for backward compatibility
    onTokenSearch: function(searchValue) {
        // For client-side filtering if needed, but prefer server-side
        console.log('Token search triggered:', searchValue);
        
        // Use server-side filtering instead of client-side
        var filters = { page: 1, limit: 20 };
        if (searchValue) {
            // Search across multiple fields by making separate API calls or using the most relevant field
            filters.customerName = searchValue; // Primary search field
            // Note: API doesn't support multi-field search, so we use customer name
            // In a real implementation, we might make multiple calls or enhance the API
        }
        
        this.loadTokenData(filters);
    },

    onStatusFilter: function(statusValue) {
        console.log('Status filter triggered:', statusValue);
        
        // Use server-side filtering
        var filters = { page: 1, limit: 20 };
        if (statusValue && statusValue !== 'all') {
            filters.status = statusValue;
        }
        
        // Preserve other active filters
        var currentFilters = this.getCurrentBasicFilters();
        delete currentFilters.status; // Remove old status filter
        Object.assign(filters, currentFilters);
        
        this.loadTokenData(filters);
    },

    // Pagination methods
    loadNextPage: function() {
        this.loadTokenPage(this.getCurrentPage() + 1);
    },

    loadPreviousPage: function() {
        var currentPage = this.getCurrentPage();
        if (currentPage > 1) {
            this.loadTokenPage(currentPage - 1);
        }
    },

    loadTokenPage: function(pageNumber) {
        var currentFilters = this.getCurrentBasicFilters();
        currentFilters.page = pageNumber;
        currentFilters.limit = 20;
        
        console.log('Loading page:', pageNumber, 'with filters:', currentFilters);
        this.loadTokenData(currentFilters);
    },

    getCurrentPage: function() {
        // This should be stored from the last API response pagination info
        return this.currentPage || 1;
    },

    // Enhanced pagination info handling
    updatePaginationInfo: function(pagination) {
        console.log('Pagination info received:', pagination);
        
        // Store current pagination state
        this.currentPage = pagination.page || 1;
        this.totalPages = pagination.totalPages || 1;
        this.totalRecords = pagination.totalRecords || 0;
        this.recordsPerPage = pagination.recordsPerPage || 20;
        
        // Update pagination UI components if they exist
        this.updatePaginationUI(pagination);
    },

    updatePaginationUI: function(pagination) {
        // Update pagination toolbar if implemented
        var paginationToolbar = Ext.ComponentQuery.query('[itemId=tokenPaginationToolbar]')[0];
        if (paginationToolbar) {
            // Update pagination controls
            var pageField = paginationToolbar.down('#currentPageField');
            var totalPagesLabel = paginationToolbar.down('#totalPagesLabel');
            var totalRecordsLabel = paginationToolbar.down('#totalRecordsLabel');
            
            if (pageField) pageField.setValue(pagination.page);
            if (totalPagesLabel) totalPagesLabel.update('of ' + pagination.totalPages);
            if (totalRecordsLabel) totalRecordsLabel.update(pagination.totalRecords + ' total records');
        }
        
        // Show pagination info in status bar or as toast
        Ext.toast({
            html: `Page ${pagination.page} of ${pagination.totalPages} (${pagination.totalRecords} total records)`,
            title: 'Data Loaded',
            width: 300,
            align: 'b'
        });
    },

    showTokenDetails: function(record) {
        console.log('Token details:', record.getData());
        // Could show a detailed popup or side panel
        this.openTokenDetailsWindow(record);
    },

    openTokenDetailsWindow: function(record) {
        var window = Ext.create('Ext.window.Window', {
            title: 'Token Details - ' + (record.get('tokenNumber') || 'Unknown'),
            modal: true,
            width: 600,
            height: 400,
            layout: 'fit',
            items: [{
                xtype: 'panel',
                bodyPadding: 20,
                html: this.generateTokenDetailsHtml(record)
            }],
            buttons: [{
                text: 'Close',
                handler: function() { window.close(); }
            }]
        });
        window.show();
    },

    generateTokenDetailsHtml: function(record) {
        var data = record.getData();
        return [
            '<h3>Token Information</h3>',
            '<table style="width: 100%; border-collapse: collapse;">',
            '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Token Number:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + (data.tokenNumber || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + (data.customerName || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>RO Number:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + (data.roNumber || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Status:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + (data.status || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Remaining Hours:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + (data.remainingHours || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Expiration Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + (data.expirationDate || 'N/A') + '</td></tr>',
            '</table>'
        ].join('');
    },

    showCreateRequestModal: function() {
        console.log('=== SHOWING CREATE REQUEST MODAL ===');
        
        // Check priority: Contract > Vehicle > Empty
        var selectedContract = window.RDMSelectedContract;
        var selectedVehicle = window.RDMSelectedVehicle;
        
        // Debug: Check if methods exist
        console.log('Methods available:', {
            showCreateRequestModalWithContract: typeof this.showCreateRequestModalWithContract,
            showCreateRequestModalWithVehicle: typeof this.showCreateRequestModalWithVehicle,
            showCreateRequestModalEmpty: typeof this.showCreateRequestModalEmpty
        });
        
        if (selectedContract && selectedContract.id) {
            console.log('Selected contract found, showing contract auto-fill modal:', selectedContract);
            if (typeof this.showCreateRequestModalWithContract === 'function') {
                this.showCreateRequestModalWithContract(selectedContract);
            } else {
                console.error('showCreateRequestModalWithContract method not found - fallback to empty modal');
                this.showCreateRequestModalEmpty();
            }
        } else if (selectedVehicle && selectedVehicle.vin) {
            console.log('Selected vehicle found, showing vehicle auto-fill modal:', selectedVehicle);
            this.showCreateRequestModalWithVehicle(selectedVehicle);
        } else {
            console.log('No contract or vehicle selected, showing empty modal');
            this.showCreateRequestModalEmpty();
        }
    },

    showCreateRequestModalWithVehicle: function(vehicleData) {
        console.log('=== AUTO-FILL MODAL WITH VEHICLE DATA ===');
        console.log('Vehicle data:', vehicleData);
        
        // Create the modal first, then fetch contract data
        var modal = this.createTokenRequestModal(true, vehicleData);
        modal.show();
        
        // Fetch contract data for auto-fill
        this.fetchContractBySerialNumber(vehicleData.vin, modal);
    },

    showCreateRequestModalWithContract: function(contractData) {
        console.log('=== AUTO-FILL MODAL WITH CONTRACT DATA ===');
        console.log('Contract data:', contractData);
        
        try {
            // Create the modal with contract auto-fill
            var modal = this.createTokenRequestModal(true, null);
            modal.show();
            
            // Populate form immediately with contract data
            this.populateFormWithContract(modal, contractData);
        } catch (error) {
            console.error('Error in showCreateRequestModalWithContract:', error);
            // Fallback to empty modal
            this.showCreateRequestModalEmpty();
        }
    },

    showCreateRequestModalEmpty: function() {
        console.log('=== EMPTY CREATE REQUEST MODAL ===');
        
        var modal = this.createTokenRequestModal(false, null);
        modal.show();
    },

    createTokenRequestModal: function(isAutoFill, vehicleData) {
        // Get viewport dimensions for responsive sizing
        var viewport = Ext.getBody().getViewSize();
        var modalWidth = Math.min(750, viewport.width - 40);
        var modalHeight = Math.min(650, viewport.height - 60);
        
        var titleSuffix = '';
        if (isAutoFill) {
            if (vehicleData && vehicleData.model) {
                titleSuffix = ' - Vehicle: ' + vehicleData.model;
            } else {
                titleSuffix = ' - Auto-fill';
            }
        }
        
        var modal = Ext.create('Ext.window.Window', {
            title: '<i class="fa fa-key"></i> Create Request Token' + titleSuffix,
            modal: true,
            width: modalWidth,
            height: modalHeight,
            layout: 'fit',
            closable: true,
            resizable: true,
            constrainHeader: true,
            maximizable: true,
            items: [{
                xtype: 'form',
                itemId: 'tokenRequestForm',
                bodyPadding: '20 25 20 25',
                autoScroll: true,
                layout: 'anchor',
                bodyStyle: 'background: #f8f9fa;',
                defaults: {
                    anchor: '100%',
                    labelWidth: 130,
                    margin: '0 0 12 0',
                    labelStyle: 'font-weight: 600; color: #495057;'
                },
                items: [
                    // Device Information Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-microchip"></i> Device Information',
                        margin: '0 0 15 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'Serial Number *',
                                        name: 'serialNumber',
                                        allowBlank: false,
                                        emptyText: 'Enter serial number...',
                                        cls: 'required-field',
                                        listeners: {
                                            change: this.onSerialNumberChange.bind(this)
                                        }
                                    },
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'IMEI *',
                                        name: 'imei',
                                        allowBlank: false,
                                        emptyText: 'Enter IMEI...',
                                        cls: 'required-field',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            }
                        ]
                    },
                    
                    // Customer Information Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-user"></i> Customer Information',
                        margin: '0 0 15 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'Customer Name *',
                                        name: 'customerName',
                                        allowBlank: false,
                                        emptyText: 'Enter customer name...',
                                        cls: 'required-field'
                                    },
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'RO Number *',
                                        name: 'roNumber',
                                        allowBlank: false,
                                        emptyText: 'Enter RO number...',
                                        cls: 'required-field',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            }
                        ]
                    },
                    
                    // Contract & Period Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-calendar"></i> Contract & Period Details',
                        margin: '0 0 15 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'datefield',
                                        fieldLabel: 'Contract Start *',
                                        name: 'contractStart',
                                        allowBlank: false,
                                        format: 'd M Y',
                                        emptyText: 'DD MMM YYYY',
                                        cls: 'required-field'
                                    },
                                    {
                                        xtype: 'datefield',
                                        fieldLabel: 'Contract Expired *',
                                        name: 'contractExpired',
                                        allowBlank: false,
                                        format: 'd M Y',
                                        emptyText: 'DD MMM YYYY',
                                        cls: 'required-field',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            },
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                margin: '10 0 0 0',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'datefield',
                                        fieldLabel: 'Period Start *',
                                        name: 'periodStart',
                                        allowBlank: false,
                                        format: 'd M Y',
                                        emptyText: 'DD MMM YYYY',
                                        cls: 'required-field'
                                    },
                                    {
                                        xtype: 'datefield',
                                        fieldLabel: 'Period Expired *',
                                        name: 'periodExpiredToken',
                                        allowBlank: false,
                                        format: 'd M Y',
                                        emptyText: 'DD MMM YYYY',
                                        cls: 'required-field',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            }
                        ]
                    },
                    
                    // Duration & Value Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-clock-o"></i> Duration & Financial Details',
                        margin: '0 0 15 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        fieldLabel: 'Duration (Hours) *',
                                        name: 'duration',
                                        allowBlank: false,
                                        emptyText: 'Enter duration...',
                                        cls: 'required-field',
                                        minValue: 1,
                                        step: 1
                                    },
                                    {
                                        xtype: 'numberfield',
                                        fieldLabel: 'Additional Duration',
                                        name: 'additionalDuration',
                                        emptyText: 'Enter additional hours...',
                                        minValue: 0,
                                        value: 0,
                                        step: 1,
                                        margin: '0 0 0 8'
                                    }
                                ]
                            },
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                margin: '10 0 0 0',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        fieldLabel: 'Contract Value *',
                                        name: 'contractValue',
                                        allowBlank: false,
                                        emptyText: 'Enter contract value...',
                                        cls: 'required-field',
                                        decimalPrecision: 2,
                                        minValue: 0
                                    },
                                    {
                                        xtype: 'combobox',
                                        fieldLabel: 'Geofence *',
                                        name: 'geofence',
                                        allowBlank: false,
                                        emptyText: 'Select geofence...',
                                        cls: 'required-field',
                                        margin: '0 0 0 8',
                                        store: {
                                            data: [
                                                {value: 'default', text: 'Default Geofence'},
                                                {value: 'mining_area_1', text: 'Mining Area 1'},
                                                {value: 'mining_area_2', text: 'Mining Area 2'},
                                                {value: 'processing_area', text: 'Processing Area'}
                                            ]
                                        },
                                        displayField: 'text',
                                        valueField: 'value',
                                        queryMode: 'local',
                                        editable: false
                                    }
                                ]
                            }
                        ]
                    },
                    
                    // Location Information Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-map-marker"></i> Location Information',
                        margin: '0 0 5 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'fieldcontainer',
                                fieldLabel: 'Last Known Location',
                                layout: 'hbox',
                                items: [
                                    {
                                        xtype: 'displayfield',
                                        value: '<span style="color: #28a745; font-weight: 600;">02 Mar 2026</span>',
                                        width: 120,
                                        margin: '0 10 0 0'
                                    },
                                    {
                                        xtype: 'displayfield',
                                        value: '<span style="color: #28a745; font-weight: 600;">16:20:43</span>',
                                        width: 100
                                    },
                                    {
                                        xtype: 'displayfield',
                                        value: '<i class="fa fa-circle" style="color: #28a745; margin-left: 10px;"></i> <span style="color: #28a745;">Online</span>',
                                        margin: '0 0 0 10'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                cls: 'dark_form',
                ui: 'footer',
                items: [
                    '->',
                    {
                        text: 'Cancel',
                        iconCls: 'fa fa-times',
                        handler: function() { modal.close(); },
                        cls: 'x-btn-default-small',
                        minWidth: 100
                    },
                    {
                        text: 'Submit',
                        iconCls: 'fa fa-save',
                        handler: function() {
                            this.onSubmitTokenRequest(modal);
                        }.bind(this),
                        cls: 'x-btn-default-small',
                        minWidth: 100
                    }
                ]
            }]
        });

        // Auto-fill vehicle data if available
        if (isAutoFill && vehicleData) {
            // Pre-populate vehicle fields
            var form = modal.down('#tokenRequestForm');
            if (vehicleData.vin) {
                form.down('field[name=serialNumber]').setValue(vehicleData.vin);
                form.down('field[name=serialNumber]').setReadOnly(true);
            }
            if (vehicleData.uniqid) {
                form.down('field[name=imei]').setValue(vehicleData.uniqid);
                form.down('field[name=imei]').setReadOnly(true);
            }
        }

        return modal;
    },

    fetchContractBySerialNumber: function(serialNumber, modal) {
        console.log('Fetching contract for serial number:', serialNumber);
        
        // Access singleton correctly
        var apiConfig = Store.rdmtoken.config.ApiConfig;
        if (!apiConfig) {
            console.error('ApiConfig singleton not available');
            return;
        }
        
        try {
            var apiUrl = apiConfig.getUrl('contractList') + '?serialNumber=' + encodeURIComponent(serialNumber);
            console.log('Contract API URL:', apiUrl);
        } catch (e) {
            console.error('Error getting contract URL:', e);
            return;
        }
        
        Ext.Ajax.request({
            url: apiUrl,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000,
            success: function(response) {
                console.log('Contract fetch success:', response.responseText);
                
                try {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200 && result.body && result.body.contracts && result.body.contracts.length > 0) {
                        var contract = result.body.contracts[0]; // Use first contract
                        console.log('Contract found:', contract);
                        this.populateFormWithContract(modal, contract);
                    } else {
                        console.warn('No contract found for serial number:', serialNumber);
                        // Form remains with vehicle data only
                    }
                } catch (e) {
                    console.error('Error parsing contract response:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to fetch contract data:', response);
                // Form remains with vehicle data only
            }
        });
    },

    populateFormWithContract: function(modal, contractData) {
        console.log('Populating form with contract data:', contractData);
        
        var form = modal.down('#tokenRequestForm');
        if (!form) return;
        
        // Store contract ID in modal for submission
        modal.contractId = contractData.id;
        console.log('✓ Contract ID stored:', contractData.id);
        
        // Auto-fill contract fields with correct API field mapping
        if (contractData.customerName) {
            var customerField = form.down('field[name=customerName]');
            if (customerField) {
                customerField.setValue(contractData.customerName);
                customerField.setReadOnly(true);
                console.log('✓ Customer Name filled:', contractData.customerName);
            }
        }
        
        // Map rentalOrderNumber to roNumber form field
        if (contractData.rentalOrderNumber) {
            var roField = form.down('field[name=roNumber]');
            if (roField) {
                roField.setValue(contractData.rentalOrderNumber);
                roField.setReadOnly(true);
                console.log('✓ RO Number filled:', contractData.rentalOrderNumber);
            }
        }
        
        // Map contractStartDate to contractStart form field
        if (contractData.contractStartDate) {
            var startField = form.down('field[name=contractStart]');
            if (startField) {
                startField.setValue(new Date(contractData.contractStartDate));
                startField.setReadOnly(true);
                console.log('✓ Contract Start filled:', contractData.contractStartDate);
            }
        }
        
        // Map contractEndDate to contractExpired form field
        if (contractData.contractEndDate) {
            var expiredField = form.down('field[name=contractExpired]');
            if (expiredField) {
                expiredField.setValue(new Date(contractData.contractEndDate));
                expiredField.setReadOnly(true);
                console.log('✓ Contract End filled:', contractData.contractEndDate);
            }
        }
        
        if (contractData.contractValue) {
            var valueField = form.down('field[name=contractValue]');
            if (valueField) {
                valueField.setValue(contractData.contractValue);
                valueField.setReadOnly(true);
                console.log('✓ Contract Value filled:', contractData.contractValue);
            }
        }
        
        // Map durationHours to duration form field
        if (contractData.durationHours) {
            var durationField = form.down('field[name=duration]');
            if (durationField) {
                durationField.setValue(contractData.durationHours);
                durationField.setReadOnly(true);
                console.log('✓ Duration filled:', contractData.durationHours);
            }
        }
        
        // Map additionalDurationHours to additionalDuration form field
        if (contractData.additionalDurationHours !== undefined) {
            var additionalDurationField = form.down('field[name=additionalDuration]');
            if (additionalDurationField) {
                additionalDurationField.setValue(contractData.additionalDurationHours);
                additionalDurationField.setReadOnly(true);
                console.log('✓ Additional Duration filled:', contractData.additionalDurationHours);
            }
        }
        
        // Auto-fill geofence based on geofenceDetails coordinates from contract
        if (contractData.geofenceDetails) {
            var geofenceField = form.down('field[name=geofence]');
            if (geofenceField && geofenceField.getStore()) {
                var geofenceValue = this.mapCoordinatesToGeofenceArea(contractData.geofenceDetails);
                if (geofenceValue) {
                    geofenceField.setValue(geofenceValue);
                    geofenceField.setReadOnly(true);
                    console.log('✓ Geofence auto-filled:', geofenceValue, 'from coordinates:', contractData.geofenceDetails);
                }
            }
        }
        
        console.log('✅ Form population complete with correct field mapping and geofence auto-fill');
    },

    getCurrentContractId: function(modal) {
        return modal.contractId || null;
    },

    onSerialNumberChange: function(field, newValue) {
        if (newValue && window.RDMStores && window.RDMStores.units) {
            this.loadUnitDetails(newValue, field.up('form'));
        }
    },

    loadUnitDetails: function(serialNumber, form) {
        var store = window.RDMStores.units;
        if (!store) return;
        
        store.load({
            callback: function(records) {
                var unit = null;
                Ext.each(records, function(record) {
                    if (record.get('serialnumber') === serialNumber) {
                        unit = record;
                        return false;
                    }
                });
                
                if (unit) {
                    form.down('field[name=imei]').setValue(unit.get('imei'));
                    form.down('field[name=lastTimeLocation]').setValue(new Date().toLocaleString());
                }
            }
        });
    },

    onSubmitTokenRequest: function(modal) {
        console.log('=== SUBMIT BUTTON CLICKED ===');
        
        var form = modal.down('#tokenRequestForm');
        console.log('Form found:', !!form);
        
        if (form.isValid()) {
            var values = form.getValues();
            var apiConfig = Store.rdmtoken.config.ApiConfig;
            
            // Log form values
            console.log('Form values:', values);
            
            // Get contractId from the fetched contract data
            var contractId = this.getCurrentContractId(modal);
            if (!contractId) {
                console.error('Contract ID not found - cannot submit token request');
                Ext.Msg.alert('Error', 'Contract information not found. Please select a vehicle with an existing contract.');
                return;
            }
            
            // Prepare API data according to specification (contractId-based format)
            var requestData = {
                serialNumber: values.serialNumber,
                imei: values.imei,
                contractId: contractId,
                periodStart: this.formatDateToISO(values.periodStart),
                periodExpiredToken: this.formatDateToISO(values.periodExpiredToken),
                // Ensure numeric values
                duration: parseInt(values.duration) + parseInt(values.additionalDuration || 0),
                additionalDuration: parseInt(values.additionalDuration || 0),
                requestorName: values.requestorName || 'Current User'
            };
            
            var apiUrl = apiConfig.getUrl('tokenRequest');
            console.log('=== API REQUEST DETAILS ===');
            console.log('API URL:', apiUrl);
            console.log('Request Data:', requestData);
            console.log('API Config:', apiConfig);
            
            // Show loading mask to prevent duplicate submissions
            Ext.Msg.wait('Submitting token request...', 'Please wait');
            
            Ext.Ajax.request({
                url: apiUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                jsonData: requestData,
                timeout: 30000, // 30 second timeout
                success: function(response) {
                    Ext.Msg.hide(); // Hide loading mask
                    console.log('=== API SUCCESS RESPONSE ===');
                    console.log('Raw Response:', response);
                    console.log('Response Text:', response.responseText);
                    console.log('Response Status:', response.status);
                    
                    try {
                        var result = Ext.decode(response.responseText);
                        console.log('Parsed Result:', result);
                        
                        if (result.status === 200) {
                            console.log('✅ Token request created successfully');
                            Ext.Msg.alert('Success', 'Token request created successfully');
                            modal.close();
                            this.refreshTokenGrid();
                        } else {
                            console.error('❌ API returned error status:', result.status);
                            console.error('Error message:', result.body ? result.body.message : 'Unknown error');
                            Ext.Msg.alert('Error', result.body.message || 'Failed to create token request');
                        }
                    } catch (parseError) {
                        console.error('❌ Error parsing API response:', parseError);
                        console.error('Raw response was:', response.responseText);
                        Ext.Msg.alert('Error', 'Invalid response from server');
                    }
                }.bind(this),
                failure: function(response, options) {
                    console.log('=== API FAILURE RESPONSE ===');
                    console.error('❌ API Request failed');
                    console.error('Response:', response);
                    console.error('Response Status:', response.status);
                    console.error('Response Text:', response.responseText);
                    console.error('Options:', options);
                    
                    var errorMessage = 'Network error occurred';
                    if (response.responseText) {
                        try {
                            var errorResult = Ext.decode(response.responseText);
                            errorMessage = errorResult.body ? errorResult.body.message : errorResult.message || errorMessage;
                            console.error('Parsed error:', errorResult);
                        } catch (e) {
                            console.error('Could not parse error response:', e);
                        }
                    }
                    
                    Ext.Msg.alert('Error', errorMessage);
                }
            });
        } else {
            console.log('❌ Form validation failed');
            var invalidFields = [];
            form.getForm().getFields().each(function(field) {
                if (!field.isValid()) {
                    invalidFields.push(field.getName() + ': ' + field.getActiveError());
                }
            });
            console.log('Invalid fields:', invalidFields);
            
            Ext.Msg.alert('Validation Error', 'Please fill in all required fields correctly.');
        }
    },

    // Location Monitoring methods (commented out)
    // loadLocationData: function() {
    //     if (window.RDMStores && window.RDMStores.units) {
    //         window.RDMStores.units.load();
    //     }
    // },

    // onUnitSearch: function(searchValue) {
    //     console.log('Unit search:', searchValue);
    //     // Implement unit filtering logic
    // },

    // JWT and Security methods
    generateJWTToken: function(tokenData) {
        var apiConfig = Store.rdmtoken.config.ApiConfig;
        return Ext.Ajax.request({
            url: apiConfig.getUrl('tokenGenerate'),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            jsonData: tokenData
        });
    },

    validateToken: function(jwtToken, deviceInfo) {
        var apiConfig = Store.rdmtoken.config.ApiConfig;
        return Ext.Ajax.request({
            url: apiConfig.getUrl('tokenValidate'),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            jsonData: {
                jwtToken: jwtToken,
                deviceImei: deviceInfo.imei,
                serialNumber: deviceInfo.serialNumber,
                currentTimestamp: new Date().toISOString(), // Use ISO format for AWS API
                deviceSignature: this.generateDeviceSignature(deviceInfo)
            }
        });
    },

    generateDeviceSignature: function(deviceInfo) {
        // Generate device-specific signature for security
        var data = deviceInfo.imei + deviceInfo.serialNumber + new Date().getTime();
        // In real implementation, use proper cryptographic signature
        return btoa(data);
    },

    /**
     * Format date to ISO 8601 format required by API
     */
    formatDateToISO: function(dateValue) {
        if (!dateValue) return null;
        
        var date;
        if (dateValue instanceof Date) {
            date = dateValue;
        } else if (typeof dateValue === 'string') {
            date = new Date(dateValue);
        } else {
            return null;
        }
        
        // Ensure valid date
        if (isNaN(date.getTime())) {
            return null;
        }
        
        // Format to ISO string with .000Z suffix
        return date.toISOString();
    },

    // Helper methods
    findDashboardPanel: function() {
        return Ext.ComponentQuery.query('Store\\.rdmtoken\\.view\\.DashboardPanel')[0];
    },

    initializeGlobalTokenFunctions: function() {
        // Initialize global token management functions for UI interactions
        window.rdmToken = {
            generateToken: function(tokenId) {
                console.log('Generate token:', tokenId);
                this.generateToken(tokenId);
            }.bind(this),
            
            renewToken: function(tokenId) {
                console.log('Renew token:', tokenId);
                this.renewToken(tokenId);
            }.bind(this),
            
            topUpToken: function(tokenId) {
                console.log('Top up token:', tokenId);
                this.topUpToken(tokenId);
            }.bind(this),
            
            toggleToken: function(tokenId) {
                console.log('Toggle token:', tokenId);
                this.performTokenAction('toggle', tokenId);
            }.bind(this),
            
            changeUnit: function(tokenId) {
                console.log('Change unit for token:', tokenId);
                this.performTokenAction('changeunit', tokenId);
            }.bind(this)
        };
    },

    performTokenAction: function(action, tokenId) {
        // Generic method to handle token actions
        var apiConfig = Store.rdmtoken.config.ApiConfig;
        var actionEndpoints = {
            'renew': 'tokenRenew',
            'topup': 'tokenTopup'
            // Note: toggle and changeunit are not in the API spec, may need custom implementation
        };

        var endpoint = actionEndpoints[action];
        if (!endpoint) {
            console.error('Unknown or unsupported token action:', action);
            Ext.Msg.alert('Error', 'This action is not currently supported');
            return;
        }

        // For renew and topup, we need more data - show appropriate modal
        if (action === 'renew') {
            this.showRenewTokenModal(tokenId);
        } else if (action === 'topup') {
            this.showTopupTokenModal(tokenId);
        } else {
            // Generic action (if any are added in future)
            Ext.Ajax.request({
                url: apiConfig.getUrl(endpoint),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                jsonData: { tokenId: tokenId },
                success: function(response) {
                    var result = Ext.decode(response.responseText);
                    if (result.status === 200) {
                        Ext.Msg.alert('Success', 'Token action completed successfully');
                        this.refreshTokenGrid();
                    } else {
                        Ext.Msg.alert('Error', result.body.message || 'Action failed');
                    }
                }.bind(this),
                failure: function() {
                    Ext.Msg.alert('Error', 'Network error occurred');
                }
            });
        }
    },
    
    /**
     * Generate token for pending rental requests
     */
    generateToken: function(tokenId) {
        var me = this;
        
        Ext.Msg.confirm('Generate Token',
            'Generate RDM token for rental request "' + tokenId + '"?<br><br>' +
            'This will activate the token and make it available for use.',
            function(btn) {
                if (btn === 'yes') {
                    console.log('Generating token for:', tokenId);
                    
                    // Show loading mask
                    Ext.Msg.wait('Generating token...', 'Processing');
                    
                    // Get token request data from grid to build proper payload
                    var tokenRequestRecord = null;
                    var grid = Ext.ComponentQuery.query('gridpanel[itemId=tokenGrid]')[0];
                    if (grid && grid.getStore()) {
                        var store = grid.getStore();
                        tokenRequestRecord = store.findRecord('requestId', tokenId) ||
                                           store.findRecord('id', tokenId) ||
                                           store.findRecord('tokenNumber', tokenId);
                    }
                    
                    if (!tokenRequestRecord) {
                        console.error('Token request record not found for:', tokenId);
                        Ext.Msg.alert('Error', 'Token request data not found. Please refresh the grid and try again.');
                        return;
                    }
                    
                    var tokenData = tokenRequestRecord.getData();
                    console.log('Token request data found:', tokenData);
                    
                    // Prepare API request data according to specification
                    var apiConfig = Store.rdmtoken.config.ApiConfig;
                    var requestData = {
                        requestId: tokenData.requestId || tokenData.id || tokenId,
                        serialNumber: tokenData.serialNumber,
                        imei: tokenData.imei, // Now available directly from grid data
                        durationHours: parseInt(tokenData.durationHours) || 0,
                        contractId: tokenData.contractId || tokenData.id
                    };
                    
                    console.log('=== GENERATE TOKEN DEBUG INFO ===');
                    console.log('Token data from grid:', tokenData);
                    console.log('Request payload:', requestData);
                    
                    // Add optional geofenceData if available from contract details
                    if (tokenData.geofenceDetails || tokenData.unitDetails?.geofenceDetails) {
                        var geofence = tokenData.geofenceDetails || tokenData.unitDetails.geofenceDetails;
                        if (geofence && geofence.latMin && geofence.latMax && geofence.lngMin && geofence.lngMax) {
                            requestData.geofenceData = {
                                latMin: parseFloat(geofence.latMin),
                                latMax: parseFloat(geofence.latMax),
                                lngMin: parseFloat(geofence.lngMin),
                                lngMax: parseFloat(geofence.lngMax)
                            };
                            console.log('✓ Geofence data included:', requestData.geofenceData);
                        }
                    }
                    
                    // Validate required fields before API call
                    var missingFields = [];
                    if (!requestData.requestId) missingFields.push('requestId');
                    if (!requestData.serialNumber) missingFields.push('serialNumber');
                    if (!requestData.imei) missingFields.push('imei');
                    if (!requestData.durationHours) missingFields.push('durationHours');
                    if (!requestData.contractId) missingFields.push('contractId');
                    
                    if (missingFields.length > 0) {
                        console.error('Missing required fields for generate token:', missingFields);
                        Ext.Msg.alert('Validation Error',
                            'Missing required data: ' + missingFields.join(', ') +
                            '. Please ensure the token request has complete information.');
                        return;
                    }
                    
                    console.log('=== GENERATE TOKEN API REQUEST ===');
                    console.log('API URL:', apiConfig.getUrl('tokenGenerate'));
                    console.log('Request Data:', requestData);
                    console.log('Required fields validation: PASSED');
                    
                    // Call the actual API
                    Ext.Ajax.request({
                        url: apiConfig.getUrl('tokenGenerate'),
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        jsonData: requestData,
                        success: function(response) {
                            console.log('=== GENERATE TOKEN API SUCCESS ===');
                            console.log('Response:', response);
                            console.log('Response Text:', response.responseText);
                            
                            Ext.Msg.hide();
                            
                            try {
                                var result = Ext.decode(response.responseText);
                                console.log('Parsed Result:', result);
                                
                                if (result.status === 200 && result.body) {
                                    console.log('✅ Token generated successfully');
                                    console.log('Token response data:', result.body);
                                    
                                    var responseData = result.body;
                                    var expirationTime = responseData.expirationTime ?
                                        Ext.util.Format.date(new Date(responseData.expirationTime), 'd M Y H:i') : 'Not specified';
                                    
                                    var successMessage = [
                                        '<div style="text-align: center;">',
                                        '<h3 style="color: #28a745; margin-bottom: 15px;"><i class="fa fa-check-circle"></i> Token Generated Successfully!</h3>',
                                        
                                        // STS Token Display - Most Important
                                        '<div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2196f3;">',
                                        '<h4 style="color: #1565c0; margin-bottom: 10px;">STS Token</h4>',
                                        '<div style="font-size: 20px; font-weight: bold; color: #1565c0; font-family: monospace; letter-spacing: 1px;">' +
                                        (responseData.stsDeliveryMethods?.display || responseData.stsToken || 'N/A') + '</div>',
                                        '</div>',
                                        '</div>',
                                        
                                        // Business Information - Left aligned for better readability
                                        '<div style="text-align: left;">',
                                        '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">',
                                        '<h4 style="color: #495057; margin-bottom: 10px; text-align: center;">Contract Information</h4>',
                                        '<table style="width: 100%; border-collapse: collapse;">',
                                        '<tr><td style="padding: 5px; font-weight: 600; width: 120px;">Customer:</td><td style="padding: 5px;">' + (tokenData.customerName || 'N/A') + '</td></tr>',
                                        '<tr><td style="padding: 5px; font-weight: 600;">RO Number:</td><td style="padding: 5px;">' + (tokenData.roNumber || 'N/A') + '</td></tr>',
                                        '<tr><td style="padding: 5px; font-weight: 600;">Serial Number:</td><td style="padding: 5px;">' + (responseData.stsEquipmentBinding?.serialNumber || requestData.serialNumber || 'N/A') + '</td></tr>',
                                        '<tr><td style="padding: 5px; font-weight: 600;">Token Expires:</td><td style="padding: 5px; color: #dc3545; font-weight: 600;">' + expirationTime + '</td></tr>',
                                        '</table>',
                                        '</div>',
                                        
                                        // Equipment Information
                                        '<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">',
                                        '<h4 style="color: #856404; margin-bottom: 10px; text-align: center;">Equipment Details</h4>',
                                        '<table style="width: 100%; border-collapse: collapse;">',
                                        '<tr><td style="padding: 5px; font-weight: 600; width: 120px;">Unit Name:</td><td style="padding: 5px;">' + (tokenData.unitDetails?.unitName || 'N/A') + '</td></tr>',
                                        '<tr><td style="padding: 5px; font-weight: 600;">Model:</td><td style="padding: 5px;">' + (tokenData.unitDetails?.model || 'N/A') + '</td></tr>',
                                        '<tr><td style="padding: 5px; font-weight: 600;">Year:</td><td style="padding: 5px;">' + (tokenData.unitDetails?.year || 'N/A') + '</td></tr>',
                                        '<tr><td style="padding: 5px; font-weight: 600;">IMEI:</td><td style="padding: 5px; font-family: monospace;">' + (responseData.stsEquipmentBinding?.imei || requestData.imei || 'N/A') + '</td></tr>',
                                        '</table>',
                                        '</div>',
                                        
                                        // Contract Period
                                        '<div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 15px 0;">',
                                        '<h4 style="color: #0c5460; margin-bottom: 10px; text-align: center;">Contract Period</h4>',
                                        '<table style="width: 100%; border-collapse: collapse;">',
                                        '<tr><td style="padding: 5px; font-weight: 600; width: 120px;">Contract Start:</td><td style="padding: 5px;">' +
                                        (tokenData.contractDetails?.contractStartDate ? Ext.util.Format.date(new Date(tokenData.contractDetails.contractStartDate), 'd M Y') : 'N/A') + '</td></tr>',
                                        '<tr><td style="padding: 5px; font-weight: 600;">Contract End:</td><td style="padding: 5px;">' +
                                        (tokenData.contractDetails?.contractEndDate ? Ext.util.Format.date(new Date(tokenData.contractDetails.contractEndDate), 'd M Y') : 'N/A') + '</td></tr>',
                                        '<tr><td style="padding: 5px; font-weight: 600;">Duration:</td><td style="padding: 5px;">' + (tokenData.durationHours || 'N/A') + ' hours</td></tr>',
                                        '<tr><td style="padding: 5px; font-weight: 600;">Contract Value:</td><td style="padding: 5px; color: #28a745; font-weight: 600;">Rp ' +
                                        (tokenData.contractValue ? Ext.util.Format.number(tokenData.contractValue, '0,0') : 'N/A') + '</td></tr>',
                                        '</table>',
                                        '</div>',
                                        
                                        '<p style="color: #666; font-size: 14px; margin-top: 15px; text-align: center;">Please use the STS token above to activate the equipment. Keep this information safe as token cannot be retrieved again.</p>',
                                        '</div>'
                                    ].join('');
                                    
                                    Ext.Msg.alert('Token Generated', successMessage);
                                } else {
                                    console.error('❌ API returned error status:', result.status);
                                    var errorMsg = 'Failed to generate token';
                                    if (result.body && result.body.message) {
                                        errorMsg = result.body.message;
                                    } else if (result.body && result.body.error) {
                                        errorMsg = result.body.error;
                                    }
                                    Ext.Msg.alert('Generate Token Failed', errorMsg);
                                }
                            } catch (parseError) {
                                console.error('❌ Error parsing API response:', parseError);
                                Ext.Msg.alert('Error', 'Invalid response from server');
                            }
                            
                            // Refresh token grid regardless of success/error to show updated status
                            me.refreshTokenGrid();
                        },
                        failure: function(response, options) {
                            console.log('=== GENERATE TOKEN API FAILURE ===');
                            console.error('❌ API Request failed');
                            console.error('Response:', response);
                            console.error('Response Status:', response.status);
                            console.error('Response Text:', response.responseText);
                            
                            Ext.Msg.hide();
                            
                            var errorMessage = 'Failed to generate token - Network error occurred';
                            
                            if (response.status === 400) {
                                errorMessage = 'Validation failed - Please check token request data is complete and valid';
                            } else if (response.status === 401) {
                                errorMessage = 'Authentication failed - Please check API credentials';
                            } else if (response.status === 404) {
                                errorMessage = 'Token request or contract not found';
                            } else if (response.status === 500) {
                                errorMessage = 'Server error - Please try again later';
                            }
                            
                            if (response.responseText) {
                                try {
                                    var errorResult = Ext.decode(response.responseText);
                                    if (errorResult.body && errorResult.body.message) {
                                        errorMessage = errorResult.body.message;
                                    } else if (errorResult.message) {
                                        errorMessage = errorResult.message;
                                    } else if (errorResult.error) {
                                        errorMessage = errorResult.error;
                                    }
                                    console.error('Parsed error:', errorResult);
                                } catch (e) {
                                    console.error('Could not parse error response:', e);
                                }
                            }
                            
                            Ext.Msg.alert('Generate Token Failed',
                                errorMessage + '<br><br><strong>Debug Info:</strong><br>' +
                                'Status: ' + response.status + '<br>' +
                                'Request ID: ' + (requestData.requestId || 'N/A') + '<br>' +
                                'Serial Number: ' + (requestData.serialNumber || 'N/A')
                            );
                        }
                    });
                }
            }
        );
    },

    /**
     * Renew existing active or expired tokens
     */
    renewToken: function(tokenId) {
        var me = this;
        
        var renewForm = Ext.create('Ext.window.Window', {
            title: 'Renew Token - ' + tokenId,
            modal: true,
            width: 400,
            layout: 'fit',
            items: [{
                xtype: 'form',
                bodyPadding: 20,
                defaults: {
                    labelWidth: 120,
                    anchor: '100%',
                    margin: '0 0 15 0'
                },
                items: [{
                    xtype: 'numberfield',
                    name: 'renewal_days',
                    fieldLabel: 'Renewal Period',
                    value: 30,
                    minValue: 1,
                    maxValue: 365,
                    allowBlank: false,
                    fieldStyle: 'text-align: right',
                    listeners: {
                        change: function(field, newValue) {
                            var newExpiry = new Date(Date.now() + (newValue || 30) * 24 * 60 * 60 * 1000);
                            field.up('form').down('[name=new_expiry_preview]').setValue(
                                Ext.util.Format.date(newExpiry, 'Y-m-d H:i')
                            );
                        }
                    }
                }, {
                    xtype: 'displayfield',
                    name: 'new_expiry_preview',
                    fieldLabel: 'New Expiry Date',
                    value: Ext.util.Format.date(new Date(Date.now() + 30*24*60*60*1000), 'Y-m-d H:i')
                }, {
                    xtype: 'textarea',
                    name: 'renewal_notes',
                    fieldLabel: 'Notes',
                    height: 80,
                    emptyText: 'Optional notes for renewal...'
                }],
                buttons: [{
                    text: 'Cancel',
                    handler: function() {
                        renewForm.close();
                    }
                }, {
                    text: 'Renew Token',
                    formBind: true,
                    cls: 'btn-success',
                    handler: function() {
                        var formValues = this.up('form').getValues();
                        console.log('Renewing token:', tokenId, 'for', formValues.renewal_days, 'days');
                        
                        Ext.Msg.wait('Processing token renewal...', 'Please wait');
                        
                        // Simulate API call
                        setTimeout(function() {
                            Ext.Msg.hide();
                            renewForm.close();
                            Ext.Msg.alert('Success',
                                'Token renewed successfully!<br><br>' +
                                'Token ID: ' + tokenId + '<br>' +
                                'Extended by: ' + formValues.renewal_days + ' days<br>' +
                                'New expiry: ' + formValues.new_expiry_preview
                            );
                            
                            me.refreshTokenGrid();
                        }, 1500);
                    }
                }]
            }]
        });
        
        renewForm.show();
    },

    /**
     * Top up active tokens with additional credit/time
     */
    topUpToken: function(tokenId) {
        var me = this;
        
        var topUpForm = Ext.create('Ext.window.Window', {
            title: 'Top Up Token - ' + tokenId,
            modal: true,
            width: 450,
            layout: 'fit',
            items: [{
                xtype: 'form',
                bodyPadding: 20,
                defaults: {
                    labelWidth: 130,
                    anchor: '100%',
                    margin: '0 0 15 0'
                },
                items: [{
                    xtype: 'radiogroup',
                    fieldLabel: 'Top Up Type',
                    name: 'topup_type',
                    value: {topup_type: 'time'},
                    items: [
                        {boxLabel: 'Time Extension', name: 'topup_type', inputValue: 'time'},
                        {boxLabel: 'Usage Credit', name: 'topup_type', inputValue: 'credit'}
                    ],
                    listeners: {
                        change: function(radiogroup, newValue) {
                            var form = radiogroup.up('form');
                            var isTime = newValue.topup_type === 'time';
                            
                            form.down('[name=time_extension]').setVisible(isTime);
                            form.down('[name=credit_amount]').setVisible(!isTime);
                        }
                    }
                }, {
                    xtype: 'numberfield',
                    name: 'time_extension',
                    fieldLabel: 'Additional Days',
                    value: 15,
                    minValue: 1,
                    maxValue: 180,
                    allowBlank: false,
                    fieldStyle: 'text-align: right'
                }, {
                    xtype: 'numberfield',
                    name: 'credit_amount',
                    fieldLabel: 'Credit Amount',
                    value: 100,
                    minValue: 1,
                    maxValue: 10000,
                    allowBlank: false,
                    fieldStyle: 'text-align: right',
                    hidden: true
                }, {
                    xtype: 'textarea',
                    name: 'topup_notes',
                    fieldLabel: 'Notes',
                    height: 80,
                    emptyText: 'Reason for top up...'
                }],
                buttons: [{
                    text: 'Cancel',
                    handler: function() {
                        topUpForm.close();
                    }
                }, {
                    text: 'Apply Top Up',
                    formBind: true,
                    cls: 'btn-warning',
                    handler: function() {
                        var formValues = this.up('form').getValues();
                        console.log('Topping up token:', tokenId, formValues);
                        
                        Ext.Msg.wait('Processing token top up...', 'Please wait');
                        
                        // Prepare API request data
                        var apiConfig = Store.rdmtoken.config.ApiConfig;
                        var requestData = {
                            tokenId: tokenId,
                            topUpType: formValues.topup_type,
                            timeExtension: formValues.topup_type === 'time' ? parseInt(formValues.time_extension) : 0,
                            creditAmount: formValues.topup_type === 'credit' ? parseInt(formValues.credit_amount) : 0,
                            notes: formValues.topup_notes || '',
                            timestamp: new Date().toISOString()
                        };
                        
                        console.log('=== TOP UP TOKEN API REQUEST ===');
                        console.log('API URL:', apiConfig.getUrl('tokenTopup'));
                        console.log('Request Data:', requestData);
                        
                        // Call the actual API
                        Ext.Ajax.request({
                            url: apiConfig.getUrl('tokenTopup'),
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            jsonData: requestData,
                            success: function(response) {
                                console.log('=== TOP UP TOKEN API SUCCESS ===');
                                console.log('Response:', response.responseText);
                                
                                Ext.Msg.hide();
                                topUpForm.close();
                                
                                try {
                                    var result = Ext.decode(response.responseText);
                                    
                                    if (result.status === 200) {
                                        console.log('✅ Token topped up successfully');
                                        
                                        var topUpText = formValues.topup_type === 'time'
                                            ? formValues.time_extension + ' days added'
                                            : formValues.credit_amount + ' credits added';
                                            
                                        Ext.Msg.alert('Success',
                                            'Token topped up successfully!<br><br>' +
                                            'Token ID: ' + tokenId + '<br>' +
                                            'Top up: ' + topUpText
                                        );
                                    } else {
                                        console.error('❌ API returned error:', result.status);
                                        Ext.Msg.alert('Error', result.body ? result.body.message : 'Failed to top up token');
                                    }
                                } catch (parseError) {
                                    console.error('❌ Error parsing API response:', parseError);
                                    Ext.Msg.alert('Error', 'Invalid response from server');
                                }
                                
                                me.refreshTokenGrid();
                            },
                            failure: function(response) {
                                console.log('=== TOP UP TOKEN API FAILURE ===');
                                console.error('❌ API Request failed:', response);
                                
                                Ext.Msg.hide();
                                topUpForm.close();
                                
                                var errorMessage = 'Failed to top up token - Network error occurred';
                                if (response.responseText) {
                                    try {
                                        var errorResult = Ext.decode(response.responseText);
                                        errorMessage = errorResult.body ? errorResult.body.message : errorResult.message || errorMessage;
                                    } catch (e) {
                                        console.error('Could not parse error response:', e);
                                    }
                                }
                                
                                Ext.Msg.alert('Top Up Token Failed', errorMessage);
                            }
                        });
                    }
                }]
            }]
        });
        
        topUpForm.show();
    },
    
    showRenewTokenModal: function(tokenId) {
        // Delegate to main renewToken method
        this.renewToken(tokenId);
    },
    
    showTopupTokenModal: function(tokenId) {
        // Delegate to main topUpToken method
        this.topUpToken(tokenId);
    },

    /**
     * Map geofence coordinates from contract API to predefined geofence area names
     * @param {Object} geofenceDetails - Coordinate bounds from contract API
     * @returns {String|null} - Geofence area value for form field
     */
    mapCoordinatesToGeofenceArea: function(geofenceDetails) {
        if (!geofenceDetails || !geofenceDetails.latMax || !geofenceDetails.latMin ||
            !geofenceDetails.lngMax || !geofenceDetails.lngMin) {
            console.warn('Invalid geofence coordinates:', geofenceDetails);
            return 'default';
        }

        var lat = (geofenceDetails.latMax + geofenceDetails.latMin) / 2;
        var lng = (geofenceDetails.lngMax + geofenceDetails.lngMin) / 2;

        console.log('Mapping coordinates to geofence area:', {
            centerLat: lat,
            centerLng: lng,
            bounds: geofenceDetails
        });

        // Define coordinate ranges for each predefined geofence area
        // These ranges should match your actual mining site locations
        var geofenceAreas = {
            'mining_area_1': {
                latMin: -6.4, latMax: -6.1,
                lngMin: 106.6, lngMax: 106.9
            },
            'mining_area_2': {
                latMin: -6.7, latMax: -6.4,
                lngMin: 106.9, lngMax: 107.2
            },
            'processing_area': {
                latMin: -6.1, latMax: -5.8,
                lngMin: 106.5, lngMax: 106.8
            }
        };

        // Check which area contains the center coordinates
        for (var areaId in geofenceAreas) {
            var area = geofenceAreas[areaId];
            if (lat >= area.latMin && lat <= area.latMax &&
                lng >= area.lngMin && lng <= area.lngMax) {
                console.log('✓ Coordinates mapped to geofence area:', areaId);
                return areaId;
            }
        }

        // If no specific area matches, return default
        console.log('✓ Using default geofence area (no match found)');
        return 'default';
    },

    // ===== CONTRACT MANAGEMENT METHODS =====

    /**
     * Load contract data with optional filters
     */
    loadContractData: function(filters) {
        console.log('Loading contract data from API...');
        
        var apiConfig = Store.rdmtoken.config.ApiConfig;
        
        // Build query parameters for contract listing
        var params = {
            page: 1,
            limit: 20,
            status: 'all'
        };
        
        // Apply filters if provided
        if (filters) {
            if (filters.status && filters.status !== 'all') params.status = filters.status;
            if (filters.customerName) params.customerName = filters.customerName;
            if (filters.serialNumber) params.serialNumber = filters.serialNumber;
            if (filters.salesRepresentative) params.salesRepresentative = filters.salesRepresentative;
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;
        }
        
        // Build query string
        var queryString = Object.keys(params).map(function(key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');
        
        var apiUrl = apiConfig.getUrl('contractList') + '?' + queryString;
        console.log('Contract API URL:', apiUrl);
        
        Ext.Ajax.request({
            url: apiUrl,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000,
            success: function(response) {
                console.log('Contract data loaded successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    console.log('Contract API Response:', result);
                    
                    if (result.status === 200 && result.body && result.body.contracts) {
                        this.processContractData(result.body);
                    } else {
                        console.error('Invalid contract response format:', result);
                    }
                } catch (e) {
                    console.error('Error parsing contract response:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to load contract data:', response);
                this.handleContractLoadFailure(response);
            }.bind(this)
        });
    },

    processContractData: function(data) {
        console.log('Processing contract data:', data.contracts.length, 'records');
        
        // Update grid with contract data
        var grid = Ext.ComponentQuery.query('gridpanel[itemId=contractGrid]')[0];
        if (grid && grid.getStore()) {
            var store = grid.getStore();
            
            // Convert API response to grid format
            var gridData = data.contracts.map(function(contract) {
                return {
                    id: contract.id,
                    unitId: contract.unitId,
                    customerName: contract.customerName,
                    customerCode: contract.customerCode,
                    salesRepresentative: contract.salesRepresentative,
                    rentalOrderNumber: contract.rentalOrderNumber,
                    contractStartDate: contract.contractStartDate,
                    contractEndDate: contract.contractEndDate,
                    contractValue: contract.contractValue,
                    durationHours: contract.durationHours,
                    additionalDurationHours: contract.additionalDurationHours,
                    geofenceDetails: contract.geofenceDetails,
                    status: contract.status,
                    unitDetails: contract.unitDetails,
                    createdAt: contract.createdAt,
                    updatedAt: contract.updatedAt
                };
            });
            
            store.loadData(gridData);
            console.log('✅ Contract grid data updated with', gridData.length, 'contract records');
            
            // Update pagination info if available
            if (data.pagination) {
                this.updateContractPaginationInfo(data.pagination);
            }
        }
    },

    handleContractLoadFailure: function(response) {
        console.error('Contract load failure:', response);
        
        // Show error message
        Ext.Msg.alert('Error', 'Failed to load contract data. Please try again.');
        
        // Clear grid if it exists
        var grid = Ext.ComponentQuery.query('gridpanel[itemId=contractGrid]')[0];
        if (grid && grid.getStore()) {
            grid.getStore().removeAll();
        }
    },

    updateContractPaginationInfo: function(pagination) {
        console.log('Contract pagination info:', pagination);
        // Update pagination controls if implemented
    },

    /**
     * Apply filters for contract data
     */
    applyContractFilters: function() {
        console.log('Applying contract filters from UI...');
        
        // Get current filter values from ContractPanel using xtype selector
        var contractPanel = Ext.ComponentQuery.query('rdmcontractpanel')[0];
        if (!contractPanel) {
            console.warn('ContractPanel not found, trying alternative selectors...');
            contractPanel = Ext.ComponentQuery.query('panel[xtype=rdmcontractpanel]')[0];
        }
        
        if (!contractPanel) {
            console.error('ContractPanel still not found - check if panel is rendered');
            return;
        }
        
        console.log('ContractPanel found:', contractPanel.getXType());
        
        var filters = contractPanel.getCurrentFilters ? contractPanel.getCurrentFilters() : {};
        console.log('Current UI contract filters:', filters);
        
        // Convert UI filters to API parameters
        var apiFilters = this.convertUIContractFiltersToAPI(filters);
        console.log('API contract filters to be sent to server:', apiFilters);
        
        // Reload data with filters
        this.loadContractData(apiFilters);
    },

    convertUIContractFiltersToAPI: function(uiFilters) {
        var apiFilters = {
            page: 1, // Reset to first page when applying filters
            limit: 20
        };
        
        // Status filter
        if (uiFilters.status && uiFilters.status !== 'all') {
            apiFilters.status = uiFilters.status;
        }
        
        // Search filter - use for customer name search
        if (uiFilters.search) {
            apiFilters.customerName = uiFilters.search;
        }
        
        // Sales representative filter
        if (uiFilters.salesRepresentative) {
            apiFilters.salesRepresentative = uiFilters.salesRepresentative;
        }
        
        return apiFilters;
    },

    /**
     * Show contract details modal
     */
    showContractDetails: function(record) {
        console.log('Contract details:', record.getData());
        this.openContractDetailsWindow(record);
    },

    openContractDetailsWindow: function(record) {
        var contractData = record.getData();
        var unitDetails = contractData.unitDetails || {};
        
        var window = Ext.create('Ext.window.Window', {
            title: 'Contract Details - ' + (contractData.rentalOrderNumber || 'Contract'),
            modal: true,
            width: 700,
            height: 500,
            layout: 'fit',
            items: [{
                xtype: 'panel',
                bodyPadding: 20,
                autoScroll: true,
                html: this.generateContractDetailsHtml(contractData, unitDetails)
            }],
            buttons: [{
                text: 'Edit Contract',
                iconCls: 'fa fa-edit',
                handler: function() {
                    window.close();
                    this.showCreateContractModal(record);
                }.bind(this)
            }, {
                text: 'Close',
                handler: function() { window.close(); }
            }]
        });
        window.show();
    },

    generateContractDetailsHtml: function(contractData, unitDetails) {
        return [
            '<div style="max-width: 600px;">',
            '<h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Contract Details</h2>',
            
            '<div style="margin: 20px 0;">',
            '<h3 style="color: #007bff;">Contract Information</h3>',
            '<table style="width: 100%; border-collapse: collapse;">',
            '<tr><td style="padding: 8px; font-weight: bold; width: 150px;">Contract ID:</td><td style="padding: 8px;">' + contractData.id + '</td></tr>',
            '<tr><td style="padding: 8px; font-weight: bold;">Customer:</td><td style="padding: 8px;">' + (contractData.customerName || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; font-weight: bold;">Customer Code:</td><td style="padding: 8px;">' + (contractData.customerCode || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; font-weight: bold;">RO Number:</td><td style="padding: 8px;">' + (contractData.rentalOrderNumber || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; font-weight: bold;">Sales Rep:</td><td style="padding: 8px;">' + (contractData.salesRepresentative || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; font-weight: bold;">Status:</td><td style="padding: 8px;">' + this.renderContractStatus(contractData.status) + '</td></tr>',
            '</table>',
            '</div>',
            
            '<div style="margin: 20px 0;">',
            '<h3 style="color: #007bff;">Unit Details</h3>',
            '<table style="width: 100%; border-collapse: collapse;">',
            '<tr><td style="padding: 8px; font-weight: bold; width: 150px;">Serial Number:</td><td style="padding: 8px;">' + (unitDetails.serialNumber || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; font-weight: bold;">Unit Name:</td><td style="padding: 8px;">' + (unitDetails.unitName || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; font-weight: bold;">Model:</td><td style="padding: 8px;">' + (unitDetails.model || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; font-weight: bold;">Year:</td><td style="padding: 8px;">' + (unitDetails.year || 'N/A') + '</td></tr>',
            '</table>',
            '</div>',
            
            '<div style="margin: 20px 0;">',
            '<h3 style="color: #007bff;">Financial & Timeline</h3>',
            '<table style="width: 100%; border-collapse: collapse;">',
            '<tr><td style="padding: 8px; font-weight: bold; width: 150px;">Contract Value:</td><td style="padding: 8px;">Rp ' + (contractData.contractValue ? Ext.util.Format.number(contractData.contractValue, '0,0') : 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; font-weight: bold;">Start Date:</td><td style="padding: 8px;">' + (contractData.contractStartDate ? Ext.util.Format.date(new Date(contractData.contractStartDate), 'd M Y') : 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; font-weight: bold;">End Date:</td><td style="padding: 8px;">' + (contractData.contractEndDate ? Ext.util.Format.date(new Date(contractData.contractEndDate), 'd M Y') : 'N/A') + '</td></tr>',
            '<tr><td style="padding: 8px; font-weight: bold;">Duration Hours:</td><td style="padding: 8px;">' + (contractData.durationHours || 0) + ' hours</td></tr>',
            '<tr><td style="padding: 8px; font-weight: bold;">Additional Hours:</td><td style="padding: 8px;">' + (contractData.additionalDurationHours || 0) + ' hours</td></tr>',
            '</table>',
            '</div>',
            
            '<div style="margin: 20px 0;">',
            '<h3 style="color: #007bff;">Geofence Information</h3>',
            '<p style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff;">' + this.formatGeofenceDetails(contractData.geofenceDetails) + '</p>',
            '</div>',
            '</div>'
        ].join('');
    },

    renderContractStatus: function(status) {
        var statusConfig = {
            'active': {color: '#28a745', text: 'Active'},
            'expired': {color: '#dc3545', text: 'Expired'},
            'terminated': {color: '#6c757d', text: 'Terminated'}
        };
        
        var config = statusConfig[status] || {color: '#6c757d', text: status || 'Unknown'};
        return '<span style="color: ' + config.color + '; font-weight: bold;">' + config.text + '</span>';
    },

    formatGeofenceDetails: function(geofenceDetails) {
        if (!geofenceDetails) {
            return 'No geofence defined';
        }
        
        return [
            'Latitude: ' + geofenceDetails.latMin + ' to ' + geofenceDetails.latMax,
            'Longitude: ' + geofenceDetails.lngMin + ' to ' + geofenceDetails.lngMax
        ].join('<br>');
    },

    /**
     * Show create/edit contract modal
     */
    showCreateContractModal: function(record) {
        var isEdit = !!record;
        console.log(isEdit ? 'Edit contract modal' : 'Create contract modal');
        
        // Check if we have selected vehicle data for auto-fill
        var selectedVehicle = window.RDMSelectedVehicleContract || window.RDMSelectedVehicle;
        if (selectedVehicle && selectedVehicle.vin && !isEdit) {
            console.log('Selected vehicle found for contract, showing auto-fill modal:', selectedVehicle);
            this.showCreateContractModalWithVehicle(selectedVehicle);
        } else {
            console.log('No vehicle selected or editing existing contract, showing empty modal');
            this.showCreateContractModalEmpty(record);
        }
    },

    showCreateContractModalWithVehicle: function(vehicleData) {
        console.log('=== AUTO-FILL CONTRACT MODAL WITH VEHICLE DATA ===');
        console.log('Vehicle data:', vehicleData);
        
        var modal = this.createContractModal(true, vehicleData);
        modal.show();
    },

    showCreateContractModalEmpty: function(record) {
        console.log('=== EMPTY CREATE CONTRACT MODAL ===');
        
        var modal = this.createContractModal(false, null, record);
        modal.show();
    },

    createContractModal: function(isAutoFill, vehicleData, editRecord) {
        var isEdit = !!editRecord;
        var titleSuffix = isAutoFill ? ' - ' + (vehicleData.model || 'Selected Vehicle') :
                         isEdit ? ' - ' + (editRecord.get('rentalOrderNumber') || 'Edit') : '';
        
        // Get viewport dimensions for responsive sizing
        var viewport = Ext.getBody().getViewSize();
        var modalWidth = Math.min(800, viewport.width - 40);
        var modalHeight = Math.min(700, viewport.height - 60);
        
        var modal = Ext.create('Ext.window.Window', {
            title: '<i class="fa fa-file-contract"></i> ' + (isEdit ? 'Edit Contract' : 'Create Contract') + titleSuffix,
            modal: true,
            width: modalWidth,
            height: modalHeight,
            layout: 'fit',
            closable: true,
            resizable: true,
            constrainHeader: true,
            maximizable: true,
            items: [{
                xtype: 'form',
                itemId: 'contractForm',
                bodyPadding: '20 25 20 25',
                autoScroll: true,
                layout: 'anchor',
                bodyStyle: 'background: #f8f9fa;',
                defaults: {
                    anchor: '100%',
                    labelWidth: 150,
                    margin: '0 0 12 0',
                    labelStyle: 'font-weight: 600; color: #495057;'
                },
                items: [
                    // Equipment Information Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-cogs"></i> Equipment Information',
                        margin: '0 0 15 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'combobox',
                                        fieldLabel: 'Select Unit *',
                                        name: 'unitSelection',
                                        allowBlank: false,
                                        emptyText: 'Select unit from list...',
                                        cls: 'required-field',
                                        displayField: 'displayName',
                                        valueField: 'id',
                                        queryMode: 'local',
                                        editable: true,
                                        typeAhead: true,
                                        forceSelection: true,
                                        store: {
                                            fields: ['id', 'name', 'vin', 'model', 'year', 'typename', 'uniqid', 'displayName'],
                                            data: []
                                        },
                                        listeners: {
                                            select: this.onUnitSelectionChange.bind(this)
                                        }
                                    },
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'Unit ID (Serial/VIN)',
                                        name: 'unitId',
                                        readOnly: true,
                                        emptyText: 'Auto-filled from selection',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            },
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                margin: '10 0 0 0',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'Unit Name',
                                        name: 'unitName',
                                        readOnly: true,
                                        emptyText: 'Auto-filled from selection'
                                    },
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'Model',
                                        name: 'unitModel',
                                        readOnly: true,
                                        emptyText: 'Auto-filled from selection',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            },
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                margin: '10 0 0 0',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'Year',
                                        name: 'unitYear',
                                        readOnly: true,
                                        emptyText: 'Auto-filled from selection'
                                    },
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'Type',
                                        name: 'unitType',
                                        readOnly: true,
                                        emptyText: 'Auto-filled from selection',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            }
                        ]
                    },
                    
                    // Customer Information Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-user-tie"></i> Customer Information',
                        margin: '0 0 15 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'Customer Name *',
                                        name: 'customerName',
                                        allowBlank: false,
                                        emptyText: 'Enter customer name...',
                                        cls: 'required-field'
                                    },
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'Customer Code',
                                        name: 'customerCode',
                                        emptyText: 'Enter customer code...',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            },
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                margin: '10 0 0 0',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'Sales Representative',
                                        name: 'salesRepresentative',
                                        emptyText: 'Enter sales rep name...'
                                    },
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'RO Number *',
                                        name: 'rentalOrderNumber',
                                        allowBlank: false,
                                        emptyText: 'Enter rental order number...',
                                        cls: 'required-field',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            }
                        ]
                    },
                    
                    // Contract Timeline Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-calendar-alt"></i> Contract Timeline',
                        margin: '0 0 15 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'datefield',
                                        fieldLabel: 'Contract Start *',
                                        name: 'contractStartDate',
                                        allowBlank: false,
                                        format: 'd M Y',
                                        emptyText: 'DD MMM YYYY',
                                        cls: 'required-field',
                                        listeners: {
                                            change: this.onContractStartDateChange.bind(this)
                                        }
                                    },
                                    {
                                        xtype: 'datefield',
                                        fieldLabel: 'Contract End *',
                                        name: 'contractEndDate',
                                        allowBlank: false,
                                        format: 'd M Y',
                                        emptyText: 'DD MMM YYYY',
                                        cls: 'required-field',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            }
                        ]
                    },
                    
                    // Financial & Duration Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-dollar-sign"></i> Financial & Duration Details',
                        margin: '0 0 15 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        fieldLabel: 'Contract Value *',
                                        name: 'contractValue',
                                        allowBlank: false,
                                        emptyText: 'Enter contract value...',
                                        cls: 'required-field',
                                        decimalPrecision: 2,
                                        minValue: 0,
                                        fieldStyle: 'text-align: right'
                                    },
                                    {
                                        xtype: 'displayfield',
                                        fieldLabel: 'Currency',
                                        value: 'IDR (Rupiah)',
                                        width: 150,
                                        margin: '0 0 0 8'
                                    }
                                ]
                            },
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                margin: '10 0 0 0',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        fieldLabel: 'Duration (Hours)',
                                        name: 'durationHours',
                                        emptyText: 'Operating hours...',
                                        minValue: 0,
                                        value: 0,
                                        step: 1,
                                        fieldStyle: 'text-align: right'
                                    },
                                    {
                                        xtype: 'numberfield',
                                        fieldLabel: 'Additional Hours',
                                        name: 'additionalDurationHours',
                                        emptyText: 'Additional hours...',
                                        minValue: 0,
                                        value: 0,
                                        step: 1,
                                        fieldStyle: 'text-align: right',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            }
                        ]
                    },
                    
                    // Geofence Information Section
                    {
                        xtype: 'fieldset',
                        title: '<i class="fa fa-map-marked-alt"></i> Geofence Information',
                        margin: '0 0 5 0',
                        padding: '15 20 15 20',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'combobox',
                                        fieldLabel: 'Select Geofence Zone',
                                        name: 'geofenceSelection',
                                        emptyText: 'Select geofence zone...',
                                        displayField: 'displayName',
                                        valueField: 'zone_id',
                                        queryMode: 'local',
                                        editable: true,
                                        typeAhead: true,
                                        forceSelection: false,
                                        store: {
                                            fields: ['zone_id', 'name', 'text', 'points', 'color', 'zonetype', 'displayName', 'coordinates'],
                                            data: []
                                        },
                                        listeners: {
                                            select: this.onGeofenceSelectionChange.bind(this)
                                        }
                                    },
                                    {
                                        xtype: 'displayfield',
                                        fieldLabel: 'Zone Type',
                                        name: 'geofenceType',
                                        value: 'No zone selected',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            },
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                margin: '10 0 0 0',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        fieldLabel: 'Min Latitude',
                                        name: 'latMin',
                                        readOnly: true,
                                        emptyText: 'Auto-filled from zone',
                                        decimalPrecision: 6,
                                        fieldStyle: 'text-align: right'
                                    },
                                    {
                                        xtype: 'numberfield',
                                        fieldLabel: 'Max Latitude',
                                        name: 'latMax',
                                        readOnly: true,
                                        emptyText: 'Auto-filled from zone',
                                        decimalPrecision: 6,
                                        fieldStyle: 'text-align: right',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            },
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                margin: '10 0 0 0',
                                defaults: {
                                    flex: 1,
                                    margin: '0 8 0 0'
                                },
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        fieldLabel: 'Min Longitude',
                                        name: 'lngMin',
                                        readOnly: true,
                                        emptyText: 'Auto-filled from zone',
                                        decimalPrecision: 6,
                                        fieldStyle: 'text-align: right'
                                    },
                                    {
                                        xtype: 'numberfield',
                                        fieldLabel: 'Max Longitude',
                                        name: 'lngMax',
                                        readOnly: true,
                                        emptyText: 'Auto-filled from zone',
                                        decimalPrecision: 6,
                                        fieldStyle: 'text-align: right',
                                        margin: '0 0 0 8'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                cls: 'dark_form',
                ui: 'footer',
                items: [
                    '->',
                    {
                        text: 'Cancel',
                        iconCls: 'fa fa-times',
                        handler: function() { modal.close(); },
                        cls: 'x-btn-default-small',
                        minWidth: 100
                    },
                    {
                        text: isEdit ? 'Update Contract' : 'Create Contract',
                        iconCls: 'fa fa-save',
                        handler: function() {
                            this.onSubmitContract(modal, isEdit);
                        }.bind(this),
                        cls: 'x-btn-default-small',
                        minWidth: 120
                    }
                ]
            }]
        });

        // Load vehicle tree data and geofence zones
        this.loadVehicleTreeForContract(modal);
        this.loadGeofenceZonesForContract(modal);
        
        // Auto-fill vehicle data if available
        if (isAutoFill && vehicleData) {
            // Auto-fill will happen after vehicle tree loads
            modal.autoFillVehicleData = vehicleData;
        }

        // Fill edit data if editing existing contract
        if (isEdit && editRecord) {
            modal.editRecordId = editRecord.get('id');
            this.populateContractForm(modal, editRecord.getData());
        }

        return modal;
    },

    populateContractForm: function(modal, contractData) {
        console.log('Populating contract form with data:', contractData);
        
        var form = modal.down('#contractForm');
        if (!form) return;
        
        // Populate all contract fields
        var fieldMappings = {
            'unitId': contractData.unitId,
            'unitName': contractData.unitDetails?.unitName,
            'customerName': contractData.customerName,
            'customerCode': contractData.customerCode,
            'salesRepresentative': contractData.salesRepresentative,
            'rentalOrderNumber': contractData.rentalOrderNumber,
            'contractStartDate': contractData.contractStartDate ? new Date(contractData.contractStartDate) : null,
            'contractEndDate': contractData.contractEndDate ? new Date(contractData.contractEndDate) : null,
            'contractValue': contractData.contractValue,
            'durationHours': contractData.durationHours,
            'additionalDurationHours': contractData.additionalDurationHours
        };

        // Fill geofence data if available
        if (contractData.geofenceDetails) {
            var gf = contractData.geofenceDetails;
            fieldMappings['latMin'] = gf.latMin;
            fieldMappings['latMax'] = gf.latMax;
            fieldMappings['lngMin'] = gf.lngMin;
            fieldMappings['lngMax'] = gf.lngMax;
        }

        // Apply values to form fields
        Object.keys(fieldMappings).forEach(function(fieldName) {
            var field = form.down('field[name=' + fieldName + ']');
            var value = fieldMappings[fieldName];
            if (field && value !== undefined && value !== null) {
                field.setValue(value);
            }
        });

        console.log('✅ Contract form populated successfully');
    },

    onContractStartDateChange: function(field, newValue) {
        if (newValue) {
            // Auto-suggest end date (e.g., 1 year later)
            var endDate = new Date(newValue);
            endDate.setFullYear(endDate.getFullYear() + 1);
            
            var form = field.up('form');
            var endDateField = form.down('field[name=contractEndDate]');
            if (endDateField && !endDateField.getValue()) {
                endDateField.setValue(endDate);
            }
        }
    },

    onSubmitContract: function(modal, isEdit) {
        console.log('=== SUBMIT CONTRACT BUTTON CLICKED ===');
        console.log('Edit mode:', isEdit);
        
        var form = modal.down('#contractForm');
        console.log('Form found:', !!form);
        
        if (form.isValid()) {
            var values = form.getValues();
            var apiConfig = Store.rdmtoken.config.ApiConfig;
            
            // Log form values
            console.log('Contract form values:', values);
            
            // Prepare API data according to specification
            var requestData = {
                unitId: values.unitId,
                customerName: values.customerName,
                rentalOrderNumber: values.rentalOrderNumber,
                contractStartDate: this.formatDateToISO(values.contractStartDate),
                contractEndDate: this.formatDateToISO(values.contractEndDate),
                contractValue: parseFloat(values.contractValue)
            };

            // Add optional fields
            if (values.customerCode) requestData.customerCode = values.customerCode;
            if (values.salesRepresentative) requestData.salesRepresentative = values.salesRepresentative;
            if (values.durationHours) requestData.durationHours = parseInt(values.durationHours);
            if (values.additionalDurationHours) requestData.additionalDurationHours = parseInt(values.additionalDurationHours);

            // Add geofence details if provided
            if (values.latMin || values.latMax || values.lngMin || values.lngMax) {
                requestData.geofenceDetails = {
                    latMin: parseFloat(values.latMin) || 0,
                    latMax: parseFloat(values.latMax) || 0,
                    lngMin: parseFloat(values.lngMin) || 0,
                    lngMax: parseFloat(values.lngMax) || 0
                };
            }
            
            var apiUrl = isEdit ?
                apiConfig.getUrl('contractById', {contractId: modal.editRecordId}) :
                apiConfig.getUrl('contractList');
            var method = isEdit ? 'PUT' : 'POST';
            
            console.log('=== CONTRACT API REQUEST DETAILS ===');
            console.log('API URL:', apiUrl);
            console.log('Method:', method);
            console.log('Request Data:', requestData);
            
            // Show loading mask to prevent duplicate submissions
            Ext.Msg.wait(isEdit ? 'Updating contract...' : 'Creating contract...', 'Please wait');
            
            Ext.Ajax.request({
                url: apiUrl,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                jsonData: requestData,
                timeout: 30000,
                success: function(response) {
                    Ext.Msg.hide();
                    console.log('=== CONTRACT API SUCCESS RESPONSE ===');
                    console.log('Raw Response:', response);
                    console.log('Response Text:', response.responseText);
                    
                    try {
                        var result = Ext.decode(response.responseText);
                        console.log('Parsed Result:', result);
                        
                        if (result.status === 200) {
                            console.log('✅ Contract ' + (isEdit ? 'updated' : 'created') + ' successfully');
                            
                            // Show success modal with contract details
                            this.showContractSuccessModal(result.body, requestData, isEdit);
                            
                            modal.close();
                            this.loadContractData(); // Refresh contract grid
                        } else {
                            console.error('❌ API returned error status:', result.status);
                            var errorMsg = result.body?.message || 'Failed to ' + (isEdit ? 'update' : 'create') + ' contract';
                            Ext.Msg.alert('Error', errorMsg);
                        }
                    } catch (parseError) {
                        console.error('❌ Error parsing API response:', parseError);
                        Ext.Msg.alert('Error', 'Invalid response from server');
                    }
                }.bind(this),
                failure: function(response, options) {
                    console.log('=== CONTRACT API FAILURE RESPONSE ===');
                    console.error('❌ API Request failed');
                    console.error('Response:', response);
                    console.error('Response Status:', response.status);
                    console.error('Response Text:', response.responseText);
                    
                    Ext.Msg.hide();
                    
                    var errorMessage = 'Network error occurred';
                    if (response.responseText) {
                        try {
                            var errorResult = Ext.decode(response.responseText);
                            errorMessage = errorResult.body?.message || errorResult.message || errorMessage;
                        } catch (e) {
                            console.error('Could not parse error response:', e);
                        }
                    }
                    
                    Ext.Msg.alert('Error', errorMessage);
                }
            });
        } else {
            console.log('❌ Contract form validation failed');
            var invalidFields = [];
            form.getForm().getFields().each(function(field) {
                if (!field.isValid()) {
                    invalidFields.push(field.getName() + ': ' + field.getActiveError());
                }
            });
            console.log('Invalid fields:', invalidFields);
            
            Ext.Msg.alert('Validation Error', 'Please fill in all required fields correctly.');
        }
    },

    /**
     * Load vehicle tree data for contract modal
     */
    loadVehicleTreeForContract: function(modal) {
        console.log('Loading vehicle tree data for contract modal...');
        
        Ext.Ajax.request({
            url: '/ax/tree.php?vehs=1&state=1',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000,
            success: function(response) {
                console.log('Vehicle tree data loaded successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    console.log('Vehicle tree API response:', result);
                    
                    this.processVehicleTreeForContract(modal, result);
                } catch (e) {
                    console.error('Error parsing vehicle tree response:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to load vehicle tree data:', response);
                // Show fallback empty store
                var combo = modal.down('combobox[name=unitSelection]');
                if (combo && combo.getStore()) {
                    combo.getStore().loadData([]);
                }
            }
        });
    },

    /**
     * Process vehicle tree API response and populate dropdown
     */
    processVehicleTreeForContract: function(modal, treeData) {
        console.log('Processing vehicle tree data for contract dropdown...');
        
        var vehicles = [];
        
        // Extract vehicles from tree structure
        if (Array.isArray(treeData)) {
            treeData.forEach(function(orgNode) {
                if (orgNode.children && Array.isArray(orgNode.children)) {
                    orgNode.children.forEach(function(vehicle) {
                        if (vehicle.leaf && vehicle.iconCls === 'car_icon') {
                            vehicles.push({
                                id: vehicle.vehid || vehicle.id,
                                name: vehicle.name,
                                vin: vehicle.vin,
                                model: vehicle.model || '',
                                year: vehicle.year || '',
                                typename: vehicle.typename || '',
                                uniqid: vehicle.uniqid || '',
                                group: orgNode.name || '',
                                displayName: vehicle.name + ' (' + vehicle.vin + ') - ' + (orgNode.name || 'Unknown Group')
                            });
                        }
                    });
                }
            });
        }
        
        console.log('Extracted vehicles for dropdown:', vehicles.length);
        
        // Populate the dropdown store
        var combo = modal.down('combobox[name=unitSelection]');
        if (combo && combo.getStore()) {
            combo.getStore().loadData(vehicles);
            console.log('✅ Vehicle dropdown populated with', vehicles.length, 'vehicles');
            
            // Auto-select vehicle if auto-fill data is available
            if (modal.autoFillVehicleData && modal.autoFillVehicleData.vin) {
                var matchingVehicle = vehicles.find(function(v) {
                    return v.vin === modal.autoFillVehicleData.vin;
                });
                
                if (matchingVehicle) {
                    combo.setValue(matchingVehicle.id);
                    this.fillContractFormWithVehicle(modal, matchingVehicle);
                    console.log('✅ Auto-selected vehicle:', matchingVehicle.name);
                }
            }
        }
    },

    /**
     * Handle unit selection change event
     */
    onUnitSelectionChange: function(combo, record) {
        console.log('Unit selection changed:', record.getData());
        
        var vehicleData = record.getData();
        var modal = combo.up('window');
        
        if (modal && vehicleData) {
            this.fillContractFormWithVehicle(modal, vehicleData);
        }
    },

    /**
     * Fill contract form with selected vehicle data
     */
    fillContractFormWithVehicle: function(modal, vehicleData) {
        console.log('Filling contract form with vehicle data:', vehicleData);
        
        var form = modal.down('#contractForm');
        if (!form) return;
        
        // Fill equipment fields
        var fieldMappings = {
            'unitId': vehicleData.vin,
            'unitName': vehicleData.name,
            'unitModel': vehicleData.model,
            'unitYear': vehicleData.year,
            'unitType': vehicleData.typename
        };
        
        Object.keys(fieldMappings).forEach(function(fieldName) {
            var field = form.down('field[name=' + fieldName + ']');
            var value = fieldMappings[fieldName];
            if (field && value) {
                field.setValue(value);
                console.log('✓', fieldName, 'filled:', value);
            }
        });
        
        console.log('✅ Contract form filled with vehicle data');
    },

    /**
     * Load geofence zones data for contract modal
     */
    loadGeofenceZonesForContract: function(modal) {
        console.log('Loading geofence zones data for contract modal...');
        
        Ext.Ajax.request({
            url: '/ax/zones.php',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000,
            success: function(response) {
                console.log('Geofence zones data loaded successfully');
                try {
                    var result = Ext.decode(response.responseText);
                    console.log('Geofence zones API response:', result);
                    
                    this.processGeofenceZonesForContract(modal, result);
                } catch (e) {
                    console.error('Error parsing geofence zones response:', e);
                }
            }.bind(this),
            failure: function(response) {
                console.error('Failed to load geofence zones data:', response);
                // Show fallback empty store
                var combo = modal.down('combobox[name=geofenceSelection]');
                if (combo && combo.getStore()) {
                    combo.getStore().loadData([]);
                }
            }
        });
    },

    /**
     * Process geofence zones API response and populate dropdown
     */
    processGeofenceZonesForContract: function(modal, zonesData) {
        console.log('Processing geofence zones data for contract dropdown...');
        
        var zones = [];
        
        // Extract zones from tree structure
        if (Array.isArray(zonesData)) {
            zonesData.forEach(function(groupNode) {
                if (groupNode.children && Array.isArray(groupNode.children)) {
                    groupNode.children.forEach(function(zone) {
                        if (zone.leaf && zone.iconCls === 'zone_icon') {
                            // Parse coordinates from points or metadata.points
                            var coordinates = this.parseGeofencePoints(zone.points || zone.metadata?.points);
                            
                            zones.push({
                                zone_id: zone.zone_id || zone.id,
                                name: zone.name,
                                text: zone.text,
                                points: zone.points || zone.metadata?.points || '',
                                color: zone.color || zone.metadata?.color,
                                zonetype: zone.zonetype || zone.metadata?.zonetype,
                                coordinates: coordinates,
                                group: groupNode.name || groupNode.text || '',
                                displayName: (zone.text || zone.name) + ' - ' + (groupNode.name || groupNode.text || 'Unknown Group')
                            });
                        }
                    }.bind(this));
                }
            }.bind(this));
        }
        
        console.log('Extracted geofence zones for dropdown:', zones.length);
        
        // Populate the dropdown store
        var combo = modal.down('combobox[name=geofenceSelection]');
        if (combo && combo.getStore()) {
            combo.getStore().loadData(zones);
            console.log('✅ Geofence dropdown populated with', zones.length, 'zones');
        }
    },

    /**
     * Parse geofence points string to extract coordinate bounds
     */
    parseGeofencePoints: function(pointsString) {
        if (!pointsString || typeof pointsString !== 'string') {
            return null;
        }
        
        try {
            // Points can be in format: "lat1,lng1,lat2,lng2" or "lat1,lng1;lat2,lng2" etc.
            var coords = pointsString.split(/[,;]/).map(function(coord) {
                return parseFloat(coord.trim());
            }).filter(function(coord) {
                return !isNaN(coord);
            });
            
            if (coords.length >= 2) {
                var lats = [];
                var lngs = [];
                
                // Extract lat/lng pairs
                for (var i = 0; i < coords.length; i += 2) {
                    if (i + 1 < coords.length) {
                        lats.push(coords[i]);
                        lngs.push(coords[i + 1]);
                    }
                }
                
                if (lats.length > 0 && lngs.length > 0) {
                    return {
                        latMin: Math.min.apply(null, lats),
                        latMax: Math.max.apply(null, lats),
                        lngMin: Math.min.apply(null, lngs),
                        lngMax: Math.max.apply(null, lngs)
                    };
                }
            }
        } catch (e) {
            console.warn('Error parsing geofence points:', pointsString, e);
        }
        
        return null;
    },

    /**
     * Handle geofence selection change event
     */
    onGeofenceSelectionChange: function(combo, record) {
        console.log('Geofence selection changed:', record.getData());
        
        var zoneData = record.getData();
        var modal = combo.up('window');
        
        if (modal && zoneData) {
            this.fillContractFormWithGeofence(modal, zoneData);
        }
    },

    /**
     * Fill contract form with selected geofence data
     */
    fillContractFormWithGeofence: function(modal, zoneData) {
        console.log('Filling contract form with geofence data:', zoneData);
        
        var form = modal.down('#contractForm');
        if (!form) return;
        
        // Update zone type display
        var zoneTypeField = form.down('field[name=geofenceType]');
        if (zoneTypeField) {
            var zoneTypeText = this.getZoneTypeText(zoneData.zonetype);
            zoneTypeField.setValue('<span style="color: ' + (zoneData.color || '#666') + '; font-weight: 600;">' + zoneTypeText + '</span>');
        }
        
        // Fill coordinate fields if coordinates are available
        if (zoneData.coordinates) {
            var coordMappings = {
                'latMin': zoneData.coordinates.latMin,
                'latMax': zoneData.coordinates.latMax,
                'lngMin': zoneData.coordinates.lngMin,
                'lngMax': zoneData.coordinates.lngMax
            };
            
            Object.keys(coordMappings).forEach(function(fieldName) {
                var field = form.down('field[name=' + fieldName + ']');
                var value = coordMappings[fieldName];
                if (field && value !== undefined && value !== null) {
                    field.setValue(value);
                    console.log('✓', fieldName, 'filled:', value);
                }
            });
        }
        
        console.log('✅ Contract form filled with geofence data');
    },

    /**
     * Get human-readable zone type text
     */
    getZoneTypeText: function(zonetype) {
        var zoneTypes = {
            1: 'Standard Zone',
            2: 'Restricted Area',
            3: 'Speed Limit Zone',
            4: 'Custom Zone'
        };
        
        return zoneTypes[zonetype] || 'Zone Type ' + (zonetype || 'Unknown');
    },

    showContractSuccessModal: function(responseData, requestData, isEdit) {
        var action = isEdit ? 'updated' : 'created';
        var contractId = responseData.id || responseData.contractId || 'Generated';
        
        var successMessage = [
            '<div style="text-align: center;">',
            '<h3 style="color: #28a745; margin-bottom: 15px;"><i class="fa fa-check-circle"></i> Contract ' + (isEdit ? 'Updated' : 'Created') + ' Successfully!</h3>',
            
            // Contract ID Display
            '<div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2196f3;">',
            '<h4 style="color: #1565c0; margin-bottom: 10px;">Contract ID</h4>',
            '<div style="font-size: 18px; font-weight: bold; color: #1565c0; font-family: monospace;">' + contractId + '</div>',
            '</div>',
            '</div>',
            
            // Contract Information - Left aligned for better readability
            '<div style="text-align: left;">',
            '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">',
            '<h4 style="color: #495057; margin-bottom: 10px; text-align: center;">Contract Details</h4>',
            '<table style="width: 100%; border-collapse: collapse;">',
            '<tr><td style="padding: 5px; font-weight: 600; width: 120px;">Customer:</td><td style="padding: 5px;">' + (requestData.customerName || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 5px; font-weight: 600;">RO Number:</td><td style="padding: 5px;">' + (requestData.rentalOrderNumber || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 5px; font-weight: 600;">Unit ID:</td><td style="padding: 5px;">' + (requestData.unitId || 'N/A') + '</td></tr>',
            '<tr><td style="padding: 5px; font-weight: 600;">Sales Rep:</td><td style="padding: 5px;">' + (requestData.salesRepresentative || 'N/A') + '</td></tr>',
            '</table>',
            '</div>',
            
            // Financial Information
            '<div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0;">',
            '<h4 style="color: #155724; margin-bottom: 10px; text-align: center;">Financial Details</h4>',
            '<table style="width: 100%; border-collapse: collapse;">',
            '<tr><td style="padding: 5px; font-weight: 600; width: 120px;">Contract Value:</td><td style="padding: 5px; color: #28a745; font-weight: 600;">Rp ' +
            (requestData.contractValue ? Ext.util.Format.number(requestData.contractValue, '0,0') : 'N/A') + '</td></tr>',
            '<tr><td style="padding: 5px; font-weight: 600;">Duration:</td><td style="padding: 5px;">' + (requestData.durationHours || 0) + ' hours</td></tr>',
            '<tr><td style="padding: 5px; font-weight: 600;">Additional Hours:</td><td style="padding: 5px;">' + (requestData.additionalDurationHours || 0) + ' hours</td></tr>',
            '</table>',
            '</div>',
            
            // Timeline Information
            '<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">',
            '<h4 style="color: #856404; margin-bottom: 10px; text-align: center;">Contract Timeline</h4>',
            '<table style="width: 100%; border-collapse: collapse;">',
            '<tr><td style="padding: 5px; font-weight: 600; width: 120px;">Start Date:</td><td style="padding: 5px;">' +
            (requestData.contractStartDate ? Ext.util.Format.date(new Date(requestData.contractStartDate), 'd M Y') : 'N/A') + '</td></tr>',
            '<tr><td style="padding: 5px; font-weight: 600;">End Date:</td><td style="padding: 5px;">' +
            (requestData.contractEndDate ? Ext.util.Format.date(new Date(requestData.contractEndDate), 'd M Y') : 'N/A') + '</td></tr>',
            '</table>',
            '</div>',
            
            '<p style="color: #666; font-size: 14px; margin-top: 15px; text-align: center;">Contract has been ' + action + ' successfully. You can now create token requests for this contract.</p>',
            '</div>'
        ].join('');
        
        Ext.Msg.alert('Contract ' + (isEdit ? 'Updated' : 'Created'), successMessage);
    },

    /**
     * Initialize global contract functions
     */
    initializeGlobalContractFunctions: function() {
        // Initialize global contract management functions for UI interactions
        window.rdmContract = {
            viewContract: function(contractId) {
                console.log('View contract:', contractId);
                var grid = Ext.ComponentQuery.query('gridpanel[itemId=contractGrid]')[0];
                if (grid) {
                    var record = grid.getStore().getById(contractId);
                    if (record) {
                        this.showContractDetails(record);
                    }
                }
            }.bind(this),
            
            editContract: function(contractId) {
                console.log('Edit contract:', contractId);
                var grid = Ext.ComponentQuery.query('gridpanel[itemId=contractGrid]')[0];
                if (grid) {
                    var record = grid.getStore().getById(contractId);
                    if (record) {
                        this.showCreateContractModal(record);
                    }
                }
            }.bind(this),
            
            renewContract: function(contractId) {
                console.log('Renew contract:', contractId);
                Ext.Msg.alert('Contract Renewal', 'Contract renewal functionality will be implemented in future version.');
            }.bind(this)
        };
    }
});
