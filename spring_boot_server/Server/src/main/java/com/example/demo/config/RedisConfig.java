package com.example.demo.config;

import java.time.Duration;
import java.util.Arrays;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisSentinelConfiguration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import io.lettuce.core.ClientOptions;
import io.lettuce.core.SocketOptions;
import io.lettuce.core.resource.ClientResources;
import io.lettuce.core.resource.DnsResolver;
import io.lettuce.core.resource.MappingSocketAddressResolver;
import io.lettuce.core.internal.HostAndPort;

@Slf4j
@Configuration
@EnableCaching
public class RedisConfig implements CachingConfigurer {

        @Value("${spring.data.redis.sentinel.master:}")
        private String sentinelMaster;

        @Value("${spring.data.redis.sentinel.nodes:}")
        private String sentinelNodes;

        @Value("${spring.data.redis.host:localhost}")
        private String redisHost;

        @Value("${spring.data.redis.port:6379}")
        private int redisPort;

        @Bean
        public LettuceConnectionFactory redisConnectionFactory() {
                boolean useSentinel = sentinelMaster != null && !sentinelMaster.isBlank()
                                && sentinelNodes != null && !sentinelNodes.isBlank();

                MappingSocketAddressResolver resolver = MappingSocketAddressResolver.create(
                                DnsResolver.jvmDefault(),
                                hostAndPort -> {
                                        if (hostAndPort.getPort() == 6379) {
                                                return HostAndPort.of("127.0.0.1", 6379);
                                        }
                                        return hostAndPort;
                                });

                ClientResources clientResources = ClientResources.builder()
                                .socketAddressResolver(resolver)
                                .build();

                LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
                                .clientResources(clientResources)
                                .clientOptions(ClientOptions.builder()
                                                .socketOptions(SocketOptions.builder()
                                                                .connectTimeout(Duration.ofSeconds(3))
                                                                .build())
                                                .build())
                                .commandTimeout(Duration.ofSeconds(3))
                                .build();

                if (useSentinel) {
                        RedisSentinelConfiguration sentinelConfig = new RedisSentinelConfiguration();
                        sentinelConfig.setMaster(sentinelMaster);
                        Arrays.stream(sentinelNodes.split(","))
                                        .map(String::trim)
                                        .filter(node -> !node.isEmpty())
                                        .forEach(node -> {
                                                String[] parts = node.split(":");
                                                sentinelConfig.sentinel(parts[0], Integer.parseInt(parts[1]));
                                        });
                        return new LettuceConnectionFactory(sentinelConfig, clientConfig);
                } else {
                        RedisStandaloneConfiguration standaloneConfig = new RedisStandaloneConfiguration(redisHost,
                                        redisPort);
                        return new LettuceConnectionFactory(standaloneConfig, clientConfig);
                }
        }

        @Bean
        public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
                RedisSerializationContext.SerializationPair<String> keySerializer = RedisSerializationContext.SerializationPair
                                .fromSerializer(new StringRedisSerializer());
                RedisSerializationContext.SerializationPair<Object> valueSerializer = RedisSerializationContext.SerializationPair
                                .fromSerializer(new GenericJackson2JsonRedisSerializer());

                RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(10))
                                .serializeKeysWith(keySerializer)
                                .serializeValuesWith(valueSerializer)
                                .disableCachingNullValues();

                return RedisCacheManager.builder(connectionFactory)
                                .cacheDefaults(defaultConfig)
                                .build();
        }

        @Override
        public CacheErrorHandler errorHandler() {
                return new CacheErrorHandler() {
                        @Override
                        public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                                log.warn("Redis Cache GET failed for key [{}] in cache [{}]: {}. Falling back to database.",
                                                key, cache.getName(), exception.getMessage());
                        }

                        @Override
                        public void handleCachePutError(RuntimeException exception, Cache cache, Object key,
                                        Object value) {
                                log.warn("Redis Cache PUT failed for key [{}] in cache [{}]: {}",
                                                key, cache.getName(), exception.getMessage());
                        }

                        @Override
                        public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                                log.warn("Redis Cache EVICT failed for key [{}] in cache [{}]: {}",
                                                key, cache.getName(), exception.getMessage());
                        }

                        @Override
                        public void handleCacheClearError(RuntimeException exception, Cache cache) {
                                log.warn("Redis Cache CLEAR failed for cache [{}]: {}",
                                                cache.getName(), exception.getMessage());
                        }
                };
        }
}
