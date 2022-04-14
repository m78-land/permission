<h1 align="center" style="color: #61dafb;">Permission</h1>
<h1 align="center" style="font-size: 80px;color:#61dafb">🔑</h1>



<br>

## 安装

```shell
yarn add @m78/permission
```

<br>


## 介绍

此库包含两种权限实现:

1. 常规版本，验证通过本地验证器和一组状态来实现, 适合只包含中少量权限验证的前台项目。
2. `Pro` 版本，通过进一步的封装简化了api的整体使用，适合包含大量复杂权限逻辑的中后台项目，并且可以非常简单的和任意后端体系集成。

<br>

* 使用了[@m78/seed](https://github.com/m78-core/seed)来管理状态, `seed`是一个非常简单易学的状态管理方案，使用前建议先了解下它的用法。
* 它被设计得足够通用，可以在任意js运行时使用，包括但不限于`nodejs` `ReactNative` `小程序 `等, 如果你的前后端都是js的话, 可以复用一套权限逻辑。
* 如果你在前端框架中使用，可能会需要对其进行简单的封装, 若使用react，可以使用官方实现  [`m78/auth`](https://m78.vercel.app/docs/ecology/auth) , 其他框架可以参考其实现来编写。

<br>




## Permission

这是包含`Auth` 所有 `api` 的伪代码示例：

```ts
import create from '@m78/seed';
import { create as createPermission } from '@m78/permission';

const seed = create({
  /** 初始状态 */
  state: {
    name: 'lxj',
    roleType: 1,
    age: 17,
  },
});

/** createPermission()用于创建一个Permission实例 */
const permission = createPermission({
    seed,
    /**
      * 如果一个验证未通过，则阻止后续验证
      * - 对于or中的子权限，即使开启了validFirst，依然会对每一项进行验证，但是只会返回第一个
      * - 在执行验证时将优先级更高的权限key放到前面有助于提高验证反馈的精度, 如 login > publisher, 因为publisher状态是以login为前提的
      **/
    validFirst: true,
    /** 验证器, 一个接收当前state和额外参数返回验证meta新的的函数 */
    validators: {
        isAdmin(state) {
            if (state.roleType !== 1) {
                // 验证未通过时返回的详细信息
                return {
                  	// 必须字段
                    label: '403',
                  	// 你也可以自定义一些扩展字段, 用来帮助更好的展示验证结果和可用的操作, 比如:
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

// 权限验证, 验证被拒绝时，会将所有未验证通过的验证器返回作为详细信息返回, 成功则返回null
permission(['isAdmin', 'is18plus']);

// 验证失败的返回是这样子的
[
  {
    /** 该权限名称 */
    label: string;
    // 其他扩展字段
  }
]

// 当权限项是一个数组时，表示条件`or`， 表示其中任意一个权限通过即可
permission(['isAdmin', ['is18plus', 'someVa..']]);

// 传入配置
permission(['isAdmin'], {
  /** 传递给验证器的额外参数, 比如用户id */
  extra?: any;
  /** 局部验证器 */
  validators?: Validators<S>;
});
```



## PermissionPro

这是包含`PermissionPro`所有 `api` 的伪代码示例：

```ts
import create from '@m78/seed';
import { createPro } from '@m78/auth';

/**
 * 权限模板
 *
 * 权限模板格式如: `module:keys`
 * - name为权限所属模块
 * - keys为具体的权限
 *
 * 模板中可以使用一些DSL语法, 比如:
 * - user:create&update
 * - user:create|update
 * - user:create&update|delete
 * - user:create&(update|update2)
 * */
const keys = ['user:create'];

const ownPermission = {
  user: ['create', 'update', 'delete'],
  news: ['create', 'update', 'delete'],
};

/** 创建一个authPro */
const pro = createPro({
  /** 初始权限 */
  permission: ownPermission;
 	/** meta是一个可选配置, 用来为权限附加更多的可用信息, 如权限名, 权限描述, 可用的操作等等, 方便使用者通过这些信息创建更友好的失败反馈. */
  meta: {
     // 匹配所有同名key的meta
     general: [
        {
   				// 必须的字段
          label: '创建',
          key: 'create',
  				// 你也可以扩展一些其他字段
  				desc: '创建某些东西..'
      	},
     ],
     // 针对特定模块的meta, 优先级大于general
     modules: {
        user: [
            {
              label: '更新',
              key: 'update',
            },
        ],
     },
     // 可用于在验证meta生成前对其改写
     each: meta => meta,
  },
});

// 执行验证
pro.check(['user:create&delete', 'news:create|query']);
// 当权限项是一个数组时，表示条件`or`， 表示其中任意一个权限通过即可
pro.check(['user:create', ['user:create', 'news:query']]);

// 当验证失败时, 返回如下的结构, 验证成功则返回null
[
  {
    label: '更新',
    key: 'user.update',
  },
  {
    label: '创建',
    key: 'news.create',
    desc: '创建某些东西..',
  },
]

// 如果要更新权限或meta
pro.seed.set({
  permission: {...},
  meta: {...},
});
```







