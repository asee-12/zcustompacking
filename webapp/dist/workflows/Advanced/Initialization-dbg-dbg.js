sap.ui.define([
	"com/sz/packoutbdlv/workflows/WorkFlow",
	"com/sz/packoutbdlv/model/Material"
], function(WorkFlow, Material) {
	"use strict";
	return function(oSourceController, oShipController) {
		var oWorkFlow = new WorkFlow()
			.then(function() {
				//todo::
			}, oSourceController, "init work");
		return oWorkFlow;
	};
});