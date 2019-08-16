最近这几天在搞爬虫，差点被玩坏。

由于运营那边需要数据查询，给我excel表格，去网站查询对应的数据。

因为后端都忙，那就前端来处理吧(前端不忙吗？不，那是前端效率高。不是？那就是我的效率高)。

先去手动操作一番，好嘛，不需要登陆，爽歪歪啊。查询的数据是api接口形式，这就好了，都不用解析html了。

那就干吧。先上postman请求api接口。query参数直接encodeURI下去请求，不幸的是，不成功。嗯？看看页面的请求，好吧，加上Cookie头试试，嗯不错，可以了。

行吧，反正就是query encode下，请求携带Cookie下。Cookie咋搞呢？难道每次手动维护吗?这样不好吧。反正爬虫也不可能纯前端去解决了，那就用puppeteer吧。很棒，可以获取到。

```shell
npm i puppeteer -S
```

```js
async function getCookie() {
	const browser = await puppeteer.launch({ 
		args: ['--no-sandbox', '--disable-dev-shm-usage'],
	});
	const page = await browser.newPage();
	await page.goto("https://xxxx.com/");	
	await sleep(2000)
	let co = await page.cookies();
	await browser.close();
	return co
}

async function setCookie() {
	const cookies = await getCookie()
	const cookie = cookies.reduce((cookie, item) => (cookie += `${item.name}=${item.value};`, cookie), '')
	return cookie
}
```

下面就是业务逻辑处理了，这里倒是没啥，mysql用的node的[mysql](https://github.com/mysqljs/mysql)库，解析和生产excel用的是[xlsx](https://github.com/SheetJS/js-xlsx)这个库，然后就是请求数据，不过这里(笔者所爬的网站)频率要有限制，不然会封IP。

formdata把数据传到后台，后台接收对应的文件，因为在下用的是koa2，解析formdata数据用到了[koa-body](https://github.com/dlau/koa-body):

```js
// index
const koaBody = require('koa-body');
app.use(koaBody({
  multipart: true,
  formidable: {
      maxFileSize: 200*1024*1024	// 设置上传文件大小最大限制，默认2M
  }
}));

// controllers/files 
// create action
const path = require('path');
var fs = require('fs');
const uuidv1 = require('uuid/v1');
async function create(ctx) {
    const {file} = ctx.request.files // file 是input name
    const {type} = ctx.request.body // 其他的参数
    saveFile({file})
}

async function saveFile(ctx){
  const uid = uuidv1()
  const basicPath = `../files/`
  const filesPath = buildFolder(basicPath)
  if (!fs.existsSync(filesPath)){
    fs.mkdirSync(filesPath);
  }
  const ext = file.name.split('.').pop()
  const reader = fs.createReadStream(file.path);
  const stream = fs.createWriteStream(path.resolve(__dirname, `${basicPath}/${uid}.${ext}`));
  reader.pipe(stream);
}

function buildFolder(url) {
  return path.resolve(__dirname, `${url}`)
}
```

这样就把文件保存下来，然后去异步的处理这个文件。读取文件(excel)是用库：

```js
const XLSX = require('xlsx');
function readExcel(path){
	const workbox = XLSX.readFile(path)
	const sheetName = workbox.SheetNames[0]
	const object = XLSX.utils.sheet_to_json(workbox.Sheets[sheetName])
	return object
}
```

去对应的查询数据，然后生成xlsx数据：

```js
async function generateXlsx({results, name, uid}) {
	var ws = XLSX.utils.json_to_sheet(results); // results就是生成的数据
	var wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, name); //name is sheet name
	buildFileFolder()
	XLSX.writeFile(wb, path.resolve(__dirname, `../files/build/${uid}.xlsx`));
}
```

其实上面这些都没啥。主要是部署之后的问题，文件上传了一直在等待查询，就是没有到更新文件(正在查询)的这一步。WTF？

看日志，是puppeteer启动失败。也有提示，参考这里[troubleshooting](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md)，反正就是对docker的支持还存在一点问题。依赖得问题，所以把依赖装上。就好了。

一切都很好，嗯，没啥事了。第二天中午吃饭得时候，运营群里：“这个添加了验证码，那个爬虫还能用吗”。当时心里打鼓得，觉得肯定会有影响，但是以示安慰，还是认为只是页面加了验证。就说回去确定下。

中饭回来第一时间打开网站，果然加上了验证码，请求下试试，好家伙，果然，验证码有验证。看了下验证码得域名，xx.alicdn.com。第一想法，不好搞啊。那也得搞。

无头浏览器里找到元素，点击，嗯？报错。试了n次，都是报错。换成`headless: false`试试，好吧，有二级验证了，滑块，那就找到边界进行滑动，可以。

> 期间，要对navigator得webdriver进行设置。

其实这里主要说的就是成功了几次就会失败，改了点东西，可以了(如果你也是这样，可以在github首页得email联系在下)。

比较恶心得是，使用`headless: true`的情况是基本都失败。所以，在docker里要headless: false的方式去运行。

所以，下面出现了docker部署的情况

好吧，定义user运行的这个方式呢，没有root权限，1024以下的端口都开启不了，这样就得配置nginx镜像，权限没有那么大，不方便折腾。不用user呢，必须在沙箱环境无头运行。最终采用的方案是[xvfb - **X virtual framebuffer**](https://en.wikipedia.org/wiki/Xvfb)。

```dockerfile
FROM node:10-slim
// ...
RUN apt-get update && \
    apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
    libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget \
    xvfb x11vnc x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps
// ....
```

爬虫，尽量让他在行为上表现的像一个人。
