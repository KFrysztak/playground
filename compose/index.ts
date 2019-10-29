const log = <T>(label: string) => (value: T) => {
  console.log(`${label}: ${value}`);
  return value;
};
const inc = (x: number) => x + 1;
const pipe = <R>(...fns: Function[]) => <T>(x: T) => fns.reduce((y, fn) => fn(y), x) as R;

const incByThree = pipe<number>(
  inc,
  log<number>('1'),
  inc,
  log<number>('2'),
  inc,
);

const result = incByThree(5);

console.log(result);

interface WithDate {
  setDate: (date?: Date) => Date;
  getDate: () => Date;
  getDelay: (date?: Date) => number;
}

interface WithConstructor<C> {
  __proto__: {
    constructor: C;
  };
}

interface Scheduler {
  isScheduler: boolean;
}

const withConstructor = <C = any>(constructor: C) => <T>(obj: T = {} as T) => ({
  __proto__: {
    constructor,
  },
  ...obj,
} as T & WithConstructor<C>);

const withDate = (date: Date = new Date()) => <T>(obj: T = {} as T) => {
  // tslint:disable-next-line: variable-name
  let _date = date;

  const extendWith: WithDate = {
    setDate: (date: Date = new Date()) => _date = date,
    getDate: () => _date,
    getDelay: (date: Date = new Date()) => _date.getTime() - date.getTime(),
  };

  return {
    ...obj,
    ...extendWith,
  };
};

const createScheduler = (date: Date = new Date()) =>
  pipe<Scheduler & WithDate & WithConstructor<Scheduler>>(
    withDate(date),
    withConstructor(createScheduler),
  )({ isScheduler: true });

const scheduler = createScheduler(new Date(2009, 5, 1));

console.log(scheduler);
console.log(scheduler.getDate());
console.log(scheduler.getDelay());

scheduler.setDate(new Date(2010, 5, 1));

console.log(scheduler.getDate());

console.log(scheduler.constructor);
