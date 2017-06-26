const assert = require("assert");
const inflection = require("inflection");
const Router = require("express").Router;
const expressResponseRange = require("express-response-range");

const values = {
  get: require("./values.get.js"),
  set: require("./values.set.js")
};
const collection = require("./rest.collection");

module.exports = (database, options) => {
  assert.ok(database.model, "database has no model defined");

  const app = new Router();

  app.use(database.middleware());
  app.use(expressResponseRange({ alwaysSendRange: true }));

  let entities = Object.keys(database.model.entities);
  entities.forEach(entityName => {
    let entity = database.model.entities[entityName];

    let collectionName = inflection.pluralize(entity.name).toLowerCase();

    app.get(`/${collectionName}`, (req, res, next) => {
      collection.send(entity, req, res, next);
    });
    app.post(`/${collectionName}/:id`, (req, res, next) => {
      let item = req.context.create(entity.name);
      values
        .set(item, req.body)
        .then(() => {
          return req.context.save();
        })
        .then(() => {
          return values.get(item);
        })
        .then(values => {
          res.status(201).send(values);
        })
        .catch(next);
    });
    app.all(`/${collectionName}/:id*`, (req, res, next) => {
      req.context.getObjectWithId(entity.name, req.params.id).then(item => {
        if (!item) {
          return res.status(404).send({ error: "resource not found" });
        }
        req.item = item;
        next();
      });
    });
    app.get(`/${collectionName}/:id`, (req, res, next) => {
      values
        .get(req.item)
        .then(values => {
          res.send(values);
        })
        .catch(next);
    });
    app.patch(`/${collectionName}/:id`, (req, res, next) => {
      values
        .set(req.item, req.body)
        .then(() => {
          return req.context.save();
        })
        .then(() => {
          return values.get(req.item);
        })
        .then(values => {
          res.send(values);
        })
        .catch(next);
    });
    app.delete(`/${collectionName}/:id`, (req, res, next) => {
      req.context.deleteObject(req.item);
      req.context.save().then(() => {
        res.status(201).end();
      });
    });
  });

  app.use((req, res, next) => {
    res.status(404).send({ error: "resource not found" });
  });

  return app;
};
