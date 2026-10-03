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

    public String analyzeFinancesAndRespond(String userQuery) {
        // 1. Build a local database context window from your PostgreSQL transactional ledger
        List<Transaction> transactions = transactionRepository.findAll();
        String ledgerContext = transactions.stream()
                .map(tx -> String.format("ID: %s, Amount: ₹%.2f, Desc: %s, Cat: %s, Anomaly: %b",
                        tx.getId(), tx.getAmount(), tx.getDescription(), tx.getCategory(), tx.getIsAnomaly()))
                .collect(Collectors.joining("\n"));

        if (ledgerContext.isEmpty()) {
            ledgerContext = "No history record entries found inside the ledger database.";
        }

        // 2. Initialize LangChain4j Google Gemini model engine
        GoogleAiGeminiChatModel model = GoogleAiGeminiChatModel.builder()
                .apiKey(this.geminiApiKey)
                .modelName("gemini-3.8-flash")
                .build();

        // 3. Construct a guarded financial context prompt frame
        String prompt = String.format("""
                You are an expert AI financial analyst and compliance auditor.
                Using only the actual transaction records provided below, answer the user's inquiry accurately.
                
                ---
                TRANSACTION DATABASE RECORDS:
                %s
                ---
                
                USER QUESTION: %s
                
                RESPONSE:
                """, ledgerContext, userQuery);

        // 4. Fire network request execution to Gemini
        return model.generate(prompt);
    }
}
