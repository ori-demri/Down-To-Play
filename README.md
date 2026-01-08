# Down To Play ⚽

A React Native app for finding soccer teammates, discovering courts, and organizing pickup games.

## Features

- 🔐 **Google Authentication** - Sign in with your Google account
- 📍 **Nearby Players** - Find players ready to play in your area
- 🏟️ **Court Finder** - Discover soccer courts and fields on a map
- 📅 **Game Organization** - Create and join pickup games
- 👥 **Player Matching** - Request to join games and manage participants
- 🗺️ **Interactive Map** - See courts, games, and players on a live map
- 🔔 **Real-time Updates** - Get live updates on game changes

## Tech Stack

- **React Native** with Expo
- **Supabase** (Auth, Database, Real-time)
- **React Native Maps** for location features
- **Zustand** for state management
- **TypeScript** for type safety
- **pnpm** for package management

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (`npm install -g pnpm`)
- Expo CLI (`pnpm add -g expo-cli`)
- Supabase account
- Google Cloud Console account (for OAuth)

### 1. Clone and Install

```bash
cd down-to-play
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Get your project URL and anon key from Settings > API

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - For iOS: Add your bundle identifier
   - For Android: Add your package name and SHA-1
   - Add authorized redirect URI: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
5. In Supabase Dashboard > Authentication > Providers, enable Google and add your Client ID and Secret

### 4. Configure Environment

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Configure Maps (Optional for development)

For production, add your Google Maps API keys to `app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_KEY"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_KEY"
        }
      }
    }
  }
}
```

### 6. Run the App

```bash
# Start the development server
pnpm start

# Run on iOS simulator
pnpm ios

# Run on Android emulator
pnpm android
```

## Project Structure

```
down-to-play/
├── App.tsx                 # App entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── GameCard.tsx
│   │   └── PlayerCard.tsx
│   ├── config/
│   │   └── supabase.ts    # Supabase client setup
│   ├── navigation/        # Navigation structure
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   └── WelcomeScreen.tsx
│   │   └── main/
│   │       ├── HomeScreen.tsx
│   │       ├── MapScreen.tsx
│   │       ├── GamesScreen.tsx
│   │       ├── GameDetailScreen.tsx
│   │       ├── CreateGameScreen.tsx
│   │       ├── PlayersScreen.tsx
│   │       ├── PlayerDetailScreen.tsx
│   │       ├── ProfileScreen.tsx
│   │       └── EditProfileScreen.tsx
│   ├── stores/            # Zustand state management
│   │   ├── authStore.ts
│   │   ├── gameStore.ts
│   │   ├── playerStore.ts
│   │   ├── courtStore.ts
│   │   └── locationStore.ts
│   ├── theme/             # Styling constants
│   │   ├── colors.ts
│   │   └── spacing.ts
│   └── types/
│       └── database.ts    # TypeScript types
└── supabase/
    └── schema.sql         # Database schema
```

## Database Schema

The app uses four main tables:

- **profiles** - User profiles with location and preferences
- **courts** - Soccer court/field information
- **games** - Pickup game announcements
- **game_participants** - Player-game relationships

See `supabase/schema.sql` for the complete schema with RLS policies.

## Key Features Explained

### Finding Nearby Players
Players can set themselves as "available" and share their location. The app calculates distances using the Haversine formula and shows nearby available players.

### Creating Games
Users can create games by:
- Selecting an existing court or entering a custom location
- Setting date, time, and number of players needed
- Optionally specifying skill level

### Joining Games
Players can request to join games. Game organizers receive pending requests and can approve or reject players.

### Real-time Updates
The app uses Supabase's real-time subscriptions to instantly update game information when participants join or leave.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for learning or building your own app!
