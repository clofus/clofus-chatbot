var handlebars      = require("../index");
// ======================================== 
// ! Global
// ========================================

var hbs = handlebars.create({partialsDir :__dirname});

hbs.engine(__dirname + "/test.html", {name:"Jakob"}, function(err, html) {
  if (err) {
    throw err;
  }
  console.log(html);
});