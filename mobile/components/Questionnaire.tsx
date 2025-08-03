import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export interface QuestionnaireData {
  primaryNeed: 'anxiety' | 'ocd' | 'autism' | 'trauma' | 'general';
  sensitivityLevel: 'low' | 'medium' | 'high';
  criticalSounds: string[];
  alertPreferences: {
    notifications: boolean;
    haptics: boolean;
    soundAlerts: boolean;
  };
  privacyLevel: 'minimal' | 'standard' | 'comprehensive';
  usagePattern: 'occasional' | 'regular' | 'constant';
}

interface QuestionnaireProps {
  onComplete: (data: QuestionnaireData) => void;
  onSkip: () => void;
}

const questions = [
  {
    id: 'primaryNeed',
    title: 'What brings you to Safely?',
    subtitle: 'This helps us personalize your experience',
    type: 'single' as const,
    options: [
      { value: 'anxiety', label: 'Anxiety about safety', icon: 'heart-outline' },
      { value: 'ocd', label: 'OCD - obsessive worry', icon: 'repeat-outline' },
      { value: 'autism', label: 'Sensory processing differences', icon: 'ear-outline' },
      { value: 'trauma', label: 'Trauma-related hypervigilance', icon: 'shield-outline' },
      { value: 'general', label: 'General peace of mind', icon: 'leaf-outline' },
    ]
  },
  {
    id: 'sensitivityLevel',
    title: 'How sensitive should detection be?',
    subtitle: 'This affects how often you\'ll receive alerts',
    type: 'single' as const,
    options: [
      { value: 'low', label: 'Only critical sounds', description: 'Fire alarms, yelling, breaking glass' },
      { value: 'medium', label: 'Moderate sensitivity', description: 'Includes conversations, footsteps' },
      { value: 'high', label: 'High sensitivity', description: 'Most environmental sounds' },
    ]
  },
  {
    id: 'criticalSounds',
    title: 'Which sounds are most important to you?',
    subtitle: 'Select all that apply',
    type: 'multiple' as const,
    options: [
      { value: 'fire_alarm', label: 'Fire alarms', icon: 'warning-outline' },
      { value: 'yelling', label: 'Yelling or shouting', icon: 'volume-high-outline' },
      { value: 'glass_breaking', label: 'Glass breaking', icon: 'flash-outline' },
      { value: 'door_knock', label: 'Door knocking', icon: 'hand-left-outline' },
      { value: 'phone_ring', label: 'Phone ringing', icon: 'call-outline' },
      { value: 'baby_cry', label: 'Baby crying', icon: 'baby-outline' },
      { value: 'smoke_detector', label: 'Smoke detector', icon: 'flame-outline' },
      { value: 'car_horn', label: 'Car horns', icon: 'car-outline' },
    ]
  },
  {
    id: 'alertPreferences',
    title: 'How would you like to be alerted?',
    subtitle: 'Choose your preferred notification methods',
    type: 'multiple' as const,
    options: [
      { value: 'notifications', label: 'Push notifications', icon: 'notifications-outline' },
      { value: 'haptics', label: 'Vibration alerts', icon: 'phone-portrait-outline' },
      { value: 'soundAlerts', label: 'Sound alerts', icon: 'volume-medium-outline' },
    ]
  },
  {
    id: 'privacyLevel',
    title: 'What\'s your privacy preference?',
    subtitle: 'All processing happens on your device',
    type: 'single' as const,
    options: [
      { value: 'minimal', label: 'Minimal data', description: 'No analytics or usage tracking' },
      { value: 'standard', label: 'Standard', description: 'Basic usage statistics for improvement' },
      { value: 'comprehensive', label: 'Comprehensive', description: 'Detailed analytics for personalization' },
    ]
  },
  {
    id: 'usagePattern',
    title: 'How often will you use Safely?',
    subtitle: 'This helps optimize battery and performance',
    type: 'single' as const,
    options: [
      { value: 'occasional', label: 'Occasionally', description: 'When needed for specific situations' },
      { value: 'regular', label: 'Regularly', description: 'During work or study sessions' },
      { value: 'constant', label: 'Constantly', description: 'Always on for peace of mind' },
    ]
  }
];

