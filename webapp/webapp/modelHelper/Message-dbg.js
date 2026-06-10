sap.ui.define([
	"com/sz/packoutbdlv/model/Message",
	"com/sz/packoutbdlv/utils/Util"
], function(Model, Util) {
	"use strict";

	return {
		addError: function(sError) {
			var aData = Model.getData();
			aData.unshift({
				text: sError,
				description: sError,
				type: "Error"
			});
			Model.setData(aData);
			Model.updateBindings(true);
			return this;
		},
		addWarning: function(sWarning) {
			var aData = Model.getData();
			aData.unshift({
				text: sWarning,
				description: sWarning,
				type: "Warning"
			});
			Model.setData(aData);
			Model.updateBindings(true);
			return this;
		},
		addSuccess: function(sSuccess) {
			var aData = Model.getData();
			aData.unshift({
				text: sSuccess,
				description: sSuccess,
				type: "Success"
			});
			Model.setData(aData);
			Model.updateBindings(true);
			return this;
		},
		clearAll: function() {
			Model.setData([]);
		}
	};
});