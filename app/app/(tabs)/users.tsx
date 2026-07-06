import { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { api, User } from '../../src/api';
import { useAuth } from '../../src/auth';

export default function UsersTab() {
  const auth = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create user form
  const [showCreate, setShowCreate] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createName, setCreateName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<'admin' | 'user'>('user');
  const [creating, setCreating] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.users.getAll();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!createEmail.trim() || !createName.trim()) return;
    if (!createPassword.trim() || createPassword.length < 6) {
      return Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCreating(true);
    try {
      await api.auth.createUser(createEmail.trim(), createName.trim(), createPassword, createRole);
      Alert.alert('Sucesso', 'Usuário criado!');
      setShowCreate(false);
      setCreateEmail('');
      setCreateName('');
      setCreatePassword('');
      setCreateRole('user');
      fetchUsers();
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    if (auth.status === 'authenticated' && user._id === auth.user._id) {
      return Alert.alert('Erro', 'Você não pode desativar sua própria conta');
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await api.users.update(user._id, { active: !user.active });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, active: !u.active } : u))
      );
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  };

  const handleDelete = (user: User) => {
    if (auth.status === 'authenticated' && user._id === auth.user._id) {
      return Alert.alert('Erro', 'Você não pode excluir sua própria conta');
    }
    Alert.alert('Excluir Usuário', `Excluir ${user.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.users.delete(user._id);
            setUsers((prev) => prev.filter((u) => u._id !== user._id));
          } catch (err: any) {
            Alert.alert('Erro', err.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Erro ao carregar usuários</Text>
        <Pressable style={styles.retryButton} onPress={fetchUsers}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Usuários</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
            onPress={() => setShowCreate(true)}
          >
            <MaterialCommunityIcons name="account-plus-outline" size={22} color="#FFFFFF" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
            onPress={() => {
              Alert.alert('Sair', 'Deseja sair da sua conta?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: () => auth.logout() },
              ]);
            }}
          >
            <MaterialCommunityIcons name="logout" size={22} color="#F44336" />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <View style={styles.userInfo}>
              <View style={styles.userHeader}>
                <Text style={styles.userName}>{item.name}</Text>
                <View style={[styles.roleBadge, item.role === 'admin' && styles.adminBadge]}>
                  <Text style={styles.roleText}>{item.role}</Text>
                </View>
              </View>
              <Text style={styles.userEmail}>{item.email}</Text>
              {!item.active && <Text style={styles.inactiveText}>Desativado</Text>}
            </View>
            <View style={styles.userActions}>
              <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                onPress={() => handleToggleActive(item)}
              >
                <MaterialCommunityIcons
                  name={item.active ? 'account-off-outline' : 'account-check-outline'}
                  size={20}
                  color={item.active ? '#FF9800' : '#4CAF50'}
                />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                onPress={() => handleDelete(item)}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#F44336" />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum usuário cadastrado</Text>
        }
      />

      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar Usuário</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={createName}
              onChangeText={setCreateName}
              placeholder="Nome completo"
              placeholderTextColor="#555"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={createEmail}
              onChangeText={setCreateEmail}
              placeholder="email@exemplo.com"
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={createPassword}
              onChangeText={setCreatePassword}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#555"
              secureTextEntry
            />

            <Text style={styles.label}>Perfil</Text>
            <View style={styles.roleRow}>
              <Pressable
                style={styles.radioRow}
                onPress={() => setCreateRole('user')}
              >
                <View style={styles.radioOuter}>
                  {createRole === 'user' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Usuário</Text>
              </Pressable>
              <Pressable
                style={styles.radioRow}
                onPress={() => setCreateRole('admin')}
              >
                <View style={styles.radioOuter}>
                  {createRole === 'admin' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Admin</Text>
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                onPress={() => setShowCreate(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.createBtn, pressed && styles.pressed, creating && styles.buttonDisabled]}
                onPress={handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.createBtnText}>Criar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#0D0D0D' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerActions: { flexDirection: 'row', gap: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: { opacity: 0.7 },
  list: { gap: 10 },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  userInfo: { flex: 1, gap: 4 },
  userHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  userEmail: { fontSize: 13, color: '#888' },
  inactiveText: { fontSize: 12, color: '#F44336' },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
  },
  adminBadge: { backgroundColor: '#1B3A2A' },
  roleText: { fontSize: 11, fontWeight: '600', color: '#888', textTransform: 'uppercase' },
  userActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8, borderRadius: 8, backgroundColor: '#2A2A2A' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
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
  roleRow: { flexDirection: 'row', gap: 24 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  radioLabel: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#888' },
  createBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
  },
  createBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  buttonDisabled: { opacity: 0.6 },
  pressed: { opacity: 0.8 },

  errorText: { fontSize: 16, color: '#F44336', marginBottom: 12 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#1A1A1A', borderRadius: 10 },
  retryText: { color: '#FFFFFF', fontWeight: '600' },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 40 },
});
