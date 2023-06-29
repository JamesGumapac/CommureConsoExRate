/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/record","./Lib/serp_conso_exchange_rate_helper"], (record,util) => {
  /**
   * Defines the function definition that is executed after record is submitted.
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
   * @since 2015.2
   */
  const afterSubmit = (scriptContext) => {

    try {
      const newRec = scriptContext.newRecord
      const type = newRec.type
      let id = newRec.id
      log.audit("info",{id,type})
      let rec = record.load({
        type: type,
        id: id,
        isDynamic: true
      })
      const fromCurrency = rec.getText("currency")
      const period = rec.getValue("postingperiod")
      const subsidiary = rec.getValue("subsidiary")
      let consoExchangeId = util.getConsolidateExchangeRate({
        fromCurrency,period, subsidiary
      })
      if(consoExchangeId) rec.setValue({fieldId:"custbody_serp_consorate", value: consoExchangeId})
      log.debug("id", consoExchangeId)
      rec.save({ignoreMandatoryFields: true})
    } catch (e) {
      log.error("afterSubmit", e.message);
    }
  };

  return { afterSubmit };
});
