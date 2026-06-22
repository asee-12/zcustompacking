sap.ui.define([
	"com/sz/packoutbdlv/workflows/WorkFlow",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/service/ODataService",
	"com/sz/packoutbdlv/utils/Const",
	"com/sz/packoutbdlv/modelHelper/Message",
	"com/sz/packoutbdlv/modelHelper/Material",
	"com/sz/packoutbdlv/modelHelper/PackingMode"
], function (WorkFlow, Global, Util, Service, Const, Message, Material, PackingMode) {
	"use strict";
	return function (oSourceController, oShipController) {
		var oWorkFlow = new WorkFlow()
			.then(function (oClearInfo, mSession) {
				if (Util.isEmpty(oClearInfo)) {
					mSession.bClearSource = true;
					mSession.bClearShip = true;
				} else {
					mSession.bClearSource = oClearInfo.bClearSource;
					mSession.bClearShip = oClearInfo.bClearShip;
				}
			}, oSourceController, "set mSession")
			.then(function (vPre, mSession) {
				if (mSession.bClearSource) {
					this.clearSourceBeforeLeave();
					this.byId("product-info").unbindElement();
					this.removeExceptionButtons();
					return Global.setPackAllEnable(false);
				}
			}, oSourceController, "clear source side")
			.then(function (vPre, mSession) {
					if (mSession.bClearShip) {
						this.clearShipHUTabs();
						this.oItemHelper.clear();
						Global.removeAllShipHandlingUnits();
						this.setCurrentShipHandlingUnit("");
						this.clearPackingInstr();
						Material.setFavoriteMaterialSelectedByDefault();
						Material.setCurrentMaterial({});
					}
				},
				oShipController, "clear ship side")
			.then(function (vPre, mSession) {
					if (mSession.bClearShip) {
						Global.setPackAllEnable(false);
					}
				},
				oShipController, "clear ship side")
			.then(function (vPre, mSession) {
				if (mSession.bClearSource && mSession.bClearShip) {
					Message.clearAll();
				}
			}, oShipController, "clear message")
			.then(function (vPre, mSession) {
				if (mSession.bClearSource && mSession.bClearShip && PackingMode.isBasicMode()) {
					this.initDefaultColumnSetting();
					this.initColumnSetting();
				}
			}, oSourceController, "source column setting initialization")
			.then(function (vPre, mSession) {
				if (mSession.bClearSource && mSession.bClearShip&& PackingMode.isBasicMode()) {
					this.initDefaultColumnSetting();
					this.initColumnSetting();
				}
			}, oShipController, "ship column setting initialization");

		oWorkFlow
			.errors()
			.always(function () {
				this.playAudio(Const.ERROR);
			}, oSourceController);
		return oWorkFlow;

	};
});