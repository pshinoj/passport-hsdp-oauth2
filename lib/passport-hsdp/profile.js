/**
 * Parse profile.
 *
 * @param {Object} json
 * @return {Object}
 * @api private
 */
exports.parse = function(json) {
    var profile = {};
    if (json.hasOwnProperty('active') && json.active === true) {
        profile.id = json.sub;
        profile.displayName = json.username;
        profile.username = json.username;
        if (json.hasOwnProperty('organizations')) {
            profile.organizationId = json.organizations.managingOrganization;
        }
        profile.clientId = json.client_id;
    }
    return profile;
};