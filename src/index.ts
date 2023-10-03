import Module from './lp_solve/liblpsolve55';

let module: any;

const loadModule = async () => {

    if (module === undefined) {
        module = await Module();
    }
};


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

type ConstrType = 'LE' | 'GE' | 'EQ';
const ConstrTypeVal = {'LE': 1, 'GE': 2, 'EQ': 3};


class LpSolve {
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




export {loadModule, lp_solve_version, ConstrType, LpSolve};