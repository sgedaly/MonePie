//import { request } from "https";
const fetch = require('node-fetch');
var util = require('util');
var parseString = require('xml2js').parseString;
var convert = require('xml-js')
const querystring = require('querystring');


"use strict"
/**
 * A basic class to create calls to the Green Payment Processing API
 *
 * Used to easily generate API calls by instead calling pre-made PHP functions of this class with your check data.
 * The class then handles generating the API call automatically
 * TERMS:
 *  Verification Mode - requests to our API can run in either Real Time or Batch Mode.
 *    Batch - Calls made will return immediately with a success message stating the check was received. eVerification (and Phone or other verification as needed by your merchant account settings) will run at a later time requiring a separate call to CheckStatus to tell if a check has been verified/processed/etc.
 *    Real Time - (default) Calls made will insert the check(s) and immediately run eVerification (and other verification if specified by your merchant account) and will return a result stating whether the check passed or failed verification. This is the default mode and most merchants will only use this mode.
 *  EndPoint - the mode in which calls are made. You can make calls to our "test" sandbox or directly to our "live" system.
 */

const ENDPOINT = {
    test: "https://cpsandbox.com/echeck.asmx",
    live: "https://greenbyphone.com/echeck.asmx"
};
var error = "";
var endpoint = "";
//Trabajar dentro de esta clase
class CheckGateway {
    //error = "";//tal vez meterlo en el constructor
    constructor(client_id, api_pass, live = true) {
        this.client_id = client_id;
        this.api_pass = api_pass;
        this.live = false;
        // this.setEndpoint(this.live);
        this.endpoint = "https://greenbyphone.com/echeck.asmx";//"https://cpsandbox.com/echeck.asmx"
        this.error = "";
    }

    setClientID(id) {
        this.client_id = id;
    }
    getClientID() {
        return this.client_id;
    }
    setApiPassword(pass) {
        this.api_pass = pass;
    }
    getApiPassword() {
        return this.api_pass;
    }
    setEndpoint(islive) {
        if (this.live) {
            this.endpoint = ENDPOINT['live'];
        } else {
            this.endpoint = ENDPOINT['test'];
        }
    }
    getEndpoint() {
        return this.endpoint;
    }
    liveMode() {
        this.live = true;
        this.setEndpoint(this.live);//Sequential?
    }
    testMode() {
        this.live = false;
        this.setEndpoint(this.live);//Sequential?
    }
    __toString() {
        str = "Gateway Type: POST\n";
        str += "Endpoint: " + this.getEndpoint() + "\n";
        str += "Client ID: " + this.getClientID() + "\n";
        str += "ApiPassword: " + this.getApiPassword() + "\n";
        return str;
    }
    toString(html = true) {
        if (html) {
            return nl2br(this.__toString());
        }
        return this.__toString();
    }
    setLastError(error) {
        this.error = error;
    }
    getLastError() {
        return this.error;
    }



