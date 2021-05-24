import { authCreate } from '../src/index';

const auth = authCreate({
  validFirst: true,
  state: {
    name: 'lxj',
    age: 17,
  },
  validators: {
    isLxj(state) {
      console.log(1);
      if (state.name !== 'lxj') {
        return {
          label: '403',
          desc: '你不是lxj',
          actions: [
            {
              label: '切换账号',
            },
            {
              label: '放弃操作',
            },
          ],
        };
      }
    },
    is18plus(state, extra) {
      console.log(2, extra);
      if (state.age < 18) {
        return {
          label: '403',
          desc: '未满18岁',
          actions: [
            {
              label: '切换账号',
            },
            {
              label: '放弃操作',
            },
          ],
        };
      }
    },
  },
});

console.log(auth);

auth.coverSetState({
  name: 'jxl',
  age: 15,
});

console.log(auth.getState());

console.log(
  auth.auth(['isLxj', 'is18plus', 'isFalse'], {
    extra: 111,
    validators: {
      isFalse() {
        return {
          label: '错误!',
        };
      },
    },
  }),
);
