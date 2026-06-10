sap.ui.define(
  [
    "com/sz/packoutbdlv/controller/BaseController",
    "com/sz/packoutbdlv/modelHelper/Items",
    "sap/ui/model/json/JSONModel",
    "com/sz/packoutbdlv/utils/Util",
    "com/sz/packoutbdlv/modelHelper/ItemWeight",
    "com/sz/packoutbdlv/modelHelper/Material",
    "com/sz/packoutbdlv/service/ODataService",
    "com/sz/packoutbdlv/modelHelper/Message",
    "com/sz/packoutbdlv/utils/Const",
    "sap/m/MessageBox",
    "com/sz/packoutbdlv/modelHelper/Global",
  ],
  function (t, e, n, i, o, s, a, l, r, u, g) {
    "use strict";
    return t.extend("com.sz.packoutbdlv.controller.WorkFlowController", {
      getWorkFlowFactory: function () {
        return this.oView.getParent().getParent().getParent().getController()
          .oWorkFlowFactory;
      },
      oItemHelper: null,
      formatTableTitle: function (t, e, n) {
        if (!t) {
          return;
        }
        var i = "";
        if (n && n !== "") {
          i = this.getI18nText("trackNumberText", [n]);
        }
        return this.getI18nText("itemsOfHandkingUnit", [t, e.length, i]);
      },
      onSerialNumberPopover: function (t) {
        this.openSerialNumberPopover(t, r.ITEM_MODEL_NAME, this.oItemHelper);
      },
      setButtonToolTip: function (t) {
        var e = this.byId(t);
        if (i.isEmpty(e)) {
          return;
        }
        var n = e.getTooltip();
        if (i.isEmpty(n)) {
          e.setTooltip(e.getText());
        }
      },
      updateItemWeightInNeed: function (t, e) {
        var n = s.getCurrentMaterialId();
        var a = this.oItemHelper.getAllItems();
        var l = i.findIndex(a, function (t) {
          if (!o.isSpecificItemWeightExisted(n, t.OriginId)) {
            return true;
          }
          return false;
        });
        if (l !== -1) {
          return this.updateItemWeight(t, e);
        }
        return i.getResolvePromise();
      },
      updateItemWeight: function (t, e) {
        return new Promise(
          function (n, i) {
            var u = s.getCurrentMaterialId();
            this.setBusy(true);
            a.getItemWeight(t, e)
              .then(
                function (t) {
                  this.setBusy(false);
                  o.addItemWeightForPackMat(u, t);
                  n();
                }.bind(this),
              )
              .catch(
                function (t) {
                  this.setBusy(false);
                  this.playAudio(r.ERROR);
                  l.addError(t);
                  i();
                }.bind(this),
              );
          }.bind(this),
        );
      },
      handleSettingDialogButtonPressed: function (t) {
        if (!this._oDialog) {
          this._oDialog = sap.ui.xmlfragment(
            this.getTableSettingDialogName(),
            this,
          );
        }
        this.getView().addDependent(this._oDialog);
        this.setDisplayMessageBoxForColumnSettingChange(true);
        this._oDialog.open();
      },
      onConfirmColumnSettingsChange: function (t) {
        this.updatePersonalizationService();
        t.getSource().close();
        this.updateTableColumn();
      },
      onCancelColumnSettingsChange: function (t) {
        this.rollBackColumnSettingsModel();
        t.getSource().close();
      },
      updatePersonalizationService: function () {
        var t = JSON.parse(
          JSON.stringify(this.oColumnSettingsHelper.getColumnSettings()),
        );
        t.forEach(function (t) {
          t.index = t.defaultIndex;
        });
        this.oColumnSettingsHelper.setColumnSettings(t);
        this.setContainerItemValue(
          this.getPersonlServiceContainerItemName(),
          t,
        );
      },
      rollBackColumnSettingsModel: function () {
        this.getPersonalizationContainer().then(
          function (t) {
            var e = t.getItemValue(this.getPersonlServiceContainerItemName());
            if (e) {
              this.oColumnSettingsHelper.setColumnSettings(e);
              this.oColumnSettingsHelper.updateRestore();
            }
          }.bind(this),
        );
      },
      setContainerItemValue: function (t, e) {
        this.getPersonalizationContainer().then(
          function (n) {
            n.setItemValue(t, e);
            n.save();
          }.bind(this),
        );
      },
      initColumnSetting: function (t) {
        this.getPersonalizationContainer().then(
          function (t) {
            var e = this.getPersonlServiceContainerItemName();
            var n = t.getItemValue(e);
            if (i.isEmpty(n) || this.isDefaultColumnSettingChange(t)) {
              var o = this.getDefaultColumnSetting();
              this.updateDefaultColumnSetting(o, t);
              this.initColumnSettingModel();
              this.initColumnSettingText();
              n = JSON.parse(
                JSON.stringify(this.oColumnSettingsHelper.getColumnSettings()),
              );
              t.setItemValue(this.getPersonlServiceContainerItemName(), n);
              t.save();
            } else {
              var s = JSON.parse(JSON.stringify(n));
              this.oColumnSettingsHelper.setColumnSettings(s);
              this.initColumnSettingText();
              if (this.getViewName() === r.VIEW_SHIP) {
                if (
                  this.oColumnSettingsHelper.handleStatusColumnSetting(
                    g.getAsyncMode(),
                    this.getI18nText("status"),
                  )
                ) {
                  this.updatePersonalizationService();
                }
              }
            }
            this.updateTableColumn();
            this.oColumnSettingsHelper.updateRestore();
          }.bind(this),
        );
      },
      onRestoreColumnSettings: function () {
        var t = this.getDefaultColumnSetting();
        var e = this.initDefaultColumnSettingText(t);
        this.oColumnSettingsHelper.restore(e);
        this.oColumnSettingsHelper.handleStatusColumnSetting(
          g.getAsyncMode(),
          this.getI18nText("status"),
        );
      },
      updateTableColumn: function () {
        var t = this.oColumnSettingsHelper.getColumnSettings();
        var e = this.byId(this.sTableId);
        var n = e.getColumns();
        t.forEach(
          function (t) {
            for (var e = 0; e < n.length; e++) {
              if (
                n[e].getHeader().getText() === this.getI18nText(t.columnKey)
              ) {
                n[e].setVisible(t.visible);
              }
            }
          }.bind(this),
        );
      },
      isColumnMandatory: function (t) {
        var e = this.oColumnSettingsHelper.getColumnSettings();
        var n = e.findIndex(
          function (e) {
            if (t === this.getI18nText(e.columnKey) && e.mandatory) {
              return true;
            }
          }.bind(this),
        );
        return n !== -1 ? true : false;
      },
      setMandatoryColumnVisible: function (t) {
        var e = t.getItems();
        e.forEach(
          function (e) {
            if (
              this.isColumnMandatory(e.getCells()[0].getText()) &&
              !e.getSelected()
            ) {
              e.setSelected(true);
              t.fireSelectionChange({
                listItem: e,
                listItems: [],
                selected: true,
              });
            }
          }.bind(this),
        );
      },
      getColumnSettingTable: function (t) {
        var e = t.getAggregation("content")[0];
        return e;
      },
      isMandatoryColumnInvisible: function (t) {
        var e = t.getItems();
        var n = e.findIndex(
          function (t) {
            if (
              this.isColumnMandatory(t.getCells()[0].getText()) &&
              !t.getSelected()
            ) {
              return true;
            }
          }.bind(this),
        );
        return n !== -1;
      },
      setDisplayMessageBoxForColumnSettingChange: function (t) {
        this._oDialog.removeAllCustomData();
        var e = new sap.ui.core.CustomData({ key: t });
        this._oDialog.addCustomData(e);
      },
      onChangeColumnsItems: function (t) {
        var e = t.getSource();
        var n = this.getColumnSettingTable(e);
        var i = this._oDialog.getCustomData()[0].getKey();
        if (this.isMandatoryColumnInvisible(n)) {
          if (i === "true") {
            this._oDialog.setBusy(true);
            var o = this.getI18nText("deselectMandatoryField");
            var s = !!this.getView().$().closest(".sapUiSizeCompact").length;
            this.playAudio(r.ERROR);
            u.error(o, {
              styleClass: s ? "sapUiSizeCompact" : "",
              actions: [sap.m.MessageBox.Action.OK],
              onClose: function () {
                this._oDialog.setBusy(false);
                this.setMandatoryColumnVisible(n);
                this.oColumnSettingsHelper.setMandatoryColumnVisible();
                this.oColumnSettingsHelper.updateRestore();
                this.setDisplayMessageBoxForColumnSettingChange(true);
              }.bind(this),
            });
            this.setDisplayMessageBoxForColumnSettingChange(false);
          } else {
            this.setMandatoryColumnVisible(n);
            this.oColumnSettingsHelper.setMandatoryColumnVisible();
          }
        }
        this.oColumnSettingsHelper.updateRestore();
      },
      initColumnSettingText: function () {
        var t = this.oColumnSettingsHelper.getColumnSettings();
        t.forEach(
          function (t) {
            var e = t.columnKey;
            var n = this.getI18nText(e);
            this.oColumnSettingsHelper.setColumnTextByKey(e, n);
          }.bind(this),
        );
      },
      isDefaultColumnSettingChange: function (t) {
        var e = this.getDefaultColumnSettingInService(t);
        var n = this.getDefaultColumnSetting();
        if (JSON.stringify(e) === JSON.stringify(n)) {
          return false;
        }
        return true;
      },
      getDefaultColumnSettingInService: function (t) {
        var e = this.getDefaultColumnSettingNameInService();
        var n = t.getItemValue(e);
        return n;
      },
      updateDefaultColumnSetting: function (t, e) {
        var n = JSON.parse(JSON.stringify(t));
        var i = this.getDefaultColumnSettingNameInService();
        e.setItemValue(i, n);
        e.setItemValue(this.getPersonlServiceContainerItemName(), "");
      },
      initDefaultColumnSettingText: function (t) {
        var e = t.columnSettings;
        e.forEach(
          function (t) {
            var e = t.columnKey;
            var n = this.getI18nText(e);
            t.text = n;
          }.bind(this),
        );
        return e;
      },
    });
  },
);
//# sourceMappingURL=WorkFlowController.js.map
