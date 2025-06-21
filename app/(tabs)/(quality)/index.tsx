import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ClipboardCheck, TestTube, Activity, Users, Download } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import useQualityStore from '@/store/quality-store';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const qualityModules = [
  {
    id: 'equipment-cleaning',
    title: 'Equipment Cleaning Records',
    description: 'Track cleaning schedules and maintenance logs',
    icon: ClipboardCheck,
    route: '/(tabs)/(quality)/equipment-cleaning',
    color: '#E3F2FD',
    iconColor: '#1976D2',
  },
  {
    id: 'qa-parameters',
    title: 'Quality Assurance Unit',
    description: 'Monitor pH, TDS, and quality parameters',
    icon: TestTube,
    route: '/(tabs)/(quality)/qa-parameters',
    color: '#E8F5E8',
    iconColor: '#388E3C',
  },
  {
    id: 'in-process-check',
    title: 'In-Process Check Records',
    description: 'Real-time quality control monitoring',
    icon: Activity,
    route: '/(tabs)/(quality)/in-process-check',
    color: '#FFF3E0',
    iconColor: '#F57C00',
  },
  {
    id: 'attendance',
    title: 'Attendance & Sanitation',
    description: 'Employee hygiene and attendance tracking',
    icon: Users,
    route: '/(tabs)/(quality)/attendance',
    color: '#F3E5F5',
    iconColor: '#7B1FA2',
  },
];

interface DashboardItem {
  id: string;
  type: 'modules' | 'download';
}

