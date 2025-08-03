import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SafelyApp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  
  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.8);
  const progressAnim = useSharedValue(0);

  const steps = [
    {
      title: "Welcome to Safely",
      subtitle: "Your AI-powered safety companion",
      description: "Safely listens to your environment and alerts you to important sounds while you're wearing headphones.",
      icon: "shield-checkmark",
      color: "#3B82F6"
    },
    {
      title: "Stay Aware",
      subtitle: "Never miss what matters",
      description: "From fire alarms to baby cries, from emergency announcements to breaking glass - Safely keeps you informed.",
      icon: "ear",
      color: "#10B981"
    },
    {
      title: "Privacy First",
      subtitle: "Your data stays yours",
      description: "All audio processing happens locally on your device. Nothing is recorded or sent to our servers.",
      icon: "lock-closed",
      color: "#8B5CF6"
    }
  ];

  useEffect(() => {
    // Initial animations
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withSpring(1, { damping: 15, stiffness: 100 });
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 100 });
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
      { translateY: interpolate(slideAnim.value, [0, 1], [50, 0], Extrapolate.CLAMP) },
      { scale: scaleAnim.value }
    ]
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`
  }));

  if (isListening) {
    return <MainApp />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>

      {/* Main Content */}
      <Animated.View style={[styles.content, containerStyle]}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: currentStepData.color + '10' }]}>
          <Ionicons 
            name={currentStepData.icon as any} 
            size={48} 
            color={currentStepData.color} 
          />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>
        </View>

        {/* Navigation */}
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
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color="#fff" 
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
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
    backgroundColor: '#fff',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: '#111827',
  },
  secondaryButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#6B7280',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});
