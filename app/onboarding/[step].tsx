import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingData {
  title: string;
  subtitle: string;
  description: string;
  image: any;
  buttonText: string;
}

const onboardingData: Record<string, OnboardingData> = {
  '1': {
    title: 'Welcome to the Movement',
    subtitle: 'A global movement for travelers & locals of color.',
    description: 'Join monthly trips worldwide\nFind travel buddies\nMeet Locals.\n\nMake memories that matter.',
    image: require('@/assets/images/Young-Traveler-illustration-(1).png'),
    buttonText: 'Next',
  },
  '2': {
    title: 'Connect with like-minded souls',
    subtitle: 'Search Travel Groups, Buddies & Locals',
    description: 'Find those interested in the same\ndestination as you.\n\nCreate or join travel groups .',
    image: require('@/assets/images/Travel-group illustration.png'),
    buttonText: 'Next',
  },
  '3': {
    title: 'Work with us and Earn',
    subtitle: 'Locals, Get Paid Instantly',
    description: 'Turn your lifestyle and\nlocal destination knowledge\ninto income.\n\nHost, guide, advise... and earn.',
    image: require('@/assets/images/work and earn illlustration.png'),
    buttonText: 'Next',
  },
  '4': {
    title: 'TravelConnec with Locals',
    subtitle: 'Verified Locals. Custom Experiences',
    description: 'Book local hosts, buddies, guides and\nadvisors for custom tours, activities,\ntips and more...\n\nwhatever makes a destination special\nfor you.\n\nSupport communities of color.',
    image: require('@/assets/images/join-the-movement.png'),
    buttonText: 'Join the movement',
  },
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { step } = useLocalSearchParams();
  const currentStep = step as string;
  const data = onboardingData[currentStep];

  const handleNext = () => {
    const nextStep = parseInt(currentStep) + 1;
    if (nextStep <= 4) {
      router.push(`/onboarding/${nextStep}`);
    } else {
      router.push('/auth');
    }
  };

  const handleSkip = () => {
    router.push('/auth');
  };

  if (!data) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {/* Skip Button */}
        {currentStep !== '4' && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Title */}
        <Text style={styles.title}>{data.title}</Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>{data.subtitle}</Text>

        {/* Illustration */}
        <View style={styles.imageContainer}>
          <Image
            source={data.image}
            style={styles.illustration}
            contentFit="contain"
          />
        </View>

        {/* Description */}
        <Text style={styles.description}>{data.description}</Text>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          {currentStep === '4' ? (
            <Image
              source={require('@/assets/images/Join-the-movement-button.png')}
              style={styles.buttonImage}
              contentFit="contain"
            />
          ) : (
            <Image
              source={require('@/assets/images/Get-started-button.png')}
              style={styles.buttonImage}
              contentFit="contain"
            />
          )}
        </TouchableOpacity>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {[1, 2, 3, 4].map((dot) => (
            <View
              key={dot}
              style={[
                styles.dot,
                dot <= parseInt(currentStep) ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  illustration: {
    width: width * 0.8,
    height: height * 0.35,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  nextButton: {
    alignSelf: 'center',
    marginBottom: 30,
    width: '80%',
    maxWidth: 280,
  },
  buttonImage: {
    width: '100%',
    height: 56,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#2196F3',
  },
  inactiveDot: {
    backgroundColor: '#DDD',
  },
});