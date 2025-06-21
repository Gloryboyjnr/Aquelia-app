import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Users, CheckCircle, XCircle, Download } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Input from '@/components/Input';
import Button from '@/components/Button';
import useQualityStore from '@/store/quality-store';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const employees = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Lisa Brown', 'David Lee'];
const supervisors = ['Manager A', 'Supervisor B', 'Team Lead C'];
const healthStatuses = ['Healthy', 'Minor Issues', 'Sick (Not Working)'];

export default function AttendanceScreen() {
  const { attendance, addAttendanceRecord } = useQualityStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    employeeName: '',
    healthStatus: 'Healthy' as 'Healthy' | 'Minor Issues' | 'Sick (Not Working)',
    hygieneCheck: true,
    supervisorName: '',
    remarks: '',
  });

  const handleSubmit = () => {
    if (!formData.employeeName || !formData.supervisorName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    addAttendanceRecord({
      date: formData.date,
      employeeName: formData.employeeName,
      appearance: 'Neat', // Default value
      timeIn: new Date().toTimeString().split(' ')[0],
      supervisor: formData.supervisorName,
      hygieneStatus: formData.hygieneCheck ? 'Passed' : 'Failed',
      healthStatus: formData.healthStatus,
      hygieneCheck: formData.hygieneCheck,
      supervisorName: formData.supervisorName,
      remarks: formData.remarks,
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      employeeName: '',
      healthStatus: 'Healthy',
      hygieneCheck: true,
      supervisorName: '',
      remarks: '',
    });
    setShowForm(false);
    Alert.alert('Success', 'Attendance record added successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const downloadReport = async () => {
    try {
      let reportContent = `ATTENDANCE & SANITATION RECORDS REPORT - ${new Date().toLocaleDateString()}

`;
      
      if (attendance.length === 0) {
        reportContent += "No attendance records available.\n";
      } else {
        attendance.forEach((record, index) => {
          reportContent += `Record #${index + 1}\n`;
          reportContent += `Date: ${formatDate(record.date)}\n`;
          reportContent += `Employee: ${record.employeeName}\n`;
          reportContent += `Health Status: ${record.healthStatus}\n`;
          reportContent += `Hygiene Check: ${record.hygieneCheck ? 'Passed' : 'Failed'}\n`;
          reportContent += `Supervisor: ${record.supervisorName}\n`;
          if (record.remarks) reportContent += `Remarks: ${record.remarks}\n`;
          reportContent += `\n`;
        });
      }
      
      const fileName = `Attendance_Sanitation_Report_${new Date().toISOString().split('T')[0]}.txt`;
      
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
            dialogTitle: 'Download Attendance & Sanitation Report',
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
        data={attendance}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
              <View style={[
                styles.statusBadge, 
                item.healthStatus === 'Healthy' ? styles.healthyBadge : 
                item.healthStatus === 'Minor Issues' ? styles.minorBadge : 
                styles.sickBadge
              ]}>
                <Text style={styles.statusBadgeText}>{item.healthStatus}</Text>
              </View>
            </View>
            
            <Text style={styles.employeeName}>{item.employeeName}</Text>
            
            <View style={styles.recordDetails}>
              <View style={styles.hygieneStatus}>
                <Text style={styles.hygieneLabel}>Hygiene Check:</Text>
                <View style={[
                  styles.hygieneIndicator, 
                  item.hygieneCheck ? styles.passedHygiene : styles.failedHygiene
                ]}>
                  <Text style={styles.hygieneText}>
                    {item.hygieneCheck ? 'Passed' : 'Failed'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.supervisorName}>Supervisor: {item.supervisorName}</Text>
            </View>
            
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
                  <Text style={styles.recordsCount}>{attendance.length} attendance records</Text>
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
                <Text style={styles.formTitle}>New Attendance Record</Text>
                
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
                  <Text style={styles.pickerLabel}>Health Status</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                    {healthStatuses.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.optionChip,
                          formData.healthStatus === status && styles.selectedChip,
                          status === 'Healthy' ? styles.healthyOption : 
                          status === 'Minor Issues' ? styles.minorOption : 
                          styles.sickOption
                        ]}
                        onPress={() => setFormData({ ...formData, healthStatus: status as any })}
                      >
                        <Text style={[
                          styles.optionText,
                          formData.healthStatus === status && styles.selectedText
                        ]}>
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.hygieneContainer}>
                  <Text style={styles.hygieneCheckLabel}>Hygiene Check</Text>
                  <View style={styles.hygieneButtons}>
                    <TouchableOpacity
                      style={[
                        styles.hygieneButton,
                        formData.hygieneCheck && styles.activeHygieneButton
                      ]}
                      onPress={() => setFormData({ ...formData, hygieneCheck: true })}
                    >
                      <CheckCircle size={20} color={formData.hygieneCheck ? '#fff' : '#4CAF50'} />
                      <Text style={[
                        styles.hygieneButtonText,
                        formData.hygieneCheck && styles.activeHygieneButtonText
                      ]}>
                        Passed
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.hygieneButton,
                        !formData.hygieneCheck && styles.failedHygieneButton
                      ]}
                      onPress={() => setFormData({ ...formData, hygieneCheck: false })}
                    >
                      <XCircle size={20} color={!formData.hygieneCheck ? '#fff' : '#F44336'} />
                      <Text style={[
                        styles.hygieneButtonText,
                        !formData.hygieneCheck && styles.failedHygieneButtonText
                      ]}>
                        Failed
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
              <Text style={styles.historyTitle}>Attendance Records</Text>
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
            <Users size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No attendance records yet</Text>
            <Text style={styles.emptySubtext}>Add your first attendance & sanitation record</Text>
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
  healthyOption: {
    borderColor: '#4CAF50',
  },
  minorOption: {
    borderColor: '#FF9800',
  },
  sickOption: {
    borderColor: '#F44336',
  },
  optionText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  selectedText: {
    color: '#fff',
  },
  hygieneContainer: {
    marginBottom: 16,
  },
  hygieneCheckLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  hygieneButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  hygieneButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeHygieneButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  failedHygieneButton: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  hygieneButtonText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  activeHygieneButtonText: {
    color: '#fff',
  },
  failedHygieneButtonText: {
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  healthyBadge: {
    backgroundColor: '#E8F5E8',
  },
  minorBadge: {
    backgroundColor: '#FFF3E0',
  },
  sickBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusBadgeText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  employeeName: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  recordDetails: {
    gap: 8,
    marginBottom: 12,
  },
  hygieneStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hygieneLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  hygieneIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  passedHygiene: {
    backgroundColor: '#E8F5E8',
  },
  failedHygiene: {
    backgroundColor: '#FFEBEE',
  },
  hygieneText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.text,
  },
  supervisorName: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
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