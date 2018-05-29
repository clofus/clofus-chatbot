### node-handlebars


Nodejs Handlebars with helpers.

---

**Install**

```
npm install node-handlebars

```

**Use**

```
var handlebars = require("node-handlebars");

var hbs = handlebars.create({
  partialsDir :__dirname
 });

hbs.engine(__dirname + "/test.html", {name:"Jakob"}, function(err, html) {
  if (err) {
    throw err;
  }
  console.log(html);
}); 
 
```

**Options**

| **key**      | **value** | **default**          | **required**  |
| :-:          | :-:       | :-:                  | :-:           |
| extension    | string    | ".hbs"               | optional      |
| compress     | bool      | false                | optional      |
| layoutDir    | string    | "views"              | optional      |
| partialDir   | string    | "views/partials"     | optional      |

**Quick example**

Raw file index.html:

```
<!DOCTYPE HTML>
<html lang="en-US">
<head>
	<meta charset="UTF-8">
	<title>{{name}}</title>
</head>
<body>
	Hello {{name}}
</body>
</html>
 
```

Result index.html:

```
<!DOCTYPE HTML><html lang="en-US"><head><meta charset="UTF-8"><title>Jakob</title></head><body>Hello Jakob</body></html>
 
```

**Upcoming features**

* Command Line Interface
* Dynamic partials

**Contributing**

WIP  

**Showcasing**

APDB




