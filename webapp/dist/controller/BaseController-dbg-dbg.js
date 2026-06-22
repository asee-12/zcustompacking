sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/ValueState",
	"com/sz/packoutbdlv/model/Global",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/modelHelper/SerialNumber",
	"com/sz/packoutbdlv/modelHelper/Cache",
	"com/sz/packoutbdlv/utils/Const",
	"com/sz/packoutbdlv/modelHelper/PackingMode"
], function (Controller, MessageBox, ValueState, GlobalModel, GlobalHelper, Util, SerialNumber, Cache, Const, PackingMode) {
	"use strict";

	var audioId = "audio-player";
	return Controller.extend("com.sz.packoutbdlv.controller.BaseController", {

		onInit: function () {
			this.setModel(GlobalModel, "global");

			//set i18n model to the view
			this.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
			this.initModel();
			this.initWorkFlow();
			this.initErrorHandler();
			this.initSubscription();
			this.init();

			this.oPersonalizationService = this.getPersonalizationService();

			this.getRouter().attachRouteMatched(function (oEvent) {
				var oParameters = oEvent.getParameters();
				if (oParameters.name === this.sRouteName) {
					if (Util.isEmpty(GlobalHelper.getWarehouseNumber()) || Util.isEmpty(GlobalHelper.getPackStation())) {
						if (this.sRouteName !== Const.DEFAULT_ROUTE_NAME) {
							this.getRouter().navTo("default", true);
							window["loca"+ "tion"].reload();
						}
					} else {
						this.onRouteMatched(oParameters.arguments);
					}
					if (oParameters.name !== Const.DEFAULT_ROUTE_NAME) {
						this.publish(Const.EVENT_BUS.CHANNELS.ROUTE_MATCHED, Const.EVENT_BUS.EVENTS.SUCCESS);
					}
				}
			}.bind(this), this);
		},
		initModel: function () {

		},
		initWorkFlow: function () {

		},
		initErrorHandler: function () {

		},
		initSubscription: function () {

		},
		init: function () {

		},
		onRouteMatched: function (oEvent) {},

		oItemHelper: null, //table items helper method
		_updateInput: function (vInput, sValueState, sValueStateText, sValue) {
			var oInput = vInput;
			if (typeof vInput === "string") {
				oInput = this.byId(vInput);
			}
			oInput.setValueState(sValueState);
			oInput.setValueStateText(sValueStateText);
			if (sValue !== undefined) {
				oInput.setValue(sValue);
			}
		},
		onCancelDialog: function (oEvent) {
			oEvent.getSource().getParent().close();
			this.setBusy(false);
		},
		/**
		 * set the input control to None, and clear all error message. if sVaule is undefined, then keep the current value
		 * 
		 * @param {string} sId The id of input control
		 * @param {string} sValue The value which want to set to the input. if undefied, keep the current value.
		 */
		updateInputWithDefault: function (vInput, sValue) {
			this._updateInput(vInput, ValueState.None, "", sValue);
		},
		updateInputWithWarning: function (vInput, sWarningMsg, sValue) {
			this._updateInput(vInput, ValueState.Warning, sWarningMsg, sValue);
		},
		updateInputWithSuccess: function (vInput, sValue) {
			this._updateInput(vInput, ValueState.Success, "", sValue);
		},
		updateInputWithError: function (vInput, sErrorText) {
			var sError = "";
			if (Util.isEmpty(sErrorText)) {
				sError = this.getI18nText("invalidEntry");
			} else {
				sError = sErrorText;
			}
			this._updateInput(vInput, ValueState.Error, sError, "");
		},

		getI18nText: function (sText, aParameter) {
			var i18n = this.getOwnerComponent().getModel("i18n");
			return i18n.getResourceBundle().getText(sText, aParameter);
		},
		setModel: function (oModel, sName) {
			this.getView().setModel(oModel, sName);
		},
		getModel: function (sModelName) {
			return this.getOwnerComponent().getModel(sModelName);
		},
		getGlobalModel: function () {
			return this.getView().getModel("global");
		},
		getSourceHU: function () {
			return this.getGlobalModel().getProperty("/sSourceHandlingUnit");
		},
		setSourceHU: function (sValue) {
			this.getGlobalModel().setProperty("/sSourceHandlingUnit", sValue);
		},

		setInputEnable: function (sId, bEnable) {
			var oInput = this.byId(sId);
			oInput.setEnable(bEnable);
		},
		focus: function (vInput) {
			var oInput = vInput;
			if (typeof vInput === "string") {
				oInput = this.byId(vInput);
			}
			oInput.focus();
			return this;
		},
		getValue: function (vInput) {
			var oInput = vInput;
			if (typeof vInput === "string") {
				oInput = this.byId(vInput);
			}
			return oInput.getValue();
		},
		getValueState: function (vInput) {
			var oInput = vInput;
			if (typeof vInput === "string") {
				oInput = this.byId(vInput);
			}
			return oInput.getValueState();
		},
		displayInfoMessageBox: function (sMessage) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.information(
				sMessage, {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);
			this.playAudio(Const.INFO);
		},
		showErrorMessageBox: function (sMessage) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.error(
				sMessage, {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);
			this.playAudio(Const.ERROR);
		},
		setBusy: function (bBusy) {
			GlobalHelper.setBusy(!!bBusy);
		},
		publish: function (sChannel, sEvent, mParam) {
			this.getEventBus().publish(sChannel, sEvent, mParam);
		},
		subscribe: function (sChannel, sEvent, fnCallback) {
			this.getEventBus().subscribe(sChannel, sEvent, fnCallback);
		},
		getEventBus: function () {
			return this.getOwnerComponent().getEventBus();
		},
		formatSerialIcon: function (bSerial) {
			var sIcon = "sap-icon://minimize";
			if (bSerial) {
				sIcon = "sap-icon://bullet-text";
			}
			return sIcon;
		},
		formatEnableBtn: function (sValue) {
			if (GlobalHelper.hasOpenShipHandlingUnit()) {
				return true;
			}
			return false;
		},
		//the cached promise object for dialogue
		_mDialogPromise: null,
		openDialog: function (oDialog) {
			var that = this;
			if (this._mDialogPromise !== null) {
				jQuery.sap.log.error("The prev closeDialog not called");
			}
			oDialog.open();
			return new Promise(function (resolve, reject) {
				that._mDialogPromise = {
					resolve: resolve,
					reject: reject
				};
			});

		},
		cancelDialog: function (oEvent) {
			this.closeDialog(oEvent.getSource().getParent(), Const.ERRORS.INTERRUPT_WITH_NO_ACTION, true);
			this.setBusy(false);
		},

		closeDialog: function (oDialog, vData, bReject) {
			if (this._mDialogPromise === null) {
				jQuery.sap.log.error("openDialog/closeDialog must be pair worked");
			}
			oDialog.close();
			if (bReject) {
				this._mDialogPromise.reject(vData);
			} else {
				this._mDialogPromise.resolve(vData);
			}
			this._mDialogPromise = null;
		},
		openSerialNumberPopover: function (oEvent, sModelName, oItemHelper) {
			var oIcon = oEvent.getSource();
			var oItem = oEvent.getSource().getBindingContext(sModelName).getObject();
			var oView = this.getView();
			var iuidActive = oItem.isIuidActive == Const.ABAP_TRUE ? true : false;
			var oPopover = oView.byId("serial-number-popover");
			var oPopoverUii = oView.byId("serial-number-uii-popover");
			if (iuidActive) {
				SerialNumber.setSerialNumberUiisList(oItemHelper.getItemSerialNumberUii(oItem));
				if (!oPopoverUii) {
					oPopoverUii = sap.ui.xmlfragment(oView.getId(), "com.sz.packoutbdlv.view.SerialNumberUiiPopover", this);
					oView.addDependent(oPopoverUii);
				}
				if (oPopover) {
					oPopover.close();
				}
				oPopoverUii.openBy(oIcon);
			} else {
				SerialNumber.setSerialNumbersList(oItemHelper.getItemSerialNumber(oItem));
				if (!oPopover) {
					oPopover = sap.ui.xmlfragment(oView.getId(), "com.sz.packoutbdlv.view.SerialNumberPopover", this);
					oView.addDependent(oPopover);
				}
				if (oPopoverUii) {
					oPopoverUii.close();
				}
				oPopover.openBy(oIcon);
			}
		},
		onAfterOpenSerialNumberPopover: function (oEvent) {
			oEvent.getSource().focus();
		},
		checkQuantityOverflow: function (fQuantity, oInput) {
			if (!isNaN(fQuantity) && Util.isQuantityOverflow(fQuantity)) {
				var sRoundQuantity = Util.formatNumber(fQuantity, 3);
				var sWarningText = this.getI18nText("roundUpQuantity");
				this.updateInputWithWarning(oInput, sWarningText, sRoundQuantity);
				this.focus(oInput);
				return true;
			}
			return false;
		},
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
		navToHome: function () {
			var fnFlushPendings = Util.flushPendings.get();
			if (fnFlushPendings) {
				fnFlushPendings().then(function () {
					// get a handle on the global XAppNav service
					var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
					var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
						target: {
							shellHash: "#Shell-home"
						}
					})) || "";
					//Generate a  URL for the second application
					var url = window.location.href.split('#')[0] + hash.split('?')[0];
					//Navigate to second app
					sap.m.URLHelper.redirect(url, false);

				}.bind(this));
			}
		},
		playAudio: function (sMsgType) {
			var oAudio = this.getAudioFromParent(this.oView);
			oAudio.play(sMsgType);
		},
		getAudioFromParent: function (oView) {
			if (oView.byId && oView.byId(audioId)) {
				this.oAudio = oView.byId(audioId);
			} else {
				this.getAudioFromParent(oView.getParent());
			}
			return this.oAudio;
		},
		setButtonToolTip: function (sId) {
			var oButton = this.byId(sId);
			if (Util.isEmpty(oButton)) {
				return;
			}
			var sTooltip = oButton.getTooltip();
			if (Util.isEmpty(sTooltip)) {
				oButton.setTooltip(oButton.getText());
			}
		},
		getTextAccordingToMode: function (sInternalKey, sOutBoundKey, aParameter, sMode) {
			var sPackMode = Util.isEmpty(sMode) ? PackingMode.getSelectedMode() : sMode;
			var sMessage = "";
			if (sPackMode === Const.INTERNAL_MODE) {
				if (Util.isEmpty(aParameter) || aParameter.length === 0) {
					sMessage = this.getI18nText(sInternalKey);
				} else {
					sMessage = this.getI18nText(sInternalKey, aParameter);
				}
			} else {
				if (Util.isEmpty(aParameter) || aParameter.length === 0) {
					sMessage = this.getI18nText(sOutBoundKey);
				} else {
					sMessage = this.getI18nText(sOutBoundKey, aParameter);
				}
			}
			return sMessage;
		},

		getPersonalizationService: function () {
			return sap.ushell.Container.getService("Personalization");
		},

		getPersonalizationContainer: function () {
			return new Promise(function (resolve, reject) {
				var sContainer = this.getContainerId();
				this.oPersonalizationService.getContainer(sContainer)
					.fail(function () {
						var oContainer = this.oPersonalizationService.createEmptyContainer(sContainer);
						resolve(oContainer);
					}.bind(this))
					.done(function (oContainer) {
						resolve(oContainer);
					}.bind(this));
			}.bind(this));
		},
		getContainerId: function () {
			return PackingMode.getSelectedMode() !== Const.INTERNAL_MODE ? "com.sz.packoutbdlv" :
				"com.sz.packoutbdlv.av1";
		}

	});
});