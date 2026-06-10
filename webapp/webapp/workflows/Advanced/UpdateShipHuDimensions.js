sap.ui.define(
  [
    "com/sz/packoutbdlv/workflows/WorkFlow",
    "com/sz/packoutbdlv/utils/Util",
    "com/sz/packoutbdlv/service/ODataService",
    "com/sz/packoutbdlv/modelHelper/Global",
    "com/sz/packoutbdlv/modelHelper/Message",
    "com/sz/packoutbdlv/utils/Const",
  ],
  function (t, o, e, s, u, i) {
    "use strict";
    return function (o, s) {
      var u = new t()
        .then(
          function (t, o) {
            this.setBusy(true);
            o.Huid = t.Huid;
            return e.updateHuDimensions(t);
          },
          s,
          "Call Hu update dimensions",
        )
        .then(function (t, o) {
          this.getWorkFlowFactory().getShipHUChangeWorkFlow().run(o.Huid);
        }, s);
      u.errors().always(function () {
        this.playAudio(i.ERROR);
        this.setBusy(false);
      }, o);
      return u;
    };
  },
);
//# sourceMappingURL=UpdateShipHuDimensions.js.map
