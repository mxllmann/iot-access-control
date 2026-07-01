import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function RegisterScreen() {
  const [uid, setUid] = useState('');
  const [holder, setHolder] = useState('');

  const handleRegister = () => {
    if (!uid.trim() || !holder.trim()) return;
    // TODO: enviar para API
    setUid('');
    setHolder('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar Credencial</Text>

      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.form}>
        <Text style={styles.label}>UID do Cartao</Text>
        <TextInput
          style={styles.input}
          value={uid}
          onChangeText={setUid}
          placeholder="Ex: A1:B2:C3:D4"
          placeholderTextColor="#555"
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Nome do Titular</Text>
        <TextInput
          style={styles.input}
          value={holder}
          onChangeText={setHolder}
          placeholder="Ex: Arthur Mallmann"
          placeholderTextColor="#555"
        />

        <AnimatedPressable
          entering={FadeInDown.delay(200).duration(400)}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>Cadastrar</Text>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#0D0D0D' },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 24 },
  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#AAA', marginBottom: -4 },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#0D0D0D' },
});
