import { isArray } from '@lxjx/utils';
import _defaultsDeep from 'lodash/defaultsDeep';
import { authCreate } from './index';
import {
  AuthPro,
  AuthProConfig,
  AuthProCreator,
  AuthProStrings,
  AuthProValidMeta,
  _AuthSeedProState,
} from './proType';
import { AUTH_PRO_NAME, getAuthNameInfoMap, parseAuthString, stringifyAuthMap } from './common';
import langConfig from './langConfig';

const defaultConfig: AuthProConfig = {
  auth: [],
  authNameMap: {},
  customAuthKeysMap: {},
};

const _authSeedProCreate: AuthProCreator = config => {
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

  const authSeed = authCreate<_AuthSeedProState>({
    state: {
      auth: _config.auth!,
      authDetailMap: parseAuthString(share, _config.auth!),
    },
    validators: {
      [AUTH_PRO_NAME]: ({ authDetailMap }, keys?: AuthProStrings) => {
        const { authNameMap } = _config;

        if (!authDetailMap) return;

        // 没有传入要验证的权限
        if (!isArray(keys) || !keys.length) return;

        const beTestAuthMap = parseAuthString(share, keys);

        if (!beTestAuthMap) return;

        let rejects: any = null;

        const infosMap = getAuthNameInfoMap(share);

        for (const [authName, beTestAuth] of Object.entries(beTestAuthMap)) {
          const userAuth = authDetailMap[authName];

          const _keys = Object.keys(beTestAuth);

          // 取出不满足的权限
          const rejectKeys = _keys.filter(k => !(beTestAuth[k] && userAuth && userAuth[k]));

          if (rejectKeys.length) {
            // 根据key获取其文本
            const labelKeys = rejectKeys.map(item =>
              infosMap[item] ? infosMap[item].label : item,
            );

            if (!rejects) rejects = [];

            rejects.push({
              missing: labelKeys,
              originalName: authName,
              name: authNameMap?.[authName] || authName,
            });
          }
        }

        if (rejects) return rejects;
      },
    },
  });

  // auth变更时计算currentSchemaMap
  authSeed.subscribe(({ auth }) => {
    if (auth) {
      authSeed.getState().authDetailMap = parseAuthString(share, auth);
    }
  });

  const authPro: AuthPro = {
    setAuth: auth => {
      authSeed.setState({ auth });
    },
    getAuth: () => authSeed.getState().auth,
    getAuthDetail: () => authSeed.getState().authDetailMap,
    auth: keys => {
      const vm = authSeed.auth([AUTH_PRO_NAME], {
        extra: keys,
      });
      return vm?.length ? ((vm[0] as any) as AuthProValidMeta[]) : null;
    },
    parse: keys => parseAuthString(share, keys),
    stringify: authMap => stringifyAuthMap(share, authMap),
  };

  return authPro;
};

export { _authSeedProCreate };
