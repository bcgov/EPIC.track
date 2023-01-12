"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mapper_base_1 = __importDefault(require("./mapper-base"));
class DefaultMapper extends mapper_base_1.default {
    map() {
        throw new Error("Method not implemented.");
    }
    getFormDetails() {
        throw new Error("Method not implemented.");
    }
}
exports.default = DefaultMapper;
