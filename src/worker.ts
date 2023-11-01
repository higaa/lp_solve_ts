import * as pako from 'pako';

import Module from './wasm/liblpsolve55';
import wasmStr from './wasm/liblpsolve55.wasm.base64.js';

import {Lp, Direction, ConstrType, VariableType} from './lpdef';

let module: any;

console.log('worker loaded');

self.onmessage = event => {
    
    const {type, data} = event.data;

    if (type === 'solve') {
        solve(data).then(result => {
            self.postMessage(result);
        });

    }
}

async function solve(lp: Lp): Promise<any> {
    console.log('Solving in worker');

    if (module === undefined) {
        console.log('Loading module');
        const wasmBinary = pako.inflate(Uint8Array.from(atob(wasmStr), c => c.charCodeAt(0))).buffer;

        module = await Module({wasmBinary});
    }
    console.log('Module loaded');

    const obj_col_names = lp.objective.cols.map(col => col.name);
    const constr_col_names = lp.constraints.map(constr => constr.cols.map(col => col.name)).flat();
    const names = [...new Set([...obj_col_names, ...constr_col_names])];
    const col_len = names.length + 1;
    const name_to_col = new Map<string, number>();
    names.forEach((name, i) => {
        name_to_col.set(name, i+1);
    });

    const lp2 = new LpSolve2(0, names.length);
    const obj_coefs = lp.objective.cols.map(col => col.coef);
    const obj_names = lp.objective.cols.map(col => col.name);
    const obj_colnos = obj_names.map(name => name_to_col.get(name) as number);
    lp2.set_obj_fnex(obj_coefs, obj_colnos);

    if (lp.objective.direction === 'max') {
        lp2.set_maxim();
    } else {
        lp2.set_minim();
    }

    for (const constr of lp.constraints) {
        const coefs = constr.cols.map(col => col.coef);
        const names = constr.cols.map(col => col.name);
        const colnos = names.map(name => name_to_col.get(name) as number);
        lp2.add_constraintex(coefs, colnos, constr.type, constr.rhs);
        console.log('constr', constr);
    }

    for (const variable of lp.variables) {
        const col = name_to_col.get(variable.name);
        if (col === undefined) {
            continue;
        }

        if (variable.type === 'integer') {
            lp2.set_int(col, true);
        } else if (variable.type === 'binary') {
            lp2.set_binary(col, true);
        }
    }
    lp2.print_lp();

    if (lp.options.timeout !== undefined) {
        lp2.set_timeout(lp.options.timeout);
    }

    const result = lp2.solve();

    const result_variables = new Map<string, number>();

    const vars = lp2.get_variables();
    for (let i = 0; i < vars.length; i++) {
        const name = names[i];
        const value = vars[i];
        result_variables.set(name, value);
    }


    lp2.delete();
    
    return {result: result, result_variables: result_variables};
}

const lp_solve_version = (): [number, number, number, number] => {

    const majorversion_buf = module._malloc(4);
    const minorversion_buf = module._malloc(4);
    const release_buf = module._malloc(4);
    const build_buf = module._malloc(4);

    module._lp_solve_version(majorversion_buf, minorversion_buf, release_buf, build_buf);

    const majorversion = module.HEAP32[majorversion_buf/4];
    const minorversion = module.HEAP32[minorversion_buf/4];
    const release = module.HEAP32[release_buf/4];
    const build = module.HEAP32[build_buf/4];

    module._free(majorversion_buf);
    module._free(minorversion_buf);
    module._free(release_buf);
    module._free(build_buf);

    return [majorversion, minorversion, release, build];
};

const ConstrTypeVal = {'LE': 1, 'GE': 2, 'EQ': 3};

class LpSolve2 {
    #lp_ptr: any;

    constructor(rows: number = 0, columns: number = 0) {
        this.#lp_ptr = module._make_lp(rows, columns);
    }
    delete(): void {
        module._delete_lp(this.#lp_ptr);
    }

    set_obj_fn(row: number[]): boolean {
        const row_ptr = module._malloc(row.length * 8);
        module.HEAPF64.set(row, row_ptr/8);
        const result = module._set_obj_fn(this.#lp_ptr, row_ptr);
        module._free(row_ptr);
        return result;
    }

    set_obj_fnex(row: number[], colno: number[]): boolean {
        console.log('set_obj_fnex');
        console.log('row', row);
        console.log('colno', colno);
        const row_ptr = module._malloc(row.length * 8);
        for (let i = 0; i < row.length; i++) {
            module.HEAPF64[row_ptr/8 + i] = row[i];
        }
        // module.HEAPF64.set(row, row_ptr/8);
        const colno_ptr = module._malloc(colno.length * 4);
        for (let i = 0; i < colno.length; i++) {
            module.HEAP32[colno_ptr/4 + i] = colno[i];
        }
        // module.HEAP32.set(colno, colno_ptr/4);
        const result = module._set_obj_fnex(this.#lp_ptr, row.length, row_ptr, colno_ptr);
        module._free(row_ptr);
        module._free(colno_ptr);
        return result;
    }

    set_maxim(): void {
        module._set_maxim(this.#lp_ptr);
    }

    set_minim(): void {
        module._set_minim(this.#lp_ptr);
    }

    add_constraint(row: number[], constr_type: ConstrType, rh: number): boolean {
        const row_ptr = module._malloc(row.length * 8);
        module.HEAPF64.set(row, row_ptr/8);
        const result = module._add_constraint(this.#lp_ptr, row_ptr, ConstrTypeVal[constr_type], rh);
        module._free(row_ptr);
        return result;
    }

    add_constraintex(row: number[], colno: number[], constr_type: ConstrType, rh: number): boolean {
        const row_ptr = module._malloc(row.length * 8);
        module.HEAPF64.set(row, row_ptr/8);
        const colno_ptr = module._malloc(colno.length * 4);
        module.HEAP32.set(colno, colno_ptr/4);
        const result = module._add_constraintex(this.#lp_ptr, row.length, row_ptr, colno_ptr, ConstrTypeVal[constr_type], rh);
        module._free(row_ptr);
        module._free(colno_ptr);
        return result;
    }

    set_int(col: number, must_be_int: boolean): boolean {
        return module._set_int(this.#lp_ptr, col, must_be_int);
    }

    set_binary(col: number, must_be_bin: boolean): boolean {
        return module._set_binary(this.#lp_ptr, col, must_be_bin);
    }

    set_timeout(timeout: number): void {
        module._set_timeout(this.#lp_ptr, timeout);
    }
    
    solve(): number {
        return module._solve(this.#lp_ptr);
    }

    get_objective(): number {
        return module._get_objective(this.#lp_ptr);
    }

    get_variables(): number[] {
        const result: number[] = [];
        const n = module._get_Ncolumns(this.#lp_ptr);
        const ptr = module._malloc(n * 8);
        const success = module._get_variables(this.#lp_ptr, ptr);
        if (!success) {
            module._free(ptr);
            return [];
        }

        for (let i = 0; i < n; i++) {
            result.push(module.HEAPF64[(ptr/8)+i]);
        }
        module._free(ptr);
        return result;
    }



    
    print_lp(): void {
        module._print_lp(this.#lp_ptr);
    }
}
