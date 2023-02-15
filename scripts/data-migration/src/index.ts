import * as dotenv from 'dotenv';
import DataLoader from './infrastructure/data-loader';
import MapperFactory from "./mappers/mapper-factory";

let cmdArgs = {
    type: '',
    file: '',
    env: ''
}
const args = process.argv;
if(args && args.length === 3 && args[2] === '--help') {
    console.log('More help is comming soon ...');
}
if(args && args.length > 2 ) {
    args.forEach((arg:string, index) => {
        if(index > 1 && arg.startsWith('--')) {
            const key = (arg.split('=')[0]).replace('--','');
            const value = arg.split('=')[1];
            if(Object.keys(cmdArgs).includes(key)) {
               cmdArgs = {...cmdArgs,[key]:value};
            }
        }
    })
}else {
    throw new Error('Arguments missing, please run ./bin/index.js --help')
}

if(cmdArgs.env !== '') {
    dotenv.config({path:`.env.${cmdArgs.env}`})
}
console.log(cmdArgs);

const mapper = MapperFactory.create(cmdArgs.type, cmdArgs.file, cmdArgs.env);
const dataLoader = new DataLoader(mapper);
dataLoader.load();


