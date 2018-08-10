- 查询

  `getElementsBy*`和`querySelectorAll`的区别。

  - example1

    ```html
      <div>First div</div>

      <script>
        let divs = document.getElementsByTagName('div');
        alert(divs.length); // 1
      </script>

      <div>Second div</div>

      <script>
        alert(divs.length); // 2
      </script>
    ```
    
  - example2
    ```html
    <div>First div</div>

    <script>
      let divs = document.querySelectorAll('div');
      alert(divs.length); // 1
    </script>

    <div>Second div</div>

    <script>
      alert(divs.length); // 1
    </script>
    ```
    
    可以发现，`getElementsBy*`类似于动态，`querySelectorAll`是一个静态的检索。
