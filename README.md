# react-state
A light react state manager based on React Hooks.

You can use states across multiple react components. 

## Usage
It's very simple to use it in React hooks

```typescript
import { useMode, Provider } from '@necolo/react-state';

// create your model
function CounterModel () {
  const [value, setValue] = useState(1);
  function increase () {
    setValue(value + 1);
  }
  return {
    value,
    increase,
  };
}

// Registry model at the top component
function App () {
  return <Provider model={CounterModel}>
    <SubPage />
  </Provider>
}

// use model in sub component
function SubPage () {
  const counter = useModel(CounterModel);
  return <div>
    count: {counter.value}
    <button onClick={counter.increase}>increase</button>
  </div>;
}
```

Models also accepts initial values

```typescript
function CounterModel(initValue) {
  const [value, setValue] = useState(initValue);
  return { value, setValue };
}

function App() {
  // put initial value to args
  return <Provider model={CounterModel} args={1}>
    <SubPage />
  </Provider>
}

function SubPage () {
  const counter = useModel(CounterModel);
  return <div>
    count: {counter.value}
    <button onClick={counter.increase}>increase</button>
  </div>;
```

You can also use it in old react classes

```typescript
import { Consumer, withModel } from '@necolo/react-state';

// use consumer in class to visit models 
class SubClassPage extends React.Component {
  public render () {
    return <Consumer model={CounterStore}>
      {(counter) => <div>{counter.value}</div>}
    </Consumer>;
  }
}
// or use HOC to wrap class and visit models from props
const SubClassPage2 = withModel({counter: CounterStore}, class extends React.Component {
  public render () {
    const counter = this.props.counter;
    return <div>{counter.value}</div>;
  }
})
```

You can use `Providers` to register multiple models without nested them as hell.

```typescript
import { Providers } from '@necolo/react-state';

function App () {
  return <Providers models={[
    { model: CounterModel },
    { model: SomeOtherModel, args: {}, memo: true }, // with more configs
  ]}>
    <SubPage />
  </Providers>
}

// it's same as
function App() {
  return <Provider model={CounterModel}>
    <Provider model={SomeOtherModel} args={{}} memo>
      <SubPage />
    </Provider>
  </Provider>
}
```