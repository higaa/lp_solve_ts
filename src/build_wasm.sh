cd `dirname $0`

BASE_DIR=lp_solve
OUT_DIR=wasm

src="${BASE_DIR}/lp_MDO.c ${BASE_DIR}/shared/commonlib.c ${BASE_DIR}/shared/mmio.c ${BASE_DIR}/shared/myblas.c ${BASE_DIR}/ini.c ${BASE_DIR}/fortify.c ${BASE_DIR}/colamd/colamd.c ${BASE_DIR}/lp_rlp.c ${BASE_DIR}/lp_crash.c ${BASE_DIR}/bfp/bfp_LUSOL/lp_LUSOL.c ${BASE_DIR}/bfp/bfp_LUSOL/LUSOL/lusol.c ${BASE_DIR}/lp_Hash.c ${BASE_DIR}/lp_lib.c ${BASE_DIR}/lp_wlp.c ${BASE_DIR}/lp_matrix.c ${BASE_DIR}/lp_mipbb.c ${BASE_DIR}/lp_MPS.c ${BASE_DIR}/lp_params.c ${BASE_DIR}/lp_presolve.c ${BASE_DIR}/lp_price.c ${BASE_DIR}/lp_pricePSE.c ${BASE_DIR}/lp_report.c ${BASE_DIR}/lp_scale.c ${BASE_DIR}/lp_simplex.c ${BASE_DIR}/lp_SOS.c ${BASE_DIR}/lp_utils.c ${BASE_DIR}/yacc_read.c"

EXPORTS=_lp_solve_version,_malloc,_free,_make_lp,_delete_lp,_print_lp,_add_constraint,_add_constraintex,_add_column,_add_columnex,_set_obj_fn,_set_obj_fnex,_set_maxim,_set_minim,_set_int,_set_binary,_solve,_print_objective,_print_solution,_print_constraints,_print_duals,_get_objective,_get_variables,_get_Ncolumns,_set_timeout,_del_constraint,_del_column,_set_rh

mkdir -p ${OUT_DIR}

emcc --no-entry -o ${OUT_DIR}/liblpsolve55.js -I${BASE_DIR} -I${BASE_DIR}/shared -I${BASE_DIR}/bfp -I${BASE_DIR}/bfp/bfp_LUSOL -I${BASE_DIR}/bfp/bfp_LUSOL/LUSOL -I${BASE_DIR}/colamd -O0 -DINTEGERTIME -DYY_NEVER_INTERACTIVE -DPARSER_LP -DINVERSE_ACTIVE=INVERSE_LUSOL -DRoleIsExternalInvEngine $src -s ALLOW_MEMORY_GROWTH=1 -s USE_ES6_IMPORT_META=0 -s EXPORT_ES6=1 -s USE_ES6_IMPORT_META=1 -s ASSERTIONS=0 -s MODULARIZE=1 -s WASM_ASYNC_COMPILATION=0 -s ENVIRONMENT=worker -s "EXPORTED_RUNTIME_METHODS=['cwrap']" -s "EXPORTED_FUNCTIONS=${EXPORTS}"

node --experimental-modules make_wasm_base64.mjs

cp liblpsolve55.d.ts liblpsolve55.wasm.base64.d.ts ${OUT_DIR}/
