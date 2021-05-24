import langConfig from './langConfig';

/** 在不同函数见共享的数据 */
export interface _AuthProShare {
  /** 创建配置 */
  config: AuthProConfig;
  /** 当前的语言配置对象 */
  cLang: typeof langConfig['en-US'];
}

/**
 * 包含格式如 `name:keys` 的权限数组
 * name 表示能代表某个权限的唯一名称
 * keys 为`crud`类似的字符，表示对此功能的 增加(Create)、检索(Retrieve)、更新(Update)和删除(Delete)权限，keys中也可能包含用户自定义的key
 *
 * 对于功能较为复杂的项目, 建议通过`.`按模块来分割name，如 `main.client.news:crud`
 * */
export type AuthProStrings = string[];

export interface AuthProValidMeta {
  /** 原始权限名 */
  originalName: string;
  /** 权限名经过authNameMap提取后的字符, 未设置authNameMap时与originalName相同 */
  name: string;
  /** 缺少的权限 */
  missing: string[];
}

/** 描述key和其详细信息的对象 */
export interface AuthProKeysMap {
  /** key的简写名称, 如c/r/u/d */
  [key: string]: {
    /** 表示该简写的完整名称, 如 c 的完整 name 为 create */
    name: string;
    /** 标题 */
    label: string;
    /** 详细描述 */
    desc?: string;
  };
}

/** 基本与AuthProKeysMap相同，不过它完整的name作为key */
export interface _AuthProFullKeysMap {
  /** key为此权限的网站名称 */
  [key: string]: {
    /** key的完整名称, 如 c 的完整 name 为 create */
    name: string;
    /** key简短名称 */
    shortName: string;
    /** 标题 */
    label: string;
    /** 详细描述 */
    desc?: string;
  };
}

/** 表示一个string到另一个string的映射 */
export interface AuthProString2StringMap {
  [key: string]: string;
}

/**
 * 由权限描述字符转换得到的详情对象, 用户自定义了key时可以扩展此类型
 * */
export interface AuthProDetail {
  create?: boolean;
  retrieve?: boolean;
  update?: boolean;
  delete?: boolean;
  [key: string]: boolean | undefined;
}

/** 一组AuthProDetail */
export interface AuthProDetailMap {
  [key: string]: AuthProDetail;
}

/** 权限状态 */
export interface _AuthSeedProState {
  /** 用户当前的权限 */
  auth: AuthProStrings;
  /** 根据当前auth转换得到的AuthSchemaMap, 此属性变更不触发subscribe订阅的函数 */
  authDetailMap: AuthProDetailMap | null;
}

/**
 * authPro的创建配置
 * */
export interface AuthProConfig {
  /** 初始权限 */
  auth?: AuthProStrings;
  /**
   * 添加除`c r u d`以外的自定义权限key
   * - 设置了 c r u d 中的任意key时，会将覆盖掉内部的默认配置
   * */
  customAuthKeysMap?: AuthProKeysMap;
  /** 为权限限名添加更符合语义的文本映射, 比如为 user:crud 中的 user 添加映射 { user: '用户' } */
  authNameMap?: AuthProString2StringMap;
  /** 'en-US' | 设置显示的语言 */
  lang?: 'en-US' | 'zh-CN';
  /** 扩展语言包或覆盖现有语言包 */
  languages?: any;
}

/** AuthPro对象 */
export interface AuthPro {
  /** 设置当前权限 */
  setAuth: (auth: AuthProStrings) => void;
  /** 获取当前权限 */
  getAuth: () => AuthProStrings;
  /** 获取权限的详细对象 */
  getAuthDetail: () => AuthProDetailMap | null;
  /** 传入权限字符数组进行验证 */
  auth: (keys: AuthProStrings) => AuthProValidMeta[] | null;
  /** 根据当前实例的配置解析一个AuthProStrings并返回解析对象 */
  parse: (keys: AuthProStrings) => AuthProDetailMap | null;
  /** 字符串化AuthProDetailMap并返回每个权限的AuthProStrings组成的数组 */
  stringify: (authMap: AuthProDetailMap) => AuthProStrings;
}

/**
 * 实例创建器
 * */
export interface AuthProCreator {
  (config?: AuthProConfig): AuthPro;
}
