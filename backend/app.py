from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
import os

app = Flask(__name__)
CORS(app)

# python -m spacy download en_core_web_sm
# python -m spacy download es_core_news_sm
# python -m spacy download fr_core_news_sm
# python -m spacy download de_core_news_sm
# python -m spacy download ru_core_news_sm
# python -m spacy download zh_core_web_sm


# Supported spaCy language models
LANGUAGE_MODELS = {
    'en': 'en_core_web_sm',
    'es': 'es_core_news_sm',
    'fr': 'fr_core_news_sm',
    'de': 'de_core_news_sm',
    'ru': 'ru_core_news_sm',
    'zh': 'zh_core_web_sm',
}

# Standardized POS tag mapping
POS_MAP = {
    'NOUN': 'NOUN', 'PROPN': 'PROPN', 'VERB': 'VERB', 'AUX': 'VERB',
    'ADJ': 'ADJ', 'ADV': 'ADV', 'ADP': 'ADP', 'CCONJ': 'CONJ',
    'SCONJ': 'CONJ', 'DET': 'DET', 'PRON': 'PRON', 'PUNCT': 'PUNCT',
    'NUM': 'NUM', 'SYM': 'SYM', 'X': 'X', 'PART': 'PART', 'INTJ': 'INTJ'
}

loaded_models = {}

def load_model(lang):
    model_name = LANGUAGE_MODELS.get(lang, 'en_core_web_sm')
    if lang not in loaded_models:
        try:
            loaded_models[lang] = spacy.load(model_name)
        except OSError:
            os.system(f"python3.10 -m spacy download {model_name}")
            loaded_models[lang] = spacy.load(model_name)
    return loaded_models[lang]


@app.route('/api/analyze-pos', methods=['POST'])
def analyze_pos():
    data = request.get_json()
    text = data.get('text', '').strip()
    lang = data.get('language', 'en')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        nlp = load_model(lang)
        doc = nlp(text)

        entities = [
            {
                'word': token.text,
                'type': POS_MAP.get(token.pos_, "hi"),
                'position': [token.idx, token.idx + len(token.text)]
            }
            for token in doc if not token.is_space and not token.is_punct
        ]

        return jsonify({'entities': entities})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
