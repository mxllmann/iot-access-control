import { StyleSheet, Text, View, FlatList } from 'react-native';

const MOCK_CARDS = [
  { id: '1', uid: 'A1:B2:C3:D4', holder: 'Arthur Mallmann', status: 'Ativo' },
  { id: '2', uid: 'E5:F6:G7:H8', holder: 'Joao Silva', status: 'Ativo' },
  { id: '3', uid: 'I9:J0:K1:L2', holder: 'Maria Souza', status: 'Inativo' },
];

export default function CardsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Credenciais</Text>
      <FlatList
        data={MOCK_CARDS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardUid}>{item.uid}</Text>
              <View
                style={[
                  styles.statusBadge,
                  item.status === 'Ativo' ? styles.active : styles.inactive,
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.cardHolder}>{item.holder}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#0D0D0D' },
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
});
