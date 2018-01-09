- `ARG`
```dockerfile
FROM xxx
ARG app_env
ENV APP_ENV $app_env
```

```shell
docker build ./ --build-arg app_env=production
```
