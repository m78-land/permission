import { authCreate as create, authProCreate } from '../src';

describe('auth', () => {
  const getKit = (conf?: any) => {
    return create({
      ...conf,
      state: {
        verify: false,
        usr: {
          name: 'lxj',
          audit: true,
          vip: false,
        },
      },
      validators: {
        verify({ verify }) {
          if (!verify) {
            return {
              label: 'not verify',
              desc: 'Basic information is not verified',
            };
          }
        },
        login({ usr }) {
          if (!usr) {
            return {
              label: 'not log',
              desc: 'Please log in first',
            };
          }
        },
        audit({ usr }) {
          if (!usr.audit) {
            return {
              label: 'not audit',
              desc: 'User is not audit',
            };
          }
        },
        vip({ usr }) {
          if (!usr.vip) {
            return {
              label: 'not vip',
              desc: 'User is not vip',
            };
          }
        },
        self({ usr }, extra) {
          if (usr && usr.name !== extra) {
            return {
              label: 'not self',
              desc: 'Can only be operated by self',
            };
          }
        },
      },
    });
  };

  test('base', () => {
    const kit = getKit();

    const rej = kit.auth(['login', 'vip', 'audit']);
    expect(rej).toEqual([
      {
        label: 'not vip',
        desc: 'User is not vip',
      },
    ]);
  });

  test('or', () => {
    const kit = getKit();

    const rej = kit.auth(['login', ['vip', 'audit']]);

    expect(rej).toBe(null);
  });

  test('extra', () => {
    const kit = getKit();

    const rej = kit.auth(['self'], { extra: 'lxj' });

    expect(rej).toBe(null);
  });

  test('local validators & validFirst', () => {
    const kit = getKit({ validFirst: true });

    const rej = kit.auth(['isJxl', 'self'], {
      extra: 1,
      validators: {
        isJxl(deps, extra) {
          if (deps.usr.name !== 'jxl') {
            return {
              label: `Must be jxl${extra}`,
            };
          }
        },
      },
    });

    expect(rej).toEqual([{ label: 'Must be jxl1' }]);
  });
});

describe('authPro', () => {
  const authStrings = ['user:cr', 'news:ud'];
  const authMap = {
    user: {
      create: true,
      retrieve: true,
    },
    news: {
      update: true,
      delete: true,
    },
  };

  test('api', () => {
    const ap = authProCreate({
      auth: ['user:cr', 'news:ud'], // init auth
    });

    expect(ap).toMatchObject({
      setAuth: expect.any(Function),
      getAuth: expect.any(Function),
      getAuthDetail: expect.any(Function),
      auth: expect.any(Function),
      parse: expect.any(Function),
      stringify: expect.any(Function),
    });
  });

  test('setAuth() & getAuth() & getAuthDetail() & parse() & stringify()', () => {
    const ap = authProCreate();

    ap.setAuth(authStrings);

    expect(ap.getAuth()).toEqual(authStrings);

    expect(ap.getAuthDetail()).toEqual(authMap);

    expect(ap.parse(authStrings)).toEqual(authMap);

    expect(ap.stringify(authMap)).toEqual(authStrings);
  });

  test('auth()', () => {
    const ap = authProCreate({
      auth: authStrings,
    });
    expect(ap.auth(['user:ud', 'news:udc'])).toEqual([
      { missing: ['update', 'delete'], name: 'user', originalName: 'user' },
      { missing: ['create'], name: 'news', originalName: 'news' },
    ]);

    expect(ap.auth(authStrings)).toBe(null);
  });

  test('config', () => {
    const ap = authProCreate({
      lang: 'zh-CN',
      auth: authStrings, // init auth
      customAuthKeysMap: {
        p: {
          label: '发布',
          name: 'publisher',
        },
        a: {
          label: '审批',
          name: 'audit',
        },
      },
      authNameMap: {
        user: '用户',
      },
      languages: {
        'zh-CN': {
          updateKey: '操作',
        },
      },
    });

    expect(ap.getAuth()).toEqual(authStrings);

    expect(ap.auth(['user:upa'])).toEqual([
      { missing: ['操作', '发布', '审批'], name: '用户', originalName: 'user' },
    ]);
  });
});
