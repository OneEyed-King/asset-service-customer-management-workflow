package com.vc.roservicemanager;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class TempHashGenerator {
    public static void main(String[] args) {

        System.out.println(
                Encoders.BASE64.encode(
                        Keys.secretKeyFor(SignatureAlgorithm.HS256).getEncoded()
                )
        );

        System.out.println("token "+
                new BCryptPasswordEncoder().encode("Admin@123")
        );

    }
}
