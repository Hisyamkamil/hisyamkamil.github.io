Ext.define('Store.dashpanel.view.TellTaleHandler', {
    singleton: true,
    
    /**
     * Tell Tale Status definitions from FMS Standard
     * Based on PGN 0x00FD7D - FMS Tell Tale Status: FMS1
     * Each block contains 15 tell tale statuses with 3-bit encoding each
     */
    tellTaleDefinitions: {
        // Block 0 - Basic vehicle indicators
        0: {
            1: { id: 1, iso: 27, name: 'Cooling air conditioning', icon: 'fa-snowflake' },
            2: { id: 2, iso: 82, name: 'High beam, main beam', icon: 'fa-lightbulb' },
            3: { id: 3, iso: 83, name: 'Low beam, dipped beam', icon: 'fa-lightbulb' },
            4: { id: 4, iso: 84, name: 'Turn signals', icon: 'fa-arrow-left' },
            5: { id: 5, iso: 85, name: 'Hazard warning', icon: 'fa-exclamation-triangle' },
            6: { id: 6, iso: 100, name: 'Provision for the disabled or handicapped persons', icon: 'fa-wheelchair' },
            7: { id: 7, iso: 238, name: 'Parking Brake', mandatory: true, icon: 'fa-hand-paper' },
            8: { id: 8, iso: 239, name: 'Brake failure/brake system malfunction', icon: 'fa-exclamation-circle' },
            9: { id: 9, iso: 242, name: 'Hatch open', icon: 'fa-door-open' },
            10: { id: 10, iso: 245, name: 'Fuel level', mandatory: true, icon: 'fa-gas-pump' },
            11: { id: 11, iso: 246, name: 'Engine coolant temperature', mandatory: true, icon: 'fa-thermometer-half' },
            12: { id: 12, iso: 247, name: 'Battery charging condition', icon: 'fa-battery-half' },
            13: { id: 13, iso: 248, name: 'Engine oil', mandatory: true, icon: 'fa-oil-can' },
            14: { id: 14, iso: 456, name: 'Position lights,side lights', icon: 'fa-lightbulb' },
            15: { id: 15, iso: 633, name: 'Front fog light', icon: 'fa-cloud' }
        },
        // Block 1 - Engine and transmission
        1: {
            1: { id: 16, iso: 634, name: 'Rear fog light', icon: 'fa-cloud' },
            2: { id: 17, iso: 637, name: 'Park Heating', icon: 'fa-fire' },
            3: { id: 18, iso: 640, name: 'Engine / Mil indicator', mandatory: true, icon: 'fa-engine' },
            4: { id: 19, iso: 717, name: 'Service, call for maintenance', icon: 'fa-wrench' },
            5: { id: 20, iso: 1168, name: 'Transmission fluid temperature', icon: 'fa-thermometer-full' },
            6: { id: 21, iso: 1396, name: 'Transmission failure/malfunction', icon: 'fa-cog' },
            7: { id: 22, iso: 1407, name: 'Anti-lock brake system failure', icon: 'fa-ban' },
            8: { id: 23, iso: 1408, name: 'Worn brake linings', icon: 'fa-circle-notch' },
            9: { id: 24, iso: 1422, name: 'Windscreen washer fluid/windshield washer fluid', icon: 'fa-tint' },
            10: { id: 25, iso: 1434, name: 'Tire failure/malfunction', icon: 'fa-circle' },
            11: { id: 26, iso: 1603, name: 'Malfunction/general failure', icon: 'fa-exclamation-triangle' },
            12: { id: 27, iso: 2426, name: 'Engine oil temperature', icon: 'fa-thermometer-half' },
            13: { id: 28, iso: 2427, name: 'Engine oil level', icon: 'fa-oil-can' },
            14: { id: 29, iso: 2429, name: 'Engine coolant level', icon: 'fa-tint' },
            15: { id: 30, iso: 2440, name: 'Steering fluid level', icon: 'fa-tint' }
        },
        // Block 2 - Advanced systems
        2: {
            1: { id: 31, iso: 2441, name: 'Steering failure', icon: 'fa-steering-wheel' },
            2: { id: 32, iso: 2461, name: 'Height Control (Levelling)', icon: 'fa-arrows-alt-v' },
            3: { id: 33, iso: 2574, name: 'Retarder', icon: 'fa-hand-paper' },
            4: { id: 34, iso: 2596, name: 'Engine Emission system failure (Mil indicator)', icon: 'fa-smog' },
            5: { id: 35, iso: 2630, name: 'ESC indication', icon: 'fa-shield-alt' },
            6: { id: 36, iso: null, name: 'Brake lights', icon: 'fa-lightbulb' },
            7: { id: 37, iso: null, name: 'Articulation', icon: 'fa-link' },
            8: { id: 38, iso: null, name: 'Stop Request', icon: 'fa-hand-paper' },
            9: { id: 39, iso: null, name: 'Pram request', icon: 'fa-baby-carriage' },
            10: { id: 40, iso: null, name: 'Bus stop brake', icon: 'fa-hand-paper' },
            11: { id: 41, iso: 2946, name: 'AdBlue level', icon: 'fa-tint' },
            12: { id: 42, iso: null, name: 'Raising', icon: 'fa-arrow-up' },
            13: { id: 43, iso: null, name: 'Lowering', icon: 'fa-arrow-down' },
            14: { id: 44, iso: null, name: 'Kneeling', icon: 'fa-arrows-alt-v' },
            15: { id: 45, iso: null, name: 'Engine compartment temperature', icon: 'fa-thermometer-full' }
        },
        // Block 3 - Safety and assistance
        3: {
            1: { id: 46, iso: null, name: 'Auxiliary air pressure', icon: 'fa-wind' },
            2: { id: 47, iso: 2432, name: 'Air filter clogged', icon: 'fa-filter' },
            3: { id: 48, iso: 2452, name: 'Fuel filter differential pressure', icon: 'fa-filter' },
            4: { id: 49, iso: 249, name: 'Seat belt', icon: 'fa-user-shield' },
            5: { id: 50, iso: null, name: 'EBS', icon: 'fa-microchip' },
            6: { id: 51, iso: 2682, name: 'Lane departure indication', icon: 'fa-road' },
            7: { id: 52, iso: null, name: 'Advanced emergency braking system', icon: 'fa-hand-paper' },
            8: { id: 53, iso: 2581, name: 'ACC', icon: 'fa-tachometer-alt' },
            9: { id: 54, iso: null, name: 'Trailer connected', icon: 'fa-trailer' },
            10: { id: 55, iso: '2444/2445', name: 'ABS Trailer 1,2', icon: 'fa-ban' },
            11: { id: 56, iso: 2108, name: 'Airbag', icon: 'fa-life-ring' },
            12: { id: 57, iso: null, name: 'EBS Trailer 1,2', icon: 'fa-microchip' },
            13: { id: 58, iso: null, name: 'Tachograph indication', icon: 'fa-tachometer-alt' },
            14: { id: 59, iso: 2649, name: 'ESC switched off', icon: 'fa-shield-alt' },
            15: { id: 60, iso: null, name: 'Lane departure warning switched off', icon: 'fa-road' }
        },
        // Block 4 - Electric and hybrid systems
        4: {
            1: { id: 61, iso: 2433, name: 'Engine emission filter (Soot Filter)', icon: 'fa-filter' },
            2: { id: 62, iso: 2633, name: 'Electric motor failures', icon: 'fa-bolt' },
            3: { id: 63, iso: null, name: 'AdBlue tampering', icon: 'fa-exclamation-triangle' },
            4: { id: 64, iso: null, name: 'Multiplex System', icon: 'fa-network-wired' },
            5: { id: 65, iso: 2632, name: 'Battery pack', icon: 'fa-battery-full' },
            6: { id: 66, iso: 6042, name: 'High voltage system caution', icon: 'fa-bolt' },
            7: { id: 67, iso: 3129, name: 'Battery pack temperature', icon: 'fa-thermometer-full' },
            8: { id: 68, iso: 2639, name: 'Limited performance electric motor', icon: 'fa-bolt' },
            9: { id: 69, iso: 2455, name: 'Battery pack cooling', icon: 'fa-snowflake' },
            10: { id: 70, iso: null, name: 'Charging status', icon: 'fa-charging-station' },
            11: { id: 71, iso: null, name: 'Traction battery balancing', icon: 'fa-balance-scale' },
            12: { id: 72, iso: null, name: 'Pantograph status', icon: 'fa-plug' },
            13: { id: 73, iso: null, name: 'Fire detection / alarm', icon: 'fa-fire' },
            14: { id: 74, iso: null, name: 'Recuperation disturbed', icon: 'fa-recycle' },
            15: { id: 75, iso: null, name: 'High Voltage Battery Thermal Event', icon: 'fa-fire' }
        }
    },

    /**
     * Tell tale status values according to FMS standard
     */
    statusValues: {
        0: { code: 'OFF', name: 'Off', color: '#666666', icon: 'fa-circle' },
        1: { code: 'RED', name: 'Red (Critical)', color: '#ff0000', icon: 'fa-exclamation-circle' },
        2: { code: 'YELLOW', name: 'Yellow (Warning)', color: '#ff8c00', icon: 'fa-exclamation-triangle' },
        3: { code: 'INFO', name: 'Info', color: '#0066cc', icon: 'fa-info-circle' },
        7: { code: 'N/A', name: 'Not Available', color: '#999999', icon: 'fa-question-circle' }
    },

    /**
     * Parse Tell Tale Status sensor value and return structured data
     * @param {string} sensorValue - Format: blockId:byte1:byte2:byte3:byte4:byte5:byte6:byte7:byte8
     * @returns {Array} Array of tell tale objects with block, status, and details
     */
    parseTellTaleData: function(sensorValue) {
        var tellTaleList = [];
        
        if (!this.isValidTellTaleString(sensorValue)) {
            console.warn('Invalid Tell Tale sensor value:', sensorValue);
            return tellTaleList;
        }
        
        // Handle single "0" case when no tell tale data is present
        if (sensorValue.trim() === '0') {
            console.log('TellTaleHandler: No tell tale data present');
            return tellTaleList;
        }
        
        var parts = sensorValue.split(':');
        if (parts.length < 9) {
            console.warn('Invalid Tell Tale format, expected 9 parts (blockId + 8 bytes):', sensorValue);
            return tellTaleList;
        }
        
        var blockId = parseInt(parts[0], 10);
        var dataBytes = [];
        
        // Parse 8 data bytes
        for (var i = 1; i <= 8; i++) {
            dataBytes.push(parseInt(parts[i], 16));
        }
        
        console.log('Parsing Tell Tale Block', blockId, 'with data:', dataBytes);
        
        try {
            var parsedData = this.parseTellTaleBlock(blockId, dataBytes);
            if (parsedData && parsedData.length > 0) {
                tellTaleList = parsedData;
            }
        } catch (e) {
            console.error('Error parsing Tell Tale data:', sensorValue, e);
        }
        
        console.log('✅ Parsed', tellTaleList.length, 'tell tale statuses');
        return tellTaleList;
    },

    /**
     * Validate tell tale string format
     * @param {string} sensorValue - The tell tale sensor value
     * @returns {boolean} True if valid
     */
    isValidTellTaleString: function(sensorValue) {
        return sensorValue && 
               typeof sensorValue === 'string' && 
               sensorValue.length > 0;
    },

    /**
     * Parse single tell tale block data
     * @param {number} blockId - Block identifier (0-4)
     * @param {Array} dataBytes - Array of 8 bytes
     * @returns {Array} Array of tell tale status objects
     */
    parseTellTaleBlock: function(blockId, dataBytes) {
        var tellTales = [];
        var blockDefs = this.tellTaleDefinitions[blockId];
        
        if (!blockDefs) {
            console.warn('Unknown tell tale block ID:', blockId);
            return tellTales;
        }
        
        // Parse according to FMS standard bit layout
        // Byte 1: Block ID (4 bits) + Status 1 (3 bits) + Status 2 first bit
        // Byte 2: Status 2 (2 bits) + Status 3 (3 bits) + Status 4 (3 bits)
        // ... and so on for all 15 statuses
        
        var bitStream = this.bytesToBitStream(dataBytes);
        
        // Skip first 4 bits (block ID)
        var bitIndex = 4;
        
        // Parse 15 tell tale statuses (each 3 bits)
        for (var i = 1; i <= 15; i++) {
            if (bitIndex + 3 <= bitStream.length) {
                var statusBits = bitStream.substr(bitIndex, 3);
                var statusValue = parseInt(statusBits, 2);
                
                var tellTaleDef = blockDefs[i];
                if (tellTaleDef) {
                    var statusInfo = this.statusValues[statusValue] || this.statusValues[7]; // Default to N/A
                    
                    tellTales.push({
                        blockId: blockId,
                        statusNumber: i,
                        tellTaleId: tellTaleDef.id,
                        name: tellTaleDef.name,
                        iso: tellTaleDef.iso,
                        mandatory: tellTaleDef.mandatory || false,
                        icon: tellTaleDef.icon || 'fa-circle',
                        status: {
                            value: statusValue,
                            code: statusInfo.code,
                            name: statusInfo.name,
                            color: statusInfo.color,
                            icon: statusInfo.icon
                        },
                        rawBits: statusBits
                    });
                }
                
                bitIndex += 3;
            }
        }
        
        return tellTales;
    },

    /**
     * Convert byte array to bit stream string
     * @param {Array} bytes - Array of byte values
     * @returns {string} Binary string representation
     */
    bytesToBitStream: function(bytes) {
        var bitStream = '';
        Ext.each(bytes, function(byte) {
            bitStream += byte.toString(2).padStart(8, '0');
        });
        return bitStream;
    },

    /**
     * Create tell tale status display HTML
     * @param {Array} tellTaleList - Array of parsed tell tale objects
     * @returns {string} HTML display
     */
    createTellTaleDisplay: function(tellTaleList) {
        if (!tellTaleList || tellTaleList.length === 0) {
            return this.createNoTellTaleMessage();
        }
        
        return this.createActiveTellTaleDisplay(tellTaleList);
    },

    /**
     * Create "No Active Tell Tales" message
     * @returns {string} HTML message
     */
    createNoTellTaleMessage: function() {
        return '<div style="text-align: center; padding: 20px; color: #666;">' +
               '<i class="fa fa-check-circle" style="font-size: 24px; color: #00a65a;"></i>' +
               '<h4 style="margin: 10px 0;">No Active Tell Tale Status</h4>' +
               '<p>All indicators operating normally</p>' +
               '</div>';
    },

    /**
     * Create active tell tale display HTML
     * @param {Array} tellTaleList - Array of tell tale objects
     * @returns {string} HTML display
     */
    createActiveTellTaleDisplay: function(tellTaleList) {
        var activeCount = this.getActiveTellTaleCount(tellTaleList);
        var displayHeader = this.createDisplayHeader(activeCount, tellTaleList.length);
        var displayContent = this.createTellTaleGrid(tellTaleList);
        
        return '<div style="padding: 10px;">' +
               displayHeader +
               displayContent +
               '</div>';
    },

    /**
     * Get count of active tell tales (not OFF or N/A)
     * @param {Array} tellTaleList - Array of tell tale objects
     * @returns {number} Count of active tell tales
     */
    getActiveTellTaleCount: function(tellTaleList) {
        var count = 0;
        Ext.each(tellTaleList, function(tellTale) {
            if (tellTale.status.value !== 0 && tellTale.status.value !== 7) {
                count++;
            }
        });
        return count;
    },

    /**
     * Create display header with tell tale count
     * @param {number} activeCount - Number of active tell tales
     * @param {number} totalCount - Total number of tell tales
     * @returns {string} HTML header
     */
    createDisplayHeader: function(activeCount, totalCount) {
        var headerColor = activeCount === 0 ? '#00a65a' : '#d73027';
        var headerIcon = activeCount === 0 ? 'fa-check-circle' : 'fa-exclamation-triangle';
        
        return '<h4 style="margin: 0 0 15px 0; color: ' + headerColor + ';">' +
               '<i class="fa ' + headerIcon + '"></i> ' +
               'Tell Tale Status (' + activeCount + ' active / ' + totalCount + ' total)' +
               '</h4>';
    },

    /**
     * Create tell tale grid display
     * @param {Array} tellTaleList - Array of tell tale objects
     * @returns {string} HTML grid
     */
    createTellTaleGrid: function(tellTaleList) {
        var gridHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 8px;">';
        
        Ext.each(tellTaleList, function(tellTale) {
            // Only show active tell tales or make inactive ones less prominent
            if (tellTale.status.value !== 0 && tellTale.status.value !== 7) {
                gridHtml += this.createTellTaleCard(tellTale, true);
            } else {
                gridHtml += this.createTellTaleCard(tellTale, false);
            }
        }, this);
        
        gridHtml += '</div>';
        return gridHtml;
    },

    /**
     * Create individual tell tale card
     * @param {Object} tellTale - Tell tale object
     * @param {boolean} isActive - Whether tell tale is active
     * @returns {string} HTML card
     */
    createTellTaleCard: function(tellTale, isActive) {
        var opacity = isActive ? '1.0' : '0.3';
        var borderColor = isActive ? tellTale.status.color : '#ddd';
        var bgColor = isActive ? '#ffffff' : '#f9f9f9';
        
        return '<div style="' +
               'border: 2px solid ' + borderColor + '; ' +
               'border-radius: 6px; ' +
               'padding: 10px; ' +
               'background: ' + bgColor + '; ' +
               'opacity: ' + opacity + '; ' +
               'transition: all 0.3s ease;' +
               '">' +
               '<div style="display: flex; align-items: center; margin-bottom: 5px;">' +
               '<i class="fa ' + tellTale.icon + '" style="color: ' + tellTale.status.color + '; font-size: 16px; margin-right: 8px;"></i>' +
               '<strong style="color: #333; font-size: 12px;">' + tellTale.name + '</strong>' +
               '</div>' +
               '<div style="font-size: 11px; color: #666; margin-bottom: 3px;">Block ' + tellTale.blockId + ', ID: ' + tellTale.tellTaleId + '</div>' +
               '<div style="display: flex; align-items: center;">' +
               '<i class="fa ' + tellTale.status.icon + '" style="color: ' + tellTale.status.color + '; font-size: 14px; margin-right: 5px;"></i>' +
               '<span style="color: ' + tellTale.status.color + '; font-weight: bold; font-size: 11px;">' + tellTale.status.name + '</span>' +
               '</div>' +
               (tellTale.iso ? '<div style="font-size: 10px; color: #999; margin-top: 3px;">ISO: ' + tellTale.iso + '</div>' : '') +
               '</div>';
    },

    /**
     * Create compact tell tale summary
     * @param {Array} tellTaleList - Array of tell tale objects
     * @returns {string} HTML summary
     */
    createCompactSummary: function(tellTaleList) {
        var activeList = [];
        var warningCount = 0;
        var criticalCount = 0;
        var infoCount = 0;
        
        Ext.each(tellTaleList, function(tellTale) {
            if (tellTale.status.value !== 0 && tellTale.status.value !== 7) {
                activeList.push(tellTale);
                
                if (tellTale.status.value === 1) criticalCount++;
                else if (tellTale.status.value === 2) warningCount++;
                else if (tellTale.status.value === 3) infoCount++;
            }
        });
        
        if (activeList.length === 0) {
            return '<div style="text-align: center; padding: 15px; color: #666; background: #f9f9f9; border-radius: 4px;">' +
                   '<i class="fa fa-check-circle" style="color: #00a65a; margin-right: 5px;"></i>' +
                   'All tell tales normal' +
                   '</div>';
        }
        
        var summaryHtml = '<div style="padding: 10px; background: #ffffff; border: 1px solid #ddd; border-radius: 4px;">' +
                         '<div style="font-weight: bold; margin-bottom: 8px; color: #333;">Active Tell Tales Summary</div>' +
                         '<div style="display: flex; gap: 15px; margin-bottom: 10px;">';
        
        if (criticalCount > 0) {
            summaryHtml += '<span style="color: #ff0000;"><i class="fa fa-exclamation-circle"></i> ' + criticalCount + ' Critical</span>';
        }
        if (warningCount > 0) {
            summaryHtml += '<span style="color: #ff8c00;"><i class="fa fa-exclamation-triangle"></i> ' + warningCount + ' Warning</span>';
        }
        if (infoCount > 0) {
            summaryHtml += '<span style="color: #0066cc;"><i class="fa fa-info-circle"></i> ' + infoCount + ' Info</span>';
        }
        
        summaryHtml += '</div><div style="font-size: 11px;">';
        
        var displayCount = 0;
        Ext.each(activeList, function(tellTale) {
            if (displayCount < 5) { // Show max 5 in summary
                summaryHtml += '<div style="margin: 2px 0; color: ' + tellTale.status.color + ';">' +
                              '<i class="fa ' + tellTale.icon + '"></i> ' + tellTale.name +
                              '</div>';
            }
            displayCount++;
        });
        
        if (activeList.length > 5) {
            summaryHtml += '<div style="color: #666; font-style: italic;">... and ' + (activeList.length - 5) + ' more</div>';
        }
        
        summaryHtml += '</div></div>';
        return summaryHtml;
    }
});
