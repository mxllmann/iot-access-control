import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { api, Credential } from '../../src/api';
import { useAuth } from '../../src/auth';
import CredentialCard from '../../src/components/CredentialCard';

export default function CardsTab() {
  const router = useRouter();
  const auth = useAuth();
  const isAdmin = auth.status === 'authenticated' && auth.user.role === 'admin';

  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredentials = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.credentials.getAll();
      setCredentials(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCredentials(); }, []);

  const toggleActive = async (credential: Credential) => {
    if (!isAdmin) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await api.credentials.update(credential.uid, { active: !credential.active });
      setCredentials((prev) =>
        prev.map((c) =>
          c.uid === credential.uid ? { ...c, active: !c.active } : c
        )
      );
    } catch {}
  };

  const handleLogout = async () => {
    if (auth.status === 'authenticated') {
      await auth.logout();
    }
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
        <Text style={styles.errorText}>Erro ao carregar credenciais</Text>
        <Pressable style={styles.retryButton} onPress={fetchCredentials}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Credenciais</Text>
          {auth.status === 'authenticated' && (
            <Text style={styles.userInfo}>{auth.user.name} • {auth.user.role}</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          {isAdmin && (
            <Pressable
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
              onPress={() => router.push('/(tabs)/register')}
            >
              <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={22} color="#F44336" />
          </Pressable>
        </View>
      </View>
      <FlatList
        data={credentials}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CredentialCard
            credential={item}
            onPress={() => router.push(`/credential/${item.uid}`)}
            onLongPress={isAdmin ? () => toggleActive(item) : undefined}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma credencial cadastrada</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#0D0D0D' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  userInfo: { fontSize: 13, color: '#888', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: { opacity: 0.7 },
  list: { gap: 16 },
  errorText: { fontSize: 16, color: '#F44336', marginBottom: 12 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#1A1A1A', borderRadius: 10 },
  retryText: { color: '#FFFFFF', fontWeight: '600' },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 40 },
});
