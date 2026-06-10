sap.ui.define([
	"com/sz/packoutbdlv/workflows/WorkFlow",
	"com/sz/packoutbdlv/service/ODataService",
	"com/sz/packoutbdlv/utils/Const",
	"com/sz/packoutbdlv/modelHelper/Message",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/modelHelper/OData"
], function (WorkFlow, Service, Const, Message, Global, ODataHelper) {
	"use strict";
	return function (oSourceController, oShipController) {
		var oWorkFlow = new WorkFlow()
			.then(function (mSession) {
				this.setBusy(true);
				ODataHelper.setUseBatch(false);
				var aItems = this.getView().byId("cancelShipSmartTable--inner").getSelectedItems();
				var aSelData = aItems.map(i => i.getBindingContext().getObject());
				return Service.cancelShipHandlingUnits(aSelData);
			}, oShipController, "Initiate cancel shipment")
			.then(function (result, mSession) {
				result.forEach(function (oHu) {
					var sShipHU = oHu.HuId;
					if (oHu.MsgVar.trim() !== "") {
						Message.addSuccess(oHu.MsgVar);
					}
					this.getWorkFlowFactory().getShipHUSelectionWorkFlow().run(sShipHU);
				}, this);
				this.onCancelShipmentDialog();
				this.setBusy(false);
				ODataHelper.setUseBatch(true);
			}, oShipController, "init package matrial buttons");

		oWorkFlow
			.errors()
			.always(function (oError) {
				ODataHelper.setUseBatch(true);
				this.setBusy(false);
				this.playAudio(Const.ERROR);
			}, oShipController, "Error/Reject");
		return oWorkFlow;
	};
});