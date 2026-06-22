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
			.then(function (newMiscCarrier) {
				this.setBusy(true);
				var itemHelper = this.oItemHelper.getModel().getProperty("/0");
				var docid = itemHelper.DocumentReltdStockDocUUID;
				return Promise.all([
					Service.updateMiscCarrier(newMiscCarrier, docid),
					Service.getOdoDetails(docid)
				]);
			}, oSourceController)
			.then(function (result) {
				if (result[1]) {
					var aItems = this.oItemHelper.getItemsIndexBDocid(result[1].DocumentReltdStockDocUUID);
					aItems.forEach(function (vIndex) {
						this.oItemHelper.updateMiscCarrierByIndex(vIndex, result[1].MiscCarrier);
					}.bind(this));
					this.closeMiscCarrierDialog();
					this.setBusy(false);
				}
			}, oSourceController);

		oWorkFlow
			.errors()
			.always(function () {
				this.setBusy(false);
				this.playAudio(Const.ERROR);
			}, oSourceController);
		return oWorkFlow;
	};
});