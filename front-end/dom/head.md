# HEAD

> 一个所有有可能进入document `<head>`的列表。

## 目录

- [最低要求](#最低要求)

- [elements](#elements)

- [Meta](#meta)

- [Link](#link)

- [Icons](#icons)

- [Social](#social)

  - [Facebook Open Graph](#facebook-open-graph)
  - [Twitter Card](#twitter-card)

  - [Twitter Privacy](#twitter-privacy)
  - [Schema.org](#schemaorg)
  - [Pinterest](#pinterest)
  - [Facebook Instant Articles](#facebook-instant-articles)
  - [OEmbed](#oembed)

- [Browsers / Platforms](#browsers--platforms)

  - [Apple iOS](#apple-ios)
  - [Google Android](#google-android)
  - [Google Chrome](#google-chrome)
  - [Microsoft Internet Explorer](#microsoft-internet-explorer)

- [Browsers (Chinese)](#browsers-chinese)

  - [360 Browser](#360-browser)
  - [QQ Mobile Browser](#qq-mobile-browser)
  - [UC Mobile Browser](#uc-mobile-browser)

- [App Links](#app-links)
- [其他资源](#其他资源)
- [相关项目](#相关项目)
- [其他格式](#其他格式)
- [作者](#作者)
- [原文](#原文)

## 最低要求

以下是任何网络文件(网站/应用程序)的基本要素:

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!--
  上面的两个 meta 标签 *必须* 首先出现在<head>里，
  他始终如一地确保document渲染。
  任何其他head元素都应该在这些标签后面。
 -->
<title>Page Title</title>

```

**[⬆ 返回顶部](#目录)** 

## Elements

有效的`<head>`元素包含`meta`, `link`, `title`, `style`, `script`, `noscript`, 和`base`。

这些元素提供了有关如何通过Web技术感知和呈现document的信息。例如浏览器，搜索引擎，机器人等。

```html
<!--
  设置此document的字符编码，以便正确呈现UTF-8空间内的所有字符(如emoji)。
-->
<meta charset="utf-8">

<!-- 设置document的title -->
<title>Page Title</title>

<!-- 设置document中所有相对URL的基本URL -->
<base href="https://example.com/page.html">

<!-- 链接到外部CSS文件 -->
<link rel="stylesheet" href="styles.css">

<!-- 用于在文档内添加CSS -->
<style>
  /* ... */
</style>

<!-- JavaScript & No-JavaScript 标签 -->
<script src="script.js"></script>
<script>
  // 函数在这里
</script>
<noscript>
  <!-- 没有js的替代品 -->
</noscript>
```

**[⬆ 返回顶部](#目录)**

## Meta

```html
<!--
  紧跟的两个 meta 标签 *必须* 首先出现在<head>里，
  他始终如一地确保document渲染。
  任何其他head元素都应该在这些标签后面。
-->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<!--
  允许控制加载资源的位置。
  尽可能早的放在<head>里, 因为标记只应用于在它之后声明的资源。
-->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">

<!-- web应用程序名称(仅当网站作为应用程序(app)使用时才应使用) -->
<meta name="application-name" content="Application Name">

<!-- 适用于Chrome，Firefox OS和Opera的主题颜色 -->
<meta name="theme-color" content="#4285f4">

<!-- document的简短描述(限制为150个字符) -->
<!-- 此内容*可以*用作搜索引擎结果的一部分。 -->
<meta name="description" content="A description of the page">

<!-- 控制搜索引擎爬虫和索引的行为 -->
<meta name="robots" content="index,follow"><!-- 所有的搜索引擎 -->
<meta name="googlebot" content="index,follow"><!-- 特定于谷歌 -->

<!-- 告诉谷歌不要显示站点链接搜索框 -->
<meta name="google" content="nositelinkssearchbox">

<!-- 告知Google不要为此文档提供翻译 -->
<meta name="google" content="notranslate">

<!-- 验证网站的所有权 -->
<meta name="google-site-verification" content="verification_token"><!-- Google Search Console -->
<meta name="yandex-verification" content="verification_token"><!-- Yandex Webmasters -->
<meta name="msvalidate.01" content="verification_token"><!-- Bing Webmaster Center -->
<meta name="alexaVerifyID" content="verification_token"><!-- Alexa Console -->
<meta name="p:domain_verify" content="code_from_pinterest"><!-- Pinterest Console-->
<meta name="norton-safeweb-site-verification" content="norton_code"><!-- Norton Safe Web -->

<!-- 识别用于构建document的软件(即- WordPress, Dreamweaver) -->
<meta name="generator" content="program">

<!-- 对文档主题的简短描述 -->
<meta name="subject" content="your document's subject">

<!-- 根据文档内容给出相对的年龄段评级 -->
<!-- 译：参考这里 https://www.metatags.org/meta_name_rating  -->
<meta name="rating" content="General">

<!-- 允许控制如何传递引用者信息 -->
<meta name="referrer" content="no-referrer">

<!-- 尽可能的禁用自动检测和格式化电话号码 -->
<meta name="format-detection" content="telephone=no">

<!-- 通过设置为"off"完全退出DNS prefetching -->
<meta http-equiv="x-dns-prefetch-control" content="off">

<!-- 指定要在特定frame中显示的document -->
<meta http-equiv="Window-Target" content="_value">

<!-- 地理标记 -->
<meta name="ICBM" content="latitude, longitude">
<meta name="geo.position" content="latitude;longitude">
<meta name="geo.region" content="country[-state]"><!-- 国家代码 (ISO 3166-1): 强制性的, 州代码 (ISO 3166-2): 可选的; eg. content="US" / content="US-NY" -->
<meta name="geo.placename" content="city/town"><!-- eg. content="New York City" -->
```

- 📖 [Meta tags that Google understands](https://support.google.com/webmasters/answer/79812?hl=en)
- 📖 [WHATWG Wiki: MetaExtensions](https://wiki.whatwg.org/wiki/MetaExtensions)
- 📖 [ICBM on Wikipedia](https://en.wikipedia.org/wiki/ICBM_address#Modern_use)
- 📖 [Geotagging on Wikipedia](https://en.wikipedia.org/wiki/Geotagging#HTML_pages)

**[⬆ 返回顶部](#目录)**

## Link

```html
<!-- 指向外部样式表 -->
<link rel="stylesheet" href="https://example.com/styles.css">

<!-- 有助于防止搜索引擎优化中出现重复的内容问题 -->
<!-- 译：参考 https://en.wikipedia.org/wiki/Canonical_link_element -->
<link rel="canonical" href="https://example.com/article/?page=2">

<!-- 链接到当前document的AMP HTML版本 -->
<link rel="amphtml" href="https://example.com/path/to/amp-version.html">

<!-- 指向JSON文件的链接，该文件指定Web应用程序的“安装”凭据 -->
<link rel="manifest" href="manifest.json">

<!-- 链接到document有关作者的信息 -->
<link rel="author" href="humans.txt">

<!-- 引用适用于链接上下文的版权声明 -->
<link rel="license" href="copyright.html">

<!-- 提供对文档中可能使用其他语言的位置的引用 -->
<link rel="alternate" href="https://es.example.com/" hreflang="es">

<!-- 提供有关作者或其他人的信息 -->
<link rel="me" href="https://google.com/profiles/thenextweb" type="text/html">
<link rel="me" href="mailto:name@example.com">
<link rel="me" href="sms:+15035550125">

<!-- 指向描述一组记录、文档或其他具有历史意义的材料的文档的链接 -->
<link rel="archives" href="https://example.com/archives/">

<!-- 链接到层次结构中的顶级资源 -->
<link rel="index" href="https://example.com/article/">

<!-- 提供一个自引用——当文档有多个可能的引用时非常有用-->
<link rel="self" type="application/atom+xml" href="https://example.com/atom.xml">

<!-- 分别是一系列文档中的第一个、最后一个、前一个和下一个文档 -->
<link rel="first" href="https://example.com/article/">
<link rel="last" href="https://example.com/article/?page=42">
<link rel="prev" href="https://example.com/article/?page=1">
<link rel="next" href="https://example.com/article/?page=3">

<!-- 当使用第三方服务维护博客时使用 -->
<link rel="EditURI" href="https://example.com/xmlrpc.php?rsd" type="application/rsd+xml" title="RSD">

<!-- 当另一个WordPress博客链接到您的WordPress博客或文章时，生成一个自动评论 -->
<link rel="pingback" href="https://example.com/xmlrpc.php">

<!-- 在文档上链接到URL时通知此URL -->
<link rel="webmention" href="https://example.com/webmention">

<!-- 启用使用Micropub客户端发布到你自己的域 -->
<link rel="micropub" href="https://example.com/micropub">

<!-- 打开搜索 -->
<link rel="search" href="/open-search.xml" type="application/opensearchdescription+xml" title="Search Title">

<!-- Feeds -->
<link rel="alternate" href="https://feeds.feedburner.com/example" type="application/rss+xml" title="RSS">
<link rel="alternate" href="https://example.com/feed.atom" type="application/atom+xml" title="Atom 0.3">

<!-- Prefetching, preloading, prebrowsing -->
<!-- 更多信息: https://css-tricks.com/prefetching-preloading-prebrowsing/ -->
<link rel="dns-prefetch" href="//example.com/">
<link rel="preconnect" href="https://www.example.com/">
<link rel="prefetch" href="https://www.example.com/">
<link rel="prerender" href="https://example.com/">
<link rel="preload" href="image.png" as="image">
```

- 📖 [Link Relations](https://www.iana.org/assignments/link-relations/link-relations.xhtml)

**[⬆ 返回顶部](#目录)**

## Icons

```html
<!-- 用于 IE 10 和 更低的 -->
<!-- 将favicon.ico放在根目录中——不需要标记 -->

<!-- 我们需要它的最高分辨率的图标 -->
<link rel="icon" sizes="192x192" href="/path/to/icon.png">

<!-- Apple Touch Icon (reuse 192px icon.png) -->
<link rel="apple-touch-icon" href="/path/to/apple-touch-icon.png">

<!-- Safari Pinned Tab Icon -->
<link rel="mask-icon" href="/path/to/icon.svg" color="blue">
```

- 📖 [All About Favicons (And Touch Icons)](https://bitsofco.de/all-about-favicons-and-touch-icons/)
- 📖 [Creating Pinned Tab Icons](https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariWebContent/pinnedTabs/pinnedTabs.html)
- 📖 [Favicon Cheat Sheet](https://github.com/audreyr/favicon-cheat-sheet)
- 📖 [Icons & Browser Colors](https://developers.google.com/web/fundamentals/design-and-ux/browser-customization/)

**[⬆ 返回顶部](#目录)**

## Social

### Facebook Open Graph

```html
<meta property="fb:app_id" content="123456789">
<meta property="og:url" content="https://example.com/page.html">
<meta property="og:type" content="website">
<meta property="og:title" content="Content Title">
<meta property="og:image" content="https://example.com/image.jpg">
<meta property="og:image:alt" content="A description of what is in the image (not a caption)">
<meta property="og:description" content="Description Here">
<meta property="og:site_name" content="Site Name">
<meta property="og:locale" content="en_US">
<meta property="article:author" content="">
```

- 📖 [Facebook Open Graph Markup](https://developers.facebook.com/docs/sharing/webmasters#markup)
- 📖 [Open Graph protocol](http://ogp.me/)
- 🛠 使用 [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) 测试你的页面

### Twitter Card

```html
<meta name="twitter:card" content="summary">
<meta name="twitter:site" content="@site_account">
<meta name="twitter:creator" content="@individual_account">
<meta name="twitter:url" content="https://example.com/page.html">
<meta name="twitter:title" content="Content Title">
<meta name="twitter:description" content="Content description less than 200 characters">
<meta name="twitter:image" content="https://example.com/image.jpg">
<meta name="twitter:image:alt" content="A text description of the image conveying the essential nature of an image to users who are visually impaired. Maximum 420 characters.">
```

- 📖 [Getting started with cards — Twitter Developers](https://dev.twitter.com/cards/getting-started)
- 🛠 使用 [Twitter Card Validator](https://cards-dev.twitter.com/validator) 测试你的页面

### Twitter Privacy

如果你在网站中嵌入推文，Twitter可以使用你网站上的信息来定制Twitter用户的内容和建议。[更多关于Twitter隐私选项。](https://dev.twitter.com/web/overview/privacy#what-privacy-options-do-website-publishers-have)

```html
<!-- 禁止Twitter将你的网站信息用于个性化目的 -->
<meta name="twitter:dnt" content="on">
```

### Schema.org

```html
<html lang="" itemscope itemtype="https://schema.org/Article">
    <head>
      <link rel="author" href="">
      <link rel="publisher" href="">
      <meta itemprop="name" content="Content Title">
      <meta itemprop="description" content="Content description less than 200 characters">
      <meta itemprop="image" content="https://example.com/image.jpg">
```

**注意：** 这些元标记需要将`itemscope`和`itemtype`属性添加到`<html>`标记中。

- 🛠使用[结构化数据测试工具](https://developers.google.com/structured-data/testing-tool/)测试你的页面

### Pinterest

根据[他们的帮助中心](https://help.pinterest.com/en/business/article/prevent-saves-to-pinterest-from-your-site)，Pinterest可以防止人们从你的网站上保存内容。`description`是可选的。

```html
<meta name="pinterest" content="nopin" description="Sorry, you can't save from my website!">
```

### Facebook Instant Articles

```html
<meta charset="utf-8">
<meta property="op:markup_version" content="v1.0">

<!-- 你文章的web版的网址(URL) -->
<link rel="canonical" href="https://example.com/article.html">

<!-- 用于这篇文章的样式 -->
<meta property="fb:article_style" content="myarticlestyle">
```

- 📖 [Creating Articles - Instant Articles](https://developers.facebook.com/docs/instant-articles/guides/articlecreate)
- 📖 [Code Samples - Instant Articles](https://developers.facebook.com/docs/instant-articles/reference)

### OEmbed

```html
<link rel="alternate" type="application/json+oembed"
  href="https://example.com/services/oembed?url=http%3A%2F%2Fexample.com%2Ffoo%2F&amp;format=json"
  title="oEmbed Profile: JSON">
<link rel="alternate" type="text/xml+oembed"
  href="https://example.com/services/oembed?url=http%3A%2F%2Fexample.com%2Ffoo%2F&amp;format=xml"
  title="oEmbed Profile: XML">
```

- 📖 [oEmbed format](https://oembed.com/)

**[⬆ 返回顶部](#目录)**

## Browsers / Platforms

### Apple iOS

```html
<!-- Smart App Banner -->
<meta name="apple-itunes-app" content="app-id=APP_ID,affiliate-data=AFFILIATE_ID,app-argument=SOME_TEXT">

<!-- 尽可能的禁用自动检测和格式化电话号码 -->
<meta name="format-detection" content="telephone=no">

<!-- Launch Icon (180x180px or larger) -->
<link rel="apple-touch-icon" href="/path/to/apple-touch-icon.png">

<!-- Launch Screen Image -->
<link rel="apple-touch-startup-image" href="/path/to/launch.png">

<!-- Launch Icon Title -->
<meta name="apple-mobile-web-app-title" content="App Title">

<!-- 启用独立(全屏)模式 -->
<meta name="apple-mobile-web-app-capable" content="yes">

<!-- 状态栏外观(除非启用独立模式，否则没有效果) -->
<meta name="apple-mobile-web-app-status-bar-style" content="black">

<!-- iOS应用深度链接 -->
<meta name="apple-itunes-app" content="app-id=APP-ID, app-argument=http/url-sample.com">
<link rel="alternate" href="ios-app://APP-ID/http/url-sample.com">
```

- 📖 [Configuring Web Applications](https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)

### Google Android

```html
<meta name="theme-color" content="#E64545">

<!-- 添加到主屏幕 -->
<meta name="mobile-web-app-capable" content="yes">
<!-- 更多信息: https://developer.chrome.com/multidevice/android/installtohomescreen -->

<!-- Android应用深层链接 -->
<meta name="google-play-app" content="app-id=package-name">
<link rel="alternate" href="android-app://package-name/http/url-sample.com">
```

### Google Chrome

```html
<link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/APP_ID">

<!-- 禁用翻译提示 -->
<meta name="google" content="notranslate">
```

### Microsoft Internet Explorer

```html
<!-- 强制IE 8/9/10使用其最新的渲染引擎 -->
<meta http-equiv="x-ua-compatible" content="ie=edge">

<!-- 通过Skype Toolbar浏览器扩展尽可能禁用自动检测和格式化电话号码 -->
<meta name="skype_toolbar" content="skype_toolbar_parser_compatible">

<!-- Windows Tiles -->
<meta name="msapplication-config" content="/browserconfig.xml">
```

用于`browserconfig.xml`的xml标记的最低要求：

```html
<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
   <msapplication>
     <tile>
        <square70x70logo src="small.png"/>
        <square150x150logo src="medium.png"/>
        <wide310x150logo src="wide.png"/>
        <square310x310logo src="large.png"/>
     </tile>
   </msapplication>
</browserconfig>
```

- 📖 [Browser configuration schema reference](https://msdn.microsoft.com/en-us/library/dn320426.aspx)

**[⬆ 返回顶部](#目录)**

## Browsers (Chinese)

### 360 Browser

```html
<!-- 选择渲染引擎顺序 -->
<meta name="renderer" content="webkit|ie-comp|ie-stand">
```

### QQ Mobile Browser

```html
<!-- 锁定屏幕到指定的方向 -->
<meta name="x5-orientation" content="landscape/portrait">

<!-- 全屏显示此文档 -->
<meta name="x5-fullscreen" content="true">

<!-- 文档将以"应用模式"(全屏等)显示 -->
<meta name="x5-page-mode" content="app">
```

### UC Mobile Browser

```html
<!-- 锁定屏幕到指定的方向 -->
<meta name="screen-orientation" content="landscape/portrait">

<!-- 全屏显示此文档 -->
<meta name="full-screen" content="yes">

<!-- 即使在"文本模式"下，UC浏览器也会显示图像 -->
<meta name="imagemode" content="force">

<!-- 文档将以"应用模式"显示(全屏、禁止手势等) -->
<meta name="browsermode" content="application">

<!-- 对此文档禁用UC浏览器"夜间模式" -->
<meta name="nightmode" content="disable">

<!-- 简化文档以减少数据传输 -->
<meta name="layoutmode" content="fitscreen">

<!-- 禁用UC浏览器的功能"当本文档中有多个单词时缩放字体" -->
<meta name="wap-font-scale" content="no">
```

- 📖 [UC Browser Docs](https://www.uc.cn/download/UCBrowser_U3_API.doc)

**[⬆ 返回顶部](#目录)**

## App Links

```html
<!-- iOS -->
<meta property="al:ios:url" content="applinks://docs">
<meta property="al:ios:app_store_id" content="12345">
<meta property="al:ios:app_name" content="App Links">

<!-- Android -->
<meta property="al:android:url" content="applinks://docs">
<meta property="al:android:app_name" content="App Links">
<meta property="al:android:package" content="org.applinks">

<!-- Web fall back -->
<meta property="al:web:url" content="https://applinks.org/documentation">
```

- 📖 [App Links](https://applinks.org/documentation/)

**[⬆ 返回顶部](#目录)**

## 其他资源

- 📖 [HTML5 Boilerplate Docs: The HTML](https://github.com/h5bp/html5-boilerplate/blob/master/dist/doc/html.md)
- 📖 [HTML5 Boilerplate Docs: Extend and customize](https://github.com/h5bp/html5-boilerplate/blob/master/dist/doc/extend.md)

## 相关项目

- [Atom HTML Head Snippets](https://github.com/joshbuchea/atom-html-head-snippets) - `HEAD`片段的Atom包
- [Sublime Text HTML Head Snippets](https://github.com/marcobiedermann/sublime-head-snippets) - `HEAD`片段的Sublime Text包
- [head-it](https://github.com/hemanth/head-it) - `HEAD`代码段的CLI接口
- [vue-head](https://github.com/ktquez/vue-head) - 操作Vue.js的`HEAD`标签的meta信息

**[⬆ 返回顶部](#目录)**

## 其他格式

- 📄 [PDF](https://gitprint.com/joshbuchea/HEAD/blob/master/README.md)

## 作者

- 原著

  **[Josh](https://twitter.com/joshbuchea)**

- 译者

  **[xiaohesong](https://github.com/xiaohesong)**

**[⬆ 返回顶部](#目录)**

## 原文

https://github.com/joshbuchea/HEAD
