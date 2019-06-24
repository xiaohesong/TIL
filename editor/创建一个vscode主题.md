# Creating a VS Code Theme

对于代码编辑器，每个人都有自己独特的品味。从字面上看，有成千上万的主题在那里，而且理由很充分:对一个人来说，美丽和提高生产力的东西可能会成为另一个人的阻碍。

这是我清单上的一项，用来创建我自己的主题。一天晚上，我写代码写得很晚，一直写到凌晨。我家里的每个人都在睡觉，所以，像往常一样，唯一的光亮就是我的屏幕。我知道这样写代码不一定是健康的，但这确实是我最高效的时间:很少有干扰，我不处理工作、家庭、朋友或其他的事情。我可以更专注。

我对我一直在使用的主题设置了一些偏好，尽管它们在白天或飞机上都运行得很好，但我总觉得在深夜编程上会缺少一些东西。我决定是时候来创作我自己的主题了。

我们将首先讨论创建主题的一般过程，好让你创建自己的主题，然后我们将深入研究我的一些研究和测试，以了解这个过程。

### Fire It Up

在执行任何操作之前，你将安装vsce（Visual Studio Code Extensions的简称）并将自己建立为发布者。这样做的[所有说明都在这里](https://aka.ms/U8bd2v)。我知道它看起来很多，但它需要5-10分钟，然后你就再也不用做它了，对于你创建的任何扩展。

既然你已经掌握了这一点，那么这就是你开始工作所需的步骤。

首先，你需要去运行：

```shell
npm install -g yo generator-code
```

这使得生成器在你的机器上全局可用（这意味着你现在可以在任何目录中创建主题）。然后，你可以执行此命令来启动主题：

```shell
yo code
```

屏幕将显示如下所示的提示：

![yeoman code generator welcome in terminal](https://css-tricks.com/wp-content/uploads/2018/05/Screen-Shot-2018-05-19-at-12.59.30-PM.png)

> 注意，我使用这里的箭头导航到“New Color Theme”选项。还请注意，这是你希望进行任何其他扩展的方式。

选择此选项时，它会询问这是一个新主题，还是要从现有主题导入。我们想要创建一个新的。

![beginning prompt in terminal](https://css-tricks.com/wp-content/uploads/2018/05/Screen-Shot-2018-05-19-at-1.00.57-PM.png)

接下来，你将不得不回答其他一些问题，包括：

- 扩展名是什么？
- 标识符是什么?(我只是用了这个名字，这可能很典型。)
- 描述是什么? 我最初只是把一些愚蠢的东西放进去。别担心，你可以在将来的`package.json`中更新它。
- 出版商叫什么名字?(参见前面的说明。)
- 应该向用户显示什么名称?(我使用了与扩展名相同的名称。)
- 这个主题是暗的，亮的，还是高对比度的?

它将为你设置一个基本主题，以开始为你的颜色首选项设置外观。完整的独家新闻和[所有细节都在这里](https://aka.ms/Wa8ujj)。关于[主题的更多细节](https://aka.ms/Cg43ed)一般在这里。

### Test Drive

我们有了基本主题，也有了调色板的一些概念。那么，我们如何进行测试呢? 当你用你的主题打开目录时，你可以在Mac上按`fn + f5`(或者只在Windows上按`f5`)，一个新的窗口会立即弹出，你可以在那里测试你的主题! 你将在原来的主题窗口中看到现在有一个小的控制面板，你可以在其中重新加载、暂停和停止。在你做之前别忘了保存!

![controls for editor](https://css-tricks.com/wp-content/uploads/2018/05/Screen-Shot-2018-05-20-at-6.03.24-PM.png)

好的，既然你打开了另一个窗口，点击`Command + Shift + P`来获取命令资源管理器。在那里输入“Developer: Inspect TM Scopes”，你会看到一个提示，允许你查看所有的标签和属性：它会告诉你他们的颜色，他们的字体样式，以及你需要如何定位它。

![what it looks like to inspect scopes in the new window](https://css-tricks.com/wp-content/uploads/2018/05/Screen-Shot-2018-05-20-at-6.05.00-PM.png)

不过，有一个问题。在编辑器中有很多东西是你不能定位的，因为VS代码会在你试图驱动编辑器的其余部分(即文件查看器、终端和搜索框)时解释它。以下是我发现的两种方法来找出其余的范围：

- [这个页面](https://aka.ms/P4x2ct)对于理解需要配置的一些基本内容非常有帮助。事实上，你可能想从其中的一些开始。
- 有DevTools !你可以像打开Chrome一样打开它们:`Command + Option + I`。我所做的是在计算样式中查找颜色，然后在文本编辑器中查找它们以针对它们。你将注意到DevTools中的默认值是RGBA，因此必须`Shift + click on the color`来更改它的格式，直到得到等效的十六进制值。然后，我可以扫描主题json中的匹配颜色，直到找到匹配的值并更改它。

#### Another Small Tip!

当我第一次开始开发这个主题时，我想我应该尝试以创建其他人的主题为起点。我试过[Wes Bos' Cobalt Two](https://aka.ms/Cquk4n)。虽然我最终没有使用它，但我发现他有一个很有价值的东西，那就是一个演示目录，里面有各种不同语言的示例。我开始移动他，但很快意识到文件不够长，不足以满足我的测试需求。所以我创造了自己的这个。在纠正人们提交的问题的过程中，我还创建了一个React无状态功能组件示例，一个Ruby的示例，当然,我创建了一个.vue单一文件组件😀这也有助于维护,因为如果人们看到一个问题在文件类型我之前没有测试,他们可以PR文件到演示目录,我可以针对他们所看到的。它使复制和测试变得非常简单。

### Research

研究代码主题?这不是太过分了吗?可能!但我真的很好奇:对于绝大多数人来说，什么是最适合阅读的，同时又能让我喜欢的东西?

#### Color and contrast

第一步是考虑可访问性。我一直喜欢[solarized 主题](http://ethanschoonover.com/solarized#features)如何使易读性成为他们调色板的中心主题。我读过关于颜色保留和可访问性的文章，结果发现[男性有很高的色盲发病率](https://www.allaboutvision.com/conditions/colordeficiency.htm)(男性约8%，女性1%)。大多数程序员都是男性，所以尽管我不是色盲，但至少在一定程度上围绕包括色盲者在内的人来设计主题是不需要动脑筋的。最典型的是红色/绿色缺陷，所以我找到了一些很好的方法来测试[我最喜欢](http://www.color-blindness.com/coblis-color-blindness-simulator/)的，非常有趣，一个小手册。

我开始测试随机的图像，看看我是否能识别出匹配的模式。我在测试时注意到的一件事是补色在所有测试中都表现得最好。但是，如果需要同时测试三种颜色，则三元组颜色组合物也产生良好的结果。

如果您不熟悉颜色关系，[Adobe Color CC](https://color.adobe.com/)（以前的Kuler）可以更容易地进行可视化，甚至可以直接在编辑器中创建调色板。

![complimentary color palette](https://css-tricks.com/wp-content/uploads/2018/05/compliment.png)

![triad color palette](https://css-tricks.com/wp-content/uploads/2018/05/triad.png)

![analagous color palette](https://css-tricks.com/wp-content/uploads/2018/05/analgous.png)

知道一种颜色只是与另一种颜色相关联的一种颜色是非常重要的。这也是制作色彩主题如此困难的原因之一。颜色不是静态的，而是关系化的。在可访问性方面，你可能对这个有点熟悉。黑色上的浅绿色可能是可访问的，但是当你将其更改为白色背景时，它就不再是可访问的了。

![img](https://css-tricks.com/wp-content/uploads/2016/09/context-color.jpg)

可以使用许多工具测量颜色的可访问性。以下是我的一些最爱：

- [Colorable](http://jxnblk.com/colorable/demos/text/)
- [Text on a background image a11y check](http://www.brandwood.com/a11y/)
- [Contrast-A](http://dasplankton.de/ContrastA/)
- [Accessible Colors](http://accessible-colors.com/)

从一开始就为可访问性设置调色板也是非常好的。[Color Safe](http://colorsafe.co/)是一个伟大的工具，帮助这一点。

我在这篇文章中介绍了有关颜色和感知的更多细节：[A Nerd's Guide to Color on the Web.](https://css-tricks.com/nerds-guide-color-web/)。

#### 原文：[Creating a VS Code Theme](https://css-tricks.com/creating-a-vs-code-theme/)

