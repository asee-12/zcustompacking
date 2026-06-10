sap.ui.define(
  [
    "com/sz/packoutbdlv/workflows/WorkFlow",
    "com/sz/packoutbdlv/modelHelper/Material",
    "com/sz/packoutbdlv/utils/Util",
  ],
  function (t, a, e) {
    "use strict";
    return function (i, r) {
      var o = new t()
        .then(
          function () {
            var t = this.byId("simple_favorite_material_toolbar");
            t.bindAggregation("content", {
              path: "material>/favoriteMaterials",
              template: this.oTemplate,
              templateShareable: true,
            });
          },
          r,
          "init package matrial buttons",
        )
        .then(
          function () {
            var t = this.byId("simple_favorite_material_toolbar");
            var i = t.getContent();
            var r = a.getFavoriteMaterials();
            i.forEach(function (t, a) {
              var i = r[a];
              var o = i.PackagingMaterial;
              if (!e.isEmpty(i.PackagingMaterialDescription)) {
                o += " - " + i.PackagingMaterialDescription;
              }
              t.setTooltip(o);
            });
          },
          r,
          "add tool tip for favorite material buttons",
        );
      return o;
    };
  },
);
//# sourceMappingURL=Initialization.js.map
