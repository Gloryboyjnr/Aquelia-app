import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Lock } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import useAuthStore from '@/store/auth-store';
import Button from '@/components/Button';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  category: 'production' | 'inventory' | 'quality' | 'sales' | 'system';
}

interface NotificationCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  settings: NotificationSetting[];
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [notificationSettings, setNotificationSettings] = useState<NotificationCategory[]>([
    {
      id: 'production',
      title: 'Production Alerts',
      icon: <Bell size={20} color={Colors.primary} />,
      settings: [
        {
          id: 'production_complete',
          title: 'Production Complete',
          description: 'Get notified when production batches are completed',
          enabled: true,
          category: 'production'
        },
        {
          id: 'production_delays',
          title: 'Production Delays',
          description: 'Alert when production is behind schedule',
          enabled: true,
          category: 'production'
        }
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory Alerts',
      icon: <Bell size={20} color={Colors.accent} />,
      settings: [
        {
          id: 'low_stock',
          title: 'Low Stock Alerts',
          description: 'Get notified when inventory levels are low',
          enabled: true,
          category: 'inventory'
        },
        {
          id: 'expiry_warnings',
          title: 'Expiry Warnings',
          description: 'Alert when items are approaching expiry',
          enabled: false,
          category: 'inventory'
        }
      ]
    },
    {
      id: 'quality',
      title: 'Quality Control',
      icon: <Lock size={20} color={Colors.success} />,
      settings: [
        {
          id: 'qa_failures',
          title: 'QA Failures',
          description: 'Immediate alerts for quality control failures',
          enabled: true,
          category: 'quality'
        },
        {
          id: 'inspection_due',
          title: 'Inspection Due',
          description: 'Reminders for scheduled quality inspections',
          enabled: true,
          category: 'quality'
        }
      ]
    }
  ]);

  const toggleNotification = (categoryId: string, settingId: string) => {
    setNotificationSettings(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              settings: category.settings.map(setting =>
                setting.id === settingId 
                  ? { ...setting, enabled: !setting.enabled }
                  : setting
              )
            }
          : category
      )
    );
  };

  const renderNotificationSetting = ({ item: setting, categoryId }: { item: NotificationSetting; categoryId: string }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{setting.title}</Text>
        <Text style={styles.settingDescription}>{setting.description}</Text>
      </View>
      <Switch
        value={setting.enabled}
        onValueChange={() => toggleNotification(categoryId, setting.id)}
        trackColor={{ false: Colors.border, true: Colors.primaryLight }}
        thumbColor={setting.enabled ? Colors.primary : Colors.textLight}
      />
    </View>
  );

  const renderCategory = ({ item: category }: { item: NotificationCategory }) => (
    <View style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        {category.icon}
        <Text style={styles.categoryTitle}>{category.title}</Text>
      </View>
      <View style={styles.categorySettings}>
        {category.settings.map((setting) => (
          <View key={setting.id}>
            {renderNotificationSetting({ item: setting, categoryId: category.id })}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={notificationSettings}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Button
          title="Save Preferences"
          onPress={() => {
            router.back();
          }}
          style={styles.saveButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  categoryContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
    marginLeft: 12,
  },
  categorySettings: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: Fonts.weights.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: Fonts.weights.normal,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    marginTop: 0,
  },
});