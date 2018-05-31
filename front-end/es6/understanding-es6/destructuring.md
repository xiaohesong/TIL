### [结构赋值](https://leanpub.com/understandinges6/read#leanpub-auto-destructuring-for-easier-data-access)

##### object destructuring

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

- 嵌套的玩法

```javascript
let node = {
        type: "Identifier",
        name: "foo",
        loc: {
            start: {
                line: 1,
                column: 1
            },
            end: {
                line: 1,
                column: 4
            }
        }
    };

let { loc: { start }} = node;

console.log(start.line);        // 1
console.log(start.column);      // 1
```

##### array destructuring

```javascript
let users = ['xiaocai', 'xiaozhang', 'xiaohesong']
let [,,xhs] = users
console.log(xhs) //xiaohesong
```
