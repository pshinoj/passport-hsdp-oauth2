# passport-hsdp-oauth2
Passport strategy for authenticating with HSDP using the OAuth 2.0 API.

This module lets you authenticate using HSDP in your Node.js applications. By plugging into Passport, HSDP authentication can be easily integrated into any application or framework that supports expressjs.

## Install
$ npm install passport-hsdp-oauth2
## Usage
The HSDP authentication strategy authenticates users using a HSDP account. The strategy requires a verify callback, which accepts these credentials and OAuth2 authorize call is done by specifying a client_id, client_secret, scope(if any) and callback URL.
```
passport.use(new HsdpStrategy({
    clientID: HSDP_CLIENT_ID,
    clientSecret: HSDP_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/hsdp/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ hsdpId: profile.username }, function (err, user) {
      return done(err, user);
    });
  }
));
```
## Authenticate Requests
Use passport.authenticate(), specifying the `hsdp` strategy, to authenticate requests.

For example, as route middleware in an Express application:
```
app.get('/auth/hsdp',
  passport.authenticate('hsdp'));

app.get('/auth/hsdp/callback', 
  passport.authenticate('hsdp', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```
