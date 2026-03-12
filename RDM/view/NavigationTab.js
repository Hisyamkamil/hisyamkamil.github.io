/**
 * Navigation Tab Component
 * Left sidebar navigation with actual panel components
 */
Ext.define('Store.rdmtoken.view.NavigationTab', {
    extend: 'Ext.tab.Panel',
    
    requires: [
        'Store.rdmtoken.view.DashboardPanel',
        'Store.rdmtoken.view.TokenManagementPanel',
        'Store.rdmtoken.view.LocationMonitoringPanel',
        'Store.rdmtoken.view.ContractPanel',
        'Store.rdmtoken.view.ApprovalPanel',
        'Store.rdmtoken.view.ReportPanel'
    ],
    
    // Vertical navigation configuration
    tabPosition: 'left',
    tabRotation: 0,
    width: 250,
    
    initComponent: function() {
        this.items = [
            {
                title: 'Dashboard',
                iconCls: 'fa fa-tachometer-alt',
                itemId: 'dashboard',
                layout: 'fit',
                items: [{
                    xtype: 'treepanel',
                    title: 'Vehicle Overview for Dashboard',
                    tools: [{
                        xtype: 'button',
                        iconCls: 'fa fa-rotate',
                        tooltip: 'Refresh Vehicle List',
                        handler: function () {
                            this.up('treepanel').getStore().load();
                        }
                    }],
                    rootVisible: false,
                    useArrows: true,
                    border: false,
                    // Create tree store that loads vehicle data from PILOT API
                    store: Ext.create('Ext.data.TreeStore', {
                        proxy: {
                            type: 'ajax',
                            url: '/ax/tree.php?vehs=1&state=1'
                        },
                        root: {
                            text: 'Vehicles',
                            expanded: true
                        },
                        autoLoad: true
                    }),
                    // Define columns for the vehicle tree
                    columns: [{
                        text: 'Vehicle',
                        xtype: 'treecolumn',
                        dataIndex: 'name',
                        flex: 2,
                        renderer: function(value) {
                            return value || 'Unknown';
                        }
                    }, {
                        text: 'Serial Number',
                        dataIndex: 'vin',
                        flex: 1,
                        renderer: function(value, metaData, record) {
                            // Only show for leaf nodes (vehicles), not for folder nodes
                            if (record.get('leaf') === true || record.get('typeid') === 1) {
                                return value || 'N/A';
                            }
                            return ''; // Empty for folder nodes
                        }
                    }, {
                        text: 'IMEI',
                        dataIndex: 'uniqid',
                        flex: 1,
                        renderer: function(value, metaData, record) {
                            // Only show for leaf nodes (vehicles), not for folder nodes
                            if (record.get('leaf') === true || record.get('typeid') === 1) {
                                return value || 'N/A';
                            }
                            return ''; // Empty for folder nodes
                        }
                    }, {
                        text: 'Status',
                        dataIndex: 'rental_status',
                        flex: 1,
                        renderer: function(value, metaData, record) {
                            // Only show for leaf nodes (vehicles), not for folder nodes
                            if (!(record.get('leaf') === true || record.get('typeid') === 1)) {
                                return ''; // Empty for folder nodes
                            }
                            
                            // Determine rental status based on available data
                            var rentalStatus = value || 'available'; // Default to available
                            
                            // If no explicit rental status, determine based on other fields
                            if (!value) {
                                // Check if vehicle has active contracts/tokens
                                var isOnline = record.get('online');
                                var hasActiveContract = record.get('active_contract'); // Assuming this field exists
                                
                                if (hasActiveContract) {
                                    rentalStatus = 'rented';
                                } else if (isOnline === 0 || isOnline === '0') {
                                    rentalStatus = 'breakdown';
                                } else {
                                    rentalStatus = 'available';
                                }
                            }
                            
                            // Render status with appropriate colors
                            switch(rentalStatus) {
                                case 'available':
                                    return '<span style="color: #28a745; font-weight: bold;">Available</span>';
                                case 'rented':
                                    return '<span style="color: #ffc107; font-weight: bold;">Rented</span>';
                                case 'breakdown':
                                    return '<span style="color: #dc3545; font-weight: bold;">Breakdown</span>';
                                default:
                                    return '<span style="color: #6c757d;">Unknown</span>';
                            }
                        }
                    }, {
                        text: 'Token Status',
                        dataIndex: 'token_status',
                        flex: 1,
                        renderer: function(value, metaData, record) {
                            // Only show for leaf nodes (vehicles), not for folder nodes
                            if (!(record.get('leaf') === true || record.get('typeid') === 1)) {
                                return ''; // Empty for folder nodes
                            }
                            
                            // Determine token status
                            var tokenStatus = value || 'no_token'; // Default to no token
                            
                            // Render status with appropriate colors
                            switch(tokenStatus) {
                                case 'active':
                                    return '<span style="color: #28a745; font-weight: bold;">Active Token</span>';
                                case 'expired':
                                    return '<span style="color: #dc3545; font-weight: bold;">Expired Token</span>';
                                case 'pending':
                                    return '<span style="color: #ffc107; font-weight: bold;">Pending</span>';
                                default:
                                    return '<span style="color: #6c757d;">No Token</span>';
                            }
                        }
                    }],
                    // Handle vehicle selection for dashboard overview
                    listeners: {
                        selectionchange: function(selectionModel, selected) {
                            if (selected.length > 0) {
                                var record = selected[0];
                                var vehicleData = record.getData();
                                
                                // Store selected vehicle globally for dashboard context
                                window.RDMSelectedVehicleDashboard = {
                                    id: vehicleData.id,
                                    name: vehicleData.name,
                                    vin: vehicleData.vin,
                                    uniqid: vehicleData.uniqid, // IMEI
                                    model: vehicleData.model,
                                    year: vehicleData.year,
                                    rentalStatus: vehicleData.rental_status,
                                    tokenStatus: vehicleData.token_status,
                                    online: vehicleData.online
                                };
                                
                                console.log('Vehicle selected in Dashboard:', {
                                    name: vehicleData.name,
                                    vin: vehicleData.vin,
                                    rentalStatus: vehicleData.rental_status,
                                    tokenStatus: vehicleData.token_status
                                });
                            } else {
                                // Clear selection
                                window.RDMSelectedVehicleDashboard = null;
                            }
                        }
                    }
                }],
                listeners: {
                    activate: this.onDashboardActivate.bind(this)
                }
            },
            {
                title: 'Token Management',
                iconCls: 'fa fa-key',
                itemId: 'tokenmanagement',
                layout: 'fit',
                items: [{
                    xtype: 'tabpanel',
                    tabPosition: 'top',
                    defaults: {
                        layout: 'fit',
                        border: false
                    },
                    items: [
                        {
                            title: 'By Vehicle',
                            iconCls: 'fa fa-car',
                            itemId: 'vehicleTab',
                            items: [{
                                xtype: 'treepanel',
                                title: 'Select Vehicle for RDM Tokens',
                                tools: [{
                                    xtype: 'button',
                                    iconCls: 'fa fa-rotate',
                                    tooltip: 'Refresh Vehicle List',
                                    handler: function () {
                                        this.up('treepanel').getStore().load();
                                    }
                                }],
                                rootVisible: false,
                                useArrows: true,
                                border: false,
                                // Create tree store that loads vehicle data from PILOT API
                                store: Ext.create('Ext.data.TreeStore', {
                                    proxy: {
                                        type: 'ajax',
                                        url: '/ax/tree.php?vehs=1&state=1'
                                    },
                                    root: {
                                        text: 'Vehicles',
                                        expanded: true
                                    },
                                    autoLoad: true
                                }),
                                // Define columns for the vehicle tree
                                columns: [{
                                    text: 'Vehicle',
                                    xtype: 'treecolumn',
                                    dataIndex: 'name',
                                    flex: 2,
                                    renderer: function(value) {
                                        return value || 'Unknown';
                                    }
                                }, {
                                    text: 'Serial Number',
                                    dataIndex: 'vin',
                                    flex: 1,
                                    renderer: function(value, metaData, record) {
                                        // Only show for leaf nodes (vehicles), not for folder nodes
                                        if (record.get('leaf') === true || record.get('typeid') === 1) {
                                            return value || 'N/A';
                                        }
                                        return ''; // Empty for folder nodes
                                    }
                                }, {
                                    text: 'IMEI',
                                    dataIndex: 'uniqid',
                                    flex: 1,
                                    renderer: function(value, metaData, record) {
                                        // Only show for leaf nodes (vehicles), not for folder nodes
                                        if (record.get('leaf') === true || record.get('typeid') === 1) {
                                            return value || 'N/A';
                                        }
                                        return ''; // Empty for folder nodes
                                    }
                                }, {
                                    text: 'Status',
                                    dataIndex: 'rental_status',
                                    flex: 1,
                                    renderer: function(value, metaData, record) {
                                        // Only show for leaf nodes (vehicles), not for folder nodes
                                        if (!(record.get('leaf') === true || record.get('typeid') === 1)) {
                                            return ''; // Empty for folder nodes
                                        }
                                        
                                        // Determine rental status based on available data
                                        var rentalStatus = value || 'available'; // Default to available
                                        
                                        // If no explicit rental status, determine based on other fields
                                        if (!value) {
                                            // Check if vehicle has active contracts/tokens
                                            var isOnline = record.get('online');
                                            var hasActiveContract = record.get('active_contract'); // Assuming this field exists
                                            
                                            if (hasActiveContract) {
                                                rentalStatus = 'rented';
                                            } else if (isOnline === 0 || isOnline === '0') {
                                                rentalStatus = 'breakdown';
                                            } else {
                                                rentalStatus = 'available';
                                            }
                                        }
                                        
                                        // Render status with appropriate colors
                                        switch(rentalStatus) {
                                            case 'available':
                                                return '<span style="color: #28a745; font-weight: bold;">Available</span>';
                                            case 'rented':
                                                return '<span style="color: #ffc107; font-weight: bold;">Rented</span>';
                                            case 'breakdown':
                                                return '<span style="color: #dc3545; font-weight: bold;">Breakdown</span>';
                                            default:
                                                return '<span style="color: #6c757d;">Unknown</span>';
                                        }
                                    }
                                }],
                                // Handle vehicle selection
                                listeners: {
                                    selectionchange: function(selectionModel, selected) {
                                        if (selected.length > 0) {
                                            var record = selected[0];
                                            var vehicleData = record.getData();
                                            
                                            // Store selected vehicle globally for auto-fill functionality
                                            window.RDMSelectedVehicle = {
                                                id: vehicleData.id,
                                                name: vehicleData.name,
                                                vin: vehicleData.vin,
                                                uniqid: vehicleData.uniqid, // IMEI
                                                model: vehicleData.model,
                                                year: vehicleData.year,
                                                info: vehicleData.info,
                                                group: vehicleData.group
                                            };
                                            
                                            console.log('Vehicle selected for RDM Token:', {
                                                name: vehicleData.name,
                                                vin: vehicleData.vin,
                                                imei: vehicleData.uniqid
                                            });
                                            
                                            console.log('Vehicle selected from nav tree:', record.get('name'), 'ID:', record.get('id'));
                                        } else {
                                            // Clear selection
                                            window.RDMSelectedVehicle = null;
                                        }
                                    }
                                }
                            }]
                        },
                        {
                            title: 'By Contract',
                            iconCls: 'fa fa-file-contract',
                            itemId: 'contractTab',
                            items: [{
                                xtype: 'gridpanel',
                                title: 'Select Contract for RDM Tokens',
                                tools: [{
                                    xtype: 'button',
                                    iconCls: 'fa fa-rotate',
                                    tooltip: 'Refresh Contract List',
                                    handler: function () {
                                        this.up('gridpanel').getStore().load();
                                    }
                                }],
                                border: false,
                                store: Ext.create('Ext.data.Store', {
                                    fields: [
                                        'id', 'customerName', 'customerCode', 'rentalOrderNumber',
                                        'contractStartDate', 'contractEndDate', 'contractValue',
                                        'status', 'durationHours', 'salesRepresentative',
                                        // Unit details fields
                                        {name: 'serialNumber', mapping: 'unitDetails.serialNumber'},
                                        {name: 'unitName', mapping: 'unitDetails.unitName'},
                                        {name: 'unitModel', mapping: 'unitDetails.model'},
                                        {name: 'unitYear', mapping: 'unitDetails.year'}
                                    ],
                                    proxy: {
                                        type: 'ajax',
                                        url: function() {
                                            var apiConfig = Store.rdmtoken.config.ApiConfig;
                                            return apiConfig.getUrl('contractList') + '?status=active&limit=50';
                                        }(),
                                        reader: {
                                            type: 'json',
                                            rootProperty: 'body.contracts'
                                        }
                                    },
                                    autoLoad: true
                                }),
                                columns: [
                                    {
                                        text: 'Customer Name',
                                        dataIndex: 'customerName',
                                        flex: 2,
                                        renderer: function(value) {
                                            return value || 'N/A';
                                        }
                                    },
                                    {
                                        text: 'RO Number',
                                        dataIndex: 'rentalOrderNumber',
                                        flex: 1,
                                        renderer: function(value) {
                                            return value || 'N/A';
                                        }
                                    },
                                    {
                                        text: 'Serial Number',
                                        dataIndex: 'serialNumber',
                                        flex: 1,
                                        renderer: function(value) {
                                            return value || 'N/A';
                                        }
                                    },
                                    {
                                        text: 'Contract Value',
                                        dataIndex: 'contractValue',
                                        flex: 1,
                                        renderer: function(value) {
                                            if (value) {
                                                return '$' + Ext.util.Format.number(value, '0,0.00');
                                            }
                                            return 'N/A';
                                        }
                                    },
                                    {
                                        text: 'Status',
                                        dataIndex: 'status',
                                        width: 100,
                                        renderer: function(value) {
                                            var statusConfig = {
                                                'active': {color: '#28a745', text: 'Active'},
                                                'expired': {color: '#dc3545', text: 'Expired'},
                                                'terminated': {color: '#6c757d', text: 'Terminated'}
                                            };
                                            
                                            var config = statusConfig[value] || {color: '#6c757d', text: value || 'Unknown'};
                                            return '<span style="color: ' + config.color + '; font-weight: bold;">' + config.text + '</span>';
                                        }
                                    },
                                    {
                                        text: 'Contract Start',
                                        dataIndex: 'contractStartDate',
                                        flex: 1,
                                        renderer: function(value) {
                                            if (value) {
                                                return Ext.util.Format.date(new Date(value), 'd M Y');
                                            }
                                            return 'N/A';
                                        }
                                    },
                                    {
                                        text: 'Contract End',
                                        dataIndex: 'contractEndDate',
                                        flex: 1,
                                        renderer: function(value) {
                                            if (value) {
                                                return Ext.util.Format.date(new Date(value), 'd M Y');
                                            }
                                            return 'N/A';
                                        }
                                    }
                                ],
                                // Handle contract selection
                                listeners: {
                                    selectionchange: function(selectionModel, selected) {
                                        if (selected.length > 0) {
                                            var record = selected[0];
                                            var contractData = record.getData();
                                            var rawData = record.raw || record.data;
                                            
                                            // Store selected contract globally for auto-fill functionality
                                            window.RDMSelectedContract = {
                                                id: contractData.id,
                                                customerName: contractData.customerName,
                                                customerCode: contractData.customerCode,
                                                rentalOrderNumber: contractData.rentalOrderNumber,
                                                contractStartDate: contractData.contractStartDate,
                                                contractEndDate: contractData.contractEndDate,
                                                contractValue: contractData.contractValue,
                                                durationHours: contractData.durationHours,
                                                salesRepresentative: contractData.salesRepresentative,
                                                // Unit details from the nested structure
                                                serialNumber: contractData.serialNumber,
                                                unitName: contractData.unitName,
                                                unitModel: contractData.unitModel,
                                                unitYear: contractData.unitYear,
                                                // Store original unit details if available
                                                unitDetails: rawData && rawData.unitDetails ? rawData.unitDetails : null,
                                                geofenceDetails: rawData && rawData.geofenceDetails ? rawData.geofenceDetails : null
                                            };
                                            
                                            console.log('Contract selected for RDM Token:', {
                                                id: contractData.id,
                                                customer: contractData.customerName,
                                                roNumber: contractData.rentalOrderNumber,
                                                serialNumber: contractData.serialNumber,
                                                unitName: contractData.unitName
                                            });
                                        } else {
                                            // Clear selection
                                            window.RDMSelectedContract = null;
                                        }
                                    }
                                }
                            }]
                        }
                    ]
                }],
                listeners: {
                    activate: this.onTokenManagementActivate.bind(this)
                }
            },
            // {
            //     title: 'Location Monitoring',
            //     iconCls: 'fa fa-map-marker-alt',
            //     itemId: 'locationmonitoring',
            //     layout: 'fit',
            //     items: [
            //         Ext.create('Store.rdmtoken.view.LocationMonitoringPanel')
            //     ],
            //     listeners: {
            //         activate: this.onLocationMonitoringActivate.bind(this)
            //     }
            // },
            {
                title: 'Contract',
                iconCls: 'fa fa-file-contract',
                itemId: 'contract',
                layout: 'fit',
                items: [{
                    xtype: 'treepanel',
                    title: 'Select Vehicle for Contract Management',
                    tools: [{
                        xtype: 'button',
                        iconCls: 'fa fa-rotate',
                        tooltip: 'Refresh Vehicle List',
                        handler: function () {
                            this.up('treepanel').getStore().load();
                        }
                    }],
                    rootVisible: false,
                    useArrows: true,
                    border: false,
                    // Create tree store that loads vehicle data from PILOT API
                    store: Ext.create('Ext.data.TreeStore', {
                        proxy: {
                            type: 'ajax',
                            url: '/ax/tree.php?vehs=1&state=1'
                        },
                        root: {
                            text: 'Vehicles',
                            expanded: true
                        },
                        autoLoad: true
                    }),
                    // Define columns for the vehicle tree
                    columns: [{
                        text: 'Vehicle',
                        xtype: 'treecolumn',
                        dataIndex: 'name',
                        flex: 2,
                        renderer: function(value) {
                            return value || 'Unknown';
                        }
                    }, {
                        text: 'Serial Number',
                        dataIndex: 'vin',
                        flex: 1,
                        renderer: function(value, metaData, record) {
                            // Only show for leaf nodes (vehicles), not for folder nodes
                            if (record.get('leaf') === true || record.get('typeid') === 1) {
                                return value || 'N/A';
                            }
                            return ''; // Empty for folder nodes
                        }
                    }, {
                        text: 'IMEI',
                        dataIndex: 'uniqid',
                        flex: 1,
                        renderer: function(value, metaData, record) {
                            // Only show for leaf nodes (vehicles), not for folder nodes
                            if (record.get('leaf') === true || record.get('typeid') === 1) {
                                return value || 'N/A';
                            }
                            return ''; // Empty for folder nodes
                        }
                    }, {
                        text: 'Contract Status',
                        dataIndex: 'contract_status',
                        flex: 1,
                        renderer: function(value, metaData, record) {
                            // Only show for leaf nodes (vehicles), not for folder nodes
                            if (!(record.get('leaf') === true || record.get('typeid') === 1)) {
                                return ''; // Empty for folder nodes
                            }
                            
                            // Determine contract status
                            var contractStatus = value || 'no_contract'; // Default to no contract
                            
                            // Render status with appropriate colors
                            switch(contractStatus) {
                                case 'active':
                                    return '<span style="color: #28a745; font-weight: bold;">Active Contract</span>';
                                case 'expired':
                                    return '<span style="color: #dc3545; font-weight: bold;">Expired Contract</span>';
                                case 'terminated':
                                    return '<span style="color: #6c757d; font-weight: bold;">Terminated</span>';
                                default:
                                    return '<span style="color: #17a2b8;">No Contract</span>';
                            }
                        }
                    }],
                    // Handle vehicle selection for contract management
                    listeners: {
                        selectionchange: function(selectionModel, selected) {
                            if (selected.length > 0) {
                                var record = selected[0];
                                var vehicleData = record.getData();
                                
                                // Store selected vehicle globally for contract management
                                window.RDMSelectedVehicleForContract = {
                                    id: vehicleData.id,
                                    name: vehicleData.name,
                                    vin: vehicleData.vin,
                                    uniqid: vehicleData.uniqid, // IMEI
                                    model: vehicleData.model,
                                    year: vehicleData.year,
                                    contractStatus: vehicleData.contract_status
                                };
                                
                                console.log('Vehicle selected for Contract Management:', {
                                    name: vehicleData.name,
                                    vin: vehicleData.vin,
                                    contractStatus: vehicleData.contract_status
                                });
                            } else {
                                // Clear selection
                                window.RDMSelectedVehicleForContract = null;
                            }
                        }
                    }
                }],
                listeners: {
                    activate: this.onContractActivate.bind(this)
                }
            }
            // {
            //     title: 'Approval',
            //     iconCls: 'fa fa-check-circle',
            //     itemId: 'approval',
            //     layout: 'fit',
            //     items: [
            //         Ext.create('Store.rdmtoken.view.ApprovalPanel')
            //     ],
            //     listeners: {
            //         activate: this.onApprovalActivate.bind(this)
            //     }
            // },
            // {
            //     title: 'Report',
            //     iconCls: 'fa fa-chart-bar',
            //     itemId: 'report',
            //     layout: 'fit',
            //     items: [
            //         Ext.create('Store.rdmtoken.view.ReportPanel')
            //     ],
            //     listeners: {
            //         activate: this.onReportActivate.bind(this)
            //     }
            // }
        ];

        this.callParent(arguments);
    },

    onDashboardActivate: function() {
        console.log('Dashboard tab activated');
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('dashboard');
        }
        if (window.RDMController) {
            window.RDMController.onDashboardActivate();
        }
    },

    onTokenManagementActivate: function() {
        console.log('Token Management tab activated');
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('tokenmanagement');
        }
        if (window.RDMController) {
            window.RDMController.onTokenManagementActivate();
        }
    },

    // onLocationMonitoringActivate: function() {
    //     console.log('Location Monitoring tab activated');
    //     if (this.map_frame) {
    //         this.map_frame.getLayout().setActiveItem('locationmonitoring');
    //     }
    //     if (window.RDMController) {
    //         window.RDMController.onLocationMonitoringActivate();
    //     }
    // },

    onContractActivate: function() {
        console.log('Contract tab activated');
        if (this.map_frame) {
            this.map_frame.getLayout().setActiveItem('contract');
        }
        if (window.RDMController) {
            window.RDMController.onContractActivate();
        }
    }

    // onApprovalActivate: function() {
    //     console.log('Approval tab activated');
    //     if (this.map_frame) {
    //         this.map_frame.getLayout().setActiveItem('approval');
    //     }
    //     if (window.RDMController) {
    //         window.RDMController.onApprovalActivate();
    //     }
    // },

    // onReportActivate: function() {
    //     console.log('Report tab activated');
    //     if (this.map_frame) {
    //         this.map_frame.getLayout().setActiveItem('report');
    //     }
    //     if (window.RDMController) {
    //         window.RDMController.onReportActivate();
    //     }
    // }
});
