package com.finance.wallet.dto;

public class MlPredictionResponse {
    private String transaction_id;
    private Boolean is_anomaly;
    private Double anomaly_score;

    public MlPredictionResponse() {}

    public String getTransaction_id() { return transaction_id; }
    public void setTransaction_id(String transaction_id) { this.transaction_id = transaction_id; }
    public Boolean getIs_anomaly() { return is_anomaly; }
    public void setIs_anomaly(Boolean is_anomaly) { this.is_anomaly = is_anomaly; }
    public Double getAnomaly_score() { return anomaly_score; }
    public void setAnomaly_score(Double anomaly_score) { this.anomaly_score = anomaly_score; }
}