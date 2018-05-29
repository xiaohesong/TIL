### [结构赋值](https://leanpub.com/understandinges6/read#leanpub-auto-destructuring-for-easier-data-access)

- 默认值

```javascript
let {a, b = 'b'} = {a: 'a'}
```

- 别名

```javascript
let node = {
        type: "Identifier",
        name: "foo"
    };

let { type: localType, name: localName } = node;

```

- 别名设置默认值

```javascript
let node = {
        type: "Identifier"
    };

let { type: localType, name: localName = "bar" } = node;
```
