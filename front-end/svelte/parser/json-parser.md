## 写一个解析器-JavaScript的JSON解析器

JSON也是一种语言，他有自己的语法，你可以参考下json的[规范](https://www.json.org/json-en.html)。编写JSON解析器所需的知识和技术可以转换为编写JS解析器。

所以，先开始来写一个JSON解析器。

### 理解语法grammar

如果你刚才看了[规范页面](https://www.json.org/json-en.html)，那里有2个图解：

- 左边的[语法图(或叫铁路图)](https://en.wikipedia.org/wiki/Syntax_diagram)

  ![https://www.json.org/img/object.png](https://www.json.org/img/object.png)

- 右边是[McKeeman形式](https://www.crockford.com/mckeeman.html)，[Backus–Naur form(BNF)](https://en.wikipedia.org/wiki/Backus–Naur_form)的变体

```json
json
  element

value
  object
  array
  string
  number
  "true"
  "false"
  "null"

object
  '{' ws '}'
  '{' members '}'
...
 ...
```

这两个图是等价的。

一个是可视的，另一个是基于文本的。通常将基于文本语法的语法(grammar syntax)Backus-Naur Form馈送到另一个解析器，该解析器对该语法进行解析并为其生成一个解析器。 说到解析器接收！ 

作为刚接触的，可能会第一想法就是使用这个可视化的线路图作为一个参照。

![https://www.json.org/img/object.png](https://www.json.org/img/object.png)

这是JSON中"**object**"的语法。

从左到右的走这个语法图。

像 `{`, `,`, `:`, `}`这些，是字符，`whitespace`, `string`, 和 `value`是另外一种语法的占位符。因此，要解析"whitespace"，我们需要查看" **whitepsace** "的语法。

因此，从左边开始，对于一个对象，第一个字符必须是一个左花括号`{`。然后有两种情况：

- `whitespace` → `}` → 结束
- `whitespace` → `string` → `whitespace` → `:` → `value` → `}` → 结束

当然，当你碰到一个`value`时，你可以选择去：

- → `}` → 结束
- → `,` → `whitespace` → … → `value`

你可以一直这样的循环，但是最终都要结束：

- → `}` → 结束

### 实现解析器

从下面这样的结构开始处理

```js
function fakeParseJSON(str) {
  let i = 0;
  // TODO
}
```

我们初始化`i`作为当前字节的索引，当`i`到达`str`结束时，我们将立即结束。

来实现一个**object** 的语法：

```js
function fakeParseJSON(str) {
  let i = 0;
  function parseObject() {
    if (str[i] === '{') {
      i++;
      skipWhitespace();

      // if it is not '}',
      // we take the path of string -> whitespace -> ':' -> value -> ...
      while (str[i] !== '}') {
        const key = parseString();
        skipWhitespace();
        eatColon();
        const value = parseValue();
      }
    }
  }
}
```

在`parseObject`中，我们将调用其他语法的解析，例如"string"和"whitespace"，当我们实现它们时，一切都会起作用。

在这里，忘记了添加逗号(`,`)。`,`预示着要开始下一个循环。

基于上面的部分，添加了下面的一些代码：

```diff
function fakeParseJSON(str) {
  let i = 0;
  function parseObject() {
    if (str[i] === '{') {
      i++;
      skipWhitespace();

+     let initial = true; 
      // if it is not '}',
      // we take the path of string -> whitespace -> ':' -> value -> ...
      
      while (str[i] !== '}') {
+       if (!initial) {      
+         eatComma();
+         skipWhitespace();
+       }

        const key = parseString();
        skipWhitespace();
        eatColon();
        const value = parseValue();
+       initial = false;      
      }
      // move to the next character of '}'
      i++;
    }
  }
}
```

一些命名约定：

- 当我们基于语法解析代码并使用返回值时，我们命名`parseSomething`
- 当我们期望字符存在那里，但是不使用这些字符，命名成`eatSomething`
- 当字符不存在的时候，命名成`skipSomething`

实现`eatComma`和`eatColon`:

```js
function fakeParseJSON(str) {
  // ...
  function eatComma() {
    if (str[i] !== ',') {
      throw new Error('Expected ",".');
    }
    i++;
  }

  function eatColon() {
    if (str[i] !== ':') {
      throw new Error('Expected ":".');
    }
    i++;
  }
  
  function skipWhitespace() {
    while (
      str[i] === " " ||
      str[i] === "\n" ||
      str[i] === "\t" ||
      str[i] === "\r"
    ) {
      i++;
    }
  }
  
}
```

已经完成了`parseObject`语法的实现，但是这个解析函数的返回值是什么呢?

所以，需要返回一个js对象：

```diff
function fakeParseJSON(str) {
  let i = 0;
  function parseObject() {
    if (str[i] === '{') {
      i++;
      skipWhitespace();

+     const result = {};

      let initial = true;
      // if it is not '}',
      // we take the path of string -> whitespace -> ':' -> value -> ...
      while (str[i] !== '}') {
        if (!initial) {
          eatComma();
          skipWhitespace();
        }
        const key = parseString();
        skipWhitespace();
        eatColon();
        const value = parseValue();
+       result[key] = value;
        initial = false;
      }
      // move to the next character of '}'
      i++;

+     return result;
    }
  }
}
```

既然你已经看到了我实现对象语法的过程，现在是时候尝试一下数组语法了：

![https://www.json.org/img/array.png](https://www.json.org/img/array.png)

```js
function fakeParseJSON(str) {
  // ...
  function parseArray() {
    if (str[i] === '[') {
      i++;
      skipWhitespace();

      const result = [];
      let initial = true;
      while (str[i] !== ']') {
        if (!initial) {
          eatComma();
        }
        const value = parseValue();
        result.push(value);
        initial = false;
      }
      // move to the next character of ']'
      i++;
      return result;
    }
  }
}
```

现在，看一个更有趣的语法，"value"：

![https://www.json.org/img/value.png](https://www.json.org/img/value.png)

他是以一个"whitespace"开始，然后是任何可能的值：“string”, “number”, “object”, “array”, “true”, “false” or “null”,然后以"whitespace"来结束。

```js
function fakeParseJSON(str) {
  // ...
  function parseValue() {
    skipWhitespace();
    const value =
      parseString() ??
      parseNumber() ??
      parseObject() ??
      parseArray() ??
      parseKeyword('true', true) ??
      parseKeyword('false', false) ??
      parseKeyword('null', null);
    skipWhitespace();
    return value;
  }
}
```

`??`是[nullish coalescing operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator)。

`parseKeyword`将检查当前的`str.slice(i)`是否与关键字字符串匹配，如果匹配，它将返回关键字值。

这就是`parseValue`。

看下面具体的实现：

```js
function fakeParseJSON(str) {
  let i = 0;

  return parseValue();

  function parseObject() {
    if (str[i] === "{") {
      i++;
      skipWhitespace();

      const result = {};

      let initial = true;
      // if it is not '}',
      // we take the path of string -> whitespace -> ':' -> value -> ...
      while (str[i] !== "}") {
        if (!initial) {
          eatComma();
          skipWhitespace();
        }
        const key = parseString();
        skipWhitespace();
        eatColon();
        const value = parseValue();
        result[key] = value;
        initial = false;
      }
      // move to the next character of '}'
      i++;

      return result;
    }
  }

  function parseArray() {
    if (str[i] === "[") {
      i++;
      skipWhitespace();

      const result = [];
      let initial = true;
      while (str[i] !== "]") {
        if (!initial) {
          eatComma();
        }
        const value = parseValue();
        result.push(value);
        initial = false;
      }
      // move to the next character of ']'
      i++;
      return result;
    }
  }

  function parseValue() {
    skipWhitespace();
    const value =
      parseString() ??
      parseNumber() ??
      parseObject() ??
      parseArray() ??
      parseKeyword("true", true) ??
      parseKeyword("false", false) ??
      parseKeyword("null", null);
    skipWhitespace();
    return value;
  }

  function parseKeyword(name, value) {
    if (str.slice(i, i + name.length) === name) {
      i += name.length;
      return value;
    }
  }

  function skipWhitespace() {
    while (
      str[i] === " " ||
      str[i] === "\n" ||
      str[i] === "\t" ||
      str[i] === "\r"
    ) {
      i++;
    }
  }

  function parseString() {
    if (str[i] === '"') {
      i++;
      let result = "";
      while (str[i] !== '"') {
        if (str[i] === "\\") {
          const char = str[i + 1];
          if (
            char === '"' ||
            char === "\\" ||
            char === "/" ||
            char === "b" ||
            char === "f" ||
            char === "n" ||
            char === "r" ||
            char === "t"
          ) {
            result += char;
            i++;
          } else if (char === "u") {
            if (
              isHexadecimal(str[i + 2]) &&
              isHexadecimal(str[i + 3]) &&
              isHexadecimal(str[i + 4]) &&
              isHexadecimal(str[i + 5])
            ) {
              result += String.fromCharCode(
                parseInt(str.slice(i + 2, i + 6), 16)
              );
              i += 5;
            }
          }
        } else {
          result += str[i];
        }
        i++;
      }
      i++;
      return result;
    }
  }

  function isHexadecimal(char) {
    return (
      (char >= "0" && char <= "9") ||
      (char.toLowerCase() >= "a" && char.toLowerCase() <= "f")
    );
  }

  function parseNumber() {
    let start = i;
    if (str[i] === "-") {
      i++;
    }
    if (str[i] === "0") {
      i++;
    } else if (str[i] >= "1" && str[i] <= "9") {
      i++;
      while (str[i] >= "0" && str[i] <= "9") {
        i++;
      }
    }

    if (str[i] === ".") {
      i++;
      while (str[i] >= "0" && str[i] <= "9") {
        i++;
      }
    }
    if (str[i] === "e" || str[i] === "E") {
      i++;
      if (str[i] === "-" || str[i] === "+") {
        i++;
      }
      while (str[i] >= "0" && str[i] <= "9") {
        i++;
      }
    }
    if (i > start) {
      return Number(str.slice(start, i));
    }
  }

  function eatComma() {
    if (str[i] !== ",") {
      throw new Error('Expected ",".');
    }
    i++;
  }

  function eatColon() {
    if (str[i] !== ":") {
      throw new Error('Expected ":".');
    }
    i++;
  }
}

```

现在就实现了所有的语法。

### 处理unexpected输入

处理两种常见的错误：

- Unexpected token
- Unexpected end of string

##### Unexpected token



##### Unexpected end of string

循环里都有个判断，譬如下面这个

```js
function fakeParseJSON(str) {
  // ...
  function parseObject() {
    // ...
    while(str[i] !== '}') {
```

我们需要确保不要访问超出字符串长度的字符。在本例中，当字符串意外结束，而我们仍在等待结束字符`}`时，就会发生这种情况:

```diff
function fakeParseJSON(str) {
  // ...
  function parseObject() {
    // ...
+   while (i < str.length && str[i] !== '}') {      
+			// ...
+   }

+   checkUnexpectedEndOfInput();
    // move to the next character of '}'
    i++;

    return result;
  }
}
```

### 多做一些事

##### 错误代码和标准的错误消息

下面这些是有用的关键字，会帮助用户出错之后去google定位。

```js
// instead of
Unexpected token "a"
Unexpected end of input

// show
JSON_ERROR_001 Unexpected token "a"
JSON_ERROR_002 Unexpected end of input
```

##### 更好的查看哪里出了问题

像Babel这样的解析器，将向您显示一个代码框架，带有下划线、箭头或突出显示错误的代码片段

```js
// instead of
Unexpected token "a" at position 5

// show
{ "b"a
      ^
JSON_ERROR_001 Unexpected token "a"
```

打印出代码片段：

```js
function fakeParseJSON(str) {
  // ...
  function printCodeSnippet() {
    const from = Math.max(0, i - 10);
    const trimmed = from > 0;
    const padding = (trimmed ? 3 : 0) + (i - from);
    const snippet = [
      (trimmed ? '...' : '') + str.slice(from, i + 1),
      ' '.repeat(padding) + '^',
      ' '.repeat(padding) + message,
    ].join('\n');
    console.log(snippet);
  }
}
```

##### 错误修正的建议

如果可能的话，解释出了什么问题，并给出解决问题的建议

```js
// instead of
Unexpected token "a" at position 5

// show
{ "b"a
      ^
JSON_ERROR_001 Unexpected token "a".
Expecting a ":" over here, eg:
{ "b": "bar" }
      ^
You can learn more about valid JSON string in http://goo.gl/xxxxx
```

如果可能，根据解析器目前收集的上下文提供建议

```js
fakeParseJSON('"Lorem ipsum');

// instead of
Expecting a `"` over here, eg:
"Foo Bar"
        ^

// show
Expecting a `"` over here, eg:
"Lorem ipsum"
```

参考：[JSON Parser with JavaScript](https://lihautan.com/json-parser-with-javascript/)

