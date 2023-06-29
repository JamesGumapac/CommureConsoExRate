/**
 * @NApiVersion 2.1
 */
define(["N/record", "N/search"], /**
 * @param{record} record
 * @param{search} search
 */ (record, search) => {
  /**
   * Create or Update Consolidated Exchange Rate
   * @param {object} options
   * @return {*}
   */
  function createUpdateCustomConsoExchangeRate(options) {
    try {
      const fieldVal = options.values;
      let custExchangeRate = null;
      if (options.type === "create") {
        custExchangeRate = record.create({
          type: "customrecord_serp_consolidated_ex_rate",
          isDynamic: true,
        });
      } else {
        custExchangeRate = record.load({
          type: "customrecord_serp_consolidated_ex_rate",
          id: options.customId,
        });
      }
      let name = "test";

      custExchangeRate.setValue({
        fieldId: "custrecord_serp_posting_period",
        value: +fieldVal["internalid.period"].value,
      });
      custExchangeRate.setValue({
        fieldId: "custrecord_serp_from_subsidiary",
        value: +fieldVal["internalid.fromSubsidiary"].value,
      });
      custExchangeRate.setValue({
        fieldId: "custrecord_serp_to_subsidiary",
        value: +fieldVal["internalid.toSubsidiary"].value,
      });
      custExchangeRate.setValue({
        fieldId: "custrecord_serp_to_currency",
        value: fieldVal.tocurrency,
      });
      custExchangeRate.setValue({
        fieldId: "custrecord_serp_from_currency",
        value: fieldVal.fromcurrency,
      });
      custExchangeRate.setValue({
        fieldId: "custrecord_serp_ave_ex_rate",
        value: fieldVal.averagerate,
      });

      custExchangeRate.setValue({
        fieldId: "custrecord_serp_cur_exchange_rate",
        value: fieldVal.currentrate,
      });
      custExchangeRate.setValue({
        fieldId: "custrecord_serp_historical_ex_rate",
        value: fieldVal.historicalrate,
      });
      custExchangeRate.setValue({
        fieldId: "name",
        value: name,
      });
      custExchangeRate.setValue({
        fieldId: "custrecord_serp_period_closed",
        value: (fieldVal.closed = "F" ? false : true),
      });

      custExchangeRate.setText({
        fieldId: "custrecord_serp_period_start_date",
        text: fieldVal.periodstartdate,
      });

      custExchangeRate.setValue({
        fieldId: "custrecord_serp_conso_ex_rate_link",
        value: options.id,
      });
      let exchangeId = custExchangeRate.save({
        ignoreMandatoryFields: true,
      });
      const exchangeRateRec = record.load({
        type: "customrecord_serp_consolidated_ex_rate",
        id: exchangeId,
        isDynamic: false,
      });
      let fromSub = exchangeRateRec.getText("custrecord_serp_from_subsidiary");
      fromSub = fromSub.substring(fromSub.lastIndexOf(":") + 1, fromSub.length);
      let toSub = exchangeRateRec.getText("custrecord_serp_to_subsidiary");
      toSub = toSub.substring(fromSub.lastIndexOf(":") + 1, fromSub.length);
      let periodId = custExchangeRate.getValue(
        "custrecord_serp_posting_period"
      );
      let periodName = getPeriodName(periodId);

      let finalName = `${fromSub} to ${toSub} | ${exchangeRateRec.getValue(
        "custrecord_serp_from_currency"
      )} to ${exchangeRateRec.getValue(
        "custrecord_serp_to_currency"
      )} | ${periodName}`;
      exchangeRateRec.setValue("name", finalName);
      exchangeRateRec.save({
        ignoreMandatoryFields: true,
      });
    } catch (e) {
      log.error("createCustomConsoExchangeRate", e.message);
    }
  }

  /**
   * Get accounting period internalId
   * @param {string} options.fromDate From Date
   * @param {string} options.toDate to Date
   * @return {array} Account Period List
   */
  function getAccountPeriodBasedFromDate(options) {
    try {
      let accountingPeriodId = [];
      const accountingperiodSearchObj = search.create({
        type: "accountingperiod",
        filters: [["startdate", "within", options.fromDate, options.toDate]],
        columns: [
          search.createColumn({
            name: "periodname",
            sort: search.Sort.ASC,
            label: "Name",
          }),
          search.createColumn({ name: "internalid", label: "Internal ID" }),
        ],
      });

      accountingperiodSearchObj.run().each(function (result) {
        accountingPeriodId.push(result.getValue("internalid"));
        return true;
      });
      return [...new Set(accountingPeriodId)];
    } catch (e) {
      log.error("getAccountPeriodBasedFromDate", e.message);
    }
  }

  /**
   * Get the consolidated exchange rate information
   * @param periodInternalIds
   * @return {*}
   */
  function searchForConsolidateExchangeRate(periodInternalIds) {
    try {
      return search.create({
        type: "consolidatedexchangerate",
        filters: [["period", "anyof", periodInternalIds]],
        columns: [
          search.createColumn({
            name: "internalid",
            join: "period",
            label: "Period",
          }),
          search.createColumn({
            name: "internalid",
            join: "fromSubsidiary",
            label: "From Subsidiary",
          }),
          search.createColumn({
            name: "internalid",
            join: "toSubsidiary",
            label: "To Subsidiary",
          }),
          search.createColumn({ name: "fromcurrency", label: "From Currency" }),
          search.createColumn({ name: "tocurrency", label: "To Currency" }),
          search.createColumn({ name: "currentrate", label: "Current" }),
          search.createColumn({ name: "averagerate", label: "Average" }),
          search.createColumn({ name: "historicalrate", label: "Historical" }),
          search.createColumn({ name: "closed", label: "Closed" }),
          search.createColumn({
            name: "periodstartdate",
            label: "Period Start Date",
          }),
        ],
      });
    } catch (e) {
      log.error("searchForConsolidateExchangeRate", e.message);
    }
  }

  /**
   * Get the consolidated exchange rate Id
   * @param internalId
   * @return {int} Return the custom consolidated exchange rate id
   */
  function getCustomConsolidatedExchangeRate(internalId) {
    try {
      let custExRateId = null;
      const customrecord_serp_consolidated_ex_rateSearchObj = search.create({
        type: "customrecord_serp_consolidated_ex_rate",
        filters: [["custrecord_serp_conso_ex_rate_link", "is", internalId]],
        columns: [
          search.createColumn({
            name: "name",
            sort: search.Sort.ASC,
            label: "Name",
          }),
          search.createColumn({ name: "scriptid", label: "Script ID" }),
        ],
      });
      customrecord_serp_consolidated_ex_rateSearchObj
        .run()
        .each(function (result) {
          custExRateId = result.id;
        });
      return custExRateId;
    } catch (e) {
      log.error("getCustomConsolidatedExchangeRate", e.message);
    }
  }

  function getPeriodName(periodInternalId) {
    try {
      let periodName;
      const accountingperiodSearchObj = search.create({
        type: "accountingperiod",
        filters: [["internalid", "anyof", periodInternalId]],
        columns: [
          search.createColumn({
            name: "periodname",
            sort: search.Sort.ASC,
            label: "Name",
          }),
          search.createColumn({ name: "internalid", label: "Internal ID" }),
        ],
      });

      accountingperiodSearchObj.run().each(function (result) {
        periodName = result.getValue({
          name: "periodname",
        });
      });
      return periodName;
    } catch (e) {
      log.error("getPeriodName", e.message);
    }
  }

  /**
   * Get the matching custom consolidated exchange rate based on the from currency and period of the transaction
   * @param {string} options.fromCurrency
   * @param {string} options.period
   * @param {number} options.subsidiary
   * @return {number} internal Id of the custom consolidated exchange rate
   */
  function getConsolidateExchangeRate(options) {
    try {
      let consolidatedId;
      const customrecord_serp_consolidated_ex_rateSearchObj = search.create({
        type: "customrecord_serp_consolidated_ex_rate",
        filters: [
          ["custrecord_serp_from_currency", "is", options.fromCurrency],
          "AND",
          ["custrecord_serp_posting_period", "anyof", options.period],
            "AND",
          ["custrecord_serp_from_subsidiary","anyof",options.subsidiary]
        ],
        columns: [
          search.createColumn({
            name: "name",
            sort: search.Sort.ASC,
            label: "Name",
          }),
          search.createColumn({ name: "scriptid", label: "Script ID" }),
        ],
      });

      customrecord_serp_consolidated_ex_rateSearchObj
        .run()
        .each(function (result) {
          consolidatedId = result.id;
        });
      return consolidatedId;
    } catch (e) {
      log.error("getConsolidateExchangeRate", e.message);
    }
  }

  return {
    createUpdateCustomConsoExchangeRate,
    getCustomConsolidatedExchangeRate,
    getAccountPeriodBasedFromDate,
    searchForConsolidateExchangeRate,
    getConsolidateExchangeRate
  };
});
