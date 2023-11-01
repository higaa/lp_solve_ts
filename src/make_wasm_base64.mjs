import fs from 'fs';
import pako from 'pako';

const wasm_path = './wasm/liblpsolve55.wasm';
const wasm_base64_path = './wasm/liblpsolve55.wasm.base64.js';

const wasm_base64 = Buffer.from(pako.deflate(fs.readFileSync(wasm_path))).toString('base64');
fs.writeFileSync(wasm_base64_path, `export default "${wasm_base64}"`);