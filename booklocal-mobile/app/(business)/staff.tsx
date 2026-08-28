import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  ScrollView, TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { businessService } from '../../services/businessService';
import { GoldButton } from '../../components/ui/GoldButton';
import { StaffMember, Business } from '../../types';
import { COLORS, SPACING, RADIUS } from '../../constants/AppConstants';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ManageStaffScreen() {
  const { user } = useAuthStore();
  const [business, setBiz] = useState<Business | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!user) return;
    businessService.getBusinessByOwnerId(user.id).then((biz) => {
      setBiz(biz);
      if (biz) businessService.getStaff(biz.id).then(setStaff);
    });
  }, [user]);

  const resetForm = () => { setName(''); setRole(''); setPhotoUrl(''); setBio(''); };

  const handleSave = async () => {
    if (!name.trim() || !business) return;
    setLoading(true);
    await businessService.createStaff({
      business_id: business.id,
      name: name.trim(),
      role: role.trim(),
      photo_url: photoUrl.trim() || undefined,
      bio: bio.trim(),
      is_active: true,
      working_hours: {
        Mon: { start: '09:00', end: '17:00', is_working: true },
        Tue: { start: '09:00', end: '17:00', is_working: true },
        Wed: { start: '09:00', end: '17:00', is_working: true },
        Thu: { start: '09:00', end: '17:00', is_working: true },
        Fri: { start: '09:00', end: '17:00', is_working: true },
        Sat: { start: '10:00', end: '16:00', is_working: true },
        Sun: { start: '00:00', end: '00:00', is_working: false },
      },
      days_off: [],
    });

    const fresh = await businessService.getStaff(business.id);
    setStaff(fresh);
    setLoading(false);
    setShowModal(false);
    resetForm();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Team</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowModal(true); }}>
          <Text style={styles.addBtnText}>+ Add Member</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={staff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyText}>Add your first team member!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, !item.is_active && { opacity: 0.5 }]}>
            <Image
              source={{ uri: item.photo_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=C9A84C&color=000` }}
              style={styles.photo}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.roleTxt}>{item.role}</Text>
              {item.bio ? <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text> : null}
              <Text style={styles.hours}>
                {DAYS.filter((d) => item.working_hours?.[d]?.is_working).join(', ')}
              </Text>
            </View>
          </View>
        )}
      />

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Team Member</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {[
              { label: 'Full Name *', value: name, set: setName, placeholder: 'e.g. Jamie Wilson' },
              { label: 'Role / Title', value: role, set: setRole, placeholder: 'e.g. Senior Barber' },
              { label: 'Photo URL', value: photoUrl, set: setPhotoUrl, placeholder: 'https://...' },
              { label: 'Bio', value: bio, set: setBio, placeholder: 'Short bio...', multi: true },
            ].map((f) => (
              <React.Fragment key={f.label}>
                <Text style={styles.label}>{f.label}</Text>
                <TextInput
                  style={[styles.input, f.multi && styles.textarea]}
                  value={f.value}
                  onChangeText={f.set}
                  placeholder={f.placeholder}
                  placeholderTextColor={COLORS.greyDark}
                  multiline={f.multi}
                  numberOfLines={f.multi ? 3 : 1}
                  textAlignVertical={f.multi ? 'top' : 'center'}
                />
              </React.Fragment>
            ))}

            <GoldButton title="Add to Team" onPress={handleSave} loading={loading} style={styles.saveBtn} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.white },
  addBtn: { backgroundColor: COLORS.gold, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  addBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.black },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.md },
  photo: { width: 60, height: 60, borderRadius: 30, borderWidth: 1.5, borderColor: COLORS.gold },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  roleTxt: { fontSize: 13, color: COLORS.grey, marginTop: 2 },
  bio: { fontSize: 12, color: COLORS.greyDark, marginTop: 4 },
  hours: { fontSize: 11, color: COLORS.gold, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: SPACING.xxl, gap: SPACING.md },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 15, color: COLORS.grey },
  modalSafe: { flex: 1, backgroundColor: COLORS.black },
  modalScroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.lg, paddingBottom: SPACING.xl },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  closeBtn: { fontSize: 22, color: COLORS.grey },
  label: { fontSize: 13, color: COLORS.greyLight, fontWeight: '600', marginBottom: SPACING.xs },
  input: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 52, color: COLORS.white, fontSize: 15, borderWidth: 1, borderColor: COLORS.surface3, marginBottom: SPACING.md },
  textarea: { height: 80, paddingTop: SPACING.sm },
  saveBtn: { marginTop: SPACING.sm },
});
