// A minimal in-memory stand-in for a Mongoose collection, used to stub the
// static methods on a real Mongoose Model (e.g. via `t.mock.method(Exercise,
// 'find', fake.find)`) so route/controller logic runs for real while the
// actual database call is what's replaced.
//
// Filters are matched by plain equality per key (String-compared, so an
// ObjectId filter value matches a string id and vice versa) — enough to
// faithfully exercise the equality filters this app actually issues
// (e.g. `{ _id, userId }`), without pulling in real MongoDB.

const matchesFilter = (doc, filter) =>
  Object.entries(filter).every(([key, value]) => String(doc[key]) === String(value));

// Real Mongoose Query objects support both `await Model.find(...)` directly
// (Query is thenable) and `await Model.find(...).exec()`. This app's own
// code uses both styles in different places, so every query stub needs to
// satisfy both: it's awaitable on its own, and also exposes .exec().
const queryResult = (getValue) => ({
  exec: async () => getValue(),
  then: (resolve, reject) => Promise.resolve().then(getValue).then(resolve, reject),
});

export const createFakeCollection = (initialDocs = []) => {
  const docs = [...initialDocs];

  return {
    docs,

    find(filter = {}) {
      return queryResult(() => docs.filter((doc) => matchesFilter(doc, filter)));
    },

    findOne(filter = {}) {
      return queryResult(() => docs.find((doc) => matchesFilter(doc, filter)) ?? null);
    },

    findById(id) {
      return queryResult(() => docs.find((doc) => String(doc._id) === String(id)) ?? null);
    },

    updateOne(filter, updates) {
      return queryResult(() => {
        const doc = docs.find((d) => matchesFilter(d, filter));
        if (!doc) {
          return { matchedCount: 0, modifiedCount: 0 };
        }
        Object.assign(doc, updates);
        return { matchedCount: 1, modifiedCount: 1 };
      });
    },

    deleteOne(filter) {
      return queryResult(() => {
        const index = docs.findIndex((d) => matchesFilter(d, filter));
        if (index === -1) {
          return { deletedCount: 0 };
        }
        docs.splice(index, 1);
        return { deletedCount: 1 };
      });
    },

    // findByIdAndUpdate/findByIdAndDelete are called without .exec() or
    // chaining anywhere in this app, so these resolve directly.
    async findByIdAndUpdate(id, updates) {
      const doc = docs.find((d) => String(d._id) === String(id));
      if (!doc) {
        return null;
      }
      Object.assign(doc, updates);
      return doc;
    },

    async findByIdAndDelete(id) {
      const index = docs.findIndex((d) => String(d._id) === String(id));
      if (index === -1) {
        return null;
      }
      const [removed] = docs.splice(index, 1);
      return removed;
    },

    push(doc) {
      docs.push(doc);
      return doc;
    },
  };
};
