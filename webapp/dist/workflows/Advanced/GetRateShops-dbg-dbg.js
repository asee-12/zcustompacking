sap.ui.define([
	"com/sz/packoutbdlv/workflows/WorkFlow",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/service/ODataService",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/modelHelper/Message",
	"com/sz/packoutbdlv/utils/Const"
], function (WorkFlow, Util, Service, Global, Message, Const) {
	"use strict";
	return function (oSourceController, oShipController) {
		var oWorkFlow = new WorkFlow()
			.then(function () {
				this.setBusy(true);
				this.oRateShopModel.setData([]);
				var itemHelper = this.oItemHelper.getModel().getProperty("/0");
				if (itemHelper) {
					var carrierId = itemHelper.CarrierServiceId;
					if (!!carrierId && carrierId !== "") {
						return Service.getRateShops(carrierId);
					}
				}
			}, oSourceController)
			.then(function (result) {
				this.oRateShopModel.setData(result);
				this.getRateShopDialog().open();
				this.setBusy(false);
			}, oSourceController)

		oWorkFlow
			.errors()
			.always(function () {
				this.setBusy(false);
				this.playAudio(Const.ERROR);
			}, oSourceController);
		return oWorkFlow;
	};
});