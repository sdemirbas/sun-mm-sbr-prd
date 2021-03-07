sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (Controller, BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("CreateBasekod.ZMM015F_MAMULFASON.controller.Home", {

		/* =========================================================== */
		/* Lifecycle methods */
		/* =========================================================== */
		onInit: function () {
			this._clearAllMessages();
			this._setGlobalValues();
			this._setTalepId();
			this._setMessagePopover();
		},
		onBeforeRendering: function () {},
		onAfterRendering: function () {},
		onExit: function () {},

		/* =========================================================== */
		/* Internal methods */
		/* =========================================================== */
		_setGlobalValues: function () {
			this._oDataModel = this.getOwnerComponent().getModel();
			this._oDataModel.setSizeLimit(99999);
			this.getOwnerComponent().getModel("VhModel").setSizeLimit(99999);

		},
		_setTalepId: function () {
			// this.oStartupParameters = this.getMyComponent().getComponentData().startupParameters;
			this.oStartupParameters = "";

		},
		getMyComponent: function () {
			"use strict";
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			return sap.ui.component(sComponentId);

		},
		_setMessagePopover: function () {
			// Detail (utility) model
			this._oDetailModel = new JSONModel({
				saveM: false,
				errorM: false,
				editM: false
			});
			this.getView().setModel(this._oDetailModel, "detailModel");

			this._oMessageManager = sap.ui.getCore().getMessageManager();
			this.getView().setModel(this._oMessageManager.getMessageModel(), "message");

			// Request completed event for message manager
			this._oDataModel.attachRequestCompleted(this._onRequestCompleted, this);
		},
		_onRequestCompleted: function () {
			// Delete duplicate messages 
			var messageModelData = this.getView().getModel("message").getData();
			this._oDetailModel.setProperty("/errorM", !!messageModelData.length);
			if (messageModelData.length > 1) {
				for (var a = 0; a < messageModelData.length; a++) {
					if (messageModelData[0].message === messageModelData[a].message) messageModelData.shift();
				}
				this.getView().getModel("message").refresh(true);
			}
		},
		_getMessagePopover: function () {
			if (!this._oMessagePopover) {
				this._oMessagePopover =
					sap.ui.xmlfragment(this.getView().getId(), "CreateBasekod.ZMM015F_MAMULFASON.view.fragment.MessagePopover", this);
				this.getView().addDependent(this._oMessagePopover);
			}
			return this._oMessagePopover;
		},

		_handleValueHelp: function (dialog, dialogName) {
			if (!dialog) {
				dialog = new sap.ui.xmlfragment(dialogName, this);
				this.getView().addDependent(dialog);
			}
			return dialog;
		},
		_onHandleValueHelpMaterial: function () {
			this._materialHelpDialog = this._handleValueHelp(this._materialHelpDialog,
				"CreateBasekod.ZMM015F_MAMULFASON.view.fragment.valueHelp.MaterialVH");
			this._materialHelpDialog.open();
		},
		_onNewOperationCode: function (oEvent) {
			this._newOperationCodesDialog = this._handleValueHelp(this._newOperationCodesDialog,
				"CreateBasekod.ZMM015F_MAMULFASON.view.fragment.NewOperationCode");
			this._newOperationCodesDialog.open();
		},

		_onCloseOperationCode: function () {
			this._newOperationCodesDialog.close();
		},
		_onSelectionMaterialSelectDialogClose: function (oEvent) {
			let _selectedItemPath = oEvent.getSource().getBindingContextPath(),
				_selectedMaterialItem = this.getView().getModel().getProperty(_selectedItemPath);

			this._parseHeaderItemToValue(_selectedMaterialItem, 'material');
			this._materialHelpDialog.close();
		},
		_parseHeaderItemToValue: function (selectedItem, fragmentName) {
			if (fragmentName === "material") {
				this.setValueBinding("inputReferenceStockCode", selectedItem.Matnr, "input");
				this.setValueBinding("inputReferenceStockName", selectedItem.Maktx, "input");
				this.setValueBinding("inputReferenceStockName2", selectedItem.Zztanim, "input");
				this.setValueBinding("inputMaterialStockCode", "F" + selectedItem.Matnr, "input");
				this.setValueBinding("inputMaterialStockName", selectedItem.Maktx, "input");
			}
		},

		_onChangeComboBoxOperationName: function (oEvent) {
			let _parsedValue = oEvent.getParameters().selectedItem ? oEvent.getParameters().selectedItem.getAdditionalText() : "";
			this.byId("textOperationName").setText(_parsedValue);
		},

		_onSaveOperationCode: function () {
			let uri = "/OperationCodesSet",
				createdData = this.getOwnerComponent().getModel("operationModel").getProperty("/newOperationValues"),
				that = this;

			this._onCloseOperationCode();
			sap.ui.core.BusyIndicator.show();

			this._oDataModel.create(uri, createdData, {
				success: (oData, oResponse) => {
					sap.ui.core.BusyIndicator.hide();

					sap.ui.getCore().getMessageManager().addMessages(
						new sap.ui.core.message.Message({
							message: "Operasyon kodu yaratılmıştır.",
							type: sap.ui.core.MessageType.Success,
							persistent: true
						})
					);

					that._getMessagePopover().openBy(that.getView().byId("buttonMessagePopover"));
				},
				error: (oError) => {
					sap.ui.core.BusyIndicator.hide();
					that._getMessagePopover().openBy(that.getView().byId("buttonMessagePopover"));
				}
			});
		},

		_onSaveStockCode: function () {
			let _checkMandatoryFields = this._checkMandatoryFields();
			if (_checkMandatoryFields) {
				let _deepData = this._prepareSaveFasonMamulCodeDeepData();
				this.deepCreate("/MamulFasonHeaderSet", _deepData);
			}
		},
		_prepareSaveFasonMamulCodeDeepData: function () {
			return {
				"Talepid": this.oStartupParameters,
				"Refmatnr": "123",
				"to_MamulFason": this._prepareMamulFason(),
				"to_DyeAndPrintFason": this._prepareDyeAndPrintFason()
			};
		},

		_prepareMamulFason: function () {
			return {
				"Refmatnr": this._getValue("inputReferenceStockCode"),
				"Refmatnrt": this._getValue("inputReferenceStockName"),
				"Refmatnrt2": this._getValue("inputReferenceStockName2"),
				"Zzboyaopr": this._getSelectedKey("comboBoxDyeOperation"),
				"Zzboyaopt": "F"
			};
		},

		_prepareDyeAndPrintFason: function () {
			let talepId = this.oStartupParameters,
				sequnr = 1,
				matnr = this._getValue("inputReferenceStockCode"),
				// yariMamulSayisi = this._getValue("inputYariMamulSayisi"),
				// fiyat = this._getValueDecimal("inputFiyat"),
				// fiyatBirim = this._getValue("inputFiyatBirim"),
				// boyaoptt = this._getValue("inputOperationTypeText"),
				// boyaoprt = this._getValue("inputOperationCodeText"),
				//operationType = this._getValue("inputOperationType"),
				operationCode = this._getSelectedKey("comboBoxDyeOperation");

			return [{
				"Tlpid": talepId,
				"Sequnr": sequnr.toString(),
				"Matnr": matnr,
				"Zzboyaopt": "", //operationType,
				"Zzboyaopr": operationCode, //operationCode,
				"Zzyarimamulsayisi": "", //yariMamulSayisi,
				"Zzffiyat": "0", //fiyat,
				"ZzffiyatBirim": "", //, fiyatBirim,
				"Zzboyaoptt": "", //boyaoptt,
				"Zzboyaoprt": "" //boyaoprt,
			}];

		},
		_checkMandatoryFields: function () {
			let _mandatoryFieldsArr = this._getMandatoryFields();
			return this.checkAndMarkEmptyMandatoryFields(_mandatoryFieldsArr);
		},
		_getMandatoryFields: function () {
			let _mandatoryFields = [];
			_mandatoryFields.push(this.byId("inputReferenceStockCode"));
			return _mandatoryFields;
		},

		/* =========================================================== */
		/* Event handlers */
		/* =========================================================== */
		onHandleValueHelpMaterial: function () {
			this._onHandleValueHelpMaterial();
		},
		onSelectionMaterialSelectDialogClose: function (oEvent) {
			this._onSelectionMaterialSelectDialogClose(oEvent);
		},
		onChangeComboBoxOperationName: function (oEvent) {
			this._onChangeComboBoxOperationName(oEvent);
		},
		onSaveStockCode: function () {
			this._onSaveStockCode();
		},
		onButtonMessagePopoverPress: function (oEvent) {
			this._getMessagePopover().openBy(oEvent.getSource());
		},
		onNewOperationCode: function (oEvent) {
			this._onNewOperationCode(oEvent);
		},
		onCloseOperationCode: function () {
			this._onCloseOperationCode();

		},
		onSaveOperationCode: function () {
			this._onSaveOperationCode();
		},
		onCloseReferenceMaterialVH: function () {
			this._materialHelpDialog.close();
		}
	});

});