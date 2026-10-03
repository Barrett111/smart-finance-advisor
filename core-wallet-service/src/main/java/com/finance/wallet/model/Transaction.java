package com.finance.wallet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private Double amount;
    private String description;
    private String category;
    private LocalDateTime timestamp;
    private Boolean isAnomaly;
    private Double anomalyScore;

    public Transaction() {}
    public Transaction(Double amount, String description, String category, LocalDateTime timestamp) {
        this.amount = amount;
        this.description = description;
        this.category = category;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Boolean getIsAnomaly() { return isAnomaly; }
    public void setIsAnomaly(Boolean anomaly) { isAnomaly = anomaly; }
    public Double getAnomalyScore() { return anomalyScore; }
    public void setAnomalyScore(Double score) { this.anomalyScore = score; }
}