import {
  delay,
  isFunction,
  isObject,
  isPromiseLike,
  tryFn,
  arrayFilledLength,
 } from '../src/utils';

describe('utils - delay', () => {
  test('should work correctly', (done) => {
    let result = 0;

    delay(() => result += 1);

    expect(result).toBe(0);
    setTimeout(
      () => {
        expect(result).toBe(1);
        done();
      },
      10,
    );
  });
});

describe('isFuntion', () => {
  test('should return false', () => {
    expect(isFunction([])).toBe(false);
    expect(isFunction(null)).toBe(false);
    expect(isFunction({})).toBe(false);
    expect(isFunction(() => {})).toBe(true);
  });
  test('should return true', () => {
    expect(isFunction(() => {})).toBe(true);
  });
});

describe('isObject', () => {
  test('should return false', () => {
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject(() => {})).toBe(false);
  });
  test('should return true', () => {
    expect(isObject({})).toBe(true);
  });
});

describe('isPromiseLike', () => {
  test('should return false', () => {
    expect(isPromiseLike([])).toBe(false);
    expect(isPromiseLike(null)).toBe(false);
    expect(isPromiseLike(() => {})).toBe(false);
    expect(isPromiseLike({})).toBe(false);
    expect(isPromiseLike({ then: null })).toBe(false);
    expect(isPromiseLike({ then: {} })).toBe(false);
  });
  test('should return true', () => {
    expect(isPromiseLike({ then: () => {} })).toBe(true);
  });
});

describe('tryFn', () => {
  test('call function correctly', () => {
    let result = 0;
    let error = 0;

    tryFn(
      () => result += 1,
      () => error += 1,
    );

    expect(result).toBe(1);
    expect(error).toBe(0);
  });
  test('throw error correctly', () => {
    const result = 0;
    let error = 0;

    tryFn(
      () => { throw new Error(); },
      () => error += 1,
    );

    expect(result).toBe(0);
    expect(error).toBe(1);
  });
});

describe('arrayFilledLength', () => {
  test('should return correct length', () => {
    const arr = [];
    arr[2] = 4;
    arr[1000] = 'aaaa';
    arr[50] = {};

    expect(arrayFilledLength(arr)).toBe(3);
  });
});
