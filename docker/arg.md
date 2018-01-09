- `ARG`
```dockerfile
FROM xxx
ARG app_env
ENV APP_ENV $app_env
```

```shell
docker build ./ --build-arg app_env=production
```

### example
- Dockerfile
```dockerfile
FROM daocloud.io/library/node:6.1.0

ARG app_env
ENV APP_ENV $app_env

# Set workspace
ENV REACT_ROOT /www/crms
RUN mkdir -p $REACT_ROOT
WORKDIR $REACT_ROOT

#ADD docker_run.sh .
#COPY example.env.production.local example.env.production.local
#COPY example.env.preproduction.local example.env.preproduction.local
#RUN /bin/bash docker_run.sh
RUN if [ ${APP_ENV} = production ]; \
	then \
	cp example.env.production.local .env.production.local \
	else \
	cp example.env.preproduction.local .env.preproduction.local \
	fi

# Install app dependencies
COPY package.json package.json
RUN npm install

# Bundle app source
COPY . .
# Build and optimize react app
RUN npm run build --production

# run react
EXPOSE 5000
RUN npm install -g serve
CMD serve -s build
```
- docker_run.sh
```shell
if [ -z $APP_ENV ]; then
    APP_ENV='dev'
    echo "export APP_ENV=${APP_ENV}" >> ${HOME}/.bashrc
fi

source ~/.bashrc

if [ "$APP_ENV" = "dev" ]; then
  echo "APP_ENV:${APP_ENV}"
	cp example.env.preproduction.local .env.production.local

elif [ "$APP_ENV" = "production" ]; then
  echo "APP_ENV:${APP_ENV}"
	cp example.env.production.local .env.production.local

else
	echo "unknown APP_ENV:${APP_ENV}"
fi

echo "ECHO get APP_ENV finish, then to npm install"

```
