const values = {
  get: require("./values.get.js"),
  set: require("./values.set.js")
};

const allowedSearchColumnTypes = ["string", "text"];

const sendCollection = (entity, req, res, next) => {
  let limit = req.range.limit;
  let offset = req.range.offset;
  let order = req.query.order;

  if (order == "id") order = "_id";
  if (order == "-id") order = "-_id";

  let where = undefined;

  if (req.query.where) {
    where = req.query.where;
  }

  if (req.query.q) {
    if (!req.query.fields) {
      return res
        .status(400)
        .send({ error: "cannot query without specified fields" });
    }
    let fields = req.query.fields.split(",");
    let query = req.query.q;

    let queryWhere = { $and: [] };
    let attributes = entity.attributesByName();
    fields.forEach(field => {
      if (
        attributes[field] &&
        allowedSearchColumnTypes.indexOf(attributes[field].type) !== -1
      ) {
        let searchValuePrefix = {};
        searchValuePrefix[`${field}?`] = `${query}*`;
        let searchValueMiddle = {};
        searchValueMiddle[`${field}?`] = `* ${query}*`;
        queryWhere.$and.push({ $or: [searchValuePrefix, searchValueMiddle] });
      }
    });

    where = { $and: [where, queryWhere] };
  }

  req.context.getObjectsCount(entity.name).then(count => {
    return req.context
      .getObjects(entity.name, {
        limit: limit,
        offset: offset,
        order: order,
        where: where
      })
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
