// Minimal D1 stand-in over node:sqlite for unit tests. It mirrors the D1 behavior this
// module relies on: prepare/bind/first/all/run, transactional batch(), foreign keys on,
// the 100 bound-parameter limit, and rejection of undefined bind values. It is not
// workerd; deploy-time behavior still needs a live check.
import { DatabaseSync } from "node:sqlite";

const MAX_BOUND_PARAMETERS = 100;

export function createD1(...sqlScripts) {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");
  for (const sql of sqlScripts) db.exec(sql);
  // Tests set hooks.fail = (sql, args) => boolean to simulate a D1 error on one statement.
  const hooks = { fail: null };
  const execute = (sql, args, mode) => {
    if (args.length > MAX_BOUND_PARAMETERS) throw new Error("D1_ERROR: too many SQL variables");
    if (args.some(arg => arg === undefined)) throw new Error("D1_TYPE_ERROR: Type 'undefined' not supported for value 'undefined'");
    if (hooks.fail?.(sql, args)) throw new Error("D1_ERROR: simulated failure");
    const statement = db.prepare(sql);
    if (mode === "first") return statement.get(...args);
    if (mode === "all") return statement.all(...args);
    return statement.run(...args);
  };
  const runResult = result => ({ success: true, meta: { changes: Number(result.changes) } });
  const statement = (sql, args = []) => ({
    sql,
    args,
    bind: (...values) => statement(sql, values),
    first: async column => {
      const row = execute(sql, args, "first");
      if (!row) return null;
      return column ? row[column] ?? null : { ...row };
    },
    all: async () => ({ success: true, results: execute(sql, args, "all").map(row => ({ ...row })) }),
    run: async () => runResult(execute(sql, args, "run")),
  });
  return {
    sqlite: db,
    hooks,
    prepare: sql => statement(sql),
    batch: async statements => {
      if (!statements.length) throw new Error("D1_ERROR: batch() needs at least one statement");
      db.exec("BEGIN");
      try {
        const results = statements.map(item => runResult(execute(item.sql, item.args, "run")));
        db.exec("COMMIT");
        return results;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
}

export function createR2() {
  const objects = new Map();
  return {
    objects,
    put: async (key, value, options) => {
      objects.set(key, { value, options });
      return { key };
    },
    delete: async key => {
      objects.delete(key);
    },
  };
}
