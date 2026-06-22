sap.ui.define([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/utils/Response",
	"com/sz/packoutbdlv/modelHelper/OData",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/utils/Const"
], function (Filter, FilterOperator, Util, Response, ODataHelper, Global, Const) {
	"use strict";
	var _oModel;
	var READ = "read",
		CREATE = "create",
		DELETE = "remove",
		PUT = "update";
	return {
		getPromise: function (sPath, sMethod, mData, mPara, mHeader) {
			var aParameter = [];
			if (Util.isEmpty(sMethod)) {
				sMethod = READ;
			}
			if (Util.isEmpty(mData)) {
				mData = {};
			}
			if (Util.isEmpty(mPara)) {
				mPara = {};
			}
			if (!Util.isEmpty(mHeader)) {
				_oModel.setHeaders(mHeader);
			}

			return new Promise(function (resolve, reject) {
				mPara = jQuery.sap.extend(mPara, {
					success: function (oData) {
						if (oData === undefined) {
							resolve(oData);
						} else if (!Response.parseError(oData, reject)) {
							Response.parseSuccess(oData);
							Response.parseWarning(oData);
							oData = oData.results ? oData.results : oData;
							resolve(oData);
						}
					},
					error: function (oError) {
						reject(oError);
					}
				});

				if (sMethod === READ || sMethod === DELETE) {
					aParameter.push(sPath, mPara);
				} else {
					aParameter.push(sPath, mData, mPara);
				}
				_oModel[sMethod].apply(_oModel, aParameter);
			});
		},
		init: function (oDataModel) {
			_oModel = oDataModel;
			return this;
		},
		destroy: function () {
			_oModel = null;
		},
		setOdataHeader: function (sMode) {
			_oModel.setHeaders({
				"pack_mode": sMode
			});
		},
		logonPackStation: function () {
			return this.getPromise("/PackingStationSet(EWMWarehouse='',EWMWorkCenter='')");
		},
		verifyWorkCenter: function (sValue) {
			return this.getPromise(ODataHelper.getWorkCenterPath(sValue), READ, {});
		},
		verifyStorageBin: function (sValue) {
			return this.getPromise(ODataHelper.getDefaultBinPath(sValue));
		},
		//todo:: refine- create a unified promise
		verifySource: function (sourceId) {
			var mData = {
				"SourceId": sourceId,
				"EWMWarehouse": Global.getWarehouseNumber(),
				"EWMWorkCenter": Global.getPackStation(),
				"EWMStorageBin": ""
			};
			return this.getPromise("/ValidateActionSet", CREATE, mData);
		},
		verifyProduct: function (sValue) {
			var oURLParameters = ODataHelper.getVarifyProductEANParameters(sValue);
			return this.getPromise("/ValidateProduct", CREATE, {}, {
				urlParameters: oURLParameters
			});
		},

		getPackagingMaterials: function (bNeedRequireMaterial) {
			var sWarehouseNumber = Global.getWarehouseNumber();
			var sWorkstation = Global.getPackStation();
			var sBin = Global.getBin();
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouseNumber);
			var oWorkstationFilter = new Filter("EWMWorkCenter", FilterOperator.EQ, sWorkstation);
			var oBinFilter = new Filter("EWMStorageBin", FilterOperator.EQ, sBin);

			return this.getPromise("/PackMatSet", READ, {}, {
				filters: [oWarehouseNumberFilter, oWorkstationFilter, oBinFilter]
			});
		},

		createShippingHU: function (sHuId, sMaterialId, sBin) {
			var sOverrideBin = Global.getBin();;
			if (sOverrideBin === "" && sBin !== "") {
				sOverrideBin = sBin;
			}
			var mData = {
				"HuId": sHuId,
				"EWMWarehouse": Global.getWarehouseNumber(),
				"EWMWorkCenter": Global.getPackStation(),
				"PackagingMaterial": sMaterialId,
				"EWMRefDeliveryDocumentNumber": "",
				"EWMStorageBin": sOverrideBin,
				"Type": "1"
			};
			return this.getPromise("/HUSet", CREATE, mData);
		},

		exceptionPack: function (oProduct, iQty, sExccode, sUoM) {
			var oURLParameters = ODataHelper.getExceptionPackParameters(oProduct, iQty, sExccode, sUoM);
			return this.getPromise("/Pack", CREATE, {}, {
				urlParameters: oURLParameters
			});
		},

		pack: function (oProduct, fQuantity, sUoM) {
			var oURLParameters = ODataHelper.getPackParameters(oProduct, fQuantity, sUoM);
			return this.getPromise("/Pack", CREATE, {}, {
				urlParameters: oURLParameters,
				changeSetId: oProduct.DocumentReltdStockDocUUID + oProduct.DocumentReltdStockDocItemUUID
			});
		},

		packAll: function (aProducts) {
			var oURLParameters = ODataHelper.getPackAllParameters(aProducts);
			return this.getPromise("/Pack", CREATE, {}, {
				urlParameters: oURLParameters
			});
		},

		unpack: function (oProduct, bNeedQuantity) {
			var oURLParameters = ODataHelper.getUnpackParameters(oProduct, bNeedQuantity);
			return this.getPromise("/UnPack", CREATE, {}, {
				urlParameters: oURLParameters
			});
		},

		unpackAll: function (aProducts) {
			var oURLParameters = ODataHelper.getUnpackAllParameters(aProducts);
			return this.getPromise("/UnPack", CREATE, {}, {
				urlParameters: oURLParameters
			});
		},

		submitChanges: function (mParams) {
			_oModel.submitChanges(mParams);
		},

		/**
		 * get exception list
		 *
		 * @return {Promise} The promise object which represent the exception list
		 */
		getExceptionList: function () {
			var sWarehouseNumber = Global.getWarehouseNumber();
			var sWorkstation = Global.getPackStation();
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouseNumber);
			var oWorkstationFilter = new Filter("EWMWorkCenter", FilterOperator.EQ, sWorkstation);
			return this.getPromise("/ExceptionListSet", READ, {}, {
				filters: [oWarehouseNumberFilter, oWorkstationFilter]
			});
		},

		getMaterialAndExceptionList: function () {
			var oMaterialPromise = this.getPackagingMaterials();
			var oExceptionPromise = this.getExceptionList();
			return Promise.all([oMaterialPromise, oExceptionPromise]);
		},

		closeShipHandlingUnit: function () {
			var oURLParameters = ODataHelper.getCloseShipHandlingUnitParameters();
			return this.getPromise("/Close", CREATE, {}, {
				urlParameters: oURLParameters
			});
		},

		cancelShipHandlingUnit: function () {
			var oURLParameters = ODataHelper.getCloseShipHandlingUnitParameters();
			return this.getPromise("/CancelShipment", CREATE, {}, {
				urlParameters: oURLParameters
			});
		},

		cancelShipHandlingUnits: async function (aHuids) {
			// Added sequential call to avoid delivery locking scenario.
			let results = [];
			for (let index = 0; index < aHuids.length; index++) {
				const oHu = aHuids[index];
				var oURLParameters = ODataHelper.getCloseShipHandlingUnitParametersById(oHu.Exidv);
				const result = await this.getPromise("/CancelShipment", CREATE, {}, {
					urlParameters: oURLParameters
				});

				results.push(result);
			}

			return results;

			// Commented async call, as Hu's from same delivery were causing locking issues.
			// var aPromises = aHuids.map(function (oHu) {
			// 	var oURLParameters = ODataHelper.getCloseShipHandlingUnitParametersById(oHu.Exidv);
			// 	return this.getPromise("/CancelShipment", CREATE, {}, {
			// 		urlParameters: oURLParameters
			// 	});
			// }, this);

			// return Promise.all(aPromises);
		},

		getScaleWeight: function () {
			var mData = ODataHelper.getScaleWeightData();
			return this.getPromise("/ScaleWeightSet", CREATE, mData);
		},

		verifySerialNumber: function (oProduct, sSerialNum) {
			var oURLParemeters = ODataHelper.getValidateSnParamters(oProduct, sSerialNum);
			return this.getPromise("/ValidateSn", CREATE, {}, {
				urlParameters: oURLParemeters
			});
		},

		changeMaterial: function (sShippingHUId) {
			var oURLParameters = ODataHelper.getChangeMaterialParameters(sShippingHUId);
			return this.getPromise("/ChangePackMat", CREATE, {}, {
				urlParameters: oURLParameters
			});
		},
		getHUSet: function (sHuId, sHuType) {
			return this.getPromise(ODataHelper.getHUPath(sHuId, sHuType));
		},
		getHUItemSet: function (sHuId, sHuType) {
			return this.getPromise(ODataHelper.getHUPath(sHuId, sHuType) + "/Items");
		},
		getHUODOSet: function (sHuId, sHuType) {
			return this.getPromise(ODataHelper.getHUPath(sHuId, sHuType) + "/ODOs");
		},
		getHUItems: function (sHuId, sHuType, bItemsOnly) {
			if (!bItemsOnly) {
				var oHUSetPromise = this.getHUSet(sHuId, sHuType);
			}
			var oItemSetPromise = this.getHUItemSet(sHuId, sHuType);
			var oODOSetPromise = this.getHUODOSet(sHuId, sHuType);
			return Promise.all([oHUSetPromise, oItemSetPromise, oODOSetPromise])
				.then(function (aResults) {
					var oHuMap = aResults[0];
					var aItems = aResults[1];
					var aODOs = aResults[2];
					var vODOMap = {};
					aODOs.forEach(function (oODO) {
						vODOMap[oODO.DocumentReltdStockDocUUID] = oODO;
					});
					aItems.forEach(function (oItem) {
						oItem.AlterQuan = Util.formatNumber(parseFloat(oItem.AlterQuan), 3);
						oItem.Quan = Util.formatNumber(parseFloat(oItem.Quan), 3);
						oItem.NetWeight = Util.formatNumber(parseFloat(oItem.NetWeight), 3, 3);
						oItem.Volume = Util.formatNumber(parseFloat(oItem.Volume), 3, 3);
						oItem.QtyReduced = Util.formatNumber(parseFloat(oItem.QtyReduced), 3);
						if (oItem.StockItemNumber === "0") {
							oItem.StockItemNumber = "";
						}
						var oODO = vODOMap[oItem.DocumentReltdStockDocUUID];
						if (!Util.isEmpty(oODO)) {
							[
								"CustomerName",
								"PackInstr",
								"ShipToAddress",
								"ShipToAddress",
								"CarrierService",
								"CarrierServiceId",
								"IsMiscCarrier",
								"MiscCarrier",
								"HasExportDelivery"
							].forEach((key) => oItem[key] = oODO[key]);
						}
					});
					return aItems;
				});
		},
		updateHU: function (mHUData, sTotalWeight) {
			var sPath = ODataHelper.getUpdateHUPath();
			var mData = {
				"HuId": mHUData.HuId,
				"EWMWarehouse": mHUData.EWMWarehouse,
				"EWMWorkCenter": mHUData.EWMWorkCenter,
				"PackagingMaterial": mHUData.PackagingMaterial,
				"WeightUoM": mHUData.WeightUoM,
				"TotalWeight": sTotalWeight,
				"EWMRefDeliveryDocumentNumber": mHUData.EWMRefDeliveryDocumentNumber
			};
			return this.getPromise(sPath, PUT, mData);
		},
		updateHuDimensions: function (oHuData) {
			var sLength = oHuData.Length.toString();
			var sWidth = oHuData.Width.toString();
			var sHeight = oHuData.Height.toString();
			var oParams = ODataHelper.getUpdateDimensionsParameters(sLength, sWidth, sHeight);

			return this.getPromise("/UpdateDimensions", CREATE, {}, {
				urlParameters: oParams
			});
		},
		updateMiscCarrier: function (sCarrier, sDocid) {
			var sPath = ODataHelper.getOdoPath(sDocid);
			var mData = {
				MiscCarrier: sCarrier
			};
			return this.getPromise(sPath, PUT, mData);
		},
		getOdoDetails: function (sDocid) {
			var sPath = ODataHelper.getOdoPath(sDocid);
			return this.getPromise(sPath);
		},
		deleteShippingHU: function () {
			var oURLParameters = ODataHelper.getDeleteHUParameters();
			return this.getPromise("/ChangePackMat", CREATE, {}, {
				urlParameters: oURLParameters
			});
		},
		getRuntimeEnvironment: function () {
			return this.getPromise("/RuntimeEnvSet");
		},

		getWarehousePackingModes: function () {
			return this.getPromise("/PackModeSet");
		},

		getApplicationFeatures: function () {
			return this.getPromise("/ApplicationFeaturesSet");
		},

		terminateSession: function () {
			var oHeader = {
				"sap-terminate": "session"
			};
			return this.getPromise("/LeavePackStation", CREATE, {}, {}, oHeader);
		},
		getAudiosList: function () {
			var sWarehouseNumber = Global.getWarehouseNumber();
			var sWorkstation = Global.getPackStation();
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouseNumber);
			var oWorkstationFilter = new Filter("EWMWorkCenter", FilterOperator.EQ, sWorkstation);
			var oBinFilter = new Filter("EWMStorageBin", FilterOperator.EQ, "");
			return this.getPromise("/AudioURISet", READ, {}, {
				filters: [oWarehouseNumberFilter, oWorkstationFilter, oBinFilter]
			});
		},
		getOpenShippingHU: function () {
			var sWarehouseNumber = Global.getWarehouseNumber();
			var sWorkstation = Global.getPackStation();
			var sBin = Global.getBin();
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouseNumber);
			var oWorkstationFilter = new Filter("EWMWorkCenter", FilterOperator.EQ, sWorkstation);
			var oBinFilter = new Filter("EWMStorageBin", FilterOperator.EQ, sBin);
			var oIsPickHuFilter = new Filter("IsPickHu", FilterOperator.EQ, false);

			return this.getPromise("/HUSet", READ, {}, {
				filters: [oWarehouseNumberFilter, oWorkstationFilter, oBinFilter, oIsPickHuFilter],
				urlParameters: {
					"$expand": "Items"
				}
			});
		},
		triggerHuPrint: function (aHus) {
			var aPromises = aHus.map(function (oHu) {
				return this.getPromise("/Print", CREATE, {}, {
					urlParameters: ODataHelper.getPrintParameters(oHu)
				});
			}, this);
			return Promise.all(aPromises);
		},

		print: function () {
			var currentShipHu = Global.getCurrentShipHandlingUnit();
			return this.printAll(currentShipHu);
		},

		printAll: function (sHuid) {
			var aHus = ODataHelper.getShipHandlingUnitsForPrint().filter(oHu => oHu.TrackNum === "");
			if (sHuid !== undefined && sHuid !== "") {
				aHus = aHus.filter(oHu => oHu.Huid === sHuid);
			}
			var aPromises = aHus.map(function (oHu) {
				return this.getPromise("/CheckTrackNumberRequirement", READ, {}, {
					urlParameters: ODataHelper.getPrintParametersByHuid(oHu.Huid)
				});
			}, this);
			return Promise.all(aPromises);
		},

		setChangeGroups: function (mGroups) {
			_oModel.setChangeGroups(mGroups);
		},

		setDeferredGroups: function (aGroups) {
			_oModel.setDeferredGroups(aGroups);
		},

		updateTrackingNumbers: function (aHandlinUnits) {
			var aHuData = aHandlinUnits.map(function (oHu) {
				return ODataHelper.getUpdateTrackingParameters(oHu.Huid, oHu.TrackNum);
			});
			var aPromises = aHuData.map(function (oHu) {
				return new Promise(function (resolve, reject) {
					// this.getPromise("/UpdateTrackNumber", CREATE, {
					// 	groupId: "upd" + oHu.Huid,
					// }, {
					// 	urlParameters: oHu
					// })
					// 	.then(function (oData) {
					// 		resolve({
					// 			data: oData,
					// 			error: null
					// 		});
					// 	})
					// 	.catch(function (oError) {
					// 		resolve({
					// 			data: null,
					// 			error: oError
					// 		})
					// 	});



					this.getPromise("/UpdateTrackNumber", CREATE, {}, {
						urlParameters: oHu,
						groupId: "update_trackNos"
					})
						.then(function (oData) {
							resolve({
								data: oData,
								error: null
							});
						})
						.catch(function (oError) {
							resolve({
								data: null,
								error: oError
							})
						});




				}.bind(this));
				// return this.getPromise("/UpdateTrackNumber", CREATE, {}, {
				// 	urlParameters: oHu,
				// 	groupId: "trackSet"
				// });
			}, this);
			return Promise.all(aPromises);
		},

		getItemWeight: function (sSourceId, sSourceType) {
			if (Util.isEmpty(sSourceId)) {
				sSourceId = Global.getSourceId();
				sSourceType = Global.getSourceType();
			}
			var sWarehouseNumber = Global.getWarehouseNumber();
			var sWorkstation = Global.getPackStation();
			var sBin = Global.getBin();
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouseNumber);
			var oWorkstationFilter = new Filter("EWMWorkCenter", FilterOperator.EQ, sWorkstation);
			var oBinFilter = new Filter("EWMStorageBin", FilterOperator.EQ, sBin);
			var oSourceIdFilter = new Filter("SourceId", FilterOperator.EQ, sSourceId);
			var oSourceTypeFiler = new Filter("SourceType", FilterOperator.EQ, sSourceType);
			var oDestMatFilter = new Filter("PackagingMaterial", FilterOperator.EQ, ODataHelper.getPackageMaterial());
			return this.getPromise("/HUItemWeightSet", READ, {}, {
				filters: [oWarehouseNumberFilter, oWorkstationFilter, oBinFilter, oSourceIdFilter, oSourceTypeFiler, oDestMatFilter]
			});
		},
		getWorkCenterSet: function () {
			var sWarehouseNumber = Global.getWarehouseNumber();
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouseNumber);
			return this.getPromise("/SearchHelpWorkCenterSet", READ, {}, {
				filters: [oWarehouseNumberFilter]
			});
		},
		getStorageBinSet: function () {
			var sWarehouseNumber = Global.getWarehouseNumber();
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, sWarehouseNumber);
			return this.getPromise("/SearchHelpBinSet", READ, {}, {
				filters: [oWarehouseNumberFilter]
			});
		},
		getRateShops: function (sCarrierId) {
			var oCarrierFilter = new Filter("Carrier", FilterOperator.EQ, sCarrierId);
			return this.getPromise("/RateShopSet", READ, {}, {
				filters: [oCarrierFilter]
			});
		}
	};
});