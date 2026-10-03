package com.finance.wallet.service;

import com.finance.wallet.dto.MlPredictionResponse;
import com.finance.wallet.dto.MlTransactionRequest;
import com.finance.wallet.model.Transaction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;

@Service
public class MlAnalyticsClient {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String mlServiceUrl;

    public MlAnalyticsClient(@Value("${services.ml-analytics.url}") String mlServiceUrl) {
        this.mlServiceUrl = mlServiceUrl;
    }

    public MlPredictionResponse evaluateTransaction(Transaction transaction) {
        try {
            String endpoint = mlServiceUrl + "/api/v1/analytics/inspect";
            int hour = transaction.getTimestamp() != null ? transaction.getTimestamp().getHour() : LocalDateTime.now().getHour();
            MlTransactionRequest request = new MlTransactionRequest(transaction.getId(), transaction.getAmount(), hour);
            return restTemplate.postForObject(endpoint, request, MlPredictionResponse.class);
        } catch (Exception e) {
            MlPredictionResponse fallback = new MlPredictionResponse();
            fallback.setTransaction_id(transaction.getId());
            fallback.setIs_anomaly(false);
            fallback.setAnomaly_score(0.0);
            return fallback;
        }
    }
}