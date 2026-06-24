package com.example.demo.config;

import java.time.Duration;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisSentinelConfiguration;
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

@Configuration
@EnableCaching
public class RedisConfig {

    @Value("${spring.data.redis.sentinel.master:mymaster}")
    private String sentinelMaster;

    @Value("${spring.data.redis.sentinel.nodes:127.0.0.1:26379,127.0.0.1:26380,127.0.0.1:26381}")
    private String sentinelNodes;
    
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        RedisSentinelConfiguration sentinelConfig = new RedisSentinelConfiguration();
        sentinelConfig.setMaster(sentinelMaster);
        Arrays.stream(sentinelNodes.split(","))
                .map(String::trim)
                .forEach(node -> {
                    String[] parts = node.split(":");
                    sentinelConfig.sentinel(parts[0], Integer.parseInt(parts[1]));
                });

        // Remap any address on port 6379 to 127.0.0.1:6379
        MappingSocketAddressResolver resolver = MappingSocketAddressResolver.create(
                DnsResolver.jvmDefault(),
                hostAndPort -> {
                    if (hostAndPort.getPort() == 6379) {
                        return HostAndPort.of("127.0.0.1", 6379);
                    }
                    return hostAndPort;
                }
        );

        ClientResources clientResources = ClientResources.builder()
                .socketAddressResolver(resolver)
                .build();

        LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
                .clientResources(clientResources)
                .clientOptions(ClientOptions.builder()
                        .socketOptions(SocketOptions.builder()
                                .connectTimeout(Duration.ofSeconds(5))
                                .build())
                        .build())
                .commandTimeout(Duration.ofSeconds(5))
                .build();

        return new LettuceConnectionFactory(sentinelConfig, clientConfig);
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer())
                )
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer())
                )
                .disableCachingNullValues();

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .build();
    }
}
