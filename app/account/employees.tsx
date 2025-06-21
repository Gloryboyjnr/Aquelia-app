import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Search, User, Edit2, Trash2 } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import useAuthStore from '@/store/auth-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { Employee } from '@/types/auth';

export default function EmployeesScreen() {
  const router = useRouter();
  const { employees, removeEmployee, company, addEmployee, updateEmployee } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    role: '',
    department: 'production' as Employee['department'],
  });
  
  const filteredEmployees = employees.filter(
    (employee: Employee) =>
      employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.department && employee.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleBack = () => {
    router.back();
  };
  
  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setNewEmployee({
      fullName: '',
      phoneNumber: '',
      email: '',
      role: '',
      department: 'production',
    });
    setShowAddEmployee(true);
  };
  
  const handleCancelAdd = () => {
    setShowAddEmployee(false);
    setEditingEmployee(null);
    setNewEmployee({
      fullName: '',
      phoneNumber: '',
      email: '',
      role: '',
      department: 'production',
    });
  };
  
  const handleSaveEmployee = () => {
    if (!newEmployee.fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }
    
    if (!newEmployee.phoneNumber.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }
    
    if (!newEmployee.role.trim()) {
      Alert.alert('Error', 'Role is required');
      return;
    }
    
    if (editingEmployee) {
      // Update existing employee
      updateEmployee(editingEmployee.id, {
        ...newEmployee,
        updatedAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Employee updated successfully');
    } else {
      // Add new employee
      addEmployee({
        ...newEmployee,
        isActive: true,
      });
      Alert.alert('Success', 'Employee added successfully');
    }
    
    setShowAddEmployee(false);
    setEditingEmployee(null);
    setNewEmployee({
      fullName: '',
      phoneNumber: '',
      email: '',
      role: '',
      department: 'production',
    });
  };
  
  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      fullName: employee.fullName,
      phoneNumber: employee.phoneNumber,
      email: employee.email || '',
      role: employee.role,
      department: employee.department,
    });
    setShowAddEmployee(true);
  };
  
  const handleDeleteEmployee = (employee: Employee) => {
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${employee.fullName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            removeEmployee(employee.id);
            Alert.alert('Success', 'Employee deleted successfully');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const renderEmployeeItem = ({ item }: { item: Employee }) => (
    <Card style={styles.employeeCard}>
      <View style={styles.employeeHeader}>
        <View style={styles.employeeAvatar}>
          <Text style={styles.employeeAvatarText}>
            {item.fullName.split(' ').map((name: string) => name[0]).join('').toUpperCase()}
          </Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{item.fullName}</Text>
          <Text style={styles.employeeRole}>{item.role}</Text>
          {item.department && (
            <View style={styles.departmentBadge}>
              <Text style={styles.departmentText}>{item.department}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.employeeContact}>
        <Text style={styles.contactLabel}>Phone:</Text>
        <Text style={styles.contactValue}>{item.phoneNumber}</Text>
      </View>
      
      {item.email && (
        <View style={styles.employeeContact}>
          <Text style={styles.contactLabel}>Email:</Text>
          <Text style={styles.contactValue}>{item.email}</Text>
        </View>
      )}
      
      <View style={styles.employeeActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={() => handleEditEmployee(item)}
        >
          <Edit2 size={16} color={Colors.primary} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => handleDeleteEmployee(item)}
        >
          <Trash2 size={16} color={Colors.danger} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddEmployee}>
          <Plus size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      {showAddEmployee ? (
        <View style={styles.addEmployeeContainer}>
          <Text style={styles.addEmployeeTitle}>
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </Text>
          
          <Input
            label="Full Name"
            value={newEmployee.fullName}
            onChangeText={(text) => setNewEmployee({ ...newEmployee, fullName: text })}
            placeholder="Enter full name"
            required
          />
          
          <Input
            label="Phone Number"
            value={newEmployee.phoneNumber}
            onChangeText={(text) => setNewEmployee({ ...newEmployee, phoneNumber: text })}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            required
          />
          
          <Input
            label="Email Address"
            value={newEmployee.email}
            onChangeText={(text) => setNewEmployee({ ...newEmployee, email: text })}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input
            label="Role"
            value={newEmployee.role}
            onChangeText={(text) => setNewEmployee({ ...newEmployee, role: text })}
            placeholder="Enter role (e.g., Manager, Operator)"
            required
          />
          
          <View style={styles.departmentContainer}>
            <Text style={styles.departmentLabel}>Department</Text>
            <View style={styles.departmentOptions}>
              {['production', 'sales', 'quality', 'inventory', 'management'].map((dept) => (
                <TouchableOpacity
                  key={dept}
                  style={[
                    styles.departmentOption,
                    newEmployee.department === dept && styles.selectedDepartment,
                  ]}
                  onPress={() => setNewEmployee({ ...newEmployee, department: dept as Employee['department'] })}
                >
                  <Text
                    style={[
                      styles.departmentOptionText,
                      newEmployee.department === dept && styles.selectedDepartmentText,
                    ]}
                  >
                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.addEmployeeActions}>
            <Button
              title="Cancel"
              onPress={handleCancelAdd}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title={editingEmployee ? 'Update' : 'Save'}
              onPress={handleSaveEmployee}
              style={styles.saveButton}
            />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Search size={20} color={Colors.textLight} />}
              containerStyle={styles.searchInputContainer}
            />
          </View>
          
          {filteredEmployees.length > 0 ? (
            <FlatList
              data={filteredEmployees}
              renderItem={renderEmployeeItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <User size={64} color={Colors.textLight} />
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No employees found matching your search'
                  : 'No employees added yet'}
              </Text>
              <Button
                title="Add Employee"
                onPress={handleAddEmployee}
                style={styles.emptyAddButton}
              />
            </View>
          )}
        </>
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
  addButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    marginBottom: 0,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  employeeCard: {
    marginBottom: 16,
  },
  employeeHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  employeeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  employeeAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.card,
  },
  employeeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  employeeName: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  employeeRole: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 4,
  },
  departmentBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  departmentText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.card,
    fontWeight: '500',
  },
  employeeContact: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.text,
    width: 60,
  },
  contactValue: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    flex: 1,
  },
  employeeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: Colors.border,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 110, 0.1)',
  },
  editButtonText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButtonText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.danger,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyAddButton: {
    width: 200,
  },
  addEmployeeContainer: {
    padding: 16,
  },
  addEmployeeTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  departmentContainer: {
    marginBottom: 16,
  },
  departmentLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  departmentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  departmentOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  selectedDepartment: {
    backgroundColor: Colors.primary,
  },
  departmentOptionText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  selectedDepartmentText: {
    color: Colors.card,
    fontWeight: '500',
  },
  addEmployeeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  proUpgradeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  proUpgradeTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 16,
  },
  proUpgradeText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  upgradeButton: {
    width: 200,
    backgroundColor: Colors.secondary,
  },
});