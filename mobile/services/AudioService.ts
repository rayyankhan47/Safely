import { Audio } from 'expo-av';
import * as Permissions from 'expo-permissions';

export interface AudioPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

export interface SoundDetectionResult {
  timestamp: number;
  soundType: string;
  confidence: number;
  isCritical: boolean;
}

class AudioService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private onSoundDetected: ((result: SoundDetectionResult) => void) | null = null;
  private onPermissionDenied: (() => void) | null = null;

  /**
   * Request audio recording permissions
   */
  async requestPermissions(): Promise<AudioPermissionStatus> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      const canAskAgain = status === 'granted' || status === 'denied';
      
      return {
        granted: status === 'granted',
        canAskAgain
      };
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return {
        granted: false,
        canAskAgain: false
      };
    }
  }

  /**
   * Check current audio permission status
   */
  async checkPermissions(): Promise<AudioPermissionStatus> {
    try {
      const { status } = await Audio.getPermissionsAsync();
      const canAskAgain = status === 'granted' || status === 'denied';
      
      return {
        granted: status === 'granted',
        canAskAgain
      };
    } catch (error) {
      console.error('Error checking audio permissions:', error);
      return {
        granted: false,
        canAskAgain: false
      };
    }
  }

  /**
   * Start audio recording and sound detection
   */
  async startListening(
    onSoundDetected: (result: SoundDetectionResult) => void,
    onPermissionDenied: () => void
  ): Promise<boolean> {
    try {
      // Check permissions first
      const permissionStatus = await this.checkPermissions();
      if (!permissionStatus.granted) {
        this.onPermissionDenied = onPermissionDenied;
        onPermissionDenied();
        return false;
      }

      // Configure audio recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        this.onRecordingStatusUpdate,
        100 // Update every 100ms
      );

      this.recording = recording;
      this.isRecording = true;
      this.onSoundDetected = onSoundDetected;

      console.log('Audio recording started successfully');
      return true;

    } catch (error) {
      console.error('Error starting audio recording:', error);
      return false;
    }
  }

  /**
   * Stop audio recording
   */
  async stopListening(): Promise<void> {
    try {
      if (this.recording && this.isRecording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
        this.isRecording = false;
        this.onSoundDetected = null;
        console.log('Audio recording stopped');
      }
    } catch (error) {
      console.error('Error stopping audio recording:', error);
    }
  }

  /**
   * Handle recording status updates and process audio data
   */
  private onRecordingStatusUpdate = (status: Audio.RecordingStatus) => {
    if (!status.isRecording || !this.onSoundDetected) return;

    // TODO: Process audio data with YAMNet here
    // For now, simulate sound detection
    this.simulateSoundDetection();
  };

  /**
   * Simulate sound detection (placeholder for YAMNet integration)
   */
  private simulateSoundDetection() {
    if (!this.onSoundDetected) return;

    // Simulate different types of sounds
    const sounds = [
      { type: 'background_noise', confidence: 0.8, isCritical: false },
      { type: 'keyboard_typing', confidence: 0.6, isCritical: false },
      { type: 'distant_conversation', confidence: 0.7, isCritical: false },
      { type: 'fire_alarm', confidence: 0.9, isCritical: true },
      { type: 'yelling', confidence: 0.85, isCritical: true },
      { type: 'glass_breaking', confidence: 0.9, isCritical: true },
    ];

    // Randomly detect sounds (simulate real detection)
    if (Math.random() > 0.95) { // 5% chance per update
      const sound = sounds[Math.floor(Math.random() * sounds.length)];
      
      this.onSoundDetected({
        timestamp: Date.now(),
        soundType: sound.type,
        confidence: sound.confidence,
        isCritical: sound.isCritical,
      });
    }
  }

  /**
   * Get current recording status
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.stopListening();
  }
}

// Export singleton instance
export default new AudioService(); 