# Menu Scanner App

Menu Scanner App is a React Native application built using Expo. This app lets users scan menus using their phone's camera, recognize text, and display structured information such as dish names, descriptions, and prices. The app also fetches relevant images and generates descriptions using OpenAI's GPT API.

## Problem

- Many people who go out to eat at a restaurant sometimes struggle with deciding on what to order on the menu, the main reason being is because sometimes, the menu they are ordering from doesn't always display the image of the dish, resulting in indecisiveness of what to order, and stalling.

## Solution

MenuScan allows users to scan a menu and displays images of the menu's dishes to help streamline and make ordering items easier.
---

## Features

- **Camera Integration**: Capture menu images directly from the app.
- **Text Recognition**: Extract text from images using Google Vision API.
- **Dish Parsing**: Parse dish names, descriptions, and prices from recognized text.
- **Image Fetching**: Automatically fetch relevant dish images using Google Custom Search API.
- **AI Descriptions**: Generate appealing descriptions for dishes using OpenAI's GPT API.
- **Interactive Layout**: Users can click on dishes to view detailed information.

---

## Tech Stack Used

- **React Native**: Cross-platform app development framework.
- **Expo**: Framework and platform for universal React apps.
- **Expo Router**: File-based routing for React Native.
- **Google Vision API**: Optical character recognition (OCR) for text detection.
- **Google Custom Search API**: Fetch relevant dish images.
- **OpenAI API**: Generate AI-based dish descriptions.

---

### Prerequisites I Needed

- Node.js and npm installed
- Expo CLI installed globally (`npm install -g expo-cli`)
- Google Vision API Key
- Google Custom Search Engine ID and API Key
- OpenAI API Key


## Folder Structure

```
menu-scanner-app/
├── app/
│   ├── index.tsx         # Home screen with "Start Scanning" button
│   ├── explore.tsx       # Explore screen
│   ├── camera.tsx        # Camera screen for menu scanning
│
├── components/           # Reusable UI components
│   ├── HapticTab.tsx     # Tab bar with haptic feedback
│   ├── TabBarBackground.tsx # Custom tab bar background
│
├── constants/
│   ├── Colors.ts         # App color scheme
│
├── hooks/
│   ├── useColorScheme.ts # Custom hook for dark/light mode
│
├── README.md             # Project documentation
├── package.json          # Project configuration and dependencies
├── .env                  # API keys and secrets (not included in the repo)
```

---

## Usage

1. Open the app and navigate to the Home screen.
2. Click the **Start Scanning** button to open the camera.
3. Capture a photo of a menu.
4. The app processes the menu image and displays:
   - Dish names
   - Prices
   - Descriptions (from the menu or AI-generated)
   - Relevant dish images

---

## Customization

- **Styling**: Modify styles in the `styles` objects in various files.
- **API Integration**: Update or replace API calls in `camera.tsx`.
- **Navigation**: Add or modify screens using Expo Router.

---

## Limitations

- The app requires API keys for Google Vision, Google Custom Search, and OpenAI.
- Limited to the API quotas and restrictions of Google and OpenAI.
- The OCR and parsing may not always correctly interpret complex or poorly formatted menus.

---

## Future Improvements

- Implement offline OCR functionality.
- Add support for multiple languages in menu recognition.
- Enable user editing of recognized text for corrections.
- Enhance the UI with more animations and themes.
- Fully build the entire App and not just have a small MVP

---

This project is licensed under the MIT License.

---

## Acknowledgments

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Google Cloud Platform](https://cloud.google.com/)
- [OpenAI](https://openai.com/)
