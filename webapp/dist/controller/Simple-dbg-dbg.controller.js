sap.ui.define([
	"com/sz/packoutbdlv/controller/BaseMain",
	"sap/tl/ewm/lib/reuses1/controllers/Base.controller",
	"com/sz/packoutbdlv/workflows/SimpleFactory",
	"com/sz/packoutbdlv/modelHelper/Material",
	"com/sz/packoutbdlv/utils/Const"
], function (Controller, CommonBase, SimpleFactory, Material, Const) {
	"use strict";
	return Controller.extend("com.sz.packoutbdlv.controller.Simple", {
		sRouteName: "simple",
		init: function () {
			CommonBase.prototype.initAccessCode.call(this);
			var oSourceController = this.byId("id-source-view").getController();
			var oShipController = this.byId("id-ship-view").getController();
			this.oTemplate = this.byId("template-button");
			this.oWorkFlowFactory = new SimpleFactory(oSourceController, oShipController);

			var oComponent = this.getOwnerComponent();
			var homeButton = oComponent._getHomeButton();
			if (homeButton) {
				homeButton.addEventListener("click", oComponent._fnOnHomeButtonClick);
			}
		},

		onRouteMatched: function () {
			Controller.prototype.onRouteMatched.call(this);
			if (Material.getFavoriteMaterials().length !== 0) {
				this.oWorkFlowFactory.getInitWorkFlow().run();
			}
			this.publish(Const.EVENT_BUS.CHANNELS.USER_SETTING, Const.EVENT_BUS.EVENTS.SUCCESS);
		},
		
		navBack: function(oComponent){
			oComponent._fnOnBackButtonClick();
		}
	});
});