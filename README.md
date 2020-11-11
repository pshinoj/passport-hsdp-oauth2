# passport-hsdp-oauth2
Passport strategy for authenticating with HSDP using the OAuth 2.0 API.

This module lets you authenticate using HSDP in your Node.js applications. By plugging into Passport, HSDP authentication can be easily integrated into any application or framework that supports expressjs.

## Install
$ npm install passport-hsdp-oauth2
## Usage
The HSDP authentication strategy authenticates users using a HSDP account. The strategy requires a verify callback, which accepts these credentials and OAuth2 authorize call is done by specifying a client_id, client_secret, scope(if any) and callback URL.
```
passport.use(new HsdpStrategy({
      domain: process.env.HSDP_IAM_DOMAIN,
      clientID: process.env.HSDP_IAM_CLIENT_ID,
      clientSecret: process.env.HSDP_IAM_CLIENT_SECRET,
      callbackURL: process.env.HSDP_IAM_CALLBACK_URL,
      apiVersion: process.env.HSDP_IAM_VERSION
    },
  function(accessToken, refreshToken, profile, done) {
      return done(err, user);
  }
));
```
## Authenticate Requests
Use passport.authenticate(), specifying the `hsdp` strategy, to authenticate requests.

For example, as route middleware in an Express application:
```
app.get('/auth/login',
      passport.authenticate("hsdp", {
        prompt: "login"
    }),
    (req, res) => {
        res.redirect("/");
    });

app.get('/auth/hsdp/callback', 
    passport.authenticate("hsdp", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect("/auth/login");
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            const returnTo = req.session.returnTo;
            delete req.session.returnTo;
            res.redirect(returnTo || "/");
        });
    })(req, res, next);
});
```
