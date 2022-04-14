import { Permission, PermissionCreator } from './types';
import { permissionImpl } from './common';

const _createPermission: PermissionCreator = conf => permissionImpl(conf) as Permission<{}, any>;

export { _createPermission };
