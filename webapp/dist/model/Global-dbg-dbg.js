sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(JSONModel) {
	"use strict";

	return new JSONModel({
		"busy": true,
		"sourceId": "",
		"sourceType": "",
		"currentShipHandlingUnit": "",
		"currentShipHandlingUnitTrackNumber": "",
		"currentShipHandlingUnitClosed": false, //the flag of if the current ship hu is closed or not
		"shipHandlingUnits": [], //ship handling unit id
		"exceptionEnable": false,
		"packAllEnable": false,
		"closeShipHUEnable": false,
		"sourceMaterialId": "",
		"isOnCloud": true,
		"scaleEnabled":false,
		"bin": "",
		"unpackEnable": false,
		"productId": "",
		"asyncMode": false,
		"pendingTaskNumber": 0,
		"hasExportDelivery": false,
		//tell if a source handling unit/bin or ship handling unit is displaying in the source side
		"isPickHUInSourceSide": true,
		"selectedFeatureSet": "",
		"applicationFeatures": [{
			"type": "A",		//Rate Shopping
			"disabled": true
		},{
			"type": "B",		//Commodity Code Update
			"disabled": true
		},{
			"type": "C",		//Serial Number Validation
			"disabled": true
		}],
		"exceptionList":[]
	});
});