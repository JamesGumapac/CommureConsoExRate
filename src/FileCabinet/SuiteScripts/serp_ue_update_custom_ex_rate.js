/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/record","N/runtime", "N/task", "./Lib/serp_conso_exchange_rate_helper"], /**
 * @param record
 * @param runtime
 * @param{task} task
 * @param helper
 */ (record,runtime, task, helper) => {
  const afterSubmit = (context) => {
    try {
      let params = getParameters();


      const newRec = context.newRecord;
      let recType = newRec.type
      const rec = record.load({
        type: recType,
        id: newRec.id,
        isDynamic: true
      })
      let fromDate = "";
      let toDate = "";
      fromDate = rec.getText("custrecord_serp_from_period");
      toDate = rec.getText("custrecord_serp_to_period");

      const dates = {
        fromDate,
        toDate,
      };
      log.debug("dates",dates)
      const accountingPeriodIds = helper.getAccountPeriodBasedFromDate(dates);

      log.debug("params",accountingPeriodIds)
      const objMRTask = task.create({
        taskType: task.TaskType.MAP_REDUCE,
        scriptId: params.scriptId,
        deploymentId:params.deploymentId,
        params: { custscript_serp_accounting_period_ids: accountingPeriodIds },
      });
      objMRTask.submit();
    } catch (e) {
      log.error("afterSubmit", e.message);
    }
  };

  function getParameters() {
    const scriptObj = runtime.getCurrentScript();
    return {
      scriptId: scriptObj.getParameter("custscript_serp_mr_script_id"),
      deploymentId: scriptObj.getParameter("custscript_serp_mr_deployment_id"),
    };
  }

  return { afterSubmit };
});
