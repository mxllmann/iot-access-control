import { useEffect, useRef, useState } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { api, EnrollmentStatus, User } from '../../src/api';

type EnrollmentState =
  | { phase: 'idle' }
  | { phase: 'input_name' }
  | { phase: 'waiting'; ownerName: string }
  | { phase: 'done'; enrollment: EnrollmentStatus };

export default function RegisterTab() {
  const [enrollment, setEnrollment] = useState<EnrollmentState>({ phase: 'idle' });
  const [enrollName, setEnrollName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [uid, setUid] = useState('');
  const [holder, setHolder] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.users.getAll().then(setUsers).catch(() => {});
  }, []);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => () => stopPolling(), []);

  const startEnrollment = async () => {
    if (!enrollName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await api.enrollment.start(enrollName.trim(), selectedUserId || undefined);
      setEnrollment({ phase: 'waiting', ownerName: enrollName.trim() });
      setEnrollName('');

      pollingRef.current = setInterval(async () => {
        try {
          const status = await api.enrollment.getStatus();
          if (status.status !== 'waiting_credential') {
            stopPolling();
            Haptics.notificationAsync(
              status.status === 'success'
                ? Haptics.NotificationFeedbackType.Success
                : Haptics.NotificationFeedbackType.Error
            );
            setEnrollment({ phase: 'done', enrollment: status });
          }
        } catch {}
      }, 1500);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  };

  const resetEnrollment = () => {
    stopPolling();
    setEnrollment({ phase: 'idle' });
    setSelectedUserId('');
  };

  const handleManualRegister = async () => {
    if (!uid.trim() || !holder.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);
    try {
      await api.credentials.create(uid.trim(), holder.trim(), selectedUserId || undefined);
      Alert.alert('Sucesso', 'Credencial cadastrada!');
      setUid('');
      setHolder('');
      setSelectedUserId('');
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderUserPicker = () => (
    <View style={styles.userPicker}>
      <Text style={styles.label}>Associar a Usuário (opcional)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userScroll}>
        <Pressable
          style={[styles.userChip, !selectedUserId && styles.userChipSelected]}
          onPress={() => setSelectedUserId('')}
        >
          <Text style={[styles.userChipText, !selectedUserId && styles.userChipTextSelected]}>
            Nenhum
          </Text>
        </Pressable>
        {users.map((u) => (
          <Pressable
            key={u._id}
            style={[styles.userChip, selectedUserId === u._id && styles.userChipSelected]}
            onPress={() => {
              setSelectedUserId(u._id);
              if (enrollment.phase === 'input_name' && !enrollName.trim()) {
                setEnrollName(u.name);
              }
              if (!holder.trim()) setHolder(u.name);
            }}
          >
            <Text style={[styles.userChipText, selectedUserId === u._id && styles.userChipTextSelected]}>
              {u.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderEnrollmentContent = () => {
    switch (enrollment.phase) {
      case 'idle':
        return (
          <Pressable
            style={({ pressed }) => [styles.enrollButton, pressed && styles.pressed]}
            onPress={() => setEnrollment({ phase: 'input_name' })}
          >
            <MaterialCommunityIcons name="card-search-outline" size={22} color="#FFFFFF" />
            <Text style={styles.enrollButtonText}>Iniciar Enrollment</Text>
          </Pressable>
        );

      case 'input_name':
        return (
          <View>
            {renderUserPicker()}
            <Text style={styles.label}>Nome do Titular</Text>
            <TextInput
              style={styles.input}
              value={enrollName}
              onChangeText={setEnrollName}
              placeholder="Ex: Arthur Mallmann"
              placeholderTextColor="#555"
              autoFocus
            />
            <View style={styles.enrollActions}>
              <Pressable
                style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                onPress={resetEnrollment}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
                onPress={startEnrollment}
              >
                <Text style={styles.confirmText}>Aguardar Cartão</Text>
              </Pressable>
            </View>
          </View>
        );

      case 'waiting':
        return (
          <View style={styles.waitingContainer}>
            <ActivityIndicator color="#4CAF50" size="large" />
            <Text style={styles.waitingTitle}>Aproxime o cartão do leitor</Text>
            <Text style={styles.waitingSubtitle}>
              Cadastrando para: {enrollment.ownerName}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.cancelButton, { marginTop: 16 }, pressed && styles.pressed]}
              onPress={resetEnrollment}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </View>
        );

      case 'done': {
        const success = enrollment.enrollment.status === 'success';
        return (
          <View style={styles.doneContainer}>
            <MaterialCommunityIcons
              name={success ? 'check-circle-outline' : 'alert-circle-outline'}
              size={48}
              color={success ? '#4CAF50' : '#F44336'}
            />
            <Text style={[styles.doneTitle, { color: success ? '#4CAF50' : '#F44336' }]}>
              {success ? 'Credencial cadastrada!' : 'Falha no enrollment'}
            </Text>
            <Text style={styles.doneMessage}>{enrollment.enrollment.message}</Text>
            {enrollment.enrollment.uid && (
              <Text style={styles.doneUid}>UID: {enrollment.enrollment.uid}</Text>
            )}
            <Pressable
              style={({ pressed }) => [styles.confirmButton, { marginTop: 16 }, pressed && styles.pressed]}
              onPress={resetEnrollment}
            >
              <Text style={styles.confirmText}>Novo Cadastro</Text>
            </Pressable>
          </View>
        );
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cadastrar Credencial</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enrollment via Leitor</Text>
        <Text style={styles.sectionDesc}>
          Cadastre aproximando o cartão no leitor RFID
        </Text>
        {renderEnrollmentContent()}
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cadastro Manual</Text>

        {renderUserPicker()}

        <Text style={styles.label}>UID do Cartão</Text>
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

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed, submitting && styles.buttonDisabled]}
          onPress={handleManualRegister}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="card-plus-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Cadastrar</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 24 },

  section: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  sectionDesc: { fontSize: 13, color: '#888', marginTop: -4 },

  label: { fontSize: 14, fontWeight: '600', color: '#AAA' },
  input: {
    backgroundColor: '#0D0D0D',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },

  userPicker: { gap: 8 },
  userScroll: { flexGrow: 0 },
  userChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginRight: 8,
  },
  userChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  userChipText: { fontSize: 13, color: '#888' },
  userChipTextSelected: { color: '#FFFFFF', fontWeight: '600' },

  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  enrollButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },

  enrollActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
  },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#888' },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
  },
  confirmText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  waitingContainer: { alignItems: 'center', paddingVertical: 20, gap: 12 },
  waitingTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  waitingSubtitle: { fontSize: 13, color: '#888' },

  doneContainer: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  doneTitle: { fontSize: 18, fontWeight: '700' },
  doneMessage: { fontSize: 13, color: '#888' },
  doneUid: { fontSize: 14, color: '#666', fontFamily: 'monospace' },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2A2A2A' },
  dividerText: { fontSize: 13, color: '#555' },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  pressed: { opacity: 0.8 },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
