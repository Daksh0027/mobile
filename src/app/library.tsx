import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@/components/Icon';
import { useAuth, useUser, useClerk } from '@clerk/clerk-expo';
import { Colors } from '@/constants/config';
import { useLibrary } from '@/context/LibraryContext';

export default function LibraryScreen() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const { playlists, likedTrackIds, createPlaylist } = useLibrary();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setCreateModalOpen(false);
  };

  if (!isSignedIn) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <Text style={styles.heading}>Your Library</Text>
          <View style={styles.signInBox}>
            <Ionicons name="library-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.signInTitle}>Enjoy your music library</Text>
            <Text style={styles.signInSub}>Sign in to save liked songs and create playlists</Text>
            <TouchableOpacity style={styles.signInBtn} onPress={() => openSignIn()}>
              <Text style={styles.signInBtnText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const libraryItems = [
    {
      id: 'liked',
      title: 'Liked Songs',
      subtitle: `Playlist · ${likedTrackIds.length} songs`,
      isLiked: true,
    },
    ...playlists.map(pl => ({
      id: pl.id,
      title: pl.title,
      subtitle: 'Playlist',
      isLiked: false,
    })),
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarLetter}>{user?.firstName?.[0] || 'U'}</Text>
              </View>
            )}
            <Text style={styles.heading}>Your Library</Text>
          </View>
          <TouchableOpacity onPress={() => setCreateModalOpen(true)} style={styles.createBtn}>
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Library list */}
        <FlatList
          data={libraryItems}
          keyExtractor={i => i.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No playlists yet</Text>
              <TouchableOpacity style={styles.createEmptyBtn} onPress={() => setCreateModalOpen(true)}>
                <Text style={styles.createEmptyText}>Create your first playlist</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.libRow} activeOpacity={0.7}>
              {item.isLiked ? (
                <View style={styles.likedThumb}>
                  <Ionicons name="heart" size={24} color="#fff" />
                </View>
              ) : (
                <View style={styles.playlistThumb}>
                  <Ionicons name="musical-notes" size={22} color="#b3b3b3" />
                </View>
              )}
              <View style={styles.libInfo}>
                <Text style={styles.libTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.libSubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>

      {/* Create Playlist Modal */}
      <Modal visible={createModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Playlist name"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
              onSubmitEditing={handleCreate}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => { setCreateModalOpen(false); setNewPlaylistName(''); }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCreateBtn, !newPlaylistName.trim() && { opacity: 0.4 }]}
                onPress={handleCreate}
                disabled={!newPlaylistName.trim()}
              >
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.black },
  safe: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: { backgroundColor: '#e13300', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#fff', fontWeight: '800', fontSize: 16 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '800' },
  createBtn: { padding: 4 },

  libRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  likedThumb: {
    width: 52,
    height: 52,
    borderRadius: 4,
    background: 'linear-gradient(135deg, #450af5, #c4efd9)',
    backgroundColor: '#450af5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistThumb: {
    width: 52,
    height: 52,
    borderRadius: 4,
    backgroundColor: '#282828',
    alignItems: 'center',
    justifyContent: 'center',
  },
  libInfo: { flex: 1 },
  libTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  libSubtitle: { color: '#b3b3b3', fontSize: 12, marginTop: 2 },

  signInBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 32 },
  signInTitle: { color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  signInSub: { color: '#b3b3b3', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  signInBtn: {
    marginTop: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  signInBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },

  empty: { alignItems: 'center', paddingTop: 48, gap: 16 },
  emptyText: { color: '#b3b3b3', fontSize: 15 },
  createEmptyBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  createEmptyText: { color: '#000', fontWeight: '700', fontSize: 13 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#282828',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    gap: 16,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
    fontSize: 15,
    padding: 12,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  modalCancelText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  modalCreateBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.green,
  },
  modalCreateText: { color: '#000', fontWeight: '800', fontSize: 13 },
});
