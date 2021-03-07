sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/ValueState"
], function (Controller, History, ValueState) {
	"use strict";
	return Controller.extend("CreateBasekod.ZMM015F_MAMULFASON.controller.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},
		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		setValueBinding: function (id, parameter, parameterType) {
			if (parameter !== "") {
				let dummy = parameterType === "input" ? this.byId(id).setValue(parameter) : this.byId(id).setSelectedKey(parameter);
				this.byId(id).setValueState(ValueState.None);
			}
		},
		fieldChange: (changeFieldForStatus) => {
			changeFieldForStatus.setValueState(ValueState.None);
		},

		addNewLine: (model, data, jsonRow) => { //ReportList, ThreadList ve SteelSettingsList için ortak kullanılmakta.
			data.push(jsonRow);
			model.refresh();
		},

		refreshAfterDeletedOrderNumber: (model, list) => {
			let count,
				ind;

			if (list.length !== 0) {
				for (ind in list) {
					count = ind;
					count++;
					list[ind].orderNo = count;
				}
			} else {
				count = 0;
			}

			model.refresh();
			return count;

		},

		checkAndMarkEmptyMandatoryFields: function (mandatoryFields) {
			let booleanCheckForFields = true;

			mandatoryFields.forEach(mandatoryField => {
				if (mandatoryField && mandatoryField.getValue) {
					if (!mandatoryField || mandatoryField.getValue().trim() === "") {
						booleanCheckForFields = false;
						mandatoryField.setValueState(ValueState.Error);

					}
				} else if (mandatoryField && mandatoryField.getSelectedItem) {
					booleanCheckForFields = !mandatoryField.getSelectedItem() || mandatoryField.getSelectedItem().getText().trim() === "" ?
						false : true;
				}

			});

			return booleanCheckForFields;
		},

		deleteSelectedRowInObject: function (modelName, model, event, listData) {
			let orderNo = event.getSource().getParent().getBindingContext(modelName).getObject().orderNo;

			listData.splice(orderNo - 1, 1);
			model.refresh();

			return model;

		},

		deepCreate: function (uri, deepData) {
			let that = this;
			this._oDataModel.create(uri, deepData, {
				success: (oData, oResponse) => {
					// 	that._bindCustomMessage("Fason Mamul yaratılmıştır.");
					sap.ui.getCore().getMessageManager().addMessages(
						new sap.ui.core.message.Message({
							message: `${oData.to_MamulFason.Refmatnr} numaralı Fason Mamul yaratılmıştır.`, //"Fason Mamul yaratılmıştır.",
							type: sap.ui.core.MessageType.Success,
							persistent: true
						})
					);
					that._getMessagePopover().openBy(that.getView().byId("buttonMessagePopover"));
				},
				error: (oError) => {
					that._getMessagePopover().openBy(that.getView().byId("buttonMessagePopover"));
				}

			});
		},
		_createNewJsonLine: function (listType) {
			let returnJSON = {};
			switch (listType) {
			case "operation":
				returnJSON = {
					"orderNo": ++this.operationCount,
					"operationName": "",
					"operationCode": ""
				};
				break;

			default:
				returnJSON = {};
			}
			return returnJSON;
		},
		_getSelectedSecondText: function (item) {
			return this.byId(item).getSelectedItem() ? this.byId(item).getSelectedItem().getAdditionalText() : "";
		},
		_getSelectedText: function (item) {
			return this.byId(item).getSelectedItem() !== null ? this.byId(item).getSelectedItem().getText() : "";
		},
		_getSelectedTextWithDecimals: function (item) {
			return this.byId(item).getSelectedItem() !== null ? this.byId(item).getSelectedItem().getText() : "0";
		},
		_getSelectedKey: function (item) {
			return this.byId(item).getSelectedItem() ? this.byId(item).getSelectedItem().getKey() : "";
		},
		_getValue: function (item) {
			return this.byId(item).getValue() ? this.byId(item).getValue() : "";
		},
		_getSelected: function (item) {
			return this.byId(item).getSelected() ? true : false;
		},
		_getValueDecimal: function (item) {
			return this.byId(item).getValue() ? this.byId(item).getValue() : "0";
		},
		_getSelectedCheckBoxReturnText: function (item) {
			return this.byId(item).getSelected() ? "X" : "";
		},
		_getSelectedCheckboxReturn: function (item) {
			return this.byId(item).getSelected() ? true : false;
		},
		_getText: function (item) {
			return this.byId(item).getText() ? this.byId(item).getText() : "";
		},

		/*
		 * Clear all messages
		 * @private
		 */
		_clearAllMessages: function () {
			sap.ui.getCore().getMessageManager().removeAllMessages();
		}

	});

});