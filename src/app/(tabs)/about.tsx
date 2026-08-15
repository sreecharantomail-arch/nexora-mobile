import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Linking, SafeAreaView } from 'react-native';
import { X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function AboutScreen() {
  const router = useRouter();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:nylarionstudios@gmail.com');
  };

  const handlePolicy = () => {
    // Replace with actual privacy policy URL when available
    Linking.openURL('https://nylarion.com/privacy');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Glow behind the card */}
        <View style={styles.glow} />
        
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X color="#64748b" size={24} />
          </TouchableOpacity>

          <View style={styles.logoWrapper}>
            {/* Inner glow behind the logo */}
            <View style={styles.logoGlow} />
            <Image 
              source={require('../../../assets/images/nylarion_logo.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          </View>

          <Text style={styles.title}>NYLARION STUDIOS</Text>
          <Text style={styles.subtitle}>Play Beyond Reality.</Text>

          <View style={styles.infoBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Game</Text>
              <Text style={styles.value}>Nexa Clash Ultimate Edition</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Developer</Text>
              <Text style={styles.value}>NYLARION STUDIOS</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Version</Text>
              <Text style={styles.value}>v1.0.0</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Support</Text>
              <TouchableOpacity onPress={handleEmail}>
                <Text style={styles.valueLink}>nylarionstudios@gmail.com</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.row, { marginBottom: 0 }]}>
              <Text style={styles.label}>Privacy Policy</Text>
              <TouchableOpacity onPress={handlePolicy}>
                <Text style={styles.valueLink}>View Policy</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>© 2026 NYLARION STUDIOS. All rights reserved.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712', // Very dark background
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: width * 0.9,
    position: 'relative',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00e5ff',
    opacity: 0.15,
    borderRadius: 24,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#0B1120',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  logoWrapper: {
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 80,
    backgroundColor: '#00e5ff',
    opacity: 0.3,
    borderRadius: 40,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#00e5ff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  valueLink: {
    color: '#00e5ff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    color: '#475569',
    fontSize: 11,
    marginTop: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
});
