package com.project.label.configuration;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final String[] PUBLIC_ENDPOINTS = {
        "/users",
        "/auth/token",
        "/auth/introspect",
        "/auth/logout",
        "/auth/refresh",
        "/register",
        
    };

    @Value("${jwt.signerKey}")
    private String SIGNER_KEY;

    @Autowired
    private CustomJwtDecoder customJwtDecoder;

    @Bean
SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
    httpSecurity
        // 1. Cấu hình CORS và CSRF
        .cors(Customizer.withDefaults())
        .csrf(AbstractHttpConfigurer::disable)
        // 2. Cấu hình quyền truy cập
        .authorizeHttpRequests(request -> request
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
            .requestMatchers(HttpMethod.GET, "/users").permitAll()
            .requestMatchers(HttpMethod.POST, "/annotations").authenticated()
            .requestMatchers("/api/labels/**").authenticated()
            .anyRequest().authenticated() 
        )
        
        // 3. Cấu hình xác thực bằng JWT (OAuth2)   
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(jwtConfigurer -> jwtConfigurer
                    .decoder(customJwtDecoder)
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
            )
            .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
        );

    return httpSecurity.build();
}

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
      CorsConfiguration configuration = new CorsConfiguration();
      configuration.setAllowedOrigins(List.of("http://localhost:5173"));
      configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
      configuration.setAllowedHeaders(List.of("*"));
      configuration.setAllowCredentials(true);
      UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
      source.registerCorsConfiguration("/**", configuration);
      return source;
    }
    

    JwtAuthenticationConverter jwtAuthenticationConverter(){
      JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
      jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");

      JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
      jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
      return jwtAuthenticationConverter;
    }

    @Bean
    JwtDecoder jwtDecoder(){
      SecretKeySpec secretKeySpec = new SecretKeySpec(SIGNER_KEY.getBytes(),"HS512");
      return NimbusJwtDecoder
            .withSecretKey(secretKeySpec )
            .macAlgorithm(MacAlgorithm.HS512)
            .build();
    }

    @Bean
    PasswordEncoder passwordEncoder(){
      return new BCryptPasswordEncoder(10);
    }
}
