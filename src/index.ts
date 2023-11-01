import * as pako from 'pako';

import {Lp, Direction, ConstrType, VariableType} from './lpdef';

console.log('Loading worker');


const worker = new Worker(new URL('worker.js', import.meta.url));

console.log('worker', worker);


function solve(lp: Lp): Promise<any> {
    console.log('Solving');

    return new Promise((resolve, reject) => {
        worker.onmessage = (event) => {
            resolve(event.data);
        };
        worker.onerror = (event) => {
            reject(event);
        };
        worker.postMessage({type: 'solve', data: lp});
    });
}


// const example = {
//     objective: {
//         cols: [
//             {name: 'x1', coef: 2},
//             {name: 'x2', coef: 3},
//             {name: 'y', coef: 5}
//         ],
//         direction: 'max'
//     },
//     constraints: [
//         {
//             name: 'c1',
//             cols: [
//                 {name: 'x1', coef: 1},
//                 {name: 'x2', coef: 1},
//                 {name: 'y', coef: 0}
//             ],
//             type: 'LE',
//             rhs: 3
//         },
//         {
//             name: 'c2',
//             cols: [
//                 {name: 'x1', coef: 1},
//                 {name: 'x2', coef: 0},
//                 {name: 'y', coef: 1}
//             ],
//             type: 'GE',
//             rhs: 0
//         },
//         {
//             name: 'c3',
//             cols: [
//                 {name: 'x1', coef: 0},
//                 {name: 'x2', coef: 1},
//                 {name: 'y', coef: 1}
//             ],
//             type: 'EQ',
//             rhs: 0
//         }
//     ],
//     variables: [
//         {name: 'x1', type: 'continuous'},
//         {name: 'x2', type: 'integer'},
//         {name: 'y', type: 'binary'}
//     ],
//     options: {
//         timeout: 10,
//     }
// };


export {Lp, ConstrType, Direction, VariableType, solve};