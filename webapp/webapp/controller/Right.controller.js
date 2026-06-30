sap.ui.define(
  [
    "com/sz/packoutbdlv/controller/WorkFlowController",
    "com/sz/packoutbdlv/modelHelper/Global",
    "com/sz/packoutbdlv/service/ODataService",
    "com/sz/packoutbdlv/modelHelper/Message",
    "com/sz/packoutbdlv/utils/Util",
    "com/sz/packoutbdlv/model/Material",
    "com/sz/packoutbdlv/modelHelper/Material",
    "com/sz/packoutbdlv/modelHelper/Items",
    "sap/ui/model/json/JSONModel",
    "com/sz/packoutbdlv/modelHelper/OData",
    "com/sz/packoutbdlv/utils/Const",
    "com/sz/packoutbdlv/modelHelper/Cache",
    "com/sz/packoutbdlv/utils/CustomError",
    "sap/m/ValueColor",
    "sap/ui/core/ValueState",
    "sap/m/MessageBox",
    "com/sz/packoutbdlv/modelHelper/ItemWeight",
    "com/sz/packoutbdlv/model/AdvancedShipTableSetting",
    "com/sz/packoutbdlv/modelHelper/ColumnSettings",
    "com/sz/packoutbdlv/modelHelper/PackingMode",
    "com/sz/packoutbdlv/model/PackingMode",
    "com/sz/packoutbdlv/model/BasicShipTableSetting",
    "com/sz/packoutbdlv/model/InternalShipTableSetting",
    "sap/m/MessageItem",
    "sap/m/MessageView",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    e,
    t,
    i,
    a,
    r,
    n,
    s,
    o,
    l,
    u,
    h,
    g,
    c,
    d,
    p,
    f,
    m,
    I,
    v,
    S,
    b,
    T,
    y,
    C,
    H,
    E,
    M,
    U,
    N,
  ) {
    "use strict";
    var k = "quantity_input";
    var P = "shipHU-";
    var D = "weight-chart-id";
    var B = "weight-comparison-id";
    var W = "actual-weight-input";
    var w = "empty-material-msg-strip";
    var A = "no-change-strip";
    var x = "empty-material-strip";
    var F = "packaging-material-table";
    return e.extend("com.sz.packoutbdlv.controller.Right", {
      oItemHelper: new o(new l([])),
      oColumnSettingsHelper: new v(new l([])),
      init: function () {
        sap.ui.Device.resize.attachHandler(
          function () {
            this.adjustContainerHeight();
          }.bind(this),
        );
        this.setModel(b, "packMode");
        this.oInitTab = this.getTabByIndex(0);
        this.oInitTab.setText(h.INIT_TAB_TITLE);
        var e = this.getWeightChartByTitle(h.INIT_TAB_TITLE);
        if (!r.isEmpty(e)) {
          e.setTooltip("");
        }
        r.flushPendings.set(this.flushPendings.bind(this));
        var t = this;
        this.oTemplate = new sap.m.Button({
          type: {
            path: "material>Selected",
            formatter: t.formatMaterialButtonType,
          },
          text: {
            parts: [
              { path: "material>DisplayCode" },
              { path: "material>PackagingMaterialDescription" },
              { path: "material>PackagingMaterial" },
            ],
            formatter: t.formatFavoriteMaterialText,
          },
          enabled: {
            path: "global>/pendingTaskNumber",
            formatter: t.formatSimpleMaterialButtonEnable,
          },
          press: t.onPressMaterial.bind(t),
          width: "100%",
        });
        this.setButtonToolTip("delete-ship-unit");
        this.setButtonToolTip("create-ship-unit");
        this.setButtonToolTip("print-button");
        this.setButtonToolTip("unpack-all-button");
        this.setButtonToolTip("unpack-button");
        this.setButtonToolTip("id-weight");
        this.setButtonToolTip("close-ship-hu");
        this.setButtonToolTip("close-closed-ship-hu");
        this.getRouter().attachRouteMatched(this.onRouteMatched, this);
        i.setChangeGroups({
          UpdateTrackNumber: { groupId: "update_trackNos", single: false },
          Print: { single: true },
        });
      },
      initModel: function () {
        this.sTableId = "ShipProductTable";
        this.setModel(this.oItemHelper.getModel(), h.ITEM_MODEL_NAME);
        this.setModel(n, "material");
        this.setModel(
          this.oColumnSettingsHelper.getModel(),
          h.COLUM_SETTING_MODEL_NAME,
        );
      },
      bindStorageBin: function () {
        this.byId("bin-input").bindElement({
          path:
            "/PackingStationSet(EWMWarehouse='" +
            t.getWarehouseNumber() +
            "',EWMWorkCenter='" +
            t.getPackStation() +
            "',EWMStorageBin='')",
        });
      },
      getPersonlServiceContainerItemName: function () {
        if (S.isAdvancedMode()) {
          return "advancedShipTableSettings";
        } else if (S.isBasicMode()) {
          return "basicShipTableSettings";
        } else {
          return "internaldShipTableSettings";
        }
      },
      getDefaultColumnSettingNameInService: function () {
        if (S.isAdvancedMode()) {
          return "advancedShipDefaultSettings";
        } else if (S.isBasicMode()) {
          return "basicShipDefaultSettings";
        } else {
          return "internalShipDefaultSettings";
        }
      },
      getDefaultColumnSetting: function () {
        if (S.isAdvancedMode()) {
          return JSON.parse(
            JSON.stringify(this._mAdvancedShipTableDefaultSettings),
          );
        } else if (S.isBasicMode()) {
          return JSON.parse(
            JSON.stringify(this._mBasicShipDefaultDefaultSettings),
          );
        } else {
          return JSON.parse(
            JSON.stringify(this._mInternalShipTableDefaultSettings),
          );
        }
      },
      getViewName: function () {
        return h.VIEW_SHIP;
      },
      getTableSettingDialogName: function () {
        return "com.sz.packoutbdlv.view.ShipTableSettingDialog";
      },
      onAfterRendering: function () {
        this.adjustContainerHeight();
      },
      formatMaterialButtonType: function (e) {
        if (e === true) {
          return sap.m.ButtonType.Emphasized;
        }
        return sap.m.ButtonType.Default;
      },
      onProductItemPressed: function (e) {
        this.oItemHelper.setItemsStatusToNone();
        var t = e.getSource().getBindingContext(h.ITEM_MODEL_NAME);
        var i = t.getPath();
        var a = t.getModel();
        a.setProperty(i + "/Status", sap.ui.core.MessageType.Success);
        this.focus(k);
      },
      updateUIElementsAfterCloseShipHU: function (e, i) {
        var r;
        this.setBusy(false);
        if (e.MsgVar === "") {
          r = this.getI18nText(
            "closeShippingHU",
            t.getCurrentShipHandlingUnit(),
          );
          a.addSuccess(r);
          this.playAudio(h.INFO);
        }
        this.updateInputWithDefault(h.ID.SHIP_INPUT, "");
      },
      adjustContainerHeight: function () {
        var e = this.getView();
        var t = e.getParent().getContent()[0];
        var i = e.byId("right-container");
        var a = t.byId("left-container");
        var r = document.getElementById(a.getId());
        var n = document.getElementById(i.getId());
        if (!r || !n) {
          return;
        }
        var s = e.byId("right-grid");
        var o = t.byId("left-grid");
        var l = document.getElementById(s.getId());
        var u = document.getElementById(o.getId());
        var h = l.offsetTop + l.offsetHeight;
        var g = u.offsetTop + u.offsetHeight;
        if (g > h) {
          i.setHeight(g + "px");
          a.setHeight(g + "px");
        } else {
          i.setHeight(h + "px");
          a.setHeight(h + "px");
        }
      },
      delayCalledAdjustContainerHeight: function () {
        jQuery.sap.delayedCall(0, this, this.adjustContainerHeight);
      },
      getTabByIndex: function (e) {
        var t = this.byId("shipHUBar");
        var i = t.getItems();
        return i[e];
      },
      getTabId: function (e) {
        var t = r.getStringCharCode(e);
        return P + t;
      },
      getElementInTab: function (e, t) {
        var i = sap.ui.core.Fragment.createId(this.getTabId(e), t);
        return sap.ui.getCore().byId(i);
      },
      updatePackingInstr: function (e, t) {
        if (r.isEmpty(e) || r.isEmpty(t)) {
          this.clearPackingInstr();
          return;
        }
        this.setPackingInstrText(t);
        var i = this.getI18nText("checkPackingInstr", e);
        a.addSuccess(i);
        this.playAudio(h.INFO);
      },
      clearPackingInstr: function () {
        this.setPackingInstrText("");
      },
      setPackingInstrText: function (e) {
        var i = t.getCurrentShipHandlingUnit();
        if (r.isEmpty(i)) {
          return;
        }
        var a = this.getElementInTab(i, "id-packing-instruction");
        if (!r.isEmpty(a)) {
          a.setText(e);
        }
      },
      hasTabByTitle: function (e) {
        var t = this.getTabIndexByTitle(e);
        if (t === -1) {
          return false;
        } else {
          return true;
        }
      },
      getTabByTitle: function (e) {
        var t = this.byId("shipHUBar");
        var i = t.getItems();
        var a = this.getTabIndexByTitle(e);
        if (a === -1) {
          throw new c();
        } else {
          return i[a];
        }
      },
      getTabIndexByTitle: function (e) {
        var t = this.byId("shipHUBar");
        var i = t.getItems();
        var a = this;
        var n = r.findIndex(i, function (t) {
          var i = t.getText();
          if (i === e || i === a.decoratTabtitle(e)) {
            return true;
          }
          return false;
        });
        if (n === -1) {
          return -1;
        }
        return n;
      },
      decoratTabtitle: function (e) {
        return "*" + e + "*";
      },
      onPressMaterial: function (e) {
        var i = e.getSource();
        var a = i.getBindingContext("material").sPath;
        var n = s.getFavoriteMaterialIdByPath(a);
        if (s.IsSelectedMaterialExternal(n)) {
          var o = this.getI18nText("createShipHUContactAdmin");
          this.showErrorMessageBox(o);
          return;
        }
        var l = s.getCurrentMaterialId();
        if (r.isEmpty(l)) {
          var u = {};
          u.sHuId = "";
          u.sMaterialId = n;
          this.setBusy(true);
          this.getWorkFlowFactory().getShipHUCreationWorkFlow().run(u);
        } else {
          if (l === n) {
            return;
          } else {
            this.setBusy(true);
            s.setSelectedMaterialId(n);
            this.getWorkFlowFactory()
              .getMaterialChangeWorkFlow()
              .run(t.getCurrentShipHandlingUnit());
          }
        }
      },
      initiateMaterialTable: function (e, t) {
        var i = this.byId(e);
        i.destroyColumns();
        for (var a = 0; a < t; a++) {
          i.addColumn(new sap.m.Column());
        }
      },
      addTooltipToFavoriteMaterial: function (e) {
        var t = this.byId(e);
        var i = t.getItems();
        var a = s.getFavoriteMaterials();
        var n = 0;
        i.forEach(function (e) {
          var t = e.getCells();
          t.forEach(function (e) {
            var t = a[n++];
            var i = t.PackagingMaterial;
            if (!r.isEmpty(t.PackagingMaterialDescription)) {
              i += " - " + t.PackagingMaterialDescription;
            }
            e.setTooltip(i);
          });
        });
      },
      onOpenCreateShipHUDialog: function () {
        return new Promise(
          function (e, t) {
            var i = this.getView();
            if (!this.oHandlingUnitDialog) {
              this.oHandlingUnitDialog = sap.ui.xmlfragment(
                i.getId(),
                "com.sz.packoutbdlv.view.CreateDialog",
                this,
              );
              this.initiateMaterialTable(F, 2);
              i.addDependent(this.oHandlingUnitDialog);
            }
            if (!this.oHandlingUnitDialog.isOpen()) {
              this.updateInputWithDefault(h.ID.CREATE_SHIP_INPUT, "");
              this.oHandlingUnitDialog.open();
            }
            this.addTooltipToFavoriteMaterial(F);
          }.bind(this),
        );
      },
      onBeforeOpenCreateDialog: function () {
        var e = s.getDefaultMaterialId();
        if (r.isEmpty(e)) {
          s.setSelectedMaterialId("");
        } else {
          s.setMaterialPressedById(e, true);
          s.setSelectedMaterialId(e);
        }
        this.bindStorageBin();
      },
      onAfterOpenCreateDialog: function () {
        this.focus("other-material-combo");
      },
      onAfterCloseCreateDialog: function () {
        this.getView()
          .getParent()
          .getContent()[0]
          .byId("product-input")
          .focus();
        this.clearComboBox("other-material-combo");
        this.setMessageStripVisible(w, false);
        s.clearFormerPressedMaterial();
        s.setSelectedMaterialId("");
        this.updateInputWithDefault(h.ID.CREATE_SHIP_INPUT, "");
      },
      handleButtonsEnableAfterCreate: function (e) {
        if (!r.isEmpty(t.getSourceId()) && !u.isShipHUClosed()) {
          if (e.isSingleConsGroupNoReduction && !e.isSNEnable) {
            t.setPackAllEnable(true);
          }
          var i = t.getProductId();
          if (!r.isEmpty(i)) {
            t.setExceptionEnable(true);
          }
        }
        this.handleUnpackEnable();
      },
      formartTrackingNumber: function (e, t) {
        var i = "";
        if (!e || e !== "") {
          i = e;
        }
        if (i === "" && t === "A") {
          i = this.getI18nText("internalTrackingNumber", []);
        } else if (i === "" && t === "B") {
          i = this.getI18nText("autoTrackingNumber", []);
        }
        return i;
      },
      onUpdateTrackingNumberFromInput: function (e) {
        var t = e.getSource().getValue();
        var i = e.getSource().getBindingContext("trackNumberModel").getPath();
        e.getSource()
          .getModel("trackNumberModel")
          .setProperty(`${i}/TrackNum`, t);
      },
      onOpenAssignTrackNumberDialog: function (e, i) {
        return new Promise(
          function (a, r) {
            var n = this.getView();
            if (!this.oTrkNumberDialog) {
              this.oTrkNumberDialog = sap.ui.xmlfragment(
                n.getId(),
                "com.sz.packoutbdlv.view.AssignTrackingNumberDialog",
                this,
              );
              n.addDependent(this.oTrkNumberDialog);
            }
            if (i) {
              var s = t.getCurrentShipHandlingUnit();
              e = e.filter((e) => e.Huid === s);
            }
            var o = e.map(function (e) {
              return {
                Huid: e.Huid,
                TrackNum: e.TrackNum || "",
                Requirement: e.TracknumRequirement,
                preAssigned: e.TrackNum && e.TrackNum !== "" ? true : false,
              };
            });
            this.oTrkNumberDialog.setModel(new l(o), "trackNumberModel");
            if (!this.oTrkNumberDialog.isOpen()) {
              this.oTrkNumberDialog.setBusy(false);
              this.oTrkNumberDialog.open();
            }
            this.oTrkNumberDialog.resolve = a;
            this.oTrkNumberDialog.reject = r;
          }.bind(this),
        );
      },
      onScanTrackNumber: function (e) {
        var t = this.getView().byId("upd-trk-num-tab");
        var i = t.getItems();
        var a = false;
        for (let e = 0; e < i.length; e++) {
          const t = i[e];
          var r = t.getCells();
          if (r[1].getValue().trim() === "") {
            this.focus(r[1]);
            a = true;
            break;
          }
        }
        if (!a) this.onUpdateTrackingNumbers(null);
      },
      onUpdateTrackingNumbers: function (e) {
        var t = this.oTrkNumberDialog.getModel("trackNumberModel");
        var i = t.getData();
        var a = i.filter(
          (e) =>
            e.TrackNum === "" && e.Requirement === h.TRACK_REQUIREMENT.POPUP,
        );
        if (a.length > 0) {
          var r = this.getI18nText("enterAllTrackNumbersMessage", []);
          this.showErrorMessageBox(r);
          return;
        }
        var n = i.filter(
          (e) =>
            (e.Requirement === h.TRACK_REQUIREMENT.POPUP &&
              e.TrackNum.trim() !== "") ||
            (e.TrackNum.trim() === "" &&
              e.Requirement !== h.TRACK_REQUIREMENT.POPUP),
        );
        this.getWorkFlowFactory().getUpdateTrackingNumberWorkFlow().run(n);
      },
      showUpdateTrackingBackendErrors: function (e) {
        var t = new C({
          type: "{type}",
          title: "{title}",
          description: "{description}",
        });
        var i = e.map(function (e) {
          return {
            type: "Error",
            title: e.getDescription(),
            description: e.getKey(),
          };
        });
        var a = new H({ items: { path: "/", template: t } });
        var r = new l(i);
        a.setModel(r);
        new E({
          title: this.getI18nText("trackingNumberUpdateMessagesDialog", []),
          resizable: true,
          content: a,
          type: "Message",
          beginButton: new M({
            text: this.getI18nText("btnTextClose", []),
            press: function () {
              this.getParent().close();
            },
          }),
          showHeader: false,
          contentHeight: "50%",
          contentWidth: "50%",
          verticalScrolling: false,
        }).open();
      },
      onTrackNumberDialogClose: function () {
        this.oTrkNumberDialog.reject(true);
      },
      needAutoCreateShippingHU: function (e) {
        var i = t.getShipHandlingUnits();
        if (S.isInternalMode()) {
          return i.length === 0;
        }
        var a = false;
        if (i.length === 0) {
          a = true;
        } else {
          if (r.isEmpty(e)) {
            return false;
          } else {
            var n = this.getShippingHUsByConsolidationGroup(e);
            var s = this.getEmptyShipHus();
            if (n.length === 0 && s.length === 0) {
              a = true;
            }
          }
        }
        return a;
      },
      onOpenDeleteShipHUDialog: function () {
        var e = t.getCurrentShipHandlingUnit();
        var i;
        if (this.oItemHelper.isEmpty()) {
          i = this.getTextAccordingToMode(
            "deleteEmptyHU",
            "deleteEmptyShipHU",
            [e],
          );
        } else {
          i = this.getTextAccordingToMode(
            "deleteNonEmptyHU",
            "deleteNonEmptyShipHU",
            [e, t.getSourceId()],
          );
        }
        f.warning(i, {
          actions: [f.Action.OK, f.Action.CANCEL],
          onClose: function (e) {
            if (e === f.Action.OK) {
              this.setBusy(true);
              var i = false;
              if (!this.oItemHelper.isEmpty()) {
                i = t.isPackFromBin() || t.isSourceTypeODO();
              }
              var a = { bCallService: true, bRefreshSource: i };
              this.getWorkFlowFactory().getShipHUDeleteWorkFlow().run(a);
            }
          }.bind(this),
        });
        this.playAudio(h.WARNING);
      },
      deleteCurrentShipHandlingUnit: function () {
        this.oItemHelper.clear();
        var e = t.getCurrentShipHandlingUnit();
        t.removeShipHandlingUnit(e);
        s.setCurrentMaterial({});
      },
      getShippingHUsByConsolidationGroup: function (e) {
        var i = t.getShipHandlingUnits();
        var a = [];
        i.forEach(function (t) {
          if (g.getShipHUConsGroup(t) === e && !u.isShipHUClosed(t)) {
            a.push(t);
          }
        });
        return a;
      },
      handleUnpackEnable: function () {
        if (
          t.getPendingTaskNumber() === 0 &&
          !t.getCurrentShipHandlingUnitClosed() &&
          !r.isEmpty(t.getSourceId()) &&
          !this.oItemHelper.isEmpty() &&
          this.oItemHelper.getHighLightedItemIndex() === 0 &&
          t.getSourceType() !== h.SOURCE_TYPE_ODO
        ) {
          t.setUnpackEnable(true);
        } else {
          t.setUnpackEnable(false);
        }
      },
      autoCreateShipHUAfterClose: function () {
        var e = s.getDefaultMaterialId();
        var t = s.getCurrentMaterialId();
        if (r.isEmpty(e)) {
          return;
        }
        var i = {};
        i.sHuId = "";
        i.sMaterialId = e;
        this.setBusy(true);
        this.getWorkFlowFactory().getShipHUCreationWorkFlow().run(i);
        s.setFavoriteMaterialSelectedById(e, true);
        s.setFavoriteMaterialSelectedById(t, false);
      },
      onShipHUIDChange: function (e) {
        var t = r.trim(e.getParameter("newValue")).toUpperCase();
        this._changeHandlingUnitId(h.ID.CREATE_SHIP_INPUT, "create", t);
      },
      onShipHUIDSubmit: function (e) {
        if (this.byId(h.ID.CREATE_SHIP_INPUT).getValueState() === "None") {
          this.byId("create").firePress();
        }
      },
      onChangeShippingHUId: function (e) {
        var i = r.trim(e.getParameter("newValue")).toUpperCase();
        this._changeHandlingUnitId(
          h.ID.CHANGE_SHIP_INPUT,
          "confirm-change-material-button",
          i,
        );
        if (i !== t.getCurrentShipHandlingUnit()) {
          this.setMessageStripVisible(A, false);
        } else {
          var a = this.getTextAccordingToMode(
            "changeHUMaterialWithOldId",
            "changeShipHUMaterialWithOldId",
          );
          this.updateInputWithError(h.ID.CHANGE_SHIP_INPUT, a);
          this.playAudio(h.ERROR);
        }
      },
      onChangeShippingHUIdSubmit: function () {
        if (this.byId(h.ID.CHANGE_SHIP_INPUT).getValueState() === "None") {
          this.byId("confirm-change-material-button").firePress();
        }
      },
      _changeHandlingUnitId: function (e, t, i) {
        if (r.isEmpty(s.getSelectedMaterialId())) {
          this.updateInputWithDefault(e, i);
        } else if (s.IsSelectedMaterialExternal()) {
          if (i === "") {
            this.updateInputWithError(e);
            this.playAudio(h.ERROR);
            return;
          } else {
            this.updateInputWithDefault(e, i);
          }
        } else {
          this.updateInputWithDefault(e, i);
        }
      },
      onToggleMaterial: function (e) {
        var t = e.getSource();
        var i = t.getBindingContext("material");
        var a = i.sPath;
        if (t.getPressed()) {
          s.clearFormerPressedMaterial();
          var r = s.getMaterialIdByPath(a);
          s.setSelectedMaterialId(r);
          this.setMessageStripVisible(w, false);
          this.clearComboBox("other-material-combo");
        } else {
          s.setSelectedMaterialId("");
        }
        this.focus(h.ID.CREATE_SHIP_INPUT);
      },
      onSelectOtherMaterial: function (e) {
        var i = r.trim(e.getParameter("newValue"));
        setTimeout(
          function () {
            var e = this.byId("other-material-combo");
            var a = e._sInputValueBeforeOpen;
            if (a.trim() !== "") {
              return;
            }
            var n = e.getSelectedKey();
            if (!r.isEmpty(n)) {
              this.updateInputWithDefault("other-material-combo");
              s.clearFormerPressedMaterial();
              s.setSelectedMaterialId(n);
              this.setMessageStripVisible(w, false);
              var o = t.getBin();
              if (!o || o.trim() === "") {
                this.focus("bin-input");
              }
            } else {
              if (!r.isEmpty(i)) {
                this.updateInputWithError(
                  "other-material-combo",
                  this.getI18nText("incorrectMaterial"),
                );
              }
            }
          }.bind(this),
          0,
        );
      },
      onCreateShippingHU: function (e) {
        var i = e.getSource().getParent();
        var a = this.getView().byId(h.ID.CREATE_SHIP_INPUT);
        var n = a.getValue();
        var o = t.getBin();
        if (o.trim() === "") {
          var l = this.getView().byId("bin-input");
          o = l.getValue();
          if (o.trim() === "") {
            l.setValueState(p.Error);
            l.setValueStateText(this.getI18nText("enterStorageBin", []));
            return;
          } else {
            l.setValue("");
            l.setValueState(p.None);
          }
        }
        var u = s.getSelectedMaterialId();
        if (r.isEmpty(u)) {
          this.setMessageStripVisible(w, true);
          this.playAudio(h.ERROR);
          return;
        } else if (s.IsSelectedMaterialExternal("")) {
          if (n === "") {
            this.updateInputWithError(h.ID.CREATE_SHIP_INPUT);
            this.focus(h.ID.CREATE_SHIP_INPUT);
            this.playAudio(h.ERROR);
            return;
          }
        }
        var g = {};
        g.sHuId = n;
        g.sBin = o;
        g.sMaterialId = u;
        g.oDialog = i;
        i.setBusy(true);
        this.getWorkFlowFactory().getShipHUCreationWorkFlow().run(g);
      },
      onPrint: function () {
        this.getWorkFlowFactory().getPrintWorkFlow().run();
      },
      onShipAll: function () {
        this.getWorkFlowFactory().getPrintWorkFlow().run(true);
      },
      onRemoveClosedShipHU: function () {
        this.getWorkFlowFactory().getShipHUCloseWorkFlow().run(true);
      },
      onCancelShipHU: function () {
        var e = this.getView();
        var t = e.byId("cancelShipmentDialog");
        if (!t) {
          t = sap.ui.xmlfragment(
            e.getId(),
            "com.sz.packoutbdlv.view.CancelShipmentDialog",
            this,
          );
          t.attachAfterClose(function () {
            this.getView().byId("cancelShipFilterBar").fireClear();
          }, this);
          t.setModel(new l({ selectedKey: "01" }), "filterSelectCSD");
          e.addDependent(t);
        }
        t.open();
      },
      dialogClose: function (e) {
        var t = this.getView().byId(e);
        if (t) {
          t.close();
        }
      },
      onCancelShipmentDialog: function () {
        this.dialogClose("cancelShipmentDialog");
      },
      onConfirmShipmentDialog: function () {
        this.getWorkFlowFactory().getCancelShipmentWorkflow().run();
      },
      onBeforeShipDataSearch: function (e) {
        var i = new U({
          path: "Lgnum",
          operator: N.EQ,
          value1: t.getWarehouseNumber(),
        });
        var a = new U({
          path: "PackStation",
          operator: N.EQ,
          value1: t.getPackStation(),
        });
        var r = e.getParameter("bindingParams").filters;
        e.getParameter("bindingParams").filters = r.concat([i, a]);
      },
      updateParameterAfterCreation: function (e, i) {
        var a = e.HuId;
        i.sHuId = e.HuId;
        i.fLoadingWeight = r.parseNumber(r.formatNumber(e.NetWeight, 2));
        i.sWeightUoM = e.WeightUoM;   
        t.addShipHandlingUnit(a);
        this.setCurrentShipHandlingUnit(a);
        s.setCurrentMaterialById(i.sMaterialId);
        //20260630 - update the material odata model
        //with the vol and lwh uom
        s.setCurrentLWHUoM(e.UnitLwh);
        s.setCurrentVolUoM(e.UnitGv);
      },
      updateMaterialButtonsAfterCreation: function (e) {
        var t = s.getDefaultMaterialId();
        if (!r.isEmpty(t)) {
          s.setFavoriteMaterialSelectedById(t, false);
        }
        s.setFavoriteMaterialSelectedById(e, true);
      },
      updateDataBingdingAfterCreation: function (e) {
        this.oItemHelper.clear();
      },
      handlePackAllEnableAfterCreate: function (e) {
        if (!r.isEmpty(t.getSourceId()) && !u.isShipHUClosed()) {
          if (e.isSingleConsGroupNoReduction && !e.isSNEnable) {
            t.setPackAllEnable(true);
          }
        }
      },
      createNewTab: function (e, t) {
        return new Promise(
          function (i, a) {
            var r = this.getView();
            var n = r.byId("shipHUBar");
            this.oInitTab.setVisible(false);
            var s = sap.ui.core.Fragment.byId(
              this.getTabId(e),
              "pod--tab--grid--layout",
            );
            if (!s) {
              var o = sap.ui.xmlfragment(this.getTabId(e), t, this);
              o.setKey(e);
              o.setText(e);
              n.insertItem(o, 0);
              n.setSelectedKey(e);
              this.delayCalledAdjustContainerHeight();
            }
            i(e);
          }.bind(this),
        );
      },
      onEditMaterial: function (e) {
        var t = this.getView();
        var i = t.byId("change-material-dialog");
        if (!i) {
          i = sap.ui.xmlfragment(
            t.getId(),
            "com.sz.packoutbdlv.view.ChangeMaterialDialog",
            this,
          );
          this.initiateMaterialTable("pack-material-table", 2);
          t.addDependent(i);
        }
        i.open();
        this.addTooltipToFavoriteMaterial("pack-material-table");
      },
      onBeforeOpenChangeMaterial: function () {
        var e = s.getCurrentMaterialId();
        s.setOriginalMaterialId(e);
        s.setSelectedMaterialId(e);
        if (s.IsMaterialFavorite(e)) {
          s.setMaterialPressedById(e, true);
        } else {
          var t = this.getView().byId("change-material-combo");
          t.setSelectedKey(e);
        }
      },
      onAfterOpenChangeMaterial: function () {
        this.focus(h.ID.CHANGE_SHIP_INPUT);
      },
      onAfterCloseChangeDialog: function () {
        this.clearComboBox("change-material-combo");
        s.clearFormerPressedMaterial();
        s.setSelectedMaterialId("");
        this.setMessageStripVisible(x, false);
        this.setMessageStripVisible(A, false);
        this.setMessageStripVisible(h.ID.ERROR_MATERIAL_STRIP, false);
        this.updateInputWithDefault(h.ID.CHANGE_SHIP_INPUT, "");
      },
      onChangeMaterial: function (e) {
        var i = e.getSource().getParent();
        var a = this.getView().byId(h.ID.CHANGE_SHIP_INPUT).getValue();
        var n = s.getCurrentMaterialId();
        var o = s.getSelectedMaterialId();
        var l = t.getCurrentShipHandlingUnit();
        this.setMessageStripVisible(h.ID.ERROR_MATERIAL_STRIP, false);
        if (r.isEmpty(o)) {
          this.setMessageStripVisible(x, true);
          return;
        } else if (s.IsSelectedMaterialExternal()) {
          if (a === "") {
            this.updateInputWithError(h.ID.CHANGE_SHIP_INPUT);
            this.playAudio(h.ERROR);
            this.focus(h.ID.CHANGE_SHIP_INPUT);
            return;
          }
        }
        var u = s.getOriginalMaterialId();
        if (o === u && l === a) {
          if (!this.getView().byId(A).getVisible()) {
            this.getView().byId(A).setVisible(true);
            this.playAudio(h.WARNING);
          } else {
            i.close();
          }
          return;
        }
        var g = {};
        g.sHuId = a;
        g.oDialog = i;
        g.bMaterialChanged = n !== o;
        i.setBusy(true);
        this.getWorkFlowFactory().getMaterialChangeWorkFlow().run(g);
      },
      onToggleMaterialInChange: function (e) {
        var t = e.getSource();
        var i = t.getBindingContext("material");
        var a = i.sPath;
        if (t.getPressed()) {
          s.clearFormerPressedMaterial();
          var r = s.getMaterialIdByPath(a);
          s.setSelectedMaterialId(r);
          this.setMessageStripVisible(x, false);
          this.clearComboBox("change-material-combo");
          if (r !== s.getOriginalMaterialId()) {
            this.setMessageStripVisible(A, false);
          }
        } else {
          s.setSelectedMaterialId("");
        }
        this.focus(h.ID.CHANGE_SHIP_INPUT);
      },
      onSelectOtherMaterialInChange: function (e) {
        var t = r.trim(e.getParameter("newValue"));
        setTimeout(
          function () {
            var e = this.byId("change-material-combo");
            var i = e.getSelectedKey();
            if (!r.isEmpty(i)) {
              this.updateInputWithDefault("change-material-combo");
              s.clearFormerPressedMaterial();
              s.setSelectedMaterialId(i);
              this.setMessageStripVisible(w, false);
              if (i !== s.getOriginalMaterialId()) {
                this.setMessageStripVisible(A, false);
              }
            } else {
              if (!r.isEmpty(t)) {
                this.updateInputWithError(
                  "change-material-combo",
                  this.getI18nText("incorrectMaterial"),
                );
              }
            }
          }.bind(this),
          0,
        );
      },
      recreateTab: function (e, t, i) {
        return new Promise(
          function (a, r) {
            var n = this.getView();
            var s = n.byId("shipHUBar");
            if (e !== t) {
              var o = this.getTabIndexByTitle(e);
              var l = this.getTabByTitle(e);
              l.destroy();
              var u;
              if (i) {
                u = sap.ui.xmlfragment(
                  this.getTabId(t),
                  "com.sz.packoutbdlv.view.SimpleTabContent",
                  this,
                );
              } else {
                u = sap.ui.xmlfragment(
                  this.getTabId(t),
                  "com.sz.packoutbdlv.view.TabContent",
                  this,
                );
              }
              u.setKey(t);
              u.setText(t);
              s.insertItem(u, o);
              s.setSelectedKey(t);
              this.delayCalledAdjustContainerHeight();
              g.replaceShipHUConsGroup(e, t);
            }
            a(t);
          }.bind(this),
        );
      },
      updateMaterialButtonsAfterChange: function () {
        s.setFavoriteMaterialSelectedById(s.getCurrentMaterialId(), false);
        s.setFavoriteMaterialSelectedById(s.getSelectedMaterialId(), true);
      },
      updateCurrentMaterialAfterChange: function () {
        var e = s.getMaterialById(s.getSelectedMaterialId());
        s.setCurrentMaterial(e);
      },
      onCloseCurrentShipHU: function (e) {
        this.getWorkFlowFactory().getShipHUCloseWorkFlow().run();
      },
      formatCloseBtn: function (e, i) {
        if (!r.isEmpty(i)) {
          if (!this.oItemHelper || this.oItemHelper.isEmpty()) {
            t.setCloseShipHUEnable(false);
            return false;
          }
          t.setCloseShipHUEnable(true);
          return true;
        }
        t.setCloseShipHUEnable(false);
        return false;
      },
      removeTabByTabName: function (e) {
        return new Promise(
          function (t, i) {
            var a = this.getTabByTitle(e);
            a.destroy();
            this.delayCalledAdjustContainerHeight();
            t();
          }.bind(this),
        );
      },
      removeTabAfterClose: function (e) {
        this.removeTabByTabName(e).then(
          function () {
            this.oItemHelper.clear();
          }.bind(this),
        );
      },
      onChangeQuantityPack: function (e) {
        var t = e.getSource();
        var i = r.trim(e.getParameter("newValue"));
        if (!r.isEmpty(i)) {
          var a = r.parseNumber(i);
          var n = r.formatNumber(a);
          if (r.isEmpty(n) || a < 0) {
            var s = this.getI18nText("inputQuantityNotice");
            this.updateInputWithError(t, s);
            this.playAudio(h.ERROR);
          } else {
            this.updateInputWithDefault(t);
            var o = t.getBindingContext(h.ITEM_MODEL_NAME).getObject();
            var l = {
              oProduct: o,
              iQuantity: r.formatNumber(
                r.parseNumber(i) - r.parseNumber(o.PreviousAlterQuan),
                3,
              ),
              mSource: t,
            };
            if (l.iQuantity !== 0) {
              this.getWorkFlowFactory().getQuantityChangeWorkFlow().run(l);
            }
          }
        } else {
          this.updateInputWithError(t);
          this.playAudio(h.ERROR);
        }
      },
      onActualWeightChangeSimple: function (e) {
        this.checkActualWeight(e, [
          function () {
            this.setBusy(false);
          }.bind(this),
        ]);
      },
      onActualWeightChangeAdvanced: function (e) {
        this.checkActualWeight(e, [
          function () {
            return i.getHUSet(t.getCurrentShipHandlingUnit(), h.SHIP_TYPE_HU);
          },
          function (e) {
            this.setBusy(false);
            var t = r.parseNumber(r.formatNumber(e.NetWeight, 2));
            this.updateNetWeightRelated(t, e.WeightUoM);
          }.bind(this),
        ]);
      },
      checkActualWeight: function (e, a) {
        var n = e.getSource();
        var o = r.trim(e.getParameter("newValue"));
        var l = r.isEmpty(o);
        var g = r.parseNumber(o);
        var c = r.formatNumber(g, 3);
        var d = r.parseNumber(
          r.formatNumber(s.getCurrentMaterialMaxWeightTol(), 3),
        );
        var p = r.parseNumber(
          r.formatNumber(s.getCurrentMaterialTareWeight(), 3),
        );
        var f = d + p;
        var m;
        if (l) {
          this.updateInputWithDefault(n, "");
        } else if (isNaN(g)) {
          this.updateInputWithError(n);
        } else if (g <= 0) {
          m = this.getI18nText("grossWeightLessThan0Error");
          this.updateInputWithError(n, m);
        } else {
          if (!this.checkQuantityOverflow(g, n)) {
            this.updateInputWithDefault(n, c);
          }
          var I = u.getHUInfo(t.getCurrentShipHandlingUnit(), h.SHIP_TYPE_HU);
          c = r.parseNumber(n.getValue()).toString();
          this.setBusy(true);
          var v = i.updateHU(I, c);
          a.forEach(function (e) {
            v = v.then(e);
          });
          v.catch(
            function () {
              this.setBusy(false);
              this.updateInputWithError(n);
            }.bind(this),
          );
        }
        n.focus();
      },
      restoreShipHUTabs: function (e) {
        this.clearShipHUTabs();
        e.forEach(
          function (e) {
            this.createNewTab(e.HuId);
          }.bind(this),
        );
      },
      clearShipHUTabs: function () {
        var e = this.byId("shipHUBar");
        var t = e.getItems();
        if (t.length > 1) {
          t.splice(t.length - 1, 1);
          t.forEach(function (e) {
            e.destroy();
          });
        }
      },
      onMaterialQuickView: function (e) {
        var t = e.getSource();
        var i = this.getView();
        var a = i.byId("material-quick-view");
        if (!a) {
          a = sap.ui.xmlfragment(
            i.getId(),
            "com.sz.packoutbdlv.view.MaterialQuickView",
            this,
          );
          i.addDependent(a);
        }
        a.openBy(t);
      },
      onGetScaleWeight: function (e) {
        this.setBusy(true);
        i.getScaleWeight()
          .then(
            function (e) {
              this.setBusy(false);
              var t = r.parseNumber(r.formatNumber(e.GrossWeight, 2));
              this.updateScaleWeight(t);
              var i = r.parseNumber(r.formatNumber(e.NetWeight, 2));
              this.updateNetWeightRelated(i, e.UoM);
            }.bind(this),
          )
          .catch(
            function () {
              this.setBusy(false);
            }.bind(this),
          );
      },
      formatQuickViewDisplay: function (e, t, i) {
        var a = parseFloat(t);
        if (a === 0) {
          return e;
        } else {
          t = r.formatNumber(a, 3);
          return e + " " + t + " " + i;
        }
      },
      updateZDimensionsRelated: function (e, i, a, n, s, o, l) {
        if (r.isEmpty(l)) {
          l = t.getCurrentShipHandlingUnit();
        }
        var u = sap.ui.core.Fragment.createId(
          this.getTabId(l),
          "hu-length-input",
        );
        var h = sap.ui.core.Fragment.createId(
          this.getTabId(l),
          "hu-width-input",
        );
        var g = sap.ui.core.Fragment.createId(
          this.getTabId(l),
          "hu-height-input",
        );
        var c = sap.ui.core.Fragment.createId(
          this.getTabId(l),
          "hu-volume-input",
        );
        var d = sap.ui.core.Fragment.createId(
          this.getTabId(l),
          "hu-volume-unit",
        );
        var p = sap.ui.core.Fragment.createId(this.getTabId(l), "hu-lwh-unit0");
        var f = sap.ui.core.Fragment.createId(this.getTabId(l), "hu-lwh-unit1");
        var m = sap.ui.core.Fragment.createId(this.getTabId(l), "hu-lwh-unit2");
        var I = sap.ui.getCore().byId(u);
        var v = sap.ui.getCore().byId(p);
        var S = sap.ui.getCore().byId(h);
        var b = sap.ui.getCore().byId(f);
        var T = sap.ui.getCore().byId(g);
        var y = sap.ui.getCore().byId(m);
        var C = sap.ui.getCore().byId(c);
        var H = sap.ui.getCore().byId(d);
        I.setValue(e);
        S.setValue(i);
        T.setValue(a);
        C.setValue(s);
        H.setText(o);
        v.setText(n);
        b.setText(n);
        y.setText(n);
      },
      checkErrorDimensionsValue: function (e) {
        var t = parseFloat(e);
        if (isNaN(t)) {
          return true;
        }
        return false;
      },
      onHuDimensionsChange: function (e) {
        if (this.checkErrorDimensionsValue(e.getSource().getValue())) {
          return;
        }
        var i = t.getCurrentShipHandlingUnit();
        var a = sap.ui.core.Fragment.createId(
          this.getTabId(i),
          "hu-length-input",
        );
        var r = sap.ui.core.Fragment.createId(
          this.getTabId(i),
          "hu-width-input",
        );
        var n = sap.ui.core.Fragment.createId(
          this.getTabId(i),
          "hu-height-input",
        );
        var s = sap.ui.getCore().byId(a);
        var o = sap.ui.getCore().byId(r);
        var l = sap.ui.getCore().byId(n);
        if (this.checkErrorDimensionsValue(s.getValue())) {
          this.focus(s);
          return;
        } else if (this.checkErrorDimensionsValue(o.getValue())) {
          this.focus(o);
          return;
        } else if (this.checkErrorDimensionsValue(l.getValue())) {
          this.focus(l);
          return;
        }
        let u = {
          Huid: i,
          Length: s.getValue(),
          Height: l.getValue(),
          Width: o.getValue(),
        };
        this.getWorkFlowFactory().getUpdateShipHuDimensionsWorkflow().run(u);
      },
      updateNetWeightRelated: function (e, i, a) {
        e = r.parseNumber(r.formatNumber(e, 2));
        if (r.isEmpty(a)) {
          a = t.getCurrentShipHandlingUnit();
        }
        var n = sap.ui.core.Fragment.createId(this.getTabId(a), D);
        var o = sap.ui.getCore().byId(n);
        var l = o.getActual();
        var u = r.parseNumber(
          r.formatNumber(s.getCurrentMaterialMaxWeight(), 2),
        );
        l.setColor(this.getWeightChartColor(e, u));
        l.setValue(e);
        this.updateWeightChartToolTip(e);
        n = sap.ui.core.Fragment.createId(this.getTabId(a), B);
        var h = sap.ui.getCore().byId(n);
        var g = h.getFormElements()[0];
        var c = g.getFields()[0];
        if (e !== 0) {
          c.setText(e + " " + i);
        } else {
          c.setText("");
        }
      },
      getWeightChartColor: function (e, t) {
        if (e >= t) {
          return d.Critical;
        }
        return d.Good;
      },
      updateWeightChartToolTip: function (e) {
        var i = t.getCurrentShipHandlingUnit();
        if (!r.isEmpty(i) && this.hasTabByTitle(i)) {
          var a = r.formatNumber(e, 2);
          var n = s.getCurrentMaterialUom();
          var o = r.formatNumber(
            parseFloat(s.getCurrentMaterialMaxWeight()),
            2,
          );
          var l = r.formatNumber(
            parseFloat(s.getCurrentMaterialMaxWeightTol()),
            2,
          );
          var u = this.getI18nText("toolTipTxt", [a, n, o, n, l, n]);
          var h = this.getWeightChartByTitle(i);
          h.setTooltip(u);
        }
      },
      getWeightChartByTitle: function (e) {
        var t = this.getTabByTitle(e);
        return this.getWeightChartInTab(t);
      },
      getWeightChartInTab: function (e) {
        var t = e.getContent()[0];
        var i = t.getContent()[1];
        var a;
        if (!r.isEmpty(i)) {
          var n = i.getContent()[0];
          a = n.getItems()[0];
        }
        return a;
      },
      onSelectShippingHU: function (e) {
        var i = e.getParameter("item").getText();
        if (i === " ") {
          return;
        }
        if (t.getPendingTaskNumber() > 0) {
          var a = t.getCurrentShipHandlingUnit();
          e.getSource().setSelectedKey(a);
          return;
        }
        var r = this.getView().byId("shipHUBar").getSelectedKey();
        this.getWorkFlowFactory().getShipHUSelectionWorkFlow().run(r);
      },
      onShippingHUChange: function (e) {
        var i = r.trim(e.getParameter("newValue")).toUpperCase();
        if (t.isShipHandlingUnitExist(i)) {
          if (t.isShipHandlingUintActived(i)) {
            this.updateInputWithDefault(h.ID.SHIP_INPUT, "");
          } else {
            this.getView().byId("shipHUBar").setSelectedKey(i);
            this.getWorkFlowFactory().getShipHUSelectionWorkFlow().run(i);
            this.updateInputWithDefault(h.ID.SHIP_INPUT, "");
          }
        } else {
          this.getWorkFlowFactory().getShipHUChangeWorkFlow().run(i);
        }
      },
      clearActualWeight: function (e) {
        var t = sap.ui.core.Fragment.createId(this.getTabId(e), W);
        var i = sap.ui.getCore().byId(t);
        this.updateInputWithDefault(i, "");
      },
      getNextProposedShipHUByConsGroup: function (e) {
        var i = t.getShipHandlingUnits();
        var a = r.findIndex(i, function (t) {
          var i = g.getShipHUConsGroup(t);
          if (i === e) {
            return true;
          }
          return false;
        });
        var n = a === -1 ? i[0] : i[a];
        return n;
      },
      selectTabByTabName: function (e) {
        var t = this.getView();
        var i = t.byId("shipHUBar");
        i.setSelectedKey(e);
        this.adjustContainerHeight();
        return this.updateTabContent(e);
      },
      updateTabContent: function (e) {
        return new Promise(
          function (t, a) {
            this.setBusy(true);
            i.getHUItems(e, h.SHIP_TYPE_HU)
              .then(
                function (i) {
                  this.oItemHelper.setItems(i);
                  this.updateShippingHUMaterial(e);
                  this.updateShipItemStatus();
                  this.handleButtonsEnableAfterSwitch();
                  this.setBusy(false);
                  t();
                }.bind(this),
              )
              .catch(
                function () {
                  this.setBusy(false);
                  a();
                }.bind(this),
              );
          }.bind(this),
        );
      },
      handleButtonsEnableAfterSwitch: function () {
        if (!r.isEmpty(t.getSourceId())) {
          this.publish(
            h.EVENT_BUS.CHANNELS.PACKALL_ENABLE,
            h.EVENT_BUS.EVENTS.SUCCESS,
          );
        }
        var e = t.getProductId();
        if (!r.isEmpty(e)) {
          this.publish(
            h.EVENT_BUS.CHANNELS.EXCEPTION_ENABLE,
            h.EVENT_BUS.EVENTS.SUCCESS,
          );
        }
        this.handleUnpackEnable();
      },
      updateShippingHUMaterial: function (e) {
        this.setCurrentShipHandlingUnit(e);
        var t = u.getShipHUMaterialId(e);
        var i = s.getMaterialById(t);
        s.setCurrentMaterial(i);
      },
      clearComboBox: function (e) {
        this.getView().byId(e).clearSelection();
        this.updateInputWithDefault(e, "");
      },
      setMessageStripVisible: function (e, t) {
        this.getView().byId(e).setVisible(t);
      },
      hilightShipHandlingUnitsByConsolidationGroup: function (e) {
        this.dehilightShipHandlingUnits();
        var t = this.getHightlightShipHandlingUnits(e);
        if (t.length > 0) {
          this.hilightShipHandlingUnits(t);
        }
      },
      hilightShipHandlingUnits: function (e) {
        var t = this;
        var i = false;
        e.forEach(function (e) {
          var a = t.getTabByTitle(e);
          a.data("title", e);
          a.setText(t.decoratTabtitle(e));
          i = true;
        });
        function a() {
          e.forEach(function (e) {
            var a = t.getTabByTitle(e);
            if (i) {
              a.setText(e);
            } else {
              a.setText(t.decoratTabtitle(e));
            }
          });
          i = !i;
          t.delayId = jQuery.sap.delayedCall(1e3, null, a);
        }
        t.delayId = jQuery.sap.delayedCall(1e3, null, a);
      },
      getEmptyShipHus: function () {
        var e = t.getShipHandlingUnits();
        var i = [];
        e.forEach(function (e) {
          if (g.getIsEmptyHU(e)) {
            i.push(e);
          }
        });
        return i;
      },
      getHightlightShipHandlingUnits: function (e) {
        var i = g.getShipHUConsGroup(t.getCurrentShipHandlingUnit());
        if (S.isInternalMode()) {
          return [];
        }
        if (r.isEmpty(e)) {
          return [];
        }
        var a = this.getShippingHUsByConsolidationGroup(e);
        var n = [];
        if (a.length > 0) {
          n = a;
        } else {
          n = this.getEmptyShipHus();
        }
        if (n.length === 1 && n[0] === t.getCurrentShipHandlingUnit()) {
          n = [];
        }
        return n;
      },
      dehilightShipHandlingUnits: function () {
        var e = this;
        var i = t.getShipHandlingUnits();
        jQuery.sap.clearDelayedCall(e.delayId);
        i.forEach(function (t) {
          var i = e.getTabByTitle(t);
          i.setText(t);
        });
      },
      onUnpack: function (e) {
        this.setBusy(true);
        var t = this.oItemHelper.getHighLightedItem();
        this.getWorkFlowFactory().getUnpackWorkFlow().run(t);
      },
      onUnpackAll: function (e) {
        this.setBusy(true);
        var t = this.oItemHelper.getModel().getData();
        this.getWorkFlowFactory().getUnpackAllWorkFlow().run(t);
      },
      updateScaleWeight: function (e) {
        var i = this.getTabByTitle(t.getCurrentShipHandlingUnit());
        var a = this.getScaleWeightInTab(i);
        this.updateInputWithDefault(a, e);
      },
      getScaleWeightInTab: function (e) {
        var t = e.getContent()[0];
        var i = t.getContent()[1];
        var a = i.getContent()[1];
        var r = a.getFormContainers()[0];
        var n = r.getFormElements()[1];
        var s = n.getFields()[0];
        return s;
      },
      onHighlightColumnListItem: function (e) {
        var i = e.getSource().getBindingContext(h.ITEM_MODEL_NAME);
        if (
          !t.getCurrentShipHandlingUnitClosed() &&
          !r.isEmpty(t.getSourceId())
        ) {
          this.oItemHelper.setItemsStatusToNone();
          var a = i.getPath();
          var n = i.getModel();
          n.setProperty(a + "/Status", sap.ui.core.MessageType.Success);
        }
      },
      onExportData: function () {
        var e = this.getView();
        var t = e.byId("CommodityChangeDialog");
        if (!t) {
          t = sap.ui.xmlfragment(
            e.getId(),
            "com.sz.packoutbdlv.view.CommodityChangeDialog",
            this,
          );
          e.addDependent(t);
        }
        t.open();
      },
      onCommodityChangeCancel: function () {
        var e = this.getView();
        var t = e.byId("CommodityChangeDialog");
        if (t) {
          t.close();
        }
      },
      onAfterOpenExportData: function () {
        var e = this.getView();
        e.byId("CommodityChangeSmartTable").rebindTable();
      },
      onBeforeCommodityGetData: function (e) {
        var i = new U({
          path: "Lgnum",
          operator: N.EQ,
          value1: t.getWarehouseNumber(),
        });
        var a = new U({
          path: "Huid",
          operator: N.EQ,
          value1: t.getCurrentShipHandlingUnit(),
        });
        e.getParameter("bindingParams").filters = [i, a];
      },
      onCommodityChangeUpdate: function () {
        this.setBusy(true);
        i.submitChanges({
          groupId: "groupCommodity",
          success: function () {
            this.setBusy(false);
            a.addSuccess(this.getI18nText("CommodityUpdateSuccess"));
            this.onCommodityChangeCancel();
          }.bind(this),
          error: function () {
            this.setBusy(false);
          }.bind(this),
        });
      },
      formatShipHUIdRequired: function (e) {
        if (!r.isEmpty(e) && s.IsSelectedMaterialExternal()) {
          return true;
        }
        return false;
      },
      formatMaterialDisplay: function (e, t) {
        if (r.isEmpty(e)) {
          return t;
        }
        return e;
      },
      formatDeleteBtn: function (e, t, i) {
        if (t || i > 0) {
          return false;
        }
        return !r.isEmpty(e);
      },
      formatExprtDataBtn: function (e, t, i, a) {
        if (t || i > 0 || !a) {
          return false;
        }
        return !r.isEmpty(e);
      },
      formatEditIconVisible: function (e, t) {
        if (r.isEmpty(t) || e) {
          return false;
        }
        return true;
      },
      formatCreateButton: function (e, t, i) {
        var a = false;
        if (i === 0 && (e.length > 0 || t.length > 0)) {
          a = true;
        }
        return a;
      },
      formatFavoriteMaterialText: function (e, t, i) {
        if (!r.isEmpty(e)) {
          return e;
        } else if (!r.isEmpty(t)) {
          return t;
        }
        return i;
      },
      formatMaterialComboText: function (e, t) {
        if (r.isEmpty(e)) {
          return t;
        } else {
          return t + " - " + e;
        }
      },
      formatMaterialButtonIcon: function (e) {
        if (e === true) {
          return "sap-icon://accept";
        }
        return "";
      },
      formatShipHUIdEditable: function (e) {
        if (e === false) {
          return true;
        }
        return false;
      },
      formatMaxWeightInChart: function (e) {
        return e === undefined ? 0 : r.parseNumber(r.formatNumber(e, 2));
      },
      formatTargetValueDisplay: function (e) {
        return e !== undefined;
      },
      formatMaxCapacityInfo: function (e, t) {
        return e === undefined
          ? ""
          : "/" + r.parseNumber(r.formatNumber(e, 2)) + " " + t;
      },
      formatThreshold: function (e) {
        return Number(e);
      },
      formatPrintText: function (e) {
        var t;
        if (e) {
          t = this.getI18nText("reprint");
        } else {
          t = this.getI18nText("print");
        }
        return t;
      },
      formatWeightEnable: function (e, t, i) {
        var a = false;
        if (!e && t.length > 0 && i === 0) {
          a = true;
        }
        return a;
      },
      formatWeightEnableInSimpleMode: function (e, t) {
        var i = false;
        if (e.length > 0 && t === 0) {
          i = true;
        }
        return i;
      },
      formatPrintEnable: function (e, t) {
        if (r.isEmpty(e) || t > 0) {
          return false;
        }
        return true;
      },
      setCurrentShipHandlingUnit: function (e) {
        t.setCurrentShipHandlingUnit(e);
        t.setCurrentShipHandlingUnitTrackNumber(u.getShipHUTrackingNumber(e));
        if (r.isEmpty(e)) {
          t.setCurrentShipHandlingUnitClosed(false);
        } else {
          t.setCurrentShipHandlingUnitClosed(u.isShipHUClosed(e));
        }
      },
      updateShipItemStatus: function () {
        if (this.oItemHelper.isEmpty()) {
          return;
        }
        this.oItemHelper.setItemsStatusToNone();
        if (
          !r.isEmpty(t.getSourceId()) &&
          !t.getCurrentShipHandlingUnitClosed()
        ) {
          this.oItemHelper.setItemHighlightByIndex(0);
          return;
        }
      },
      formatCompleteIconVisible: function (e) {
        if (e) {
          return false;
        }
        return true;
      },
      formatBusyIndicatorVisible: function (e) {
        if (e) {
          return true;
        }
        return false;
      },
      getLoadingWeightInCurrentShipHandlingUnit: function () {
        var e = 0;
        var t = s.getCurrentMaterialId();
        var i = this.oItemHelper.getAllItems();
        i.forEach(function (i) {
          var a = m.getItemWeight(t, i.OriginId);
          e += i.Quan * a;
        });
        return e;
      },
      getWeightUOMInCurrentShipHandlingUnit: function () {
        var e;
        var t = s.getCurrentMaterialId();
        e = m.getWeightUOMForSpecificPackMat(t);
        return e;
      },
      getGrossWeight: function () {
        var e = this.getGrossWeightInput();
        return e.getValue();
      },
      setGrossWeight: function (e) {
        var t = this.getGrossWeightInput();
        if (!r.isEmpty(t)) {
          t.setValue(e);
        }
      },
      clearGrossWeight: function () {
        this.setGrossWeight("");
      },
      getGrossWeightInput: function () {
        var e = t.getCurrentShipHandlingUnit();
        var i = this.getElementInTab(e, "actual-weight-input");
        return i;
      },
      unpackCallback: function (e) {
        if (r.isEmpty(e.HuId)) {
          a.addSuccess(
            this.getTextAccordingToMode(
              "handlingUnitDeleted",
              "shipHandlingUnitDeleted",
              [t.getCurrentShipHandlingUnit()],
            ),
          );
          this.playAudio(h.INFO);
          var i = { bCallService: false, bRefreshSource: true };
          this.getWorkFlowFactory().getShipHUDeleteWorkFlow().run(i);
          throw new c(h.ERRORS.INTERRUPT_WITH_NO_ACTION);
        } else {
          return e;
        }
      },
      flushPendings: function () {
        var e = this.oItemHelper.getAllItems();
        var i;
        var a = [];
        var r = [];
        for (var n = 0; n < e.length; n++) {
          i = e[n];
          i.PackedQuan = i.PackedQuan ? i.PackedQuan : 0;
          if (
            i.OperationDeltaQuan - i.PackedQuan !== 0 &&
            i.OperationDeltaQuan !== i.DefaultAltQuan
          ) {
            var s = { oProduct: i, sQuantity: "0", iIndex: n, bAdd: false };
            a.push(this.getWorkFlowFactory().getPackItemWorkFlow().run(s));
          }
        }
        if (a.length > 0) {
          if (t.getAsyncMode()) {
            return new Promise(function (e, t) {
              jQuery.sap.delayedCall(0, null, function () {
                a.forEach(function (e) {
                  r.push(e.getAsyncPromise());
                });
                Promise.all(r)
                  .then(function () {
                    e();
                  })
                  .catch(function (e) {
                    t(e);
                  });
              });
            });
          } else {
            a.forEach(function (e) {
              r.push(e.getResult());
            });
            return Promise.all(r);
          }
        } else {
          return Promise.resolve();
        }
      },
      formatItemInputEnable: function (e, t, i, a) {
        var r = true;
        if (e !== sap.ui.core.MessageType.Success || (i === a && i !== t)) {
          r = false;
        }
        return r;
      },
      formatSimpleMaterialButtonEnable: function (e) {
        if (e > 0) {
          return false;
        }
        return true;
      },
      formatDialogMaterialLabel: function (e) {
        if (e.length === 0) {
          return this.getI18nText("packMaterial");
        } else {
          return this.getI18nText("favoritePackMaterial");
        }
      },
      getHandlingUnitDisplayWhenScanOnOtherSide: function () {
        return new Promise(
          function (e, t) {
            var i = this.getI18nText("scanExistingHUonOtherSide");
            f.warning(i, {
              actions: [f.Action.YES, f.Action.NO],
              onClose: function (i) {
                if (i === f.Action.YES) {
                  e();
                } else {
                  t(h.ERRORS.INTERRUPT_WITH_NO_ACTION);
                }
              }.bind(this),
            });
          }.bind(this),
        );
      },
      handleUnpackItemsWithDifferentODO: function (e) {
        return new Promise(
          function (i, r) {
            if (t.isSourceTypeODO()) {
              var n = e.EWMRefDeliveryDocumentNumber;
              var s = t.getSourceId();
              if (n !== s) {
                var o = t.getBin();
                var l = this.getI18nText("unpackToBin", [n, o]);
                a.addSuccess(l);
                this.setBusy(false);
                r(h.ERRORS.INTERRUPT_WITH_NO_ACTION);
              }
            }
            i();
          }.bind(this),
        );
      },
      handleUnpackAllItemsWithDifferentODO: function (e) {
        return new Promise(
          function (i, n) {
            if (t.isSourceTypeODO()) {
              var s = t.getSourceId();
              var o = r.findIndex(e, function (e) {
                if (e.EWMRefDeliveryDocumentNumber !== s) {
                  return true;
                }
              });
              if (o !== -1) {
                var l = t.getBin();
                var u = this.getI18nText("unpackAllToBin", [s, l]);
                a.addSuccess(u);
              }
              o = r.findIndex(e, function (e) {
                if (e.EWMRefDeliveryDocumentNumber === s) {
                  return true;
                }
              });
              if (o == -1) {
                this.setBusy(false);
                n(h.ERRORS.INTERRUPT_WITH_NO_ACTION);
              }
            }
            i();
          }.bind(this),
        );
      },
      initColumnSettingModel: function () {
        this.oColumnSettingsHelper.setData(this.getDefaultColumnSetting());
        this.oColumnSettingsHelper.handleStatusColumnSetting(
          t.getAsyncMode(),
          this.getI18nText("status"),
        );
      },
      resetMaterialButtons: function () {
        var e = s.getDefaultMaterialId();
        var t = s.getCurrentMaterialId();
        if (!r.isEmpty(e)) {
          s.setFavoriteMaterialSelectedById(e, true);
        }
        s.setFavoriteMaterialSelectedById(t, false);
      },
      formatCreateDialogTitle: function (e) {
        return this.getTextAccordingToMode(
          "createNewHU",
          "createNewShipHU",
          [],
          e,
        );
      },
      formatChangeDialogTitle: function (e) {
        return this.getTextAccordingToMode(
          "changeHandlingUnitMaterial",
          "changeShipHandlingUnitMaterial",
          [],
          e,
        );
      },
      formatDialogLabel: function (e) {
        return this.getTextAccordingToMode(
          "handlingUnitLabel",
          "shipHandlingUnit",
          [],
          e,
        );
      },
      updateCacheIsEmptyHU: function () {
        if (this.oItemHelper.getItemsNum() === 0) {
          g.setIsEmptyHU(t.getCurrentShipHandlingUnit(), true);
        } else {
          g.setIsEmptyHU(t.getCurrentShipHandlingUnit(), false);
        }
      },
      initDefaultColumnSetting: function () {
        this._mAdvancedShipTableDefaultSettings = JSON.parse(
          JSON.stringify(I.getData()),
        );
        this._mBasicShipDefaultDefaultSettings = JSON.parse(
          JSON.stringify(T.getData()),
        );
        this._mInternalShipTableDefaultSettings = JSON.parse(
          JSON.stringify(y.getData()),
        );
      },
    });
  },
);
//# sourceMappingURL=Right.controller.js.map
