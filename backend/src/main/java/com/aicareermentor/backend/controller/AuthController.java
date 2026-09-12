package com.aicareermentor.backend.controller;

import com.aicareermentor.backend.dto.LoginRequest;
import com.aicareermentor.backend.dto.SignupRequest;
import com.aicareermentor.backend.dto.UserResponse;
import com.aicareermentor.backend.service.AuthService;
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

    public AuthController(AuthService authService) {
        this.authService = authService;
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
}