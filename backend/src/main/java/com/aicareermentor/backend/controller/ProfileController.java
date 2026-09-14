package com.aicareermentor.backend.controller;

import com.aicareermentor.backend.dto.ProfileRequest;
import com.aicareermentor.backend.dto.ProfileResponse;
import com.aicareermentor.backend.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    // Create or update profile
    @PostMapping
    public ResponseEntity<ProfileResponse> saveProfile(
            @Valid @RequestBody ProfileRequest request
    ) {

        ProfileResponse response =
                profileService.saveProfile(request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }

    // Get profile by user ID
    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponse> getProfile(
            @PathVariable Long userId
    ) {

        ProfileResponse response =
                profileService.getProfile(userId);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }

    // Update profile
    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @Valid @RequestBody ProfileRequest request
    ) {

        ProfileResponse response =
                profileService.saveProfile(request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }
}
