- imd

  每次使用这个快捷方式，会生成下面的模板：
  ```js
  import {  } from 'module';`
  ```
  注意这里的光标是聚焦在`module`之处，每次回到`{}`的内容都需要触摸板过去，有个方法直接`tab`键过去：
  
  vscode里加上这个配置：
  ```json
  "import": {
		"prefix": "import",
		"body": [
			"import { $0 } from '$1';",
			"",
		],
		"description": "to import content for {}"
	}
  ```
