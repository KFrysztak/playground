
export interface Handler<T, U = any> {
  onSuccess: OnSuccessHandler<T, U>;
  onFail: OnFailHandler<U>;
}

export type OnSuccessHandler<T, U = any> = (value: T) => U | PromizeLike<U>;
export type OnFailHandler<U = any> = (reason: any) => U | PromizeLike<U>;
export type OnFinallyHandler<U = any> = () => U | PromizeLike<U>;
export interface PromizeLike<T = any> {
  then<U = T>(
    onSuccess: OnSuccessHandler<T, U>,
    onFail: OnFailHandler<U>,
  ): PromizeLike<U>;
}

export type Resolve<T = any> = (value?: T | PromizeLike<T>) => void;
export type Reject = (reason?: any) => void;

export type Executor<T = any> = (resolve: Resolve<T>, reject?: Reject) => void;
