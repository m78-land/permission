<h1 align="center" style="color: #61dafb;">Auth</h1>
<h1 align="center" style="font-size: 80px;color:#61dafb">🔑</h1>

<br>

<p align="center">Another client permission library</p>

<br>

<p align="center">
    <span>en</span> | 
    <a href="./readme.zh-cn.md">中文</a>
</p>



<br>

## Install

```shell
yarn add @m78/auth
```

<br>



## Introduction

This library contains two implementations of permissions:

1. General Version, verify that through local validiar and a set of status, it is very suitable for reception projects that only contain small permissions verification 
2. The `Pro` version simplifies the overall use of the api through further encapsulation. It is suitable for mid- and back-end projects that contain a large number of complex permissions logic, and can be easily integrated with any back-end system.

<br>

* this library uses [@m78/seed](https://github.com/m78-core/seed) to manage the state, `seed` is a very simple and easy-to-learn state management solution, it is recommended to understand it before using it Its usage. 

* It is designed to be versatile enough to be used in any js runtime, including but not limited to `nodejs` `ReactNative` `wx mini programs` etc. 
* If you use it in a front-end framework, you may need to simply encapsulate it. If you use react, you can use the official implementation [`m78/auth`](http://llixianjie.gitee.io/m78/docs/utils/auth), other frameworks can be written by referring to their implementation.

<br>



## Auth

This is an example of pseudo code including all `api` of `Auth`:

```ts
import create from '@m78/seed';
import { createAuth } from '@m78/auth';

const seed = create({
  /** init state */
  state: {
    name: 'lxj',
    roleType: 1,
    age: 17,
  },
});

/** createAuth() is used to create an Auth instance, you can create any number of Auth instances with different configurations */
const auth = createAuth({
    seed,
    /**
      * If one verification fails, block subsequent verifications
      * - For the sub-permissions in or, even if validFirst is enabled, each item will still be verified, but only the first one will be returned
      * - Putting the higher priority permission key in front when executing auth() helps to improve the accuracy of the verification feedback, such as login> publisher, because the publisher status is based on login.
      **/
    validFirst: true,
    /** validator */
    validators: {
        isAdmin(state) {
            if (state.roleType !== 1) {
                // Details returned when verification fails
                return {
                    label: '403',
                    desc: 'You are not an administrator',
                    actions: [
                        {
                            label: 'Switch account',
                            handle() {...},
                        },
                        {
                            label: 'Abandon',
                        },
                    ],
                };
            }
        },
        is18plus(state, extra) {
            if (state.age < 18) {
                return {
                    label: '403',
                    desc: 'Under 18 years old',
                    actions: [
                        {
                            label: 'Switch account',
                        },
                    ],
                };
            }
        },
    }
});

// Permission validation. When the validation is rejected, all unauthenticated validators are returned as details, and null on success
auth(['isAdmin', 'is18plus']);

// The return of a failed validation would look like this
[
    {
        /** The permission name */
        label: string;
        /** A literal description of this permission */
        desc?: string;
        /** The set of actions provided to the user when authentication fails */
        actions?: [
			{
                  /** operation name */
                  label: string;
                  /**
                   * You can extend the exception handling method (handler), rendering type (link), etc., to help control the specific display
                   * */
                  [key: string]: any;
            }
        ];
	}
]

// When the permission item is an array, it indicates the condition 'OR', which means that any of the permissions can be passed
auth(['isAdmin', ['is18plus', 'someVa..']]);

// configure
auth(['isAdmin'], {
  /** Extra parameters passed to the validator */
  extra?: any;
  /** Local validator */
  validators?: Validators<S>;
});
```



## AuthPro

This is an example of pseudocode that contains all the 'AuthPro' APIs:

```ts
import create from '@m78/seed';
import { createAuthPro } from '@m78/auth';

/**
 * Permissions are represented by an array containing the format 'name:keys'
 * Name represents a unique name that can represent a permission
 * Keys is a character like 'CRUD', which represents the permissions to add, Retrieve, Update and Delete to this function. Keys may also contain user-defined keys.
 *
 * For projects with more complex functions, it is recommended to split the name by module by '.', such as' main.client.news:crud '
 * */
const authStrings = ['user:cud', 'news:cr'];


/** create a authPro */
const authPro = createAuthPro({
  /** seed used to control internal state */
  seed: create(),
  /** init auth */
  auth?: authStrings;
  /**
   * Add a custom permission key other than 'c r u d'
   * - When any key in C, R, U and D is set, the internal default configuration will be overridden
   * */
  customAuthKeysMap?: {
     p: {
        label: 'publish',
        name: 'publisher',
     },
     a: {         
       	label: 'audit',
        name: 'audit',
     },
  },
  /** Add more semantic text mapping for permission limit names, such as mapping {user: 'user'} for user in user: CRUD */
  authNameMap?: {
     user: 'User',
  };
  /** 'en-US' | Sets the language to display */
  lang?: 'en-US' | 'zh-CN';
  /** Extend or override an existing language package */
  languages?: any;
});


/** AuthPro is an object of the following format */
interface AuthPro {
  /** Set Current Permissions */
  setAuth: (auth: AuthProStrings) => void;
  /** Get current permissions */
  getAuth: () => AuthProStrings;
  /** Gets the detail object of the permission */
  getAuthDetail: () => AuthProDetailMap | null;
  /** Pass in an array of permission characters for validation */
  auth: (keys: AuthProStrings) => AuthProValidMeta[] | null;
  /** Parses an AuthProStrings based on the configuration of the current instance and returns the parse object */
  parse: (keys: AuthProStrings) => AuthProDetailMap | null;
  /** Stringize the AuthProDetailMap and return an array of AuthProStrings for each permission */
  stringify: (authMap: AuthProDetailMap) => AuthProStrings;
  /** conventional version of the authore */
  authInstance: Auth<_AuthSeedProState>;
}


/** A simple validation example */
const ap = authProCreate({
    auth: ['user:cr', 'news:ud'],
});

expect(ap.auth(['user:ud', 'news:cud'])).toEqual([
    { missing: ['update', 'delete'], name: 'user', originalName: 'user' },
    { missing: ['create'], name: 'news', originalName: 'news' },
]);
```











