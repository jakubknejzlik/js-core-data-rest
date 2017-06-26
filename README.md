# js-core-data-rest
Rest endpoint generator for js-core-data

# Example

```
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors')
const CoreData = require("js-core-data");
const CoreDataRest = require('js-core-data-rest');

const database = new CoreData(databaseUrl);
// setup database model...

const app = express();

// specify if you are accessing api on different domain
app.use(
  cors({
    allowedHeaders: "Content-Range,Content-Type,Range,Authorization",
    exposedHeaders: "Content-Range"
  })
);
app.use(bodyParser.json());
app.use("/api", CoreDataRest.rest(database));

app.listen(3000)
```
