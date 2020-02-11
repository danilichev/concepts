interface Observer<T> {
  complete(): void;
  error(err: any): void;
  next(val: T): void;
}

type Teardown = () => void;

class Subscription {
  teardowns: Teardown[] = [];

  add(teardown: Teardown) {
    this.teardowns.push(teardown);
  }

  unsubscribe() {
    this.teardowns.forEach(teardown => teardown());
    this.teardowns = [];
  }
}

class Subscriber<T> implements Observer<T> {
  isClosed = false;

  constructor(
    private observer: Observer<T>,
    private subscription: Subscription
  ) {
    this.observer = observer;
    subscription.add(() => {
      this.isClosed = true;
    });
  }

  complete() {
    if (!this.isClosed) {
      this.isClosed = true;
      this.observer.complete();
      this.subscription.unsubscribe();
    }
  }

  error(err) {
    if (!this.isClosed) {
      this.isClosed = true;
      this.observer.error(err);
      this.subscription.unsubscribe();
    }
  }

  next(val) {
    if (!this.isClosed) {
      this.observer.next(val);
    }
  }
}

const pipe = (...fns: Array<(source: Observable<any>) => Observable<any>>) => (
  source: Observable<any>
) => fns.reduce((prev, fn) => fn(prev), source);

class Observable<T> {
  constructor(private init: (observer: Observer<T>) => Teardown) {
    this.init = init;
  }

  pipe<R>(
    ...fns: Array<(source: Observable<any>) => Observable<any>>
  ): Observable<R> {
    return pipe(...fns)(this);
  }

  subscribe(observer: Observer<T>) {
    const subscription = new Subscription();
    const subscriber = new Subscriber(observer, subscription);
    subscription.add(this.init(subscriber));

    return subscription;
  }
}

const map = <T, R>(fn: (val: T) => R) => (source: Observable<T>) => {
  return new Observable<R>(subscriber => {
    const sub = source.subscribe({
      complete() {
        subscriber.complete();
      },
      error(err: any) {
        subscriber.error(err);
      },
      next(val: T) {
        subscriber.next(fn(val));
      },
    });

    return () => {
      sub.unsubscribe();
    };
  });
};

const intervalObservable = new Observable<number>(observer => {
  let i = 0;

  const intervalId = setInterval(() => {
    observer.next(i++);
    if (i > 5) {
      observer.complete();
      observer.next(999);
    }
  }, 1000);

  return () => {
    console.log('tearing down');
    clearInterval(intervalId);
  };
});

const subscription = intervalObservable
  .pipe(
    map(i => i + 10),
    map(i => i / 2)
  )
  .subscribe({
    complete: () => console.log('completed'),
    error: err => console.log(err),
    next: val => console.log(val),
  });

setTimeout(() => {
  subscription.unsubscribe();
}, 10000);
