sap.ui.define([
	"com/sz/packoutbdlv/workflows/WorkFlow",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/service/ODataService",
	"com/sz/packoutbdlv/modelHelper/Material",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/modelHelper/Message",
	"com/sz/packoutbdlv/utils/Const"
], function(WorkFlow, Util, Service, MaterialHelper, Global, Message, Const) {
	"use strict";
	return function(oSourceController, oShipController) {
		var oWorkFlow = new WorkFlow()
			.then(function() {
				return Service.terminateSession();
			}, oSourceController)
			.then(function() {
				this.clearSourceBeforeLeave();
				this.unbindODOInfo();
				this.unbindProductInfo();
				return this.disableButtons();
			}, oSourceController, "clear source side")
			.then(function() {
				this.updateInputWithDefault(Const.ID.SHIP_INPUT, "");
				this.clearShipHUTabs();
				this.oItemHelper.clear();
				MaterialHelper.setCurrentMaterial({});
				Global.removeAllShipHandlingUnits();
				this.setCurrentShipHandlingUnit("");
				this.clearPackingInstr();                
			}, oShipController, "clear ship side")
			.then(function() {
				Message.clearAll();
			}, oShipController, "clear message")
			.then(function() {
				this.navToHome();
			}, oSourceController, "nav to home")
			.then(function() {
				this.setBusy(false);
			}, oShipController);

		oWorkFlow
			.errors()
			.always(function() {
				this.setBusy(false);
				this.playAudio(Const.ERROR);
			}, oSourceController);
		return oWorkFlow;

	};
});