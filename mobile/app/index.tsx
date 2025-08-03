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
  Extrapolate,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function SafelyApp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  
  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.95);
  const progressAnim = useSharedValue(0);
  const floatingAnim = useSharedValue(0);
  const backgroundAnim = useSharedValue(0);

  const steps = [
    {
      title: "Welcome to Safely",
      subtitle: "Your AI-powered safety companion",
      description: "Safely listens to your environment and alerts you to important sounds while you're wearing headphones.",
      icon: "shield-checkmark",
      gradient: ["#5E6AD2", "#7C3AED"]
    },
    {
      title: "Stay Aware",
      subtitle: "Never miss what matters",
      description: "From fire alarms to baby cries, from emergency announcements to breaking glass - Safely keeps you informed.",
      icon: "ear",
      gradient: ["#7C3AED", "#EC4899"]
    },
    {
      title: "Privacy First",
      subtitle: "Your data stays yours",
      description: "All audio processing happens locally on your device. Nothing is recorded or sent to our servers.",
      icon: "lock-closed",
      gradient: ["#EC4899", "#F59E0B"]
    }
  ];

  useEffect(() => {
    // Initial animations
    fadeAnim.value = withTiming(1, { duration: 300 });
    slideAnim.value = withSpring(1, { damping: 20, stiffness: 100 });
    scaleAnim.value = withSpring(1, { damping: 20, stiffness: 100 });
    
    // Floating animation
    floatingAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000 }),
        withTiming(0, { duration: 3000 })
      ),
      -1,
      true
    );
    
    // Background animation
    backgroundAnim.value = withRepeat(
      withTiming(1, { duration: 8000 }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    // Update progress animation
    progressAnim.value = withTiming(currentStep / (steps.length - 1), { duration: 300 });
  }, [currentStep]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Start the main app
      setIsListening(true);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [
      { translateY: interpolate(slideAnim.value, [0, 1], [30, 0], Extrapolate.CLAMP) },
      { scale: scaleAnim.value }
    ]
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`
  }));

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatingAnim.value, [0, 1], [0, -10], Extrapolate.CLAMP) }
    ]
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(backgroundAnim.value, [0, 1], [0, 50], Extrapolate.CLAMP) },
      { translateY: interpolate(backgroundAnim.value, [0, 1], [0, -30], Extrapolate.CLAMP) }
    ]
  }));

  if (isListening) {
    return <MainApp />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      
      {/* Linear-style background with geometric elements */}
      <View style={styles.backgroundContainer}>
        <Animated.View style={[styles.backgroundOrb, backgroundStyle]}>
          <LinearGradient
            colors={['rgba(94, 106, 210, 0.1)', 'rgba(124, 58, 237, 0.05)'] as any}
            style={styles.orbGradient}
          />
        </Animated.View>
        
        {/* Grid pattern */}
        <View style={styles.gridPattern}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} style={[styles.gridLine, { opacity: 0.03 }]} />
          ))}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, containerStyle]}>
          {/* Icon with Linear-style gradient */}
          <Animated.View style={[styles.iconContainer, floatingStyle]}>
                          <LinearGradient
                colors={currentStepData.gradient as any}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
              <Ionicons 
                name={currentStepData.icon as any} 
                size={32} 
                color="#fff" 
              />
            </LinearGradient>
          </Animated.View>

          {/* Text Content with Linear typography */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>
          </View>

          {/* Navigation with Linear-style buttons */}
          <View style={styles.navigation}>
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
              <LinearGradient
                colors={currentStepData.gradient as any}
                style={styles.primaryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={18} 
                  color="#fff" 
                  style={styles.buttonIcon}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Main App Component (placeholder for now)
function MainApp() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Safely</Text>
        <Text style={styles.subtitle}>Listening for sounds...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
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
  gridLine: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: 1,
    height: '100%',
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
    backgroundColor: '#5E6AD2',
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    shadowColor: '#5E6AD2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 64,
    maxWidth: 320,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
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
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});
