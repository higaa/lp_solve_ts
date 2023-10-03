declare const loadModule: () => Promise<void>;
declare const lp_solve_version: () => [number, number, number, number];
type ConstrType = 'LE' | 'GE' | 'EQ';
declare class LpSolve {
    #private;
    constructor(rows?: number, columns?: number);
    delete(): void;
    set_obj_fn(row: number[]): boolean;
    add_constraint(row: number[], constr_type: ConstrType, rh: number): boolean;
    add_constraintex(row: number[], colno: number[], constr_type: ConstrType, rh: number): boolean;
    solve(): number;
    get_objective(): number;
    get_variables(): number[];
    print_lp(): void;
}
export { loadModule, lp_solve_version, ConstrType, LpSolve };
