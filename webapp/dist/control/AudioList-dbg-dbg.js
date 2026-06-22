sap.ui.define(['sap/ui/core/Control'],
    function(Control) {
        "use strict";
        var AudioList = Control.extend("com.sz.packoutbdlv.control.AudioList", {
            metadata: {
                properties: {
                    visible: {
                        type: "boolean",
                        group: "Appearance",
                        defaultValue: false
                    }
                },
                defaultAggregation: "items",
                aggregations: {

                    /**
                     * Child Controls within the layout.
                     */
                    items: {
                        type: "sap.ui.core.Control",
                        multiple: true,
                        singularName: "item",
                        bindable: "bindable"
                    }
                },
                designTime: true
            }
        });

        AudioList.prototype.play = function(sMsgType) {
            var aItems = this.getItems();
            for (var i = 0; i < aItems.length; i++) {
                if(aItems[i].getType() === sMsgType) {
                    return aItems[i].play();
                }
            }
        };

        return AudioList;

    });