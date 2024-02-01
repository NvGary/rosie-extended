import { IFactory, type Factory } from 'rosie';

declare module 'rosie' {
    export interface IFactory<T = any> {
        /**
         * Define an optional attribute on this factory. Optional attributes are added to the
         * factory in an identical syntax to normal attributes.
         *
         * Refer to {@link IFactory.attr} for further details.
         *
         * By default, optional attributes are probabilistically generated with a 50/50 chance.
         * This can be manipulated with the 'includeMaybe' option when calling #build.
         *
         * ```ts
         * new Factory().build({}, { includeMaybe: false })
         * ```
         *
         * Dependencies can be names of either attributes or options, or any combination of.
         * These will be passed to the generator function in the order provided. Note that a
         * self-dependency is not allowed and will be removed. Neither can 'includeMaybe' be
         * passed to the generator function.
         *
         * @typeparam K name of attribute
         * @param {K} name the attribute name
         * @param {T[K]} defaultValue default value to assign
         * @returns {Factory} self reference for chaining
         */
        maybe<K extends keyof T>(name: K, defaultValue: T[K]): IFactory<T>;
        maybe<K extends keyof T>(name: K, generatorFunction: () => T[K] | undefined): IFactory<T>;
        maybe<K extends keyof T, D extends keyof T>(name: K, dependencies: D[], generatorFunction: (value: T[D]) => T[K] | undefined): IFactory<T>;
        maybe<K extends keyof T, D extends keyof T>(name: K, dependencies: D[], generatorFunction: any): IFactory<T>;
        maybe<K extends keyof T>(name: K, dependencies: string[], generatorFunction: (...dependencies: any[]) => T[K] | undefined): IFactory<T>;

        /**
         * Define attribute as a child object, or array of child objects, and fill in
         * partially-specified objects.
         *
         * This method ensures child objects have as many attributes filled as possible.
         *
         * ```ts
         *   // will populate the child object 'address' using AddressFactory
         *   new Factory<T>().fill('address', AddressFactory)
         *
         *   // will respect existing child attribute values, populating only what is missing using AddressFactory
         *   new Factory<T>().fill('address', AddressFactory).build({ address: { county: 'Devon' } })
         * ```
         *
         * Fill can conditionally return an array. Simply include the size parameter.
         * Size is respected when building a new array. If an existing array was provided
         * as an override to #build, each child is filled out individually. Array length
         * WILL NOT be updated to size.
         *
         * ```ts
         *   // will create a new 2 member players array, populated using PlayerFactory
         *   new Factory<T>().option('playerCount, 2).fill('players', 'playerCount', PlayerFactory).build();
         *
         *   // will returns players exactly as presented === []
         *   new Factory<T>().option('playerCount, 2).fill('players', 'playerCount', PlayerFactory).build({ players: [] });
         *
         *   // will return 1 member players array, with missing attributes populated using PlayerFactory
         *   new Factory<T>().option('playerCount, 2).fill('players', 'playerCount', PlayerFactory).build({ players: [ avatar: '' ] });
         * ```
         */
        fill<K extends keyof T>(name: K, factory: IFactory<T[K]>): IFactory<T>;
        fill<K extends keyof T>(name: K, size: string, factory: IFactory<T[K][any]>): IFactory<T>;

        /**
         * Define an optional attribute on this factory. This optional attribute is
         * a child object, and will be filled out using the standard fill semantics.
         *
         * Refer to {@link IFactory.fill} for further details.
         *
         * By default optional attributes are probabilistically generated with a 50/50 chance.
         * This can be manipulated with the 'includeMaybe' option when calling #build.
         *
         * Refer to {@link IFactory.maybe} for further details.
         */
        fillMaybe<K extends keyof T>(name: K, factory: IFactory<T[K]>): IFactory<T>;
        fillMaybe<K extends keyof T>(name: K, size: string, factory: IFactory<T[K][any]>): IFactory<T>;
    }

    export interface IFactoryStatic {
        new <T, U extends RosieFactoryOptions<T> = any>(): IFactoryEx<T, U>;
    }
}

export interface MaybeFactoryOptions<T> {
    includeMaybe?: boolean;
    mustHave?: [keyof T]
}

export type RosieFactoryOptions<T> = MaybeFactoryOptions<T> & {}

/**
 * @template [T=any] data structure to create
 * @template [U=any] build options
 */
export interface IFactoryEx<T = any, U = any> {
    /**
     * @typeparam K - name of attribute
     * @callback GeneratorFunction
     * @returns {T[K]}
     */

