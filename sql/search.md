- 筛选一张表里重复的数据

查询一个字段在数据表里重复的数据
```sql
select count(*) as count, car_no, id from cars group by car_no having count > 2;
```

这个就是查询car_no重复的个数大于2的情况，显示出重复的car_no；

| count         | car_no        |
| ------------- |:-------------:|
| 5             | undefined     |

- 分页的筛选

大多数的分页都是使用`limit`配合`offset`, 但是这样是存在性能问题的，有更好的方案。

```sql
mysql> SELECT * FROM table_name LIMIT 10 OFFSET 8000001;
[...]
10 rows in set (12.80 sec)
```

使用其他方式(`where`)替换之后的：

```sql
mysql> SELECT * FROM table_name WHERE id > 8000000 LIMIT 10;
[...]
10 rows in set (0.01 sec)
```

具体链接地址查看：[Please Don't Use OFFSET and LIMIT For Your Pagination](https://hackernoon.com/please-dont-use-offset-and-limit-for-your-pagination-8ux3u4y)



