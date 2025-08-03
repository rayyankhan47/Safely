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
  const titleAnim = useSharedValue(0);
  const subtitleAnim = useSharedValue(0);
  const descriptionAnim = useSharedValue(0);
  const buttonsAnim = useSharedValue(0);
  const progressAnim = useSharedValue(0);
  const backgroundAnim = useSharedValue(0);

  const steps = [
    {
      title: "Safely",
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
    // Animation sequence:
    // 1. "Safely" appears big and centered (0ms)
    titleAnim.value = withTiming(1, { duration: 600 });
    
    // 2. "Safely" stays for 2 seconds, then moves up over 1 second (2000ms)
    setTimeout(() => {
      titleAnim.value = withTiming(1, { duration: 1000 });
    }, 2000);
    
    // 3. Subtitle appears as title reaches final position (2800ms)
    setTimeout(() => {
      subtitleAnim.value = withTiming(1, { duration: 400 });
    }, 2800);
    
    // 4. Description appears (3200ms)
    setTimeout(() => {
      descriptionAnim.value = withTiming(1, { duration: 400 });
    }, 3200);
    
    // 5. Buttons appear (3600ms)
    setTimeout(() => {
      buttonsAnim.value = withTiming(1, { duration: 400 });
    }, 3600);
    
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
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleAnim.value,
    transform: [
      { 
        translateY: interpolate(
          titleAnim.value, 
          [0, 1], 
          [height / 2 - 100, 0], // Start centered, move to top
          Extrapolate.CLAMP
        ) 
      },
      {
        scale: interpolate(
          titleAnim.value,
          [0, 1],
          [1.5, 1], // Start big, scale down to normal
          Extrapolate.CLAMP
        )
      }
    ]
  }));

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
                <View style={styles.content}>
          {/* Text Content with Linear typography */}
          <View style={styles.textContainer}>
            <Animated.Text style={[styles.title, titleStyle]}>{currentStepData.title}</Animated.Text>
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
          </Animated.View>
        </View>
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

  textContainer: {
    alignItems: 'center',
    marginBottom: 64,
    maxWidth: 320,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 56,
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
