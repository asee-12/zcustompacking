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
			.then(function (bAll, mSession) {
				this.setBusy(true);
				mSession.single = !bAll;
				mSession.updatingTrackNums = false;
				if (bAll) {
					return Service.printAll();
				}
				return Service.print();
			}, oShipController, "init package matrial buttons")
			.then(function (result, mSession) {
				var aHusWithoutTrks = result
					// .filter(entity => entity.CheckTrackNumberRequirement.TracknumRequirement === Const.TRACK_REQUIREMENT.POPUP)
					.map(entity => entity.CheckTrackNumberRequirement);
				var aHusWithTrks = ODataHelper.getShipHandlingUnitsForPrint()
					.filter(oHu => oHu.TrackNum.trim() !== "");
					mSession.aHusWithTrks = aHusWithTrks;
				if (aHusWithoutTrks.length > 0) {
					var aHuList = [...aHusWithoutTrks, ...aHusWithTrks];
					return this.onOpenAssignTrackNumberDialog(aHuList, mSession.single);
				}
			}, oShipController, "Check if ship all needs to get tracknumbers")
			.then(function(aHandlingUnits, mSession) {
				var aHus = [];
				if (aHandlingUnits) {
					aHus = aHus.concat(aHandlingUnits.map(oHu => oHu.HuId));
				}
				if (mSession.aHusWithTrks) {
					aHus = aHus.concat(mSession.aHusWithTrks.map(oHu => oHu.Huid));
				}
				return Service.triggerHuPrint(aHus);
			}, oShipController, "Data from dialog")
			.then(function () {
				Message.addSuccess(this.getI18nText("printSuccess"));
				this.playAudio(Const.INFO);
				this.setBusy(false);
			}, oShipController, "init package matrial buttons");

		oWorkFlow
			.errors()
			.always(function (bIgnore) {
				this.setBusy(false);
				if (!bIgnore)
					this.playAudio(Const.ERROR);
			}, oShipController, "Error/Reject");
		return oWorkFlow;
	};
});