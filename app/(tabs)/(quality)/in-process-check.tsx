import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Activity, CheckCircle, XCircle, Download } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Input from '@/components/Input';
import Button from '@/components/Button';
import useQualityStore from '@/store/quality-store';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const qcOfficers = ['QC Officer A', 'QC Officer B', 'QC Officer C', 'Quality Manager'];

export default function InProcessCheckScreen() {
  const { inProcessChecks, addInProcessCheckRecord } = useQualityStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    qcOfficer: '',
    batchNumber: '',
    particles: false,
    volume: 500,
    leakages: 0, // Changed from boolean to number
    labelClarity: 'Good' as 'Good' | 'Poor',
    ph: 7.0,
    tds: 50,
    remarks: '',
  });

  const handleSubmit = () => {
    if (!formData.qcOfficer || !formData.batchNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    addInProcessCheckRecord({
      date: formData.date,
      qcOfficer: formData.qcOfficer,
      batchNumber: formData.batchNumber,
      particles: formData.particles,
      volume: formData.volume,
      leakages: formData.leakages,
      labelClarity: formData.labelClarity,
      ph: formData.ph,
      tds: formData.tds,
      remarks: formData.remarks,
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      qcOfficer: '',
      batchNumber: '',
      particles: false,
      volume: 500,
      leakages: 0,
      labelClarity: 'Good',
      ph: 7.0,
      tds: 50,
      remarks: '',
    });
    setShowForm(false);
    Alert.alert('Success', 'In-process check record added successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCheckStatus = (record: any) => {
    const issues = [
      record.particles,
      record.leakages > 0, // Changed to check if leakages is greater than 0
      record.labelClarity === 'Poor',
      record.ph < 6.5 || record.ph > 8.5,
      record.tds >= 100,
      record.volume < 500
    ].filter(Boolean).length;

    return issues === 0 ? 'Pass' : 'Issues Found';
  };

  const downloadReport = async () => {
    try {
      let reportContent = `IN-PROCESS CHECK RECORDS REPORT - ${new Date().toLocaleDateString()}\n\n`;
      
      if (inProcessChecks.length === 0) {
        reportContent += "No in-process check records available.\n";
      } else {
        inProcessChecks.forEach((record, index) => {
          const status = getCheckStatus(record);
          
          reportContent += `Record #${index + 1}\n`;
          reportContent += `Date: ${formatDate(record.date)}\n`;
          reportContent += `QC Officer: ${record.qcOfficer}\n`;
          reportContent += `Batch Number: ${record.batchNumber}\n`;
          reportContent += `Status: ${status}\n`;
          reportContent += `Particles: ${record.particles ? 'Found' : 'None'}\n`;
          reportContent += `Leakages: ${record.leakages > 0 ? `${record.leakages} found` : 'None'}\n`;
          reportContent += `Label Clarity: ${record.labelClarity}\n`;
          reportContent += `Volume: ${record.volume}ml\n`;
          reportContent += `pH: ${record.ph}\n`;
          reportContent += `TDS: ${record.tds} PPM\n`;
          if (record.remarks) reportContent += `Remarks: ${record.remarks}\n`;
          reportContent += `\n`;
        });
      }
      
      const fileName = `In_Process_Check_Report_${new Date().toISOString().split('T')[0]}.txt`;
      
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
            dialogTitle: 'Download In-Process Check Report',
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
        data={inProcessChecks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const status = getCheckStatus(item);
          return (
            <View style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
                <View style={[styles.statusBadge, status === 'Pass' ? styles.passBadge : styles.issueBadge]}>
                  <Text style={styles.statusBadgeText}>{status}</Text>
                </View>
              </View>
              
              <Text style={styles.batchNumber}>Batch: {item.batchNumber}</Text>
              <Text style={styles.officerName}>QC Officer: {item.qcOfficer}</Text>
              
              <View style={styles.checksGrid}>
                <View style={styles.checkResult}>
                  <Text style={styles.checkResultLabel}>Particles</Text>
                  <Text style={[styles.checkResultValue, { color: item.particles ? '#F44336' : '#4CAF50' }]}>
                    {item.particles ? 'Found' : 'None'}
                  </Text>
                </View>
                <View style={styles.checkResult}>
                  <Text style={styles.checkResultLabel}>Leakages</Text>
                  <Text style={[styles.checkResultValue, { color: item.leakages > 0 ? '#F44336' : '#4CAF50' }]}>
                    {item.leakages > 0 ? `${item.leakages} found` : 'None'}
                  </Text>
                </View>
                <View style={styles.checkResult}>
                  <Text style={styles.checkResultLabel}>Labels</Text>
                  <Text style={[styles.checkResultValue, { color: item.labelClarity === 'Good' ? '#4CAF50' : '#F44336' }]}>
                    {item.labelClarity}
                  </Text>
                </View>
                <View style={styles.checkResult}>
                  <Text style={styles.checkResultLabel}>Volume</Text>
                  <Text style={styles.checkResultValue}>{item.volume}ml</Text>
                </View>
                <View style={styles.checkResult}>
                  <Text style={styles.checkResultLabel}>pH</Text>
                  <Text style={styles.checkResultValue}>{item.ph}</Text>
                </View>
                <View style={styles.checkResult}>
                  <Text style={styles.checkResultLabel}>TDS</Text>
                  <Text style={styles.checkResultValue}>{item.tds} PPM</Text>
                </View>
              </View>
              
              {item.remarks && (
                <Text style={styles.recordRemarks}>{item.remarks}</Text>
              )}
            </View>
          );
        }}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.dateText}>Today: {formatDate(new Date().toISOString())}</Text>
                  <Text style={styles.recordsCount}>{inProcessChecks.length} process checks</Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowForm(!showForm)}
                >
                  <Plus size={20} color="#fff" />
                  <Text style={styles.addButtonText}>New Check</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showForm && (
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>New In-Process QC Check</Text>
                
                <Input
                  label="Date"
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  placeholder="YYYY-MM-DD"
                />

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>QC Officer</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                    {qcOfficers.map((officer) => (
                      <TouchableOpacity
                        key={officer}
                        style={[
                          styles.optionChip,
                          formData.qcOfficer === officer && styles.selectedChip
                        ]}
                        onPress={() => setFormData({ ...formData, qcOfficer: officer })}
                      >
                        <Text style={[
                          styles.optionText,
                          formData.qcOfficer === officer && styles.selectedText
                        ]}>
                          {officer}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Input
                  label="Batch Number"
                  value={formData.batchNumber}
                  onChangeText={(text) => setFormData({ ...formData, batchNumber: text })}
                  placeholder="Enter batch number"
                />

                <View style={styles.checkContainer}>
                  <Text style={styles.checkLabel}>Quality Checks</Text>
                  
                  <TouchableOpacity
                    style={[styles.checkItem, formData.particles && styles.issueItem]}
                    onPress={() => setFormData({ ...formData, particles: !formData.particles })}
                  >
                    <View style={styles.checkContent}>
                      <Text style={styles.checkText}>Particles Detected</Text>
                      <Text style={styles.checkSubtext}>Check for visible particles in water</Text>
                    </View>
                    {formData.particles ? (
                      <XCircle size={24} color="#F44336" />
                    ) : (
                      <CheckCircle size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>

                  {/* Changed from toggle to numeric input for leakages */}
                  <View style={styles.leakageContainer}>
                    <Text style={styles.inputLabel}>Leakages Found</Text>
                    <Text style={styles.inputSubtext}>Enter number of leakages detected</Text>
                    <Input
                      value={formData.leakages.toString()}
                      onChangeText={(text) => {
                        const value = parseInt(text) || 0;
                        setFormData({ ...formData, leakages: value });
                      }}
                      placeholder="0"
                      keyboardType="numeric"
                      style={formData.leakages > 0 ? styles.leakageInputError : styles.leakageInput}
                    />
                  </View>
                </View>

                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>Label Clarity</Text>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleButton, formData.labelClarity === 'Good' && styles.activeToggle]}
                      onPress={() => setFormData({ ...formData, labelClarity: 'Good' })}
                    >
                      <Text style={[styles.toggleText, formData.labelClarity === 'Good' && styles.activeToggleText]}>
                        Good
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleButton, formData.labelClarity === 'Poor' && styles.activeToggle]}
                      onPress={() => setFormData({ ...formData, labelClarity: 'Poor' })}
                    >
                      <Text style={[styles.toggleText, formData.labelClarity === 'Poor' && styles.activeToggleText]}>
                        Poor
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Input
                  label="Volume (ml)"
                  value={formData.volume.toString()}
                  onChangeText={(text) => setFormData({ ...formData, volume: parseInt(text) || 500 })}
                  placeholder="500"
                  keyboardType="numeric"
                />

                <Input
                  label="pH Level"
                  value={formData.ph.toString()}
                  onChangeText={(text) => setFormData({ ...formData, ph: parseFloat(text) || 7.0 })}
                  placeholder="7.0"
                  keyboardType="numeric"
                />

                <Input
                  label="TDS (PPM)"
                  value={formData.tds.toString()}
                  onChangeText={(text) => setFormData({ ...formData, tds: parseInt(text) || 50 })}
                  placeholder="50"
                  keyboardType="numeric"
                />

                <Input
                  label="Remarks (Optional)"
                  value={formData.remarks}
                  onChangeText={(text) => setFormData({ ...formData, remarks: text })}
                  placeholder="Additional observations..."
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
                    title="Submit Check"
                    onPress={handleSubmit}
                    style={styles.saveButton}
                  />
                </View>
              </View>
            )}

            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Process Check History</Text>
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
            <Activity size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No process checks yet</Text>
            <Text style={styles.emptySubtext}>Add your first in-process quality check</Text>
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
  checkContainer: {
    marginBottom: 16,
  },
  checkLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  issueItem: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  checkContent: {
    flex: 1,
  },
  checkText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '500',
    color: Colors.text,
  },
  checkSubtext: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginTop: 2,
  },
  // New styles for leakage input
  leakageContainer: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: Fonts.sizes.md,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  inputSubtext: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 8,
  },
  leakageInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  leakageInputError: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 8,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  passBadge: {
    backgroundColor: '#E8F5E8',
  },
  issueBadge: {
    backgroundColor: '#FFF3E0',
  },
  statusBadgeText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  batchNumber: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  officerName: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 12,
  },
  checksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  checkResult: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 6,
  },
  checkResultLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginBottom: 2,
  },
  checkResultValue: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
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