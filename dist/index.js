import * as pako from 'pako';
import Module from './wasm/liblpsolve55';
import wasmStr from './wasm/liblpsolve55.wasm.base64.js';
let module;
const loadModule = async () => {
    if (module === undefined) {
        console.log('Loading module');
        const wasmBinary = pako.inflate(Uint8Array.from(atob(wasmStr), c => c.charCodeAt(0))).buffer;
        module = await Module({ wasmBinary });
    }
};
const lp_solve_version = () => {
    const majorversion_buf = module._malloc(4);
    const minorversion_buf = module._malloc(4);
    const release_buf = module._malloc(4);
    const build_buf = module._malloc(4);
    module._lp_solve_version(majorversion_buf, minorversion_buf, release_buf, build_buf);
    const majorversion = module.HEAP32[majorversion_buf / 4];
    const minorversion = module.HEAP32[minorversion_buf / 4];
    const release = module.HEAP32[release_buf / 4];
    const build = module.HEAP32[build_buf / 4];
    module._free(majorversion_buf);
    module._free(minorversion_buf);
    module._free(release_buf);
    module._free(build_buf);
    return [majorversion, minorversion, release, build];
};
const ConstrTypeVal = { 'LE': 1, 'GE': 2, 'EQ': 3 };
class LpSolve {
    #lp_ptr;
    constructor(rows = 0, columns = 0) {
        this.#lp_ptr = module._make_lp(rows, columns);
    }
    delete() {
        module._delete_lp(this.#lp_ptr);
    }
    set_obj_fn(row) {
        const row_ptr = module._malloc(row.length * 8);
        module.HEAPF64.set(row, row_ptr / 8);
        const result = module._set_obj_fn(this.#lp_ptr, row_ptr);
        module._free(row_ptr);
        return result;
    }
    set_obj_fnex(row, colno) {
        const row_ptr = module._malloc(row.length * 8);
        for (let i = 0; i < row.length; i++) {
            module.HEAPF64[row_ptr / 8 + i] = row[i];
        }
        // module.HEAPF64.set(row, row_ptr/8);
        const colno_ptr = module._malloc(colno.length * 4);
        for (let i = 0; i < colno.length; i++) {
            module.HEAP32[colno_ptr / 4 + i] = colno[i];
        }
        // module.HEAP32.set(colno, colno_ptr/4);
        const result = module._set_obj_fnex(this.#lp_ptr, row.length, row_ptr, colno_ptr);
        module._free(row_ptr);
        module._free(colno_ptr);
        return result;
    }
    set_maxim() {
        module._set_maxim(this.#lp_ptr);
    }
    set_minim() {
        module._set_minim(this.#lp_ptr);
    }
    add_constraint(row, constr_type, rh) {
        const row_ptr = module._malloc(row.length * 8);
        module.HEAPF64.set(row, row_ptr / 8);
        const result = module._add_constraint(this.#lp_ptr, row_ptr, ConstrTypeVal[constr_type], rh);
        module._free(row_ptr);
        return result;
    }
    add_constraintex(row, colno, constr_type, rh) {
        const row_ptr = module._malloc(row.length * 8);
        module.HEAPF64.set(row, row_ptr / 8);
        const colno_ptr = module._malloc(colno.length * 4);
        module.HEAP32.set(colno, colno_ptr / 4);
        const result = module._add_constraintex(this.#lp_ptr, row.length, row_ptr, colno_ptr, ConstrTypeVal[constr_type], rh);
        module._free(row_ptr);
        module._free(colno_ptr);
        return result;
    }
    add_column(column) {
        const column_ptr = module._malloc(column.length * 8);
        module.HEAPF64.set(column, column_ptr / 8);
        const result = module._add_column(this.#lp_ptr, column_ptr);
        module._free(column_ptr);
        return result;
    }
    add_columnex(column, rowno) {
        const column_ptr = module._malloc(column.length * 8);
        module.HEAPF64.set(column, column_ptr / 8);
        const rowno_ptr = module._malloc(rowno.length * 4);
        module.HEAP32.set(rowno, rowno_ptr / 4);
        const result = module._add_columnex(this.#lp_ptr, column.length, column_ptr, rowno_ptr);
        module._free(column_ptr);
        module._free(rowno_ptr);
        return result;
    }
    set_int(col, must_be_int) {
        return module._set_int(this.#lp_ptr, col, must_be_int);
    }
    set_binary(col, must_be_bin) {
        return module._set_binary(this.#lp_ptr, col, must_be_bin);
    }
    set_timeout(timeout) {
        module._set_timeout(this.#lp_ptr, timeout);
    }
    set_rh(row, rh) {
        return module._set_rh(this.#lp_ptr, row, rh);
    }
    solve() {
        return module._solve(this.#lp_ptr);
    }
    get_objective() {
        return module._get_objective(this.#lp_ptr);
    }
    get_variables() {
        const result = [];
        const n = module._get_Ncolumns(this.#lp_ptr);
        const ptr = module._malloc(n * 8);
        const success = module._get_variables(this.#lp_ptr, ptr);
        if (!success) {
            module._free(ptr);
            return [];
        }
        for (let i = 0; i < n; i++) {
            result.push(module.HEAPF64[(ptr / 8) + i]);
        }
        module._free(ptr);
        return result;
    }
    del_constraint(del_row) {
        return module._del_constraint(this.#lp_ptr, del_row);
    }
    del_column(column) {
        return module._del_column(this.#lp_ptr, column);
    }
    print_lp() {
        module._print_lp(this.#lp_ptr);
    }
}
export { loadModule, lp_solve_version, LpSolve };
//# sourceMappingURL=index.js.map