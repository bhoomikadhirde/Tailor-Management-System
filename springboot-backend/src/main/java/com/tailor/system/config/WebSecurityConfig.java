package com.tailor.system.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            .authorizeRequests()
            // Public Endpoint
            .antMatchers("/api/auth/login").permitAll()
            // Client API constraints
            .antMatchers(HttpMethod.DELETE, "/api/clients/**").hasRole("ADMIN")
            .antMatchers("/api/clients/**").hasAnyRole("ADMIN", "TAILOR")
            // Orders API constraints 
            .antMatchers(HttpMethod.DELETE, "/api/orders/**").hasRole("ADMIN")
            .antMatchers("/api/orders/**").hasAnyRole("ADMIN", "TAILOR", "CUSTOMER")
            // System Stat APIs
            .antMatchers("/api/stats/**").hasAnyRole("ADMIN", "TAILOR")
            .anyRequest().authenticated();
            
        return http.build();
    }
}
