import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { api, Credential } from '../api';

export default function CardsScreen() {
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
      <Text style={styles.title}>Credenciais</Text>
      <FlatList
        data={credentials}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable onLongPress={() => toggleActive(item)}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardUid}>{item.uid}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.active ? styles.active : styles.inactive,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {item.active ? 'Ativo' : 'Inativo'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardHolder}>{item.ownerName}</Text>
            </View>
          </Pressable>
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
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 },
  list: { gap: 12 },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardUid: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', fontFamily: 'monospace' },
  cardHolder: { fontSize: 14, color: '#888' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  active: { backgroundColor: '#1B3A2A' },
  inactive: { backgroundColor: '#3A1B1B' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  errorText: { fontSize: 16, color: '#F44336', marginBottom: 12 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#1A1A1A', borderRadius: 10 },
  retryText: { color: '#FFFFFF', fontWeight: '600' },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 40 },
});
