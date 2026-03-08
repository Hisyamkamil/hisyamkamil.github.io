/**
 * Location Monitoring Panel Component
 * Interactive map interface with unit tracking
 */
Ext.define('Store.rdmtoken.view.LocationMonitoringPanel', {
    extend: 'Ext.panel.Panel',
    layout: 'border',

    config: {
        controller: null
    },

    initComponent: function() {
        this.items = [
            this.createUnitListPanel(),
            this.createMapPanel()
        ];

        this.callParent(arguments);
    },

    createUnitListPanel: function() {
        return {
            region: 'west',
            width: 300,
            split: true,
            title: 'Units',
            layout: 'vbox',
            items: [
                {
                    xtype: 'toolbar',
                    items: [{
                        xtype: 'combobox',
                        displayField: 'text',
                        valueField: 'value',
                        emptyText: 'By User',
                        flex: 1,
                        itemId: 'userFilter'
                    }]
                },
                {
                    xtype: 'textfield',
                    emptyText: 'Search units...',
                    margin: '5 5 5 5',
                    itemId: 'unitSearchField',
                    listeners: {
                        change: this.onUnitSearch.bind(this)
                    }
                },
                {
                    xtype: 'panel',
                    flex: 1,
                    autoScroll: true,
                    itemId: 'unitCardsContainer',
                    html: this.generateUnitCards(),
                    margin: '0 5 5 5'
                }
            ]
        };
    },

    createMapPanel: function() {
        return {
            region: 'center',
            layout: 'border',
            items: [
                {
                    region: 'center',
                    xtype: 'panel',
                    itemId: 'mapContainer',
                    html: [
                        '<div id="rdm-map" style="width: 100%; height: 100%; background: #f0f0f0; position: relative;">',
                        '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">',
                        '<i class="fa fa-map" style="font-size: 64px; color: #ccc;"></i>',
                        '<p style="margin-top: 10px; color: #666;">Interactive Map will be displayed here</p>',
                        '<p style="color: #999; font-size: 12px;">Integration with mapping service required</p>',
                        '</div>',
                        '</div>'
                    ].join('')
                },
                {
                    region: 'south',
                    height: 200,
                    split: true,
                    title: 'Unit Details',
                    itemId: 'unitDetailsPanel',
                    html: this.generateUnitDetailsPanel()
                }
            ]
        };
    },

    generateUnitCards: function() {
        return [
            '<div class="unit-card" style="border: 1px solid #ddd; margin-bottom: 10px; padding: 15px; border-radius: 5px; cursor: pointer;" onclick="rdmLocation.selectUnit(\'excavator-1\')">',
            '<div style="display: flex; justify-content: space-between; align-items: center;">',
            '<div>',
            '<h4 style="margin: 0 0 5px 0;">Excavator</h4>',
            '<p style="margin: 0; color: #666; font-size: 12px;">PT Trakindo Utama</p>',
            '</div>',
            '<div style="width: 12px; height: 12px; background: #28a745; border-radius: 50%;" title="Active"></div>',
            '</div>',
            '</div>',
            '<div class="unit-card" style="border: 1px solid #ddd; margin-bottom: 10px; padding: 15px; border-radius: 5px; cursor: pointer;" onclick="rdmLocation.selectUnit(\'excavator-v122\')">',
            '<div style="display: flex; justify-content: space-between; align-items: center;">',
            '<div>',
            '<h4 style="margin: 0 0 5px 0;">Excavator v122</h4>',
            '<p style="margin: 0; color: #666; font-size: 12px;">PT Trakindo Utama</p>',
            '</div>',
            '<div style="width: 12px; height: 12px; background: #6c757d; border-radius: 50%;" title="Inactive"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    generateUnitDetailsPanel: function() {
        return [
            '<div style="padding: 15px;">',
            '<h3 style="margin: 0 0 15px 0; color: #333;">Unit Details</h3>',
            '<div id="unit-details-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">',
            '<div><strong>Select a unit</strong> from the list to view details</div>',
            '</div>',
            '</div>'
        ].join('');
    },

    onUnitSearch: function(field, newValue) {
        if (this.getController()) {
            this.getController().onUnitSearch(newValue);
        }
    },

    updateUnitDetails: function(unitData) {
        var detailsPanel = this.down('#unitDetailsPanel');
        if (detailsPanel) {
            var html = [
                '<div style="padding: 15px;">',
                '<h3 style="margin: 0 0 15px 0; color: #333;">' + (unitData.name || 'Unit Details') + '</h3>',
                '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">',
                '<div><strong>Company:</strong> ' + (unitData.company || 'N/A') + '</div>',
                '<div><strong>Battery:</strong> ' + (unitData.battery || '100%') + ' / ' + (unitData.fuel || '100%') + '</div>',
                '<div><strong>Remaining Time:</strong> <span style="color: #dc3545;">' + (unitData.remainingTime || '103 : 43 : 57') + '</span></div>',
                '<div><strong>Expiration:</strong> ' + (unitData.expiration || 'Expired on 13 June 2026') + '</div>',
                '<div><strong>Last Update:</strong> ' + (unitData.lastUpdate || '03 Mar 2025 14:12:10') + '</div>',
                '<div><strong>Speed:</strong> ' + (unitData.speed || '3 km/hrs') + '</div>',
                '<div><strong>Mileage:</strong> ' + (unitData.mileage || '126.12 km') + '</div>',
                '<div><strong>GSM Number:</strong> ' + (unitData.gsmNumber || '002311938490003') + '</div>',
                '</div>',
                '</div>'
            ].join('');
            detailsPanel.update(html);
        }
    },

    loadUnitList: function() {
        // Load units from PILOT API
        if (window.RDMStores && window.RDMStores.units) {
            window.RDMStores.units.load({
                callback: this.onUnitsLoaded.bind(this)
            });
        }
    },

    onUnitsLoaded: function(records) {
        // Update unit cards with real data
        var container = this.down('#unitCardsContainer');
        if (container && records && records.length > 0) {
            var html = '';
            Ext.each(records, function(record) {
                var isActive = record.get('status') === 'online';
                var statusColor = isActive ? '#28a745' : '#6c757d';
                var statusTitle = isActive ? 'Active' : 'Inactive';
                
                html += [
                    '<div class="unit-card" style="border: 1px solid #ddd; margin-bottom: 10px; padding: 15px; border-radius: 5px; cursor: pointer;" onclick="rdmLocation.selectUnit(\'' + record.get('vehid') + '\')">',
                    '<div style="display: flex; justify-content: space-between; align-items: center;">',
                    '<div>',
                    '<h4 style="margin: 0 0 5px 0;">' + (record.get('name') || 'Unknown Unit') + '</h4>',
                    '<p style="margin: 0; color: #666; font-size: 12px;">' + (record.get('model') || 'Unknown Model') + '</p>',
                    '</div>',
                    '<div style="width: 12px; height: 12px; background: ' + statusColor + '; border-radius: 50%;" title="' + statusTitle + '"></div>',
                    '</div>',
                    '</div>'
                ].join('');
            });
            container.update(html);
        }
    }
});

// Global location management functions
if (!window.rdmLocation) {
    window.rdmLocation = {
        selectUnit: function(unitId) {
            console.log('Selected unit:', unitId);
            // Find the location monitoring panel and update details
            var panel = Ext.ComponentQuery.query('Store\\.rdmtoken\\.view\\.LocationMonitoringPanel')[0];
            if (panel) {
                // Mock unit details - in real implementation, fetch from API
                var unitDetails = {
                    name: 'Excavator ' + unitId,
                    company: 'Trakindo Utama',
                    battery: '100%',
                    fuel: '100%',
                    remainingTime: '103 : 43 : 57',
                    expiration: 'Expired on 13 June 2026',
                    lastUpdate: new Date().toLocaleString(),
                    speed: '3 km/hrs',
                    mileage: '126.12 km',
                    gsmNumber: '002311938490003'
                };
                panel.updateUnitDetails(unitDetails);
            }
        }
    };
}