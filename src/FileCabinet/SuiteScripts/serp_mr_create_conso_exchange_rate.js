/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search'],
    /**
     * @param{record} record
     * @param{search} search
     */
    (record, search) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            try {
                return search.load({
                    id: 1516
                })
            } catch (e) {
                log.error("getInputData", e.message)
            }


        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const reduce = (reduceContext) => {
            try {
                let reduceVal = JSON.parse(reduceContext.values[0])
                reduceVal.type = "create"
                //   let id = createCustomConsoExchangeRate(JSON.parse(reduceContext.values[0]))
                log.debug("reduceVal",reduceVal)
                // log.debug("created custom exchange rate id: ", id)
            } catch (e) {
                log.error("reduceContext", e.message)
            }
        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

        }

        function createCustomConsoExchangeRate(options) {
            try {
                const fieldVal = options.values
                const custExchangeRate = record.create({
                    type: "customrecord_serp_consolidated_ex_rate",

                })
                custExchangeRate.setValue({
                    fieldId: "custrecord_serp_posting_period",
                    value: +fieldVal["internalid.period"].value
                })
                custExchangeRate.setValue({
                    fieldId: "custrecord_serp_from_subsidiary",
                    value: +fieldVal["internalid.fromSubsidiary"].value
                })
                custExchangeRate.setValue({
                    fieldId: "custrecord_serp_to_subsidiary",
                    value: +fieldVal["internalid.toSubsidiary"].value
                })
                custExchangeRate.setValue({
                    fieldId: "custrecord_serp_to_currency",
                    value: fieldVal.tocurrency
                })
                custExchangeRate.setValue({
                    fieldId: "custrecord_serp_from_currency",
                    value: fieldVal.fromcurrency
                })
                custExchangeRate.setValue({
                    fieldId: "custrecord_serp_ave_ex_rate",
                    value: fieldVal.averagerate
                })
                custExchangeRate.setValue({
                    fieldId: "custrecord_serp_cur_exchange_rate",
                    value: fieldVal.currentrate
                })
                custExchangeRate.setValue({
                    fieldId: "custrecord_serp_historical_ex_rate",
                    value: fieldVal.historicalrate
                })

                custExchangeRate.setValue({
                    fieldId: "custrecord_serp_period_closed",
                    value: fieldVal.closed = "F" ? false : true
                })

                custExchangeRate.setText({
                    fieldId: "custrecord_serp_period_start_date",
                    text: fieldVal.periodstartdate
                })

                custExchangeRate.setValue({
                    fieldId: "custrecord_serp_conso_ex_rate_link",
                    value: options.id
                })
                return custExchangeRate.save({
                    ignoreMandatoryFields: true
                })
            } catch (e) {
                log.error("createCustomConsoExchangeRate", e.message)
            }
        }

        return {getInputData, reduce, summarize}

    });
