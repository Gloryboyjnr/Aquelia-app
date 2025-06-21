import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, User, X } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import useAuthStore from '@/store/auth-store';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    role: user?.role || '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setProfileData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      role: user?.role || '',
    });
    setProfileImage(user?.profileImage || null);
  };
  
  const handleSave = () => {
    if (!profileData.fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }
    
    if (!profileData.phoneNumber.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (user) {
        const updatedUser = {
          ...user,
          ...profileData,
          profileImage,
          updatedAt: new Date().toISOString(),
        };
        
        setUser(updatedUser);
        setIsEditing(false);
        setIsLoading(false);
        
        Alert.alert('Success', 'Profile updated successfully');
      }
    }, 1000);
  };
  
  const handleChangePhoto = () => {
    setIsImagePickerVisible(true);
  };
  
  const handleRemovePhoto = () => {
    setProfileImage(null);
    setIsImagePickerVisible(false);
  };
  
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
    
    setIsImagePickerVisible(false);
  };
  
  const handleChooseFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Photo library permission is required to select photos');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
    
    setIsImagePickerVisible(false);
  };
  
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
          <Button
            title="Go Back"
            onPress={handleBack}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        {!isEditing ? (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileImageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileInitials}>
              <Text style={styles.initialsText}>
                {user.fullName.split(' ').map(name => name[0]).join('').toUpperCase()}
              </Text>
            </View>
          )}
          
          {isEditing && (
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handleChangePhoto}
            >
              <Camera size={16} color={Colors.white} />
              <Text style={styles.changePhotoText}>
                {profileImage ? 'Change Photo' : 'Add Photo'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {isEditing ? (
          <>
            <Input
              label="Full Name"
              value={profileData.fullName}
              onChangeText={(text) => setProfileData({ ...profileData, fullName: text })}
              placeholder="Enter your full name"
              required
            />
            
            <Input
              label="Email Address"
              value={profileData.email}
              onChangeText={(text) => setProfileData({ ...profileData, email: text })}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Input
              label="Phone Number"
              value={profileData.phoneNumber}
              onChangeText={(text) => setProfileData({ ...profileData, phoneNumber: text })}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              required
            />
            
            <Input
              label="Role"
              value={profileData.role}
              onChangeText={(text) => setProfileData({ ...profileData, role: text })}
              placeholder="Enter your role"
            />
            
            <View style={styles.actionButtons}>
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title={isLoading ? 'Saving...' : 'Save Changes'}
                onPress={handleSave}
                style={styles.saveButton}
                disabled={isLoading}
              />
            </View>
          </>
        ) : (
          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Full Name</Text>
              <Text style={styles.detailValue}>{user.fullName}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Email Address</Text>
              <Text style={styles.detailValue}>{user.email || 'Not provided'}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>{user.phoneNumber}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Role</Text>
              <Text style={styles.detailValue}>{user.role}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Account Created</Text>
              <Text style={styles.detailValue}>
                {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
      
      {isImagePickerVisible && (
        <View style={styles.imagePickerOverlay}>
          <View style={styles.imagePickerContainer}>
            <View style={styles.imagePickerHeader}>
              <Text style={styles.imagePickerTitle}>Change Profile Photo</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsImagePickerVisible(false)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={handleTakePhoto}
            >
              <Camera size={24} color={Colors.primary} />
              <Text style={styles.imagePickerOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={handleChooseFromLibrary}
            >
              <User size={24} color={Colors.primary} />
              <Text style={styles.imagePickerOptionText}>Choose from Library</Text>
            </TouchableOpacity>
            
            {profileImage && (
              <TouchableOpacity
                style={[styles.imagePickerOption, styles.removePhotoOption]}
                onPress={handleRemovePhoto}
              >
                <X size={24} color={Colors.danger} />
                <Text style={[styles.imagePickerOptionText, styles.removePhotoText]}>
                  Remove Current Photo
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileInitials: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  initialsText: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.white,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
  profileDetails: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailItem: {
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: Fonts.sizes.md,
    fontWeight: '500',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  errorButton: {
    width: 200,
  },
  imagePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  imagePickerContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
  },
  imagePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  imagePickerOptionText: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    marginLeft: 16,
  },
  removePhotoOption: {
    borderBottomWidth: 0,
  },
  removePhotoText: {
    color: Colors.danger,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});