import { __assign } from "tslib";
import create from '@m78/seed';
import { create as createPermission, } from './index';
import { PERMISSION_PRO_NAME, permissionProValidatorGetter } from './common';
var _createPermissionPro = function (config) {
    var _a;
    var _config = __assign({ permission: {} }, config);
    var seed = _config.seed;
    if (!seed)
        seed = create();
    seed.set({
        permission: _config.permission,
        meta: _config.meta,
    });
    var permission = createPermission({
        seed: seed,
        validators: (_a = {},
            _a[PERMISSION_PRO_NAME] = permissionProValidatorGetter(),
            _a),
    });
    var pro = {
        check: function (keys) {
            var vm = permission([PERMISSION_PRO_NAME], {
                extra: keys,
            });
            return (vm === null || vm === void 0 ? void 0 : vm.length) ? vm[0] : null;
        },
        seed: seed,
        permission: permission,
    };
    return pro;
};
export { _createPermissionPro };
