import { StyleSheet, Text, View, FlatList } from 'react-native';

const MOCK_HISTORY = [
  { id: '1', uid: 'A1:B2:C3:D4', holder: 'Arthur Mallmann', time: '14:32', date: '01/07/2026', granted: true },
  { id: '2', uid: 'E5:F6:G7:H8', holder: 'Joao Silva', time: '14:28', date: '01/07/2026', granted: true },
  { id: '3', uid: 'FF:FF:FF:FF', holder: 'Desconhecido', time: '13:55', date: '01/07/2026', granted: false },
  { id: '4', uid: 'I9:J0:K1:L2', holder: 'Maria Souza', time: '09:10', date: '01/07/2026', granted: false },
  { id: '5', uid: 'A1:B2:C3:D4', holder: 'Arthur Mallmann', time: '08:45', date: '30/06/2026', granted: true },
];

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historico de Acesso</Text>
      <FlatList
        data={MOCK_HISTORY}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.indicator, item.granted ? styles.granted : styles.denied]} />
            <View style={styles.rowContent}>
              <View style={styles.rowHeader}>
                <Text style={styles.rowHolder}>{item.holder}</Text>
                <Text style={styles.rowTime}>{item.time}</Text>
              </View>
              <View style={styles.rowFooter}>
                <Text style={styles.rowUid}>{item.uid}</Text>
                <Text style={styles.rowDate}>{item.date}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#0D0D0D' },
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
});
