import { _PermissionProSeedState, PermissionProMeta, create as createPermission } from './index';
import { PermissionPro, PermissionProCreator } from './proType';
import { PERMISSION_PRO_NAME, permissionProValidatorGetter } from './common';
import create from '@m78/seed';

const _createPermissionPro: PermissionProCreator = config => {
  const _config = {
    permission: {},
    ...config,
  };

  let { seed } = _config;

  if (!seed) seed = create();

  seed.set({
    permission: _config.permission!,
    meta: _config.meta,
  });

  const permission = createPermission<_PermissionProSeedState>({
    seed,
    validators: {
      [PERMISSION_PRO_NAME]: permissionProValidatorGetter(),
    },
  });

  const pro: PermissionPro = {
    check: keys => {
      const vm = permission([PERMISSION_PRO_NAME], {
        extra: keys,
      });
      return vm?.length ? ((vm[0] as any) as PermissionProMeta[]) : null;
    },
    seed,
  };

  return pro;
};

export { _createPermissionPro };
