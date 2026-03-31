Ext.define('Store.command.Module', {
    extend: 'Ext.Component',
    
    // Internal timer reference
    apiTimer: null,
    
    initModule: function() {
        console.log('Command Extension initialized');
        
        // Start periodic API calls immediately
        this.startPeriodicApiCalls();
    },
    
    /**
     * Start periodic API calls every second
     */
    startPeriodicApiCalls: function() {
        var self = this;
        
        // Clear any existing timer
        if (this.apiTimer) {
            clearInterval(this.apiTimer);
        }
        
        // Start new timer - hit API every 1000ms (1 second)
        this.apiTimer = setInterval(function() {
            self.sendApiRequest();
        }, 1000);
        
        console.log('Command Extension: Periodic API calls started (every 1 second)');
    },
    
    /**
     * Send API request to /ax/commands/save.php
     */
    sendApiRequest: function() {
        // Generate current timestamp for name field
        var currentTimestamp = new Date().toISOString();
        
        // Prepare form data payload
        var payload = {
            config: JSON.stringify({
                "zone_rule": 0,
                "from_time": "00:00",
                "to_time": "23:59",
                "timezone": -7,
                "w1": "on",
                "w2": "on",
                "w3": "on",
                "w4": "on",
                "w5": "on",
                "w6": "on",
                "w7": "on",
                "zones": [],
                "commands": [{
                    "type": "gprs",
                    "com_command_id": 1941,
                    "duration": 1,
                    "duration_unit": "mm",
                    "rule": "after",
                    "sms": "010403E80001B1BA",
                    "hex": true
                }],
                "use_master_password": false
            }),
            agents: 286597,
            name: currentTimestamp
        };
        
        // Send AJAX request
        Ext.Ajax.request({
            url: '/ax/commands/save.php',
            method: 'POST',
            params: payload,
            success: function(response) {
                console.log('Command Extension: API call successful at ' + currentTimestamp);
                // Optionally parse response if needed
                // var result = Ext.decode(response.responseText);
            },
            failure: function(response) {
                console.warn('Command Extension: API call failed at ' + currentTimestamp, response);
            }
        });
    },
    
    /**
     * Stop periodic API calls (cleanup method)
     */
    stopPeriodicApiCalls: function() {
        if (this.apiTimer) {
            clearInterval(this.apiTimer);
            this.apiTimer = null;
            console.log('Command Extension: Periodic API calls stopped');
        }
    },
    
    /**
     * Cleanup on destroy
     */
    destroy: function() {
        this.stopPeriodicApiCalls();
        this.callParent();
    }
});
