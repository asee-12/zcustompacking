sap.ui.define(
  [
    "com/sz/packoutbdlv/model/PackingMode",
    "com/sz/packoutbdlv/utils/Util",
    "com/sz/packoutbdlv/utils/Const",
  ],
  function (e, t, o) {
    "use strict";
    return {
      setModes: function (t) {
        e.setProperty("/modes", t);
        return this;
      },
      setSelectedMode: function (t) {
        e.setProperty("/selectedMode", t);
        return this;
      },
      getSelectedMode: function () {
        return e.getProperty("/selectedMode");
      },
      reset: function () {
        this.setModes([]);
        this.setSelectedMode("");
        return this;
      },
      isBasicMode: function () {
        var t = e.getProperty("/selectedMode");
        return t === o.BASIC_MODE;
      },
      isAdvancedMode: function () {
        var t = e.getProperty("/selectedMode");
        return t === o.ADVANCED_MODE;
      },
      isInternalMode: function () {
        var t = e.getProperty("/selectedMode");
        return t === o.INTERNAL_MODE;
      },
    };
  },
);
//# sourceMappingURL=PackingMode.js.map
