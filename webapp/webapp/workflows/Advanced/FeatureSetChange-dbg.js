sap.ui.define([
	"com/sz/packoutbdlv/workflows/WorkFlow",
	// "com/sz/packoutbdlv/utils/Util",
	// "com/sz/packoutbdlv/service/ODataService",
	// "com/sz/packoutbdlv/modelHelper/Global",
	// "com/sz/packoutbdlv/modelHelper/OData",
	// "com/sz/packoutbdlv/utils/Const",
	// "com/sz/packoutbdlv/modelHelper/Cache"
], function (WorkFlow 
	//, Util, Service, Global, ODataHelper, Const, Cache
	) {
	"use strict";
	return function (oSourceController, oFeatureController) {
		var oWorkFlow = new WorkFlow()
			.then(function (sInput, mSession) {
				debugger;
				// mSession.sHuId = sInput;
				// this.updateInputWithDefault(Const.ID.SHIP_INPUT, "");
			}, oFeatureController);

		// oWorkFlow
		// 	.errors()
		// 	.subscribe(Const.ERRORS.SCAN_SOURCEHU_IN_SHIP_INPUT, function (sError) {
		// 		sError = this.getTextAccordingToMode("scanSourceInHUInput", "scanSourceInShippingInput");
		// 		this.updateInputWithError(Const.ID.SHIP_INPUT, sError);
		// 		this.focus(Const.ID.SHIP_INPUT);
		// 	}, oShipController);
		return oWorkFlow;

	};
});