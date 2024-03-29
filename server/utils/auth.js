const jwt = require("jsonwebtoken");

const secret = process.env.tokenSecret; // remember this is for production
// const secret = "thiscouldbeasecret"; // this is for dev
const expiration = "3h"; // changed to three hours

module.exports = {
    authMiddleware: function ({ req }) {
      // allows token to be sent via req.body, req.query, or headers
      let token = req.body.token || req.query.token || req.headers.authorization;
  
      // ["Bearer", "<tokenvalue>"]
      if (req.headers.authorization) {
        token = token.split(' ').pop().trim();
      }
  
      if (!token) {
        return req;
      }
  
      try {
        const { data } = jwt.verify(token, secret, { maxAge: expiration });
        req.user = data;
      } catch {
        console.log('Hey... this token is invalid!');
      }
  
      return req;
    },
    signToken: function ({ username, email, _id }) {
      const payload = { username, email, _id };
  
      return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
    },
  };