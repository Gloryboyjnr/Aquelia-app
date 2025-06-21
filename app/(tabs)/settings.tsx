import React from 'react';
import { View, Text, StyleSheet, Alert, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  User, 
  Building2, 
  Bell, 
  Lock, 
  HelpCircle, 
  FileText, 
  LogOut,
  Users,
  Briefcase,
  CreditCard
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import useAuthStore from '@/store/auth-store';
import SettingsSection from '@/components/SettingsSection';
import SettingsItem from '@/components/SettingsItem';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import Button from '@/components/Button';

interface SettingItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
  isPremium?: boolean;
  isLast?: boolean;
}

interface SettingsSection {
  id: string;
  title: string;
  items: SettingItem[];
}

// Group settings items for FlatList
const createSettingsSections = (
  router: ReturnType<typeof useRouter>,
  isPro: boolean,
  handleEditProfile: () => void,
  handleCompanySettings: () => void,
  handleEmployeeManagement: () => void,
  handleSubscription: () => void,
  handleBillingHistory: () => void,
  handleNotifications: () => void,
  handleSecurity: () => void,
  handleHelp: () => void,
  handleTerms: () => void,
  handleUpgrade: () => void
): SettingsSection[] => [
  {
    id: 'account',
    title: 'Account',
    items: [
      {
        id: 'profile',
        title: 'Profile Information',
        subtitle: 'Manage your personal information',
        icon: <User size={20} color={Colors.primary} />,
        onPress: handleEditProfile,
      },
      {
        id: 'company',
        title: 'Company Settings',
        subtitle: 'Update company details and preferences',
        icon: <Building2 size={20} color={Colors.primary} />,
        onPress: handleCompanySettings,
      },
      {
        id: 'employees',
        title: 'Employee Management',
        subtitle: 'Manage employees and roles',
        icon: <Users size={20} color={Colors.primary} />,
        onPress: handleEmployeeManagement,
        isLast: true,
      },
    ],
  },
  {
    id: 'subscription',
    title: 'Subscription',
    items: [
      {
        id: 'plan',
        title: 'Subscription Plan',
        subtitle: `You are on the ${isPro ? 'pro' : 'basic'} plan`,
        icon: <Briefcase size={20} color={Colors.primary} />,
        onPress: handleSubscription,
      },
      {
        id: 'billing',
        title: 'Billing History',
        subtitle: 'View your past invoices',
        icon: <CreditCard size={20} color={Colors.primary} />,
        onPress: handleBillingHistory,
        isLast: true,
      },
    ],
  },
  {
    id: 'preferences',
    title: 'Preferences',
    items: [
      {
        id: 'notifications',
        title: 'Notifications',
        subtitle: 'Manage your notification preferences',
        icon: <Bell size={20} color={Colors.primary} />,
        onPress: handleNotifications,
        isLast: true,
      },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    items: [
      {
        id: 'security-settings',
        title: 'Security Settings',
        subtitle: 'Manage your security preferences',
        icon: <Lock size={20} color={Colors.primary} />,
        onPress: handleSecurity,
        isLast: true,
      },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    items: [
      {
        id: 'help',
        title: 'Help & Support',
        subtitle: 'Get help with using the app',
        icon: <HelpCircle size={20} color={Colors.primary} />,
        onPress: handleHelp,
      },
      {
        id: 'terms',
        title: 'Terms & Policies',
        subtitle: 'View our terms and policies',
        icon: <FileText size={20} color={Colors.primary} />,
        onPress: handleTerms,
        isLast: true,
      },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, company, signOut } = useAuthStore();
  
  // For demo purposes, we'll use the company's subscriptionPlan
  // In a real app, you might get this from a subscription API
  const subscriptionPlan = company?.subscriptionPlan || 'basic';
  const isPro = subscriptionPlan === 'pro';
  
  const handleEditProfile = () => {
    router.push('/account/profile');
  };
  
  const handleUpgrade = () => {
    router.push('/setup/subscription');
  };
  
  const handleCompanySettings = () => {
    router.push('/account/company');
  };
  
  const handleEmployeeManagement = () => {
    router.push('/account/employees');
  };
  
  const handleSubscription = () => {
    router.push('/setup/subscription');
  };
  
  const handleBillingHistory = () => {
    router.push('/account/billing-history');
  };
  
  const handleNotifications = () => {
    router.push('/account/notifications');
  };
  
  const handleSecurity = () => {
    router.push('/account/security');
  };
  
  const handleHelp = () => {
    router.push('/account/help');
  };
  
  const handleTerms = () => {
    router.push('/account/terms');
  };
  
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: () => {
            signOut();
            router.replace('/auth/login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Create settings sections data
  const settingsSections = createSettingsSections(
    router,
    isPro,
    handleEditProfile,
    handleCompanySettings,
    handleEmployeeManagement,
    handleSubscription,
    handleBillingHistory,
    handleNotifications,
    handleSecurity,
    handleHelp,
    handleTerms,
    handleUpgrade
  );

  // Render a section with its items
  const renderSection = ({ item }: { item: SettingsSection }) => (
    <SettingsSection title={item.title}>
      {item.items.map((settingItem) => (
        <SettingsItem
          key={settingItem.id}
          title={settingItem.title}
          subtitle={settingItem.subtitle}
          icon={settingItem.icon}
          onPress={settingItem.onPress}
          isPremium={settingItem.isPremium}
          isLast={settingItem.isLast}
        />
      ))}
    </SettingsSection>
  );

  // Render header components (profile and subscription banner)
  const renderHeader = () => (
    <>
      {user && company && (
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            {user.profileImage ? (
              <Image 
                source={{ uri: user.profileImage }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileInitials}>
                <Text style={styles.initialsText}>
                  {user.fullName.split(' ').map(name => name[0]).join('').toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.fullName}</Text>
              <Text style={styles.profileRole}>{user.role}</Text>
              <Text style={styles.profileCompany}>{company.name}</Text>
            </View>
          </View>
          <Button
            title="Edit Profile"
            onPress={handleEditProfile}
            variant="outline"
            style={styles.editProfileButton}
          />
        </View>
      )}
      
      <SubscriptionBanner
        plan={subscriptionPlan as 'basic' | 'pro'}
        expiryDate={company?.subscriptionEndDate}
        onUpgrade={!isPro ? handleUpgrade : undefined}
      />
    </>
  );

  // Render footer components (sign out button and version)
  const renderFooter = () => (
    <>
      <View style={styles.signOutContainer}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          style={styles.signOutButton}
          textStyle={styles.signOutText}
          leftIcon={<LogOut size={20} color={Colors.danger} />}
        />
      </View>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={settingsSections}
        renderItem={renderSection}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  profileInitials: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  initialsText: {
    fontSize: 24,
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 2,
  },
  profileCompany: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  editProfileButton: {
    marginTop: 8,
  },
  signOutContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  signOutButton: {
    borderColor: Colors.danger,
    backgroundColor: 'transparent',
  },
  signOutText: {
    color: Colors.danger,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  versionText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
});