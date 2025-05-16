import spacy
from transformers import pipeline

nlp = spacy.load("en_core_web_sm")
sentiment_analyzer = pipeline("sentiment-analysis")

def interpret_dream(dream_text):
    try:
        doc = nlp(dream_text)
        entities = [ent.text for ent in doc.ents]
        sentiment = sentiment_analyzer(dream_text)[0]
        interpretation = f"Dream entities: {entities}, Sentiment: {sentiment['label']} (Score: {sentiment['score']:.2f})"
        return interpretation
    except Exception as e:
        return f"Error in dream interpretation: {str(e)}"