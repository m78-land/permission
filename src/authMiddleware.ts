import { Middleware } from '@m78/seed';
import { authImpl } from './common';

const _authMiddleware: Middleware = bonus => {
  if (bonus.init) {
    bonus.ctx.createConf = bonus.config;
    return bonus.config;
  }

  (bonus.apis as any).auth = authImpl(bonus.apis, bonus.ctx.createConf);
};

export { _authMiddleware };
