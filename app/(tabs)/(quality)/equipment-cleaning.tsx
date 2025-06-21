import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Filter, Calendar, Download } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Input from '@/components/Input';
import Button from '@/components/Button';
import useQualityStore from '@/store/quality-store';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const equipmentTypes = ['Filter', 'Tank', 'Nozzle', 'Machine', 'Other'];
const employees = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Lisa Brown', 'David Lee'];
const supervisors = ['Manager A', 'Supervisor B', 'Team Lead C'];

export default function EquipmentCleaningScreen() {
  const { equipmentCleaning, addEquipmentCleaningRecord } = useQualityStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    employeeName: '',
    equipmentType: 'Filter' as any,
    beforeProduction: false,
    afterProduction: false,
    supervisorName: '',
    remarks: '',
  });

  const handleSubmit = () => {
    if (!formData.employeeName || !formData.supervisorName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    addEquipmentCleaningRecord({
      date: formData.date,
      employeeName: formData.employeeName,
      equipmentType: formData.equipmentType,
      beforeProduction: formData.beforeProduction,
      afterProduction: formData.afterProduction,
      supervisorName: formData.supervisorName,
      remarks: formData.remarks,
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      employeeName: '',
      equipmentType: 'Filter',
      beforeProduction: false,
      afterProduction: false,
      supervisorName: '',
      remarks: '',
    });
    setShowForm(false);
    Alert.alert('Success', 'Equipment cleaning record added successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const downloadReport = async () => {
    try {
      let reportContent = `EQUIPMENT CLEANING RECORDS - ${new Date().toLocaleDateString()}

`;
      
      if (equipmentCleaning.length === 0) {
        reportContent += "No cleaning records available.\n";
      } else {
        equipmentCleaning.forEach((record, index) => {
          reportContent += `Record #${index + 1}\n`;
          reportContent += `Date: ${formatDate(record.date)}\n`;
          reportContent += `Employee: ${record.employeeName}\n`;
          reportContent += `Equipment: ${record.equipmentType}\n`;
          reportContent += `Cleaning: ${record.beforeProduction ? 'Before Production' : ''}${record.beforeProduction && record.afterProduction ? ' & ' : ''}${record.afterProduction ? 'After Production' : ''}\n`;
          reportContent += `Supervisor: ${record.supervisorName}\n`;
          if (record.remarks) reportContent += `Remarks: ${record.remarks}\n`;
          reportContent += `\n`;
        });
      }
      
      const fileName = `Equipment_Cleaning_Records_${new Date().toISOString().split('T')[0]}.txt`;
      
      if (Platform.OS === 'web') {
        // For web, create a blob and download it
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        Alert.alert('Success', 'Report downloaded successfully');
      } else {
        // For mobile, save to file system and share
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, reportContent);
        
        if (Platform.OS === 'ios') {
          await Sharing.shareAsync(fileUri);
        } else {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/plain',
            dialogTitle: 'Download Equipment Cleaning Records',
          });
        }
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      Alert.alert('Error', 'Failed to download report. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={equipmentCleaning}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
              <View style={styles.statusBadges}>
                {item.beforeProduction && (
                  <View style={[styles.statusBadge, styles.beforeBadge]}>
                    <Text style={styles.statusBadgeText}>Before</Text>
                  </View>
                )}
                {item.afterProduction && (
                  <View style={[styles.statusBadge, styles.afterBadge]}>
                    <Text style={styles.statusBadgeText}>After</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.recordDetails}>
              <Text style={styles.recordEmployee}>{item.employeeName}</Text>
              <Text style={styles.recordEquipment}>{item.equipmentType}</Text>
            </View>
            
            <Text style={styles.recordSupervisor}>Supervisor: {item.supervisorName}</Text>
            
            {item.remarks && (
              <Text style={styles.recordRemarks}>{item.remarks}</Text>
            )}
          </View>
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.dateText}>Today: {formatDate(new Date().toISOString())}</Text>
                  <Text style={styles.recordsCount}>{equipmentCleaning.length} total records</Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowForm(!showForm)}
                >
                  <Plus size={20} color="#fff" />
                  <Text style={styles.addButtonText}>Add Record</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showForm && (
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>New Cleaning Record</Text>
                
                <Input
                  label="Date"
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  placeholder="YYYY-MM-DD"
                />

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Employee Name</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                    {employees.map((employee) => (
                      <TouchableOpacity
                        key={employee}
                        style={[
                          styles.optionChip,
                          formData.employeeName === employee && styles.selectedChip
                        ]}
                        onPress={() => setFormData({ ...formData, employeeName: employee })}
                      >
                        <Text style={[
                          styles.optionText,
                          formData.employeeName === employee && styles.selectedText
                        ]}>
                          {employee}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Equipment Type</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                    {equipmentTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.optionChip,
                          formData.equipmentType === type && styles.selectedChip
                        ]}
                        onPress={() => setFormData({ ...formData, equipmentType: type as any })}
                      >
                        <Text style={[
                          styles.optionText,
                          formData.equipmentType === type && styles.selectedText
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>Cleaning Status</Text>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleButton, formData.beforeProduction && styles.activeToggle]}
                      onPress={() => setFormData({ ...formData, beforeProduction: !formData.beforeProduction })}
                    >
                      <Text style={[styles.toggleText, formData.beforeProduction && styles.activeToggleText]}>
                        Before Production
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleButton, formData.afterProduction && styles.activeToggle]}
                      onPress={() => setFormData({ ...formData, afterProduction: !formData.afterProduction })}
                    >
                      <Text style={[styles.toggleText, formData.afterProduction && styles.activeToggleText]}>
                        After Production
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Supervisor Name</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                    {supervisors.map((supervisor) => (
                      <TouchableOpacity
                        key={supervisor}
                        style={[
                          styles.optionChip,
                          formData.supervisorName === supervisor && styles.selectedChip
                        ]}
                        onPress={() => setFormData({ ...formData, supervisorName: supervisor })}
                      >
                        <Text style={[
                          styles.optionText,
                          formData.supervisorName === supervisor && styles.selectedText
                        ]}>
                          {supervisor}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Input
                  label="Remarks (Optional)"
                  value={formData.remarks}
                  onChangeText={(text) => setFormData({ ...formData, remarks: text })}
                  placeholder="Additional notes..."
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.formActions}>
                  <Button
                    title="Cancel"
                    onPress={() => setShowForm(false)}
                    variant="outline"
                    style={styles.cancelButton}
                  />
                  <Button
                    title="Save Record"
                    onPress={handleSubmit}
                    style={styles.saveButton}
                  />
                </View>
              </View>
            )}

            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Cleaning Records</Text>
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={downloadReport}
              >
                <Download size={16} color={Colors.primary} />
                <Text style={styles.downloadButtonText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Filter size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No cleaning records yet</Text>
            <Text style={styles.emptySubtext}>Add your first equipment cleaning record</Text>
          </View>
        }
        contentContainerStyle={styles.recordsList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  recordsCount: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
  },
  formContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 20,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  optionsScroll: {
    flexDirection: 'row',
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  selectedText: {
    color: '#fff',
  },
  toggleContainer: {
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  toggleText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  activeToggleText: {
    color: '#fff',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  historyTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  downloadButtonText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginTop: 4,
  },
  recordsList: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  recordCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDate: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  beforeBadge: {
    backgroundColor: '#E3F2FD',
  },
  afterBadge: {
    backgroundColor: '#E8F5E8',
  },
  statusBadgeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '500',
    color: Colors.text,
  },
  recordDetails: {
    marginBottom: 8,
  },
  recordEmployee: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  recordEquipment: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginTop: 2,
  },
  recordSupervisor: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 8,
  },
  recordRemarks: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    fontStyle: 'italic',
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 6,
  },
});