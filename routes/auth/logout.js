exports.routes = {
  logout: {
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
          req .session.destroy(function(err) {
            res.writeHead(303, {Location: '/'})
            res.end()
          })
        }
    }
  }
}
