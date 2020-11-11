/**
 * Module dependencies.
 */
var util = require('util')
    , base64 = require('base-64')
    , utf8 = require('utf8')
    , OAuth2Strategy = require('passport-oauth2')
    , Profile = require('./profile')
    , InternalOAuthError = require('passport-oauth2').InternalOAuthError;
const querystring = require("querystring");


/**
 * `HsdpStrategy` constructor.
 *
 * The Hsdp authentication strategy authenticates requests by delegating to
 * IAM using the OAuth 2.0 protocol.
 *
 *
 * Options:
 *   - `clientID`      HSDP client_id associated with your account
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
function HsdpStrategy(options, verify) {
    options = options || {};
    options.domain = options.domain || 'https://iam.us-east.philips-healthsuite.com';
    options.authorizationURL = options.domain + '/authorize/oauth2/authorize';
    options.tokenURL = options.domain + '/authorize/oauth2/token';
    options.customHeaders = options.customHeaders || {'API-Version': options.apiVersion};
    var text = options.clientID + ':' + options.clientSecret;
    var encoded = base64.encode(utf8.encode(text));
    options.customHeaders.Authorization = 'Basic ' + encoded;

    OAuth2Strategy.call(this, options, verify);
    this.name = 'hsdp';
    this._introspectURL = options.domain + '/authorize/oauth2/introspect';

    // Authorize Request using Authorization Header
    this._oauth2.getOAuthAccessToken = function (code, params, callback) {
        var codeParam, post_data, post_headers;
        params = params || {};
        codeParam = params.grant_type === 'refresh_token' ? 'refresh_token' : 'code';
        params[codeParam] = code;
        post_data = querystring.stringify(params);
        post_headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        this._request("POST", this._getAccessTokenUrl(), post_headers, post_data, null, function (error, data, response) {
            if (error) callback(error);
            else {
                var results;
                try {
                    // As of http://tools.ietf.org/html/draft-ietf-oauth-v2-07
                    // responses should be in JSON
                    results = JSON.parse(data);
                } catch (e) {
                    results = querystring.parse(data);
                }
                var access_token = results["access_token"];
                var refresh_token = results["refresh_token"];
                callback(null, access_token, refresh_token, results); // callback results
            }
        });

    };

}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(HsdpStrategy, OAuth2Strategy);


/**
 * Introspect token to retrieve user details
 *
 * This function returns user profile, with the following properties:
 *
 *   - `provider`         always set to `hsdp`
 *   - `id`               the user's HSDP unique id
 *   - `username`         the user's HSDP user id
 *   - `displayName`      the user's full name (first name + last name)
 *   - `organizationId`   the user's organization id
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
HsdpStrategy.prototype.userProfile = function (accessToken, done) {
    var post_headers = {'API-Version': '3', 'Authorization': 'Bearer ' + accessToken};

    this._oauth2._request('POST', this._introspectURL, post_headers, "", null, function (err, body, res) {
        if (err) {
            return done(new InternalOAuthError('failed to fetch user profile', err));
        }

        try {
            var json = JSON.parse(body);

            var profile = Profile.parse(json);
            profile.provider = 'hsdp';
            profile._raw = body;
            profile._json = json;

            done(null, profile);
        } catch (e) {
            done(e);
        }

    });
}

/**
 * Expose `HsdpStrategy`.
 */
module.exports = HsdpStrategy;
