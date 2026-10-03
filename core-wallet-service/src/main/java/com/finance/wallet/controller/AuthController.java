package com.finance.wallet.controller;

import com.finance.wallet.model.User;
import com.finance.wallet.repository.UserRepository;
import com.finance.wallet.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is already claimed."));
        }

        // Encrypt plain password before committing it to PostgreSQL
        String encryptedPassword = passwordEncoder.encode(password);
        User user = new User(username, encryptedPassword, "ROLE_USER");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User account registered cleanly."));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid user credential claims."));
        }

        User user = userOpt.get();
        String generatedJwtToken = jwtService.generateToken(user.getUsername(), user.getRole());

        return ResponseEntity.ok(Map.of("token", generatedJwtToken, "role", user.getRole()));
    }
}
