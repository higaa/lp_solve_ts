type Direction = 'max' | 'min';
type ConstrType = 'LE' | 'GE' | 'EQ';
type VariableType = 'continuous' | 'integer' | 'binary';

interface Lp {
    options: {
        timeout: number  
    },
    objective: {
        cols: Array<{name: string, coef: number}>,
        direction: Direction
    },
    constraints: Array<{
        name: string,
        cols: Array<{name: string, coef: number}>,
        type: ConstrType
        rhs: number
    }>,
    variables: Array<{
        name: string,
        type: VariableType
    }>
}

export {Lp, Direction, ConstrType, VariableType};