declare const loadModule: () => Promise<void>;
declare const lp_solve_version: () => [number, number, number, number];
type Direction = 'max' | 'min';
type ConstrType = 'LE' | 'GE' | 'EQ';
type VariableType = 'continuous' | 'integer' | 'binary';
declare class LpSolve {
    #private;
    constructor(rows?: number, columns?: number);
    delete(): void;
    set_obj_fn(row: number[]): boolean;
    set_obj_fnex(row: number[], colno: number[]): boolean;
    set_maxim(): void;
    set_minim(): void;
    add_constraint(row: number[], constr_type: ConstrType, rh: number): boolean;
    add_constraintex(row: number[], colno: number[], constr_type: ConstrType, rh: number): boolean;
    add_column(column: number[]): boolean;
    add_columnex(column: number[], rowno: number[]): boolean;
    set_int(col: number, must_be_int: boolean): boolean;
    set_binary(col: number, must_be_bin: boolean): boolean;
    set_timeout(timeout: number): void;
    set_rh(row: number, rh: number): boolean;
    solve(): number;
    get_objective(): number;
    get_variables(): number[];
    del_constraint(del_row: number): boolean;
    del_column(column: number): boolean;
    print_lp(): void;
}
export { loadModule, lp_solve_version, LpSolve, Direction, ConstrType, VariableType };
