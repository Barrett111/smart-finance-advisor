import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest

app = FastAPI(title="ML Financial Analytics Engine", version="1.0")

model = IsolationForest(contamination=0.05, random_state=42)

def train_baseline_model():
    global model
    np.random.seed(42)
    normal_amounts = np.random.normal(loc=1500, scale=800, size=500)
    normal_amounts = np.clip(normal_amounts, 100, 5000)
    normal_hours = np.random.randint(8, 22, size=500)
    X_train = np.column_stack((normal_amounts, normal_hours))
    model.fit(X_train)
    print("✅ Isolation Forest baseline model trained successfully.")

@app.on_event("startup")
async def startup_event():
    train_baseline_model()

class TransactionData(BaseModel):
    transaction_id: str
    amount: float
    hour_of_day: int

class PredictionResponse(BaseModel):
    transaction_id: str
    is_anomaly: bool
    anomaly_score: float

@app.post("/api/v1/analytics/inspect", response_model=PredictionResponse)
async def inspect_transaction(tx: TransactionData):
    try:
        features = np.array([[tx.amount, tx.hour_of_day]])
        prediction = model.predict(features)
        score = model.decision_function(features)
        is_anomaly = True if prediction == -1 else False
        
        return PredictionResponse(
            transaction_id=tx.transaction_id,
            is_anomaly=is_anomaly,
            anomaly_score=float(score)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML Processing Error: {str(e)}")

