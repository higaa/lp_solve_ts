import { Lp, Direction, ConstrType, VariableType } from './lpdef';
declare function solve(lp: Lp): Promise<any>;
export { Lp, ConstrType, Direction, VariableType, solve };
