import re

def scrub_pii(text: str) -> str:
    """
    Standardizes output by removing potential Personally Identifiable Information (PII).
    Fulfills Privacy Compliance by ensuring raw identity data is never sent for AI inference.
    """
    if not text:
        return text

    # Scrub Emails
    text = re.sub(r'[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[EMAIL]', text)
    
    # Scrub Phone Numbers (various formats)
    text = re.sub(r'\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}', '[PHONE]', text)
    
    # Scrub potential people names (greedy but effective for summaries)
    # This is a simple regex, for enterprise a proper NER model (like SpaCy) would be better.
    # We focus on common patterns in sales data like "Customer: John Doe"
    text = re.sub(r'(Customer|Sales Rep|Manager):\s*([A-Z][a-z]+)\s+([A-Z][a-z]+)', r'\1: [NAME]', text)
    
    return text
