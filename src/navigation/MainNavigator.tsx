import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import MapScreen from '../screens/main/MapScreen';
import GamesScreen from '../screens/main/GamesScreen';
import GameDetailScreen from '../screens/main/GameDetailScreen';
import CreateGameScreen from '../screens/main/CreateGameScreen';
import PlayersScreen from '../screens/main/PlayersScreen';
import PlayerDetailScreen from '../screens/main/PlayerDetailScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';

// Type definitions
export type MainTabParamList = {
  HomeTab: undefined;
  MapTab: undefined;
  GamesTab: undefined;
  PlayersTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  GameDetail: { gameId: string };
  PlayerDetail: { playerId: string };
};

export type MapStackParamList = {
  Map: undefined;
  GameDetail: { gameId: string };
  PlayerDetail: { playerId: string };
};

export type GamesStackParamList = {
  Games: undefined;
  GameDetail: { gameId: string };
  CreateGame: undefined;
};

export type PlayersStackParamList = {
  Players: undefined;
  PlayerDetail: { playerId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const MapStack = createNativeStackNavigator<MapStackParamList>();
const GamesStack = createNativeStackNavigator<GamesStackParamList>();
const PlayersStack = createNativeStackNavigator<PlayersStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Stack Navigators
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: 'Down To Play' }} />
      <HomeStack.Screen name="GameDetail" component={GameDetailScreen} options={{ title: 'Game Details' }} />
      <HomeStack.Screen name="PlayerDetail" component={PlayerDetailScreen} options={{ title: 'Player Profile' }} />
    </HomeStack.Navigator>
  );
}

function MapStackNavigator() {
  return (
    <MapStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <MapStack.Screen name="Map" component={MapScreen} options={{ title: 'Nearby' }} />
      <MapStack.Screen name="GameDetail" component={GameDetailScreen} options={{ title: 'Game Details' }} />
      <MapStack.Screen name="PlayerDetail" component={PlayerDetailScreen} options={{ title: 'Player Profile' }} />
    </MapStack.Navigator>
  );
}

function GamesStackNavigator() {
  return (
    <GamesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <GamesStack.Screen name="Games" component={GamesScreen} options={{ title: 'Games' }} />
      <GamesStack.Screen name="GameDetail" component={GameDetailScreen} options={{ title: 'Game Details' }} />
      <GamesStack.Screen name="CreateGame" component={CreateGameScreen} options={{ title: 'Create Game' }} />
    </GamesStack.Navigator>
  );
}

function PlayersStackNavigator() {
  return (
    <PlayersStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <PlayersStack.Screen name="Players" component={PlayersScreen} options={{ title: 'Players' }} />
      <PlayersStack.Screen name="PlayerDetail" component={PlayerDetailScreen} options={{ title: 'Player Profile' }} />
    </PlayersStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    </ProfileStack.Navigator>
  );
}

// Main Tab Navigator
export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.lightGray,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'MapTab':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'GamesTab':
              iconName = focused ? 'football' : 'football-outline';
              break;
            case 'PlayersTab':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="MapTab" component={MapStackNavigator} options={{ tabBarLabel: 'Map' }} />
      <Tab.Screen name="GamesTab" component={GamesStackNavigator} options={{ tabBarLabel: 'Games' }} />
      <Tab.Screen name="PlayersTab" component={PlayersStackNavigator} options={{ tabBarLabel: 'Players' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
