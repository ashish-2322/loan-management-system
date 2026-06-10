package com.loanapp.loanmanagement.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        boolean shouldSkip = path.startsWith("/api/auth/");
        log.info("JwtFilter shouldNotFilter: path={}, shouldSkip={}", path, shouldSkip);
        return shouldSkip;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String requestPath = request.getServletPath();
        log.info("JwtFilter request path={}, AuthorizationPresent={}", requestPath, authHeader != null);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (authHeader == null) {
                log.warn("Missing Authorization header for request {}", requestPath);
            } else {
                log.warn("Invalid Authorization header for request {}: {}", requestPath, authHeader);
            }
            logCustomerSecurityDebug(requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        log.info("JwtFilter token received for request {}", requestPath);

        if (!jwtUtil.validateToken(token)) {
            log.warn("Invalid JWT token for request {}", requestPath);
            if (isProtectedApiPath(requestPath)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
                return;
            }
            logCustomerSecurityDebug(requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        String email = jwtUtil.extractEmail(token);
        String role = jwtUtil.extractRole(token);
        log.info("JwtFilter extracted email={}, role={} for request {}", email, role, requestPath);

        if (email != null) {
            UserDetails userDetails = userDetailsService
                    .loadUserByUsername(email);
            log.info("JwtFilter - JWT role={}, DB authorities={}", role, userDetails.getAuthorities());
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
            log.info("JwtFilter set auth principal={} authorities={} for request {}",
                    userDetails.getUsername(), userDetails.getAuthorities(), requestPath);
            System.out.println("JWT FILTER DEBUG - JWT role: " + role + ", DB authorities: " + userDetails.getAuthorities());
        }

        logCustomerSecurityDebug(requestPath);
        filterChain.doFilter(request, response);
    }

    private static boolean isProtectedApiPath(String path) {
        return path.startsWith("/api/customer/")
                || path.startsWith("/api/officer/")
                || path.startsWith("/api/admin/");
    }

    private void logCustomerSecurityDebug(String requestPath) {
        if (!requestPath.startsWith("/api/customer/")) {
            return;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            log.warn("CUSTOMER API DEBUG path={} auth=null authenticated=false authorities=[]",
                    requestPath);
            return;
        }
        log.warn("CUSTOMER API DEBUG path={} username={} authenticated={} authorities={}",
                requestPath, auth.getName(), auth.isAuthenticated(), auth.getAuthorities());
    }
}