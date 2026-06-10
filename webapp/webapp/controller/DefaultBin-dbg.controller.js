sap.ui.define([
	"com/sz/packoutbdlv/controller/WorkFlowController",
	"sap/m/MessageBox",
	"com/sz/packoutbdlv/service/ODataService",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/modelHelper/Material",
	"sap/ui/model/json/JSONModel",
	"com/sz/packoutbdlv/utils/Const",
	"com/sz/packoutbdlv/modelHelper/PackingMode",
	"com/sz/packoutbdlv/model/PackingMode",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/sz/packoutbdlv/utils/CustomError"
], function (Controller, MessageBox, Service, Global, Util, Material, JSONModel, Const, PackingModeHelper, PackingMode, Filter,
	FilterOperator, CustomError) {
	"use strict";
	var startPackingId = "start-packing-button";
	var dummyId = "dummy-input";
	var audioId = "audio-player";
	var workCenterInputId = "pod---defaultbin--workcenter--input";
	var storageBinInputId = "pod---defaultbin--storagebin--input";
	var featureSelectionId = "feature-selection";
	return Controller.extend("com.sz.packoutbdlv.controller.DefaultBin", {
		sRouteName: "default",
		init: function () {
			this.setModel(PackingMode, "packingMode");
			this.initBinOnSapEnter();
			this.setBusy(true);
			var oRunTimePromise = Service.getRuntimeEnvironment()
				.then(function (aResult) {
					if (Util.isEmpty(Global.getWarehouseNumber())) {			
						if (aResult[0].EWMWarehouse && aResult[0].EWMWarehouse !== "") {
							Global.setWarehouseNumber(aResult[0].EWMWarehouse);
						} else {
							this.displayWarehouseMissedMessage();
						}
					} else {
						//delay purpose, otherwise view not attached yet.
						this.bindAudioAggregation();
					}					
					Global.setSelectedFeatureSet(aResult[0].PackMode);
					Global.setIsOnCloud(aResult[0].IsS4Cloud);
					if (!aResult[0].IsS4Cloud && PackingModeHelper.getSelectedMode() !== Const.INTERNAL_MODE) {
						this.initPackingModeModel();
					}
				}.bind(this));
			var oPersonalizationPromise = this.initPersonalizationService();
			this.setButtonToolTip("start-packing-button");
			return Promise.all([oRunTimePromise, oPersonalizationPromise])
				.then(function () {
					this.setBusy(false);
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
				}.bind(this));
		},

		onRouteMatched: function (oParameter) {
			this.getOwnerComponent().getShellUIService().setBackNavigation();
		},

		bindWorkCenter: function (sWorkStation) {
			this.byId(workCenterInputId).bindElement({
				path: "/PackingStationSet(EWMWarehouse='" + Global.getWarehouseNumber() + "',EWMWorkCenter='" + sWorkStation + "',EWMStorageBin='')"
			});
		},

		bindStorageBin: function (sWorkStation) {
			this.byId(storageBinInputId).bindElement({
				path: "/PackingStationSet(EWMWarehouse='" + Global.getWarehouseNumber() + "',EWMWorkCenter='" + sWorkStation + "',EWMStorageBin='')"
			});
		},

		initPackingMode: function () {
			var vPackMode = this.getOwnerComponent().getComponentData().startupParameters.PackMode;
			if (Util.isEmpty(vPackMode)) {
				vPackMode = Const.PACK_MODE.OUTBOUND;
			} else {
				vPackMode = parseInt(vPackMode[0], 10);
			}
			Service.setOdataHeader(vPackMode);
			//todo may support simple mode in the future
			if (vPackMode === Const.PACK_MODE.OUTBOUND) {
				var sPackingMode = this.getDefaultPackingModeForOutbound();
				PackingModeHelper.setSelectedMode(sPackingMode);
				this.byId("mode-selection").setSelectedKey(sPackingMode);
			} else {
				PackingModeHelper.setSelectedMode(Const.INTERNAL_MODE);
			}
		},

		displayWarehouseMissedMessage: function () {
			var sMessage = this.getI18nText("specifyWorkCenter");
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.error(
				sMessage, {
				styleClass: bCompact ? "sapUiSizeCompact" : ""
			}
			);
		},

		initSubscription: function () {
			this.subscribe(Const.EVENT_BUS.CHANNELS.USER_SETTING, Const.EVENT_BUS.EVENTS.WAREHOUSE_CHANGED, function () {
				this.byId(startPackingId).setEnabled(false);
				this.updateInputWithDefault(workCenterInputId, "");
				this.updateInputWithDefault(storageBinInputId, "");
				this.bindAudioAggregation();
				if (Util.isEmpty(Global.getWarehouseNumber())) {
					this.displayWarehouseMissedMessage();
					// this.oWorkCenterModel.setData([]);
					// this.oStorageBinModel.setData([]);
				}
			}.bind(this));
		},

		initModel: function () {
			// this.initWorkCenterColModel();
			// this.initStorageBinColModel();
		},

		isInTextAndIdFormat: function (sValue) {
			if (sValue.length < 6)
				return false;

			var lastFive = sValue.substring(sValue.length - 6, sValue.length - 5);
			if (lastFive !== "(") {
				return false;
			}
			var lastOne = sValue.substring(sValue.length - 1, sValue.length);
			if (lastOne !== ")") {
				return false;
			}
			return true;
		},

		getIdFromTextAndIdFormat: function (sValue) {
			return sValue.substring(sValue.length - 5, sValue.length - 1);

		},

		initWorkCenterModel: function () {
			var oWorkCenterItems = [];
			this.setBusy(true);
			this.oWorkCenterModel = new sap.ui.model.json.JSONModel();
			Service.getWorkCenterSet()
				.then(function (oResults) {
					oResults.forEach(function (oResult) {
						var oWorkCenter = {
							WorkCenter: oResult.Workstation,
							Desc: oResult.Description
						};
						oWorkCenterItems.push(oWorkCenter);
					});
					this.oWorkCenterModel.setData(oWorkCenterItems);
					this.setBusy(false);
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
				}.bind(this));
		},

		initStorageBinModel: function () {
			var oStorageBinItems = [];
			this.setBusy(true);
			this.oStorageBinModel = new sap.ui.model.json.JSONModel();
			Service.getStorageBinSet()
				.then(function (oResults) {
					oResults.forEach(function (oResult) {
						var oStorageBin = {
							StorageBin: oResult.EWMStorageBin,
							StorageType: oResult.EWMStorageType
						};
						oStorageBinItems.push(oStorageBin);
					});
					this.oStorageBinModel.setData(oStorageBinItems);
					this.setBusy(false);
				}.bind(this))
				.catch(function () {
					this.setBusy(false);
				}.bind(this));
		},

		initWorkCenterColModel: function () {
			this.oWorkCenterColModel = new sap.ui.model.json.JSONModel();
			var sWorkCenter = this.getI18nText("workCenter");
			var sWorkCenterDesc = this.getI18nText("workCenterDesc");
			this.oWorkCenterColModel.setData({
				cols: [{
					label: sWorkCenter,
					template: Const.WORKCENTER_KEY
				}, {
					label: sWorkCenterDesc,
					template: Const.WORKCENTER_DESC
				}]
			});
		},

		initStorageBinColModel: function () {
			this.oStorageBinColModel = new sap.ui.model.json.JSONModel();
			var sStorageBin = this.getI18nText("storageBin");
			var sStorageType = this.getI18nText("storageType");
			this.oStorageBinColModel.setData({
				cols: [{
					label: sStorageBin,
					template: Const.STORAGEBIN_KEY
				}, {
					label: sStorageType,
					template: Const.STORAGE_TYE
				}]
			});
		},

		initTableBinding: function (oDialog) {
			var oTable = oDialog.getTable();
			if (oTable.bindRows) {
				oTable.bindRows("/");
			}
			if (oTable.bindItems) {
				oTable.bindAggregation("items", "/", function (sId, oContext) {
					var aCols = oTable.getModel("columns").getData().cols;
					return new sap.m.ColumnListItem({
						cells: aCols.map(function (column) {
							var colname = column.template;
							return new sap.m.Label({
								text: "{" + colname + "}"
							});
						})
					});
				});
			}
		},

		initPackingModeModel: function () {
			var sAdvancedPacking = this.getI18nText("advancedMode");
			var sBasicPacking = this.getI18nText("basicMode");
			var sInternalPacking = this.getI18nText("internalMode");
			var aModeData = [{
				"key": Const.ADVANCED_MODE,
				"text": sAdvancedPacking
			}];
			var oBasicMode = {
				"key": Const.BASIC_MODE,
				"text": sBasicPacking
			};
			if (!Global.isOnCloud()) {
				aModeData.push(oBasicMode);
			}

			PackingModeHelper.setModes(aModeData);
		},
		getDefaultPackingModeForOutbound: function () {
			var sDefaultPackMode = this.oContainer.getItemValue("packingMode");
			if (Util.isEmpty(sDefaultPackMode)) {
				sDefaultPackMode = Const.ADVANCED_MODE;
			} else if (sDefaultPackMode !== Const.ADVANCED_MODE && sDefaultPackMode !== Const.BASIC_MODE) {
				sDefaultPackMode = Const.ADVANCED_MODE;
			}
			return sDefaultPackMode;
		},
		initPersonalizationService: function () {
			this.oPersonalizationService = this.getPersonalizationService();
			return new Promise(function (resolve, reject) {
				var sContainer = this.getContainerId();
				this.oPersonalizationService.getContainer(sContainer)
					.fail(function () {
						this.oPersonalizationService.createEmptyContainer(sContainer)
							.done(function (oContainer) {
								this.oContainer = oContainer;
								resolve();
							}.bind(this));
					}.bind(this))
					.done(function (oContainer) {
						this.oContainer = oContainer;
						resolve();
					}.bind(this));
			}.bind(this))
				.then(function () {
					return this.initDisplayedValue();
				}.bind(this));
		},

		initDisplayedValue: function () {
			this.initPackingMode();
			var sDisplayedValue = "";
			sDisplayedValue = this.oContainer.getItemValue("workCenter");
			this.byId(startPackingId).setEnabled(false);
			this.bindWorkCenter("");
			this.bindStorageBin("");
			if (!Util.isEmpty(Global.getWarehouseNumber()) && !Util.isEmpty(sDisplayedValue)) {
				return this.verifyWorkCenter(sDisplayedValue, true);
			}

		},

		initBinOnSapEnter: function() {
			this.getView().byId("pod---defaultbin--storagebin--input")
				.attachInnerControlsCreated(function(oEvent) {
					var oControl = oEvent.getSource().getInnerControls()[0];
					var onEnterFn = oControl.onsapenter.bind(oControl);
					var newFn = function() {
						onEnterFn();
						var value = oControl.getValue();
						if (value.trim() === "") {
							this.onStartPacking();
						}
					}.bind(this);
					oEvent.getSource().getInnerControls()[0].onsapenter = newFn;
			}.bind(this));
		},

		onVerifyWorkCenter: function (sValue) {
			var oInput = this.byId(workCenterInputId);
			if (sValue.length > 4) {
				this.handleEntryLengthExceed(oInput);
				return;
			}
			if (!Util.isEmpty(sValue)) {
				this.verifyWorkCenter(sValue)
					.then(function () {
						this.setBusy(false);
					}.bind(this))
					.catch(function () {
						this.setBusy(false);
					}.bind(this));
			} else {
				Global.setPackStation("");
			}
		},
		onWorkCenterChange: function (oEvent) {
			this.byId(startPackingId).setEnabled(false);
			this.focusDummyElement();
			var sValue = Util.trim(oEvent.getParameter("newValue")).toUpperCase();
			if (this.isInTextAndIdFormat(sValue)) {
				sValue = this.getIdFromTextAndIdFormat(sValue);
			}
			this.onVerifyWorkCenter(sValue);

		},
		handleEntryLengthExceed: function (oInput) {
			var sError = this.getI18nText("workCenterMaximunCharacters");
			this.updateInputWithError(oInput, sError);
			this.playAudio(Const.ERROR);
			oInput.focus();
		},
		verifyWorkCenter: function (sValue, bBindWorkCenter) {
			//sValue is the 4 digits number.
			var oInput = this.byId(workCenterInputId);
			var sDefaultBin = "";
			this.setBusy(true);
			return Service.verifyWorkCenter(sValue)
				.then(function (oResult) {
					if (Util.isEmpty(oResult.EWMWarehouse) || Util.isEmpty(oResult.EWMWorkCenter)) {
						throw new Error();
					} else {
						Global.setWarehouseNumber(oResult.EWMWarehouse);
						Global.setPackStation(oResult.EWMWorkCenter);
						Global.setScaleEnabled(oResult.ScaleEnabled);
						Global.setAsyncMode(!!oResult.IsUIAsync);
						if (bBindWorkCenter) {
							this.bindWorkCenter(oResult.EWMWorkCenter.toUpperCase());
						}
						this.bindStorageBin(oResult.EWMWorkCenter.toUpperCase());
						sDefaultBin = oResult.EWMStorageBin;
					}
				}.bind(this))
				.then(function () {
					if (!Util.isEmpty(sDefaultBin)) {
						Global.setBin(sDefaultBin);
						this.updateInputWithDefault(storageBinInputId, sDefaultBin);
						if (!Util.isEmpty(this.byId("mode-selection").getSelectedKey()) || PackingModeHelper.getSelectedMode() === Const.INTERNAL_MODE) {
							this.byId(startPackingId).setEnabled(true);
						}
					} else {
						var oStorageInput = this.byId(storageBinInputId);
						var sStorageInput = oStorageInput.getValue();
						if (!Util.isEmpty(sStorageInput)) {
							oStorageInput.fireChange({
								newValue: sStorageInput
							});
						} else {
							this.updateInputWithDefault(oStorageInput, "");
							this.byId(startPackingId).setEnabled(true);
						}
					}
					this.focus(storageBinInputId);
				}.bind(this))
				.catch(function (oError) {
					this.setBusy(false);
					this.byId(startPackingId).setEnabled(false);
					if (Util.isEmpty(oError._vPara)) {
						var sError = this.getI18nText("incorrectWorkCenter", sValue);
						this.updateInputWithError(oInput, sError);
					} else {
						this.updateInputWithError(oInput, oError._vPara.MsgVar);
					}
					Global.setPackStation("");
					this.playAudio(Const.ERROR);
					oInput.focus();
				}.bind(this));
		},
		onWorkCenterSubmit: function (oEvent) {
			var sValue = Util.trim(oEvent.getParameter("value")).toUpperCase();
			this.onVerifyWorkCenter(sValue);
		},
		onStorageBinVerify: function (sValue) {
			var oWorkCenterInput = this.byId(workCenterInputId);
			var sWorkCenter = Global.getPackStation();
			var oInput = this.byId(storageBinInputId);
			if (Util.isEmpty(sWorkCenter)) {
				oWorkCenterInput.focus();
				this.updateInputWithDefault(oInput, sValue);
				return;
			}

			if (sValue.length > 18) {
				this.updateInputWithError(oInput);
				this.playAudio(Const.ERROR);
				oInput.focus();
				return;
			}
			if (!Util.isEmpty(sValue)) {
				this.verifyStorageBin(sValue);
			} else {
				Global.setBin("");
				this.byId(startPackingId).setEnabled(true);
			}
		},
		onStorageBinChange: function (oEvent) {
			this.byId(startPackingId).setEnabled(false);
			this.focusDummyElement();
			var sValue = Util.trim(oEvent.getParameter("newValue")).toUpperCase();
			this.onStorageBinVerify(sValue);
		},
		verifyStorageBin: function (sValue) {
			var oInput = this.byId(storageBinInputId);
			this.setBusy(true);
			return Service.verifyStorageBin(sValue)
				.then(function (oResult) {
					this.setBusy(false);
					Global.setBin(oResult.EWMStorageBin);
					this.updateInputWithDefault(oInput, sValue);
					if (!Util.isEmpty(this.byId("mode-selection").getSelectedKey()) || PackingModeHelper.getSelectedMode() === Const.INTERNAL_MODE) {
						this.byId(startPackingId).setEnabled(true);
					}
					oInput.focus();
				}.bind(this))
				.catch(function (oError) {
					this.setBusy(false);
					if (Util.isEmpty(oError._vPara)) {
						var sError = this.getI18nText("incorrectStorageBin", sValue);
						this.updateInputWithError(oInput, sError);
					} else {
						this.updateInputWithError(oInput, oError._vPara.MsgVar);
					}
					this.playAudio(Const.ERROR);
					oInput.focus();
				}.bind(this));
		},
		onStorageBinSubmit: function (oEvent) {
			var sValue = Util.trim(oEvent.getParameter("value")).toUpperCase();
			this.onStorageBinVerify(sValue);
		},

		onStartPacking: function (oEvent) {
			var sWorkCenter = Global.getPackStation();
			var sStorageBin = this.byId(storageBinInputId).getValue();
			Global.setBin(sStorageBin);
			var sMode = PackingModeHelper.getSelectedMode();

			this.setBusy(true);
			Service.getMaterialAndExceptionList()
				.then(function (aResults) {
					if (aResults[0].length === 0) {
						throw new CustomError(Const.ERRORS.NO_MATERIAL);
					} else {
						Material.setData(aResults[0]);
					}
					Global.setExceptionList(aResults[1]);
				}.bind(this))
				// .then(function () {
				// 	var vPackMode = Global.getSelectedFeatureSet();
				// 	Service.getApplicationFeatures().then(function (aFeatures) {
				// 		Global.setApplicationFeatures(vPackMode, aFeatures);
				// 	}.bind(this))
				// }.bind(this))
				.then(function () {
					this.oContainer.setItemValue("workCenter", sWorkCenter);
					this.oContainer.setItemValue("storageBin", sStorageBin);
					if (PackingModeHelper.getSelectedMode() !== Const.INTERNAL_MODE) {
						this.oContainer.setItemValue("packingMode", sMode);
					}
					return this.oContainer.save();
				}.bind(this))
				.then(function () {
					var oRouter = this.getRouter();
					if (sMode === Const.ADVANCED_MODE) {
						oRouter.navTo(Const.ADVANCED_ROUTE_NAME);
					} else if (sMode === Const.BASIC_MODE) {
						if (Material.getFavoriteMaterials().length === 0) {
							throw new CustomError(Const.ERRORS.NO_FAVORITE_MATERIAL);
						} else {
							oRouter.navTo(Const.BASIC_ROUTE_NAME);
						}
					} else {
						oRouter.navTo(Const.INTERNAL_ROUTE_NAME);
					}
				}.bind(this))
				.then(function () {
					this.setBusy(false);
				}.bind(this))
				.catch(function (oError) {
					if (Util.isEmpty(oError._vPara)) {
						if (oError._sKey === Const.ERRORS.NO_MATERIAL) {
							var sErrorMessage = this.getI18nText("noMaterialInWarehouse", Global.getWarehouseNumber());
							this.showErrorMessageBox(sErrorMessage);
						} else if (oError._sKey === Const.ERRORS.NO_FAVORITE_MATERIAL) {
							var sError = this.getI18nText("noFavoriteMaterialInWorkCenter", Global.getPackStation());
							this.showErrorMessageBox(sError);
						}
					}
					this.setBusy(false);
				}.bind(this));
		},

		onDefaultInputLiveChanged: function () {
			this.byId(startPackingId).setEnabled(false);
		},
		focusDummyElement: function () {
			this.byId(dummyId).setValue("");
			this.byId(dummyId).focus();
		},
		onPackingModeChange: function (oEvent) {
			var oElement = this.byId("mode-selection");
			var sNewKey = oElement.getSelectedKey();
			PackingModeHelper.setSelectedMode(sNewKey);
			var sWorkCenter = Global.getPackStation();
			var sStorageBin = Global.getBin();
			if (!Util.isEmpty(sWorkCenter) && !Util.isEmpty(sStorageBin)) {
				this.byId(startPackingId).setEnabled(true);
			}
		},
		bindAudioAggregation: function () {
			var oAudioView = this.getAudioParent(this.oView);
			var oWarehouseNumberFilter = new Filter("EWMWarehouse", FilterOperator.EQ, Global.getWarehouseNumber());
			oAudioView.getController().bindAudioList([oWarehouseNumberFilter]);
		},
		getAudioParent: function (oView) {
			if (oView.byId && oView.byId(audioId)) {
				this.oAudio = oView;
			} else {
				this.getAudioParent(oView.getParent());
			}
			return this.oAudio;
		},

		createStorageBinFilter: function (oTableBindingItems, fFilterFunc) {
			var aKeys = [Const.STORAGEBIN_KEY, Const.STORAGE_TYE];
			var sStorageBin = this.getI18nText("storageBin");
			var sStorageType = this.getI18nText("storageType");
			var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
				advancedMode: true,
				filterBarExpanded: true,
				showGoOnFB: !sap.ui.Device.system.phone,
				filterGroupItems: [new sap.ui.comp.filterbar.FilterGroupItem({
					groupTitle: "foo",
					groupName: "gn1",
					name: "n1",
					label: sStorageBin,
					control: new sap.m.Input()
				}),
				new sap.ui.comp.filterbar.FilterGroupItem({
					groupTitle: "foo",
					groupName: "gn1",
					name: "n2",
					label: sStorageType,
					control: new sap.m.Input()
				})
				],
				search: function (oEvent) {
					var aFilterValues1 = oEvent.getParameters().selectionSet[0].getProperty("value").toUpperCase();
					var aFilterValues2 = oEvent.getParameters().selectionSet[1].getProperty("value").toUpperCase();
					var aFilterValues = [];
					aFilterValues.push(aFilterValues1);
					aFilterValues.push(aFilterValues2);
					fFilterFunc(oTableBindingItems, aKeys, aFilterValues);
				}
			});

			return oFilterBar;
		},

		createWorkCenterFilter: function (oTableBindingItems, fFilterFunc) {
			var aKeys = [Const.WORKCENTER_KEY, Const.WORKCENTER_DESC];
			var sWorkCenter = this.getI18nText("workCenter");
			var sWorkCenterDesc = this.getI18nText("workCenterDesc");

			var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
				advancedMode: true,
				filterBarExpanded: true,
				showGoOnFB: !sap.ui.Device.system.phone,
				filterGroupItems: [new sap.ui.comp.filterbar.FilterGroupItem({
					groupTitle: "foo",
					groupName: "gn1",
					name: "n1",
					label: sWorkCenter,
					control: new sap.m.Input()
				}),
				new sap.ui.comp.filterbar.FilterGroupItem({
					groupTitle: "foo",
					groupName: "gn1",
					name: "n2",
					label: sWorkCenterDesc,
					control: new sap.m.Input()
				})
				],
				search: function (oEvent) {
					var aFilterValues1 = oEvent.getParameters().selectionSet[0].getProperty("value").toUpperCase();
					var aFilterValues2 = oEvent.getParameters().selectionSet[1].getProperty("value").toUpperCase();
					var aFilterValues = [];
					aFilterValues.push(aFilterValues1);
					aFilterValues.push(aFilterValues2);
					fFilterFunc(oTableBindingItems, aKeys, aFilterValues);
				}
			});

			return oFilterBar;
		},
		filterTable: function (oTableBindingItems, aKeys, aFilterValues) {
			oTableBindingItems.filter(Util.getFilters(aKeys, aFilterValues));
		},

		handleWorkCenterValueHelp: function (oEvent) {
			this.initWorkCenterModel();
			this.creatValueHelpDialog("com.sz.packoutbdlv.view.WorkCenterValueHelpDialog", this.oWorkCenterColModel, this.oWorkCenterModel,
				this.createWorkCenterFilter.bind(this));
		},

		handleStorageBinValueHelp: function (oEvent) {
			this.initStorageBinModel();
			this.creatValueHelpDialog("com.sz.packoutbdlv.view.StorageBinValueHelpDialog", this.oStorageBinColModel, this.oStorageBinModel,
				this.createStorageBinFilter.bind(this));
		},

		creatValueHelpDialog: function (sDialogName, oColModel, oDataModel, fCreateFilter) {
			// create value help dialog
			var oDialog = sap.ui.xmlfragment(
				sDialogName,
				this
			);
			this.getView().addDependent(oDialog);

			//init table
			oDialog.getTable().setModel(oColModel, "columns");
			oDialog.getTable().setModel(oDataModel);

			this.initTableBinding(oDialog);
			var oTableBindingItems = oDialog.getTable().getBinding();

			//init filter bar
			var oFilterBar = fCreateFilter(oTableBindingItems, this.filterTable);
			oDialog.setFilterBar(oFilterBar);

			oDialog.open();
			oDialog.update();
		},

		_handleValueHelpClose: function (oEvent) {
			var oDialog = oEvent.getSource();
			oDialog.close();
		},

		_handleWorkCenterValueHelpOK: function (oEvent) {
			var oDialog = oEvent.getSource();
			var iTokenCount = oEvent.getParameter("tokens").length;
			if (iTokenCount > 0) {
				var oToken = oEvent.getParameter("tokens")[iTokenCount - 1];
				var sSelectedKey = oToken.getKey();
				this.byId(workCenterInputId).setValue(sSelectedKey);
				this.byId(startPackingId).setEnabled(false);
				this.i(sSelectedKey);
			}
			oDialog.close();
		},
		_handleStorageBinValueHelpOK: function (oEvent) {
			var oDialog = oEvent.getSource();
			var iTokenCount = oEvent.getParameter("tokens").length;
			if (iTokenCount > 0) {
				var oToken = oEvent.getParameter("tokens")[iTokenCount - 1];
				var sSelectedKey = oToken.getKey();
				this.byId(startPackingId).setEnabled(false);
				this.byId(storageBinInputId).setValue(sSelectedKey);
				this.onStorageBinVerify(sSelectedKey);
			}
			oDialog.close();
		},

		_handleValueHelpCancle: function (oEvent) {
			var oDialog = oEvent.getSource();
			oDialog.close();
		},

		_handleValueHelpAfterClose: function (oEvent) {
			var oDialog = oEvent.getSource();
			oDialog.destroy();
		},

		formatUpperCase: function (sValue) {
			if (!Util.isEmpty(sValue)) {
				return sValue.toUpperCase();
			} else {
				return "";
			}
		}
	});
});