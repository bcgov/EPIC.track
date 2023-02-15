"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const data_loader_1 = __importDefault(require("./infrastructure/data-loader"));
const mapper_factory_1 = __importDefault(require("./mappers/mapper-factory"));
let cmdArgs = {
    type: '',
    file: '',
    env: ''
};
const args = process.argv;
if (args && args.length === 3 && args[2] === '--help') {
    console.log('More help is comming soon ...');
}
if (args && args.length > 2) {
    args.forEach((arg, index) => {
        if (index > 1 && arg.startsWith('--')) {
            const key = (arg.split('=')[0]).replace('--', '');
            const value = arg.split('=')[1];
            if (Object.keys(cmdArgs).includes(key)) {
                cmdArgs = Object.assign(Object.assign({}, cmdArgs), { [key]: value });
            }
        }
    });
}
else {
    throw new Error('Arguments missing, please run ./bin/index.js --help');
}
if (cmdArgs.env !== '') {
    dotenv.config({ path: `.env.${cmdArgs.env}` });
}
console.log(cmdArgs);
const mapper = mapper_factory_1.default.create(cmdArgs.type, cmdArgs.file, cmdArgs.env);
const dataLoader = new data_loader_1.default(mapper);
dataLoader.load();
