/**
 * Master Data Panel Component
 * Items Management with CRUD operations
 */
Ext.define('Store.warehouse.view.MasterDataPanel', {
    extend: 'Ext.panel.Panel',
    
    title: 'Master Data - Items Management',
    layout: 'border',
    border: false,
    
    initComponent: function() {
        var me = this;
        
        // Create items store - INTEGRATED WITH BACKEND API
        var itemsStore = Ext.create('Ext.data.Store', {
            fields: [
                'item_id',
                'item_code',
                'item_name', 
                'category',
                'unit_of_measure',
                'description',
                'status',
                'created_at',
                'updated_at'
            ],
            data: [] // Will be loaded from API
        });
        
        // Load data after component is fully rendered
        me.on('afterrender', function() {
            setTimeout(function() {
                me.loadItems();
            }, 50);
        });

        this.items = [
            // Toolbar
            {
                region: 'north',
                xtype: 'toolbar',
                height: 50,
                items: [
                    {
                        text: 'Add New Item',
                        iconCls: 'fa fa-plus',
                        scale: 'medium',
                        handler: function() {
                            me.showItemForm();
                        }
                    },
                    '-',
                    {
                        text: 'Edit Item',
                        iconCls: 'fa fa-edit',
                        scale: 'medium',
                        disabled: true,
                        itemId: 'editBtn',
                        handler: function() {
                            var grid = me.down('grid');
                            var selection = grid.getSelection();
                            if (selection.length > 0) {
                                me.showItemForm(selection[0]);
                            }
                        }
                    },
                    '-',
                    {
                        text: 'Delete Item',
                        iconCls: 'fa fa-trash',
                        scale: 'medium',
                        disabled: true,
                        itemId: 'deleteBtn',
                        handler: function() {
                            me.deleteItem();
                        }
                    },
                    '->',
                    {
                        xtype: 'textfield',
                        emptyText: 'Search items...',
                        width: 200,
                        listeners: {
                            change: function(field, newValue) {
                                me.filterItems(newValue);
                            }
                        }
                    },
                    {
                        text: 'Refresh',
                        iconCls: 'fa fa-refresh',
                        handler: function() {
                            me.loadItems();
                            Ext.Msg.alert('Info', 'Loading items from backend...');
                        }
                    }
                ]
            },
            
            // Items Grid
            {
                region: 'center',
                xtype: 'grid',
                store: itemsStore,
                columns: [
                    {
                        text: 'Item Code',
                        dataIndex: 'item_code',
                        width: 120,
                        renderer: function(value) {
                            return '<strong>' + (value || 'N/A') + '</strong>';
                        }
                    },
                    {
                        text: 'Item Name',
                        dataIndex: 'item_name',
                        flex: 2
                    },
                    {
                        text: 'Category',
                        dataIndex: 'category',
                        width: 120
                    },
                    {
                        text: 'Unit',
                        dataIndex: 'unit_of_measure',
                        width: 80,
                        align: 'center'
                    },
                    {
                        text: 'Description',
                        dataIndex: 'description',
                        flex: 3
                    },
                    {
                        text: 'Status',
                        dataIndex: 'status',
                        width: 100,
                        renderer: function(value) {
                            var color = value === 'Active' ? 'green' : 'red';
                            return '<span style="color: ' + color + '; font-weight: bold;">' + (value || 'N/A') + '</span>';
                        }
                    },
                    {
                        text: 'Created Date',
                        dataIndex: 'created_at',
                        width: 120,
                        renderer: function(value) {
                            return value ? Ext.util.Format.date(new Date(value), 'd M Y') : 'N/A';
                        }
                    },
                    {
                        text: 'Last Modified',
                        dataIndex: 'updated_at', 
                        width: 120,
                        renderer: function(value) {
                            return value ? Ext.util.Format.date(new Date(value), 'd M Y') : 'N/A';
                        }
                    }
                ],
                listeners: {
                    selectionchange: function(model, selected) {
                        var editBtn = me.down('#editBtn');
                        var deleteBtn = me.down('#deleteBtn');
                        
                        if (selected.length > 0) {
                            editBtn.setDisabled(false);
                            deleteBtn.setDisabled(false);
                        } else {
                            editBtn.setDisabled(true);
                            deleteBtn.setDisabled(true);
                        }
                    },
                    itemdblclick: function(view, record) {
                        me.showItemForm(record);
                    }
                }
            }
        ];

        this.callParent(arguments);
    },

    showItemForm: function(record) {
        var me = this;
        var isEdit = !!record;
        
        var form = Ext.create('Ext.form.Panel', {
            bodyPadding: 15,
            defaults: {
                anchor: '100%',
                labelWidth: 120
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'item_code',
                    fieldLabel: 'Item Code *',
                    allowBlank: false,
                    readOnly: isEdit,
                    value: isEdit ? record.get('item_code') : ''
                },
                {
                    xtype: 'textfield',
                    name: 'item_name',
                    fieldLabel: 'Item Name *',
                    allowBlank: false,
                    value: isEdit ? record.get('item_name') : ''
                },
                {
                    xtype: 'combobox',
                    name: 'category',
                    fieldLabel: 'Category *',
                    allowBlank: false,
                    store: ['Piping', 'Hydraulics', 'Tools', 'Safety', 'Lubricants', 'Electrical', 'Mechanical'],
                    value: isEdit ? record.get('category') : ''
                },
                {
                    xtype: 'combobox',
                    name: 'unit_of_measure',
                    fieldLabel: 'Unit of Measure *',
                    allowBlank: false,
                    store: ['PCS', 'MTR', 'KG', 'LTR', 'BOX', 'SET', 'ROLL'],
                    value: isEdit ? record.get('unit_of_measure') : ''
                },
                {
                    xtype: 'textarea',
                    name: 'description',
                    fieldLabel: 'Description',
                    height: 80,
                    value: isEdit ? record.get('description') : ''
                },
                {
                    xtype: 'combobox',
                    name: 'status',
                    fieldLabel: 'Status *',
                    allowBlank: false,
                    store: ['Active', 'Inactive'],
                    value: isEdit ? record.get('status') : 'Active'
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: isEdit ? 'Edit Item: ' + record.get('item_code') : 'Add New Item',
            modal: true,
            width: 500,
            height: 400,
            layout: 'fit',
            items: [form],
            buttons: [
                {
                    text: 'Cancel',
                    handler: function() {
                        window.close();
                    }
                },
                {
                    text: isEdit ? 'Update Item' : 'Create Item',
                    formBind: true,
                    handler: function() {
                        if (form.isValid()) {
                            var values = form.getValues();
                            
                            // Access the global warehouse controller for backend integration
                            var controller = window.warehouseController;
                            
                            if (controller) {
                                if (isEdit) {
                                    // Update existing item via backend API
                                    var itemId = record.get('item_id');
                                    controller.updateItem(itemId, values);
                                } else {
                                    // Create new item via backend API
                                    controller.createItem(values);
                                }
                                window.close();
                            } else {
                                console.error('❌ WarehouseController not available for Master Data CRUD');
                                Ext.Msg.alert('Error', 'Backend integration not available for Master Data operations.');
                            }
                        }
                    }
                }
            ]
        });
        
        window.show();
    },

    deleteItem: function() {
        var me = this;
        var grid = me.down('grid');
        var selection = grid.getSelection();
        
        if (selection.length > 0) {
            var record = selection[0];
            var itemName = record.get('item_name');
            var itemCode = record.get('item_code');
            var itemId = record.get('item_id');
            
            Ext.Msg.confirm('Delete Item',
                'Are you sure you want to delete item "' + itemName + '"?\n\n' +
                'Note: This will deactivate the item (soft delete) but preserve data for historical records.',
                function(btn) {
                    if (btn === 'yes') {
                        // Access the global warehouse controller for backend integration
                        var controller = window.warehouseController;
                        
                        if (controller && controller.deleteItem) {
                            // Delete item via backend API
                            controller.deleteItem(itemId, itemCode, itemName);
                        } else {
                            console.error('❌ WarehouseController not available for Master Data delete');
                            Ext.Msg.alert('Error', 'Backend integration not available for Master Data deletion.');
                        }
                    }
                }
            );
        }
    },

    filterItems: function(searchValue) {
        var grid = this.down('grid');
        var store = grid.getStore();
        
        store.clearFilter();
        
        if (searchValue) {
            store.filterBy(function(record) {
                var itemCode = (record.get('item_code') || '').toLowerCase();
                var itemName = (record.get('item_name') || '').toLowerCase();
                var category = (record.get('category') || '').toLowerCase();
                var search = searchValue.toLowerCase();
                
                return itemCode.indexOf(search) >= 0 || 
                       itemName.indexOf(search) >= 0 || 
                       category.indexOf(search) >= 0;
            });
        }
    },

    // Load items from backend API
    loadItems: function() {
        var me = this;
        
        // Access the global warehouse controller
        var controller = window.warehouseController;
        
        if (controller && controller.loadItems) {
            console.log('✅ Loading items via global warehouse controller');
            controller.loadItems();
        } else {
            console.error('❌ WarehouseController not available globally for Master Data');
            console.error('Debug info - window.warehouseController:', !!window.warehouseController);
            console.error('Debug info - loadItems method:', !!(window.warehouseController && window.warehouseController.loadItems));
            
            // Clear grid and show error message
            var grid = me.down('grid');
            if (grid && grid.getStore) {
                var store = grid.getStore();
                store.removeAll();
                console.log('⚠️ Master Data grid cleared due to missing controller');
            }
            
            // Show user-friendly error
            Ext.Msg.alert('API Error', 'Unable to connect to warehouse backend for Master Data. Please refresh the page or contact IT support.');
        }
    }
});
