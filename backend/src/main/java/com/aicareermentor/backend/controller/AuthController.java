package com.aicareermentor.backend.controller;

import com.aicareermentor.backend.dto.LoginRequest;
import com.aicareermentor.backend.dto.SignupRequest;
import com.aicareermentor.backend.dto.UserResponse;
import com.aicareermentor.backend.dto.ForgotPasswordRequest;
import com.aicareermentor.backend.dto.ResetPasswordRequest;
import com.aicareermentor.backend.service.AuthService;
import com.aicareermentor.backend.service.PasswordResetService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(
            AuthService authService,
            PasswordResetService passwordResetService) {

        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(
            @Valid @RequestBody SignupRequest request) {

        UserResponse user = authService.signup(request);

        Map<String, Object> response = new HashMap<>();

        response.put("success", true);
        response.put("user", user);
        response.put("message", "Account created successfully");

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @Valid @RequestBody LoginRequest request) {

        UserResponse user = authService.login(request);

        Map<String, Object> response = new HashMap<>();

        response.put("success", true);
        response.put("user", user);
        response.put("message", "Login successful");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
public ResponseEntity<Map<String, Object>> forgotPassword(
        @Valid @RequestBody ForgotPasswordRequest request) {

   String token = passwordResetService.createResetToken(request.getEmail());

    Map<String, Object> response = new HashMap<>();

    response.put("success", true);
    response.put(
            "message",
            "If an account exists for this email, you can reset the password."
    );

    if (token != null) {
    response.put("token", token);
}

    return ResponseEntity.ok(response);
}

    // RESET PASSWORD
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        passwordResetService.resetPassword(
                request.getToken(),
                request.getNewPassword()
        );

        Map<String, Object> response = new HashMap<>();

        response.put("success", true);
        response.put("message", "Password reset successfully.");

        return ResponseEntity.ok(response);
    }
}