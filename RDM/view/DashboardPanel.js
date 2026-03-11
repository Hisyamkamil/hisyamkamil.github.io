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
            this.createMetricCard('Total Requested Tokens', '0', 'fa fa-list-alt', 'totalRequestedTokens'),
            this.createMetricCard('Active Tokens', '0', 'fa fa-key', 'totalActiveTokens'),
            this.createMetricCard('Expired Tokens', '0', 'fa fa-clock', 'totalExpiredTokens'),
            this.createMetricCard('Pending Approvals', '0', 'fa fa-hourglass-half', 'pendingApprovals')
        ];

        this.listeners = {
            activate: this.loadDashboardMetrics.bind(this)
        };

        this.callParent(arguments);
    },

    createMetricCard: function(title, value, iconCls, metricKey) {
        return {
            xtype: 'panel',
            columnWidth: 0.25,
            margin: '0 10 0 0',
            bodyPadding: 20,
            cls: 'metric-card',
            itemId: metricKey, // Use metric key directly for easy lookup
            metricKey: metricKey, // Store the key for reference
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
        console.log('DashboardPanel: Loading dashboard metrics...');
        
        if (this.getController()) {
            this.getController().loadDashboardMetrics();
        } else {
            console.warn('No controller available, using fallback API call');
            // Fallback direct API call using ApiConfig
            var apiConfig = Store.rdmtoken.config.ApiConfig;
            Ext.Ajax.request({
                url: apiConfig.getUrl('tokenDashboard'),
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                success: this.onMetricsLoaded.bind(this),
                failure: function(response) {
                    console.error('Failed to load dashboard metrics:', response);
                }
            });
        }
    },

    onMetricsLoaded: function(response) {
        try {
            var result = Ext.decode(response.responseText);
            console.log('DashboardPanel: Metrics loaded:', result);
            
            if (result.status === 200 && result.body && result.body.overview) {
                this.updateMetricCards(result.body.overview);
            } else {
                console.error('Invalid dashboard response format');
            }
        } catch (e) {
            console.error('Error parsing dashboard metrics:', e);
        }
    },

    updateMetricCards: function(overview) {
        console.log('DashboardPanel: Updating metric cards with data:', overview);
        
        // Update metric cards using the correct field mapping
        var requestedCard = this.down('#totalRequestedTokens');
        var activeCard = this.down('#totalActiveTokens');
        var expiredCard = this.down('#totalExpiredTokens');
        var pendingCard = this.down('#pendingApprovals');

        if (requestedCard) {
            this.updateCardValue(requestedCard, overview.totalRequestedTokens || 0);
            console.log('✓ Updated Total Requested Tokens:', overview.totalRequestedTokens);
        }
        if (activeCard) {
            this.updateCardValue(activeCard, overview.totalActiveTokens || 0);
            console.log('✓ Updated Active Tokens:', overview.totalActiveTokens);
        }
        if (expiredCard) {
            this.updateCardValue(expiredCard, overview.totalExpiredTokens || 0);
            console.log('✓ Updated Expired Tokens:', overview.totalExpiredTokens);
        }
        if (pendingCard) {
            this.updateCardValue(pendingCard, overview.pendingApprovals || 0);
            console.log('✓ Updated Pending Approvals:', overview.pendingApprovals);
        }
        
        console.log('✅ All dashboard metric cards updated successfully');
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
