import sys
from pathlib import Path
from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[1]))
from main import app

client = TestClient(app)

def test_suggest():
    response = client.post("/suggest", json={"telefone": "123"})
    assert response.status_code == 200
    data = response.json()
    assert data["suggestions"] == ["Café", "Sanduíche", "Suco"]
