import { PromizeLike } from './interfaces';

export const delay = (fn: Function, delay = 0) => setTimeout(fn, delay);

export const isFunction = (candidate: any): candidate is Function => {
  return typeof candidate === 'function';
};

export const isObject = (candidate: any): candidate is Object => {
  return typeof candidate === 'object' &&
    candidate !== null &&
    !Array.isArray(candidate);
};

export const isPromiseLike = <T>(candidate: any): candidate is PromizeLike<T> => {
  return isObject(candidate) && isFunction(candidate.then);
};

export const tryFn = <T = any>(fn: () => T, errorHandler: Function) => {
  try {
    return fn();
  } catch (e) {
    return errorHandler(e);
  }
};

export const arrayFilledLength = (arr: any[]) => Object.keys(arr).length;
