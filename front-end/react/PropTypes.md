### PropTypes: 实例的校验

```js
class Model {}

function TypeComp(props) {
    return <div>{props.modelProp.name}</div>
}

TypeCompo.defaultProps = {
    modelProp:new Model()    
}

TypeComp.propsType = {
    modelProp: PropTypes.instanceOf(Model)
}
```

上面的`modelProp`必须是`Model`的实例。

### PropTypes: 具体值的校验

```js
function TypeComp(props) {
    return <div></div>
}
TypeCompo.defaultProps = {
    
}

TypeComp.propsType = {
    typeProps: PropTypes.oneOf(['News', 'Photos'])
}
```

这里`typeProps`值必须是`News`或`Photos`中的一个。

### PropsTypes: 多个类型的校验

```js
function TypeComp(props) {
    return <div></div>
}
TypeCompo.defaultProps = {
    optProp: " " || 0 || new Model()    
}

TypeComp.propsType = {
    optProp: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.instanceOf(Model)
    ])
}
```

`optProp`的类型可以是`string`,`number`或`Model`实例。

### PropTypes: Shape and Types validation

> 某种类型的数组

```js
function TypeComp(props) {
    return <div></div>
}
TypeCompo.defaultProps = {
    
}

TypeComp.propsType = {
    arrayOfProp: PropTypes.arrayOf(PropTypes.number),
}
```

`arrayOfProp`必须是一个数组类型，并且里面的值是数字类型。如果传递下面这样的，会抛出错误：

```js
<TypeComp arrayOfProp={[34,6,"34"]} />
```

> 某种类型的对象

```js
function TypeComp(props) {
    return <div></div>
}
TypeCompo.defaultProps = {
    
}

TypeComp.propsType = {
    objOfProp: PropTypes.objectOf(PropTypes.number),
}
```

这里的`objOfProp`必须是一个对象，并且对象的属性值必须是一个数字类型。

> 呈现特定的塑造

```js
function TypeComp(props) {
    return <div>Name: {props.shapeOfProp.name}, Age:{props.shapeOfProp.age}</div>
}
TypeCompo.defaultProps = {
    
}

TypeComp.propsType = {
    shapeOfProp: PropTypes.shape({
        name: PropTypes.string,
        age: PropTypes.number
    }),
}
```

所以我们必须传递这样的东西：

```js
<TypeComp shapeOfProp={{name:"nnamdi",age:20}}
```

如果像下面这样传递，将抛出错误：

```js
<TypeComp shapeOfProp={{name:"nnamdi",age:"20"}}
```

或者：

```js
<TypeComp shapeOfProp={{name:"nnamdi", rank:2}}
```

### PropTypes: 传递任何东西

```js
PropTypes.any.isRequired
```

### PropTypes: 必须要的验证

```js
PropTypes.string.isRequired // 必须提供string类型的prop

PropTypes.func.isRequired // 必须提供function类型的prop
```

### PropTypes: 自定义验证

```js
function TypeComp(props) {
    return <div></div>
}

TypeCompo.defaultProps = {
    
}

TypeComp.propsType = {
    customProp: function(props,propName,component) {
        if(!regex.test(props[propName])){
            return new Error(`Invalid prop passed to ${component}`)
        }
    }
}
```

参考： [官方文档](https://reactjs.org/docs/typechecking-with-proptypes.html)

原文：[Understanding React PropTypes - Type-Checking in React](https://blog.bitsrc.io/understanding-react-proptypes-type-checking-in-react-9648a62ce12e)

