import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, FlatList } from 'react-native';
import { Package, TrendingUp, Boxes, Factory, CheckCircle, Plus, X, Users, ChevronRight, Trash2 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import DashboardCard from '@/components/DashboardCard';
import ScreenContainer from '@/components/ScreenContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import useSalesStore from '@/store/sales-store';
import useProductionStore from '@/store/production-store';
import useInventoryStore from '@/store/inventory-store';
import useAuthStore from '@/store/auth-store';

export default function DashboardScreen() {
  const router = useRouter();
  const { getTodaySupplierSales, getTodayFactorySales } = useSalesStore();
  const { getTodayProduction, getBagsInStock } = useProductionStore();
  const { rolls, packingBags } = useInventoryStore();
  const { 
    employees, 
    addEmployee, 
    removeEmployee,
    getEmployeesByDepartment 
  } = useAuthStore();
  
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showEmployeeListModal, setShowEmployeeListModal] = useState(false);
  const [useCustomRole, setUseCustomRole] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    role: 'operator' as const,
    customRole: '',
    department: 'production' as const,
    isActive: true,
  });

  // State for dashboard data
  const [supplierSales, setSupplierSales] = useState(getTodaySupplierSales());
  const [factorySales, setFactorySales] = useState(getTodayFactorySales());
  const [todayProduction, setTodayProduction] = useState(getTodayProduction());
  const [bagsInStock, setBagsInStock] = useState(getBagsInStock());
  
  // Refresh data periodically
  useEffect(() => {
    const updateData = () => {
      setSupplierSales(getTodaySupplierSales());
      setFactorySales(getTodayFactorySales());
      setTodayProduction(getTodayProduction());
      setBagsInStock(getBagsInStock());
    };

    // Initial update
    updateData();

    // Set up an interval to update data every 2 seconds
    const intervalId = setInterval(updateData, 2000);

    return () => clearInterval(intervalId);
  }, [getTodaySupplierSales, getTodayFactorySales, getTodayProduction, getBagsInStock]);
  
  const totalSales = supplierSales.bags + factorySales.bags;
  const totalRevenue = supplierSales.revenue + factorySales.revenue;

  // Calculate today's quality checks
  const todayChecks = getEmployeesByDepartment('quality').length * 3; // Demo calculation

  const handleAddEmployee = () => {
    if (!newEmployee.fullName.trim() || !newEmployee.phoneNumber.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const finalRole = useCustomRole && newEmployee.customRole.trim() 
      ? newEmployee.customRole.trim().toLowerCase() 
      : newEmployee.role;

    addEmployee({
      ...newEmployee,
      role: finalRole as any,
    });
    
    setNewEmployee({
      fullName: '',
      phoneNumber: '',
      email: '',
      role: 'operator',
      customRole: '',
      department: 'production',
      isActive: true,
    });
    setUseCustomRole(false);
    setShowEmployeeModal(false);
    Alert.alert('Success', 'Employee added successfully');
  };

  const handleRemoveEmployee = (employeeId: string, employeeName: string) => {
    Alert.alert(
      'Remove Employee',
      `Are you sure you want to remove ${employeeName} from the system? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeEmployee(employeeId);
            Alert.alert('Success', `${employeeName} has been removed from the system`);
          },
        },
      ]
    );
  };

  const formatRoleAndDepartment = (role?: string, department?: string) => {
    const formattedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown Role';
    const formattedDepartment = department ? department.charAt(0).toUpperCase() + department.slice(1) : 'Unknown Department';
    return `${formattedRole} • ${formattedDepartment}`;
  };

  const renderEmployeeModal = () => (
    <Modal
      visible={showEmployeeModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowEmployeeModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add New Employee</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowEmployeeModal(false)}
          >
            <X size={24} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Input
            label="Full Name *"
            value={newEmployee.fullName}
            onChangeText={(text) => setNewEmployee(prev => ({ ...prev, fullName: text }))}
            placeholder="Enter employee full name"
          />

          <Input
            label="Phone Number *"
            value={newEmployee.phoneNumber}
            onChangeText={(text) => setNewEmployee(prev => ({ ...prev, phoneNumber: text }))}
            placeholder="+233 XX XXX XXXX"
            keyboardType="phone-pad"
          />

          <Input
            label="Email (Optional)"
            value={newEmployee.email}
            onChangeText={(text) => setNewEmployee(prev => ({ ...prev, email: text }))}
            placeholder="employee@company.com"
            keyboardType="email-address"
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Role *</Text>
            
            <View style={styles.roleToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleToggle,
                  !useCustomRole && styles.roleToggleActive
                ]}
                onPress={() => setUseCustomRole(false)}
              >
                <Text style={[
                  styles.roleToggleText,
                  !useCustomRole && styles.roleToggleTextActive
                ]}>
                  Predefined
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleToggle,
                  useCustomRole && styles.roleToggleActive
                ]}
                onPress={() => setUseCustomRole(true)}
              >
                <Text style={[
                  styles.roleToggleText,
                  useCustomRole && styles.roleToggleTextActive
                ]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            {useCustomRole ? (
              <Input
                value={newEmployee.customRole}
                onChangeText={(text) => setNewEmployee(prev => ({ ...prev, customRole: text }))}
                placeholder="Enter custom role"
                containerStyle={styles.customRoleInput}
              />
            ) : (
              <View style={styles.pickerOptions}>
                {['manager', 'operator', 'producer', 'supplier', 'Quality Control Officer', 'supervisor'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.pickerOption,
                      newEmployee.role === role && styles.pickerOptionSelected
                    ]}
                    onPress={() => setNewEmployee(prev => ({ ...prev, role: role as any }))}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      newEmployee.role === role && styles.pickerOptionTextSelected
                    ]}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Department *</Text>
            <View style={styles.pickerOptions}>
              {['production', 'quality', 'inventory', 'management', 'sales'].map((dept) => (
                <TouchableOpacity
                  key={dept}
                  style={[
                    styles.pickerOption,
                    newEmployee.department === dept && styles.pickerOptionSelected
                  ]}
                  onPress={() => setNewEmployee(prev => ({ ...prev, department: dept as any }))}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    newEmployee.department === dept && styles.pickerOptionTextSelected
                  ]}>
                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={() => setShowEmployeeModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Add Employee"
              onPress={handleAddEmployee}
              style={styles.modalButton}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderEmployeeListModal = () => (
    <Modal
      visible={showEmployeeListModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowEmployeeListModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Active Employees</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowEmployeeListModal(false)}
          >
            <X size={24} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={employees.filter(e => e.isActive)}
          keyExtractor={(item) => item.id}
          style={styles.employeeList}
          contentContainerStyle={styles.employeeListContent}
          renderItem={({ item }) => (
            <View style={styles.employeeItem}>
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>{item.fullName}</Text>
                <Text style={styles.employeeDetails}>
                  {formatRoleAndDepartment(item.role, item.department)}
                </Text>
                <Text style={styles.employeePhone}>{item.phoneNumber}</Text>
              </View>
              <View style={styles.employeeActions}>
                <View style={styles.activeIndicator} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveEmployee(item.id, item.fullName)}
                >
                  <Trash2 size={16} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Modal>
  );

  return (
    <ScreenContainer>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Command Center</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowEmployeeModal(true)}
          >
            <Plus size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => setShowEmployeeListModal(true)}
          >
            <Users size={20} color={Colors.primary} />
            <Text style={styles.statValue}>{employees.filter(e => e.isActive).length}</Text>
            <Text style={styles.statLabel}>Active Employees</Text>
            <ChevronRight size={16} color={Colors.textLight} style={styles.statChevron} />
          </TouchableOpacity>
          
          <View style={styles.statCard}>
            <TrendingUp size={20} color={Colors.success} />
            <Text style={styles.statValue}>GHS {totalRevenue.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Today's Revenue</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/(tabs)/(production)/manage-bags')}
          >
            <Package size={20} color={Colors.accent} />
            <Text style={styles.statValue}>{bagsInStock.total}</Text>
            <Text style={styles.statLabel}>Bags in Stock</Text>
            <ChevronRight size={16} color={Colors.textLight} style={styles.statChevron} />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {/* Inventory Available */}
          <TouchableOpacity onPress={() => router.push('/(tabs)/(inventory)')}>
            <DashboardCard
              title="Inventory Available"
              value="Raw Materials"
              subtitle={`${rolls.total}kg rolls • ${packingBags.total} packing bags • ${rolls.estimatedBags} estimated bags`}
              icon={<Boxes size={18} color={Colors.primary} />}
              style={styles.card}
              rightIcon={<ChevronRight size={20} color={Colors.textLight} />}
            />
          </TouchableOpacity>

          {/* Production */}
          <TouchableOpacity onPress={() => router.push('/(tabs)/(production)')}>
            <DashboardCard
              title="Production"
              value={`${todayProduction.bags} bags`}
              subtitle={`${todayProduction.bundles} bundles produced today`}
              icon={<Factory size={18} color={Colors.secondary} />}
              style={styles.card}
              rightIcon={<ChevronRight size={20} color={Colors.textLight} />}
            />
          </TouchableOpacity>

          {/* Sales Summary */}
          <TouchableOpacity onPress={() => router.push('/(tabs)/(sales)')}>
            <DashboardCard
              title="Sales Summary"
              value={`${totalSales} bags`}
              subtitle={`GHS ${totalRevenue.toFixed(2)} revenue • ${supplierSales.trips + factorySales.transactions} transactions`}
              icon={<TrendingUp size={18} color={Colors.success} />}
              valueColor={Colors.text}
              style={styles.card}
              rightIcon={<ChevronRight size={20} color={Colors.textLight} />}
            />
          </TouchableOpacity>

          {/* FDA Quality Control */}
          <TouchableOpacity onPress={() => router.push('/(tabs)/(quality)')}>
            <DashboardCard
              title="FDA Quality Control"
              value={`${todayChecks} checks`}
              subtitle="Quality assurance completed today"
              icon={<CheckCircle size={18} color={Colors.primary} />}
              style={styles.card}
              rightIcon={<ChevronRight size={20} color={Colors.textLight} />}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderEmployeeModal()}
      {renderEmployeeListModal()}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    fontWeight: '500',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  statValue: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    textAlign: 'center',
  },
  statChevron: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  grid: {
    gap: 12,
  },
  card: {
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  roleToggle: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  roleToggleActive: {
    backgroundColor: Colors.primary,
  },
  roleToggleText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.textLight,
  },
  roleToggleTextActive: {
    color: '#fff',
  },
  customRoleInput: {
    marginTop: 8,
  },
  pickerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerOptionText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  modalButton: {
    flex: 1,
  },
  employeeList: {
    flex: 1,
  },
  employeeListContent: {
    padding: 20,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  employeeDetails: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 2,
  },
  employeePhone: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  employeeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.danger + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
});