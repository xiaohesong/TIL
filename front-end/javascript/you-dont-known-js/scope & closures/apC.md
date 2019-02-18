# You Don't Know JS: Scope & Closures

# Appendix C: Lexical-this

虽然这个标题没有详细讨论`this`机制，但是有一个ES6主题以一种重要的方式将`this`与词法作用域联系起来，我们将很快研究。

ES6添加了一种特殊的函数声明形式，称为“箭头函数”。它看起来像这样：

```js
var foo = a => {
	console.log( a );
};

foo( 2 ); // 2
```

所谓的“胖箭头”经常被提到作为 *繁琐冗长*（讽刺）`function`关键字的简写。

但是箭头函数还有一个更重要的方面，它与在声明中少敲几下键盘无关。

简而言之，这段代码遇到了一个问题：

```js
var obj = {
	id: "awesome",
	cool: function coolFn() {
		console.log( this.id );
	}
};

var id = "not awesome";

obj.cool(); // awesome

setTimeout( obj.cool, 100 ); // not awesome
```

问题是在`cool()`函数上丢失了`this`绑定。有各种方法可以解决这个问题，但一个经常重复的解决方案是`var self = this;`。

可能看起来像这样：

```js
var obj = {
	count: 0,
	cool: function coolFn() {
		var self = this;

		if (self.count < 1) {
			setTimeout( function timer(){
				self.count++;
				console.log( "awesome?" );
			}, 100 );
		}
	}
};

obj.cool(); // awesome?
```

在这里没有太多的杂草，`var self = this;`"解决方案"只是省去了理解和正确使用`this`绑定的整个问题，而是回到了我们可能更舒服的事情：词法作用域。`self`只是一个可以通过词法作用域和闭包解析的标识符，而不关心`this`绑定沿途发生了什么。

人们不喜欢写冗长的东西，特别是当他们一遍又一遍地做。因此，ES6的动机是帮助缓解这些情景，并确实 *解决* 常见的习语问题，例如这个问题。

ES6解决方案，即箭头函数，引入了一种称为“词法 this”的行为。

```js
var obj = {
	count: 0,
	cool: function coolFn() {
		if (this.count < 1) {
			setTimeout( () => { // arrow-function ftw?
				this.count++;
				console.log( "awesome?" );
			}, 100 );
		}
	}
};

obj.cool(); // awesome?
```

简短的解释是，当涉及到`this`的绑定时，箭头函数根本不像正常函数那样表现。对于`this`绑定，它们放弃了所有正常规则，而是采用它们直接的词法封闭作用域的`this`值，无论它是什么。

因此，在该片段中，箭头函数不会以某种不可预测的方式将`this`解除绑定，它只是“继承”了`cool()`函数的`this`绑定（如果我们如图所示调用它，这是正确的！）。

虽然这会缩短代码，但我的观点是，箭头函数实际上只是将开发人员常犯的一个错误编码到语言语法中，这混淆了“this绑定”规则与“词法作用域”规则。

换句话说：为什么要使用`this`风格编码范例来解决问题和冗长，只是通过将它与词法作用域混合来将其剪掉就好。对于任何给定的代码片段，接受一种方法或另一种方法似乎很自然，而不是将它们混合在同一段代码中。

**注意：** 箭头函数的另一个缺点是它们是匿名的，没有命名。参见第3章，了解为什么匿名函数不如命名函数可取的原因。

在我看来，对于这个“问题”，更合适的方法是正确使用和接受`this`机制。

```js
var obj = {
	count: 0,
	cool: function coolFn() {
		if (this.count < 1) {
			setTimeout( function timer(){
				this.count++; // `this` is safe because of `bind(..)`
				console.log( "more awesome" );
			}.bind( this ), 100 ); // look, `bind()`!
		}
	}
};

obj.cool(); // more awesome
```

无论你喜欢新的词法 - 箭头函数的这种行为，还是你更喜欢久经考验的`bind()`，重要的是要注意箭头函数 **不** 仅仅是减少“函数”的输入。

他们有一种 *有意识的行为差异* ，我们应该学习和理解，如果我们这样选择，就可以利用。

现在我们完全理解词法作用域（和闭包！），理解 词法-this 应该是轻而易举的！