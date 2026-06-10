sap.ui.define([
	"com/sz/packoutbdlv/workflows/WorkFlow",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/service/ODataService",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/modelHelper/OData",
	"com/sz/packoutbdlv/utils/Const",
	"com/sz/packoutbdlv/modelHelper/Cache"
], function (WorkFlow, Util, Service, Global, ODataHelper, Const, Cache) {
	"use strict";
	return function (oSourceController, oShipController) {
		var oWorkFlow = new WorkFlow()
			.then(function (sInput, mSession) {
				mSession.sHuId = sInput;
				this.updateInputWithDefault(Const.ID.SHIP_INPUT, "");
			}, oShipController)
			.then(function (mResponse, mSession) {
				if (!Global.getIsPickHUInSourceSide() && Global.getSourceId() === mSession.sHuId) {
					return this.getHandlingUnitDisplayWhenScanOnOtherSide();
				}
			}, oShipController, "if the user scans the ship hu, determine how to display it")
			.then(function (mResponse, mSession) {
				if (!Global.getIsPickHUInSourceSide() && Global.getSourceId() === mSession.sHuId) {
					var oClearInfo = {
						"bClearSource": true,
						"bClearShip": false,
						"bRemoveExceptionButtons": false
					};
					this.getWorkFlowFactory().getClearWorkFlow().run(oClearInfo);
				}
			}, oSourceController, "clear source if needed")
			.then(function (preResult, mSession) {
				this.setBusy(true);
				return Service.getHUSet(mSession.sHuId, Const.SHIP_TYPE_HU);
			},
				oShipController)
			.then(function (preResult, mSession) {
				mSession.NetWeight = preResult.NetWeight;
				mSession.WeightUoM = preResult.WeightUoM;

				mSession.Length = preResult.Length;
				mSession.Width = preResult.Width;
				mSession.Height = preResult.Height;
				mSession.UnitLwh = preResult.UnitLwh;
				mSession.GVolume = preResult.GVolume;
				mSession.UnitGv = preResult.UnitGv;

				// Global.setBin(preResult.EWMStorageBin);
				if (preResult.IsPickHu) {
					return Util.getRejectPromise(Const.ERRORS.SCAN_SOURCEHU_IN_SHIP_INPUT);
				} else {
					return Service.getHUItems(mSession.sHuId, Const.SHIP_TYPE_HU, true);
				}
			}, oShipController)
			.then(function (preResult, mSession) {
				var hasExpDlv =
					preResult.filter(odo => odo.HasExportDelivery === true).length > 0
						? true : false;
				Global.setHasExportDelivery(hasExpDlv);
				this.setBusy(false);
				this.oItemHelper.setItems(preResult);
				this.createNewTab(mSession.sHuId, Const.TAB.ADVANCED);
				this.updateShippingHUMaterial(mSession.sHuId);
				this.updateInputWithDefault(Const.ID.SHIP_INPUT, "");
				Global.addShipHandlingUnit(mSession.sHuId);
				this.setCurrentShipHandlingUnit(mSession.sHuId);
				var sConsGroup = "";
				if (preResult.length !== 0) {
					sConsGroup = preResult[0].EWMConsolidationGroup;
				}
				Cache.updateShipHUConsGroup(mSession.sHuId, sConsGroup);
				this.updateShipItemStatus();
				this.handleButtonsEnableAfterSwitch();
			}, oShipController)
			.then(function (preResult, mSession) {
				this.updateNetWeightRelated(mSession.NetWeight, mSession.WeightUoM);
				this.updateZDimensionsRelated(
					mSession.Length,
					mSession.Width,
					mSession.Height, 
					mSession.UnitLwh,
					mSession.GVolume,
					mSession.UnitGv
				);
				Global.setCurrentShipHuLwhUnit(mSession.UnitLwh);
			}, oShipController, "update weight chart, color and text")
			.then(function (preResult, mSession) {
				return this.updateItemWeightInNeed(mSession.sHuId, Const.SHIP_TYPE_HU);
			}, oShipController, "check if there exists ship item which is not in ItemWeight")
			.then(function (preResult, oParam) {
				this.updateSourceItemStatus();
				if (Util.isEmpty(Global.getSourceId())) {
					this.focus(Const.ID.SOURCE_INPUT);
				} else {
					this.focus(Const.ID.PRODUCT_INPUT);
				}
			}, oSourceController)
			.then(function (preResult, oParam) {
				oParam.sODO = "";
				oParam.sPackInstr = "";
				if (this.oItemHelper.getHighLightedItemIndex() === 0) {
					oParam.sODO = this.oItemHelper.getItemDocNoByIndex(0);
					oParam.sPackInstr = this.oItemHelper.getItemPackInstrByIndex(0);
				}
			}, oSourceController)
			.then(function (preResult, oParam) {
				this.updatePackingInstr(oParam.sODO, oParam.sPackInstr);
			}, oShipController, "update packing info")
			.then(function (preResult, oParam) {
				this.updateCacheIsEmptyHU();
			}, oShipController, "update cache");

		oWorkFlow
			.errors()
			.subscribe(Const.ERRORS.SCAN_SOURCEHU_IN_SHIP_INPUT, function (sError) {
				sError = this.getTextAccordingToMode("scanSourceInHUInput", "scanSourceInShippingInput");
				this.updateInputWithError(Const.ID.SHIP_INPUT, sError);
				this.focus(Const.ID.SHIP_INPUT);
			}, oShipController)
			.subscribe(Const.ERRORS.HU_NOT_IN_WORK_CENTER, function (sError) {
				this.updateInputWithError(Const.ID.SHIP_INPUT, sError);
				this.focus(Const.ID.SHIP_INPUT);
			}, oShipController)
			.subscribe(Const.ERRORS.SHIP_HU_NOT_IN_WORK_CENTER, function (sError) {
				this.updateInputWithError(Const.ID.SHIP_INPUT, sError);
				this.focus(Const.ID.SHIP_INPUT);
			}, oShipController)
			.default(function (sError) {
				this.updateInputWithError(Const.ID.SHIP_INPUT, sError);
			}, oShipController)
			.always(function (oError) {
				this.setBusy(false);
				this.playAudio(Const.ERROR);
			}, oShipController);
		return oWorkFlow;

	};
});