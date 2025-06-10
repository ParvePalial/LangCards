#!/usr/bin/env python3
"""
Setup script for the language learning backend service.
This will set up a virtual environment, install dependencies, and download the spaCy models.
"""

import os
import subprocess
import sys
import platform

def run_command(command):
    """Run a shell command and print output."""
    print(f"Running: {command}")
    try:
        subprocess.run(command, shell=True, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Command failed with error: {e}")
        return False

def main():
    # Determine the appropriate virtual environment activation command
    is_windows = platform.system() == "Windows"
    venv_dir = "venv"
    activate_cmd = f"{venv_dir}\\Scripts\\activate" if is_windows else f"source {venv_dir}/bin/activate"
    
    # Create virtual environment if it doesn't exist
    if not os.path.exists(venv_dir):
        print("Creating virtual environment...")
        if not run_command(f"{sys.executable} -m venv {venv_dir}"):
            print("Failed to create virtual environment. Please make sure venv is installed.")
            sys.exit(1)
    
    # In Windows, we need to run scripts differently
    pip_cmd = f"{venv_dir}\\Scripts\\pip" if is_windows else f"{venv_dir}/bin/pip"
    python_cmd = f"{venv_dir}\\Scripts\\python" if is_windows else f"{venv_dir}/bin/python"
    
    # Install dependencies
    print("Installing dependencies...")
    if not run_command(f"{pip_cmd} install -r requirements.txt"):
        print("Failed to install dependencies.")
        sys.exit(1)
    
    # Download spaCy models
    print("Downloading spaCy models...")
    language_models = ["en_core_web_sm", "es_core_news_sm", "fr_core_news_sm", "de_core_news_sm"]
    
    for model in language_models:
        print(f"Downloading {model}...")
        if not run_command(f"{python_cmd} -m spacy download {model}"):
            print(f"Warning: Failed to download {model}. The model may be downloaded automatically when first needed.")
    
    # Display success message and instructions
    print("\n===== Setup Complete =====")
    print(f"To activate the virtual environment, run: {activate_cmd}")
    print("To start the server, run: python app.py")
    print("The API will be available at: http://localhost:5000")

if __name__ == "__main__":
    main() 