import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import {
    ArrowLeft,
    Edit3,
    UserMinus,
    UserPlus
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';
import { groupsService } from '@/src/services/groups';
import { useAuthStore } from '@/src/stores/auth-store';

export default function GroupSettingsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { profile } = useAuthStore();
  const { id } = useLocalSearchParams();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const groupId = id as string;

  // Fetch group details
  const { data: groupData, refetch: refetchGroup } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsService.getGroupDetails(groupId),
    enabled: !!groupId,
  });

  // Fetch group members
  const { data: groupMembers, refetch: refetchMembers } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => groupsService.getGroupMembers(groupId),
    enabled: !!groupId,
  });

  // Check if current user is admin
  const isAdmin = groupMembers?.some(
    member => member.user_id === profile?.id && member.role === 'admin'
  );

  const handleUpdateGroupName = async () => {
    if (!newGroupName.trim() || !groupData) return;

    try {
      await groupsService.updateGroupName(groupData.id, newGroupName.trim());
      setIsEditingName(false);
      setNewGroupName('');
      refetchGroup();
      Alert.alert('Success', 'Group name updated successfully');
    } catch (error) {
      console.error('Error updating group name:', error);
      Alert.alert('Error', 'Failed to update group name');
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${userName} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await groupsService.removeGroupMember(groupId, userId);
              refetchMembers();
              Alert.alert('Success', `${userName} has been removed from the group`);
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove member');
            }
          }
        }
      ]
    );
  };

  const handleAddMember = () => {
    // Navigate to add member screen or show modal
    // For now, just show an alert
    Alert.alert('Add Member', 'This feature will be implemented soon');
  };

  if (!groupData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Group Settings</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading group details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Group Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Group Info */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.groupInfo}>
            <Image
              source={{ uri: groupData.avatar_url || 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=60&h=60&fit=crop' }}
              style={styles.groupAvatar}
              contentFit="cover"
            />
            <View style={styles.groupDetails}>
              {isEditingName ? (
                <View style={styles.nameEditContainer}>
                  <TextInput
                    style={[styles.nameInput, { color: colors.text }]}
                    value={newGroupName}
                    onChangeText={setNewGroupName}
                    placeholder={groupData.name}
                    placeholderTextColor={colors.secondaryText}
                    maxLength={50}
                    autoFocus
                  />
                  <View style={styles.nameEditActions}>
                    <TouchableOpacity
                      style={[styles.nameEditButton, styles.cancelButton]}
                      onPress={() => {
                        setIsEditingName(false);
                        setNewGroupName('');
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.nameEditButton, styles.saveButton]}
                      onPress={handleUpdateGroupName}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.nameContainer}>
                  <Text style={[styles.groupName, { color: colors.text }]}>
                    {groupData.name}
                  </Text>
                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setIsEditingName(true);
                        setNewGroupName(groupData.name);
                      }}
                    >
                      <Edit3 size={16} color={colors.secondaryText} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <Text style={[styles.groupDescription, { color: colors.secondaryText }]}>
                {groupMembers?.length || 0} members
              </Text>
            </View>
          </View>
        </View>

        {/* Members Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Members ({groupMembers?.length || 0})
            </Text>
            {isAdmin && (
              <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
                <UserPlus size={20} color="#138AFE" />
              </TouchableOpacity>
            )}
          </View>

          {groupMembers?.map((member) => (
            <View key={member.user_id} style={styles.memberItem}>
              <View style={styles.memberInfo}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' }}
                  style={styles.memberAvatar}
                  contentFit="cover"
                />
                <View style={styles.memberDetails}>
                  <Text style={[styles.memberName, { color: colors.text }]}>
                    {member.user_id === profile?.id ? 'You' : `Member ${member.user_id.slice(0, 8)}`}
                  </Text>
                  <Text style={[styles.memberRole, { color: colors.secondaryText }]}>
                    {member.role}
                  </Text>
                </View>
              </View>

              {isAdmin && member.user_id !== profile?.id && (
                <TouchableOpacity
                  style={styles.memberAction}
                  onPress={() => handleRemoveMember(member.user_id, `Member ${member.user_id.slice(0, 8)}`)}
                >
                  <UserMinus size={20} color="#FF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Group Actions */}
        {isAdmin && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity style={[styles.dangerButton]}>
              <Text style={styles.dangerButtonText}>Leave Group</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  groupDetails: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  groupDescription: {
    fontSize: 14,
  },
  nameEditContainer: {
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  nameEditActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  nameEditButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#138AFE',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: 14,
  },
  memberAction: {
    padding: 8,
  },
  dangerButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});