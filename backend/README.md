# Language Learning App - spaCy Backend

This is a Flask-based backend service that provides Part-of-Speech (POS) tagging using spaCy, a powerful natural language processing library.

## Setup

1. Make sure you have Python 3.8+ installed.

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Download the required spaCy language models:
   ```bash
   python -m spacy download en_core_web_sm
   python -m spacy download es_core_news_sm
   python -m spacy download fr_core_news_sm
   python -m spacy download de_core_news_sm
   ```
   Note: You can add more models as needed.

## Running the Server

1. Start the Flask server:
   ```bash
   python app.py
   ```

2. The server will run at `http://localhost:5000`.

## API Endpoints

### POST /api/analyze-pos

Analyzes text for part-of-speech tags.

**Request Body:**
```json
{
  "text": "Text to analyze",
  "language": "en"  // language code: en, es, fr, de, etc.
}
```

**Response:**
```json
{
  "entities": [
    {
      "word": "Text",
      "type": "NOUN",
      "position": [0, 4]
    },
    {
      "word": "to",
      "type": "ADP",
      "position": [5, 7]
    },
    {
      "word": "analyze",
      "type": "VERB",
      "position": [8, 15]
    }
  ]
}
```

## Error Handling

- If a language model is not available, the server will attempt to download it.
- If the download fails, it will fall back to the English model.
- If no text is provided, the server will return a 400 error.

## POS Tag Mapping

The API standardizes part-of-speech tags across different languages:

- NOUN: Nouns
- PROPN: Proper nouns
- VERB: Verbs (includes AUX)
- ADJ: Adjectives
- ADV: Adverbs
- ADP: Adpositions (prepositions)
- CONJ: Conjunctions (coordinating and subordinating)
- DET: Determiners
- PRON: Pronouns
- NUM: Numerals
- SYM: Symbols
- X: Other
- PART: Particles
- INTJ: Interjections 