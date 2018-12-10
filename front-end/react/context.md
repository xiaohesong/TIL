这里主要是记录下老版本的`context`的用法。目前的[版本`16.x`的用法官网](https://reactjs.org/docs/context.html)写的很详细。

## 16.x版本的Context

```js
// FileContext.js
import React from 'react';

export const FileContext = React.createContext('fileContext');
```

```js
//main.js
import { FileContext } from  './FileContext';
export default class Main extends React.Component {
  render() {
    const fileName = 'a-file'
    <FileContext.Provider value = {fileName} >
      // do smt, include Show Component(<Show />)
    </FileContext.Provider>
  }
}
```

```js
//Show.js
import {FileContext} from './FileContext';
export default class Show extends React.Component {
  render() {
    <FileContext.Consumer >
      {
        (fileName) => //do smt, this fileName is from main context  
      }
    </FileContext.Consumer>
  }
}
```
上面的就是目前`16.x`版本的用法，下面来看看之前的`context`如何使用。

## 旧版的context
```js
// main.js
import React from 'react';
import { PropTypes } from 'prop-types';

export default class Main extends from React.Component {
  render() {
    // do smt, include foo component, likes: <Foo />
  }
}

Main.childContextTypes = {
  fileNmae: PropTypes.string
};
```

```js
// foo.js
import React from 'react';
import { PropTypes } from 'prop-types';

export default class Foo extends React.Component {
  constructor(props, context){
    super(props, context)
    console.log('context is --', context)
  }

  render() {
    return(<h1>Hi, {this.props.context}</h1>)
  }
}

Foo.contextTypes = {
  fileName: PropTypes.string
};
```

然后会发现`fileName`在`context`内。

具体的内容还[请看`API`](https://reactjs.org/docs/legacy-context.html)
