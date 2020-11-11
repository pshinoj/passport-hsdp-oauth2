/**
 * Parse profile.
 *
 * @param {Object} json
 * @return {Object}
 * @api private
 */
exports.parse = function(json) {
    var profile = {};
    profile.id = json.sub;
    profile.displayName = json.username;
    profile.username = json.username;
    profile.organizationId = json.organizations.managingOrganization;
    profile.clientId = json.client_id;

    return profile;
};