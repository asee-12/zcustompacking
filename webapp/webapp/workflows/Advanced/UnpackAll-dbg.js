sap.ui.define([
	"com/sz/packoutbdlv/workflows/WorkFlow",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/utils/Const",
	"com/sz/packoutbdlv/utils/CustomError",
	"com/sz/packoutbdlv/modelHelper/Message",
	"com/sz/packoutbdlv/service/ODataService",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/modelHelper/Cache"
], function (WorkFlow, Util, Const, CustomError, Message, Service, Global, Cache) {
	"use strict";
	return function (oSourceController, oShipController) {
		var oWorkFlow = new WorkFlow()
			.then(function (aProducts, oParam) {
				oParam.aProducts = aProducts;
				return Service
					.unpackAll(aProducts);
			}, oShipController, "call backend service to unpack all items")
			.then(oShipController.unpackCallback, oShipController,
				"delete the ship hu from ui and interupt the following actions, if it is deleted from backend")
			.then(function (preResult, oParam) {
				this.updateInputWithDefault(Const.ID.SHIP_INPUT, "");
				this.updateNetWeightRelated(preResult.NetWeight, preResult.WeightUoM);
				this.clearGrossWeight();
			}, oShipController, "update weight chart, color and text")
			.then(function (preResult, oParam) {
				this.oItemHelper.clear();
				Global.setUnpackEnable(false);
			}, oShipController, "remove product from right table")
			.then(function () {
				Cache.updateShipHUConsGroup(Global.getCurrentShipHandlingUnit(), "");
				this.updateScaleWeight("");
			}, oShipController, "clear ship side")
			.then(function (preResult, oParam) {
				return this.handleUnpackAllItemsWithDifferentODO(oParam.aProducts);
			}, oShipController, "if source is ODO, ship items with different odo will be unpack to bin")
			.then(function (preResult, oParam) {
				return Service
					.getHUItems(Global.getSourceId());
			}, oShipController)
			.then(function (preResult, oParam) {
				this.setBusy(false);
				this.oItemHelper.setItems(preResult);
				this.oItemHelper.sortItemsByKey(preResult[0].StockItemUUID);
			}, oSourceController, "add item to the left table")
			.then(function () {
				this.oItemHelper.setItemsStatusByConsGrp();
				Global.setExceptionEnable(false);
				Global.setProductId("");
			}, oSourceController, "update first item and buttons status")
			.then(function () {
				this.unbindProductInfo();
				this.bindODOInfo();
			}, oSourceController, "update odo and product info")
			.then(function () {
				this.focus(Const.ID.PRODUCT_INPUT);
			}, oSourceController)
			.then(function (preResult, oParam) {
				this.clearPackingInstr();
			}, oShipController, "clear packing info")
			.then(function (preResult, oParam) {
				this.updateCacheIsEmptyHU();
			}, oShipController, "update cache")
			.then(function () {
				this.handlePackAllEnable();
			}, oSourceController, "handle packall enable")
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
				this.playAudio(Const.ERROR);
			}, oShipController);
		return oWorkFlow;

	};
});