package com.codeassembly.config;

import com.codeassembly.audit.JwtVerificationFilter;
import com.codeassembly.auth.handler.Oauth2UserSuccessHandler;
import com.codeassembly.auth.util.CustomAuthorityUtils;
import com.codeassembly.auth.JwtAuthenticationFilter;
import com.codeassembly.auth.JwtTokenizer;
import com.codeassembly.auth.handler.UserAccessDeniedHandler;
import com.codeassembly.auth.handler.UserAuthenticationEntryPoint;
import com.codeassembly.auth.handler.UserAuthenticationFailureHandler;
import com.codeassembly.auth.handler.UserAuthenticationSuccessHandler;
import com.codeassembly.user.repository.UserRepository;
import com.codeassembly.user.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.web.OAuth2LoginAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

// 인증 방식과 웹 페이지에 대한 접근 권한 설정 가능

@Configuration
@RequiredArgsConstructor
@ComponentScan(basePackages = "com.codeassembly.auth")
public class SecurityConfiguration {
    private final JwtTokenizer jwtTokenizer;
    private final CustomAuthorityUtils authorityUtils;
    private final UserRepository userRepository;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .headers().frameOptions().sameOrigin()
                .and()
                .csrf().disable()
                .cors().configurationSource(corsConfigurationSource())
                .and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .formLogin().disable()
                .httpBasic().disable()
                .exceptionHandling()
                .authenticationEntryPoint(new UserAuthenticationEntryPoint())
                .accessDeniedHandler(new UserAccessDeniedHandler())
                .and()
                .apply(new CustomFilterConfigure())
                .and()
                .authorizeHttpRequests(authorize -> authorize
                                .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .antMatchers(HttpMethod.POST, "/token").permitAll()
                                .antMatchers(HttpMethod.POST, "/*/user/**").permitAll()
                                .antMatchers(HttpMethod.GET, "/*/user/**").permitAll()
                                .antMatchers(HttpMethod.POST, "/*/community/**").authenticated()
                                .antMatchers(HttpMethod.PATCH, "/*/community/**").permitAll()
                                .antMatchers(HttpMethod.GET, "/*/community/**").permitAll()
                                .antMatchers(HttpMethod.PATCH, "/*/plan/**").authenticated()
                                .antMatchers(HttpMethod.POST, "/*/plan/**").authenticated()
                                .antMatchers(HttpMethod.GET, "/*/plan/**").permitAll()
                                .antMatchers(HttpMethod.DELETE, "/*/plan/**").authenticated()
                                .antMatchers(HttpMethod.POST, "/comment/**").authenticated()
                                .antMatchers(HttpMethod.PATCH, "/comment/**").authenticated()
                                .antMatchers(HttpMethod.DELETE, "/comment/**").authenticated()
                                .antMatchers(HttpMethod.PATCH, "/**").authenticated()
                                .antMatchers(HttpMethod.DELETE, "/**").authenticated()

                        //user role에 따른 권한부여X
                        //.antMatchers(HttpMethod.PATCH, "/*/user/**").hasRole("USER")

                        //.antMatchers(HttpMethod.GET, "/*/members").hasRole("ADMIN")
                        //.antMatchers(HttpMethod.GET, "/*/user/**").hasAnyRole("USER", "ADMIN")


                        //.anyRequest().permitAll()
                        //.anyRequest().authenticated()

                ).oauth2Login(oauth2 -> oauth2.successHandler(new Oauth2UserSuccessHandler(jwtTokenizer, authorityUtils,
                userRepository)));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }


    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("OPTIONS", "GET", "POST", "PATCH", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization",
                "Access-Control-Allow-Headers", "Access-Control-Allow-Origin", "Refresh"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Refresh"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    public class CustomFilterConfigure extends AbstractHttpConfigurer<CustomFilterConfigure, HttpSecurity> {
        @Override
        public void configure(HttpSecurity builder) throws Exception {
            AuthenticationManager authenticationManager = builder.getSharedObject(AuthenticationManager.class);

            JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(authenticationManager, jwtTokenizer);
            jwtAuthenticationFilter.setFilterProcessesUrl("/user/login");
            jwtAuthenticationFilter.setAuthenticationSuccessHandler(new UserAuthenticationSuccessHandler());
            jwtAuthenticationFilter.setAuthenticationFailureHandler(new UserAuthenticationFailureHandler());

            JwtVerificationFilter jwtVerificationFilter = new JwtVerificationFilter(jwtTokenizer, authorityUtils, new ObjectMapper());

            builder
                    .addFilter(jwtAuthenticationFilter)
                    .addFilterAfter(jwtVerificationFilter, JwtAuthenticationFilter.class)
                    .addFilterAfter(jwtVerificationFilter, OAuth2LoginAuthenticationFilter.class);
        }
    }
}
