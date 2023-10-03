"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _LpSolve_lp_ptr;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LpSolve = exports.lp_solve_version = exports.loadModule = void 0;
const liblpsolve55_1 = require("./lp_solve/liblpsolve55");
let module;
const loadModule = () => __awaiter(void 0, void 0, void 0, function* () {
    if (module === undefined) {
        module = yield (0, liblpsolve55_1.default)();
    }
});
exports.loadModule = loadModule;
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
exports.lp_solve_version = lp_solve_version;
const ConstrTypeVal = { 'LE': 1, 'GE': 2, 'EQ': 3 };
class LpSolve {
    constructor(rows = 0, columns = 0) {
        _LpSolve_lp_ptr.set(this, void 0);
        __classPrivateFieldSet(this, _LpSolve_lp_ptr, module._make_lp(rows, columns), "f");
    }
    delete() {
        module._delete_lp(__classPrivateFieldGet(this, _LpSolve_lp_ptr, "f"));
    }
    set_obj_fn(row) {
        const row_ptr = module._malloc(row.length * 8);
        module.HEAPF64.set(row, row_ptr / 8);
        const result = module._set_obj_fn(__classPrivateFieldGet(this, _LpSolve_lp_ptr, "f"), row_ptr);
        module._free(row_ptr);
        return result;
    }
    add_constraint(row, constr_type, rh) {
        const row_ptr = module._malloc(row.length * 8);
        module.HEAPF64.set(row, row_ptr / 8);
        const result = module._add_constraint(__classPrivateFieldGet(this, _LpSolve_lp_ptr, "f"), row_ptr, ConstrTypeVal[constr_type], rh);
        module._free(row_ptr);
        return result;
    }
    add_constraintex(row, colno, constr_type, rh) {
        const row_ptr = module._malloc(row.length * 8);
        module.HEAPF64.set(row, row_ptr / 8);
        const colno_ptr = module._malloc(colno.length * 4);
        module.HEAP32.set(colno, colno_ptr / 4);
        const result = module._add_constraintex(__classPrivateFieldGet(this, _LpSolve_lp_ptr, "f"), row.length, row_ptr, colno_ptr, ConstrTypeVal[constr_type], rh);
        module._free(row_ptr);
        module._free(colno_ptr);
        return result;
    }
    solve() {
        return module._solve(__classPrivateFieldGet(this, _LpSolve_lp_ptr, "f"));
    }
    get_objective() {
        return module._get_objective(__classPrivateFieldGet(this, _LpSolve_lp_ptr, "f"));
    }
    get_variables() {
        const result = [];
        const n = module._get_Ncolumns(__classPrivateFieldGet(this, _LpSolve_lp_ptr, "f"));
        const ptr = module._malloc(n * 8);
        const success = module._get_variables(__classPrivateFieldGet(this, _LpSolve_lp_ptr, "f"), ptr);
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
    print_lp() {
        module._print_lp(__classPrivateFieldGet(this, _LpSolve_lp_ptr, "f"));
    }
}
exports.LpSolve = LpSolve;
_LpSolve_lp_ptr = new WeakMap();
//# sourceMappingURL=index.js.map