import _defaultsDeep from 'lodash/defaultsDeep';
import { createAuth } from './index';
import {
  AuthPro,
  AuthProConfig,
  AuthProCreator,
  AuthProValidMeta,
  _AuthSeedProState,
} from './proType';
import { AUTH_PRO_NAME, parseAuthString, stringifyAuthMap, authProValidatorGetter } from './common';
import langConfig from './langConfig';

const defaultConfig = ({
  auth: [],
  authNameMap: {},
  customAuthKeysMap: {},
} as unknown) as AuthProConfig;

const _createAuthPro: AuthProCreator = config => {
  const _config = {
    ...defaultConfig,
    ...config,
  };

  const _langConfig = _defaultsDeep(_config.languages, langConfig);

  const cLang = _langConfig[_config.lang || 'en-US'];

  const share = {
    cLang,
    config: _config,
  };

  const { seed } = _config;

  seed.setState({
    auth: _config.auth!,
    authDetailMap: parseAuthString(share, _config.auth!),
  });

  const authInstance = createAuth<_AuthSeedProState>({
    seed,
    validators: {
      [AUTH_PRO_NAME]: authProValidatorGetter(share),
    },
  });

  // auth变更时计算currentSchemaMap
  seed.subscribe(({ auth }) => {
    if (auth) {
      seed.getState().authDetailMap = parseAuthString(share, auth);
    }
  });

  const authPro: AuthPro = {
    setAuth: auth => {
      seed.setState({ auth });
    },
    getAuth: () => seed.getState().auth,
    getAuthDetail: () => seed.getState().authDetailMap,
    auth: keys => {
      const vm = authInstance([AUTH_PRO_NAME], {
        extra: keys,
      });
      return vm?.length ? ((vm[0] as any) as AuthProValidMeta[]) : null;
    },
    parse: keys => parseAuthString(share, keys),
    stringify: authMap => stringifyAuthMap(share, authMap),
    authInstance,
  };

  return authPro;
};

export { _createAuthPro };
