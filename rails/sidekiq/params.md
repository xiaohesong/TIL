调用的`sidekiq`代码尽量保持精简,传递的参数不应该序列化整个`object`.
[sidekiq的使用介意](https://github.com/mperham/sidekiq/wiki/Best-Practices#1-make-your-job-parameters-small-and-simple)
