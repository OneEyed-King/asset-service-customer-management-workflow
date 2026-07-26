package com.vc.roservicemanager.auth.service;

import com.vc.roservicemanager.auth.config.JwtProperties;
import com.vc.roservicemanager.auth.security.AuthenticatedUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class JwtService {

    private static final String TENANT_ID_CLAIM = "tenantId";

    private final JwtProperties jwtProperties;

    public String generateToken(UserDetails userDetails) {

        Date now = new Date();

        Date expiry = new Date(now.getTime() + jwtProperties.getExpiration());

        JwtBuilder builder = Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(now)
                .expiration(expiry);

        // Embed which tenant (business) this token belongs to. Not
        // currently relied on for authorization (every request re-loads
        // the User - and therefore their tenant - fresh from the database
        // via CustomUserDetailsService), but keeping it in the token is
        // cheap defense-in-depth and useful if the app is ever split into
        // multiple services that only trust the token, not a shared DB.
        if (userDetails instanceof AuthenticatedUser authenticatedUser) {
            builder.claim(TENANT_ID_CLAIM, authenticatedUser.getTenantId().toString());
        }

        return builder
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {

        return extractClaim(token, Claims::getSubject);

    }

    public UUID extractTenantId(String token) {

        String tenantId = extractClaim(
                token,
                claims -> claims.get(TENANT_ID_CLAIM, String.class)
        );

        return tenantId != null ? UUID.fromString(tenantId) : null;
    }

    public boolean isTokenValid(String token,
                                UserDetails userDetails) {

        String username = extractUsername(token);

        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);

    }

    public <T> T extractClaim(String token,
                              Function<Claims, T> resolver) {

        Claims claims = extractAllClaims(token);

        return resolver.apply(claims);

    }

    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

    }

    private boolean isTokenExpired(String token) {

        return extractClaim(token,
                Claims::getExpiration).before(new Date());

    }

    private SecretKey getSigningKey() {

        byte[] keyBytes =
                Decoders.BASE64.decode(jwtProperties.getSecret());

        return Keys.hmacShaKeyFor(keyBytes);

    }

}
