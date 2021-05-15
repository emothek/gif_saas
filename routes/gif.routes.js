const controller = require("../controllers/gif.controller");



module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.post('/savegif', controller.saveGIF)

    app.get('/gif/:param', controller.queryGIFS)
    app.get('/gifs/search/', controller.searchGIFS)

  };