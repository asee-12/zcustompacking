sap.ui.define(
  [
    "com/sz/packoutbdlv/workflows/WorkFlow",
    "com/sz/packoutbdlv/utils/Util",
    "com/sz/packoutbdlv/utils/Const",
    "com/sz/packoutbdlv/modelHelper/Message",
    "com/sz/packoutbdlv/service/ODataService",
    "com/sz/packoutbdlv/modelHelper/Cache",
    "com/sz/packoutbdlv/modelHelper/Global",
  ],
  function (t, e, i, s, o, n, r) {
    "use strict";
    return function (e, s) {
      var u = new t()
        .then(function (t, e) {
          e.aProducts = t;
          return o.packAll(t);
        }, e)
        .then(
          function (t, e) {
            this.oItemHelper.clear();
            r.setProductId("");
            r.setPackAllEnable(false);
          },
          e,
          "remove item from left",
        )
        .then(
          function () {
            this.unbindProductInfo();
            this.focus(i.ID.PRODUCT_INPUT);
          },
          e,
          "unbind product info",
        )
        .then(function () {
          return o.getHUItems(r.getCurrentShipHandlingUnit(), i.SHIP_TYPE_HU);
        })
        .then(
          function (t, e) {
            this.setBusy(false);
            e.bShipHUEmptyBeforePack = this.oItemHelper.isEmpty();
            this.oItemHelper.setItems(t);
            this.oItemHelper.setItemsPreviousAlterQuan();
            this.oItemHelper.setItemsPackedQuan();
            this.oItemHelper.setItemsDeltaQuan();
            this.oItemHelper.setItemsStatusToNone();
            this.oItemHelper.setItemHighlightByIndex(0);
          },
          s,
          "add item in the right table",
        )
        .then(
          function (t, e) {
            if (e.bShipHUEmptyBeforePack) {
              n.updateShipHUConsGroup(
                r.getCurrentShipHandlingUnit(),
                e.aProducts[0].EWMConsolidationGroup,
              );
            }
          },
          s,
          "if it is the first item in the right, update cache",
        )
        .then(
          function (t, e) {
            this.clearGrossWeight();
            this.clearPackingInstr();
          },
          s,
          "update packing info",
        )
        .then(function (t, e) {
          this.delayCalledAdjustContainerHeight();
        }, s);
      u.errors()
        .default(function (t, e, i, s) {
          if (s) {
            this.showErrorMessagePopup(t);
          }
        }, e)
        .always(function () {
          this.setBusy(false);
          this.focus(i.ID.PRODUCT_INPUT);
          this.playAudio(i.ERROR);
        }, e);
      return u;
    };
  },
);
//# sourceMappingURL=PackAll-dbg.js.map
