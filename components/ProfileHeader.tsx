import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Settings } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Card from '@/components/Card';

interface ProfileHeaderProps {
  fullName: string;
  role: string;
  companyName: string;
  onEditProfile: () => void;
}

export default function ProfileHeader({
  fullName,
  role,
  companyName,
  onEditProfile,
}: ProfileHeaderProps) {
  return (
    <Card style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {fullName.split(' ').map(name => name[0]).join('').toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.role}>{role}</Text>
          <Text style={styles.company}>{companyName}</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
          <Settings size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    padding: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.card,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  role: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 2,
  },
  company: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.primary,
  },
  editButton: {
    padding: 8,
  },
});