sap.ui.define(["sap/ui/model/json/JSONModel"], function (e) {
  "use strict";
  return new e({
    busy: true,
    sourceId: "",
    sourceType: "",
    currentShipHandlingUnit: "",
    currentShipHandlingUnitTrackNumber: "",
    currentShipHandlingUnitClosed: false,
    shipHandlingUnits: [],
    exceptionEnable: false,
    packAllEnable: false,
    closeShipHUEnable: false,
    sourceMaterialId: "",
    isOnCloud: true,
    scaleEnabled: false,
    bin: "",
    unpackEnable: false,
    productId: "",
    asyncMode: false,
    pendingTaskNumber: 0,
    hasExportDelivery: false,
    isPickHUInSourceSide: true,
    selectedFeatureSet: "",
    applicationFeatures: [
      { type: "A", disabled: true },
      { type: "B", disabled: true },
      { type: "C", disabled: true },
    ],
    exceptionList: [],
  });
});
//# sourceMappingURL=Global-dbg.js.map
