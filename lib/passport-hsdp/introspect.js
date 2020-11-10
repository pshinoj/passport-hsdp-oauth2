/**
 * Parse profile.
 *
 * @param {Object|String} json
 * @return {Object}
 * @api private
 */
exports.parse = function(json) {
    if ('string' == typeof json) {
        json = JSON.parse(json);
    }

    var details = {};
    details.id = json.id;
    details.displayName = json.loginId;
    details.username = json.loginId;

    return details;
};