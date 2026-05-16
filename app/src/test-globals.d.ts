declare function describe(description: string, specDefinitions: () => void): void;
declare function beforeEach(action: () => void | Promise<void>): void;
declare function afterEach(action: () => void | Promise<void>): void;
declare function it(expectation: string, assertion?: () => void | Promise<void>): void;
declare function expect(actual: unknown): any;
declare function spyOn<T, K extends keyof T>(object: T, method: K): jasmine.Spy<T[K] extends (...args: any[]) => any ? T[K] : never>;

declare namespace jasmine {
  interface Spy<Fn extends (...args: any[]) => any = (...args: any[]) => any> {
    (...args: Parameters<Fn>): ReturnType<Fn>;
    and: {
      returnValue(value: ReturnType<Fn>): Spy<Fn>;
      callFake(fn: Fn): Spy<Fn>;
    };
  }

  type SpyObj<T> = T & {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? Spy<T[K]> : T[K];
  };

  function createSpyObj<T>(baseName: string, methodNames: Array<keyof T>, propertyNames?: Record<string, any>): SpyObj<T>;
}
