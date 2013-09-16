exports.routes = {
  login: {
    get: {
      spec: {
        "description" : "login",
        "path" : "/users.{format}/{userId}",
        "notes" : "Returns an user based on ID",
        //"params" : [param.path("userId", "ID of the user that needs to be fetched", "string")],
        "responseClass" : "User",
        //"errorResponses" : [ swaggerErrors.invalid('id'), swaggerErrors.notFound('user') ],
        "nickname" : "getUserById"
      },
      action:
        function(req, res, next) {
          if(req.session.user) {
            res.writeHead(303, {Location: '/secret'})
            return res.end()
          }

          var next_url = req.query.next ? req.query.next : '/'

          res.end('<html><form method="post" action="/auth/login"><input type="hidden" name="next" value="' + next_url + '"><input type="text" placeholder="username" name="username"><input type="password" placeholder="password" name="password"><button type="submit">Login</button></form>')
      }
    },
    post: {
      spec: {
        "description" : "login",
        "path" : "/users.{format}/{userId}",
        "notes" : "Returns an user based on ID",
        //"params" : [param.path("userId", "ID of the user that needs to be fetched", "string")],
        "responseClass" : "User",
        //"errorResponses" : [ swaggerErrors.invalid('id'), swaggerErrors.notFound('user') ],
        "nickname" : "getUserById"
      },
      action:
        function(req, res, next) {
          req.session.user = req.body.username

          res.writeHead(303, {Location: req.body.next || '/'})
          res.end()
        }
    }
  }
}
