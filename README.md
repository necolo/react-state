
# @necolo/react-state

A lightweight React state manager built on React Hooks. This simple yet powerful library allows you to share state across multiple React components without complex setup or configuration.

![npm](https://img.shields.io/npm/v/@necolo/react-state)
![License](https://img.shields.io/npm/l/@necolo/react-state)
![React Version](https://img.shields.io/badge/react-%3E%3D16.8.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

## Features

- Lightweight with zero dependencies (besides React)
- Hook-based API that integrates naturally with React
- Simple model creation with intuitive patterns
- Cross-component state sharing without prop drilling
- TypeScript support with full type definitions
- Memoization support to optimize re-renders
- Multiple model management without provider nesting

## Installation

```bash
npm install @necolo/react-state
```

## Basic Usage

Creating and using a shared state model is simple:

```typescript
import React, { useState } from 'react';
import { Provider, createModel } from '@necolo/react-state';

// 1. Create your model
const CounterModel = createModel(function() {
  const [value, setValue] = useState(1);
  
  function increase() {
    setValue(value + 1);
  }
  
  return {
    value,
    increase,
  };
});

// 2. Register model at the root component
function App() {
  return (
    <Provider model={CounterModel}>
      <SubPage />
    </Provider>
  );
}

// 3. Use model in any child component
function SubPage() {
  // Access the model with the .use() method
  const counter = CounterModel.use();
  
  return (
    <div>
      <p>Count: {counter.value}</p>
      <button onClick={counter.increase}>Increase</button>
    </div>
  );
}
```

## Advanced Usage

### Models with Initial Values

You can create models that accept initial values:

```typescript
import React, { useState } from 'react';
import { Provider, createModel } from '@necolo/react-state';

const CounterModel = createModel(function(initialValue) {
  const [value, setValue] = useState(initialValue);
  
  function increase() {
    setValue(value + 1);
  }
  
  return {
    value,
    increase,
  };
});

function App() {
  // Pass initial value via the args prop
  return (
    <Provider model={CounterModel} args={10}>
      <SubPage />
    </Provider>
  );
}
```

### Managing Multiple Models

Instead of nesting multiple `Provider` components, use `Providers`:

```typescript
import React from 'react';
import { Providers } from '@necolo/react-state';

function App() {
  return (
    <Providers 
      models={[
        { model: CounterModel },
        { model: UserModel, args: { username: 'guest' } },
        { model: ThemeModel, args: 'light', memo: true },
      ]}
    >
      <YourApp />
    </Providers>
  );
}
```

This is equivalent to writing:

```typescript
function App() {
  return (
    <Provider model={CounterModel}>
      <Provider model={UserModel} args={{ username: 'guest' }}>
        <Provider model={ThemeModel} args="light" memo>
          <YourApp />
        </Provider>
      </Provider>
    </Provider>
  );
}
```

### Optimizing with Memoization

Use the `memo` flag to prevent unnecessary re-renders:

```typescript
<Provider model={CounterModel} memo>
  <YourApp />
</Provider>
```

### Selective Re-renders with Dependencies

You can optimize renders by specifying dependencies:

```typescript
function ProfilePage() {
  // Only re-render when user.name changes
  const user = UserModel.use(user => [user.name]);
  
  return <div>Hello, {user.name}</div>;
}
```

## API Reference

### `createModel(modelFunction)`

Creates a model with a `.use()` method for accessing it in components.

### `Provider` Component

Props:
- model: The model to provide
- args (optional): Initial arguments to pass to model
- memo (optional): Whether to memoize the model to prevent unnecessary re-renders
- modelRef (optional): Ref to access the model instance outside React's lifecycle

### `Providers` Component

Props:
- models: Array of model configurations with `{ model, args, memo }`

### `useModel(model, deps?)`

Hook to use a model directly (the `.use()` method uses this internally).

### `Consumer` Component

Props:
- model: The model to consume
- deps (optional): Selector function for optimizing re-renders
- children: Function that receives the model state

## TypeScript Support

This library is written in TypeScript and provides full type definitions:

```typescript
import { createModel, Provider } from '@necolo/react-state';

interface User {
  name: string;
  age: number;
}

// Properly typed model with TypeScript
const UserModel = createModel(function(initialUser: User) {
  const [user, setUser] = useState<User>(initialUser);
  
  function updateName(name: string) {
    setUser({ ...user, name });
  }
  
  return {
    user,
    updateName
  };
});

// TypeScript will ensure you pass the correct arguments
<Provider model={UserModel} args={{ name: "John", age: 30 }}>
  <App />
</Provider>
```

## License

MIT

## Contributing

Issues and PRs are welcome at [github.com/Necolo/react-state](https://github.com/Necolo/react-state)