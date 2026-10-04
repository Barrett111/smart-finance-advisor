package com.finance.wallet.service;

import com.finance.wallet.model.Transaction;
import com.finance.wallet.repository.TransactionRepository;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FinancialAdvisorService {

    private final TransactionRepository transactionRepository;
    private final String geminiApiKey;

    public FinancialAdvisorService(TransactionRepository transactionRepository,
                                   @Value("${gemini.api-key}") String geminiApiKey) {
        this.transactionRepository = transactionRepository;
        this.geminiApiKey = geminiApiKey;
    }

    public String analyzeFinancesAndRespond(String userQuery, String username) {
        List<Transaction> transactions = transactionRepository.findByUsername(username);

        double average = transactions.stream()
                .filter(tx -> tx.getAmount() != null)
                .mapToDouble(Transaction::getAmount)
                .average().orElse(0);

        String ledgerContext = transactions.stream()
                .map(tx -> String.format(
                        "Amount: ₹%.2f, Desc: %s, Category: %s, Hour: %s, Flagged: %s, Score: %s",
                        tx.getAmount(), tx.getDescription(), tx.getCategory(),
                        tx.getTimestamp() != null ? tx.getTimestamp().getHour() + ":00" : "unknown",
                        Boolean.TRUE.equals(tx.getIsAnomaly()) ? "YES" : "no",
                        tx.getAnomalyScore() != null ? String.format("%.2f", tx.getAnomalyScore()) : "n/a"))
                .collect(Collectors.joining("\n"));

        if (ledgerContext.isEmpty()) {
            ledgerContext = "No transactions recorded yet.";
        }

        GoogleAiGeminiChatModel model = GoogleAiGeminiChatModel.builder()
                .apiKey(this.geminiApiKey)
                .modelName("gemini-3.8-flash")
                .build();

        String prompt = String.format("""
                You are a financial analyst explaining a user's expenses.
                Use only the records below.

                HOW FLAGGING WORKS:
                An Isolation Forest model checks only two things: the amount and the hour of the day.
                It was trained on typical spending of about ₹100 to ₹5,000 (around ₹1,500 on average),
                made between 8:00 and 22:00. A transaction is flagged when its amount or its hour
                differs strongly from that pattern. A lower score (more negative) means more unusual.
                The model does NOT look at category or description.

                When asked why something was flagged, explain it using that transaction's amount,
                hour and score, and compare the amount with this user's average of ₹%.2f.
                Do not invent other reasons. If the amount and hour both look normal, say the model
                judged the combination unusual compared with its training pattern.

                TRANSACTIONS:
                %s

                QUESTION: %s
                """, average, ledgerContext, userQuery);

        return model.generate(prompt);
    }
}