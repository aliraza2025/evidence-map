import {python} from './python.mjs';
export async function runExtension(path,payload){if(path!=='/api/retrieve')throw new Error('Unknown integration.');return python('scripts/retrieve.py',payload);}
