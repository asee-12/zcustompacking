sap.ui.define(
  [
    "com/sz/packoutbdlv/workflows/WorkFlow",
    "com/sz/packoutbdlv/service/ODataService",
    "com/sz/packoutbdlv/utils/Const",
    "com/sz/packoutbdlv/modelHelper/Message",
    "com/sz/packoutbdlv/modelHelper/Global",
    "com/sz/packoutbdlv/modelHelper/OData",
  ],
  function (t, e, i, r, a, s) {
    "use strict";
    return function (a, n) {
      var u = new t()
        .then(
          function (t, i) {
            this.setBusy(true);
            i.single = !t;
            i.updatingTrackNums = false;
            if (t) {
              return e.printAll();
            }
            return e.print();
          },
          n,
          "init package matrial buttons",
        )
        .then(
          function (t, e) {
            var i = t.map((t) => t.CheckTrackNumberRequirement);
            var r = s
              .getShipHandlingUnitsForPrint()
              .filter((t) => t.TrackNum.trim() !== "");
            e.aHusWithTrks = r;
            if (i.length > 0) {
              var a = [...i, ...r];
              return this.onOpenAssignTrackNumberDialog(a, e.single);
            }
          },
          n,
          "Check if ship all needs to get tracknumbers",
        )
        .then(
          function (t, i) {
            var r = [];
            if (t) {
              r = r.concat(t.map((t) => t.HuId));
            }
            if (i.aHusWithTrks) {
              r = r.concat(i.aHusWithTrks.map((t) => t.Huid));
            }
            return e.triggerHuPrint(r);
          },
          n,
          "Data from dialog",
        )
        .then(
          function () {
            r.addSuccess(this.getI18nText("printSuccess"));
            this.playAudio(i.INFO);
            this.setBusy(false);
          },
          n,
          "init package matrial buttons",
        );
      u.errors().always(
        function (t) {
          this.setBusy(false);
          if (!t) this.playAudio(i.ERROR);
        },
        n,
        "Error/Reject",
      );
      return u;
    };
  },
);
//# sourceMappingURL=Print.js.map
