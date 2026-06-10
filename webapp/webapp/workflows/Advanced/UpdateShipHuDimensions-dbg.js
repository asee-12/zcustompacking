sap.ui.define([
	"com/sz/packoutbdlv/workflows/WorkFlow",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/service/ODataService",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/modelHelper/Message",
	"com/sz/packoutbdlv/utils/Const",
], function (WorkFlow, Util, Service, Global, Message, Const) {
	"use strict";
	return function (oSourceController, oShipController) {
		var oWorkFlow = new WorkFlow()
			.then(function (oHuData, mSession) {
				this.setBusy(true);
				mSession.Huid = oHuData.Huid;
				return Service.updateHuDimensions(oHuData);
			}, oShipController, "Call Hu update dimensions")
			.then(function(preResult, mSession) {
				this.getWorkFlowFactory().getShipHUChangeWorkFlow().run(mSession.Huid);
			}, oShipController);

		oWorkFlow
			.errors()
			.always(function () {
				this.playAudio(Const.ERROR);
				this.setBusy(false);
			}, oSourceController);
		return oWorkFlow;

	};
});