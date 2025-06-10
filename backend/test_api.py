#!/usr/bin/env python3
"""
Test script for the language learning app backend API.
This script sends a test request to the POS tagging endpoint.
"""

import requests
import json
import sys

def test_pos_tagging(base_url="http://localhost:5000"):
    """Test the POS tagging API endpoint."""
    
    test_texts = {
        "en": "The quick brown fox jumps over the lazy dog.",
        "es": "La vida es lo que sucede cuando estás ocupado haciendo otros planes.",
        "fr": "Je pense, donc je suis.",
        "de": "Der Mensch ist frei geboren, und überall liegt er in Ketten."
    }
    
    endpoint = f"{base_url}/api/analyze-pos"
    
    print("\n===== Testing POS Tagging API =====\n")
    
    success_count = 0
    total_tests = len(test_texts)
    
    for lang, text in test_texts.items():
        print(f"Testing {lang.upper()} text: \"{text}\"")
        
        try:
            response = requests.post(
                endpoint,
                json={"text": text, "language": lang},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "entities" in data and len(data["entities"]) > 0:
                    print(f"✅ Success! Received {len(data['entities'])} tagged words")
                    print("Sample tags:")
                    for entity in data["entities"][:3]:  # Show first 3 entities
                        print(f"  - {entity['word']}: {entity['type']}")
                    success_count += 1
                else:
                    print("❌ Error: Response has no entities or is empty")
            else:
                print(f"❌ Error: Received status code {response.status_code}")
                print(f"Response: {response.text}")
        
        except requests.exceptions.ConnectionError:
            print("❌ Error: Could not connect to the server. Is it running?")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Error: {str(e)}")
        
        print("")
    
    # Summary
    print(f"\nTest summary: {success_count}/{total_tests} tests passed")
    
    if success_count == total_tests:
        print("\n🎉 All tests passed! The backend is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Check the errors above.")

if __name__ == "__main__":
    # Get custom URL from command line if provided
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    test_pos_tagging(base_url) 