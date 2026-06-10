sap.ui.define([
	"com/sz/packoutbdlv/workflows/WorkFlow",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/utils/Const",
	"com/sz/packoutbdlv/modelHelper/Message",
	"com/sz/packoutbdlv/service/ODataService",
	"com/sz/packoutbdlv/modelHelper/Cache",
	"com/sz/packoutbdlv/modelHelper/Global"
], function (WorkFlow, Util, Const, Message, Service, Cache, Global) {
	"use strict";
	return function (oSourceController, oShipController) {
		var oWorkFlow = new WorkFlow()
			.then(function (aProducts, oParams) {
				//send backend service
				oParams.aProducts = aProducts;
				return Service
					.packAll(aProducts);
			}, oSourceController)
			.then(function (preResult, oParams) {
				this.oItemHelper.clear();
				Global.setProductId("");
				Global.setPackAllEnable(false);
			}, oSourceController, "remove item from left")
			.then(function () {
				this.unbindProductInfo();
				this.focus(Const.ID.PRODUCT_INPUT);
			}, oSourceController, "unbind product info")
			.then(function () {
				return Service
					.getHUItems(Global.getCurrentShipHandlingUnit(), Const.SHIP_TYPE_HU);
			})
			.then(function (preResult, oParam) {
				this.setBusy(false);
				oParam.bShipHUEmptyBeforePack = this.oItemHelper.isEmpty();
				this.oItemHelper.setItems(preResult);
				this.oItemHelper.setItemsPreviousAlterQuan();
				this.oItemHelper.setItemsPackedQuan();
				this.oItemHelper.setItemsDeltaQuan();
				this.oItemHelper.setItemsStatusToNone();
				this.oItemHelper.setItemHighlightByIndex(0);
			}, oShipController, "add item in the right table")
			.then(function (preResult, oParam) {
				if (oParam.bShipHUEmptyBeforePack) {
					Cache.updateShipHUConsGroup(Global.getCurrentShipHandlingUnit(), oParam.aProducts[0].EWMConsolidationGroup);
				}
			}, oShipController, "if it is the first item in the right, update cache")
			.then(function (preResult, mSession) {
				this.clearGrossWeight();
				this.clearPackingInstr();
			}, oShipController, "update packing info")
			.then(function (preResult, mSession) {
				this.delayCalledAdjustContainerHeight();
			}, oShipController);

		oWorkFlow
			.errors()
			.default(function (sError, vPara, mSession, bCustomError) {
				if (bCustomError) {
					this.showErrorMessagePopup(sError);
				}
			}, oSourceController)
			.always(function () {
				this.setBusy(false);
				this.focus(Const.ID.PRODUCT_INPUT);
				this.playAudio(Const.ERROR);
			}, oSourceController);
		return oWorkFlow;

	};
});