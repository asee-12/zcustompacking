sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/sz/packoutbdlv/utils/Const",
	"com/sz/packoutbdlv/model/Models",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/service/ODataService",
	"com/sz/packoutbdlv/modelHelper/OData",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/utils/ErrorHandler",
	"sap/tl/ewm/lib/reuses1/controllers/AccessCode",
	"sap/m/MessageBox",
	"com/sz/packoutbdlv/modelHelper/PackingMode"
], function (BaseComponent, Device, Const, Model, Global, Service, ODataHelper, Util, PackErrorHandler, AccessCodePart, MessageBox,
	PackingMode) {
	"use strict";
	return BaseComponent.extend("com.sz.packoutbdlv.Component", {
		metadata: {
			manifest: "json"
		},
		initialPage: "default",
		applicationCode: "PKOD",
		enableAccessCode: true,
		mode: Const.ADVANCED_MODE,
		_hasDirtyPage: function () {
			return false;
		},
		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			BaseComponent.prototype.init.apply(this, arguments);
			var warehouse = this.getComponentData().startupParameters.Warehouse;
			if (Util.isEmpty(warehouse)) {
				warehouse = "";
			} else {
				warehouse = warehouse[0];
			}
			Global.setWarehouseNumber(warehouse);
			PackErrorHandler.sDefaultMessage = this.getModel("i18n").getResourceBundle().getText("errorText");
			this.initErrorHandler();
			Service.init(this.getModel());
			ODataHelper.init(this.getModel());
			jQuery.extend(this, AccessCodePart);

			// this.getModel().setChangeGroups({
			// 	"UpdateTrackNumber": {
			// 		groupId: "groupUpdateTrack",
			// 		changeSetId: "trackSet",
			// 		single: false
			// 	}
			// });

			var packmode = this.getComponentData().startupParameters.PackMode;
			var sPackMode;
			if (Util.isEmpty(packmode)) {
				sPackMode = Const.PACK_MODE.OUTBOUND;
			} else {
				sPackMode = packmode[0];
			}
			var packModeIntValue = parseInt(sPackMode, 10);
			Service.setOdataHeader(packModeIntValue);
			if (packModeIntValue === Const.PACK_MODE.OUTBOUND) {
				PackingMode.setSelectedMode(Const.ADVANCED_MODE);
			} else {
				PackingMode.setSelectedMode(Const.INTERNAL_MODE);
			}
			this.initAppTitle(packModeIntValue);

			var that = this;
			this._fnOnHomeButtonClick = function (oEvent) {
				that.onHomeButtonClick.apply(that, arguments);
			};
			this._fnOnBackButtonClick = function () {
				that.onBackButtonClick.apply(that, arguments);
			};
			sap.ushell.Container.getServiceAsync("UserDefaultParameters")
				.then(function (oService) {
					oService.attachValueStored(this._reloadPage.bind(this));
				}.bind(this));
			this.getRouter().initialize();
		},
		//copied from reuse lib
		_getHomeButton: function () {
			return jQuery.sap.getObject("homeBtn");
		},
		_reloadPage: function (oEvent) {
			if(oEvent.getParameter("parameterName")!=="Warehouse"){
				return;
			}
			var sWarehouse = oEvent.getParameter("parameterValue").value;
			if (Util.isEmpty(sWarehouse)) {
				sWarehouse = "";
			}
			Global.setWarehouseNumber(sWarehouse);
			Global.setPackStation("");
			Global.setBin("");
			this.getRouter().navTo(this.initialPage, {}, true);

			jQuery.sap.delayedCall(0, this, function () {
				this.getEventBus().publish(Const.EVENT_BUS.CHANNELS.USER_SETTING, Const.EVENT_BUS.EVENTS.WAREHOUSE_CHANGED);
			});
		},
		onHomeButtonClick: function (oEvent) {
			// prevent the original navigation
			oEvent.returnValue = false;
			var fnFlushPendings = Util.flushPendings.get();
			if (fnFlushPendings) {
				fnFlushPendings().then(function () {
					this.navigateToHome.call(this, oEvent);
				}.bind(this));
			}

		},
		onBackButtonClick: function () {
			var fnFlushPendings = Util.flushPendings.get();
			if (fnFlushPendings) {
				fnFlushPendings().then(function () {
					this.navigateBack.call(this, arguments);
				}.bind(this));
			}
		},
		/**
		 * Helper for navigation to the Launchpad
		 */
		navigateToHome: function (oEvent) {
			// prevent the original navigation
			oEvent.returnValue = false;

			this.getCrossAppNav().toExternal({
				target: {
					shellHash: "#"
				}
			});
		},
		/**
		 * Helper for back naviagtion
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		navigateBack: function (oEvent) {
			// prevent the original
			oEvent.returnValue = false;
			this.getCrossAppNav().historyBack();
		},
		getShellUIService: function () {
			return sap.ushell.components.applicationIntegration.AppLifeCycle.getShellUIService();
		},
		/**
		 * Helper for retrieving cross app navigator
		 * @returns {*} cross app navigator
		 */
		getCrossAppNav: function () {
			return sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
		},
		destroy: function () {
			BaseComponent.prototype.destroy.apply(this, arguments);
			sap.ushell.Container.getService("UserDefaultParameters").detachValueStored(this._reloadPage);
			// remove custom event listener on the Home button click
			this.getShellUIService().setBackNavigation();
			this._fnOnBackButtonClick = null;
			Util.flushPendings.set(null);
			this.destroyTableCells();
		},
		destroyTableCells: function () {
			var sComponentId = this.getId();
			var aViewIds = [Const.ID.MAIN_SHIP_VIEW, Const.ID.INTERNAL_SHIP_VIEW];
			var aTemplateIds = [Const.ID.CREATE_DIALOG_TEMPLATE, Const.ID.CHANGE_DIALOG_TEMPLATE];
			var oElement;
			aViewIds.forEach(function (sViewId) {
				aTemplateIds.forEach(function (sTemplateId) {
					oElement = this.byId(sComponentId + sViewId + sTemplateId);
					if (oElement) {
						oElement.destroy();
					}
				}.bind(this));
			}.bind(this));
		},
		/**
		 * Getter for Application Code
		 */
		getApplicationCode: function () {
			return this.applicationCode;
		},
		/**
		 * Setter for Access code enablement
		 */
		setEnableAccessCode: function (sEnableAccessCode) {
			this.enableAccessCode = sEnableAccessCode;
		},
		/**
		 * Getter for Access code enablement
		 */
		getEnableAccessCode: function () {
			return this.enableAccessCode;
		},
		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},
		initErrorHandler: function () {
			this.getModel().attachMessageChange(null, function (oEvent) {
				var aMessage = oEvent.getParameter("newMessages");
				var aErrorMessage = [];
				aMessage.forEach(function (oMessage) {
					if (oMessage.getType() === sap.ui.core.MessageType.Error) {
						aErrorMessage.push(oMessage.getMessage());
					}
				});
				if (aErrorMessage.length > 0) {
					MessageBox.error(aErrorMessage.join("\n"));
				}
			}, this);
		},
		initAppTitle: function (sMode) {
			this.getService("ShellUIService")
				.then(function (oService) {
						var sTitle;
						var oResourceBundle = this.getModel("i18n").getResourceBundle();
						if (sMode === Const.PACK_MODE.OUTBOUND) {
							sTitle = oResourceBundle.getText("appTitle");
						} else {
							sTitle = oResourceBundle.getText("internalTitle");
						}
						oService.setTitle(sTitle);
					}.bind(this),
					function (oError) {
						jQuery.sap.log.error("Cannot get ShellUIService", oError, "my.app.Component");
					}
				);
		}
	});
});