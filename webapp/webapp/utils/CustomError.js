sap.ui.define([], function () {
  "use strict";
  function t(t, e, r) {
    this._sKey = t;
    this._vPara = r;
    this._sDescription = e;
    this._oError = new Error(t);
    this._bProcessed = false;
  }
  jQuery.extend(t.prototype, Error.prototype, {
    constructor: t,
    getKey: function () {
      return this._sKey;
    },
    getDescription: function () {
      return this._sDescription;
    },
    getParameters: function () {
      return this._vPara;
    },
    setProcessed: function (t) {
      this._bProcessed = !!t;
    },
    getProcessed: function () {
      return this._bProcessed;
    },
  });
  return t;
});
//# sourceMappingURL=CustomError.js.map
