sap.ui.define([
	"com/sz/packoutbdlv/workflows/WorkFlow",
	"com/sz/packoutbdlv/utils/Util"
], function(WorkFlow, Util) {
	"use strict";
	return function(oSourceController, oShipController) {
		var oWorkFlow = new WorkFlow()
			.then(function(){
				
			}, oSourceController)
			.then(function(){
				
			}, oShipController);
			
			oWorkFlow
				.errors()
				.subscribe("", function() {
					
				});
		return oWorkFlow;
			
	};
});