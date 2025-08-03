import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
  Extrapolate,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import AuthProvider, { useAuth } from './context/AuthContext';
import SignUpScreen from './auth/SignUpScreen';
import LoginScreen from './auth/LoginScreen';
import Questionnaire, { QuestionnaireData } from '../components/Questionnaire';

const { width, height } = Dimensions.get('window');

function SafelyAppContent() {
  const { user, isLoading, signUp, signIn, signInWithGoogle, signOut } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null);
  const [showEntrance, setShowEntrance] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [userPreferences, setUserPreferences] = useState<QuestionnaireData | null>(null);
  
  // Animation values - always declare these
  const subtitleAnim = useSharedValue(0);
  const descriptionAnim = useSharedValue(0);
  const buttonsAnim = useSharedValue(0);
  const progressAnim = useSharedValue(0);
  const backgroundAnim = useSharedValue(0);
  const entranceAnim = useSharedValue(0);
  const entranceTitleAnim = useSharedValue(0);
  const entranceBackgroundAnim = useSharedValue(0);

  // ALL Animated styles - must be declared before any conditional rendering

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleAnim.value,
    transform: [
      { translateY: interpolate(subtitleAnim.value, [0, 1], [30, 0], Extrapolate.CLAMP) }
    ]
  }));

  const descriptionStyle = useAnimatedStyle(() => ({
    opacity: descriptionAnim.value,
    transform: [
      { translateY: interpolate(descriptionAnim.value, [0, 1], [30, 0], Extrapolate.CLAMP) }
    ]
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsAnim.value,
    transform: [
      { translateY: interpolate(buttonsAnim.value, [0, 1], [30, 0], Extrapolate.CLAMP) }
    ]
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(backgroundAnim.value, [0, 1], [0, 50], Extrapolate.CLAMP) },
      { translateY: interpolate(backgroundAnim.value, [0, 1], [0, -30], Extrapolate.CLAMP) }
    ]
  }));

  const buttonGradientStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(backgroundAnim.value, [0, 1], [-100, 100], Extrapolate.CLAMP) }
    ]
  }));

  const entranceTitleStyle = useAnimatedStyle(() => ({
    opacity: entranceTitleAnim.value,
    transform: [
      { scale: interpolate(entranceTitleAnim.value, [0, 1], [0.8, 1], Extrapolate.CLAMP) }
    ]
  }));

  const entranceTitleColorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      entranceAnim.value,
      [0, 1],
      ['#FFFFFF', '#000000'],
      'RGB'
    ),
  }));

  const entranceTitlePositionStyle = useAnimatedStyle(() => ({
    transform: [
      { 
        translateY: interpolate(
          entranceAnim.value, 
          [0, 1], 
          [0, -height * 0.3], // Move from center to top
          Extrapolate.CLAMP
        ) 
      }
    ]
  }));

  const entranceBackgroundStyle = useAnimatedStyle(() => ({
    transform: [
      { 
        rotate: `${interpolate(entranceBackgroundAnim.value, [0, 1], [0, 360], Extrapolate.CLAMP)}deg` 
      },
      { 
        translateX: interpolate(entranceBackgroundAnim.value, [0, 1], [0, 100], Extrapolate.CLAMP) 
      }
    ]
  }));

  const entranceTransitionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(entranceAnim.value, [0, 1], [1, 0], Extrapolate.CLAMP),
  }));

  const steps = [
    {
      subtitle: "For anxiety, sensory sensitivity, and peace of mind",
      description: "Designed for people who struggle to wear headphones due to anxiety, OCD, autism, or trauma. Immerse yourself without fear of missing critical sounds.",
      icon: "shield-checkmark",
      gradient: ["#000000", "#000000"]
    },
    {
      subtitle: "Break free from obsessive worry",
      description: "Whether you have anxiety about safety, sensory processing differences, or trauma-related hypervigilance - Safely gives you back the freedom to concentrate.",
      icon: "ear",
      gradient: ["#000000", "#000000"]
    },
    {
      subtitle: "Complete control and peace of mind",
      description: "All processing happens on your device. No recordings, no data sharing. Just the freedom to focus while staying aware of what matters.",
      icon: "lock-closed",
      gradient: ["#000000", "#000000"]
    }
  ];

  useEffect(() => {
    // Entrance animation sequence
    if (showEntrance) {
      // Start entrance animations
      entranceTitleAnim.value = withTiming(1, { duration: 1000 });
      entranceBackgroundAnim.value = withRepeat(
        withTiming(1, { duration: 30000 }),
        -1,
        true
      );
      
      // After 3 seconds, transition to main app
      setTimeout(() => {
        entranceAnim.value = withTiming(1, { duration: 1500 });
        setTimeout(() => {
          setShowEntrance(false);
          // Start main app animations
          subtitleAnim.value = withTiming(1, { duration: 600 });
          
          setTimeout(() => {
            descriptionAnim.value = withTiming(1, { duration: 600 });
          }, 800);
          
          setTimeout(() => {
            buttonsAnim.value = withTiming(1, { duration: 600 });
          }, 1200);
        }, 1500);
      }, 3000);
    } else {
      // Background animation for main app
      backgroundAnim.value = withRepeat(
        withTiming(1, { duration: 8000 }),
        -1,
        true
      );
    }
  }, [showEntrance]);

  useEffect(() => {
    // Update progress animation
    progressAnim.value = withTiming(currentStep / (steps.length - 1), { duration: 300 });
  }, [currentStep]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show questionnaire after onboarding
      setShowQuestionnaire(true);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignUp = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    try {
      await signUp(userData);
      setShowAuth(null);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      setShowAuth(null);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
      setShowAuth(null);
    } catch (error) {
      console.error('Google auth error:', error);
    }
  };

  const handleQuestionnaireComplete = (data: QuestionnaireData) => {
    setUserPreferences(data);
    setShowQuestionnaire(false);
    
    // After questionnaire, show auth if not logged in
    if (user) {
      setIsListening(true);
    } else {
      setShowAuth('signup');
    }
  };

  const handleQuestionnaireSkip = () => {
    setShowQuestionnaire(false);
    
    // After skipping questionnaire, show auth if not logged in
    if (user) {
      setIsListening(true);
    } else {
      setShowAuth('signup');
    }
  };



  // Show loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }



  // Show entrance screen
  if (showEntrance) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B1426" />
        
        {/* Aurora-like background */}
        <Animated.View style={[styles.entranceBackground, entranceBackgroundStyle, entranceTransitionStyle]}>
          <LinearGradient
            colors={['#0B1426', '#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD'] as any}
            style={styles.auroraGradient1}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <LinearGradient
            colors={['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'] as any}
            style={styles.auroraGradient2}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <LinearGradient
            colors={['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'] as any}
            style={styles.auroraGradient3}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </Animated.View>
        
        {/* Centered Safely title */}
        <View style={styles.entranceContent}>
          <Animated.Text style={[
            styles.entranceTitle, 
            entranceTitleStyle, 
            entranceTitleColorStyle,
            entranceTitlePositionStyle
          ]}>
            Safely
          </Animated.Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show authentication screens
  if (showAuth === 'signup') {
    return (
      <SignUpScreen
        onSignUp={handleSignUp}
        onGoogleSignUp={handleGoogleAuth}
        onLogin={() => setShowAuth('login')}
      />
    );
  }

  if (showAuth === 'login') {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onGoogleLogin={handleGoogleAuth}
        onSignUp={() => setShowAuth('signup')}
        onForgotPassword={() => {
          // TODO: Implement forgot password
          console.log('Forgot password');
        }}
      />
    );
  }

  // Show questionnaire
  if (showQuestionnaire) {
    return (
      <Questionnaire
        onComplete={handleQuestionnaireComplete}
        onSkip={handleQuestionnaireSkip}
      />
    );
  }

  // Show main app content
  if (isListening) {
    return <MainApp />;
  }

  // Show onboarding
  const currentStepData = steps[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFFFFF" />
      


      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>

      {/* Persistent Safely Title */}
      <View style={styles.persistentTitleContainer}>
        <Text style={styles.persistentTitle}>Safely</Text>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Text Content with Linear typography */}
          <View style={styles.textContainer}>
            <Animated.Text style={[styles.subtitle, subtitleStyle]}>{currentStepData.subtitle}</Animated.Text>
            <Animated.Text style={[styles.description, descriptionStyle]}>{currentStepData.description}</Animated.Text>
          </View>

          {/* Navigation with Linear-style buttons */}
          <Animated.View style={[styles.navigation, buttonsStyle]}>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={handleBack}
              disabled={currentStep === 0}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                {currentStep === 0 ? 'Skip' : 'Back'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handleNext}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={18} 
                color="#FFFFFF" 
                style={styles.buttonIcon}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Main App Component with real audio functionality
