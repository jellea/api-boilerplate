exports.routes = {
  userlist: {
    get: {
      spec: {
        "description" : "users",
        "path" : "/users.{format}/{userId}",
        "notes" : "Returns an user based on ID",
        //"params" : [param.path("userId", "ID of the user that needs to be fetched", "string")],
        "responseClass" : "User",
        //"errorResponses" : [ swaggerErrors.invalid('id'), swaggerErrors.notFound('user') ],
        "nickname" : "getUserById"
      },
      action:
        function (req, res) {
          res.jsonp({hi:'world'})
        }
    }
  }
}
