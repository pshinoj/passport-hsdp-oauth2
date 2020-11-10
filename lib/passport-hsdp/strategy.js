/**
 * Module dependencies.
 */
var util = require('util')
    , OAuth2Strategy = require('passport-oauth2')
    , Profile = require('./introspect')
    , InternalOAuthError = require('passport-oauth2').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Hsdp authentication strategy authenticates requests by delegating to
 * IAM using the OAuth 2.0 protocol.
 *
 *
 * Options:
 *   - `clientId`      HSDP client_id associated with your account
 *   - `clientSecret`  HSDP client_secret associated with your account
 *   - `callbackURL`   URL to which HSDP will redirect the user after granting authorization
 *   - `scope`         Array of oauth2 scopes to request
 *
 * Examples:
 *
 *     passport.use(new HsdpStrategy({
 *         clientId: 'SomeClient',
 *         clientSecret: 'SomeSecret'
 *         callbackURL: 'https://hsdp-client.example.com/auth/hsdp/callback'
 *       },
 *       function(access_token, refresh_token, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
    options = options || {};
    options.iamURL = options.iamURL || 'https://iam.us-east.philips-healthsuite.com';
    options.authorizationURL = options.iamURL + '/authorize/oauth2/authorize';
    options.tokenURL = options.iamURL + '/authorize/oauth2/token';
    options.customHeaders = options.customHeaders || {'API-Version': '2'};
    options.customHeaders.Authorization = 'Basic ' + new Buffer(options.clientId + ':' + options.clientSecret).toString('base64');

    OAuth2Strategy.call(this, options, verify);
    this.name = 'hsdp';
    this._introspectURL = options.iamURL + '/authorize/oauth2/introspect';
    this._oauth2.useAuthorizationHeaderforGET(true);
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Introspect token to retrieve user details
 *
 * This function returns user details, with the following properties:
 *
 *   - `provider`         always set to `hsdp`
 *   - `id`               the user's HSDP unique id
 *   - `username`         the user's HSDP user id
 *   - `displayName`      the user's full name (first name + last name)
 *   - `memberships`      array list of permissions, roles and group memberships
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userDetails = function(accessToken, done) {
    this._oauth2.get(this._introspectURL, accessToken, function (err, body, res) {
        var json;

        if (err) {
            return done(new InternalOAuthError('Failed to introspect user token', err));
        }

        try {
            json = JSON.parse(body);
        } catch (ex) {
            return done(new Error('Failed to parse user details'));
        }

        var details = Profile.parse(json);
        details.provider  = 'hsdp';
        details._json = json;

        done(null, details);
    });
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
