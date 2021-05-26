import { isArray } from '@lxjx/utils';
import {
  AuthConfig,
  AuthKeys,
  Auth,
  CreateAuthConfig,
  Validators,
  ValidMeta,
  Validator,
} from './types';
import {
  _AuthProShare,
  AuthProDetailMap,
  _AuthProFullKeysMap,
  AuthProKeysMap,
  AuthProStrings,
  _AuthSeedProState,
} from './proType';

export const throwWarning = (str: string) => {
  console.warn(`Auth 👻: ${str}`);
};

/**
 * 传入验证key、验证器列表、依赖数据、额外数据。对该key进行验证后返回验证结果(void 或 ValidMeta)
 * */
export const validItem = (key: string, validators: Validators<any>, state: any, extra: any) => {
  const validator = validators[key];
  // 不存在此验证器
  if (!validator) return;

  return validator(state, extra);
};

/**
 * 实现auth() api
 * */
export function authImpl(conf: CreateAuthConfig): Auth {
  return (authKeys: AuthKeys<any>, config?: AuthConfig) => {
    const { validators, validFirst, seed } = conf;
    const state = seed.getState();
    const { extra, validators: localValidators }: AuthConfig = config || {};

    /** 所有验证失败结果 */
    const rejects: ValidMeta[] = [];
    /** 是否通过 */
    let pass = true;

    /**
     * 传入单个权限key或key数组进行验证, 并将验证结果写入pass和rejects
     * 单个验证时: 验证该项并返回验证meta信息，验证正确时无返回
     * key数组时: 作为条件`or`进行验证，只要其中任意一项通过了验证则通过验证
     * */
    const test = (key: any, isOr?: boolean) => {
      if (isArray(key)) {
        const tempRejects: ValidMeta[] = [];
        let flag = false;

        for (const authItem of key) {
          const meta = test(authItem, true);

          if (meta) {
            tempRejects.push(meta);
          }

          // 成功任意一项即视为成功
          if (!meta) {
            flag = true;
            break;
          }
        }

        if (!flag) {
          pass = false;
          validFirst ? rejects.push(tempRejects[0]) : rejects.push(...tempRejects);
        }
      } else {
        const meta = validItem(key, { ...validators, ...localValidators }, state, extra);

        if (!meta) return;

        // 非or时直接判定为失败
        if (!isOr) {
          pass = false;
          rejects.push(meta);
        }

        return meta;
      }
    };

    if (validFirst) {
      for (const authItem of authKeys) {
        if (pass) {
          test(authItem);
        }
      }
    } else {
      authKeys.forEach(ak => test(ak));
    }

    return rejects.length ? rejects : null;
  };
}

/**
 * ###############################################
 *                      Pro
 * ###############################################
 * */

/** admin权限实现的主验证器key */
export const AUTH_PRO_NAME = 'AUTH_PRO';

/** 获取所有(包含用户自定义)可用key组成的AuthKeyMap */
export function getAuthKeyMap({ config, cLang }: _AuthProShare): AuthProKeysMap {
  const { customAuthKeysMap } = config;

  /** 内置的所有权限key的完整名称映射 */
  const builtInAuthKeysMap: AuthProKeysMap = {
    c: {
      name: 'create',
      label: cLang.createKey,
    },
    r: {
      name: 'retrieve',
      label: cLang.retrieveKey,
    },
    u: {
      name: 'update',
      label: cLang.updateKey,
    },
    d: {
      name: 'delete',
      label: cLang.deleteKey,
    },
  };

  return {
    ...builtInAuthKeysMap,
    ...customAuthKeysMap,
  };
}

/** 从getAuthKeyMap()的返回中获取以完整name为key的AuthKeysMap */
export function getAuthNameInfoMap(share: _AuthProShare): _AuthProFullKeysMap {
  const keyMap = getAuthKeyMap(share);

  const obj: _AuthProFullKeysMap = {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Object.entries(keyMap).forEach(([k, infos]) => {
    obj[infos.name] = { ...infos, shortName: k };
  });

  return obj;
}

/**
 * 解析AuthStrings字符数组, 无效有效权限时返回null, 解析后的格式为:
 * ['user:crud', 'setting:c']
 *      =>
 * {
 *   user: {
 *     create: true,
 *     retrieve: true,
 *     update: true,
 *     delete: true,
 *   },
 *   setting: {
 *     create: true,
 *   }
 * }
 *
 * - 未知的权限key会被忽略
 * */
export function parseAuthString(share: _AuthProShare, strArr: AuthProStrings) {
  if (!isArray(strArr) || !strArr.length) return null;

  // 过滤无效权限
  const f = strArr.map(key => key.split(':')).filter(([k, a]) => k && k.length && a && a.length);

  if (!f.length) return null;

  const map: AuthProDetailMap = {};

  const authKeyMap = getAuthKeyMap(share);

  const unknownKeys: string[] = [];

  f.forEach(([k, a]) => {
    const auths = a.split('');

    let cAuth: any;

    auths.forEach(authKey => {
      const current = authKeyMap[authKey];
      if (current) {
        if (!cAuth) cAuth = {};
        cAuth[current.name] = true;
      } else {
        unknownKeys.push(authKey);
      }
    });

    if (cAuth) {
      map[k] = cAuth;
    }
  });

  if (unknownKeys.length) {
    throwWarning(`Unknown keys "${unknownKeys.join(', ')}". will be ignore`);
  }

  return map;
}

/**
 * 将AuthProDetailMap串化为AuthProStrings[]
 * */
export function stringifyAuthMap(share: _AuthProShare, authMap: AuthProDetailMap) {
  const authNameInfoMap = getAuthNameInfoMap(share);

  const authKeys: AuthProStrings = [];

  Object.entries(authMap).forEach(([key, auth]) => {
    const keyS = Object.entries(auth)
      .map(([_key]) => authNameInfoMap[_key])
      .filter(item => !!item)
      .map(item => item.shortName);
    authKeys.push(`${key}:${keyS.join('')}`);
  });

  return authKeys;
}

/**
 * authPro内置验证器
 * */
export const authProValidatorGetter = (share: _AuthProShare) => {
  const validator: Validator<_AuthSeedProState> = ({ authDetailMap }, keys?: AuthProStrings) => {
    const { authNameMap } = share.config;

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
        const labelKeys = rejectKeys.map(item => (infosMap[item] ? infosMap[item].label : item));

        if (!rejects) rejects = [];

        rejects.push({
          missing: labelKeys,
          originalName: authName,
          name: authNameMap?.[authName] || authName,
        });
      }
    }

    if (rejects) return rejects;
  };

  return validator;
};