    /**
     * Define an optional attribute on this factory. Optional attributes are added to the
     * factory in an identical syntax to normal attributes.
     *
     * Refer to {@link IFactoryEx.attr} for further details.
     *
     * By default optional attributes are probabilistically generated with a 50/50 chance.
     * This can be manipulated with the 'includeMaybe' option when calling #build.
     *
     * ```ts
     * new Factory<T, U extends RosieFactoryOptions>().build({}, { includeMaybe: false })
     * ```
     *
     * Dependencies can be names of either attributes or options, or any combination of.
     * These will be passed to the generator function in the order provided. Note that a
     * self-dependency is not allowed and will be removed. Neither can 'includeMaybe' be
     * passed to the generator function.
     *
     * Factories using 'maybe' should ensure their Options inherit {@link RosieFactoryOptions}. This
     * adds an 'includeMaybe' for #build to optionally specify.
     *
     * @typeparam K name of attribute
     * @param {K} name the attribute name
     * @param {T[K]} defaultValue default value to assign
     * @returns {Factory} self reference for chaining
     */
    maybe<K extends keyof T>(name: K, defaultValue: T[K]): IFactoryEx<T, U>;
    /**
     * {@inheritDoc maybe:(0)}
     * @typeparam K name of attribute
     * @param {K} name the attribute name
     * @param {GeneratorFunction} generatorFunction builder function
     * @returns {Factory} self reference for chaining
     */
    maybe<K extends keyof T>(name: K, generatorFunction: () => T[K]): IFactoryEx<T, U>;
    maybe<K extends keyof T, D extends keyof T, O extends keyof U>(
        name: K,
        dependencies: [D, O],
        generatorFunction: (value1: T[D], value2: U[O]) => T[K]
    ): IFactoryEx<T, U>;
    maybe<K extends keyof T, O extends keyof U, D extends keyof T>(
        name: K,
        dependencies: [O, D],
        generatorFunction: (value1: U[O], value2: T[D]) => T[K]
    ): IFactoryEx<T, U>;
    maybe<K extends keyof T, D extends keyof T>(name: K, dependencies: D[], generatorFunction: (value: T[D]) => T[K]): IFactoryEx<T, U>;
    maybe<K extends keyof T, D extends keyof T>(name: K, dependencies: D[], generatorFunction: (...dependencies: any[]) => T[K]): IFactoryEx<T, U>;
    maybe<K extends keyof T, O extends keyof U>(name: K, dependencies: O[], generatorFunction: (value: U[O]) => T[K]): IFactoryEx<T, U>;
    maybe<K extends keyof T, O extends keyof U>(name: K, dependencies: O[], generatorFunction: (...dependencies: any[]) => T[K]): IFactoryEx<T, U>;

    /**
     * Define attribute as a child object, or array of child objects, and fill in
     * partially-specified objects.
     *
     * This method ensures child objects have as many attributes filled as possible.
     *
     * ```ts
     *   // will populate the child object 'address' using AddressFactory
     *   new Factory<T, U>().fill('address', AddressFactory)
     *
     *   // will respect existing child attribute values, populating only what is missing using AddressFactory
     *   new Factory<T, U>().fill('address', AddressFactory).build({ address: { county: 'Devon' } })
     * ```
     *
     * Fill can conditionally return an array. Simply include the size parameter.
     * Size is respected when building a new array. If an existing array was provided
     * as an override to #build, each child is filled out individually. Array length
     * WILL NOT be updated to size.
     *
     * ```ts
     *   // will create a new 2 member players array, populated using PlayerFactory
     *   new Factory<T, U>().option('playerCount, 2).fill('players', 'playerCount', PlayerFactory).build();
     *
     *   // will returns players exactly as presented === []
     *   new Factory<T, U>().option('playerCount, 2).fill('players', 'playerCount', PlayerFactory).build({ players: [] });
     *
     *   // will return 1 member players array, with missing attributes populated using PlayerFactory
     *   new Factory<T, U>().option('playerCount, 2).fill('players', 'playerCount', PlayerFactory).build({ players: [ avatar: '' ] });
     * ```
     */
    fill<K extends keyof T, O extends keyof U>(name: K, factory: IFactory<T[K]> | IFactoryEx<T[K]>): IFactoryEx<T, U>;
    fill<K extends keyof T, O extends keyof U>(name: K, size: O, factory: IFactory<T[K][any]> | IFactoryEx<T[K][any]>): IFactoryEx<T, U>;

    /**
     * Define an optional attribute on this factory. This optional attribute is
     * a child object, and will be filled out using the standard fill semantics.
     *
     * Refer to {@link IFactoryEx.fill} for further details.
     *
     * By default optional attributes are probabilistically generated with a 50/50 chance.
     * This can be manipulated with the 'includeMaybe' option when calling #build.
     *
     * Refer to {@link IFactoryEx.maybe} for further details.
     */
    fillMaybe<K extends keyof T, O extends keyof U>(name: K, factory: IFactory<T[K]> | IFactoryEx<T[K]>): IFactoryEx<T, U>;
    fillMaybe<K extends keyof T, O extends keyof U>(name: K, size: O, factory: IFactory<T[K][any]> | IFactoryEx<T[K][any]>): IFactoryEx<T, U>;

