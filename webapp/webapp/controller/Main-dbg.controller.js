sap.ui.define([
	"com/sz/packoutbdlv/controller/BaseMain",
	"sap/tl/ewm/lib/reuses1/controllers/Base.controller",
	"com/sz/packoutbdlv/utils/Util",
	"com/sz/packoutbdlv/service/ODataService",
	"com/sz/packoutbdlv/modelHelper/OData",
	"com/sz/packoutbdlv/utils/Const",
	"sap/ui/model/json/JSONModel",
	"com/sz/packoutbdlv/model/Message",
	"com/sz/packoutbdlv/modelHelper/Message",
	"sap/m/MessagePopoverItem",
	"sap/m/MessagePopover",
	"sap/m/MessageBox",
	"com/sz/packoutbdlv/modelHelper/Global",
	"com/sz/packoutbdlv/model/SerialNumber",
	"com/sz/packoutbdlv/workflows/SimpleFactory",
	"com/sz/packoutbdlv/workflows/AdvancedFactory",
	"com/sz/packoutbdlv/modelHelper/PackingMode",
	"com/sz/packoutbdlv/modelHelper/Material"
], function (Controller, CommonBase, Util, Service, ODataHelper, Const, JSONModel, MessageModel, MessageHelper,
	MessagePopoverItem,
	MessagePopover, MessageBox, Global, SerialNumberModel, SimpleFactory, AdvancedFactory, PackingMode, Material) {
	"use strict";
	return Controller.extend("com.sz.packoutbdlv.controller.Main", {
		sRouteName: "main",
		init: function () {
			CommonBase.prototype.initAccessCode.call(this);
			var oSourceController = this.byId("id-source-view").getController();
			var oShipController = this.byId("id-ship-view").getController();
			this.oWorkFlowFactory = new AdvancedFactory(oSourceController, oShipController);
		},

		onRouteMatched: function (oParameter) {
			Controller.prototype.onRouteMatched.call(this);
			this.publish(Const.EVENT_BUS.CHANNELS.USER_SETTING, Const.EVENT_BUS.EVENTS.SUCCESS);
			setTimeout(function(){
				this.publish(Const.EVENT_BUS.CHANNELS.EXCEPTION_LIST, Const.EVENT_BUS.EVENTS.SUCCESS, Global.getExceptionList());
			}.bind(this), 0);
		},

		getRateShops: function() {
			setTimeout(function(){
				this.publish(Const.EVENT_BUS.CHANNELS.RATE_SHOP, Const.EVENT_BUS.EVENTS.GET);
			}.bind(this), 0);
		}
	});
});