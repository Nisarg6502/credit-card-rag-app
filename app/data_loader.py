import json

def load_data(file_path):
    with open(file_path, "r") as f:
        data = json.load(f)
    return data

def flatten_documents(data):
    # Flatten each credit card's details into a single string document.
    documents = []
    card_names = []

    for card in data:
        card_names.append(card["cardName"])
        doc_parts = [f"Card: {card['cardName']}."]
        for key, value in card.items():
            if key != "cardName":
                # Convert nested dicts/lists into a string
                doc_parts.append(f"{key}: {json.dumps(value)}.")
        documents.append(" ".join(doc_parts))
    return documents, card_names