    /**
     * Define an attribute on this factory. Attributes can optionally define a
     * default value, either as a value (e.g. a string or number) or as a builder
     * function. For example:
     *
     *   // no default value for age
     *   Factory.define('Person').attr('age')
     *
     *   // static default value for age
     *   Factory.define('Person').attr('age', 18)
     *
     *   // dynamic default value for age
     *   Factory.define('Person').attr('age', function() {
     *      return Math.random() * 100;
     *   })
     *
     * Attributes with dynamic default values can depend on options or other
     * attributes:
     *
     *   Factory.define('Person').attr('age', ['name'], function(name) {
     *     return name === 'Brian' ? 30 : 18;
     *   });
     *
     * By default if the consumer of your factory provides a value for an
     * attribute your builder function will not be called. You can override this
     * behavior by declaring that your attribute depends on itself:
     *
     *   Factory.define('Person').attr('spouse', ['spouse'], function(spouse) {
     *     return Factory.build('Person', spouse);
     *   });
     *
     * As in the example above, this can be a useful way to fill in
     * partially-specified child objects.
     *
     * @param {string} attr
     * @param {Array.<string>=} | any dependenciesOrValue
     * @param any
     * @return {Factory}
     */
    attr<K extends keyof T>(name: K, defaultValue: T[K]): IFactoryEx<T, U>;
    attr<K extends keyof T>(name: K, generatorFunction: () => T[K]): IFactoryEx<T, U>;
    attr<K extends keyof T, D extends keyof T, O extends keyof U>(
        name: K,
        dependencies: [D, O],
        generatorFunction: (value1: T[D], value2: U[O]) => T[K]
    ): IFactoryEx<T, U>;
    attr<K extends keyof T, O extends keyof U, D extends keyof T>(
        name: K,
        dependencies: [O, D],
        generatorFunction: (value1: U[O], value2: T[D]) => T[K]
    ): IFactoryEx<T, U>;
    attr<K extends keyof T, D extends keyof T>(name: K, dependencies: D[], generatorFunction: (value: T[D]) => T[K]): IFactoryEx<T, U>;
    attr<K extends keyof T, D extends keyof T>(name: K, dependencies: D[], generatorFunction: (...dependencies: any[]) => T[K]): IFactoryEx<T, U>;
    attr<K extends keyof T, O extends keyof U>(name: K, dependencies: O[], generatorFunction: (value: U[O]) => T[K]): IFactoryEx<T, U>;
    attr<K extends keyof T, O extends keyof U>(name: K, dependencies: O[], generatorFunction: (...dependencies: any[]) => T[K]): IFactoryEx<T, U>;

    /**
     * Convenience function for defining a set of attributes on this object as
     * builder functions or static values. If you need to specify dependencies,
     * use #attr instead.
     *
     * For example:
     *
     *   Factory.define('Person').attrs({
     *     name: 'Michael',
     *     age: function() { return Math.random() * 100; }
     *   });
     *
     * @param {object} attributes
     * @return {Factory}
     */
    attrs<Keys extends keyof T>(attributes: { [K in Keys]: T[K] | ((opts?: any) => T[K]) }): IFactoryEx<T, U>;

    /**
     * Define an option for this factory. Options are values that may inform
     * dynamic attribute behavior but are not included in objects built by the
     * factory. Like attributes, options may have dependencies. Unlike
     * attributes, options may only depend on other options.
     *
     *   Factory.define('Person')
     *     .option('includeRelationships', false)
     *     .attr(
     *       'spouse',
     *       ['spouse', 'includeRelationships'],
     *       function(spouse, includeRelationships) {
     *         return includeRelationships ?
     *           Factory.build('Person', spouse) :
     *           null;
     *       });
     *
     *   Factory.build('Person', null, { includeRelationships: true });
     *
     * Options may have either static or dynamic default values, just like
     * attributes. Options without default values must have a value specified
     * when building.
     *
     * @param {string} opt
     * @param {Array.<string>=} | any dependencies or value
     * @param {*=} value
     * @return {Factory}
     */
    option<K extends keyof U>(name: K, defaultValue: U[K]): IFactoryEx<T, U>;
    option<K extends keyof U>(name: K, generatorFunction: () => U[K]): IFactoryEx<T, U>;
    option<K extends keyof U, D extends keyof U>(name: K, dependencies: D[], generatorFunction: (value: U[D]) => U[K]): IFactoryEx<T, U>;
    option<K extends keyof U, D extends keyof U>(name: K, dependencies: D[], generatorFunction: (...dependencies: any[]) => U[K]): IFactoryEx<T, U>;

