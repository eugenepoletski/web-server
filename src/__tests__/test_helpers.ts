// eslint-disable-next-line max-len
// @see https://github.com/socketio/socket.io/blob/master/examples/basic-crud-application/server/test/todo-management/todo.tests.ts
export const createPartialDone = (count: number, done: () => void): any => {
  let i = 0;
  return () => {
    if (++i === count) {
      done();
    }
  };
};
