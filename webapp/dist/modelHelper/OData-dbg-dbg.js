sap.ui.define(["com/sz/packoutbdlv/utils/Util","com/sz/packoutbdlv/utils/Const","com/sz/packoutbdlv/modelHelper/Global","com/sz/packoutbdlv/modelHelper/Material"
], function (Util, Const, Global, Material) {
	"use strict";
	var _oModel;
	return {
		init: function (oDataModel) {
			_oModel = oDataModel;
			var aDeferredGroups = _oModel.getDeferredGroups();
			aDeferredGroups.push("groupCommodity");
			_oModel.setDeferredGroups(aDeferredGroups);
			var oChangeGroups = _oModel.getChangeGroups();
			oChangeGroups.Commodity = { 
				groupId: "groupCommodity",
				changeSetId: "groupCommodityChanges"
			};
			_oModel.setChangeGroups(oChangeGroups);
			return this;
		},
		setUseBatch: function(bUse) {
			if (_oModel) {
				_oModel.setUseBatch(bUse);
			}
		},
		destroy: function () {
			_oModel = null;
		},
		getDefaultBinPath: function (sBin) {
			sBin = this.encodeSpecialCharacter(sBin);
			var sTemplate = "/PackingStationSet(EWMWarehouse=''{0}'',EWMWorkCenter=''{1}'',EWMStorageBin=''{2}'')";
			return Util.formatText(sTemplate, [Global.getWarehouseNumber(), Global.getPackStation(), sBin]);
		},
		getWorkCenterPath: function (sWorkCenter) {
			sWorkCenter = this.encodeSpecialCharacter(sWorkCenter);
			var sTemplate = "/PackingStationSet(EWMWarehouse=''{0}'',EWMWorkCenter=''{1}'',EWMStorageBin='''')";
			return Util.formatText(sTemplate, [Global.getWarehouseNumber(), sWorkCenter]);
		},
		getOdoPath: function(sDocid) {
			var sTemplate = "/ODOSet(EWMStorageBin=''{0}'',EWMWarehouse=''{1}'',HuId=''{2}'',Type=''{3}'',EWMWorkCenter=''{4}'',DocumentReltdStockDocUUID=guid''{5}'')";
			return Util.formatText(sTemplate, [Global.getBin(), Global.getWarehouseNumber(), Global.getSourceId(), Global.getSourceType(), Global.getPackStation(), sDocid]);
		},
		getHUPath: function (sHUId, sHUType) {
			if (!sHUId) {
				sHUId = Global.getSourceId();
			}
			if (sHUType === undefined) {
				sHUType = Global.getSourceType();
			}
			sHUId = this.encodeSpecialCharacter(sHUId);
			// var sTemplate = "/HUSet(HuId=''{0}'',EWMStorageBin=''{1}'',EWMWarehouse=''{2}'',EWMWorkCenter=''{3}'',Type=''{4}'')";
			var sTemplate = "/HUSet(HuId=''{0}'',EWMStorageBin='''',EWMWarehouse=''{2}'',EWMWorkCenter=''{3}'',Type=''{4}'')";
			return Util.formatText(sTemplate, [sHUId, Global.getBin(), Global.getWarehouseNumber(), Global.getPackStation(), sHUType]);
		},
		getUpdateHUPath: function () {
			var sHuId = this.encodeSpecialCharacter(Global.getCurrentShipHandlingUnit());
			var sTemplate = "/HUSet(HuId=''{0}'',EWMWarehouse=''{1}'',EWMWorkCenter=''{2}'',EWMStorageBin=''{3}'',Type=''1'')";
			return Util.formatText(sTemplate, [sHuId, Global.getWarehouseNumber(), Global.getPackStation(), Global.getBin()]);
		},
		getHUInfo: function (sHuId, sType) {
			var sPath = this.getHUPath(sHuId, sType);
			return _oModel.getProperty(sPath);
		},
		getHUItemsPath: function (sHuid, sType) {
			return this.getHUPath(sHuid, sType) + "/Items";
		},
		getPackagingMaterialPath: function () {
			var sTemplate = "/PackingStationSet(EWMWarehouse=''{0}'',EWMWorkCenter=''{1}'',EWMStorageBin='''')/PackMats";
			return Util.formatText(sTemplate, [Global.getWarehouseNumber(), Global.getPackStation()]);
		},
		getProductPath: function (sStockItemUUID) {
			var sTemplate = "/ItemSet(guid''{0}'')";
			return Util.formatText(sTemplate, sStockItemUUID);
		},
		getShipHUMaterialId: function (sHuid) {
			var sPath = this.getHUPath(sHuid, Const.SHIP_TYPE_HU.toString()) + "/PackagingMaterial";
			return _oModel.getProperty(sPath);
		},
		getShipHUTrackingNumber: function (sHuid) {
			var sPath = this.getHUPath(sHuid, Const.SHIP_TYPE_HU.toString()) + "/TrackNumber";
			return _oModel.getProperty(sPath);
		},
		getPackageMaterial: function () {
			var oMaterial = Material.getCurrentMaterial();
			return oMaterial.PackagingMaterial;
		},
		getExceptionPackParameters: function (oProduct, iQty, sExccode, sUoM) {
			return {
				"EWMWarehouse": "'" + Global.getWarehouseNumber() + "'",
				"EWMWorkCenter": "'" + Global.getPackStation() + "'",
				"EWMStorageBin": "'" + Global.getBin() + "'",
				"SourceId": "'" + Global.getSourceId() + "'",
				"ShippingHUId": "'" + Global.getCurrentShipHandlingUnit() + "'",
				"SourceType": "'" + Global.getSourceType() + "'",
				"IsPackAll": false,
				"PackagingMaterial": "'" + this.getPackageMaterial() + "'",
				"Quan": iQty + "M",
				"Exccode": "'" + sExccode + "'",
				"SnList": "'" + oProduct.SnList + "'",
				"StockItemUUID": "guid'" + oProduct.StockItemUUID + "'",
				"AlternativeUnit": sUoM ? "'" + sUoM + "'" : "''"
			};
		},
		getPackParameters: function (oProduct, fQuantity, sUoM) {
			var oParamater = {
				"EWMWarehouse": "'" + Global.getWarehouseNumber() + "'",
				"EWMWorkCenter": "'" + Global.getPackStation() + "'",
				"EWMStorageBin": "'" + Global.getBin() + "'",
				"SourceId": "'" + Global.getSourceId() + "'",
				"ShippingHUId": "'" + Global.getCurrentShipHandlingUnit() + "'",
				"SourceType": "'" + Global.getSourceType() + "'",
				"IsPackAll": false,
				"PackagingMaterial": "'" + this.getPackageMaterial() + "'",
				"SnList": "'" + oProduct.SnList + "'",
				"OrdReduction": Util.parseNumber(oProduct.QtyReduced) !== 0 ? true : false,
				"StockItemUUID": "guid'" + oProduct.StockItemUUID + "'",
				"AlternativeUnit": sUoM ? "'" + sUoM + "'" : "''"
			};
			if (fQuantity) {
				oParamater.Quan = fQuantity + "M";
			}
			return oParamater;
		},

		getPackAllParameters: function (aProducts) {
			return {
				"EWMWarehouse": "'" + Global.getWarehouseNumber() + "'",
				"EWMWorkCenter": "'" + Global.getPackStation() + "'",
				"EWMStorageBin": "'" + Global.getBin() + "'",
				"SourceId": "'" + Global.getSourceId() + "'",
				"ShippingHUId": "'" + Global.getCurrentShipHandlingUnit() + "'",
				"SourceType": "'" + Global.getSourceType() + "'",
				"IsPackAll": true,
				"PackagingMaterial": "'" + this.getPackageMaterial() + "'"
			};
		},

		getUnpackParameters: function (oProduct, bNeedQuantity) {
			var oParamater = {
				"EWMWarehouse": "'" + Global.getWarehouseNumber() + "'",
				"EWMWorkCenter": "'" + Global.getPackStation() + "'",
				"EWMStorageBin": "'" + Global.getBin() + "'",
				"SourceId": "'" + Global.getSourceId() + "'",
				"ShippingHUId": "'" + Global.getCurrentShipHandlingUnit() + "'",
				"SourceType": "'" + Global.getSourceType() + "'",
				"StockItemUUID": "guid'" + oProduct.StockItemUUID + "'",
				"IsUnPackAll": false,
				"PackagingMaterial": "'" + Global.getSourceMaterialId() + "'"
			};
			if (bNeedQuantity) {
				oParamater.Quan = Util.parseNumber(oProduct.AlterQuan) + "M";
			}
			return oParamater;
		},
		getPrintParameters: function (sHuid) {
			var sHu = sHuid || Global.getCurrentShipHandlingUnit();
			return {
				"EWMWarehouse": "'" + Global.getWarehouseNumber() + "'",
				"EWMWorkCenter": "'" + Global.getPackStation() + "'",
				"EWMStorageBin": "'" + Global.getBin() + "'",
				"HUId": "'" + sHu + "'"
			};
		},
		getPrintParametersByHuid: function (sHuid) {
			return {
				"EWMWarehouse": "'" + Global.getWarehouseNumber() + "'",
				"EWMWorkCenter": "'" + Global.getPackStation() + "'",
				"Huid": "'" + sHuid + "'"
			};
		},

		getUpdateTrackingParameters: function(sHuid, sTrackNum) {
			return {
				"EWMWarehouse": "'" + Global.getWarehouseNumber() + "'",
				"EWMWorkCenter": "'" + Global.getPackStation() + "'",
				"Huid": "'" + sHuid + "'",
				"TrackNumber": "'" + sTrackNum + "'"
			};
		},

		getShipHandlingUnitsForPrint: function() {
			var aHunits = [];
			Global.getShipHandlingUnits().forEach(function(sHu) {
				var sTrackNum = this.getShipHUTrackingNumber(sHu);
				aHunits.push({
					Huid: sHu,
					TrackNum: sTrackNum || ""
				});
			}, this);	
			return aHunits;		
		},

		getUnpackAllParameters: function (aProducts) {
			return {
				"EWMWarehouse": "'" + Global.getWarehouseNumber() + "'",
				"EWMWorkCenter": "'" + Global.getPackStation() + "'",
				"EWMStorageBin": "'" + Global.getBin() + "'",
				"SourceId": "'" + Global.getSourceId() + "'",
				"ShippingHUId": "'" + Global.getCurrentShipHandlingUnit() + "'",
				"SourceType": "'" + Global.getSourceType() + "'",
				"IsUnPackAll": true,
				"Quan": "0M",
				"PackagingMaterial": "'" + Global.getSourceMaterialId() + "'"
			};
		},

		getCloseShipHandlingUnitParameters: function () {
			var oParameters = {
				"EWMWarehouse": "'" + Global.getWarehouseNumber() + "'",
				"EWMWorkCenter": "'" + Global.getPackStation() + "'",
				"ShippingHUId": "'" + Global.getCurrentShipHandlingUnit() + "'",
				"EWMStorageBin": "'" + Global.getBin() + "'"
			};
			return oParameters;
		},

		getCloseShipHandlingUnitParametersById: function (sHuId) {
			var oParameters = {
				"EWMWarehouse": "'" + Global.getWarehouseNumber() + "'",
				"EWMWorkCenter": "'" + Global.getPackStation() + "'",
				"ShippingHUId": "'" + sHuId + "'",
				"EWMStorageBin": "'" + Global.getBin() + "'"
			};
			return oParameters;
		},

		getChangeMaterialParameters: function (sHuId) {
			var oParameters = {
				"EWMWarehouse": "'" + Global.getWarehouseNumber() + "'",
				"EWMWorkCenter": "'" + Global.getPackStation() + "'",
				"EWMStorageBin": "'" + Global.getBin() + "'",
				"SourceId": "''",
				"ShippingHUIdOld": "'" + Global.getCurrentShipHandlingUnit() + "'",
				"ShippingHUIdNew": "'" + sHuId + "'",
				"SourceType": "'" + Global.getSourceType() + "'",
				"SourcePackMat": "'" + Global.getSourceMaterialId() + "'",
				"ShippingHUPackMat": "'" + Material.getSelectedMaterialId() + "'"
			};
			return oParameters;
		},
		getVarifyProductEANParameters: function (sValue) {
			var oParameters = {
				"EWMWarehouse": "'" + Global.getWarehouseNumber() + "'",
				"EWMWorkCenter": "'" + Global.getPackStation() + "'",
				"EWMStorageBin": "'" + Global.getBin() + "'",
				"ProductName": "'" + sValue + "'"
			};
			return oParameters;
		},
		getDeleteHUParameters: function () {
			var oParameters = {
				"EWMWarehouse": "'" + Global.getWarehouseNumber() + "'",
				"EWMWorkCenter": "'" + Global.getPackStation() + "'",
				"EWMStorageBin": "'" + Global.getBin() + "'",
				"SourceId": "''",
				"ShippingHUIdOld": "'" + Global.getCurrentShipHandlingUnit() + "'",
				"ShippingHUIdNew": "''",
				"SourceType": "'" + Global.getSourceType() + "'",
				"SourcePackMat": "'" + Global.getSourceMaterialId() + "'",
				"ShippingHUPackMat": "'" + Material.getSelectedMaterialId() + "'",
				"DeleteShippingHUOnly": "true"
			};
			return oParameters;
		},
		getValidateSnParamters: function (oProduct, sSn) {
			return {
				"EWMWarehouse": "'" + Global.getWarehouseNumber() + "'",
				"EWMWorkCenter": "'" + Global.getPackStation() + "'",
				"EWMStorageBin": "'" + Global.getBin() + "'",
				"SourceId": "'" + Global.getSourceId() + "'",
				"ShippingHUId": "'" + Global.getCurrentShipHandlingUnit() + "'",
				"SourceType": "'" + Global.getSourceType() + "'",
				"DocumentReltdStockDocUUID":"guid'" + oProduct.DocumentReltdStockDocUUID + "'",
				"DocumentReltdStockDocItemUUID": "guid'" + oProduct.DocumentReltdStockDocItemUUID + "'",
				"ProductName": "'" + oProduct.ProductName + "'",
				"EWMSerialNumber": "'" + sSn + "'",
				"StockItemUUID": "guid'" + oProduct.StockItemUUID + "'"
			};
		},
		getUpdateDimensionsParameters: function (sLength, sWidth, sHeight) {
			return {
				"EWMWarehouse": `'${Global.getWarehouseNumber()}'`,
				"EWMWorkCenter": `'${Global.getPackStation()}'`,
				"Huid": `'${this.encodeSpecialCharacter(Global.getCurrentShipHandlingUnit())}'`,
				"Length": `'${sLength}'`,
				"Width": `'${sWidth}'`,
				"Height": `'${sHeight}'`,
				"Unit": `'${Global.getCurrentShipHuLwhUnit()}'`
			};
		},
		getScaleWeightData: function () {
			return {
				"EWMWarehouse": Global.getWarehouseNumber(),
				"EWMWorkCenter": Global.getPackStation(),
				"EWMStorageBin": Global.getBin(),
				"Huid": this.encodeSpecialCharacter(Global.getCurrentShipHandlingUnit())
			};
		},
		encodeSpecialCharacter: function (sInput) {
			if (!Util.isEmpty(sInput)) {
				return sInput.replace(/#/g, "%23");
			}
		},
		isShipHUClosed: function (sHuId) {
			var bClosed = false;
			var mHU;
			sHuId = sHuId ? sHuId : Global.getCurrentShipHandlingUnit();
			if (!Util.isEmpty(sHuId) && (mHU = this.getHUInfo(sHuId, Const.SHIP_TYPE_HU))) {
				bClosed = mHU.Closed;
			}
			return bClosed;
		}
	};
});