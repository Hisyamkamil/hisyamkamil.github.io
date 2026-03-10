/**
 * Report Panel Component
 * Placeholder for reporting functionality
 */
Ext.define('Store.rdmtoken.view.ReportPanel', {
    extend: 'Ext.panel.Panel',
    layout: 'fit',
    
    initComponent: function() {
        this.items = [{
            xtype: 'panel',
            html: '<div style="padding: 20px; text-align: center;"><h2>Report Management</h2><p>Reporting functionality will be implemented here</p></div>',
            bodyStyle: 'background: #f8f9fa;'
        }];

        this.callParent(arguments);
    }
});
