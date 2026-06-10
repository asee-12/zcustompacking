sap.ui.define(
  [
    "com/sz/packoutbdlv/controller/WorkFlowController",
    "sap/m/MessageBox",
    "com/sz/packoutbdlv/service/ODataService",
    "com/sz/packoutbdlv/modelHelper/Global",
    "com/sz/packoutbdlv/utils/Util",
    "com/sz/packoutbdlv/modelHelper/Material",
    "sap/ui/model/json/JSONModel",
    "com/sz/packoutbdlv/utils/Const",
    "com/sz/packoutbdlv/modelHelper/PackingMode",
    "com/sz/packoutbdlv/model/PackingMode",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "com/sz/packoutbdlv/utils/CustomError",
  ],
  function (e, t, i, n, r, o, a, s, l, u, h, d, c) {
    "use strict";
    var g = "start-packing-button";
    var p = "dummy-input";
    var f = "audio-player";
    var E = "pod---defaultbin--workcenter--input";
    var m = "pod---defaultbin--storagebin--input";
    var b = "feature-selection";
    return e.extend("com.sz.packoutbdlv.controller.DefaultBin", {
      sRouteName: "default",
      init: function () {
        this.setModel(u, "packingMode");
        this.initBinOnSapEnter();
        this.setBusy(true);
        var e = i.getRuntimeEnvironment().then(
          function (e) {
            if (r.isEmpty(n.getWarehouseNumber())) {
              if (e[0].EWMWarehouse && e[0].EWMWarehouse !== "") {
                n.setWarehouseNumber(e[0].EWMWarehouse);
              } else {
                this.displayWarehouseMissedMessage();
              }
            } else {
              this.bindAudioAggregation();
            }
            n.setSelectedFeatureSet(e[0].PackMode);
            n.setIsOnCloud(e[0].IsS4Cloud);
            if (!e[0].IsS4Cloud && l.getSelectedMode() !== s.INTERNAL_MODE) {
              this.initPackingModeModel();
            }
          }.bind(this),
        );
        var t = this.initPersonalizationService();
        this.setButtonToolTip("start-packing-button");
        return Promise.all([e, t])
          .then(
            function () {
              this.setBusy(false);
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
            }.bind(this),
          );
      },
      onRouteMatched: function (e) {
        this.getOwnerComponent().getShellUIService().setBackNavigation();
      },
      bindWorkCenter: function (e) {
        this.byId(E).bindElement({
          path:
            "/PackingStationSet(EWMWarehouse='" +
            n.getWarehouseNumber() +
            "',EWMWorkCenter='" +
            e +
            "',EWMStorageBin='')",
        });
      },
      bindStorageBin: function (e) {
        this.byId(m).bindElement({
          path:
            "/PackingStationSet(EWMWarehouse='" +
            n.getWarehouseNumber() +
            "',EWMWorkCenter='" +
            e +
            "',EWMStorageBin='')",
        });
      },
      initPackingMode: function () {
        var e =
          this.getOwnerComponent().getComponentData().startupParameters
            .PackMode;
        if (r.isEmpty(e)) {
          e = s.PACK_MODE.OUTBOUND;
        } else {
          e = parseInt(e[0], 10);
        }
        i.setOdataHeader(e);
        if (e === s.PACK_MODE.OUTBOUND) {
          var t = this.getDefaultPackingModeForOutbound();
          l.setSelectedMode(t);
          this.byId("mode-selection").setSelectedKey(t);
        } else {
          l.setSelectedMode(s.INTERNAL_MODE);
        }
      },
      displayWarehouseMissedMessage: function () {
        var e = this.getI18nText("specifyWorkCenter");
        var i = !!this.getView().$().closest(".sapUiSizeCompact").length;
        t.error(e, { styleClass: i ? "sapUiSizeCompact" : "" });
      },
      initSubscription: function () {
        this.subscribe(
          s.EVENT_BUS.CHANNELS.USER_SETTING,
          s.EVENT_BUS.EVENTS.WAREHOUSE_CHANGED,
          function () {
            this.byId(g).setEnabled(false);
            this.updateInputWithDefault(E, "");
            this.updateInputWithDefault(m, "");
            this.bindAudioAggregation();
            if (r.isEmpty(n.getWarehouseNumber())) {
              this.displayWarehouseMissedMessage();
            }
          }.bind(this),
        );
      },
      initModel: function () {},
      isInTextAndIdFormat: function (e) {
        if (e.length < 6) return false;
        var t = e.substring(e.length - 6, e.length - 5);
        if (t !== "(") {
          return false;
        }
        var i = e.substring(e.length - 1, e.length);
        if (i !== ")") {
          return false;
        }
        return true;
      },
      getIdFromTextAndIdFormat: function (e) {
        return e.substring(e.length - 5, e.length - 1);
      },
      initWorkCenterModel: function () {
        var e = [];
        this.setBusy(true);
        this.oWorkCenterModel = new sap.ui.model.json.JSONModel();
        i.getWorkCenterSet()
          .then(
            function (t) {
              t.forEach(function (t) {
                var i = { WorkCenter: t.Workstation, Desc: t.Description };
                e.push(i);
              });
              this.oWorkCenterModel.setData(e);
              this.setBusy(false);
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
            }.bind(this),
          );
      },
      initStorageBinModel: function () {
        var e = [];
        this.setBusy(true);
        this.oStorageBinModel = new sap.ui.model.json.JSONModel();
        i.getStorageBinSet()
          .then(
            function (t) {
              t.forEach(function (t) {
                var i = {
                  StorageBin: t.EWMStorageBin,
                  StorageType: t.EWMStorageType,
                };
                e.push(i);
              });
              this.oStorageBinModel.setData(e);
              this.setBusy(false);
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
            }.bind(this),
          );
      },
      initWorkCenterColModel: function () {
        this.oWorkCenterColModel = new sap.ui.model.json.JSONModel();
        var e = this.getI18nText("workCenter");
        var t = this.getI18nText("workCenterDesc");
        this.oWorkCenterColModel.setData({
          cols: [
            { label: e, template: s.WORKCENTER_KEY },
            { label: t, template: s.WORKCENTER_DESC },
          ],
        });
      },
      initStorageBinColModel: function () {
        this.oStorageBinColModel = new sap.ui.model.json.JSONModel();
        var e = this.getI18nText("storageBin");
        var t = this.getI18nText("storageType");
        this.oStorageBinColModel.setData({
          cols: [
            { label: e, template: s.STORAGEBIN_KEY },
            { label: t, template: s.STORAGE_TYE },
          ],
        });
      },
      initTableBinding: function (e) {
        var t = e.getTable();
        if (t.bindRows) {
          t.bindRows("/");
        }
        if (t.bindItems) {
          t.bindAggregation("items", "/", function (e, i) {
            var n = t.getModel("columns").getData().cols;
            return new sap.m.ColumnListItem({
              cells: n.map(function (e) {
                var t = e.template;
                return new sap.m.Label({ text: "{" + t + "}" });
              }),
            });
          });
        }
      },
      initPackingModeModel: function () {
        var e = this.getI18nText("advancedMode");
        var t = this.getI18nText("basicMode");
        var i = this.getI18nText("internalMode");
        var r = [{ key: s.ADVANCED_MODE, text: e }];
        var o = { key: s.BASIC_MODE, text: t };
        if (!n.isOnCloud()) {
          r.push(o);
        }
        l.setModes(r);
      },
      getDefaultPackingModeForOutbound: function () {
        var e = this.oContainer.getItemValue("packingMode");
        if (r.isEmpty(e)) {
          e = s.ADVANCED_MODE;
        } else if (e !== s.ADVANCED_MODE && e !== s.BASIC_MODE) {
          e = s.ADVANCED_MODE;
        }
        return e;
      },
      initPersonalizationService: function () {
        this.oPersonalizationService = this.getPersonalizationService();
        return new Promise(
          function (e, t) {
            var i = this.getContainerId();
            this.oPersonalizationService
              .getContainer(i)
              .fail(
                function () {
                  this.oPersonalizationService.createEmptyContainer(i).done(
                    function (t) {
                      this.oContainer = t;
                      e();
                    }.bind(this),
                  );
                }.bind(this),
              )
              .done(
                function (t) {
                  this.oContainer = t;
                  e();
                }.bind(this),
              );
          }.bind(this),
        ).then(
          function () {
            return this.initDisplayedValue();
          }.bind(this),
        );
      },
      initDisplayedValue: function () {
        this.initPackingMode();
        var e = "";
        e = this.oContainer.getItemValue("workCenter");
        this.byId(g).setEnabled(false);
        this.bindWorkCenter("");
        this.bindStorageBin("");
        if (!r.isEmpty(n.getWarehouseNumber()) && !r.isEmpty(e)) {
          return this.verifyWorkCenter(e, true);
        }
      },
      initBinOnSapEnter: function () {
        this.getView()
          .byId("pod---defaultbin--storagebin--input")
          .attachInnerControlsCreated(
            function (e) {
              var t = e.getSource().getInnerControls()[0];
              var i = t.onsapenter.bind(t);
              var n = function () {
                i();
                var e = t.getValue();
                if (e.trim() === "") {
                  this.onStartPacking();
                }
              }.bind(this);
              e.getSource().getInnerControls()[0].onsapenter = n;
            }.bind(this),
          );
      },
      onVerifyWorkCenter: function (e) {
        var t = this.byId(E);
        if (e.length > 4) {
          this.handleEntryLengthExceed(t);
          return;
        }
        if (!r.isEmpty(e)) {
          this.verifyWorkCenter(e)
            .then(
              function () {
                this.setBusy(false);
              }.bind(this),
            )
            .catch(
              function () {
                this.setBusy(false);
              }.bind(this),
            );
        } else {
          n.setPackStation("");
        }
      },
      onWorkCenterChange: function (e) {
        this.byId(g).setEnabled(false);
        this.focusDummyElement();
        var t = r.trim(e.getParameter("newValue")).toUpperCase();
        if (this.isInTextAndIdFormat(t)) {
          t = this.getIdFromTextAndIdFormat(t);
        }
        this.onVerifyWorkCenter(t);
      },
      handleEntryLengthExceed: function (e) {
        var t = this.getI18nText("workCenterMaximunCharacters");
        this.updateInputWithError(e, t);
        this.playAudio(s.ERROR);
        e.focus();
      },
      verifyWorkCenter: function (e, t) {
        var o = this.byId(E);
        var a = "";
        this.setBusy(true);
        return i
          .verifyWorkCenter(e)
          .then(
            function (e) {
              if (r.isEmpty(e.EWMWarehouse) || r.isEmpty(e.EWMWorkCenter)) {
                throw new Error();
              } else {
                n.setWarehouseNumber(e.EWMWarehouse);
                n.setPackStation(e.EWMWorkCenter);
                n.setScaleEnabled(e.ScaleEnabled);
                n.setAsyncMode(!!e.IsUIAsync);
                if (t) {
                  this.bindWorkCenter(e.EWMWorkCenter.toUpperCase());
                }
                this.bindStorageBin(e.EWMWorkCenter.toUpperCase());
                a = e.EWMStorageBin;
              }
            }.bind(this),
          )
          .then(
            function () {
              if (!r.isEmpty(a)) {
                n.setBin(a);
                this.updateInputWithDefault(m, a);
                if (
                  !r.isEmpty(this.byId("mode-selection").getSelectedKey()) ||
                  l.getSelectedMode() === s.INTERNAL_MODE
                ) {
                  this.byId(g).setEnabled(true);
                }
              } else {
                var e = this.byId(m);
                var t = e.getValue();
                if (!r.isEmpty(t)) {
                  e.fireChange({ newValue: t });
                } else {
                  this.updateInputWithDefault(e, "");
                  this.byId(g).setEnabled(true);
                }
              }
              this.focus(m);
            }.bind(this),
          )
          .catch(
            function (t) {
              this.setBusy(false);
              this.byId(g).setEnabled(false);
              if (r.isEmpty(t._vPara)) {
                var i = this.getI18nText("incorrectWorkCenter", e);
                this.updateInputWithError(o, i);
              } else {
                this.updateInputWithError(o, t._vPara.MsgVar);
              }
              n.setPackStation("");
              this.playAudio(s.ERROR);
              o.focus();
            }.bind(this),
          );
      },
      onWorkCenterSubmit: function (e) {
        var t = r.trim(e.getParameter("value")).toUpperCase();
        this.onVerifyWorkCenter(t);
      },
      onStorageBinVerify: function (e) {
        var t = this.byId(E);
        var i = n.getPackStation();
        var o = this.byId(m);
        if (r.isEmpty(i)) {
          t.focus();
          this.updateInputWithDefault(o, e);
          return;
        }
        if (e.length > 18) {
          this.updateInputWithError(o);
          this.playAudio(s.ERROR);
          o.focus();
          return;
        }
        if (!r.isEmpty(e)) {
          this.verifyStorageBin(e);
        } else {
          n.setBin("");
          this.byId(g).setEnabled(true);
        }
      },
      onStorageBinChange: function (e) {
        this.byId(g).setEnabled(false);
        this.focusDummyElement();
        var t = r.trim(e.getParameter("newValue")).toUpperCase();
        this.onStorageBinVerify(t);
      },
      verifyStorageBin: function (e) {
        var t = this.byId(m);
        this.setBusy(true);
        return i
          .verifyStorageBin(e)
          .then(
            function (i) {
              this.setBusy(false);
              n.setBin(i.EWMStorageBin);
              this.updateInputWithDefault(t, e);
              if (
                !r.isEmpty(this.byId("mode-selection").getSelectedKey()) ||
                l.getSelectedMode() === s.INTERNAL_MODE
              ) {
                this.byId(g).setEnabled(true);
              }
              t.focus();
            }.bind(this),
          )
          .catch(
            function (i) {
              this.setBusy(false);
              if (r.isEmpty(i._vPara)) {
                var n = this.getI18nText("incorrectStorageBin", e);
                this.updateInputWithError(t, n);
              } else {
                this.updateInputWithError(t, i._vPara.MsgVar);
              }
              this.playAudio(s.ERROR);
              t.focus();
            }.bind(this),
          );
      },
      onStorageBinSubmit: function (e) {
        var t = r.trim(e.getParameter("value")).toUpperCase();
        this.onStorageBinVerify(t);
      },
      onStartPacking: function (e) {
        var t = n.getPackStation();
        var a = this.byId(m).getValue();
        n.setBin(a);
        var u = l.getSelectedMode();
        this.setBusy(true);
        i.getMaterialAndExceptionList()
          .then(
            function (e) {
              if (e[0].length === 0) {
                throw new c(s.ERRORS.NO_MATERIAL);
              } else {
                o.setData(e[0]);
              }
              n.setExceptionList(e[1]);
            }.bind(this),
          )
          .then(
            function () {
              this.oContainer.setItemValue("workCenter", t);
              this.oContainer.setItemValue("storageBin", a);
              if (l.getSelectedMode() !== s.INTERNAL_MODE) {
                this.oContainer.setItemValue("packingMode", u);
              }
              return this.oContainer.save();
            }.bind(this),
          )
          .then(
            function () {
              var e = this.getRouter();
              if (u === s.ADVANCED_MODE) {
                e.navTo(s.ADVANCED_ROUTE_NAME);
              } else if (u === s.BASIC_MODE) {
                if (o.getFavoriteMaterials().length === 0) {
                  throw new c(s.ERRORS.NO_FAVORITE_MATERIAL);
                } else {
                  e.navTo(s.BASIC_ROUTE_NAME);
                }
              } else {
                e.navTo(s.INTERNAL_ROUTE_NAME);
              }
            }.bind(this),
          )
          .then(
            function () {
              this.setBusy(false);
            }.bind(this),
          )
          .catch(
            function (e) {
              if (r.isEmpty(e._vPara)) {
                if (e._sKey === s.ERRORS.NO_MATERIAL) {
                  var t = this.getI18nText(
                    "noMaterialInWarehouse",
                    n.getWarehouseNumber(),
                  );
                  this.showErrorMessageBox(t);
                } else if (e._sKey === s.ERRORS.NO_FAVORITE_MATERIAL) {
                  var i = this.getI18nText(
                    "noFavoriteMaterialInWorkCenter",
                    n.getPackStation(),
                  );
                  this.showErrorMessageBox(i);
                }
              }
              this.setBusy(false);
            }.bind(this),
          );
      },
      onDefaultInputLiveChanged: function () {
        this.byId(g).setEnabled(false);
      },
      focusDummyElement: function () {
        this.byId(p).setValue("");
        this.byId(p).focus();
      },
      onPackingModeChange: function (e) {
        var t = this.byId("mode-selection");
        var i = t.getSelectedKey();
        l.setSelectedMode(i);
        var o = n.getPackStation();
        var a = n.getBin();
        if (!r.isEmpty(o) && !r.isEmpty(a)) {
          this.byId(g).setEnabled(true);
        }
      },
      bindAudioAggregation: function () {
        var e = this.getAudioParent(this.oView);
        var t = new h("EWMWarehouse", d.EQ, n.getWarehouseNumber());
        e.getController().bindAudioList([t]);
      },
      getAudioParent: function (e) {
        if (e.byId && e.byId(f)) {
          this.oAudio = e;
        } else {
          this.getAudioParent(e.getParent());
        }
        return this.oAudio;
      },
      createStorageBinFilter: function (e, t) {
        var i = [s.STORAGEBIN_KEY, s.STORAGE_TYE];
        var n = this.getI18nText("storageBin");
        var r = this.getI18nText("storageType");
        var o = new sap.ui.comp.filterbar.FilterBar({
          advancedMode: true,
          filterBarExpanded: true,
          showGoOnFB: !sap.ui.Device.system.phone,
          filterGroupItems: [
            new sap.ui.comp.filterbar.FilterGroupItem({
              groupTitle: "foo",
              groupName: "gn1",
              name: "n1",
              label: n,
              control: new sap.m.Input(),
            }),
            new sap.ui.comp.filterbar.FilterGroupItem({
              groupTitle: "foo",
              groupName: "gn1",
              name: "n2",
              label: r,
              control: new sap.m.Input(),
            }),
          ],
          search: function (n) {
            var r = n
              .getParameters()
              .selectionSet[0].getProperty("value")
              .toUpperCase();
            var o = n
              .getParameters()
              .selectionSet[1].getProperty("value")
              .toUpperCase();
            var a = [];
            a.push(r);
            a.push(o);
            t(e, i, a);
          },
        });
        return o;
      },
      createWorkCenterFilter: function (e, t) {
        var i = [s.WORKCENTER_KEY, s.WORKCENTER_DESC];
        var n = this.getI18nText("workCenter");
        var r = this.getI18nText("workCenterDesc");
        var o = new sap.ui.comp.filterbar.FilterBar({
          advancedMode: true,
          filterBarExpanded: true,
          showGoOnFB: !sap.ui.Device.system.phone,
          filterGroupItems: [
            new sap.ui.comp.filterbar.FilterGroupItem({
              groupTitle: "foo",
              groupName: "gn1",
              name: "n1",
              label: n,
              control: new sap.m.Input(),
            }),
            new sap.ui.comp.filterbar.FilterGroupItem({
              groupTitle: "foo",
              groupName: "gn1",
              name: "n2",
              label: r,
              control: new sap.m.Input(),
            }),
          ],
          search: function (n) {
            var r = n
              .getParameters()
              .selectionSet[0].getProperty("value")
              .toUpperCase();
            var o = n
              .getParameters()
              .selectionSet[1].getProperty("value")
              .toUpperCase();
            var a = [];
            a.push(r);
            a.push(o);
            t(e, i, a);
          },
        });
        return o;
      },
      filterTable: function (e, t, i) {
        e.filter(r.getFilters(t, i));
      },
      handleWorkCenterValueHelp: function (e) {
        this.initWorkCenterModel();
        this.creatValueHelpDialog(
          "com.sz.packoutbdlv.view.WorkCenterValueHelpDialog",
          this.oWorkCenterColModel,
          this.oWorkCenterModel,
          this.createWorkCenterFilter.bind(this),
        );
      },
      handleStorageBinValueHelp: function (e) {
        this.initStorageBinModel();
        this.creatValueHelpDialog(
          "com.sz.packoutbdlv.view.StorageBinValueHelpDialog",
          this.oStorageBinColModel,
          this.oStorageBinModel,
          this.createStorageBinFilter.bind(this),
        );
      },
      creatValueHelpDialog: function (e, t, i, n) {
        var r = sap.ui.xmlfragment(e, this);
        this.getView().addDependent(r);
        r.getTable().setModel(t, "columns");
        r.getTable().setModel(i);
        this.initTableBinding(r);
        var o = r.getTable().getBinding();
        var a = n(o, this.filterTable);
        r.setFilterBar(a);
        r.open();
        r.update();
      },
      _handleValueHelpClose: function (e) {
        var t = e.getSource();
        t.close();
      },
      _handleWorkCenterValueHelpOK: function (e) {
        var t = e.getSource();
        var i = e.getParameter("tokens").length;
        if (i > 0) {
          var n = e.getParameter("tokens")[i - 1];
          var r = n.getKey();
          this.byId(E).setValue(r);
          this.byId(g).setEnabled(false);
          this.i(r);
        }
        t.close();
      },
      _handleStorageBinValueHelpOK: function (e) {
        var t = e.getSource();
        var i = e.getParameter("tokens").length;
        if (i > 0) {
          var n = e.getParameter("tokens")[i - 1];
          var r = n.getKey();
          this.byId(g).setEnabled(false);
          this.byId(m).setValue(r);
          this.onStorageBinVerify(r);
        }
        t.close();
      },
      _handleValueHelpCancle: function (e) {
        var t = e.getSource();
        t.close();
      },
      _handleValueHelpAfterClose: function (e) {
        var t = e.getSource();
        t.destroy();
      },
      formatUpperCase: function (e) {
        if (!r.isEmpty(e)) {
          return e.toUpperCase();
        } else {
          return "";
        }
      },
    });
  },
);
//# sourceMappingURL=DefaultBin.controller.js.map
