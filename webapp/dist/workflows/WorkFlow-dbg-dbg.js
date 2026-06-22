sap.ui.define([
	"com/sz/packoutbdlv/utils/ErrorHandler",
	"com/sz/packoutbdlv/utils/Util"
], function(ErrorHandler, Util) {
	"use strict";

	function WorkFlow() {
		this._aHandler = [];
		this._oErrorHandler = new ErrorHandler();
		this._oResult = null;
	}
	WorkFlow.prototype.then = function(fnHandler, context) {
		this._aHandler.push(fnHandler.bind(context));
		return this;
	};
	WorkFlow.prototype.run = function(vPara) {
		var that = this;
		var mSession = {};
		this._oResult = new Promise(function(resolve, reject) {
			var _oPromise = Promise.resolve(vPara);
			this._aHandler.forEach(function(fnHandler) {
				_oPromise = _oPromise.then(function(vResult) {
					return fnHandler(vResult, mSession);
				});
			});
			_oPromise.then(function() {
				resolve();
			});
			_oPromise.catch(function(vError) {
				that._oErrorHandler.catch(vError, mSession);
				//pass the error out
				reject(vError);
			});
		}.bind(this));
		return this;
	};
	WorkFlow.prototype.getResult = function() {
		return this._oResult;
	};
	WorkFlow.prototype.errors = function() {
		return this._oErrorHandler;
	};

	return WorkFlow;
});