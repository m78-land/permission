import create from '@m78/seed';
import { AuthSeed, AuthSeedCreator } from './types';
import { _authMiddleware } from './authMiddleware';

const _authSeedCreate: AuthSeedCreator = conf => {
  const middleware = [_authMiddleware];

  if (conf.middleware?.length) {
    middleware.push(...middleware);
  }

  return create({
    ...conf,
    middleware,
  }) as AuthSeed<any>;
};

export { _authSeedCreate };
