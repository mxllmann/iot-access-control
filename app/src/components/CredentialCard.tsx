import { StyleSheet, Text, View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Credential } from '../api';

type Props = {
  credential: Credential;
  onPress?: () => void;
  onLongPress?: () => void;
};

export default function CredentialCard({ credential, onPress, onLongPress }: Props) {
  const active = credential.active;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View style={[styles.card, !active && styles.cardInactive]}>
        <View style={styles.chipRow}>
          <MaterialCommunityIcons name="card-account-details-outline" size={24} color={active ? '#888' : '#444'} />
          <MaterialCommunityIcons name="wifi" size={18} color={active ? '#666' : '#333'} style={styles.contactlessIcon} />
        </View>

        <Text style={[styles.uid, !active && styles.textMuted]}>
          {credential.uid}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.holder, !active && styles.textMuted]}>
            {credential.ownerName}
          </Text>
          <View style={[styles.statusDot, active ? styles.dotActive : styles.dotInactive]} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },

  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    aspectRatio: 1.7,
    justifyContent: 'space-between',
  },
  cardInactive: {
    backgroundColor: '#141414',
    borderColor: '#222',
  },

  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactlessIcon: { marginLeft: 6 },

  uid: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  textMuted: { color: '#555' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  holder: {
    fontSize: 14,
    fontWeight: '500',
    color: '#AAA',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  statusDot: { width: 10, height: 10, borderRadius: 5 },
  dotActive: { backgroundColor: '#4CAF50' },
  dotInactive: { backgroundColor: '#F44336' },
});
