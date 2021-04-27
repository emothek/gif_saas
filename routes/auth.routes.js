const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");

const { validate, valiationRules } = require('../middlewares/signup.validation')

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  
  app.post(
    "/api/auth/signup",
    [
      valiationRules(),
      validate,
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);
};