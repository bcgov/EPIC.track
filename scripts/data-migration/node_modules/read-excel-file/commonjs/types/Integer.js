"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = Integer;
exports.isInteger = isInteger;

function Integer() {}

function isInteger(x) {
  // https://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript
  return (x | 0) === x;
}
//# sourceMappingURL=Integer.js.map