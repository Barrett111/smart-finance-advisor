package com.finance.wallet.controller;

import com.finance.wallet.model.Transaction;
import com.finance.wallet.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final WalletService walletService;

    public TransactionController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Map<String, Object> payload) {
        Double amount = Double.valueOf(payload.get("amount").toString());
        String description = (String) payload.get("description");
        String category = (String) payload.get("category");

        Transaction processedTx = walletService.processTransaction(amount, description, category);
        return ResponseEntity.ok(processedTx);
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> fetchLedger() {
        return ResponseEntity.ok(walletService.getAllTransactions());
    }
}
