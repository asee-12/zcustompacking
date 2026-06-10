sap.ui.define(
  ["sap/ui/core/Control"],
  function (e) {
    "use strict";
    var i = e.extend("com.sz.packoutbdlv.control.Container", {
      metadata: {
        properties: {
          width: {
            type: "sap.ui.core.CSSSize",
            group: "Dimension",
            defaultValue: null,
          },
          height: {
            type: "sap.ui.core.CSSSize",
            group: "Dimension",
            defaultValue: null,
          },
          maxWidth: {
            type: "sap.ui.core.CSSSize",
            group: "Dimension",
            defaultValue: "",
          },
          minWidth: {
            type: "sap.ui.core.CSSSize",
            group: "Dimension",
            defaultValue: "",
          },
          maxHeight: {
            type: "sap.ui.core.CSSSize",
            group: "Dimension",
            defaultValue: "",
          },
          minHeight: {
            type: "sap.ui.core.CSSSize",
            group: "Dimension",
            defaultValue: "",
          },
        },
        defaultAggregation: "content",
        aggregations: {
          content: {
            type: "sap.ui.core.Control",
            multiple: true,
            singularName: "content",
          },
        },
        designTime: true,
      },
    });
    return i;
  },
  true,
);
//# sourceMappingURL=Container.js.map
