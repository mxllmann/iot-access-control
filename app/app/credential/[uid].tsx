import { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { api, Credential } from '../../src/api';
import { useAuth } from '../../src/auth';
import CredentialCard from '../../src/components/CredentialCard';

export default function CredentialDetail() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const router = useRouter();
  const auth = useAuth();
  const isAdmin = auth.status === 'authenticated' && auth.user.role === 'admin';

  const [credential, setCredential] = useState<Credential | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCredential = useCallback(async () => {
    try {
      setLoading(true);
      const all = await api.credentials.getAll();
      const found = all.find((c) => c.uid === uid);
      if (found) {
        setCredential(found);
        setOwnerName(found.ownerName);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { fetchCredential(); }, [fetchCredential]);

  if (loading || !credential) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  const hasChanges = ownerName.trim() !== credential.ownerName;

  const handleSave = async () => {
    if (!ownerName.trim() || !hasChanges) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      const updated = await api.credentials.update(credential.uid, { ownerName: ownerName.trim() });
      setCredential(updated);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      const updated = await api.credentials.update(credential.uid, { active: !credential.active });
      setCredential(updated);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Credencial',
      `Tem certeza que deseja excluir a credencial ${credential.uid}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setDeleting(true);
            try {
              await api.credentials.delete(credential.uid);
              router.back();
            } catch (err: any) {
              Alert.alert('Erro', err.message);
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <CredentialCard credential={{ ...credential, ownerName: ownerName.trim() || credential.ownerName }} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>

          <Text style={styles.label}>UID</Text>
          <View style={styles.readonlyField}>
            <Text style={styles.readonlyText}>{credential.uid}</Text>
          </View>

          <Text style={styles.label}>Nome do Titular</Text>
          {isAdmin ? (
            <TextInput
              style={styles.input}
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="Nome do titular"
              placeholderTextColor="#555"
            />
          ) : (
            <View style={styles.readonlyField}>
              <Text style={styles.readonlyText}>{credential.ownerName}</Text>
            </View>
          )}

          <Text style={styles.label}>Status</Text>
          <View style={styles.readonlyField}>
            <Text style={[styles.readonlyText, { color: credential.active ? '#4CAF50' : '#F44336' }]}>
              {credential.active ? 'Ativa' : 'Inativa'}
            </Text>
          </View>

          {isAdmin && (
            <Pressable
              style={({ pressed }) => [styles.saveButton, pressed && styles.pressed, !hasChanges && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.saveText}>Salvar Alterações</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações</Text>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                credential.active ? styles.deactivateButton : styles.activateButton,
                pressed && styles.pressed,
              ]}
              onPress={handleToggleActive}
              disabled={saving}
            >
              <MaterialCommunityIcons
                name={credential.active ? 'close-circle-outline' : 'check-circle-outline'}
                size={20}
                color={credential.active ? '#F44336' : '#4CAF50'}
              />
              <Text style={[styles.actionText, { color: credential.active ? '#F44336' : '#4CAF50' }]}>
                {credential.active ? 'Desativar Credencial' : 'Ativar Credencial'}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && styles.pressed]}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color="#F44336" />
              ) : (
                <>
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color="#F44336" />
                  <Text style={[styles.actionText, { color: '#F44336' }]}>Excluir Credencial</Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  center: { justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },

  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 20 },

  section: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  label: { fontSize: 14, fontWeight: '600', color: '#AAA' },
  readonlyField: {
    backgroundColor: '#0D0D0D',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  readonlyText: { fontSize: 16, color: '#666', fontFamily: 'monospace' },
  input: {
    backgroundColor: '#0D0D0D',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },

  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  saveText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  buttonDisabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 14,
  },
  deactivateButton: { backgroundColor: '#3A1B1B' },
  activateButton: { backgroundColor: '#1B3A2A' },
  deleteButton: { backgroundColor: '#2A1515' },
  actionText: { fontSize: 15, fontWeight: '600' },
});
