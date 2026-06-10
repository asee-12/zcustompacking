sap.ui.define(
  ["com/sz/packoutbdlv/utils/Util", "com/sz/packoutbdlv/utils/Const"],
  function (t, e) {
    "use strict";
    function n(t) {
      this._oModel = t;
    }
    jQuery.extend(n.prototype, Error.prototype, {
      constructor: n,
      getModel: function () {
        return this._oModel;
      },
      setData: function (t) {
        this._oModel.setData(t);
        return this;
      },
      setColumnSettings: function (t) {
        this._oModel.setProperty("/columnSettings", t);
        return this;
      },
      getColumnSettings: function () {
        return this._oModel.getProperty("/columnSettings");
      },
      restore: function (t) {
        var e = JSON.parse(JSON.stringify(t));
        for (var n = 0; n < e.length; n++) {
          e[n].visible = e[n].defaultVisible;
          e[n].index = e[n].defaultIndex;
        }
        this.setColumnSettings(e);
      },
      setEnableRestore: function (t) {
        this._oModel.setProperty("/enableRestore", t);
        return this;
      },
      isColumnSettingAsDefault: function () {
        var e = this.getColumnSettings();
        var n = t.findIndex(e, function (t) {
          if (t.visible !== t.defaultVisible) {
            return true;
          }
        });
        return n !== -1 ? false : true;
      },
      updateRestore: function () {
        if (this.isColumnSettingAsDefault()) {
          this.setEnableRestore(false);
        } else {
          this.setEnableRestore(true);
        }
      },
      setColumnTextByKey: function (t, e) {
        var n = this.getColumnSettings();
        var i = JSON.parse(JSON.stringify(n));
        for (var s = 0; s < i.length; s++) {
          if (i[s].columnKey === t) {
            i[s].text = e;
          }
        }
        this.setColumnSettings(i);
      },
      setMandatoryColumnVisible: function () {
        var t = this.getColumnSettings();
        for (var e = 0; e < t.length; e++) {
          if (t[e].mandatory) {
            t[e].visible = true;
            t[e].index = t[e].defaultIndex;
          }
        }
      },
      addStatusColumnSetting: function (t) {
        var e = this.getColumnSettings();
        var n = JSON.parse(JSON.stringify(e));
        var i = n.length;
        var s = false;
        if (n[i - 1].columnKey !== "status") {
          var r = {
            columnKey: "status",
            text: t,
            index: i,
            visible: true,
            defaultVisible: true,
            defaultIndex: i,
            mandatory: true,
          };
          n.splice(i, 0, r);
          s = true;
        }
        this.setColumnSettings(n);
        return s;
      },
      removeStatusColumnSetting: function () {
        var t = this.getColumnSettings();
        var e = JSON.parse(JSON.stringify(t));
        var n = false;
        if (e[e.length - 1].columnKey === "status") {
          e.splice(e.length - 1, 1);
          n = true;
        }
        this.setColumnSettings(e);
        return n;
      },
      handleStatusColumnSetting: function (t, e) {
        if (t) {
          return this.addStatusColumnSetting(e);
        } else {
          return this.removeStatusColumnSetting();
        }
      },
    });
    return n;
  },
);
//# sourceMappingURL=ColumnSettings.js.map
