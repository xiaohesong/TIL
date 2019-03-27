- mac `rails c` Library not loaded:

/Users/user/.rvm/rubies/ruby-2.3.0/lib/ruby/2.3.0/irb/completion.rb:10:in `require': dlopen(/Users/xiaohesong/.rvm/rubies/ruby-2.3.0/lib/ruby/2.3.0/x86_64-darwin17/readline.bundle, 9): 
Library not loaded: /usr/local/opt/readline/lib/libreadline.7.dylib (LoadError)

解决办法，查看当前的版本(`cd /usr/local/opt/readline/lib/ && ls`)，然后link下。

link可以根据版本来匹配:

```shell
ln -s /usr/local/opt/readline/lib/libreadline.7.0.dylib /usr/local/opt/readline/lib/libreadline.6.dylib



ln -s /usr/local/opt/readline/lib/libreadline.8.0.dylib /usr/local/opt/readline/lib/libreadline.7.dylib
```

