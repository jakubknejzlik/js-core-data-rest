const values = {
  get: require("./values.get.js"),
  set: require("./values.set.js")
};

const sendCollection = (entity, req, res, next) => {
  let limit = req.range.limit;
  let offset = req.range.offset;

  let where = undefined;

  req.context.getObjectsCount(entity.name).then(count => {
    return req.context
      .getObjects(entity.name, { limit: limit, offset: offset })
      .map(item => {
        return values.get(item);
      })
      .then(list => {
        res.sendRange(list, count);
      });
  });
};

module.exports = {
  send: sendCollection
};
