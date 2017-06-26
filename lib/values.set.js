const inflection = require("inflection");
const Promise = require("bluebird");

module.exports = (item, values) => {
  return Promise.map(item.entity.relationships, relationship => {
    if (values[`${relationship.name}_id`]) {
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
  const getter = `get${inflection.capitalize(relationship.name)}`;
  const setter = `set${inflection.capitalize(relationship.name)}`;
  const adder = `add${inflection.capitalize(relationship.name)}`;
  const remover = `remove${inflection.capitalize(relationship.name)}`;
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
    return item.managedObjectContext
      .getObjectWithId(relationship.entity.name, value)
      .then(_item => {
        item[setter](_item);
      });
  }
};
