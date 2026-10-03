package com.finance.wallet.dto;

public class MlTransactionRequest {
    private String transaction_id;
    private Double amount;
    private Integer hour_of_day;

    public MlTransactionRequest() {}
    public MlTransactionRequest(String transaction_id, Double amount, Integer hour_of_day) {
        this.transaction_id = transaction_id;
        this.amount = amount;
        this.hour_of_day = hour_of_day;
    }

    public String getTransaction_id() { return transaction_id; }
    public void setTransaction_id(String transaction_id) { this.transaction_id = transaction_id; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public Integer getHour_of_day() { return hour_of_day; }
    public void setHour_of_day(Integer hour_of_day) { this.hour_of_day = hour_of_day; }
}