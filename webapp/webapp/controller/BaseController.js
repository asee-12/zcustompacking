sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState",
    "com/sz/packoutbdlv/model/Global",
    "com/sz/packoutbdlv/modelHelper/Global",
    "com/sz/packoutbdlv/utils/Util",
    "com/sz/packoutbdlv/modelHelper/SerialNumber",
    "com/sz/packoutbdlv/modelHelper/Cache",
    "com/sz/packoutbdlv/utils/Const",
    "com/sz/packoutbdlv/modelHelper/PackingMode",
  ],
  function (e, t, i, n, o, r, s, a, u, l) {
    "use strict";
    var c = "audio-player";
    return e.extend("com.sz.packoutbdlv.controller.BaseController", {
      onInit: function () {
        this.setModel(n, "global");
        this.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
        this.initModel();
        this.initWorkFlow();
        this.initErrorHandler();
        this.initSubscription();
        this.init();
        this.oPersonalizationService = this.getPersonalizationService();
        this.getRouter().attachRouteMatched(
          function (e) {
            var t = e.getParameters();
            if (t.name === this.sRouteName) {
              if (
                r.isEmpty(o.getWarehouseNumber()) ||
                r.isEmpty(o.getPackStation())
              ) {
                if (this.sRouteName !== u.DEFAULT_ROUTE_NAME) {
                  this.getRouter().navTo("default", true);
                  window["loca" + "tion"].reload();
                }
              } else {
                this.onRouteMatched(t.arguments);
              }
              if (t.name !== u.DEFAULT_ROUTE_NAME) {
                this.publish(
                  u.EVENT_BUS.CHANNELS.ROUTE_MATCHED,
                  u.EVENT_BUS.EVENTS.SUCCESS,
                );
              }
            }
          }.bind(this),
          this,
        );
      },
      initModel: function () {},
      initWorkFlow: function () {},
      initErrorHandler: function () {},
      initSubscription: function () {},
      init: function () {},
      onRouteMatched: function (e) {},
      oItemHelper: null,
      _updateInput: function (e, t, i, n) {
        var o = e;
        if (typeof e === "string") {
          o = this.byId(e);
        }
        o.setValueState(t);
        o.setValueStateText(i);
        if (n !== undefined) {
          o.setValue(n);
        }
      },
      onCancelDialog: function (e) {
        e.getSource().getParent().close();
        this.setBusy(false);
      },
      updateInputWithDefault: function (e, t) {
        this._updateInput(e, i.None, "", t);
      },
      updateInputWithWarning: function (e, t, n) {
        this._updateInput(e, i.Warning, t, n);
      },
      updateInputWithSuccess: function (e, t) {
        this._updateInput(e, i.Success, "", t);
      },
      updateInputWithError: function (e, t) {
        var n = "";
        if (r.isEmpty(t)) {
          n = this.getI18nText("invalidEntry");
        } else {
          n = t;
        }
        this._updateInput(e, i.Error, n, "");
      },
      getI18nText: function (e, t) {
        var i = this.getOwnerComponent().getModel("i18n");
        return i.getResourceBundle().getText(e, t);
      },
      setModel: function (e, t) {
        this.getView().setModel(e, t);
      },
      getModel: function (e) {
        return this.getOwnerComponent().getModel(e);
      },
      getGlobalModel: function () {
        return this.getView().getModel("global");
      },
      getSourceHU: function () {
        return this.getGlobalModel().getProperty("/sSourceHandlingUnit");
      },
      setSourceHU: function (e) {
        this.getGlobalModel().setProperty("/sSourceHandlingUnit", e);
      },
      setInputEnable: function (e, t) {
        var i = this.byId(e);
        i.setEnable(t);
      },
      focus: function (e) {
        var t = e;
        if (typeof e === "string") {
          t = this.byId(e);
        }
        t.focus();
        return this;
      },
      getValue: function (e) {
        var t = e;
        if (typeof e === "string") {
          t = this.byId(e);
        }
        return t.getValue();
      },
      getValueState: function (e) {
        var t = e;
        if (typeof e === "string") {
          t = this.byId(e);
        }
        return t.getValueState();
      },
      displayInfoMessageBox: function (e) {
        var i = !!this.getView().$().closest(".sapUiSizeCompact").length;
        t.information(e, { styleClass: i ? "sapUiSizeCompact" : "" });
        this.playAudio(u.INFO);
      },
      showErrorMessageBox: function (e) {
        var i = !!this.getView().$().closest(".sapUiSizeCompact").length;
        t.error(e, { styleClass: i ? "sapUiSizeCompact" : "" });
        this.playAudio(u.ERROR);
      },
      setBusy: function (e) {
        o.setBusy(!!e);
      },
      publish: function (e, t, i) {
        this.getEventBus().publish(e, t, i);
      },
      subscribe: function (e, t, i) {
        this.getEventBus().subscribe(e, t, i);
      },
      getEventBus: function () {
        return this.getOwnerComponent().getEventBus();
      },
      formatSerialIcon: function (e) {
        var t = "sap-icon://minimize";
        if (e) {
          t = "sap-icon://bullet-text";
        }
        return t;
      },
      formatEnableBtn: function (e) {
        if (o.hasOpenShipHandlingUnit()) {
          return true;
        }
        return false;
      },
      _mDialogPromise: null,
      openDialog: function (e) {
        var t = this;
        if (this._mDialogPromise !== null) {
          jQuery.sap.log.error("The prev closeDialog not called");
        }
        e.open();
        return new Promise(function (e, i) {
          t._mDialogPromise = { resolve: e, reject: i };
        });
      },
      cancelDialog: function (e) {
        this.closeDialog(
          e.getSource().getParent(),
          u.ERRORS.INTERRUPT_WITH_NO_ACTION,
          true,
        );
        this.setBusy(false);
      },
      closeDialog: function (e, t, i) {
        if (this._mDialogPromise === null) {
          jQuery.sap.log.error("openDialog/closeDialog must be pair worked");
        }
        e.close();
        if (i) {
          this._mDialogPromise.reject(t);
        } else {
          this._mDialogPromise.resolve(t);
        }
        this._mDialogPromise = null;
      },
      openSerialNumberPopover: function (e, t, i) {
        var n = e.getSource();
        var o = e.getSource().getBindingContext(t).getObject();
        var r = this.getView();
        var a = o.isIuidActive == u.ABAP_TRUE ? true : false;
        var l = r.byId("serial-number-popover");
        var c = r.byId("serial-number-uii-popover");
        if (a) {
          s.setSerialNumberUiisList(i.getItemSerialNumberUii(o));
          if (!c) {
            c = sap.ui.xmlfragment(
              r.getId(),
              "com.sz.packoutbdlv.view.SerialNumberUiiPopover",
              this,
            );
            r.addDependent(c);
          }
          if (l) {
            l.close();
          }
          c.openBy(n);
        } else {
          s.setSerialNumbersList(i.getItemSerialNumber(o));
          if (!l) {
            l = sap.ui.xmlfragment(
              r.getId(),
              "com.sz.packoutbdlv.view.SerialNumberPopover",
              this,
            );
            r.addDependent(l);
          }
          if (c) {
            c.close();
          }
          l.openBy(n);
        }
      },
      onAfterOpenSerialNumberPopover: function (e) {
        e.getSource().focus();
      },
      checkQuantityOverflow: function (e, t) {
        if (!isNaN(e) && r.isQuantityOverflow(e)) {
          var i = r.formatNumber(e, 3);
          var n = this.getI18nText("roundUpQuantity");
          this.updateInputWithWarning(t, n, i);
          this.focus(t);
          return true;
        }
        return false;
      },
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },
      navToHome: function () {
        var e = r.flushPendings.get();
        if (e) {
          e().then(
            function () {
              var e = sap.ushell.Container.getService(
                "CrossApplicationNavigation",
              );
              var t =
                (e &&
                  e.hrefForExternal({
                    target: { shellHash: "#Shell-home" },
                  })) ||
                "";
              var i = window.location.href.split("#")[0] + t.split("?")[0];
              sap.m.URLHelper.redirect(i, false);
            }.bind(this),
          );
        }
      },
      playAudio: function (e) {
        var t = this.getAudioFromParent(this.oView);
        t.play(e);
      },
      getAudioFromParent: function (e) {
        if (e.byId && e.byId(c)) {
          this.oAudio = e.byId(c);
        } else {
          this.getAudioFromParent(e.getParent());
        }
        return this.oAudio;
      },
      setButtonToolTip: function (e) {
        var t = this.byId(e);
        if (r.isEmpty(t)) {
          return;
        }
        var i = t.getTooltip();
        if (r.isEmpty(i)) {
          t.setTooltip(t.getText());
        }
      },
      getTextAccordingToMode: function (e, t, i, n) {
        var o = r.isEmpty(n) ? l.getSelectedMode() : n;
        var s = "";
        if (o === u.INTERNAL_MODE) {
          if (r.isEmpty(i) || i.length === 0) {
            s = this.getI18nText(e);
          } else {
            s = this.getI18nText(e, i);
          }
        } else {
          if (r.isEmpty(i) || i.length === 0) {
            s = this.getI18nText(t);
          } else {
            s = this.getI18nText(t, i);
          }
        }
        return s;
      },
      getPersonalizationService: function () {
        return sap.ushell.Container.getService("Personalization");
      },
      getPersonalizationContainer: function () {
        return new Promise(
          function (e, t) {
            var i = this.getContainerId();
            this.oPersonalizationService
              .getContainer(i)
              .fail(
                function () {
                  var t = this.oPersonalizationService.createEmptyContainer(i);
                  e(t);
                }.bind(this),
              )
              .done(
                function (t) {
                  e(t);
                }.bind(this),
              );
          }.bind(this),
        );
      },
      getContainerId: function () {
        return l.getSelectedMode() !== u.INTERNAL_MODE
          ? "com.sz.packoutbdlv"
          : "com.sz.packoutbdlv.av1";
      },
    });
  },
);
//# sourceMappingURL=BaseController.js.map
