package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http,
                        JwtAuthenticationFilter jwtAuthenticationFilter)
                        throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.configure(http))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                                        response.setContentType("application/json");
                                                        response.getWriter().write("{\"message\":\"Unauthorized\"}");
                                                })
                                                .accessDeniedHandler((request, response, accessDeniedException) -> {
                                                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                                        response.setContentType("application/json");
                                                        response.getWriter().write("{\"message\":\"Forbidden\"}");
                                                }))
                                .authorizeHttpRequests(auth -> auth
                                                // User auth — public
                                                .requestMatchers(
                                                                "/api/users/login",
                                                                "/api/users/register",
                                                                "/api/users/check-username",
                                                                "/api/users/check-email",
                                                                "/api/users/google-login",
                                                                "/api/users/google-login-legacy",
                                                                "/api/users/google-oauth-config",
                                                                "/api/users/check-google-id",
                                                                "/api/users/verify-face",
                                                                "/api/users/*/update-login")
                                                .permitAll()

                                                // Password reset & OAuth
                                                .requestMatchers("/api/auth/**").permitAll()

                                                // Public browsing
                                                .requestMatchers(HttpMethod.GET, "/api/movies/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/cinemas/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/showtimes/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/news/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/articles/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/combos/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/seats/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/notifications/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/tickets/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/seat-layouts/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/seat-locks/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/analytics/**").permitAll()

                                                // Contact & complaint submission
                                                .requestMatchers(HttpMethod.POST, "/api/contacts").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/complaints").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/tickets/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/notifications/**").permitAll()

                                                // Payment gateways & Actuator
                                                .requestMatchers("/api/momo/**").permitAll()
                                                .requestMatchers("/api/zalopay/**").permitAll()
                                                .requestMatchers("/api/stripe/**").permitAll()
                                                .requestMatchers("/api/payment/**").permitAll()
                                                .requestMatchers("/actuator/**").permitAll()
                                                .requestMatchers("/ws/**").permitAll()
                                                .requestMatchers("/api/seat-layouts/**").permitAll()
                                                .requestMatchers("/api/seat-locks/**").permitAll()
                                                .requestMatchers("/api/chat/**").authenticated()
                                                .requestMatchers("/api/members/**").permitAll()

                                                // Admin login only — public
                                                .requestMatchers("/api/admin/login").permitAll()

                                                // Admin routes — require ADMIN role
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                                // Everything else — require authenticated user
                                                .anyRequest().authenticated())
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}
