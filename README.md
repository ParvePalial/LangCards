# Language Flashcards App

A mobile app for learning vocabulary from different languages using flashcards with AI-generated images.

## Features

- Learn vocabulary from multiple languages: Spanish, French, Japanese, and more
- Flashcard-based learning system with interactive UI
- Progress tracking and level-based learning path
- Optional AI-generated images for visual learning
- Customizable game settings

## Setup

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- React Native development environment
- Expo CLI

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd LanguageFlashcards
```

2. Install dependencies:
```
npm install
```

3. Running the app:
```
npm start
```

This will open the Expo development server. You can run the app on:
- An iOS simulator (requires macOS and Xcode)
- An Android emulator (requires Android Studio)
- Your physical device using the Expo Go app (scan the QR code)

### AI Image Generation (Optional)

To enable AI-generated images for the flashcards:

1. Obtain an OpenAI API key from [https://platform.openai.com/](https://platform.openai.com/)
2. Enter the API key in the Settings screen of the app

## Structure

- `app/`: Expo Router app screens
- `components/`: Reusable React components
- `context/`: Context API for state management
- `types/`: TypeScript type definitions
- `utils/`: Utility functions and helpers
- `services/`: Service layer for external APIs
- `assets/`: CSV files containing vocabulary data

## CSV Data Format

The app reads vocabulary data from CSV files in the following format:

```
OriginalLanguage,EnglishTranslation
word1,translation1
word2,translation2
...
```

## License

This project is open source under the MIT license. 