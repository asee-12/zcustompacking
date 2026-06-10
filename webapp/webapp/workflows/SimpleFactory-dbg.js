sap.ui.define([
	"com/sz/packoutbdlv/workflows/Factory",
	"com/sz/packoutbdlv/workflows/Simple/Initialization",
	"com/sz/packoutbdlv/workflows/Simple/ChangeMaterial",
	"com/sz/packoutbdlv/workflows/Simple/CloseShipHU",
	"com/sz/packoutbdlv/workflows/Simple/CreateShipHU",
	"com/sz/packoutbdlv/workflows/Simple/DeleteShipHU",
	"com/sz/packoutbdlv/workflows/Simple/PackAll",
	"com/sz/packoutbdlv/workflows/Simple/PackItem",
	"com/sz/packoutbdlv/workflows/Simple/PackPartial",
	"com/sz/packoutbdlv/workflows/Simple/PackWithDifference",
	"com/sz/packoutbdlv/workflows/Simple/ProductChange",
	"com/sz/packoutbdlv/workflows/Simple/SelectShipHU",
	"com/sz/packoutbdlv/workflows/Simple/SourceChange",
	"com/sz/packoutbdlv/workflows/Simple/UnpackAll",
	"com/sz/packoutbdlv/workflows/Simple/UnpackItem",
	"com/sz/packoutbdlv/workflows/Simple/QuantityChange",
	"com/sz/packoutbdlv/workflows/Simple/Leave",
	"com/sz/packoutbdlv/workflows/Simple/RestoreShipHU",
	"com/sz/packoutbdlv/workflows/Simple/Clear",
	"com/sz/packoutbdlv/workflows/Advanced/Print"
], function(BaseObject, Initialization, ChangeMaterial, CloseShipHU, CreateShipHU, DeleteShipHU, PackAll, PackItem, PackPartial,
	PackWithDifference, ProductChange, SelectShipHU, SourceChange, UnpackAll, UnpackItem, QuantityChange, Leave, RestoreShipHU, Clear, Print) {
	"use strict";
	var Factory = BaseObject.extend("com.sz.packoutbdlv.workflows.SimpleFactory", {
		aImplemention: [
			Initialization,
			SourceChange,
			ProductChange,
			PackItem,
			null,
			null,
			UnpackItem,
			null,
			null,
			CloseShipHU,
			ChangeMaterial,
			null,
			CreateShipHU,
			QuantityChange,
			Leave,
			RestoreShipHU,
			PackAll,
			Clear,
			Print,
			null
		]

	});
	return Factory;
});