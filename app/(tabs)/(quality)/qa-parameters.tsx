import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TestTube, CheckCircle, XCircle, Download } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import Input from '@/components/Input';
import Button from '@/components/Button';
import useQualityStore from '@/store/quality-store';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function QAParametersScreen() {
  const { qaParameters, addQAParametersRecord } = useQualityStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    batchNumber: '',
    ph: { value: 0, result: 'Pass' as 'Pass' | 'Fail' },
    tds: { value: 0, result: 'Pass' as 'Pass' | 'Fail' },
    appearance: 'Clear' as 'Clear' | 'Cloudy',
    taste: 'Tasteless' as 'Tasteless' | 'Bad Taste',
    odour: 'None' as 'None' | 'Unpleasant',
    labeling: 'Good' as 'Good' | 'Poor',
    volume: 500,
    mfdBatch: '',
    remarks: '',
  });

  const handleSubmit = () => {
    if (!formData.batchNumber || !formData.mfdBatch) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Auto-calculate overall result
    const overallResult = (
      formData.ph.result === 'Pass' &&
      formData.tds.result === 'Pass' &&
      formData.appearance === 'Clear' &&
      formData.taste === 'Tasteless' &&
      formData.odour === 'None' &&
      formData.labeling === 'Good' &&
      formData.volume >= 500
    ) ? 'Pass' : 'Fail';

    addQAParametersRecord({
      date: formData.date,
      batchNumber: formData.batchNumber,
      ph: formData.ph,
      tds: formData.tds,
      appearance: formData.appearance,
      taste: formData.taste,
      odour: formData.odour,
      labeling: formData.labeling,
      volume: formData.volume,
      mfdBatch: formData.mfdBatch,
      overallResult,
      remarks: formData.remarks,
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      batchNumber: '',
      ph: { value: 0, result: 'Pass' },
      tds: { value: 0, result: 'Pass' },
      appearance: 'Clear',
      taste: 'Tasteless',
      odour: 'None',
      labeling: 'Good',
      volume: 500,
      mfdBatch: '',
      remarks: '',
    });
    setShowForm(false);
    Alert.alert('Success', 'QA parameters record added successfully');
  };

  const updatePHResult = (value: number) => {
    const result = (value >= 6.5 && value <= 8.5) ? 'Pass' : 'Fail';
    setFormData({
      ...formData,
      ph: { value, result }
    });
  };

  const updateTDSResult = (value: number) => {
    const result = value < 100 ? 'Pass' : 'Fail';
    setFormData({
      ...formData,
      tds: { value, result }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const downloadReport = async () => {
    try {
      let reportContent = `QUALITY ASSURANCE PARAMETERS REPORT - ${new Date().toLocaleDateString()}\n\n`;
      
      if (qaParameters.length === 0) {
        reportContent += "No QA parameter records available.\n";
      } else {
        qaParameters.forEach((record, index) => {
          reportContent += `Record #${index + 1}\n`;
          reportContent += `Date: ${formatDate(record.date)}\n`;
          reportContent += `Batch Number: ${record.batchNumber}\n`;
          reportContent += `pH: ${record.ph.value} (${record.ph.result})\n`;
          reportContent += `TDS: ${record.tds.value} PPM (${record.tds.result})\n`;
          reportContent += `Appearance: ${record.appearance}\n`;
          reportContent += `Taste: ${record.taste}\n`;
          reportContent += `Odour: ${record.odour}\n`;
          reportContent += `Labeling: ${record.labeling}\n`;
          reportContent += `Volume: ${record.volume}ml\n`;
          reportContent += `MFD/Batch: ${record.mfdBatch}\n`;
          reportContent += `Overall Result: ${record.overallResult}\n`;
          if (record.remarks) reportContent += `Remarks: ${record.remarks}\n`;
          reportContent += `\n`;
        });
      }
      
      const fileName = `QA_Parameters_Report_${new Date().toISOString().split('T')[0]}.txt`;
      
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
            dialogTitle: 'Download QA Parameters Report',
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
        data={qaParameters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
              <View style={[styles.resultBadge, item.overallResult === 'Pass' ? styles.passBadge : styles.failBadge]}>
                <Text style={styles.resultBadgeText}>{item.overallResult}</Text>
              </View>
            </View>
            
            <Text style={styles.batchNumber}>Batch: {item.batchNumber}</Text>
            
            <View style={styles.parametersGrid}>
              <View style={styles.parameterItem}>
                <Text style={styles.parameterLabel}>pH</Text>
                <Text style={styles.parameterValue}>{item.ph.value}</Text>
              </View>
              <View style={styles.parameterItem}>
                <Text style={styles.parameterLabel}>TDS</Text>
                <Text style={styles.parameterValue}>{item.tds.value} PPM</Text>
              </View>
              <View style={styles.parameterItem}>
                <Text style={styles.parameterLabel}>Appearance</Text>
                <Text style={styles.parameterValue}>{item.appearance}</Text>
              </View>
              <View style={styles.parameterItem}>
                <Text style={styles.parameterLabel}>Volume</Text>
                <Text style={styles.parameterValue}>{item.volume}ml</Text>
              </View>
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
                  <Text style={styles.recordsCount}>{qaParameters.length} QA reports</Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowForm(!showForm)}
                >
                  <Plus size={20} color="#fff" />
                  <Text style={styles.addButtonText}>New Report</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showForm && (
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>New QA Parameters Report</Text>
                
                <Input
                  label="Date"
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  placeholder="YYYY-MM-DD"
                />

                <Input
                  label="Batch Number"
                  value={formData.batchNumber}
                  onChangeText={(text) => setFormData({ ...formData, batchNumber: text })}
                  placeholder="Enter batch number"
                />

                <View style={styles.parameterCard}>
                  <Text style={styles.parameterTitle}>pH Level (6.5 - 8.5)</Text>
                  <Input
                    value={formData.ph.value.toString()}
                    onChangeText={(text) => updatePHResult(parseFloat(text) || 0)}
                    placeholder="Enter pH value"
                    keyboardType="numeric"
                  />
                  <View style={styles.resultIndicator}>
                    {formData.ph.result === 'Pass' ? (
                      <CheckCircle size={20} color="#4CAF50" />
                    ) : (
                      <XCircle size={20} color="#F44336" />
                    )}
                    <Text style={[styles.resultText, { color: formData.ph.result === 'Pass' ? '#4CAF50' : '#F44336' }]}>
                      {formData.ph.result}
                    </Text>
                  </View>
                </View>

                <View style={styles.parameterCard}>
                  <Text style={styles.parameterTitle}>TDS (&lt;100 PPM)</Text>
                  <Input
                    value={formData.tds.value.toString()}
                    onChangeText={(text) => updateTDSResult(parseFloat(text) || 0)}
                    placeholder="Enter TDS value"
                    keyboardType="numeric"
                  />
                  <View style={styles.resultIndicator}>
                    {formData.tds.result === 'Pass' ? (
                      <CheckCircle size={20} color="#4CAF50" />
                    ) : (
                      <XCircle size={20} color="#F44336" />
                    )}
                    <Text style={[styles.resultText, { color: formData.tds.result === 'Pass' ? '#4CAF50' : '#F44336' }]}>
                      {formData.tds.result}
                    </Text>
                  </View>
                </View>

                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>Appearance</Text>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleButton, formData.appearance === 'Clear' && styles.activeToggle]}
                      onPress={() => setFormData({ ...formData, appearance: 'Clear' })}
                    >
                      <Text style={[styles.toggleText, formData.appearance === 'Clear' && styles.activeToggleText]}>
                        Clear
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleButton, formData.appearance === 'Cloudy' && styles.activeToggle]}
                      onPress={() => setFormData({ ...formData, appearance: 'Cloudy' })}
                    >
                      <Text style={[styles.toggleText, formData.appearance === 'Cloudy' && styles.activeToggleText]}>
                        Cloudy
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>Taste</Text>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleButton, formData.taste === 'Tasteless' && styles.activeToggle]}
                      onPress={() => setFormData({ ...formData, taste: 'Tasteless' })}
                    >
                      <Text style={[styles.toggleText, formData.taste === 'Tasteless' && styles.activeToggleText]}>
                        Tasteless
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleButton, formData.taste === 'Bad Taste' && styles.activeToggle]}
                      onPress={() => setFormData({ ...formData, taste: 'Bad Taste' })}
                    >
                      <Text style={[styles.toggleText, formData.taste === 'Bad Taste' && styles.activeToggleText]}>
                        Bad Taste
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>Odour</Text>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleButton, formData.odour === 'None' && styles.activeToggle]}
                      onPress={() => setFormData({ ...formData, odour: 'None' })}
                    >
                      <Text style={[styles.toggleText, formData.odour === 'None' && styles.activeToggleText]}>
                        None
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleButton, formData.odour === 'Unpleasant' && styles.activeToggle]}
                      onPress={() => setFormData({ ...formData, odour: 'Unpleasant' })}
                    >
                      <Text style={[styles.toggleText, formData.odour === 'Unpleasant' && styles.activeToggleText]}>
                        Unpleasant
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>Labeling</Text>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleButton, formData.labeling === 'Good' && styles.activeToggle]}
                      onPress={() => setFormData({ ...formData, labeling: 'Good' })}
                    >
                      <Text style={[styles.toggleText, formData.labeling === 'Good' && styles.activeToggleText]}>
                        Good
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleButton, formData.labeling === 'Poor' && styles.activeToggle]}
                      onPress={() => setFormData({ ...formData, labeling: 'Poor' })}
                    >
                      <Text style={[styles.toggleText, formData.labeling === 'Poor' && styles.activeToggleText]}>
                        Poor
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Input
                  label="Volume (ml) - Min: 500ml"
                  value={formData.volume.toString()}
                  onChangeText={(text) => setFormData({ ...formData, volume: parseInt(text) || 500 })}
                  placeholder="500"
                  keyboardType="numeric"
                />

                <Input
                  label="MFD/Batch Information"
                  value={formData.mfdBatch}
                  onChangeText={(text) => setFormData({ ...formData, mfdBatch: text })}
                  placeholder="Manufacturing date and batch info"
                />

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
                    title="Save Report"
                    onPress={handleSubmit}
                    style={styles.saveButton}
                  />
                </View>
              </View>
            )}

            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>QA Reports</Text>
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
            <TestTube size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No QA reports yet</Text>
            <Text style={styles.emptySubtext}>Add your first quality assurance report</Text>
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
  parameterCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  parameterTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  resultIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  resultText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
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
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  passBadge: {
    backgroundColor: '#E8F5E8',
  },
  failBadge: {
    backgroundColor: '#FFEBEE',
  },
  resultBadgeText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  batchNumber: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  parametersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  parameterItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 6,
  },
  parameterLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginBottom: 2,
  },
  parameterValue: {
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