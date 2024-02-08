# rosie-extended

Rosie-Extended adds extra capabilities to the Rosie package. It is recommended you read and understand what [Rosie](https://github.com/rosiejs/rosie#readme) is before using this package.

Original Rosie functionality is not documented here. Only what Rosie-Extended adds.

## Overview

This package extends rosie by leveraging TypeScript and adding additional helper methods to factory definitions. Of particular note are:

-   optional factory attributes
-   typesafe build Options

## Usage

There are two phases of use:

1.  Factory definition
2.  Object building

**Factory Definition:** Define your factory

```typescript
const GameFactory = new Factory<Game>()
    .option('playerCount', 2)
    .sequence('id')
    .attr('is_over', false)
    .attr('created_at', () => new Date())
    .attr('random_seed', () => Math.random())

    // If players were given, fill in whatever attributes might be missing.
    .fill('players', 'playerCount', PlayerFactory);
```

If you wish for type-safe Options you can specify a second generic type to the Factory constructor.

```typescript
const BetterGameFactory = new Factory<Game, GameFactoryOptions>().extend(GameFactory);
```

**Object Building:** Build an object

```typescript
const game = GameFactory.build({}, { misspeltPlayerCount: '2' }); // <-- no compile time error is thrown

// Alternatively using a type-safe factory definition
const betterGame = BetterGameFactory.build({}, { misspeltPlayerCount: '2' }); // <-- TS error is thrown
```

## Usage in Node.js

Before using any of the extended methods (e.g. fill) you'll need to add the following code block. Whilst including
this in every code module has no undesirable side effects, it may be more convenient to add it to a common test
initialisation script.

```typescript
import { Factory } from 'rosie';
import { extend } from 'rosie-extended';
extend(Factory);
```

## Rosie-Extended API

### Factory definition functions

#### Factory (constructor)

Passing an Options interface as the second generic type, allows for type-safe compilation for all option parameters. If your factory actively uses maybe or any of its variants, e.g. fillMaybe, it is recommended the Option interface inherit from `BaseFactoryOptions`. This interface adds the following options which can be set during any future build calls. Other options may be added in future releases.

-   `includeMaybe` - should **all** _maybe_ attributes be included in the final object - defaults to `true`
-   `mustHave` - named attributes must be included in the final object - defaults to empty array `[]`

#### instance.maybe:

Use this to define optional attributes of your objects. These attributes have a 50/50 chance of being included in the final object.

-   **instance.maybe(`attribute_name`, `default_value`)** - `attribute_name` is required and is a string, `default_value` is the value to use by default for the attribute
-   **instance.maybe(`attribute_name`, `generator_function`)** - `generator_function` is called to generate the value of the attribute
-   **instance.maybe(`attribute_name`, `dependencies`, `generator_function`)** - `dependencies` is an array of strings, each string is the name of an attribute or option that is required by the `generator_function` to generate the value of the attribute. This list of `dependencies` will match the parameters that are passed to the `generator_function`

instance.maybe is syntactic sugar for **instance.attr(`attribute_name`, `() => faker.helpers.maybe(callback, { ...(!includeMaybe && { probability: 0 }) })`** where `callback` depends on which overload you are calling. `includeMaybe` is an auto-inserted Option allowing you to **exclude** optional attributes from the final object and can be set during the build call, **instance.build(`{}`, `{ includeMaybe: false }`)**

#### instance.fill:

Use this to define child attributes of your objects. These attributes fully fledged objects and usually have their own associated factory.

-   **instance.fill(`attribute_name`, `factory`)** - `attribute_name` is required and is a string, `factory` is the factory to use to fill any gaps
-   **instance.fill(`attribute_name`, `array_size`, `factory`)** - `array_size` is the size of the array to create and return. `factory` will create each array member. If an existing array is provided as an override to build, `array_size` will be ignored. A fill of any missing attributes will still be performed.

instance.fill is syntactic sugar for **instance.attr(`attribute_name`, [`attribute_name`], (props) => `factory`.build(props))** and **instance.attr(`attribute_name`, [`attribute_name`, `array_size`], (props, size) => fillGaps(props, `factory`, size))**

#### instance.fillMaybe:

Use this to define optional child attributes of your objects. These attributes are fully fledged objects and usually have their own associated factory. They also have a 50/50 chance of being included in the final object.

-   **instance.fillMaybe(`attribute_name`, `factory`)** - `attribute_name` is required and is a string, `factory` is the factory to use to fill any gaps
-   **instance.fillMaybe(`attribute_name`, `array_size`, `factory`)** - `array_size` is the size of the array to create and return. `factory` will create each array member. If an existing array is provided as an override to build, `array_size` will be ignored. A fill of any missing attributes will still be performed.

instance.fillMaybe is syntactic sugar for **instance.after((obj, opts) => { ... a lot of custom code ;) ... })**
