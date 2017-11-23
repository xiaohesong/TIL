> 这里主要说的是rails的代码架构.

1. `service`模式.

都知道`rails`是一个`MVC`的框架.但是一个项目足够庞大的时候,`MVC`架构起来显得很吃力,代码也很冗余很臃肿.与`DRY`,`高内聚低耦合`...的理念稍有出入.

`service`是一个服务,供职于一个特定的功能逻辑,可脱离框架.

对于`service`没有明确的规定,但是按照最佳实践,对外暴露的唯一的方法名字为`call`为好.


2. `queries`模式

适用于查询复杂的场景.


两种都比较简单, 可以看链接:
- [rails service 模式](https://medium.com/selleo/essential-rubyonrails-patterns-part-1-service-objects-1af9f9573ca1)

- [rails queries 模式](https://medium.com/@blazejkosmowski/essential-rubyonrails-patterns-part-2-query-objects-4b253f4f4539)
