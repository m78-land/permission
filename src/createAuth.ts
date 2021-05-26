import { Auth, AuthCreator } from './types';
import { authImpl } from './common';

const _createAuth: AuthCreator = conf => authImpl(conf) as Auth<{}, any>;

export { _createAuth };
