package com.kayalmart.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

/**
 * Prevents browsers from caching API responses and static assets.
 * Without this, browsers may serve stale cached product data
 * (e.g. old image URLs) even after the server is updated.
 */
@Configuration
public class CacheControlConfig {

    @Bean
    public FilterRegistrationBean<NoStoreFilter> noStoreFilter() {
        FilterRegistrationBean<NoStoreFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new NoStoreFilter());
        registration.addUrlPatterns("/*");
        registration.setName("noStoreFilter");
        registration.setOrder(1);
        return registration;
    }

    public static class NoStoreFilter implements Filter {
        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            if (response instanceof HttpServletResponse httpResponse) {
                httpResponse.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
                httpResponse.setHeader("Pragma", "no-cache");
                httpResponse.setDateHeader("Expires", 0);
            }
            chain.doFilter(request, response);
        }
    }
}
