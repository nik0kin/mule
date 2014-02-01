/**
 * utils/dateUtils.js
 *
 * @nikpoklitar
 */

   exports.getNiceDate = function () {
     var d = new Date();

     var month = d.getMonth()+1;
     var day = d.getDate();

     return output = d.getFullYear() + '_' +
       (month<10 ? '0' : '') + month + '_' +
       (day<10 ? '0' : '') + day;
   };