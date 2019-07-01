在使用这两货的时候，总感觉差不多。查了点资料，发现还是有细微的不同之处。

### 相同点

先来看一个相同点。

- 声明对象

他们都可以声明一个对象(函数等)。

```ts
interface Song1 {
  song: string,
}

type Song2 = {
  song: string
}

type Func1 = () => void

interface Func2 {
  func2: () => void
}
```

- 继承

```ts
interface Friend {
  girl: number
}

interface Own extends Friend {
  boy: number
}

type Name = { 
  name: string; 
}
type User = Name & { age: number  };
```

### 不同点

细心的你可能已经发现，上面说声明对象。 那么基本类型呢？

typescript语言规范里有那么一句话：

> Unlike an interface declaration, which always introduces a named object type, a type alias declaration can introduce a 
> name for any kind of type, including primitive, union, and intersection types.

说的也很明显，不像interface声明，interface总是采用命名的对象类型。type声明可以为任何种类的类型采用。比如基本类型，union和intersection类型。

还有一个不同点，那就是`interface`声明可以有多个[合并性声明](https://www.typescriptlang.org/docs/handbook/declaration-merging.html), 但
是type就不可以。

你再看看下面的这个图：
![](https://raw.githubusercontent.com/xiaohesong/TIL/master/assets/front-end/imgs/ts-type-different-interface.jpg)

参考地址：
> [stackoverflow: Typescript: Interfaces vs Types](https://stackoverflow.com/questions/37233735/typescript-interfaces-vs-types)
>
> [TypeScript Type vs Interface](https://www.educba.com/typescript-type-vs-interface/)
