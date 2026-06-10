sap.ui.define([
	"com/sz/packoutbdlv/workflows/WorkFlow",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/modelHelper/Cache",
	"com/sz/packoutbdlv/utils/Const"
], function(WorkFlow, Global, Util, Cache, Const) {
	"use strict";
	return function(oSourceController, oShipController) {
		var oWorkFlow = new WorkFlow()
			.then(function(sHuid, oParam) {
				return this.updateTabContent(sHuid);
			}, oShipController)
			.then(function(preResult, oParam) {
				this.updateShipItemStatus();
			}, oShipController)
			.then(function(preResult, oParam) {
				this.updateSourceItemStatus();
				if (Util.isEmpty(Global.getSourceId())) {
					this.focus(Const.ID.SOURCE_INPUT);
				} else {
					this.focus(Const.ID.PRODUCT_INPUT);
				}
			}, oSourceController)
			.then(function(preResult, oParam) {
				oParam.sODO = "";
				oParam.sPackInstr = "";
				if (this.oItemHelper.getHighLightedItemIndex() === 0) {
					oParam.sODO = this.oItemHelper.getItemDocNoByIndex(0);
					oParam.sPackInstr = this.oItemHelper.getItemPackInstrByIndex(0);
				}
			}, oSourceController)
			.then(function(preResult, oParam) {
				this.updatePackingInstr(oParam.sODO, oParam.sPackInstr);
			}, oShipController, "update packing info")
			.then(function (preResult, oParam) {
				this.updateCacheIsEmptyHU();
			}, oShipController, "update cache")
			.then(function(preResult, mSession) {
				this.delayCalledAdjustContainerHeight();
			}, oShipController);

		oWorkFlow
			.errors()
			.subscribe("", function() {})
			.always(function() {
				Global.setBusy(false);
				this.playAudio(Const.ERROR);
			}, oShipController);
		return oWorkFlow;

	};
});