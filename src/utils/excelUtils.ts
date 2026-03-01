import * as XLSX from 'xlsx';

const flattenData = (data: any[]) => {
  return data.map(item => {
    const flattened: any = {};
    Object.keys(item).forEach(key => {
      if (typeof item[key] === 'object' && item[key] !== null && !Array.isArray(item[key])) {
        // Flatten nested objects (e.g., allowances)
        Object.keys(item[key]).forEach(subKey => {
          flattened[`${key}_${subKey}`] = item[key][subKey];
        });
      } else if (Array.isArray(item[key])) {
         // Join arrays with a pipe character
         flattened[key] = item[key].map((i: any) => typeof i === 'object' ? JSON.stringify(i) : i).join(' | ');
      } else {
        flattened[key] = item[key];
      }
    });
    return flattened;
  });
};

export const exportToExcel = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  const flattenedData = flattenData(data);

  // Create Worksheet
  const ws = XLSX.utils.json_to_sheet(flattenedData);

  // Set Sheet Direction to RTL (Right-to-Left)
  if (!ws['!views']) ws['!views'] = [];
  ws['!views'].push({ rightToLeft: true });

  // Create Workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Write File
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Read first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Un-flatten data (reconstruct nested objects like allowances)
                const unflattened = jsonData.map((row: any) => {
                    const obj: any = {};
                    Object.keys(row).forEach(key => {
                        if (key.includes('_')) {
                            // Reconstruct nested object (e.g., allowances_transportation -> allowances: { transportation: ... })
                            const [parent, child] = key.split('_');
                            if (!obj[parent]) obj[parent] = {};
                            obj[parent][child] = row[key];
                        } else {
                            obj[key] = row[key];
                        }
                    });
                    return obj;
                });

                resolve(unflattened);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