    //Segunda Parte
    //request = async(method, ...)
    async request(method, options, resultArray = []) {
        //if (!(['Client_ID' in options])) {
        //options['Client_ID'] = this.getClientID();
        // }
        // if (!(['ApiPassword' in options])) {
        //options['ApiPassword'] = this.getApiPassword();
        // }
        //Test whether they want the delimited return or not to start with
        var returnDelim = options['x_delim_data'] === "TRUE";
        //Now let's actually set delim to TRUE because we always want to get a delimited string back from the API so we can parse it
        options['x_delim_data'] = "TRUE";
        //https
        console.log('Testing Payments');
        console.log('url: ' + this.getEndpoint() + '/' + method);
        console.log(JSON.stringify(options))
        console.log('encode: ' + querystring.stringify(options));
        var retData = '';
        await fetch(this.getEndpoint() + '/' + method, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'//'application/json',//'x-www-form-urlencoded'
            },
            mode: 'cors',
            body: querystring.stringify(options),
        }).then(response => response.text())
            .then(data => {
                console.log("data: " + data);
                retData = data;
            })//{
            //     console.log('Payment Completed');
            //     // console.log(util.inspect(response, { colors: true, depth: 4 }));
            //     // response.json();
            //     // console.log(JSON.stringify(response));
            //     console.log("response: " + response.text())
            //     var result1 = convert.xml2json(response, {compact: true, spaces: 4});
            //     console.log("xml2js: " + result1)
            //     // parseString(response, function (err, result) {
            //     //     console.log("XML to JSON RESPONSE:");
            //     //     console.dir(JSON.stringify(result));
            //     // });
            //     try {
            //         if (returnDelim) {
            //             return response;
            //         } else {
            //             return this.resultToArray(response, options['x_delim_char'], resultArray);
            //         }
            //     } catch (e) {
            //         this.setLastError("An error occurred while attempting to parse the API result: " + e);
            //     } finally {}
            // }
            .catch(error => {
                console.log('Fetch failed: ' + error);
                this.setLastError('Failed with error ' + error);
                return "";
            })
        return retData;
    }

    /**
     * Function takes result string from API and parses into PHP associative Array
     *
     * If a return is specified to be returned as delimited, it will return the string. Otherwise, this function will be called to
     * return the result as an associative array in the format specified by the API documentation.
     *
     * @param string  $result       The result string as returned by cURL
     * @param string  $delim_char   The character used to delimit the string in cURL
     * @param array   $keys         An array containing the key names for the result variable as specified by the API docs
     *
     * @return array                Associative array of key=>values pair described by the API docs as the return for the called method
     */
    resultToArray(result, delim_char, keys) {
        //split = explode(delim_char, result); //Esto sirve?NO
        const split = result.split(delim_char);
        var resultArray = {};
        for (var key in keys) { //Como tomar solo el key?
            resultArray[key] = split[keys[key]]//Todavia no esta listo
            //  resultArray[key] = split[key]; //Algo falta
        }
        return resultArray;
    }

    //Tercera Parte

    /**
     * Inserts a single check
     *
     * Inserts a single draft from your customer's bank account to the default US bank account on file with your merchant account for the specified amount/date.
     *
     * @param string  $name           Customer's Full Name on their checking account
     * @param string  $email          Customer's email address. If provided, will be notified with receipt of payment. If not provided, customer will be notified via US Mail at additional cost to your Green Account
     * @param string  $phone          Customer's 10-digit US phone number in the format ###-###-####
     * @param string  $phone_ext      Customer's phone extension
     * @param string  $address1       Customer's street number and street name
     * @param string  $address2       Customer's additional address information (Suite #, Floor #, etc.)
     * @param string  $city           Customer's city name
     * @param string  $state          Customer's 2-character state abbreviation (ex. NY, CA, GA, etc.)
     * @param string  $zip            Customer's 5-digit or 9-digit zip code in the format ##### or #####-####
     * @param string  $country        Customer's 2-character country code, ex. "US"
     * @param string  $routing        Customer's 9-digit bank routing number
     * @param string  $account        Customer's bank account number
     * @param string  $bank_name      The customer's Bank Name (ex. Wachovia, BB&T, etc.)
     * @param string  $memo           Memo to appear on the check
     * @param string  $amount         Check amount in the format ##.##. Do not include monetary symbols
     * @param string  $date           The check date
     * @param string  $check_number   Optional check number you want to use to identify this check. Defaults to system generated number
     * @param bool    $delim          True if you want the result returned character delimited. Defaults to false, which returns results in an associative array format
     * @param string  $delim_char     Defaults to "," but can be set to any character you wish to delimit. Examples being "|" or "."
     * @param bool    $realtime       Specifies whether to verify in real time or in batch mode. See class comments on "Verification Mode" for more details
     *
     * @return mixed                  Returns associative array or delimited string on success OR cURL error string on failure
     */
    async singleCheck(name, email, phone, phone_ext, address1, address2, city, state, zip, country, routing, account, bank_name, memo, amount, date, check_number = '', delim = false, delim_char = ",", realtime = false) {
        var method = "OneTimeDraftBV";
        if (realtime) {
            method = "OneTimeDraftRTV";//Revisar que es esto
        }
        var retData = '';
        try {
            await this.request(method, {
                'Client_ID': "111928",
                'ApiPassword': "dm2hr6jz2d",
                'Name': name,
                'EmailAddress': email,
                'Phone': phone,
                'PhoneExtension': phone_ext,
                'Address1': address1,
                'Address2': address2,
                'City': city,
                'State': state,
                'Zip': zip,
                'Country': country,
                'RoutingNumber': routing,
                'AccountNumber': account,
                'BankName': bank_name,
                'CheckMemo': memo,
                'CheckAmount': amount,
                'CheckDate': date,
                'CheckNumber': check_number,
                'x_delim_data': delim,//Revisar esta linea
                'x_delim_char': delim_char
            }, [
                    "Result",
                    "ResultDescription",
                    "VerifyResult",
                    "VerifyResultDescription",
                    "CheckNumber",
                    "Check_ID"
                ]).then(response => {
                    console.log("response: " + response);
                    retData = response;
                })
        } catch (err) {
            console.log(err);
            return (err);
        }
        return retData
    }

    //checkStatus
    /**
     * Return the status results for a check that was previously input
     *
     * Will return a status string that contains the results of eVerification, processing status, deletion/rejection status and dates, and other relevant information
     *
     * @param string  $check_id       The numeric Check_ID of the previously entered check you want the status for
     * @param bool    $delim          True if you want the result returned character delimited. Defaults to false, which returns results in an associative array format
     * @param string  $delim_char     Defaults to "," but can be set to any character you wish to delimit. Examples being "|" or "."
     *
     * @return mixed                  Returns associative array or delimited string on success OR cURL error string on failure
     */
    checkStatus(check_id, delim = true, delim_char = ",") {
        var options = {
            "Check_ID": check_id,
            "x_delim_data": (delim) ? "TRUE" : "", //creo   ue esto si sirve
            "x_delim_char": delim_char
        };
        var resultArray = ["Result",
            "ResultDescription",
            "VerifyResult",
            "VerifyResultDescription",
            "VerifyOverridden",
            "Deleted",
            "DeletedDate",
            "Processed",
            "ProcessedDate",
            "Rejected",
            "RejectedDate",
            "CheckNumber",
            "Check_ID"];
        return this.request("CheckStatus", options, resultArray);
    }
    //cancelCheck
    /**
     * Cancels a previously entered check
     *
     * This function allows you to cancel any previously entered check as long as it has NOT already been processed.
     * NOTE: For recurring checks, this function cancels the entire series of payments.
     *
     * @param string  $check_id
     * @param bool    $delim          True if you want the result returned character delimited. Defaults to false, which returns results in an associative array format
     * @param string  $delim_char     Defaults to "," but can be set to any character you wish to delimit. Examples being "|" or "."
     *
     * @return mixed                  Returns associative array or delimited string on success OR cURL error string on failure
     */
    cancelCheck(check_id, delim = false, delim_char = ",") {
        var options = {
            "Check_ID": check_id,
            "x_delim_data": (delim) ? "TRUE" : "",
            "x_delim_char": delim_char
        };
        var resultArray = ["Result",
            "ResultDescription"];
        return this.request("CancelCheck", options, resultArray)
    };
    //refundCheck
    /**
     * Issue a refund for a single check previously entered
     *
     * Allows you to start the process of entereing a refund. On a successful result, the refund will be processed at the next batch and sent to the customer.
     *
     * @param string  $check_id		    The numeric Check_ID of the previously entered check you want the refund for
     * @param string  $RefundMemo     Memo to appear on the refund
     * @param string  $RefundAmount	  Refund amount in the format ##.##. Do not include monetary symbols
     * @param bool    $delim          True if you want the result returned character delimited. Defaults to false, which returns results in an associative array format
     * @param string  $delim_char     Defaults to "," but can be set to any character you wish to delimit. Examples being "|" or "."
     *
     * @return mixed                  Returns associative array or delimited string on success OR cURL error string on failure
     */
    refundCheck(check_id, memo, amount, delim = false, delim_char = ",") {
        var options = {
            "Check_ID": check_id,
            "RefundMemo": memo,
            "RefundAmount": amount,
            "x_delim_data": (delim) ? "TRUE" : "",
            "x_delim_char": delim_char
        };
        var resultArray = ["Result",
            "ResultDescription",
            "RefundCheckNumber",
            "RefundCheck_ID"];
        return this.request("RefundCheck", options, resultArray);
    }
    //verificationResult
    /**
     * Return the verification status of a check that was previously input
     *
     * Similar to @see self::checkStatus but returns only the result of verification
     *
     * @param string  $check_id       The numeric Check_ID of the previously entered check you want the status for
     * @param bool    $delim          True if you want the result returned character delimited. Defaults to false, which returns results in an associative array format
     * @param string  $delim_char     Defaults to "," but can be set to any character you wish to delimit. Examples being "|" or "."
     *
     * @return mixed                  Returns associative array or delimited string on success OR cURL error string on failure
     */
    verificationResult(check_id, delim = false, delim_char = ",") {
        var options = {
            "Check_ID": $check_id,
            "x_delim_data": (delim) ? "TRUE" : "",
            "x_delim_char": delim_char
        };
        var resultArray = ["Result",
            "ResultDescription",
            "VerifyResult",
            "VerifyResultDescription",
            "CheckNumber",
            "Check_ID"];
        return this.request("VerificationResult", options, resultArray);
    }
    //singleBillpay//from us to them
    /**
     * Send a single payment from your bank account to another person or company.
     *
     * Most banks offer this feature already, however, if you'd like to integrate this into your system to handles
     * rebates, incentives, et. al this is the feature you need!
     *
     * @param string  $name           Customer's Full Name on their checking account
     * @param string  $address1       Customer's street number and street name
     * @param string  $address2       Customer's additional address information (Suite #, Floor #, etc.)
     * @param string  $city           Customer's city name
     * @param string  $state          Customer's 2-character state abbreviation (ex. NY, CA, GA, etc.)
     * @param string  $zip            Customer's 5-digit or 9-digit zip code in the format ##### or #####-####
     * @param string  $country        Customer's 2-character country code, ex. "US"
     * @param string  $routing        Customer's 9-digit bank routing number
     * @param string  $account        Customer's bank account number
     * @param string  $bank_name      The customer's Bank Name (ex. Wachovia, BB&T, etc.)
     * @param string  $memo           Memo to appear on the check
     * @param string  $amount         Check amount in the format ##.##. Do not include monetary symbols
     * @param string  $date           The date for the first check in the format mm/dd/yyyy. Valid values range from 2 months prior to 1 year forward from current date
     * @param string  $check_number   Optional check number you want to use to identify this check. Defaults to system generated number
     * @param bool    $delim          True if you want the result returned character delimited. Defaults to false, which returns results in an associative array format
     * @param string  $delim_char     Defaults to "," but can be set to any character you wish to delimit. Examples being "|" or "."
     *
     * @return mixed                  Returns associative array or delimited string on success OR cURL error string on failure
     */
    async singleBillpay(name, address1, address2, city, state, zip, country, routing, account, bank_name, memo, amount, date, check_number = '', delim = false, delim_char = ",") {
        var retData = "1";
        try {
            var options = {
                'Client_ID': "111928",
                'ApiPassword': "dm2hr6jz2d",
                "Name": name,
                "Address1": address1,
                "Address2": address2,
                "City": city,
                "State": state,
                "Zip": zip,
                "Country": country,
                "RoutingNumber": routing,
                "AccountNumber": account,
                "BankName": bank_name,
                "CheckMemo": memo,
                "CheckAmount": amount,
                "CheckDate": date,
                "CheckNumber": check_number,
                "x_delim_data": delim,
                "x_delim_char": delim_char
            };
            var resultArray = ["Result",
                "ResultDescription",
                "CheckNumber",
                "Check_ID"];
            await this.request("BillPayCheck", options, resultArray).then(resp => {
                console.log(resp);
                retData = resp;
            })
        } catch (err) {
            console.log(err);
            return (err);
        }
        return retData;
    }
}
module.exports = CheckGateway