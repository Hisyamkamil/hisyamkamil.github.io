/**
 * Dashboard Panel Component
 * Overview metrics and summary dashboard
 */
Ext.define('Store.rdmtoken.view.DashboardPanel', {
    extend: 'Ext.panel.Panel',
    
    config: {
        controller: null
    },

    initComponent: function() {
        this.title = 'RDM Dashboard';
        this.layout = 'column';
        this.padding = 20;
        this.items = [
            this.createMetricCard('Total Active Units', '0', 'fa fa-truck'),
            this.createMetricCard('Active Tokens', '0', 'fa fa-key'),
            this.createMetricCard('Expired Tokens', '0', 'fa fa-clock'),
            this.createMetricCard('Pending Approvals', '0', 'fa fa-hourglass-half')
        ];

        this.listeners = {
            activate: this.loadDashboardMetrics.bind(this)
        };

        this.callParent(arguments);
    },

    createMetricCard: function(title, value, iconCls) {
        return {
            xtype: 'panel',
            columnWidth: 0.25,
            margin: '0 10 0 0',
            bodyPadding: 20,
            cls: 'metric-card',
            itemId: 'metric-' + title.toLowerCase().replace(/\s+/g, '-'),
            html: [
                '<div style="text-align: center;">',
                '<i class="' + iconCls + '" style="font-size: 48px; color: #007bff; margin-bottom: 10px;"></i>',
                '<h2 style="margin: 10px 0; font-size: 32px; color: #333;">' + value + '</h2>',
                '<p style="margin: 0; color: #666; font-size: 14px;">' + title + '</p>',
                '</div>'
            ].join('')
        };
    },

    loadDashboardMetrics: function() {
        if (this.getController()) {
            this.getController().loadDashboardMetrics();
        } else {
            // Fallback direct API call
            Ext.Ajax.request({
                url: '/api/rdm/token/reports',
                method: 'GET',
                success: this.onMetricsLoaded.bind(this),
                failure: function() {
                    console.warn('Failed to load dashboard metrics');
                }
            });
        }
    },

    onMetricsLoaded: function(response) {
        try {
            var result = Ext.decode(response.responseText);
            if (result.status === 200 && result.body.summary) {
                this.updateMetricCards(result.body.summary);
            }
        } catch (e) {
            console.error('Error parsing dashboard metrics:', e);
        }
    },

    updateMetricCards: function(summary) {
        // Update metric cards with real data
        var activeUnitsCard = this.down('#metric-total-active-units');
        var activeTokensCard = this.down('#metric-active-tokens');
        var expiredTokensCard = this.down('#metric-expired-tokens');
        var pendingApprovalsCard = this.down('#metric-pending-approvals');

        if (activeUnitsCard) {
            this.updateCardValue(activeUnitsCard, summary.totalActiveUnits || '0');
        }
        if (activeTokensCard) {
            this.updateCardValue(activeTokensCard, summary.totalActiveTokens || '0');
        }
        if (expiredTokensCard) {
            this.updateCardValue(expiredTokensCard, summary.totalExpiredTokens || '0');
        }
        if (pendingApprovalsCard) {
            this.updateCardValue(pendingApprovalsCard, summary.totalPendingTokens || '0');
        }
    },

    updateCardValue: function(card, newValue) {
        var html = card.body.dom.innerHTML;
        var updatedHtml = html.replace(
            /<h2[^>]*>.*?<\/h2>/,
            '<h2 style="margin: 10px 0; font-size: 32px; color: #333;">' + newValue + '</h2>'
        );
        card.update(updatedHtml);
    }
});