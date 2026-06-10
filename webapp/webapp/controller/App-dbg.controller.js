sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"com/sz/packoutbdlv/modelHelper/Items",
	"sap/ui/model/json/JSONModel",
	"com/sz/packoutbdlv/control/Audio"
], function(Controller,TableItemsHelper, JSONModel, Audio) {
	"use strict";
	return Controller.extend("com.sz.packoutbdlv.controller.App", {
		onInit: function() {
			this.getView().setModel(this.getOwnerComponent().getModel());
		},
		bindAudioList: function(aFilter) { 
			this.byId("audio-player").bindItems({
                path: "/AudioURISet",
                template: new Audio({
                	src: "{AudioUri}",
                	type: "{Msgty}"
                }),
                filters: aFilter
            });
		}
	});
});