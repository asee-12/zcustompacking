sap.ui.define(
  [
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
    "com/sz/packoutbdlv/modelHelper/Material",
  ],
  function (o, e, t, s, l, c, a, i, r, p, d, u, n, m, E, S, b, v) {
    "use strict";
    return o.extend("com.sz.packoutbdlv.controller.Main", {
      sRouteName: "main",
      init: function () {
        e.prototype.initAccessCode.call(this);
        var o = this.byId("id-source-view").getController();
        var t = this.byId("id-ship-view").getController();
        this.oWorkFlowFactory = new S(o, t);
      },
      onRouteMatched: function (e) {
        o.prototype.onRouteMatched.call(this);
        this.publish(
          c.EVENT_BUS.CHANNELS.USER_SETTING,
          c.EVENT_BUS.EVENTS.SUCCESS,
        );
        setTimeout(
          function () {
            this.publish(
              c.EVENT_BUS.CHANNELS.EXCEPTION_LIST,
              c.EVENT_BUS.EVENTS.SUCCESS,
              n.getExceptionList(),
            );
          }.bind(this),
          0,
        );
      },
      getRateShops: function () {
        setTimeout(
          function () {
            this.publish(
              c.EVENT_BUS.CHANNELS.RATE_SHOP,
              c.EVENT_BUS.EVENTS.GET,
            );
          }.bind(this),
          0,
        );
      },
    });
  },
);
//# sourceMappingURL=Main.controller.js.map
