触发事件有很多种方法

- html attribute

```html
<input value="Click me" onclick="alert('Click!')" type="button">
```

js逻辑在属性里创建，不是很好，写到一个方法里.

```html
<script>
  function countRabbits() {
    for(let i=1; i<=3; i++) {
      alert("Rabbit number " + i);
    }
  }
</script>

<input type="button" onclick="countRabbits()" value="Count rabbits!">
```

因为html属性不区分大小写，所以你onClick可以随你写，ONCLICK, onCLICK, 最好是onclick.

- dom property

```html
<input id="elem" type="button" value="Click me">
<script>
  elem.onclick = function() {
    alert('Thank you');
  };
</script>
```

这个方式直接在dom上绑定，上面的html-attribute是浏览器读取他创建函数对象写入dom中。

**处理程序始终位于dom property中：html attribute 只是初始化它的一个方法，并且也不被推荐**

并且如果html attributre 存在事件绑定，并且dom也存在事件绑定，相同的事件将被dom中的给替代。

dom绑定的一些写法.
```html
<input id="elem" type="button" value="Click me">
<script>
  //1
  elem.onclick = function() {
    alert('Thank you');
  }; 
  
  //2
  function thank() {
    alert('thank you')
  }
  elem.onclick = thank;
</script>

// 但是如果是input中也是不同的。
<input id="elem" type="button" value="Click me" onclick="thank()">
```

- addEventListener

```html
<button id="elem">Click me</button>

<script>
  elem.addEventListener('click', {
    handleEvent(event) {
      alert(event.type + " at " + event.currentTarget);
    }
  });
</script>
```

上面的方法使用到了`handleEvent`, 如果发生事件，handleEvent会被调用。

也可以那么说，当addEventListener接收到处理程序对象时，事件会去调用`object.handleEvent(event)`。

如下，很实用的方法.

```html
<button id="elem">Click me</button>

<script>
  class Menu {
    handleEvent(event) {
      // mousedown -> onMousedown
      let method = 'on' + event.type[0].toUpperCase() + event.type.slice(1);
      this[method](event);
    }

    onMousedown() {
      elem.innerHTML = "Mouse button pressed";
    }

    onMouseup() {
      elem.innerHTML += "...and released.";
    }
  }

  let menu = new Menu();
  elem.addEventListener('mousedown', menu);
  elem.addEventListener('mouseup', menu);
</script>
```

`handleEvent`这个方法真是让我对事件的认知增加了不少。
