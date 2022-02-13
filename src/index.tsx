import React, {
  useEffect,
  useContext,
  useState,
  useRef,
  useDebugValue,
  PropsWithChildren,
  ReactElement,
} from 'react';

interface Model<P extends any[] = any[], V = any> {
  (...args: P): V;
  context?: React.Context<Container<V>>;
}
type ModelP<S extends Model> = S extends Model<infer P, any> ? P : never;
type ModelV<S extends Model> = S extends Model<any, infer V> ? V : never;

interface ProviderProps<M extends Model> {
  model: M;
  args?: ModelP<M>;
  memo?: boolean; // like React.memo, without memo it will always re-render
  modelRef?: React.MutableRefObject<ModelV<M>>;
}

type Subscriber = () => void;
class Container<V> {
  private subscribers = new Set<Subscriber>();
  constructor(public state?: V) {}

  public notify() {
    this.subscribers.forEach((sub) => sub());
  }

  public sub(sub: Subscriber) {
    this.subscribers.add(sub);
  }

  public unsub(sub: Subscriber) {
    this.subscribers.delete(sub);
  }
}

const Processor = React.memo(
  (props: {
    onChange: (v: ModelV<Model>) => void;
    model: Model;
    args?: ModelP<Model>;
    memo?: boolean;
  }) => {
    const args = props.args || [];
    const result = props.model(...args);
    useEffect(() => {
      props.onChange(result);
    });
    return null;
  },
  (prevProps, nextProps) => {
    if (!nextProps.memo) {
      return false;
    }
    if (prevProps.args === nextProps.args) {
      return true;
    }
    return isEquals(prevProps.args || [], nextProps.args || []);
  }
);

function Provider<M extends Model, V extends ModelV<M>>(
  props: PropsWithChildren<ProviderProps<M>>
) {
  const containerRef = useRef<Container<V>>();
  if (!containerRef.current) {
    containerRef.current = new Container();
  }
  const container = containerRef.current;

  const Context = getModelContext(props.model, container);
  const [isReady, setReady] = useState(false);

  const onChange = (value: V) => {
    if (!isReady) {
      setReady(true);
    }
    container.state = value;
    if (props.modelRef) {
      props.modelRef.current = value;
    }
    container.notify();
  };

  return (
    <Context.Provider value={container}>
      <Processor
        onChange={onChange}
        model={props.model}
        args={props.args}
        memo={props.memo}
      />
      {isReady && props.children}
    </Context.Provider>
  );
}

function getModelContext<M extends Model, V extends ModelV<M>>(
  model: Model,
  container?: Container<V>
) {
  if (model.context) {
    return model.context;
  }
  const context = React.createContext<Container<V>>(
    container || new Container()
  );
  model.context = context;
  return context;
}

type Deps<T> = (v: T) => unknown[];
function useModel<M extends Model, V extends ModelV<M>>(
  model: M,
  deps?: Deps<V>
) {
  useDebugValue(model.name);
  const container = useContext(getModelContext(model)) as Container<V>;
  const [state, setState] = useState(container.state);
  const depsRef = useRef<unknown[]>([]);

  useEffect(() => {
    const subscriber = () => {
      if (!deps) {
        setState(container.state);
      } else {
        const oldDeps = depsRef.current;
        const newDeps = deps(container.state as V);
        if (newDeps.length && !isEquals(oldDeps, newDeps)) {
          setState(container.state);
        }
        depsRef.current = newDeps;
      }
    };
    container.sub(subscriber);
    return () => {
      container.unsub(subscriber);
    };
  }, []);

  if (!state) {
    throw new Error(`The model ${model.name} is not initialized.`);
  }

  return state;
}

function isEquals(v1: unknown[], v2: unknown[]) {
  if (v1.length !== v2.length) {
    return false;
  }
  return v1.every((v, i) => v === v2[i]);
}

function Providers(props: {
  models: ProviderProps<Model<any[]>>[];
  children: React.ReactNode;
}) {
  return props.models.reverse().reduce((children, providerProps) => {
    return <Provider {...providerProps}>{children}</Provider>;
  }, props.children) as JSX.Element;
}

// for old classes use model
function withModel(
  models: { [name: string]: Model },
  Component: React.ComponentType<any>
) {
  return function (props) {
    const modelList = {};
    for (let i = 0, keys = Object.keys(models); i < keys.length; i++) {
      const name = keys[i];
      // tslint:disable-next-line: react-hooks-nesting
      const model = useModel(models[name]);
      modelList[name] = model;
    }
    const _props = {
      ...modelList,
      ...props,
    };
    return <Component {..._props} />;
  };
}

function Consumer<M extends Model>(props: {
  model: M;
  deps?: Deps<ModelV<M>>;
  children: (model: ModelV<M>) => React.ReactNode;
}) {
  const model = useModel(props.model);
  return props.children(model) as ReactElement;
}

export { Provider, Providers, useModel, Consumer, withModel };
