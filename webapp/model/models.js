sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createOperationModel: function () {
			let operationModel = new JSONModel({
				newOperationValues: {
					"Zzboyaopt": "",
					//"Zzboyaoptt": "",
					"Zzboyaopr": "",
					//	"Zzboyaoprt": "",
					"Zzyarimamulsayisi": "",
					"Zzffiyat": "",
					"ZzffiyatBirim": "Euro"
				}
			});

			return operationModel;
		}

	};
});