package com.finance.wallet.service;

import com.finance.wallet.dto.MlPredictionResponse;
import com.finance.wallet.model.Transaction;
import com.finance.wallet.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class WalletService {
    private final TransactionRepository transactionRepository;
    private final MlAnalyticsClient mlAnalyticsClient;

    public WalletService(TransactionRepository transactionRepository, MlAnalyticsClient mlAnalyticsClient) {
        this.transactionRepository = transactionRepository;
        this.mlAnalyticsClient = mlAnalyticsClient;
    }

    @Transactional
    public Transaction processTransaction(Double amount, String description, String category, String username) {
        Transaction transaction = new Transaction(amount, description, category, LocalDateTime.now());
        transaction.setUsername(username);
        transaction = transactionRepository.save(transaction);
        MlPredictionResponse prediction = mlAnalyticsClient.evaluateTransaction(transaction);
        transaction.setIsAnomaly(prediction.getIs_anomaly());
        transaction.setAnomalyScore(prediction.getAnomaly_score());
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionsFor(String username) {
        return transactionRepository.findByUsername(username);
    }

    
}