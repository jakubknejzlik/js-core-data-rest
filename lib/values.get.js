const inflection = require("inflection");
const Promise = require("bluebird");

module.exports = item => {
  let values = item.getValues();
  return Promise.map(item.entity.relationships, relationship => {
    return getRelationshipIds(item, relationship).then(ids => {
      values[`${relationship.name}_id`] = ids;
    });
  }).thenReturn(values);
};

const getRelationshipIds = (item, relationship) => {
  const getter = `get${inflection.camelize(relationship.name)}`;
  if (relationship.toMany) {
    return item
      [getter]()
      .map(item => {
        return item.id;
      })
      .then(itemsIds => {
        return itemsIds;
      });
  } else {
    return Promise.resolve(item[`${getter}ID`]());
  }
};
