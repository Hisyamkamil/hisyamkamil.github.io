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
        
        // Create items store
        var itemsStore = Ext.create('Ext.data.Store', {
            fields: [
                'itemCode',
                'itemName', 
                'category',
                'unitOfMeasure',
                'description',
                'status',
                'createdDate',
                'lastModified'
            ],
            data: [
                {
                    itemCode: 'ITM001',
                    itemName: 'Steel Pipe 6 inch',
                    category: 'Piping',
                    unitOfMeasure: 'PCS',
                    description: 'Steel pipe 6 inch diameter, 6 meter length',
                    status: 'Active',
                    createdDate: '2024-01-15',
                    lastModified: '2024-04-10'
                },
                {
                    itemCode: 'ITM002', 
                    itemName: 'Hydraulic Hose',
                    category: 'Hydraulics',
                    unitOfMeasure: 'MTR',
                    description: 'High pressure hydraulic hose 1/2 inch',
                    status: 'Active',
                    createdDate: '2024-01-20',
                    lastModified: '2024-04-12'
                },
                {
                    itemCode: 'ITM003',
                    itemName: 'Mining Drill Bit',
                    category: 'Tools',
                    unitOfMeasure: 'PCS',
                    description: 'Carbide tipped drill bit 10mm diameter',
                    status: 'Active',
                    createdDate: '2024-02-01',
                    lastModified: '2024-04-14'
                },
                {
                    itemCode: 'ITM004',
                    itemName: 'Safety Helmet',
                    category: 'Safety',
                    unitOfMeasure: 'PCS', 
                    description: 'Hard hat safety helmet with chin strap',
                    status: 'Inactive',
                    createdDate: '2024-02-15',
                    lastModified: '2024-03-20'
                },
                {
                    itemCode: 'ITM005',
                    itemName: 'Industrial Grease',
                    category: 'Lubricants',
                    unitOfMeasure: 'KG',
                    description: 'Multi-purpose industrial grease',
                    status: 'Active',
                    createdDate: '2024-03-01',
                    lastModified: '2024-04-08'
                }
            ]
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
                            itemsStore.reload();
                            Ext.Msg.alert('Info', 'Items list refreshed');
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
                        dataIndex: 'itemCode',
                        width: 120,
                        renderer: function(value) {
                            return '<strong>' + value + '</strong>';
                        }
                    },
                    {
                        text: 'Item Name',
                        dataIndex: 'itemName',
                        flex: 2
                    },
                    {
                        text: 'Category',
                        dataIndex: 'category',
                        width: 120
                    },
                    {
                        text: 'Unit',
                        dataIndex: 'unitOfMeasure',
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
                            return '<span style="color: ' + color + '; font-weight: bold;">' + value + '</span>';
                        }
                    },
                    {
                        text: 'Created Date',
                        dataIndex: 'createdDate',
                        width: 120,
                        renderer: Ext.util.Format.dateRenderer('d M Y')
                    },
                    {
                        text: 'Last Modified',
                        dataIndex: 'lastModified', 
                        width: 120,
                        renderer: Ext.util.Format.dateRenderer('d M Y')
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
                    name: 'itemCode',
                    fieldLabel: 'Item Code *',
                    allowBlank: false,
                    readOnly: isEdit,
                    value: isEdit ? record.get('itemCode') : ''
                },
                {
                    xtype: 'textfield',
                    name: 'itemName',
                    fieldLabel: 'Item Name *',
                    allowBlank: false,
                    value: isEdit ? record.get('itemName') : ''
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
                    name: 'unitOfMeasure',
                    fieldLabel: 'Unit of Measure *',
                    allowBlank: false,
                    store: ['PCS', 'MTR', 'KG', 'LTR', 'BOX', 'SET', 'ROLL'],
                    value: isEdit ? record.get('unitOfMeasure') : ''
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
            title: isEdit ? 'Edit Item: ' + record.get('itemCode') : 'Add New Item',
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
                            values.lastModified = new Date().toISOString().split('T')[0];
                            
                            if (isEdit) {
                                record.set(values);
                                Ext.Msg.alert('Success', 'Item "' + values.itemName + '" updated successfully!');
                            } else {
                                values.createdDate = new Date().toISOString().split('T')[0];
                                var store = me.down('grid').getStore();
                                store.add(values);
                                Ext.Msg.alert('Success', 'Item "' + values.itemName + '" created successfully!');
                            }
                            window.close();
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
            Ext.Msg.confirm('Delete Item', 
                'Are you sure you want to delete item "' + record.get('itemName') + '"?',
                function(btn) {
                    if (btn === 'yes') {
                        grid.getStore().remove(record);
                        Ext.Msg.alert('Success', 'Item deleted successfully!');
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
                var itemCode = record.get('itemCode').toLowerCase();
                var itemName = record.get('itemName').toLowerCase();
                var category = record.get('category').toLowerCase();
                var search = searchValue.toLowerCase();
                
                return itemCode.indexOf(search) >= 0 || 
                       itemName.indexOf(search) >= 0 || 
                       category.indexOf(search) >= 0;
            });
        }
    }
});
