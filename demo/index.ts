import create from '@m78/seed';
import { createAuthPro } from '../src/index';

const auth = createAuthPro({
  seed: create(),
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
  // auth: ['user:d', 'news:cd'],
  customAuthKeysMap: {
    a: {
      name: 'audit',
      label: '审批',
    },
  },
});

console.log(auth.auth(['user:cua', 'audit:crud']));
