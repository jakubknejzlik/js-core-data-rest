const inflection = require("inflection");
const Promise = require("bluebird");

module.exports = (item, values) => {
  return Promise.map(item.entity.relationships, relationship => {
    if (typeof values[`${relationship.name}_id`] !== "undefined") {
      return setRelationshipIds(
        item,
        relationship,
        values[`${relationship.name}_id`]
      );
    }
  }).then(() => {
    item.setValues(values);
  });
};

const setRelationshipIds = (item, relationship, value) => {
  const getter = `get${inflection.camelize(relationship.name)}`;
  const setter = `set${inflection.camelize(relationship.name)}`;
  const adder = `add${inflection.camelize(relationship.name)}`;
  const remover = `remove${inflection.camelize(relationship.name)}`;
  if (relationship.toMany) {
    return item
      [getter]()
      .then(items => {
        item[remover](items);
      })
      .then(() => {
        return item.managedObjectContext.getObjects(relationship.entity.name, {
          where: { _id: value }
        });
      })
      .then(values => {
        item[adder](values);
      });
  } else {
    if (value === null) {
      item[setter](null);
    } else {
      return item.managedObjectContext
        .getObjectWithId(relationship.entity.name, value)
        .then(_item => {
          item[setter](_item);
        });
    }
  }
};
