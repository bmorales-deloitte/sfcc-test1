'use strict';
var Resource = require('dw/web/Resource');


/**
 * default hook if no payment processor is not supported
 * @return {Object} not supported
 */
function Handle() {
    var errors = [];
    errors.push(Resource.msg('error.payment.processor.not.supported', 'checkout', null));
    return { fieldErrors: [], serverErrors: errors, error: true };
}

exports.Handle = Handle;