export default function QualityScreen() {
  const { equipmentCleaning, qaParameters, inProcessChecks, attendance } = useQualityStore();

  const getModuleStats = (moduleId: string) => {
    const today = new Date().toDateString();
    
    switch (moduleId) {
      case 'equipment-cleaning':
        return equipmentCleaning.filter(record => 
          new Date(record.date).toDateString() === today
        ).length;
      case 'qa-parameters':
        return qaParameters.filter(record => 
          new Date(record.date).toDateString() === today
        ).length;
      case 'in-process-check':
        return inProcessChecks.filter(record => 
          new Date(record.date).toDateString() === today
        ).length;
      case 'attendance':
        return attendance.filter(record => 
          new Date(record.date).toDateString() === today
        ).length;
      default:
        return 0;
    }
  };

  const handleModulePress = (route: string) => {
    router.push(route as any);
  };

  const generateReportData = () => {
    const today = new Date().toLocaleDateString();
    
    let reportContent = `FDA QUALITY CONTROL REPORT - ${today}\n\n`;
    
    // Equipment Cleaning
    reportContent += `EQUIPMENT CLEANING RECORDS (${equipmentCleaning.length} total records)\n`;
    reportContent += "--------------------------------------------------\n";
    equipmentCleaning.forEach((record, index) => {
      reportContent += `Record #${index + 1} - Date: ${new Date(record.date).toLocaleDateString()}\n`;
      reportContent += `Employee: ${record.employeeName}\n`;
      reportContent += `Equipment: ${record.equipmentType}\n`;
      reportContent += `Cleaning: ${record.beforeProduction ? "Before Production" : ""}${record.beforeProduction && record.afterProduction ? " & " : ""}${record.afterProduction ? "After Production" : ""}\n`;
      reportContent += `Supervisor: ${record.supervisorName}\n`;
      if (record.remarks) {
        reportContent += `Remarks: ${record.remarks}\n`;
      }
      reportContent += "\n";
    });
    
    // QA Parameters
    reportContent += `\nQUALITY ASSURANCE PARAMETERS (${qaParameters.length} total records)\n`;
    reportContent += "--------------------------------------------------\n";
    qaParameters.forEach((record, index) => {
      reportContent += `Record #${index + 1} - Date: ${new Date(record.date).toLocaleDateString()}\n`;
      reportContent += `Batch: ${record.batchNumber}\n`;
      reportContent += `pH: ${record.ph.value} (${record.ph.result})\n`;
      reportContent += `TDS: ${record.tds.value} PPM (${record.tds.result})\n`;
      reportContent += `Appearance: ${record.appearance}\n`;
      reportContent += `Taste: ${record.taste}\n`;
      reportContent += `Odour: ${record.odour}\n`;
      reportContent += `Labeling: ${record.labeling}\n`;
      reportContent += `Volume: ${record.volume}ml\n`;
      reportContent += `Overall Result: ${record.overallResult}\n`;
      if (record.remarks) {
        reportContent += `Remarks: ${record.remarks}\n`;
      }
      reportContent += "\n";
    });
    
    // In-Process Checks
    reportContent += `\nIN-PROCESS CHECK RECORDS (${inProcessChecks.length} total records)\n`;
    reportContent += "--------------------------------------------------\n";
    inProcessChecks.forEach((record, index) => {
      reportContent += `Record #${index + 1} - Date: ${new Date(record.date).toLocaleDateString()}\n`;
      reportContent += `QC Officer: ${record.qcOfficer}\n`;
      reportContent += `Batch: ${record.batchNumber}\n`;
      reportContent += `Particles: ${record.particles ? "Found" : "None"}\n`;
      reportContent += `Leakages: ${record.leakages}\n`;
      reportContent += `Label Clarity: ${record.labelClarity}\n`;
      reportContent += `Volume: ${record.volume}ml\n`;
      reportContent += `pH: ${record.ph}\n`;
      reportContent += `TDS: ${record.tds} PPM\n`;
      if (record.remarks) {
        reportContent += `Remarks: ${record.remarks}\n`;
      }
      reportContent += "\n";
    });
    
    // Attendance
    reportContent += `\nATTENDANCE & SANITATION RECORDS (${attendance.length} total records)\n`;
    reportContent += "--------------------------------------------------\n";
    attendance.forEach((record, index) => {
      reportContent += `Record #${index + 1} - Date: ${new Date(record.date).toLocaleDateString()}\n`;
      reportContent += `Employee: ${record.employeeName}\n`;
      reportContent += `Health Status: ${record.healthStatus}\n`;
      reportContent += `Hygiene Check: ${record.hygieneCheck ? "Passed" : "Failed"}\n`;
      reportContent += `Supervisor: ${record.supervisorName}\n`;
      if (record.remarks) {
        reportContent += `Remarks: ${record.remarks}\n`;
      }
      reportContent += "\n";
    });
    
    return reportContent;
  };

  const downloadReport = async () => {
    try {
      const reportData = generateReportData();
      const fileName = `FDA_Quality_Report_${new Date().toISOString().split('T')[0]}.txt`;
      
      if (Platform.OS === 'web') {
        // For web, create a blob and download it
        const blob = new Blob([reportData], { type: 'text/plain' });
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
        await FileSystem.writeAsStringAsync(fileUri, reportData);
        
        if (Platform.OS === 'ios') {
          await Sharing.shareAsync(fileUri);
        } else {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/plain',
            dialogTitle: 'Download FDA Quality Report',
          });
        }
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      Alert.alert('Error', 'Failed to download report. Please try again.');
    }
  };

  const renderItem = ({ item }: { item: DashboardItem }) => {
    if (item.type === 'modules') {
      return (
        <View style={styles.modulesContainer}>
          {qualityModules.map((module) => {
            const IconComponent = module.icon;
            const todayCount = getModuleStats(module.id);

            return (
              <TouchableOpacity
                key={module.id}
                style={[styles.moduleCard, { backgroundColor: module.color }]}
                onPress={() => handleModulePress(module.route)}
                activeOpacity={0.7}
              >
                <View style={styles.moduleHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: module.iconColor + '20' }]}>
                    <IconComponent size={24} color={module.iconColor} />
                  </View>
                  {todayCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{todayCount}</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>{module.description}</Text>
                
                <View style={styles.moduleFooter}>
                  <Text style={[styles.todayText, { color: module.iconColor }]}>
                    {todayCount} records today
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (item.type === 'download') {
      return (
        <View style={styles.downloadSection}>
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={downloadReport}
          >
            <Download size={20} color="#fff" />
            <Text style={styles.downloadButtonText}>Download FDA Reports</Text>
          </TouchableOpacity>
          <Text style={styles.downloadHint}>
            Download all quality records in a format suitable for FDA inspections
          </Text>
        </View>
      );
    }

    return null;
  };

  const data: DashboardItem[] = [
    { id: 'modules', type: 'modules' },
    { id: 'download', type: 'download' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>FDA Quality Control</Text>
            <Text style={styles.subtitle}>
              Ensure compliance with FDA regulations and maintain quality standards
            </Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.complianceNote}>
            <Text style={styles.complianceTitle}>FDA Compliance</Text>
            <Text style={styles.complianceText}>
              All records are maintained according to FDA requirements for food safety and quality assurance.
            </Text>
          </View>
        )}
        contentContainerStyle={styles.contentContainer}
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
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    lineHeight: 22,
  },
  modulesContainer: {
    gap: 16,
    marginBottom: 24,
  },
  moduleCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border + '40',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
  },
  moduleTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  moduleDescription: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  moduleFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border + '30',
    paddingTop: 12,
  },
  todayText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
  },
  downloadSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
  },
  downloadHint: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
  },
  complianceNote: {
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  complianceTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  complianceText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    lineHeight: 20,
  },
});