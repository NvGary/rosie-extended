# Change Log

## 1.1.0

### bug fixes

-   .maybe now respects self-reference

### .fill Method

Method for defining child objects that could be partially-specified. .fill populates
missing attributes. Also handles arrays of partially-specified child objects

The following signatures are available

-   `fill(name, factory)`
-   `fill(name, arraySize, factory)`

### .fillMaybe Method

Method for defining optional child objects that could be partially-specified. Also handles
arrays of partially-specified child objects.

The following signatures are available

-   `fillMaybe(name, factory)`
-   `fillMaybe(name, arraySize, factory)`

## 1.0.0

### Typesafe Options

```typescript
    export interface IFactoryStatic { new <T, U>(): IFactoryEx<T, U>; }

    // Where IFactoryEx is a clone of IFactory, recreated with typesafe Options, e.g.
    build(attributes?: { [k in keyof T]?: T[k] }, options?: { [o in keyof U]?: U[o] }): T;
    buildList(size: number, attributes?: { [k in keyof T]?: T[k] }, options?: { [o in keyof U]?: U[o] }): T[];
```

### .maybe Method

Method for defining optional attributes which have a 50/50 chance of appearing in the generated test data.

The following signatures are available

-   `maybe(name, defaultValue)`
-   `maybe(name, generatorFunction)`
-   `maybe(name, dependencies, generatorFunction)`
