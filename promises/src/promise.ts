import {
  Executor,
  Handler,
  OnFailHandler,
  OnSuccessHandler,
  PromizeLike,
  OnFinallyHandler,
} from './interfaces';

import { State } from './state';
import {
  delay,
  isPromiseLike,
  tryFn,
  arrayFilledLength,
} from './utils';

export class Promize<T> implements PromizeLike<T> {

  public state: State = State.PENDING;
  public value: T | any;
  private handlers: Handler<T>[] = [];

  constructor(executor: Executor<T>) {
    try {
      executor(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  public then<U = T>(onSuccessFn?: OnSuccessHandler<T, U>, onFailFn?: OnFailHandler<U>) {
    const callback: Executor<U> = (resolve, reject) => {
      const onSuccess = (result: T) => {
        if (!onSuccessFn) {
          return resolve(result as unknown as U);
        }

        return tryFn(() => resolve(onSuccessFn(result)), reject);
      };

      const onFail = reason => {
        if (!onFailFn) {
          return reject(reason);
        }

        return tryFn(() => resolve(onFailFn(reason)), reject);
      };

      return this.atttachHandler({ onSuccess, onFail });
    };

    return new Promize<U>(callback);
  }

  public finally<U>(onFinallyFn?: OnFinallyHandler<U>) {
    let valueOrReason: U | any;
    let isRejected: boolean = false;

    const handle = result => {
      valueOrReason = result;

      tryFn(onFinallyFn, (e) => {
        valueOrReason = e;
        isRejected = true;
      });
    };

    return new Promize<U>((resolve, reject) => {
      return this.then(handle, handle)
        .then(() => isRejected ? reject(valueOrReason) : resolve(valueOrReason));
    });
  }

  public catch<U>(onFail: OnFailHandler<U>) {
    return this.then<U>(undefined, onFail);
  }

  private resolve = (value: T) => {
    delay(() => this.setResult(value));
  }

  private reject = (reason: any) => {
    delay(() => this.setResult(reason, State.REJECTED));
  }

  private setResult(value: T | any, state = State.RESOLVED) {
    if (this.state !== State.PENDING) return null;

    if (isPromiseLike(value)) {
      return value.then(this.resolve, this.reject);
    }

    this.state = state;
    this.value = value;

    return this.executeHandlers();
  }

  private atttachHandler<U>(handler: Handler<T, U>) {
    this.handlers = [...this.handlers, handler];

    this.executeHandlers();
  }

  private executeHandlers() {
    if (this.state === State.PENDING) return null;

    if (this.state === State.REJECTED) {
      return this.handlers.forEach(handler => handler.onFail(this.value));
    }

    return this.handlers.forEach(handler => handler.onSuccess(this.value));
  }

  public static resolve<U = any>(value: U) {
    return new Promize<U>(resolve => resolve(value));
  }

  public static reject<U = any>(reason: U) {
    return new Promize<U>((_, reject) => reject(reason));
  }

  public static all<U = any>(items: (U | PromizeLike<U>)[]) {
    const callback: Executor<U[]> = (resolve, reject) => {
      if (!Array.isArray(items)) {
        reject(new Error('Items have to be an array!'));
      }

      const resolvedCollection: U[] = [];

      return items.forEach((item, index) => {
        return Promize.resolve<U>(item as U)
          .then(value => {
            resolvedCollection[index] = value;

            if (arrayFilledLength(resolvedCollection) !== items.length) return;

            return resolve(resolvedCollection);
          })
          .catch(reject);
      });
    };

    return new Promize<U[]>(callback);
  }

  public static any<U = any>(items: (U | PromizeLike<U>)[]) {
    const callback: Executor<U> = (resolve, reject) => {
      if (!Array.isArray(items)) {
        reject(new Error('Items have to be an array!'));
      }

      items.forEach(item => {
        return Promize.resolve<U>(item as U)
          .then(resolve)
          .catch(reject);
      });
    };

    return new Promize<U>(callback);
  }

}
