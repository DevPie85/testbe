const identifyAccount = (app, limiter) => (req, res, next) => {
  console.log("Received a request to /AAA/v1/Authenticate/Account/Identify");
  console.log("Request body: ", req.body);
  app.oauth.token()(req, res, (err) => {
    if (err) {
      console.error("Error in /AAA/v1/Authenticate/Account/Identify: ", err);
    }
    next(err);
  });
};

module.exports = identifyAccount;
