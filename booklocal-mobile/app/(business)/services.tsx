import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal,
  Switch, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { businessService } from '../../services/businessService';
import { GoldButton } from '../../components/ui/GoldButton';
import { Service, Business } from '../../types';
import { COLORS, SPACING, RADIUS } from '../../constants/AppConstants';

export default function ManageServicesScreen() {
  const { user } = useAuthStore();
  const [business, setBiz] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [tag, setTag] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!user) return;
    businessService.getBusinessByOwnerId(user.id).then((biz) => {
      setBiz(biz);
      if (biz) businessService.getServices(biz.id).then(setServices);
    });
  }, [user]);

  const resetForm = () => {
    setName(''); setDesc(''); setDuration('60'); setPrice(''); setDeposit(''); setTag(''); setActive(true); setEditing(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (s: Service) => {
    setEditing(s);
    setName(s.name); setDesc(s.description ?? ''); setDuration(String(s.duration_minutes));
    setPrice(String(s.price)); setDeposit(String(s.deposit_amount)); setTag(s.category_tag ?? ''); setActive(s.is_active);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !price || !business) return;
    setLoading(true);

    const payload: Partial<Service> = {
      business_id: business.id,
      name: name.trim(),
      description: desc.trim(),
      duration_minutes: parseInt(duration) || 60,
      price: parseFloat(price),
      deposit_amount: parseFloat(deposit) || 0,
      category_tag: tag.trim() || undefined,
      is_active: active,
    };

    if (editing) {
      await businessService.updateService(editing.id, payload);
    } else {
      await businessService.createService(payload);
    }

    const fresh = await businessService.getServices(business.id);
    setServices(fresh);
    setLoading(false);
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (service: Service) => {
    Alert.alert('Delete Service', `Delete "${service.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await businessService.deleteService(service.id);
          setServices((prev) => prev.filter((s) => s.id !== service.id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✂️</Text>
            <Text style={styles.emptyText}>No services yet. Add your first service!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.serviceRow, !item.is_active && styles.inactive]}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.serviceMeta}>
                {item.duration_minutes}min · £{item.price.toFixed(2)} · Deposit £{item.deposit_amount.toFixed(2)}
              </Text>
              {!item.is_active && <Text style={styles.inactiveLabel}>Inactive</Text>}
            </View>
            <View style={styles.serviceActions}>
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Edit Service' : 'Add Service'}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <FormField label="Service Name *" value={name} onChangeText={setName} placeholder="e.g. Classic Haircut" />
            <FormField label="Description" value={desc} onChangeText={setDesc} placeholder="Short description..." multiline />
            <FormField label="Duration (minutes) *" value={duration} onChangeText={setDuration} placeholder="60" keyboardType="numeric" />
            <FormField label="Price (£) *" value={price} onChangeText={setPrice} placeholder="25.00" keyboardType="decimal-pad" />
            <FormField label="Deposit Amount (£)" value={deposit} onChangeText={setDeposit} placeholder="5.00" keyboardType="decimal-pad" />
            <FormField label="Category Tag" value={tag} onChangeText={setTag} placeholder="e.g. Cuts, Colour..." />

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Active</Text>
              <Switch value={active} onValueChange={setActive} trackColor={{ false: COLORS.surface3, true: COLORS.gold }} thumbColor={COLORS.white} />
            </View>

            <GoldButton title={editing ? 'Save Changes' : 'Add Service'} onPress={handleSave} loading={loading} style={styles.saveBtn} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function FormField({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }: any) {
  return (
    <>
      <Text style={formStyles.label}>{label}</Text>
      <TextInput
        style={[formStyles.input, multiline && formStyles.textarea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.greyDark}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </>
  );
}
const formStyles = StyleSheet.create({
  label: { fontSize: 13, color: COLORS.greyLight, fontWeight: '600', marginBottom: SPACING.xs },
  input: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 52, color: COLORS.white, fontSize: 15, borderWidth: 1, borderColor: COLORS.surface3, marginBottom: SPACING.md },
  textarea: { height: 80, paddingTop: SPACING.sm },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.white },
  addBtn: { backgroundColor: COLORS.gold, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  addBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.black },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  serviceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.md },
  inactive: { opacity: 0.5 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  serviceMeta: { fontSize: 12, color: COLORS.grey, marginTop: 3 },
  inactiveLabel: { fontSize: 11, color: COLORS.error, marginTop: 2 },
  serviceActions: { flexDirection: 'row', gap: SPACING.sm },
  editBtn: { backgroundColor: COLORS.gold + '22', borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 5 },
  editBtnText: { fontSize: 13, color: COLORS.gold, fontWeight: '700' },
  deleteBtn: { backgroundColor: COLORS.error + '22', borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 5 },
  deleteBtnText: { fontSize: 13, color: COLORS.error, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: SPACING.xxl, gap: SPACING.md },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 15, color: COLORS.grey, textAlign: 'center' },
  modalSafe: { flex: 1, backgroundColor: COLORS.black },
  modalScroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.lg, paddingBottom: SPACING.xl },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  closeBtn: { fontSize: 22, color: COLORS.grey },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  label: { fontSize: 15, color: COLORS.white, fontWeight: '600' },
  saveBtn: { marginTop: SPACING.sm },
});
