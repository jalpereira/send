const promisify = require('util').promisify;

module.exports = function(config) {
  const redis_lib =
    config.env === 'development' && config.redis_host === 'localhost'
      ? 'redis-mock'
      : 'redis';

  //eslint-disable-next-line security/detect-non-literal-require
  const redis = require(redis_lib);

  var client_config = {
    host: config.redis_host,
    port: config.redis_port,
    retry_strategy: options => {
      if (options.total_retry_time > config.redis_retry_time) {
        client.emit('error', 'Retry time exhausted');
        return new Error('Retry time exhausted');
      }

      return config.redis_retry_delay;
    }
  };
  if (config.redis_password != null && config.redis_password.length > 0)
    client_config.password = config.redis_password;
  const client = redis.createClient(client_config);

  client.ttlAsync = promisify(client.ttl);
  client.hgetallAsync = promisify(client.hgetall);
  client.hgetAsync = promisify(client.hget);
  client.pingAsync = promisify(client.ping);
  return client;
};
