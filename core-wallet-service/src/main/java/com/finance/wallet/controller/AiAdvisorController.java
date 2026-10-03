package com.finance.wallet.controller;

import com.finance.wallet.service.FinancialAdvisorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@CrossOrigin(origins = "*")
public class AiAdvisorController {
    private final FinancialAdvisorService advisorService;

    public AiAdvisorController(FinancialAdvisorService advisorService) {
        this.advisorService = advisorService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> askAdvisor(@RequestBody Map<String, String> payload) {
        Map<String, String> responseMap = new HashMap<>();
        try {
            String userQuery = payload.get("query");
            if (userQuery == null || userQuery.trim().isEmpty()) {
                responseMap.put("error", "Query cannot be empty.");
                return ResponseEntity.badRequest().body(responseMap);
            }

            String aiResponse = advisorService.analyzeFinancesAndRespond(userQuery);
            
            // Protect against empty/null responses from AI
            if (aiResponse == null || aiResponse.trim().isEmpty()) {
                aiResponse = "The AI model returned an empty response. Please verify your API Key and connectivity.";
            }
            
            responseMap.put("response", aiResponse);
            return ResponseEntity.ok(responseMap);

        } catch (Exception e) {
            responseMap.put("error", "Controller failure: " + e.getMessage());
            return ResponseEntity.status(500).body(responseMap);
        }
    }
}
