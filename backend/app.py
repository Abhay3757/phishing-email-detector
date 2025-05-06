from flask import Flask, request, jsonify
import re
import requests
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure the Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Gemini model
model = genai.GenerativeModel('gemini-1.5-flash')

def analyze_email_content(email_body):
    """
    Send email content to Gemini API for phishing detection analysis
    """
    prompt = f"""
    Act as a cybersecurity expert specializing in phishing email detection. 
    Analyze the following email content and determine if it's likely to be a phishing attempt.
    
    Consider these key phishing indicators:
    1. Urgency or threatening language
    2. Poor grammar or spelling
    3. Mismatched or suspicious sender information
    4. Requests for personal information
    5. Suspicious attachments or links
    6. Offers that seem too good to be true
    
    Email content:
    {email_body}
    
    Provide a structured analysis with:
    - Phishing likelihood (High, Medium, Low)
    - Key suspicious elements found (if any)
    - Brief explanation of your assessment
    
    Format your response as a JSON with the following fields:
    - phishing_likelihood: "High", "Medium", or "Low"
    - suspicious_elements: [list of suspicious elements]
    - explanation: Your reasoning
    """
    
    try:
        response = model.generate_content(prompt)
        # Parse the response text as JSON
        try:
            # Remove any markdown formatting that Gemini might add
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            return clean_text
        except Exception as e:
            return {
                "phishing_likelihood": "Unknown",
                "suspicious_elements": [],
                "explanation": f"Error parsing response: {str(e)}"
            }
    except Exception as e:
        return {
            "phishing_likelihood": "Unknown",
            "suspicious_elements": [],
            "explanation": f"Error with Gemini API: {str(e)}"
        }

def extract_urls(email_body):
    """
    Extract all URLs from the email body
    """
    # URL regex pattern
    url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+|[^\s<>"]+\.[a-zA-Z]{2,}(?:/[^\s<>"]*)?'
    
    # Find all matches
    urls = re.findall(url_pattern, email_body)
    return urls

def analyze_url(url):
    """
    Analyze a URL for phishing indicators using Gemini API
    """
    prompt = f"""
    Act as a cybersecurity expert specializing in URL analysis. 
    Analyze the following URL and determine if it's likely to be malicious or part of a phishing attempt.
    
    URL: {url}
    
    Consider these key suspicious indicators:
    1. Domain misspellings or lookalike domains 
    2. Unusual subdomains
    3. Non-standard TLDs
    4. Excessive use of numbers or special characters
    5. Unusually long domains
    6. URL shorteners that might hide the actual destination
    
    Format your response as a JSON with the following fields:
    - suspicious_likelihood: "High", "Medium", or "Low"
    - suspicious_elements: [list of suspicious elements]
    - explanation: Your reasoning
    """
    
    try:
        response = model.generate_content(prompt)
        try:
            # Remove any markdown formatting that Gemini might add
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            return clean_text
        except Exception as e:
            return {
                "suspicious_likelihood": "Unknown",
                "suspicious_elements": [],
                "explanation": f"Error parsing response: {str(e)}"
            }
    except Exception as e:
        return {
            "suspicious_likelihood": "Unknown",
            "suspicious_elements": [],
            "explanation": f"Error with Gemini API: {str(e)}"
        }

@app.route('/api/analyze', methods=['POST'])
def analyze_email():
    """
    Main endpoint for email analysis. Expects email_body in the request JSON.
    """
    data = request.get_json()
    
    if not data or 'email_body' not in data:
        return jsonify({"error": "Email body is required"}), 400
    
    email_body = data['email_body']
    
    # Analyze the email content
    content_analysis = analyze_email_content(email_body)
    
    # Extract and analyze URLs
    urls = extract_urls(email_body)
    url_analysis = {}
    
    for url in urls:
        url_analysis[url] = analyze_url(url)
    
    response = {
        "content_analysis": content_analysis,
        "url_analysis": url_analysis
    }
    
    return jsonify(response)

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)