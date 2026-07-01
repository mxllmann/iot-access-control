import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { api, AccessLog } from '../api';

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const date = d.toLocaleDateString('pt-BR');
  return { time, date };
}

export default function HistoryScreen() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.logs.getAll({ limit: 50 });
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, []);

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
        <Text style={styles.errorText}>Erro ao carregar historico</Text>
        <Pressable style={styles.retryButton} onPress={fetchLogs}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historico de Acesso</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const { time, date } = formatTimestamp(item.timestamp);
          return (
            <View style={styles.row}>
              <View style={[styles.indicator, item.authorized ? styles.granted : styles.denied]} />
              <View style={styles.rowContent}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowHolder}>
                    {item.ownerName || 'Desconhecido'}
                  </Text>
                  <Text style={styles.rowTime}>{time}</Text>
                </View>
                <View style={styles.rowFooter}>
                  <Text style={styles.rowUid}>{item.credentialUid}</Text>
                  <Text style={styles.rowDate}>{date}</Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum registro de acesso</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#0D0D0D' },
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  indicator: { width: 4, height: '100%', borderRadius: 2, marginRight: 12, minHeight: 36 },
  granted: { backgroundColor: '#4CAF50' },
  denied: { backgroundColor: '#F44336' },
  rowContent: { flex: 1 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  rowHolder: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  rowTime: { fontSize: 13, color: '#888' },
  rowFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  rowUid: { fontSize: 13, color: '#666', fontFamily: 'monospace' },
  rowDate: { fontSize: 12, color: '#555' },
  errorText: { fontSize: 16, color: '#F44336', marginBottom: 12 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#1A1A1A', borderRadius: 10 },
  retryText: { color: '#FFFFFF', fontWeight: '600' },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 40 },
});
