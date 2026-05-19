Ext.define('Store.dashpanel.view.DTCHandler', {
    singleton: true,
    
    /**
     * Parse DTC sensor value and return structured DTC data
     * @param {string} sensorValue - Format: 9D000301:01:01;9D000302:02:01
     * @returns {Array} Array of DTC objects with MCU, SPN, FMI, OC
     */
    parseDTCData: function(sensorValue) {
        var dtcList = [];
        
        if (!this.isValidDTCString(sensorValue)) {
            console.warn('Invalid DTC sensor value:', sensorValue);
            return dtcList;
        }
        
        // Handle single "0" case when no DTCs are present
        if (sensorValue.trim() === '0') {
            console.log('DTCHandler: No DTCs present (sensor value is "0")');
            return dtcList; // Return empty array
        }
        
        var dtcEntries = sensorValue.split(';');
        console.log('Parsing', dtcEntries.length, 'DTC entries...');
        
        Ext.each(dtcEntries, function(entry) {
            var dtcData = this.parseSingleDTC(entry.trim());
            if (dtcData) {
                dtcList.push(dtcData);
            }
        }, this);
        
        console.log('✅ Parsed', dtcList.length, 'valid DTCs');
        return dtcList;
    },
    
    /**
     * Validate DTC string format
     * @param {string} sensorValue - The DTC sensor value
     * @returns {boolean} True if valid
     */
    isValidDTCString: function(sensorValue) {
        return sensorValue && 
               typeof sensorValue === 'string' && 
               sensorValue.length > 0;
    },
    
    /**
     * Parse single DTC entry
     * @param {string} dtcEntry - Format: 9D000301:01:01
     * @returns {Object|null} DTC object or null if invalid
     */
    parseSingleDTC: function(dtcEntry) {
        if (!dtcEntry) return null;
        
        // Handle "0" case when no DTCs are present
        if (dtcEntry.trim() === '0') {
            console.log('DTCHandler: No DTCs present (received "0")');
            return null;
        }
        
        var parts = dtcEntry.split(':');
        if (parts.length < 2) {
            console.warn('Invalid DTC format:', dtcEntry);
            return null;
        }
        
        var hexMessage = parts[0];
        var mcuSource = parts[1];
        
        // Handle "0" in hex message part too
        if (hexMessage.trim() === '0') {
            console.log('DTCHandler: No DTCs in hex message (received "0")');
            return null;
        }
        
        if (!this.isValidHexMessage(hexMessage)) {
            console.warn('Invalid DTC hex format:', hexMessage);
            return null;
        }
        
        try {
            var dtcData = this.parseJ1939DTC(hexMessage);
            if (dtcData) {
                dtcData.mcuSource = parseInt(mcuSource, 10) || 0;
                dtcData.rawHex = hexMessage;
                return dtcData;
            }
        } catch (e) {
            console.error('Error parsing DTC:', dtcEntry, e);
        }
        
        return null;
    },
    
    /**
     * Validate hex message format
     * @param {string} hexMessage - 8-character hex string
     * @returns {boolean} True if valid
     */
    isValidHexMessage: function(hexMessage) {
        return hexMessage && 
               hexMessage.length === 8 && 
               /^[0-9A-Fa-f]{8}$/.test(hexMessage);
    },
    
    /**
     * Parse J1939-73 DTC hex message
     * @param {string} hexMessage - 8-character hex string (4 bytes)
     * @returns {Object} Parsed DTC data
     */
    parseJ1939DTC: function(hexMessage) {
        var bytes = this.hexToBytes(hexMessage);
        
        // Extract J1939-73 fields according to specification
        var spn = this.extractSPN(bytes);
        var fmi = this.extractFMI(bytes[2]);
        var oc = this.extractOC(bytes[3]);
        
        return {
            spn: spn,
            fmi: fmi,
            oc: oc,
            bytes: bytes
        };
    },
    
    /**
     * Convert hex string to byte array
     * @param {string} hexMessage - 8-character hex string
     * @returns {Array} Array of 4 bytes
     */
    hexToBytes: function(hexMessage) {
        return [
            parseInt(hexMessage.substr(0, 2), 16),  // Byte 1
            parseInt(hexMessage.substr(2, 2), 16),  // Byte 2
            parseInt(hexMessage.substr(4, 2), 16),  // Byte 3
            parseInt(hexMessage.substr(6, 2), 16)   // Byte 4
        ];
    },
    
    /**
     * Extract SPN (Suspect Parameter Number) from bytes
     * @param {Array} bytes - 4-byte array
     * @returns {number} SPN value
     */
    extractSPN: function(bytes) {
        var spnLow = (bytes[1] << 8) | bytes[0];  // 16-bit from bytes 1-2
        var spnHigh = (bytes[2] >> 5) & 0x07;     // Bits 5,6,7 from byte 3
        return (spnHigh << 16) | spnLow;
    },
    
    /**
     * Extract FMI (Failure Mode Identifier) from byte 3
     * @param {number} byte3 - Third byte
     * @returns {number} FMI value (bits 0-4)
     */
    extractFMI: function(byte3) {
        return byte3 & 0x1F;  // 5 bits: 00011111
    },
    
    /**
     * Extract OC (Occurrence Count) from byte 4
     * @param {number} byte4 - Fourth byte
     * @returns {number} OC value (bits 0-6)
     */
    extractOC: function(byte4) {
        return byte4 & 0x7F;  // 7 bits: 01111111
    },
    
    /**
     * Create DTC table HTML for display
     * @param {Array} dtcList - Array of parsed DTC objects
     * @returns {string} HTML table
     */
    createDTCTable: function(dtcList) {
        if (!dtcList || dtcList.length === 0) {
            return this.createNoDTCMessage();
        }
        
        return this.createActiveDTCTable(dtcList);
    },
    
    /**
     * Create "No Active DTCs" message
     * @returns {string} HTML message
     */
    createNoDTCMessage: function() {
        return '<div style="text-align: center; padding: 20px; color: #666;">' +
               '<i class="fa fa-check-circle" style="font-size: 24px; color: #00a65a;"></i>' +
               '<h4 style="margin: 10px 0;">No Active DTCs</h4>' +
               '<p>All systems operating normally</p>' +
               '</div>';
    },
    
    /**
     * Create active DTC table HTML
     * @param {Array} dtcList - Array of DTC objects
     * @returns {string} HTML table
     */
    createActiveDTCTable: function(dtcList) {
        var tableHeader = this.createTableHeader(dtcList.length);
        var tableRows = this.createTableRows(dtcList);
        
        return '<div style="padding: 10px;">' +
               tableHeader +
               '<table style="width: 100%; border-collapse: collapse; font-size: 11px;">' +
               this.getTableHeaderHTML() +
               '<tbody>' + tableRows + '</tbody>' +
               '</table></div>';
    },

    /**
     * Create DTC table without header (for combined displays)
     * @param {Array} dtcList - Array of DTC objects
     * @returns {string} HTML table without header
     */
    createDTCTableOnly: function(dtcList) {
        if (!dtcList || dtcList.length === 0) {
            return '<div style="text-align: center; padding: 15px; color: #666; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">' +
                   '<i class="fa fa-check-circle" style="font-size: 20px; color: #00a65a;"></i>' +
                   '<div style="margin-top: 8px; font-size: 12px;">No DTCs found</div>' +
                   '</div>';
        }
        
        var tableRows = this.createTableRows(dtcList);
        
        return '<table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #ddd;">' +
               this.getTableHeaderHTML() +
               '<tbody>' + tableRows + '</tbody>' +
               '</table>';
    },

    /**
     * Create responsive DTC table for combined displays
     * @param {Array} dtcList - Array of DTC objects
     * @param {string} emptyMessage - Custom message when no DTCs found
     * @returns {string} Responsive HTML table
     */
    createResponsiveDTCTable: function(dtcList, emptyMessage) {
        if (!dtcList || dtcList.length === 0) {
            return '<div style="' +
                   'text-align: center; ' +
                   'padding: 20px; ' +
                   'color: #666; ' +
                   'border: 1px solid #ddd; ' +
                   'border-radius: 6px; ' +
                   'background: #f9f9f9; ' +
                   'margin: 5px 0;' +
                   '">' +
                   '<i class="fa fa-check-circle" style="font-size: 24px; color: #00a65a; margin-bottom: 8px;"></i>' +
                   '<div style="font-size: 13px; font-weight: 500;">' + emptyMessage + '</div>' +
                   '</div>';
        }
        
        var tableRows = this.createTableRows(dtcList);
        
        return '<div style="overflow-x: auto; margin: 5px 0;">' +
               '<table style="' +
               'width: 100%; ' +
               'border-collapse: collapse; ' +
               'font-size: 10px; ' +
               'border: 1px solid #ddd; ' +
               'background: white; ' +
               'border-radius: 4px; ' +
               'overflow: hidden;' +
               '">' +
               this.getResponsiveTableHeaderHTML() +
               '<tbody>' + tableRows + '</tbody>' +
               '</table>' +
               '</div>';
    },

    /**
     * Get responsive table header HTML with better styling
     * @returns {string} HTML table header
     */
    getResponsiveTableHeaderHTML: function() {
        return '<thead>' +
               '<tr style="background: linear-gradient(to bottom, #f8f9fa, #e9ecef); border-bottom: 2px solid #dee2e6;">' +
               '<th style="padding: 8px 6px; text-align: center; border-right: 1px solid #dee2e6; font-weight: bold; font-size: 9px; color: #495057;">MCU</th>' +
               '<th style="padding: 8px 6px; text-align: center; border-right: 1px solid #dee2e6; font-weight: bold; font-size: 9px; color: #495057;">SPN</th>' +
               '<th style="padding: 8px 6px; text-align: center; border-right: 1px solid #dee2e6; font-weight: bold; font-size: 9px; color: #495057;">FMI</th>' +
               '<th style="padding: 8px 6px; text-align: center; border-right: 1px solid #dee2e6; font-weight: bold; font-size: 9px; color: #495057;">OC</th>' +
               '<th style="padding: 8px 6px; text-align: left; font-weight: bold; font-size: 9px; color: #495057;">Description</th>' +
               '</tr>' +
               '</thead>';
    },
    
    /**
     * Create table header with DTC count
     * @param {number} count - Number of DTCs
     * @returns {string} HTML header
     */
    createTableHeader: function(count) {
        return '<h4 style="margin: 0 0 10px 0; color: #d73027;">' +
               '<i class="fa fa-exclamation-triangle"></i> ' +
               'Active Diagnostic Trouble Codes (' + count + ')' +
               '</h4>';
    },
    
    /**
     * Get table header HTML
     * @returns {string} HTML table header
     */
    getTableHeaderHTML: function() {
        return '<thead>' +
               '<tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">' +
               '<th style="padding: 8px 4px; text-align: center; border: 1px solid #ddd; font-weight: bold;">MCU</th>' +
               '<th style="padding: 8px 4px; text-align: center; border: 1px solid #ddd; font-weight: bold;">SPN</th>' +
               '<th style="padding: 8px 4px; text-align: center; border: 1px solid #ddd; font-weight: bold;">FMI</th>' +
               '<th style="padding: 8px 4px; text-align: center; border: 1px solid #ddd; font-weight: bold;">OC</th>' +
               '<th style="padding: 8px 4px; text-align: left; border: 1px solid #ddd; font-weight: bold;">Description</th>' +
               '</tr>' +
               '</thead>';
    },
    
    /**
     * Create table rows for DTCs
     * @param {Array} dtcList - Array of DTC objects
     * @returns {string} HTML table rows
     */
    createTableRows: function(dtcList) {
        var rows = '';
        
        Ext.each(dtcList, function(dtc, index) {
            var rowStyle = index % 2 === 0 ? 'background: #ffffff;' : 'background: #f9f9f9;';
            var description = this.getDTCDescription(dtc.spn, dtc.fmi);
            
            // Convert SPN and FMI to hexadecimal with proper padding
            // SPN: always 5 digits, FMI: always 2 digits
            var spnHex = dtc.spn.toString(16).toUpperCase().padStart(5, '0');
            var fmiHex = dtc.fmi.toString(16).toUpperCase().padStart(2, '0');
            
            rows += '<tr style="' + rowStyle + '">' +
                    '<td style="padding: 6px 4px; text-align: center; border: 1px solid #ddd;">' + dtc.mcuSource + '</td>' +
                    '<td style="padding: 6px 4px; text-align: center; border: 1px solid #ddd; font-family: monospace;">' + spnHex + '</td>' +
                    '<td style="padding: 6px 4px; text-align: center; border: 1px solid #ddd; font-family: monospace;">' + fmiHex + '</td>' +
                    '<td style="padding: 6px 4px; text-align: center; border: 1px solid #ddd; font-family: monospace;">' + dtc.oc + '</td>' +
                    '<td style="padding: 6px 4px; text-align: left; border: 1px solid #ddd; color: #333;">' + description + '</td>' +
                    '</tr>';
        }, this);
        
        return rows;
    },
    
    /**
     * Get human-readable description for SPN/FMI combination
     * @param {number} spn - Suspect Parameter Number
     * @param {number} fmi - Failure Mode Identifier
     * @returns {string} Description
     */
    getDTCDescription: function(spn, fmi) {
        var spnDesc = this.getSPNDescription(spn);
        var fmiDesc = this.getFMIDescription(fmi);
        return spnDesc + ' - ' + fmiDesc;
    },
    
    /**
     * Get SPN description
     * @param {number} spn - Suspect Parameter Number
     * @returns {string} SPN description
     */
    getSPNDescription: function(spn) {
        var descriptions = {
            0: 'Forced regeneration of particulate filter, procedure requested by the driver',
            18: 'Rail pressure control valve',
            29: 'Accelerator pedal 2',
            32: 'Auxiliary IO #04',
            33: 'SCR, HCU module voltage supply',
            70: 'Fuel temperature sensor',
            72: 'Battery voltage',
            74: 'VI speed limiter error',
            84: 'Vehicle speed sensor',
            86: 'Cruise Control Interface Module vehicle speed',
            88: 'Accelerator pedal',
            91: 'ECU accelerator pedal position check',
            92: 'Engine torque load loss with engine brake',
            95: 'Fuel filter',
            96: 'SCR, AdBlue emptying system not correctly carried out after afterrun',
            97: 'Sensor detecting water in the fuel filter',
            100: 'Oil pressure sensor',
            101: 'Engine crankcase differential pressure sensor',
            102: 'Boost pressure sensor',
            103: 'Turbocompressor revs sensor',
            105: 'Boost air temperature sensor',
            108: 'Ambient pressure',
            109: 'Engine coolant pressure sensor',
            128: 'CAN line: message from dashboard',
            136: 'Accelerator pedal',
            137: 'Crankcase pressure',
            143: 'Transmission output shaft speed',
            144: 'Rail Pressure Sensor',
            152: 'ECU Internal Error',
            153: 'Crankcase pressure',
            157: 'Rail Pressure Sensor',
            158: 'Battery voltage',
            161: 'Input shaft speed',
            168: 'Battery voltage',
            171: 'Oil temperature sensor',
            172: 'Pressure and air boost sensor',
            173: 'Air temperature sensor downstream of the intercooler',
            174: 'Fuel temperature sensor',
            175: 'Oil temperature sensor',
            188: 'Ambient pressure',
            190: 'Engine coolant temperature',
            354: 'Intake air humidity sensor',
            412: 'EGR',
            512: 'Driver requested torque',
            513: 'CAN line: engine torque signal',
            514: 'Engine torque',
            520: 'CAN line: ETC2 message from gearbox ECU – Abnormal update rate',
            521: 'Service brake',
            526: 'Gear ratio calculation',
            547: 'ABS function control',
            558: 'Accelerator pedal idle switch',
            559: 'Kickdown function',
            564: 'Rear axle longitudinal differential lock',
            569: 'Rear differential lock activation and / or Front differential lock activation',
            574: 'CAN line: timeout ETC1 message from gearbox ECU',
            575: 'CAN line: ABS off road signal',
            595: 'Cruise Control',
            597: 'Brake pedal plausibility',
            598: 'Clutch switch',
            600: 'Cruise control set',
            601: 'Cruise control resume',
            602: 'Cruise control set+',
            604: 'N - neutral switch (automatic gearbox)',
            617: 'Parking brake',
            618: 'Parking brake',
            620: 'Injector 3rd cylinder in firing order',
            625: 'VDB CAN Line',
            627: 'ECU power supply',
            628: 'ECU Internal Error',
            636: 'Camshaft sensor',
            637: 'Crankshaft speed',
            641: 'Turbocompressor actuator',
            651: 'Injector of 1st cylinder in firing order',
            652: 'Injector 3rd cylinder in firing order',
            653: 'Injector 5th cylinder in firing order',
            654: 'Injector 2nd cylinder in firing order',
            655: 'Injector 6th cylinder in firing order',
            656: 'Injector 4th cylinder in firing order',
            704: 'Auxiliary IO #04',
            705: 'Auxiliary IO #05',
            728: 'Pre/post air heating resistance',
            729: 'Pre/post air heating resistance',
            730: 'Pre/post air heating resistance',
            767: 'R - reversing gear switch',
            768: 'PTO module',
            776: 'Switch pressure check fan 22 bar',
            835: 'Oil level',
            882: 'License plate light',
            903: 'BOOTLOADER Internal Error',
            904: 'Front axle speed signal',
            905: 'Speed signal for left wheel on front axle',
            906: 'Speed signal for right wheel on front axle',
            908: 'Speed signal for right wheel on rear axle',
            917: 'CAN line: high resolution vehicle distance message (HRVD)',
            970: 'Comp: stop button',
            973: 'Retarder lever',
            974: 'ECU',
            1041: 'Comp: start button',
            1043: 'ECU Power supply 12 V',
            1071: 'Control circuit for cooling fan',
            1072: 'Decompression engine brake valve',
            1074: 'ECU Internal Error',
            1087: 'Brake pedal switch 1',
            1088: 'Brake pedal switch 2',
            1105: 'Horn',
            1106: 'Mirrors heating activation',
            1116: 'ECU, injection control',
            1127: 'Turbocompressor control devices',
            1128: 'Turbocompressor control devices, underboost',
            1136: 'ECU temperature sensor',
            1165: 'MIL warning light',
            1209: 'Pressure sensor of the exhaust manifold',
            1213: 'MIL warning light',
            1231: 'CAN Bus Bus Off',
            1235: 'CAN line error (bus OFF)',
            1240: 'Rail fuel pressure',
            1243: 'EBC1 message from ABS',
            1346: 'Fuel pressure regulator (MeUn)',
            1351: 'Air compressor',
            1392: 'ECU Internal Error',
            1442: 'Rail fuel pressure',
            1485: 'Main relay may be stuck or wiring problems',
            1648: 'ECU Internal Error',
            1746: 'Immobilizer',
            1800: 'CAN line: timeout message BT1 (battery temperature)',
            1816: 'Engine control signal due to roll over prevention',
            1817: 'Engine control signal for yawing',
            1818: 'Brake control signal for anti tilting',
            2094: 'Start Up (+50) request',
            2104: 'Main lights switch',
            2105: 'Working lights switch',
            2108: 'Direction lights switch',
            2124: 'Engine revs control module',
            2135: 'CAN line: TCO1 message from tachograph',
            2136: 'CAN line: TCO1 message from tachograph',
            2145: 'CAN Line: Halt brake Mode',
            2151: 'Cooling fan speed sensor',
            2179: 'Engine brake activated by the driver',
            2180: 'Retarder activation Lever',
            2184: 'CAN Line: Engine start signal',
            2187: 'Start Up (+50) request',
            2245: 'CAN signal from ECAS not valid',
            2263: 'SCR AdBlue tank temperature',
            2372: 'Left stop light',
            2374: 'Right stop light',
            2387: 'Switch for front fog light',
            2389: 'Rear fog lights switch',
            2390: 'Rear fog lamps',
            2432: 'Torque request management',
            2589: 'Second speed limiter switch',
            2636: 'Windscreen washer pump',
            2653: 'Left low beam light',
            2655: 'Right low beam light',
            2659: 'EGR control',
            2795: 'CAN Bus timeout message SRA2EDC from turbocompressor actuator',
            2797: 'Fuel injector control module performance',
            2798: 'Bench 2 injectors control circuit',
            2804: 'FLIS CAN line',
            2978: 'Parasite losses calculation of engine torque',
            3031: 'SCR, AdBlue temperature sensor in the tank',
            3041: 'SCR Inducement warning to the driver, caused by low level AdBlue second alarm',
            3064: 'DPF, differential pressure monitoring',
            3145728: 'Control circuit for cooling fan',
            3208: 'NOx sensor upstream of DPF',
            3216: 'NOx sensor upstream of DPF',
            3220: 'NOx calculation',
            3223: 'NOx sensor upstream of DPF',
            3224: 'NOx sensor upstream of DPF',
            3226: 'CAN line: message from NOx sensor',
            3232: 'NOx sensor downstream of SCR',
            3234: 'NOx sensor downstream of SCR',
            3242: 'Exhaust gas temperature sensor upstream of DPF',
            3245: 'NOx sensor downstream of SCR',
            3251: 'Differential pressure of particulate filter',
            3285: 'Differential pressure of particulate filter',
            3350: 'Alternator 3',
            3353: 'Alternator 1',
            3354: 'Alternator 2',
            3355: 'Alternator 3',
            3361: 'SCR, HCU module voltage supply',
            3362: 'SCR, AdBlue tank heater',
            3363: 'SCR, AdBlue tank heater',
            3364: 'SCR, AdBlue quality sensor',
            3506: 'Power stage of different actuators',
            3507: 'Power stage of different actuators',
            3508: 'Power stage of different actuators',
            3509: 'ECU power supply stage 1 sensors (5V)',
            3510: 'ECU power supply stage 2 sensors (5V)',
            3511: 'ECU power supply stage 3, sensors (5V)',
            3512: 'ECU power supply stage 4, sensors (5V)',
            3513: 'ECU power supply stage 5, sensors (5V)',
            3514: 'ECU power supply stage 6, sensors (5V)',
            3516: 'AdBlue concentration',
            3525: 'DPF regenerations not completed',
            3555: 'Ambient pressure',
            3607: 'ECU Internal Error',
            3645: 'CAN line: Transfer Case status or engaged gear',
            3727: 'Forced regeneration of particulate filter',
            4002: 'Engine start signal from Body Builders',
            4003: 'Engine switch OFF signal from Body Builders connector',
            4076: 'Coolant temperature sensor',
            4113: 'MIL warning light',
            4201: 'Crankshaft speed',
            4225: 'Catalyst efficiency',
            4331: 'SCR',
            4334: 'SCR AdBlue pressure',
            4337: 'SCR, AdBlue dosing, backflow detected in the injection system',
            4354: 'SCR',
            4360: 'Exhaust gas temperature sensor downstream of SCR',
            4365: 'SCR - AdBlue quality sensor',
            4374: 'SCR, pump module',
            4376: 'SCR, hydraulic circuit',
            4425: 'SCR, NOx value high',
            4724: 'Incorrect valve module',
            4752: 'Exhaust gas temperature sensor upstream of catalyst (DOC)',
            4765: 'SCR temperature monitoring',
            4766: 'Exhaust gas temperature sensor upstream of DPF',
            5015: 'Power switch',
            5018: 'Oxidation catalyst',
            5023: 'ACC parameter',
            5096: 'On board diagnostic warning',
            5246: 'SCR inducement level 3 (Creep mode) vehicle speed reduction, tampering',
            5267: 'DPF clogged',
            5285: 'Intercooler – efficiency',
            5310: 'Exhaust system, unburned hydrocarbons',
            5313: 'ECU - injection control',
            5318: 'Exhaust, correlation gas temperature sensors',
            5357: 'ECU Internal Error',
            5358: 'Fuel Balancing Control fuel correction for Injector of cylinder 1 in firing order',
            5359: 'Fuel Balancing Control: fuel correction for Injector of cylinder 3 in firing order',
            5360: 'Fuel Balancing Control: fuel correction for Injector of cylinder 5 in firing order',
            5361: 'Fuel Balancing Control: fuel correction for Injector of cylinder 2 in firing order',
            5362: 'Fuel Balancing Control: fuel correction for Injector of cylinder 6 in firing order',
            5363: 'Fuel Balancing Control: fuel correction for Injector of cylinder 4 in firing order',
            5376: 'AdBlue deposits at high temperature exceeded limit',
            5380: 'Fuel pressure regulator (IleUn)',
            5392: 'SCR reagent feeding: AdBlue pressure',
            5394: 'AdBlue Dosing Valve Temperature downstream of DOC catalyst',
            5432: 'SCR',
            5435: 'SCR, pump module',
            5441: 'ECU',
            5447: 'Fuel pressure regulator (beUn)',
            5450: 'SCR',
            5466: 'DPF, particulate accumulation check',
            5571: 'Security valve for rail fuel pressure (PRV)',
            5572: 'ECU Internal Error',
            5706: 'SCR, reagent heating',
            5835: 'Particulate sensor',
            5839: 'SCR inducement level 3 (Creep mode) vehicle speed reduction, caused by AdBlue consumption',
            5840: 'SCR inducement level 1 torque reduction',
            5841: 'SCR inducement level (Creep mode) vehicle speed reduction',
            5862: 'SCR reagent heating',
            6208: 'SW module for torque and braking requests',
            6302: 'Engine crankcase differential pressure sensor',
            6339: 'SCR, pump module',
            6772: 'Particulate sensor',
            6875: 'SCR, AdBlue pressure sensor',
            7106: 'SCR pump module',
            7107: 'SCR, pump module',
            7317: 'Predictive cruise control status',
            7729: 'Left window raising/lowering switch',
            7730: 'Right window raising/lowering switch',
            18211: 'PTO 3 engagement timeout',
            49294: 'Coolant temperature sensor',
            49342: 'Torque limitation due to: engine high temperature',
            56045: 'Bench 1 injectors control circuit',
            65615: 'Exhaust system',
            468516: 'Rear brake air pressure',
            468581: 'Engine revs state for Body Builders',
            487945: 'Incorrect position of rain/twilight sensor',
            488002: 'Night zone passenger window switches',
            493093: 'Front brake air pressure',
            516353: 'Main fuel level sensor/LNG1 level sensor',
            516366: 'Fuel pump',
            516396: 'SW module for torque and braking requests – Special instructions',
            516397: 'CAN line: auxiliary IO #21 message from Body Computer ECU',
            516469: 'ECU Internal Error',
            516478: 'ECU',
            516746: 'CAN line: engine switch OFF message due to protection',
            516886: 'ECU Internal Error',
            516981: 'ECU voltage supply ( B5 )',
            516982: 'ECU in plant mode',
            516983: 'CAN line : CH 1 bus OFF',
            516986: 'CAN line : CH 2 bus OFF',
            516992: 'CAN line : CH 3 bus OFF',
            516994: 'CAN line : CH 4 bus OFF',
            516996: 'CAN line : CH 5 bus OFF',
            517011: 'CAN line : CH 6 bus OFF',
            517013: 'CAN line : CH 7 bus OFF',
            517015: 'CAN line : CH 8 bus OFF',
            517030: 'CAN line TSC1ADE message',
            517120: 'Aux port',
            518144: 'ECU Internal Error',
            518145: 'ECU temperature sensor',
            518146: 'ECU temperature sensor',
            518147: 'ECU Internal Error',
            518148: 'ECU Internal Error',
            518149: 'ECU Internal Error',
            518150: 'ECU',
            518151: 'ECU',
            518159: 'Injectors control circuit',
            518161: 'ECU Internal Error',
            518162: 'ECU Internal Error',
            518164: 'Torque control',
            518165: 'Torque control',
            518200: 'Internal control module monitoring processor performance',
            518201: 'ECU system irregular switch off detected',
            518204: 'ECU Internal Error',
            518217: 'Engine crank control',
            518219: 'ECU, injection control',
            518220: 'ECU, injection control',
            518400: 'Power stage of different actuators',
            518401: 'Power stage of different actuators',
            518402: 'Power stage of different actuators',
            518403: 'Power stage of different actuators',
            518404: 'Power stage of different actuators',
            518405: 'Power stage of different actuators',
            518406: 'Power stage of different actuators',
            518407: 'Power stage of different actuators',
            518408: 'Power relay of smart sensors',
            518447: 'CAN line: timeout message PTODE from VCI',
            518494: 'CAN line: message TSC1PE from PTO controller',
            518666: 'CAN line: TSC1VR message from BGH',
            518667: 'CAN line: TSC1VR message from BCH',
            518668: 'CAN Line: Timeout message VDHR',
            518867: 'NOx sensor downstream of SCR',
            518868: 'CAN line EBC1 message from braking system – Abnormal update rate',
            518944: 'CAN line: Timeout message PBES (smart alternator module)',
            518945: 'Particulate sensor',
            518946: 'Particulate sensor',
            518947: 'Particulate sensor, tampering',
            519044: 'AdBlue deposits in exhaust system',
            519045: 'NOx sensor downstream of SCR',
            519056: 'Dosing valve blocked',
            519098: 'CAN line',
            519244: 'CAN line: timeout message VEP1_F3 (vehicle electrical power 5 for smart alternator) from IBS module',
            519342: 'CAN line; timeout message VEP1_F3 (vehicle electrical power 3 for smart alternator) from IBS module',
            519546: 'Exhaust gas temperature sensor downstream of SCR',
            519550: 'Exhaust gas temperature sensor downstream of SCR',
            519551: 'Two or more temperature sensors show errors',
            519646: 'SCR inducement, level 3 (Creep mode) torque reduction',
            519648: 'SCR Inducement, Level 3 (Torque reduction)',
            519649: 'SCR inducement warning to the driver',
            519694: 'Differential pressure of particulate filter',
            519695: 'Differential pressure of particulate filter',
            519697: 'DPF',
            519744: 'Rail fuel pressure',
            519745: 'Rail fuel pressure',
            519844: 'Torque limitation due to turbocompressor protection',
            519845: 'Torque limitation due to engine protection',
            519853: 'Fuel pressure regulator (MeUn)',
            519860: 'Torque limitation due to SCR / AdBlue',
            519864: 'Torque limitation due to: performance limitation',
            519865: 'Torque limitation due to OBD law',
            519867: 'Torque limitation due to coolant temperature',
            519868: 'Torque limitation due to exhaust gas temperature',
            519869: 'Torque limitation due to fuel temperature',
            519871: 'Torque limitation due to inlet air temperature',
            519872: 'Torque limitation due to oil temperature',
            519873: 'Torque limitation due to turbocompressor',
            519874: 'Torque limitation due to: SCR / AdBlue',
            520192: 'Programming not complete',
            520344: 'ECU internal error',
            520345: 'ECU internal error',
            520346: 'ECU internal error',
            520347: 'ECU internal error',
            520348: 'ECU internal error',
            520349: 'ECU internal error',
            520350: 'ECU internal error',
            520351: 'ECU internal error',
            520353: 'ECU internal error',
            520354: 'ECU internal error',
            520355: 'ECU internal error, security module',
            520356: 'ECU internal error',
            520357: 'ECU internal error',
            520358: 'ECU internal error',
            520359: 'ECU internal error',
            520360: 'ECU internal error',
            520362: 'ECU internal error',
            520363: 'ECU internal error',
            520364: 'ECU internal error',
            520365: 'ECU internal error',
            520366: 'ECU internal error',
            520367: 'ECU internal error',
            520368: 'ECU internal error',
            520369: 'ECU internal error',
            520370: 'ECU internal error',
            520371: 'ECU internal error',
            520372: 'ECU internal error',
            520373: 'ECU internal error',
            520374: 'ECU internal error',
            520375: 'CAN line: TSC1ADE message',
            520382: 'ECU internal error, security module',
            520494: 'Cancel faults memory',
            520495: 'Oxygen concentration from NOx sensor downstream catalyst',
            520496: 'NOx Sensor upstream the catalyst',
            520497: 'Oxygen concentration from NOx sensor upstream catalyst',
            520500: 'SCR, tampering attempt',
            520501: 'SCR, tampering attempt in the reagent injection system',
            520503: 'SCR, pressure drop management tampering attempt',
            520544: 'AdBlue deposit cleaning mode 2, regeneration interrupted too many times',
            520594: 'LIN 1 Bus',
            520694: 'Decompression engine brake valve',
            520695: 'Decompression engine brake valve',
            520696: 'Decompression engine brake valve',
            793210: 'Particulate sensor'
        };
        
        return descriptions[spn] || 'Unknown Parameter (SPN: ' + spn + ')';
    },
    
    /**
     * Get FMI description
     * @param {number} fmi - Failure Mode Identifier
     * @returns {string} FMI description
     */
    getFMIDescription: function(fmi) {
        var descriptions = {
            0: 'Data valid but above normal operational range',
            1: 'Data valid but below normal operational range', 
            2: 'Data erratic, intermittent or incorrect',
            3: 'Voltage above normal, or shorted to high source',
            4: 'Voltage below normal, or shorted to low source',
            5: 'Current below normal or open circuit',
            6: 'Current above normal or grounded circuit',
            7: 'Mechanical system not responding or out of adjustment',
            8: 'Abnormal frequency or pulse width or period',
            9: 'Abnormal update rate',
            10: 'Abnormal rate of change',
            11: 'Root cause not known',
            12: 'Bad intelligent device or component',
            13: 'Out of calibration',
            14: 'Special instructions',
            15: 'Data valid but above normal range - least severe level',
            16: 'Data valid but above normal range - moderately severe level',
            17: 'Data valid but below normal range - least severe level',
            18: 'Data valid but below normal range - moderately severe level',
            19: 'Received network data in error',
            31: 'Condition exists'
        };
        
        return descriptions[fmi] || 'Unknown failure mode';
    }
});
