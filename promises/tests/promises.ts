import { Promize } from '../src';

describe('Promize', () => {
  test('resolves properly', () => {
    return new Promize<number>(resolve => {
      setTimeout(() => resolve(1), 100);
    })
    .then(value => expect(value).toBe(1));
  });

  test('catches properly with throw', () => {
    const err = new Error('ups');

    return new Promize(() => {
      throw err;
    })
    .catch(reason => expect(reason).toBe(err));
  });

  test('catches properly with reject', () => {
    const err = new Error('ups');

    return new Promize((_, reject) => {
      return reject(err);
    })
    .catch(reason => expect(reason).toBe(err));
  });

  test('don\'t have value at once', () => {
    const promise = new Promize<number>(resolve => {
      resolve(5);
    });

    expect(promise.value).not.toBe(5);

    return promise.then(value => expect(value).toBe(5));
  });

  test('resolves a thenable before calling then', () => {
    return new Promize<number>(resolve1 => resolve1(30))
      .then(val => {
        expect(val).toBe(30);

        return val * 2;
      })
      .then(val => {
        expect(val).toBe(60);

        return new Promize<number>(resolve1 => resolve1(val  + 40));
      })
      .then(val => expect(val).toBe(100));
  });
});

describe('Promize finally', () => {
  test('it is called regardless of the promise state', () => {
    let counter = 0;
    const err = Error();
    const err2 = Error();

    return new Promize(resolve => resolve(15))
      .finally(() => {
        counter += 1;
      })
      .then(() => {
        return new Promize(() => {
          throw err;
        });
      })
      .then(() => {
        // wont be called
        counter = 1000;
      })
      .finally(() => {
        counter += 1;
      })
      .catch((reason) => {
        expect(reason).toBe(err);
        expect(counter).toBe(2);
      })
      .finally(() => {
        counter += 1;
        expect(counter).toBe(3);
        throw err2;
      })
      .catch((reason) => {
        expect(reason).toBe(err2);
        expect(counter).toBe(3);
        counter += 10;
      })
      .then(() => {
        counter += 1;
        expect(counter).toBe(14);
      });
  });
});

describe('Promize resolve', () => {
  test('resolve working correctly', () => {
    return Promize
      .resolve(5)
      .then(value => expect(value).toBe(5));
  });

  test('resolve working correctly', () => {
    return Promize
      .resolve(new Promise<number>(res => res(10)))
      .then(value => expect(value).toBe(10));
  });
});

describe('Promize reject', () => {
  test('reject working correctly', () => {
    const err = new Error();

    return Promize
      .reject(err)
      .catch(reason => expect(reason).toBe(err));
  });

  test('reject working correctly', () => {
    const err = new Error();

    return Promize
      .reject(new Promize((_, reject) => reject(err)))
      .catch(reason => expect(reason).toBe(err));
  });
});

describe('Promize all', () => {
  test('all resolves correctly', () => {
    return Promize.all([Promize.resolve(1), Promize.resolve(100), 1000, Promize.resolve(10)])
      .then(results => expect(results).toEqual([1, 100, 1000, 10]));
  });

  test('all resolves correctly', () => {
    const err = new Error();

    return Promize.all<any>([Promize.resolve(1), Promize.reject(err), Promize.resolve(10)])
      .catch(reason => expect(reason).toBe(err));
  });
});

describe('Promize any', () => {
  test('any resolves correctly', () => {
    return Promize.any([
      new Promize(res => setTimeout(() => res(100), 10)),
      Promize.resolve(10),
      new Promize(res => setTimeout(() => res(1000), 20)),
    ])
      .then(result => expect(result).toEqual(10));
  });

  test('any resolves correctly', () => {
    const err = new Error();

    return Promize.any([
      new Promize(res => setTimeout(() => res(10), 40)),
      new Promize(res => setTimeout(() => res(100), 30)),
      new Promize((_, rej) => setTimeout(() => rej(err), 20)),
      new Promize(res => setTimeout(() => res(1000), 10)),
    ])
      .then(result => expect(result).toEqual(1000));
  });

  test('any rejects correctly', () => {
    const err = new Error();

    return Promize.any([
      new Promize(res => setTimeout(() => res(10), 40)),
      new Promize(res => setTimeout(() => res(100), 30)),
      new Promize((_, rej) => setTimeout(() => rej(err), 10)),
      new Promize(res => setTimeout(() => res(1000), 20)),
    ])
      .catch(result => expect(result).toEqual(err));
  });
});
