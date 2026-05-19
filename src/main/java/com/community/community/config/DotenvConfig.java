package com.community.community.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource(value = "classpath:.env", factory = EnvPropertySourceFactory.class)
public class DotenvConfig {
}