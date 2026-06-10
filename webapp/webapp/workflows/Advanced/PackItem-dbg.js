sap.ui.define([
	"com/sz/packoutbdlv/workflows/MixedWorkFlow",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/utils/Const",
	"com/sz/packoutbdlv/modelHelper/Message",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/modelHelper/SerialNumber",
	"com/sz/packoutbdlv/service/ODataService",
	"com/sz/packoutbdlv/modelHelper/Cache"
], function (WorkFlow, Util, Const, Message, Global, SerialNumber, Service, Cache) {
	"use strict";
	return function (oSourceController, oShipController) {
		var oWorkFlow = new WorkFlow()
			.then(function (oPackInfo, mSession) {
				mSession.sAlterQuan = JSON.parse(JSON.stringify(oPackInfo.oProduct.AlterQuan));
				mSession.sBaseQuan = JSON.parse(JSON.stringify(oPackInfo.oProduct.Quan));
				mSession.oProduct = JSON.parse(JSON.stringify(oPackInfo.oProduct));
				mSession.oPackProduct = oPackInfo.oProduct;
				mSession.SnList = mSession.oProduct.SnList;
				mSession.IuidList = mSession.oProduct.IuidList;
			}, oSourceController, "disable ui interaction")
			.then(function (preResult, mSession) {
				if (!Util.isEmpty(mSession.oProduct.SerialNumberRequiredLevel)) {
					var bSerialValidation = Global.getSerialNumberValidationFeature();
					if (!(mSession.oProduct.SerialNumberRequiredLevel === Const.SN_DOC_LEVEL_PROFILE_A && mSession.oProduct.EWMDeliveryDocumentCategory !== Const.DOCUMENT_CAT_OUTBOUND)) {
						if (!((this.oItemHelper.getItemCountByProduct(mSession.oProduct.ProductName) === 1 && !bSerialValidation ) && mSession.oProduct.SerialNumberRequiredLevel === Const.SERIAL_NUMBER_STOCK_LEVEL)) {
							if (this.oItemHelper.isReductionFirstItem()) {
								var iRatio = this.oItemHelper.getAlternativeUOMRatio(mSession.oProduct);
								var iReductAlterQuan = Util.parseNumber(this.oItemHelper.getItemReductionQtyByIndex(0));
								mSession.oPackProduct.QuanDefault = mSession.oProduct.Quan;
								var sBaseQuantity = (iReductAlterQuan * iRatio).toString();
								this.oItemHelper.setItemReductBaseQuanByIndex(0, sBaseQuantity);
							}
							var oDialog = this.getSerialNumberDialog();
							mSession.bManualAssignSn = true;
							return this.openDialog(oDialog);
						}
					}
				}
			}, oSourceController, "open serial number dialog in need")
			.then(function (preResult, mSession) {
				mSession.oProduct.AlterQuan = this.oItemHelper.getItemReductionQtyByIndex(0);
			}, oSourceController, "set product packing quantity")
			.then(function (preResult, mSession) {
				if (!Util.isEmpty(mSession.oProduct.SerialNumberRequiredLevel) && mSession.bManualAssignSn === true) {
					var sPackSnList = SerialNumber.convertSerialNumbersToString();
					if (mSession.oProduct.isIuidActive === Const.ABAP_TRUE) { //IUID active
						mSession.oProduct.IuidList = SerialNumber.getPackedUiis(
							mSession.oProduct.SnList.split(" "),
							mSession.oProduct.IuidList.split(" "),
							sPackSnList.split(" "));
					}
					mSession.oProduct.SnList = sPackSnList;
				}
			}, oSourceController, "get user input serial numbers")
			.then(function () {
				return this.updateItemWeightInNeed();
			}, oSourceController, "check if there exists source item which is not in ItemWeight")
			.then(function (preResult, mSession) {
				if (Util.parseNumber(mSession.oProduct.QtyReduced) !== 0) {
					mSession.fPackQuantity = Util.parseNumber(mSession.oProduct.AlterQuan);
				}
			}, oSourceController, "check order reduction case")
			.service(function (preResult, mSession) {
				mSession.newSnList = mSession.oProduct.SnList;
				mSession.newIuidList = mSession.oProduct.IuidList;
				mSession.actualPackQuantity = mSession.oProduct.AlterQuan;
				this.setBusy(true);
				return Service.pack(mSession.oProduct, mSession.fPackQuantity);
			}, oSourceController, "pack item")
			.then(function (preResult, mSession) {
				mSession.sStockItemUUID = preResult ? preResult.StockItemUUID : "";
				if (!Util.isEmpty(preResult)) {
					mSession.oProduct = this.getNewItemWithPartialQuantity(mSession.oProduct, preResult);
				}
				this.setBusy(false);
				this.oItemHelper.deleteItem(mSession.oPackProduct);
				Global.setProductId("");
				Global.setExceptionEnable(false);
			}, oSourceController, "remove item from the source table")
			.then(function () {
				this.unbindProductInfo();
				this.unbindImage();
			}, oSourceController, "unbind product info")
			.then(function () {
				this.unbindODOInfo();
				this.focus(Const.ID.PRODUCT_INPUT);
				if (!this.oItemHelper.isEmpty()) {
					this.oItemHelper.setItemsStatusByConsGrp();
					this.bindODOInfo();
				}
			}, oSourceController, "update odo info")
			.then(function (preResult, mSession) {
				if ((mSession.oProduct.SerialNumberRequiredLevel === Const.SN_DOC_LEVEL_PROFILE_A && mSession.oProduct.EWMDeliveryDocumentCategory === Const.DOCUMENT_CAT_OUTBOUND) ||
					mSession.oProduct.SerialNumberRequiredLevel === Const.SN_DOC_LEVEL_PROFILE_B) {
					this.oItemHelper.removeSerialNumberFromOtherItems(mSession.oProduct.ProductName, SerialNumber.getAllSerialNumerKeys());
				}
			}, oSourceController, "remove serial number from other items")
			.then(function (preResult, mSession) {
				this.updateInputWithDefault(Const.ID.SHIP_INPUT, "");
				mSession.bShipHUEmptyBeforePack = this.oItemHelper.isEmpty();
			}, oShipController)
			.syncOnly(function (preResult, mSession) {
				if (Util.parseNumber(mSession.oProduct.AlterQuan) !== 0) {
					this.oItemHelper.updateItem(mSession.oProduct);
				}
			}, oShipController, "add item in the ship table")
			.asyncOnly(function (preResult, mSession) {
				if (Util.parseNumber(mSession.oProduct.AlterQuan) !== 0) {
					if (Util.isAbapTrue(mSession.oProduct.isSplit)) {
						this.oItemHelper.addItemWithoutMerge(mSession.oProduct);
					} else {
						var sChangeId = this.oItemHelper.getItemStockIdByOriginalId(mSession.oProduct.StockItemUUID);
						mSession.oProduct = this.oItemHelper.updateItemStockId(mSession.oProduct, sChangeId);
						this.oItemHelper.addItem(mSession.oProduct, true);
					}
				}
			}, oShipController, "add item in the ship table")
			.then(function (preResult, mSession) {
				if (Util.parseNumber(mSession.oProduct.QtyReduced) !== 0) {
					this.oItemHelper.setItemQtyReducedInitialized();
				}
			}, oShipController)
			.then(function (preResult, oParam) {
				var fLoadingWeight = this.getLoadingWeightInCurrentShipHandlingUnit();
				var sUOM = this.getWeightUOMInCurrentShipHandlingUnit();
				this.updateNetWeightRelated(fLoadingWeight, sUOM);
				this.clearGrossWeight();
			}, oShipController, "update weight chart, color and text")
			.asyncOnly(function (preResult, mSession) {
				this.oItemHelper.updateHighlightStatus(mSession.oProduct, sap.ui.core.MessageType.None);
				this.oItemHelper.updatePendingStatus(mSession.oProduct, true);
				this.handleUnpackEnable();
			}, oShipController)
			.then(function () {
				this.dehilightShipHandlingUnits();

			}, oShipController)
			.then(function (preResult, mSession) {
				if (mSession.bShipHUEmptyBeforePack) {
					Cache.updateShipHUConsGroup(Global.getCurrentShipHandlingUnit(), mSession.oProduct.EWMConsolidationGroup);
				}
				this.setBusy(false);
			}, oShipController, "update the status of the first item in the ship table ")
			.syncOnly(function () {
				this.oItemHelper.setItemsStatusToNone();
				this.oItemHelper.setItemHighlightByIndex(0);
				this.handleUnpackEnable();
			}, oShipController)
			.serviceCallback(function (preResult, mSession) {
				//todo TBD may split when former partial item exist
				mSession.sStockItemUUID = preResult.StockItemUUID;
				this.oItemHelper.updateItemStockIdByKey(mSession.oProduct.StockItemUUID, mSession.sStockItemUUID);
				this.oItemHelper.setItemsStatusToNone();
				this.oItemHelper.updateHighlightStatus(mSession.oProduct, sap.ui.core.MessageType.Success);
				this.oItemHelper.updatePendingStatus(mSession.oProduct, false);
				oWorkFlow.getAsyncPromise().then(function () {
						this.handleUnpackEnable();
					}.bind(this))
					.then(function () {
						this.handlePackAllEnable();
					}.bind(oSourceController));
			}, oShipController)
			.then(function (preResult, oParam) {
				this.clearPackingInstr();
			}, oShipController, "update packing info")
			.then(function (preResult, oParam) {
				this.updateCacheIsEmptyHU();
			}, oShipController, "update cache")
			.syncOnly(function (preResult, mSession) {
				this.handlePackAllEnable();
			}, oSourceController, "handle pack all enable")
			.then(function (preResult, mSession) {
				this.delayCalledAdjustContainerHeight();
			}, oShipController)
			.then(function() {
				var sShipHU = Global.getCurrentShipHandlingUnit();
				if (sShipHU !== "") {
					this.getWorkFlowFactory().getShipHUSelectionWorkFlow().run(sShipHU);
				}
			}, oShipController);

		oWorkFlow
			.errors()
			.default(function (sError, vPara, mSession, bCustomError) {
				if (bCustomError) {
					this.showErrorMessagePopup(sError);
				}
			}, oSourceController)
			.always(function (sError, vParam, mSession) {
				if (Global.getAsyncMode()) {
					var oShipItem = this.oItemHelper.getItemByKey(mSession.oProduct.StockItemUUID);
					mSession.oUnpackItem = JSON.parse(JSON.stringify(oShipItem));
					if (oShipItem.AlterQuan === mSession.actualPackQuantity) {
						this.oItemHelper.deleteItem(oShipItem);
					} else {
						this.oItemHelper.updateItemQuantity(oShipItem, mSession.sAlterQuan, true);
						this.oItemHelper.updatePendingStatus(mSession.oProduct, false);
						this.oItemHelper.setItemsStatusToNone();
						this.oItemHelper.updateHighlightStatus(mSession.oProduct, sap.ui.core.MessageType.Success);
						mSession.oUnpackItem.AlterQuan = mSession.sAlterQuan;
						if (!Util.isEmpty(mSession.oProduct.SerialNumberRequiredLevel)) {
							var aSnList = this.oItemHelper.parseSerialNumber(mSession.newSnList);
							this.oItemHelper.removeSerialNumberFromItem(aSnList, oShipItem);
							if (mSession.oProduct.isIuidActive === Const.ABAP_TRUE) {
								this.oItemHelper.removeIuidFromItem(oShipItem, mSession.newIuidList);
							}
						}
					}
					var fLoadingWeight = this.getLoadingWeightInCurrentShipHandlingUnit();
					var sUOM = this.getWeightUOMInCurrentShipHandlingUnit();
					this.updateNetWeightRelated(fLoadingWeight, sUOM);

					if (!Util.isEmpty(mSession.oProduct.SerialNumberRequiredLevel)) {
						mSession.oUnpackItem.SnList = mSession.SnList;
						mSession.oUnpackItem.IuidList = mSession.IuidList;
					}
					this.handleUnpackEnable();
					Global.setExceptionEnable(true);
				}
			}, oShipController)
			.always(function (sError, vParam, mSession) {
				if (Global.getAsyncMode()) {
					this.oItemHelper.addItem(mSession.oUnpackItem);
					this.oItemHelper.setItemsStatusByConsGrp();
					this.oItemHelper.setItemHighlightByIndex(0);
					this.handlePackAllEnable();
				} else {
					mSession.oPackProduct.AlterQuan = mSession.sAlterQuan;
					mSession.oPackProduct.Quan = mSession.sBaseQuan;
				}
				this.setBusy(false);
				this.focus(Const.ID.PRODUCT_INPUT);
				this.playAudio(Const.ERROR);
			}, oSourceController);
		return oWorkFlow;

	};
});