export default function Questionnaire({ onComplete, onSkip }: QuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuestionnaireData>>({});
  
  // Animation values
  const questionAnim = useSharedValue(0);
  const progressAnim = useSharedValue(0);

  const questionStyle = useAnimatedStyle(() => ({
    opacity: questionAnim.value,
    transform: [
      { translateX: interpolate(questionAnim.value, [0, 1], [50, 0], Extrapolate.CLAMP) }
    ]
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`
  }));

  React.useEffect(() => {
    // Simplified animation without potential crash points
    try {
      questionAnim.value = withTiming(1, { duration: 600 });
      progressAnim.value = withTiming((currentQuestion + 1) / questions.length, { duration: 300 });
    } catch (error) {
      console.error('Animation error:', error);
    }
  }, [currentQuestion]);

  const handleAnswer = (questionId: string, value: any) => {
    try {
      const question = questions[currentQuestion];
      
      if (question.type === 'multiple') {
        // Handle multiple selection
        const currentAnswers = answers[questionId] as string[] || [];
        const newAnswers = currentAnswers.includes(value)
          ? currentAnswers.filter(v => v !== value)
          : [...currentAnswers, value];
        
        setAnswers(prev => ({ ...prev, [questionId]: newAnswers }));
      } else {
        // Handle single selection
        setAnswers(prev => ({ ...prev, [questionId]: value }));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      // Simple state update without animation callback
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Complete questionnaire
      const finalData: QuestionnaireData = {
        primaryNeed: answers.primaryNeed || 'general',
        sensitivityLevel: answers.sensitivityLevel || 'medium',
        criticalSounds: answers.criticalSounds as string[] || ['fire_alarm', 'yelling'],
        alertPreferences: {
          notifications: (answers.alertPreferences as string[] || []).includes('notifications'),
          haptics: (answers.alertPreferences as string[] || []).includes('haptics'),
          soundAlerts: (answers.alertPreferences as string[] || []).includes('soundAlerts'),
        },
        privacyLevel: answers.privacyLevel || 'standard',
        usagePattern: answers.usagePattern || 'regular',
      };
      onComplete(finalData);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      // Simple state update without animation callback
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const canProceed = () => {
    const question = questions[currentQuestion];
    const answer = answers[question.id];
    
    if (question.type === 'multiple') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== undefined;
  };

  const currentQuestionData = questions[currentQuestion];

  // Safety check to prevent crashes
  if (!currentQuestionData) {
    return (
      <View style={styles.container}>
        <Text style={styles.questionTitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestion + 1} of {questions.length}
        </Text>
      </View>

      {/* Question Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.questionContainer, questionStyle]}>
          <Text style={styles.questionTitle}>{currentQuestionData.title}</Text>
          <Text style={styles.questionSubtitle}>{currentQuestionData.subtitle}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestionData.options.map((option, index) => {
              const isSelected = currentQuestionData.type === 'multiple'
                ? (answers[currentQuestionData.id] as string[] || []).includes(option.value)
                : answers[currentQuestionData.id] === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected
                  ]}
                  onPress={() => handleAnswer(currentQuestionData.id, option.value)}
                >
                  {option.icon && (
                    <Ionicons 
                      name={option.icon as any} 
                      size={24} 
                      color={isSelected ? '#FFFFFF' : '#60A5FA'} 
                    />
                  )}
                  <View style={styles.optionContent}>
                    <Text style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                    {option.description && (
                      <Text style={[
                        styles.optionDescription,
                        isSelected && styles.optionDescriptionSelected
                      ]}>
                        {option.description}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={currentQuestion === 0 ? onSkip : handleBack}
        >
          <Text style={styles.secondaryButtonText}>
            {currentQuestion === 0 ? 'Skip' : 'Back'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.button, 
            styles.primaryButton,
            !canProceed() && styles.buttonDisabled
          ]} 
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.primaryButtonText}>
            {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={18} 
            color="#FFFFFF" 
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#60A5FA',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  questionContainer: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  questionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#60A5FA',
    borderColor: '#60A5FA',
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#FFFFFF',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  optionDescriptionSelected: {
    color: '#E0E7FF',
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  primaryButton: {
    backgroundColor: '#60A5FA',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 