    /**
     * Defines an attribute that, by default, simply has an auto-incrementing
     * numeric value starting at 1. You can provide your own builder function
     * that accepts the number of the sequence and returns whatever value you'd
     * like it to be.
     *
     * Sequence values are inherited such that a factory derived from another
     * with a sequence will share the state of that sequence and they will never
     * conflict.
     *
     *   Factory.define('Person').sequence('id');
     *
     * @param {string} attr
     * @param {Array.<string>=} | Function dependencies or builder
     * @param {function(number): *=} builder
     * @return {Factory}
     */
    sequence<K extends keyof T>(name: K, builder?: (i: number) => T[K]): IFactoryEx<T, U>;
    sequence<K extends keyof T, D extends keyof T>(name: K, dependencies: D[], builder: (i: number, ...args: any[]) => T[K]): IFactoryEx<T, U>;

    /**
     * Sets a post-processor callback that will receive built objects and the
     * options for the build just before they are returned from the #build
     * function.
     *
     * @param {function(object, ?object)} callback
     * @return {Factory}
     */
    after(functionArg: (obj: T, opts: U) => void): IFactoryEx<T, U>;

    /**
     * Sets the constructor for this factory to be another factory. This can be
     * used to create more specific sub-types of factories.
     *
     * @param {Factory} parentFactory
     * @return {Factory}
     */
    inherits(functionArg: (parentFactory: IFactory<T>) => void): IFactoryEx<T, U>;
    inherits(functionArg: (parentFactory: IFactoryEx<T, U>) => void): IFactoryEx<T, U>;

    /**
     * Builds a plain object containing values for each of the declared
     * attributes. The result of this is the same as the result when using #build
     * when there is no constructor registered.
     *
     * @param {object=} attributes
     * @param {object=} options
     * @return {object}
     */
    attributes(attributes?: { [k in keyof T]?: T[k] }, options?: { [o in keyof U]?: U[o] }): T;

    /**
     * Generates values for all the registered options using the values given.
     *
     * @private
     * @param {object} options
     * @return {object}
     */
    options(options: { [k in keyof U]?: U[k] }): U;

    /**
     * Builds objects by getting values for all attributes and optionally passing
     * the result to a constructor function.
     *
     * @param {object=} attributes
     * @param {object=} options
     * @return {*}
     */
    build(attributes?: { [k in keyof T]?: T[k] }, options?: { [o in keyof U]?: U[o] }): T;
    buildList(size: number, attributes?: { [k in keyof T]?: T[k] }, options?: { [o in keyof U]?: U[o] }): T[];

    /**
     * Extends a given factory by copying over its attributes, options,
     * callbacks, and constructor. This can be useful when you want to make
     * different types which all share certain attributes.
     *
     * @param {string|Factory} name The factory to extend.
     * @return {Factory}
     */
    extend<K extends T>(name: IFactory<K>): IFactoryEx<T, U>;
    extend<K extends Partial<T>, J extends Partial<U>>(name: IFactoryEx<K, Required<J>>): IFactoryEx<T, U>;
    extend(name: string): IFactoryEx<T, U>;
}

export function fillGaps<T>(
    data: Array<T> | undefined,
    factory: Pick<IFactory<T>, 'build' | 'buildList'>,
    size: number,
    attributes?: { [k in keyof T]?: T[k] },
    options?: any
): Array<T>;
export function fillGaps<T, U extends RosieFactoryOptions<T> = RosieFactoryOptions<T>>(
    data: Array<T> | undefined,
    factory: Pick<IFactoryEx<T, U>, 'build' | 'buildList'>,
    size: number,
    attributes?: { [k in keyof T]?: T[k] },
    options?: { [o in keyof U]?: U[o] }
): Array<T>;

/**
 * Returns the result of the callback if the probability check was successful, otherwise `undefined`.
 *
 * @template T - The type of result of the given callback
 * @typeparam K name of attribute
 * @param {callback} callback - The callback to be invoked if the probability check was successful
 * @param {K=} name the attribute name
 * @param {MaybeFactoryOptions=} options - Options controlling function behaviour
 * @returns {NonNullable<T>} Result of the callback, or undefined if callback was not invoked
 */
export function maybe<T>(callback: () => NonNullable<T>): NonNullable<T> | undefined;
export function maybe<T = Record<string, any>, K extends keyof T = keyof T>(callback: () => T[K], name: K, options: MaybeFactoryOptions<T>): T[K] | undefined;

export function extend(factory: typeof Factory): void;
