package com.aicareermentor.backend.service;

import com.aicareermentor.backend.entity.PasswordResetToken;
import com.aicareermentor.backend.entity.User;
import com.aicareermentor.backend.repository.PasswordResetTokenRepository;
import com.aicareermentor.backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

   public String createResetToken(String email) {

        User user = userRepository
                .findByEmail(email.trim().toLowerCase())
                .orElse(null);

        // Don't reveal whether an email exists
       if (user == null) {
    return null;

}

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken =
                new PasswordResetToken();

        resetToken.setToken(token);
        resetToken.setUser(user);

        // Token valid for 15 minutes
        resetToken.setExpiresAt(
                LocalDateTime.now().plusMinutes(15)
        );

        resetToken.setUsed(false);

        tokenRepository.save(resetToken);

        // TEMPORARY:
        // Print reset link in backend console.
        // We'll replace this with email sending next.
        System.out.println(
                "PASSWORD RESET LINK:"
                        + " http://localhost:5173/reset-password?token="
                        + token
        );

        return token; 
   }
  

    public void resetPassword(
            String token,
            String newPassword
    ) {

        PasswordResetToken resetToken =
                tokenRepository.findByToken(token)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid reset link."
                                )
                        );

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException(
                    "This reset link has already been used."
            );
        }

        if (resetToken.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "This reset link has expired."
            );
        }

        User user = resetToken.getUser();

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);

        resetToken.setUsed(true);

        tokenRepository.save(resetToken);
    }
}