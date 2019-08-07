- 筛选一张表里重复的数据

查询一个字段在数据表里重复的数据
```sql
select count(*) as count, car_no, id from cars group by car_no having count > 2;
```

这个就是查询car_no重复的个数大于2的情况，显示出重复的car_no；

| count         | car_no        |
| ------------- |:-------------:|
| 5             | undefined     |