function MainApp() {
  const [isListening, setIsListening] = useState(false);
  const [currentSounds, setCurrentSounds] = useState<string[]>([]);
  const [alertLevel, setAlertLevel] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [showSettings, setShowSettings] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'checking'>('checking');
  
  // Animation values for audio visualizer
  const audioBars = Array.from({ length: 20 }, () => useSharedValue(0));
  const pulseAnim = useSharedValue(1);
  
  // Import audio service
  const AudioService = require('../services/AudioService').default;
  
  // Handle sound detection
  const handleSoundDetected = (result: any) => {
    console.log('Sound detected:', result);
    
    // Update current sounds
    setCurrentSounds(prev => {
      const newSounds = [...prev, result.soundType];
      return newSounds.slice(-5); // Keep last 5 sounds
    });
    
    // Update alert level based on critical sounds
    if (result.isCritical) {
      setAlertLevel('high');
      // TODO: Trigger haptic feedback and notification
    } else if (result.confidence > 0.7) {
      setAlertLevel('medium');
    } else {
      setAlertLevel('low');
    }
    
    // Update audio visualizer
    audioBars.forEach((bar, index) => {
      bar.value = withTiming(result.confidence * 100, { duration: 200 });
    });
  };
  
  // Handle permission denied
  const handlePermissionDenied = () => {
    setPermissionStatus('denied');
    setIsListening(false);
  };
  
  // Start listening when component mounts
  useEffect(() => {
    const startAudio = async () => {
      const status = await AudioService.checkPermissions();
      if (status.granted) {
        setPermissionStatus('granted');
        const success = await AudioService.startListening(handleSoundDetected, handlePermissionDenied);
        setIsListening(success);
      } else {
        setPermissionStatus('denied');
      }
    };
    
    startAudio();
    
    // Cleanup on unmount
    return () => {
      AudioService.stopListening();
    };
  }, []);
  
  // Pulse animation for listening indicator
  useEffect(() => {
    pulseAnim.value = withRepeat(
      withTiming(1.2, { duration: 1000 }),
      -1,
      true
    );
  }, []);
  
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: interpolate(pulseAnim.value, [1, 1.2], [0.6, 1], Extrapolate.CLAMP),
  }));
  
  const audioBarStyles = audioBars.map((bar, index) => 
    useAnimatedStyle(() => ({
      height: bar.value,
      opacity: interpolate(bar.value, [0, 100], [0.3, 1], Extrapolate.CLAMP),
    }))
  );
  
  const getAlertColor = () => {
    switch (alertLevel) {
      case 'low': return '#60A5FA';
      case 'medium': return '#3B82F6';
      case 'high': return '#1D4ED8';
      default: return '#60A5FA';
    }
  };
  
  // Show permission request if needed
  if (permissionStatus === 'denied') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
        
        <View style={styles.permissionContainer}>
          <Ionicons name="mic-off" size={64} color="#60A5FA" />
          <Text style={styles.permissionTitle}>Microphone Access Required</Text>
          <Text style={styles.permissionDescription}>
            Safely needs microphone access to detect important sounds around you. 
            Your privacy is protected - no audio is recorded or sent online.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={async () => {
              const status = await AudioService.requestPermissions();
              if (status.granted) {
                setPermissionStatus('granted');
                const success = await AudioService.startListening(handleSoundDetected, handlePermissionDenied);
                setIsListening(success);
              }
            }}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Safely</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <Animated.View style={[styles.listeningIndicator, pulseStyle]}>
            <View style={[styles.indicatorDot, { backgroundColor: getAlertColor() }]} />
          </Animated.View>
          <Text style={styles.statusText}>
            {isListening ? 'Listening' : 'Paused'}
          </Text>
        </View>
        
        {/* Audio Visualizer */}
        <View style={styles.visualizerContainer}>
          <View style={styles.audioBars}>
            {audioBars.map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.audioBar,
                  audioBarStyles[index],
                  { backgroundColor: getAlertColor() }
                ]}
              />
            ))}
          </View>
        </View>
        
        {/* Current Sounds */}
        <View style={styles.soundsContainer}>
          <Text style={styles.soundsTitle}>Currently Hearing:</Text>
          {currentSounds.length > 0 ? (
            currentSounds.map((sound, index) => (
              <View key={index} style={styles.soundItem}>
                <Ionicons name="ear-outline" size={16} color="rgba(255,255,255,0.6)" />
                <Text style={styles.soundText}>{sound}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noSoundsText}>Background noise</Text>
          )}
        </View>
        
        {/* Alert Level */}
        {alertLevel !== 'none' && (
          <View style={[styles.alertContainer, { backgroundColor: getAlertColor() + '20' }]}>
            <Ionicons 
              name={alertLevel === 'high' ? 'warning' : 'information-circle'} 
              size={20} 
              color={getAlertColor()} 
            />
            <Text style={[styles.alertText, { color: getAlertColor() }]}>
              {alertLevel === 'high' ? 'High priority sound detected!' : 
               alertLevel === 'medium' ? 'Medium priority sound detected' : 
               'Low priority sound detected'}
            </Text>
          </View>
        )}
      </View>
      
      {/* Settings Panel */}
      {showSettings && (
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Sound Sensitivity</Text>
            <Text style={styles.settingValue}>Medium</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Alert Types</Text>
            <Text style={styles.settingValue}>All Sounds</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingValue}>Enabled</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundOrb: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#60A5FA',
    borderRadius: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },

  textContainer: {
    alignItems: 'center',
    marginBottom: 64,
    maxWidth: 320,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#60A5FA',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: 'rgba(0, 0, 0, 0.8)',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  
  // MainApp Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  listeningIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  indicatorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.8)',
  },
  visualizerContainer: {
    marginBottom: 40,
  },
  audioBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 2,
  },
  audioBar: {
    width: 4,
    backgroundColor: '#60A5FA',
    borderRadius: 2,
    minHeight: 4,
  },
  soundsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  soundsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.8)',
    marginBottom: 16,
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  soundText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  noSoundsText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.4)',
    fontStyle: 'italic',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  settingValue: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
  
  // Entrance Screen Styles
  entranceBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  auroraGradient1: {
    position: 'absolute',
    top: -200,
    left: -200,
    right: -200,
    bottom: -200,
    borderRadius: 1000,
  },
  auroraGradient2: {
    position: 'absolute',
    top: -300,
    left: -300,
    right: -300,
    bottom: -300,
    borderRadius: 1200,
  },
  auroraGradient3: {
    position: 'absolute',
    top: -400,
    left: -400,
    right: -400,
    bottom: -400,
    borderRadius: 1400,
  },
  entranceContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entranceTitle: {
    fontSize: 72,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  // Persistent Title Styles
  persistentTitleContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  persistentTitle: {
    fontSize: 72, // Match the entrance title size exactly
    fontWeight: '700',
    color: '#000000', // Final color after transition
    textAlign: 'center',
    letterSpacing: -1,
    // Remove text shadow to match final state
  },
  
  // Permission UI Styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  permissionDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#60A5FA',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function SafelyApp() {
  return (
    <AuthProvider>
      <SafelyAppContent />
    </AuthProvider>
  );
}
