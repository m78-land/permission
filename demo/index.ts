import { authProCreate } from '../src/index';

const auth = authProCreate({
  languages: {
    'zh-CN': {
      noPermission: '😥 木有权限',
    },
  },
  lang: 'zh-CN',
  authNameMap: {
    user: '用户',
    news: '新闻',
    audit: '审批',
  },
  auth: ['user:d', 'news:cd'],
  customAuthKeysMap: {
    a: {
      name: 'audit',
      label: '审批',
    },
  },
});

console.log(auth.auth(['user:cua', 'audit:crud']));

console.log(auth.parse(['user:crd', 'audit:rd']));

console.log(
  auth.stringify({
    user: {
      create: true,
      retrieve: true,
      delete: true,
      audit: true,
    },
    audit: {
      retrieve: true,
      delete: true,
    },
  }),
);
