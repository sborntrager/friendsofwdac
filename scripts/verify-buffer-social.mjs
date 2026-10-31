import assert from "node:assert/strict";
import worker from "../workers/buffer-social/index.js";

const response = await worker.fetch(new Request("https://www.friendsofwdac.org/health"), {});
const body = await response.json();

assert.equal(response.status, 503);
assert.equal(body.ok, false);
assert.ok(Array.isArray(body.missing));
assert.ok(body.missing.includes("BUFFER_API_KEY"));
console.log("Buffer social worker import and configuration guard verified.");
