<h1 align="center" style="color: #61dafb;">Auth</h1>
<h1 align="center" style="font-size: 80px;color:#61dafb">🥜</h1>

<br>

<p align="center">又一个用户端权限库</p>

<br>

<p align="center">
    <a href="./readme.md">en</a> | 
    <span>中文</span>
</p>


<br>

## 安装

```shell
yarn add @m78/auth
```

<br>



## 介绍

此库包含两种权限实现:

1. 常规版本，验证通过本地验证器和当前状态来实现, 非常适合只包含少量验证的前台项目。
2. `Pro` 版本，通过进一步的封装简化了api的整体使用，适合包含大量复杂权限逻辑的中后台项目，并且可以非常简单的和任意后端体系集成。

<br>

* 此库底层采用了[@m78/seed](https://github.com/m78-core/seed)来管理状态, `seed`是一个非常简单易学的状态管理方案，使用前建议先了解下它的用法。
* 它被设计得足够通用，可以在任意js运行时使用，包括但不限于`nodejs` `ReactNative` `小程序 `等。
* 如果你在前端框架中使用，可能会需要对其进行简单的封装, 若使用react，可以使用官方实现  [`m78/asee`](http://llixianjie.gitee.io/m78/docs/utils/seed) , 其他框架可以参考其实现来编写。

<br>



## Auth

这是包含`Auth` 所有 `api` 的伪代码示例：

```ts
import { authCreate } from '@m78/auth';

/** authCreate()用于创建一个Auth实例, 你可以创建任意多个不同配置的Auth实例 */
const auth = authCreate({
    /** 待注册的中间件, 详细信息请参见https://github.com/m78-core/seed */
    middleware: [],
    /** 初始状态 */
    state: {
        name: 'lxj',
        roleType: 1,
        age: 17,
    },
    /**
      * 如果一个验证未通过，则阻止后续验证
      * - 对于or中的子权限，即使开启了validFirst，依然会对每一项进行验证，但是只会返回第一个
      * - 在执行auth()时将优先级更高的权限key放到前面有助于提高验证反馈的精度, 如 login > publisher, 因为publisher状态是以login为前提的
      **/
    validFirst: true,
    /** 验证器 */
    validators: {
        isAdmin(state) {
            if (state.roleType !== 1) {
                // 验证未通过时返回的详细信息
                return {
                    label: '403',
                    desc: '你不是管理员',
                    actions: [
                        {
                            label: '切换账号',
                            handle() {...},
                        },
                        {
                            label: '放弃操作',
                        },
                    ],
                };
            }
        },
        is18plus(state, extra) {
            if (state.age < 18) {
                return {
                    label: '403',
                    desc: '未满18岁',
                    actions: [
                        {
                            label: '切换账号',
                        },
                    ],
                };
            }
        },
    }
});

// ###########################
// 状态管理部分, 这些api继承自seed
// ###########################

// 更新state的值，只更新传入对象中包含的键
auth.setState({ name: 'lj', });

// 更新state的值，替换整个state对象
auth.coverSetState({ name: 'lj', });

// 获取当前state
auth.getState();

// 订阅state变更
const unsub = subscribe((changes) => {
    // ... 
});

// 取消订阅
unsub();

// ###########################
// 			 权限部分
// ###########################

// 权限验证, 验证被拒绝时，会将所有未验证通过的验证器返回作为详细信息返回, 成功则返回null
auth.auth(['isAdmin', 'is18plus']);

// 验证失败的返回是这样子的
[
    {
        /** 该权限名称 */
        label: string;
        /** 该权限的文字描述 */
        desc?: string;
        /** 验证失败时提供给用户的一组操作 */
        actions?: [
			{
                  /** 操作名称 */
                  label: string;
                  /**
                   * 可以扩展异常处理方法(handler)，渲染类型(link)等，帮助控制具体的显示
                   * */
                  [key: string]: any;
            }
        ];
	}
]

// 当权限项是一个数组时，表示条件`or`， 表示其中任意一个权限通过即可
auth.auth(['isAdmin', ['is18plus', 'someVa..']]);

// 传入配置
auth.auth(['isAdmin'], {
  /** 传递给验证器的额外参数 */
  extra?: any;
  /** 局部验证器 */
  validators?: Validators<S>;
});
```



## AuthPro

这是包含`AuthPro`所有 `api` 的伪代码示例：

```ts
import { authProCreate } from '@m78/auth';

/**
 * 权限使用包含格式如 `name:keys` 的数组表示
 * name 表示能代表某个权限的唯一名称
 * keys 为`crud`类似的字符，表示对此功能的 增加(Create)、检索(Retrieve)、更新(Update)和删除(Delete)权限，keys中也可能包含用户自定义的key
 *
 * 对于功能较为复杂的项目, 建议通过`.`按模块来分割name，如 `main.client.news:crud`
 * */
const authStrings = ['user:cud', 'news:cr'];


/** 创建一个authPro */
const authPro = authProCreate({
  /** 初始权限 */
  auth?: authStrings;
  /**
   * 添加除`c r u d`以外的自定义权限key
   * - 设置了 c r u d 中的任意key时，会将覆盖掉内部的默认配置
   * */
  customAuthKeysMap?: {
     p: {
        label: '发布',
        name: 'publisher',
     },
     a: {         
       	label: '审批',
        name: 'audit',
     },
  },
  /** 为权限限名添加更符合语义的文本映射, 比如为 user:crud 中的 user 添加映射 { user: '用户' } */
  authNameMap?: {
     user: '用户',
  };
  /** 'en-US' | 设置显示的语言 */
  lang?: 'en-US' | 'zh-CN';
  /** 扩展语言包或覆盖现有语言包 */
  languages?: any;
});


/** authPro是一个如下格式的对象 */
interface AuthPro {
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


/** 一个简单的验证实例 */
const ap = authProCreate({
    auth: ['user:cr', 'news:ud'],
});

expect(ap.auth(['user:ud', 'news:cud'])).toEqual([
    { missing: ['update', 'delete'], name: 'user', originalName: 'user' },
    { missing: ['create'], name: 'news', originalName: 'news' },
]);
```











