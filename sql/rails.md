### 关于`join`
- Left join
```sql
select count(distinct store_name) from scores left join stores on scores.scoreable_id = stores.id and scores.scoreable_type = 'Store' where store.status = 0 and scores.user_type=0;
# 这个是查询 所有带有评分的门店,并且门店是营业状态(0)和评分的类型是用户评分(0)
```

- Right join
和`left join`差不多.不过这个是以右表全表为基础进行处理.

- inner join
`ruby`的 `joins`.`sql`查询中也可以直接使用`join`,就是`inner join`
```ruby
User.joins(:roles).to_sql
# => "SELECT `users`.* FROM `users` INNER JOIN `users_roles` ON `users_roles`.`user_id` = `users`.`id` INNER JOIN `roles` ON `roles`.`id` = `users_roles`.`role_id`"
```
Inner join 是左右表等价的.

- includes
```ruby
A.includes(:bs).where(bs: {name: '#'}).count
# =>
# SELECT COUNT(DISTINCT `bs`.`id`) FROM `as` LEFT OUTER JOIN `bs` ON `bs`.`a_id` = `as`.`id` WHERE `bs`.`name` = '#'
```

从上面可以发现,`left join`和`includes`的`left outer join`很像.其实`left join`和`left outer join`类似于`join`和`inner join`类似的.[此处查看](https://stackoverflow.com/questions/406294/left-join-vs-left-outer-join-in-sql-server)

### 小方法
- sum
```sql
SUM(CASE WHEN num > 0 THEN 1 else 0 END) AS available_times
```

- round
```sql
ROUND('123.654',2)
# 123.654 取小数后两位
```

- GROUP_CONCAT/CONCAT
返回拼接的字符串. GROUP_CONCAT与`group by`使用,效果更佳.

- `boolean`转换为汉字显示
```sql
select *, if(status>0,'激活','锁定') AS '操作状态' from car_bind_info_lock_logs where status is not null;
```
