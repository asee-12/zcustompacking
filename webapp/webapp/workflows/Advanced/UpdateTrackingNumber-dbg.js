sap.ui.define([
	"com/sz/packoutbdlv/workflows/WorkFlow",
	"com/sz/packoutbdlv/service/ODataService",
	"com/sz/packoutbdlv/utils/Const",
	"com/sz/packoutbdlv/modelHelper/Message",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/modelHelper/OData"
], function(WorkFlow, Service, Const, Message, Global, ODataHelper) {
	"use strict";
	return function(oSourceController, oShipController) {
		var oWorkFlow = new WorkFlow()
		.then(function(aHandlingUnits, mSession) {
			this.oTrkNumberDialog.setBusy(true);
			var aHusNew = aHandlingUnits.filter(oHu => oHu.preAssigned === false);
			// ODataHelper.setUseBatch(true);
			return Service.updateTrackingNumbers(aHusNew);
		}, oShipController, "init package matrial buttons")
		.then(function(result, mSession) {
			var aErrors = result.filter(o => o.error !== null).map(o => o.error);
			var aSuccess = result.filter(o => o.data !== null).map(o => o.data);
			this.oTrkNumberDialog.setBusy(false);
			aSuccess.forEach(function(data) {
				var sShipHU = data.HuId;
				if (data.MsgVar.trim() !== "") {
					Message.addSuccess(data.MsgVar);
				}
				this.getWorkFlowFactory().getShipHUSelectionWorkFlow().run(sShipHU);
			}, this);
			if (aErrors.length > 0) {				
				this.showUpdateTrackingBackendErrors(aErrors);
			}
			if (aSuccess.length > 0) {
				this.oTrkNumberDialog.resolve(aSuccess);				
			}
			this.oTrkNumberDialog.close();
			// ODataHelper.setUseBatch(false);
		}, oShipController, "init package matrial buttons");

		oWorkFlow
			.errors()
			.always(function(oError) {
				// ODataHelper.setUseBatch(false);
				this.oTrkNumberDialog.setBusy(false);
				this.playAudio(Const.ERROR);
			}, oShipController, "Error/Reject");
		return oWorkFlow;
	};
});