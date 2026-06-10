sap.ui.define([
	"com/sz/packoutbdlv/model/Global",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/utils/Const"
], function (Model, Util, Const) {
	"use strict";
	return {
		getExceptionList: function () {
			return Model.getProperty("/exceptionList");
		},
		setExceptionList: function (aExceptionList) {
			Model.setProperty("/exceptionList", aExceptionList);
			return this;
		},
		getSourceId: function () {
			return Model.getProperty("/sourceId");
		},
		setSourceId: function (sourceId) {
			Model.setProperty("/sourceId", sourceId);
			return this;
		},

		getSourceType: function () {
			return Model.getProperty("/sourceType");
		},
		setSourceType: function (sourceType) {
			Model.setProperty("/sourceType", sourceType);
			return this;
		},
		isSourceTypeODO: function () {
			var sSourceType = this.getSourceType();
			return sSourceType === Const.SOURCE_TYPE_ODO;
		},
		setWarehouseNumber: function (warehouseNumber) {
			Model.setProperty("/warehouseNumber", warehouseNumber);
			return this;
		},
		setPackStation: function (workstation) {
			Model.setProperty("/workstation", workstation);
			return this;
		},
		getWarehouseNumber: function () {
			return Model.getProperty("/warehouseNumber");
		},
		setSelectedFeatureSet: function (vFeature) {
			Model.setProperty("/selectedFeatureSet", vFeature);
			return this;
		},
		getSelectedFeatureSet: function () {
			return Model.getProperty("/selectedFeatureSet");
		},
		getPackStation: function () {
			return Model.getProperty("/workstation");
		},
		setScaleEnabled: function (bEnable) {
			Model.setProperty("/scaleEnabled", bEnable);
		},
		getScaleEnabled: function (bEnable) {
			return Model.getProperty("/scaleEnabled");
		},
		setCurrentShipHandlingUnit: function (handlingUnitId) {
			Model.setProperty("/currentShipHandlingUnit", handlingUnitId);
			return this;
		},
		getCurrentShipHandlingUnit: function () {
			return Model.getProperty("/currentShipHandlingUnit");
		},
		setCurrentShipHuLwhUnit: function (sLwhUnit) {
			Model.setProperty("/currentShipHuLwhUnit", sLwhUnit);
			return this;
		},
		getCurrentShipHuLwhUnit: function () {
			return Model.getProperty("/currentShipHuLwhUnit");
		},
		setCurrentShipHandlingUnitClosed: function (bClosed) {
			Model.setProperty("/currentShipHandlingUnitClosed", bClosed);
			return this;
		},
		getCurrentShipHandlingUnitClosed: function () {
			return Model.getProperty("/currentShipHandlingUnitClosed");
		},
		getShipHandlingUnits: function () {
			return Model.getProperty("/shipHandlingUnits");
		},
		removeAllShipHandlingUnits: function () {
			Model.setProperty("/shipHandlingUnits", []);
			return this;
		},
		removeShipHandlingUnit: function (handlingUnitId) {
			var aHandlingUnit = Model.getProperty("/shipHandlingUnits");
			var iIndex = aHandlingUnit.indexOf(handlingUnitId);

			if (iIndex !== -1) {
				aHandlingUnit.splice(iIndex, 1);
			}
			Model.setProperty("/shipHandlingUnits", aHandlingUnit);
			return this;
		},
		addShipHandlingUnit: function (handlingUnitId) {
			var aHandlingUnit = Model.getProperty("/shipHandlingUnits");
			var bFound = aHandlingUnit.filter(x => x === handlingUnitId).length > 0;
			if (bFound) {
				return;
			}
			aHandlingUnit.unshift(handlingUnitId);
			Model.setProperty("/shipHandlingUnits", aHandlingUnit);
			return this;
		},
		changeShipHandlingUnit: function (sOldId, sNewId) {
			var aHandlingUnit = Model.getProperty("/shipHandlingUnits");
			var iIndex = aHandlingUnit.indexOf(sOldId);

			if (iIndex !== -1) {
				aHandlingUnit[iIndex] = sNewId;
			}
			Model.setProperty("/shipHandlingUnits", aHandlingUnit);
			return this;
		},
		setExceptionEnable: function (bExceptionEnable) {
			Model.setProperty("/exceptionEnable", bExceptionEnable);
		},
		getExceptionEnable: function () {
			return Model.getProperty("/exceptionEnable");
		},
		setCurrentShipHandlingUnitTrackNumber: function (sTrackNumber) {
			Model.setProperty("/currentShipHandlingUnitTrackNumber", sTrackNumber);
		},
		getCurrentShipHandlingUnitTrackNumber: function () {
			return Model.getProperty("/currentShipHandlingUnitTrackNumber");
		},
		setPackAllEnable: function (bEnable) {
			Model.setProperty("/packAllEnable", bEnable);
		},
		getPackAllEnable: function () {
			return Model.getProperty("/packAllEnable");
		},
		setSourceMaterialId: function (sMaterialId) {
			Model.setProperty("/sourceMaterialId", sMaterialId);
		},
		getSourceMaterialId: function () {
			return Model.getProperty("/sourceMaterialId");
		},
		isShipHandlingUnitExist: function (sHandlingUnitId) {
			var aHandlingUnit = Model.getProperty("/shipHandlingUnits");
			var oResult = Util.find(aHandlingUnit, function (sHandlingUnit) {
				if (sHandlingUnit === sHandlingUnitId) {
					return true;
				}
				return false;
			});
			if (oResult) {
				return true;
			}
			return false;
		},
		isShipHandlingUintActived: function (sHandlingUnitId) {
			var sCurrentShipHUId = this.getCurrentShipHandlingUnit();
			return sCurrentShipHUId === sHandlingUnitId;
		},
		hasOpenShipHandlingUnit: function () {
			var aShipHUs = this.getShipHandlingUnits();
			return aShipHUs.length === 0 ? false : true;
		},
		setBusy: function (bBusy) {
			Model.setProperty("/busy", !!bBusy);
		},
		setCloseShipHUEnable: function (bEnable) {
			Model.setProperty("/closeShipHUEnable", bEnable);
		},
		getCloseShipHUEnable: function () {
			return Model.getProperty("/closeShipHUEnable");
		},
		isOnCloud: function () {
			return Model.getProperty("/isOnCloud");
		},
		setIsOnCloud: function (bOnCloud) {
			Model.setProperty("/isOnCloud", bOnCloud);
			return this;
		},
		setBin: function (sBin) {
			Model.setProperty("/bin", sBin);
			return this;
		},
		getBin: function () {
			return Model.getProperty("/bin");
		},
		setUnpackEnable: function (bValue) {
			Model.setProperty("/unpackEnable", bValue);
			return this;
		},
		getProductId: function () {
			return Model.getProperty("/productId");
		},
		setProductId: function (bValue) {
			Model.setProperty("/productId", bValue);
			return this;
		},
		setAsyncMode: function (bAsync) {
			Model.setProperty("/asyncMode", bAsync);
			return this;
		},
		setHasExportDelivery: function (bHas) {
			Model.setProperty("/hasExportDelivery", bHas);
			return this;
		},
		getAsyncMode: function () {
			return Model.getProperty("/asyncMode");
		},
		getHasExportDelivery: function () {
			return Model.getProperty("/hasExportDelivery");
		},
		getPendingTaskNumber: function () {
			return Model.getProperty("/pendingTaskNumber");
		},
		increasePendingTaskNumber: function () {
			var iNumber = Model.getProperty("/pendingTaskNumber") + 1;
			Model.setProperty("/pendingTaskNumber", iNumber);
			return iNumber;
		},
		decreasePendingTaskNumber: function () {
			var iNumber = Model.getProperty("/pendingTaskNumber") - 1;
			Model.setProperty("/pendingTaskNumber", iNumber > 0 ? iNumber : 0);
			return iNumber;
		},
		resetPendingTaskNumber: function () {
			Model.setProperty("/pendingTaskNumber", 0);
		},
		isPackFromBin: function () {
			return this.getBin() === this.getSourceId();
		},
		//set if a source handling unit/bin or ship handling unit is displaying in the source side
		setIsPickHUInSourceSide: function (bValue) {
			Model.setProperty("/isPickHUInSourceSide", bValue);
		},
		//get if a source handling unit/bin or ship handling unit is displaying in the source side
		getIsPickHUInSourceSide: function () {
			return Model.getProperty("/isPickHUInSourceSide");
		},
		resetFeatures: function () {
			var aFeatures = Model.getProperty("/applicationFeatures");
			aFeatures.forEach(function (feature) {
				feature.disabled = true;
			});
			Model.setProperty("/applicationFeatures", aFeatures);
			return this;
		},
		setApplicationFeatures: function (vPackMode, aNewFeatures) {
			this.resetFeatures();
			if (!vPackMode || vPackMode === "") return;
			var fKeys = {};
			aNewFeatures.filter((f) => f.PackMode === vPackMode).forEach(function (feature) {
				fKeys[feature.PackFeature] = feature.Disable;
			});
			var aFeatures = Model.getProperty("/applicationFeatures");
			aFeatures.forEach(function (feature) {
				feature.disabled = fKeys[feature.type] !== undefined ? fKeys[feature.type] : true;
			});
			Model.setProperty("/applicationFeatures", aFeatures);
			return this;
		},
		getSerialNumberValidationFeature: function () {
			var disabled = true;
			var aAppFeatures = Model.getProperty("/applicationFeatures");
			try {
				disabled = aAppFeatures.filter(x => x.type === "C")[0].disabled;
			} catch (error) {
			}
			return !disabled;
		}
	};
});