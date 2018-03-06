`js`是如何工作的，这里主要是针对典型的`chrome v8`来阐述。

他主要是由两个部分组成`Memory Heap`和`Call Stack`。

- `Memory Heap`

这个就是内存分配发生的地方。

- `Call Stack`

这个是一个调用栈。所有要执行的都会放在这个调用栈里(栈都是先进后出).

因为是单线程的，所以是一个个的执行下去。

正常情况下，一个函数开始，会把这个函数放入`Call Stack`执行。

那么非正常情况呢？比如一些异步操作，例如`setTimeout`.

`setTimeout`是属于`Web Apis`,他不会被自动(`自动`会在下面解释)加入到`Callback Queue (Event Queue)`以及`Call Stack`.
他会有个计时，等待计时结束之后，才会将其放入到`Callback Queue`,等待`Call Stack`清空之后(放在调用栈末尾)，才会自动加入到`Call Stack`执行。

下面我们来说说`自动`. 其实这个`自动`就是`Event Loop`的功能，他一直在轮训事件，类似一个永动机似的。

![how does js work](https://github.com/xiaohesong/TIL/blob/master/assets/front-end/imgs/js-work.gif)



- 参考链接
  - [How JavaScript works: Event loop and the rise of Async programming + 5 ways to better coding with async/await](https://blog.sessionstack.com/how-javascript-works-event-loop-and-the-rise-of-async-programming-5-ways-to-better-coding-with-2f077c4438b5)
  - [js中的event loop](https://anhuiliujun.github.io/javascript/2017/02/17/js-event-loop.html)
