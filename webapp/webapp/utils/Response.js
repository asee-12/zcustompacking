sap.ui.define(
  [
    "com/sz/packoutbdlv/utils/CustomError",
    "com/sz/packoutbdlv/modelHelper/Message",
  ],
  function (s, e) {
    "use strict";
    return {
      parseError: function (e, r) {
        var a, n;
        var t;
        if (e.MsgType === "E" || e.MsgSuccess === false) {
          a = e.MsgId + "-" + e.MsgKey;
          n = e.MsgVar;
          t = new s(a, n, e);
          r(t);
        }
        return t;
      },
      parseWarning: function (s) {
        if (s.MsgType === "W") {
          e.addWarning(s.MsgVar);
        }
      },
      parseSuccess: function (s) {
        if (s.MsgType === "S") {
          if (this.getMessage(s.MsgVar)) {
            e.addSuccess(s.MsgVar);
          }
        }
      },
      getMessage: function (s) {
        return s && s !== "" ? true : false;
      },
    };
  },
);
//# sourceMappingURL=Response.js.map
