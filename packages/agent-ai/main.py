from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class SuggestRequest(BaseModel):
  telefone: str

class SuggestResponse(BaseModel):
  suggestions: list[str]

@app.post("/suggest", response_model=SuggestResponse)
def suggest(req: SuggestRequest) -> SuggestResponse:
  # Placeholder suggestions; production would query OpenAI and MongoDB
  return SuggestResponse(suggestions=["Café", "Sanduíche", "Suco"])

