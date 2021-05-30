import create from '@m78/seed';
import { createAuth } from '../src/index';

const seed = create({
  state: {
    name: 'lxj',
    age: 17,
  },
});

const auth = createAuth({
  validFirst: true,
  seed,
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

seed.coverSetState({
  name: 'jxl',
  age: 15,
});

console.log(seed.getState());

console.log(
  auth(['isLxj', 'is18plus', 'isFalse'], {
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
