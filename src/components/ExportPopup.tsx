import React, { useState } from 'react';
import { Player, TeamInfo } from '../types';
import { TEAMS, POSITIONS, CSV_HEADERS, generateBaseRosterCSV } from '../data';
import { Download, AlertTriangle, X, FileSpreadsheet, Upload, Share2 } from 'lucide-react';

interface ExportPopupProps {
  roster: Player[];
  onClose: () => void;
}

export default function ExportPopup({ roster, onClose }: ExportPopupProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<number>(5); // Default to Browns (ID 5)
  const [uploadedBaseCSV, setUploadedBaseCSV] = useState<string[][] | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  const selectedTeam = TEAMS.find(t => t.id === selectedTeamId) || TEAMS[0];

  // Helper to parse CSV string into arrays of strings
  const parseCSVRows = (text: string): string[][] => {
    const lines = text.split(/\r?\n/);
    const parsed: string[][] = [];
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const row: string[] = [];
      let cell = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(cell.trim());
          cell = '';
        } else {
          cell += char;
        }
      }
      row.push(cell.trim());
      parsed.push(row);
    }
    return parsed;
  };

  React.useEffect(() => {
    fetch('/baseRoster.csv')
      .then(res => {
        if (!res.ok) throw new Error('File not found');
        return res.text();
      })
      .then(text => {
        const parsed = parseCSVRows(text);
        if (parsed.length >= 2) {
          const headerRow = parsed[0];
          const colIdx: Record<string, number> = {};
          headerRow.forEach((colName, idx) => {
            colIdx[colName.replace(/^["']|["']$/g, '').trim().toUpperCase()] = idx;
          });
          const required = ['TGID', 'PPOS', 'PFNA', 'PLNA', 'PGID', 'POID'];
          const missing = required.filter(col => colIdx[col] === undefined);
          if (missing.length === 0) {
            setUploadedBaseCSV(parsed);
            setUploadedFileName('baseRoster.csv (Auto-loaded from workspace)');
          } else {
            console.warn('Auto-loaded baseRoster.csv is missing some required columns:', missing);
          }
        }
      })
      .catch(err => {
        console.log('No default baseRoster.csv found on server, using synthetic template.', err);
      });
  }, []);

  const handleBaseRosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setUploadError('Uploaded file is empty.');
          return;
        }

        const parsed = parseCSVRows(text);
        if (parsed.length < 2) {
          setUploadError('Invalid CSV structure.');
          return;
        }

        // Verify some standard columns
        const headerRow = parsed[0];
        const colIndex: Record<string, number> = {};
        headerRow.forEach((colName, idx) => {
          colIndex[colName.replace(/^["']|["']$/g, '').trim().toUpperCase()] = idx;
        });

        const required = ['TGID', 'PPOS', 'PFNA', 'PLNA', 'PGID', 'POID'];
        const missing = required.filter(col => colIndex[col] === undefined);
        if (missing.length > 0) {
          setUploadError(`Missing required Madden columns in CSV: ${missing.join(', ')}`);
          return;
        }

        setUploadedBaseCSV(parsed);
        setUploadedFileName(file.name);
      } catch (err) {
        setUploadError('Error parsing base roster CSV. Ensure it is a valid CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearUploadedBase = () => {
    setUploadedBaseCSV(null);
    setUploadedFileName('');
    setUploadError('');
  };

  // Process and download the updated roster CSV
  const handleExport = () => {
    // 1. Get the baseline CSV rows
    let parsedRows: string[][] = [];
    if (uploadedBaseCSV) {
      // Deep copy to prevent modifying the state
      parsedRows = uploadedBaseCSV.map(row => [...row]);
    } else {
      const baseCSVText = generateBaseRosterCSV(selectedTeamId);
      parsedRows = parseCSVRows(baseCSVText);
    }
    
    if (parsedRows.length < 2) {
      alert('Error: Base roster CSV is empty or invalid.');
      return;
    }

    // 2. Map headers to column indices
    const headerRow = parsedRows[0];
    const colIndex: Record<string, number> = {};
    headerRow.forEach((colName, index) => {
      const cleanHeader = colName.replace(/^["']|["']$/g, '').trim().toUpperCase();
      colIndex[cleanHeader] = index;
    });

    // Check that necessary columns exist
    const requiredCols = ['TGID', 'PPOS', 'PFNA', 'PLNA', 'PHGT', 'PWGT', 'PAGE', 'PYRP', 'PJEN', 'PROL', 'POVR'];
    const missing = requiredCols.filter(c => colIndex[c] === undefined);
    if (missing.length > 0) {
      alert(`Error: The CSV is missing required column headers: ${missing.join(', ')}`);
      return;
    }

    // 3. Group our crafted players by position
    const craftedByPos: Record<number, Player[]> = {};
    roster.forEach(player => {
      if (!craftedByPos[player.PPOS]) {
        craftedByPos[player.PPOS] = [];
      }
      craftedByPos[player.PPOS].push(player);
    });

    // We keep track of replacements for logging/user feedback
    const replacementLogs: string[] = [];
    let replaceCount = 0;

    // Dynamically identify all attribute and trait columns from the uploaded CSV.
    const identityCols = [
      'PFNA', 'PLNA', 'PHGT', 'PWGT', 'PAGE', 'PYRP', 'PJEN', 'PROL', 'POVR', 'PPOS', 'TGID',
      'PGID', 'PJID', 'PLID', 'PTID', 'PUID'
    ];

    const LIST_A_EDITABLE = [
      'PFNA', 'PLNA', 'POVR', 'PHGT', 'PWGT', 'PAGE', 'PYRP', 'PJEN', 'PROL',
      'PSPD', 'PAGI', 'PACC', 'PAWR', 'PSTR', 'PJMP', 'PSTA', 'PTGH', 'PINJ', 'PELU', 'PTHP', 'PTHA', 'PTAS', 'PTAM', 'PTAD', 'PTOR', 'PTUP', 'PPLA', 'PBSK', 'PCAR', 'PBCV', 'PBKT', 'PLSA', 'PLTR', 'PLSM', 'PLJM', 'PCTH', 'PLCI', 'PLSC', 'SRRN', 'PMRR', 'PDRR', 'PLRL', 'PPBK', 'PPBF', 'PPBS', 'PRBK', 'PRBF', 'PRBS', 'PLIB', 'PLBK', 'PLPR', 'PTAK', 'PLHT', 'PBSG', 'PLPU', 'PLPM', 'PFMS', 'PLMC', 'PLZC', 'PLPE', 'PKPR', 'PKAC', 'PKRT'
    ];

    const LIST_B_PROTECTED = [
      'PGID', 'POID', 'PGHE', 'PHSN', 'PHTN', 'PICN', 'TGID', 'PPOS'
    ];

    const attributeCols: string[] = [];
    const traitCols: string[] = [];

    // All standard Madden attributes
    const coreStatsList = [
      'PSPD', 'PAGI', 'PACC', 'PAWR', 'PSTR', 'PJMP', 'PSTA', 'PTGH', 'PINJ', 'PELU',
      'PTHP', 'PTHA', 'PTAS', 'PTAM', 'PTAD', 'PTOR', 'PTUP', 'PPLA', 'PBSK',
      'PCAR', 'PBCV', 'PBKT', 'PLSA', 'PLTR', 'PLSM', 'PLJM',
      'PCTH', 'PLCI', 'PLSC', 'SRRN', 'PMRR', 'PDRR', 'PLRL',
      'PPBK', 'PPBF', 'PPBS', 'PRBK', 'PRBF', 'PRBS', 'PLIB', 'PLBK',
      'PLPR', 'PTAK', 'PLHT', 'PBSG', 'PLPU', 'PLPM', 'PFMS', 'PLMC', 'PLZC', 'PLPE',
      'PKPR', 'PKAC', 'PKRT'
    ];

    Object.keys(colIndex).forEach(header => {
      if (coreStatsList.includes(header)) {
        attributeCols.push(header);
      } else if (header.startsWith('TR')) {
        const standardTraits = ['TRCL', 'TRHM', 'TRCB', 'TRBH', 'TRSB', 'TRDO', 'TRTA'];
        if (standardTraits.includes(header)) {
          traitCols.push(header);
        }
      }
    });

    // 5. Iterate through roster rows and overwrite where team and position matches
    for (let i = 1; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      const rowTeamId = parseInt(row[colIndex['TGID']]);
      const rowPosId = parseInt(row[colIndex['PPOS']]);

      // If this row is a player on the selected team and we have a crafted player for this position remaining
      if (rowTeamId === selectedTeamId && craftedByPos[rowPosId] && craftedByPos[rowPosId].length > 0) {
        // Shift out the next custom player we crafted for this position
        const customPlayer = craftedByPos[rowPosId].shift()!;

        // Overwrite identity columns (only if in LIST_A_EDITABLE and NOT in LIST_B_PROTECTED)
        if (colIndex['PFNA'] !== undefined && LIST_A_EDITABLE.includes('PFNA') && !LIST_B_PROTECTED.includes('PFNA')) {
          row[colIndex['PFNA']] = customPlayer.PFNA;
        }
        if (colIndex['PLNA'] !== undefined && LIST_A_EDITABLE.includes('PLNA') && !LIST_B_PROTECTED.includes('PLNA')) {
          row[colIndex['PLNA']] = customPlayer.PLNA;
        }
        if (colIndex['PHGT'] !== undefined && LIST_A_EDITABLE.includes('PHGT') && !LIST_B_PROTECTED.includes('PHGT')) {
          row[colIndex['PHGT']] = String(customPlayer.PHGT);
        }
        if (colIndex['PWGT'] !== undefined && LIST_A_EDITABLE.includes('PWGT') && !LIST_B_PROTECTED.includes('PWGT')) {
          row[colIndex['PWGT']] = String(customPlayer.PWGT);
        }
        if (colIndex['PAGE'] !== undefined && LIST_A_EDITABLE.includes('PAGE') && !LIST_B_PROTECTED.includes('PAGE')) {
          row[colIndex['PAGE']] = String(customPlayer.PAGE);
        }
        if (colIndex['PYRP'] !== undefined && LIST_A_EDITABLE.includes('PYRP') && !LIST_B_PROTECTED.includes('PYRP')) {
          row[colIndex['PYRP']] = String(customPlayer.PYRP);
        }
        if (colIndex['PJEN'] !== undefined && LIST_A_EDITABLE.includes('PJEN') && !LIST_B_PROTECTED.includes('PJEN')) {
          row[colIndex['PJEN']] = String(customPlayer.PJEN);
        }
        if (colIndex['PROL'] !== undefined && LIST_A_EDITABLE.includes('PROL') && !LIST_B_PROTECTED.includes('PROL')) {
          row[colIndex['PROL']] = String(customPlayer.PROL);
        }
        if (colIndex['POVR'] !== undefined && LIST_A_EDITABLE.includes('POVR') && !LIST_B_PROTECTED.includes('POVR')) {
          row[colIndex['POVR']] = String(customPlayer.POVR);
        }

        // Overwrite attributes (only if in LIST_A_EDITABLE and NOT in LIST_B_PROTECTED)
        Object.entries(customPlayer.attributes).forEach(([attrKey, attrVal]) => {
          const uKey = attrKey.toUpperCase();
          if (colIndex[uKey] !== undefined && LIST_A_EDITABLE.includes(uKey) && !LIST_B_PROTECTED.includes(uKey)) {
            row[colIndex[uKey]] = String(attrVal);
          }
        });

        // Overwrite traits (convert True/False or numeric trait to 1 or 0, only if NOT in LIST_B_PROTECTED)
        Object.entries(customPlayer.traits).forEach(([traitKey, traitVal]) => {
          const uKey = traitKey.toUpperCase();
          if (colIndex[uKey] !== undefined && !LIST_B_PROTECTED.includes(uKey)) {
            row[colIndex[uKey]] = traitVal ? '1' : '0';
          }
        });

        const posName = POSITIONS.find(p => p.id === rowPosId)?.code || 'N/A';
        replacementLogs.push(`Successfully replaced ${posName}: ${customPlayer.PFNA} ${customPlayer.PLNA} (OVR: ${customPlayer.POVR})`);
        replaceCount++;
      } else {
        if (rowTeamId === selectedTeamId) {
          // Unreplaced players on the selected team: 50 OVR, age 30
          if (colIndex['PFNA'] !== undefined && LIST_A_EDITABLE.includes('PFNA') && !LIST_B_PROTECTED.includes('PFNA')) {
            row[colIndex['PFNA']] = 'Player';
          }
          if (colIndex['PLNA'] !== undefined && LIST_A_EDITABLE.includes('PLNA') && !LIST_B_PROTECTED.includes('PLNA')) {
            row[colIndex['PLNA']] = 'Player';
          }
          if (colIndex['POVR'] !== undefined && LIST_A_EDITABLE.includes('POVR') && !LIST_B_PROTECTED.includes('POVR')) {
            row[colIndex['POVR']] = '50';
          }
          if (colIndex['PAGE'] !== undefined && LIST_A_EDITABLE.includes('PAGE') && !LIST_B_PROTECTED.includes('PAGE')) {
            row[colIndex['PAGE']] = '30';
          }
          
          attributeCols.forEach(col => {
            if (colIndex[col] !== undefined && LIST_A_EDITABLE.includes(col) && !LIST_B_PROTECTED.includes(col)) {
              row[colIndex[col]] = '50';
            }
          });

          // Set all traits to 0 (only if NOT in LIST_B_PROTECTED)
          traitCols.forEach(col => {
            if (colIndex[col] !== undefined && !LIST_B_PROTECTED.includes(col)) {
              row[colIndex[col]] = '0';
            }
          });
        } else {
          // Other teams' players: 80 OVR, age 27, named "Player Player"
          if (colIndex['PFNA'] !== undefined && LIST_A_EDITABLE.includes('PFNA') && !LIST_B_PROTECTED.includes('PFNA')) {
            row[colIndex['PFNA']] = 'Player';
          }
          if (colIndex['PLNA'] !== undefined && LIST_A_EDITABLE.includes('PLNA') && !LIST_B_PROTECTED.includes('PLNA')) {
            row[colIndex['PLNA']] = 'Player';
          }
          if (colIndex['POVR'] !== undefined && LIST_A_EDITABLE.includes('POVR') && !LIST_B_PROTECTED.includes('POVR')) {
            row[colIndex['POVR']] = '80';
          }
          if (colIndex['PAGE'] !== undefined && LIST_A_EDITABLE.includes('PAGE') && !LIST_B_PROTECTED.includes('PAGE')) {
            row[colIndex['PAGE']] = '27';
          }
          
          attributeCols.forEach(col => {
            if (colIndex[col] !== undefined && LIST_A_EDITABLE.includes(col) && !LIST_B_PROTECTED.includes(col)) {
              row[colIndex[col]] = '80';
            }
          });

          // Set all traits to 0 (only if NOT in LIST_B_PROTECTED)
          traitCols.forEach(col => {
            if (colIndex[col] !== undefined && !LIST_B_PROTECTED.includes(col)) {
              row[colIndex[col]] = '0';
            }
          });
        }
      }
    }

    // 6. Check if any crafted players were NOT matched
    const unmatchedPositions: string[] = [];
    Object.entries(craftedByPos).forEach(([posIdStr, players]) => {
      if (players.length > 0) {
        const pCode = POSITIONS.find(p => p.id === parseInt(posIdStr))?.code || 'N/A';
        unmatchedPositions.push(`${pCode} (x${players.length})`);
      }
    });

    // ASSERTION: Verify that columns were not deleted
    if (parsedRows[0].length < 140) {
      alert(`CRITICAL ERROR: Columns were deleted! Roster only contains ${parsedRows[0].length} columns instead of 140+.`);
      throw new Error(`CRITICAL ERROR: Columns were deleted! Column count: ${parsedRows[0].length}`);
    }

    // 7. Convert rows back to CSV text
    const csvContent = parsedRows.map(row => 
      row.map(cell => {
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');

    // 8. Trigger local download of file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const filename = `madden_customized_${selectedTeam.name.toLowerCase()}_roster.csv`;
      
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Alert user with results
    let alertMsg = `Success! Generated customized CSV overwriting ${replaceCount} player(s) on the ${selectedTeam.city} ${selectedTeam.name}.`;
    if (uploadedBaseCSV) {
      alertMsg += `\n\nOriginal face models (PGHE), portraits (PICN), gear settings (PHSN, PHTN), and player IDs (PGID, POID) were kept 100% untouched for full compatibility!`;
    }
    if (unmatchedPositions.length > 0) {
      alertMsg += `\n\nNote: The following drafted players could not be overwritten because the base team did not contain enough depth positions: ${unmatchedPositions.join(', ')}`;
    }
    alert(alertMsg);
  };

  const handleExportLeaguePreset = () => {
    if (roster.length === 0) {
      alert("Error: Your drafted roster is empty! Draft some players before exporting.");
      return;
    }

    const rows: string[][] = [CSV_HEADERS];

    roster.forEach(player => {
      const row: string[] = [];
      
      CSV_HEADERS.forEach(headerName => {
        const uKey = headerName.toUpperCase();
        if (uKey === 'PFNA') row.push(player.PFNA);
        else if (uKey === 'PLNA') row.push(player.PLNA);
        else if (uKey === 'PHGT') row.push(String(player.PHGT));
        else if (uKey === 'PWGT') row.push(String(player.PWGT));
        else if (uKey === 'PAGE') row.push(String(player.PAGE));
        else if (uKey === 'PYRP') row.push(String(player.PYRP));
        else if (uKey === 'PJEN') row.push(String(player.PJEN));
        else if (uKey === 'PROL') row.push(String(player.PROL));
        else if (uKey === 'POVR') row.push(String(player.POVR));
        else if (uKey === 'TGID') row.push(String(selectedTeamId));
        else if (uKey === 'PPOS') row.push(String(player.PPOS));
        else if (player.attributes[headerName as keyof typeof player.attributes] !== undefined) {
          row.push(String(player.attributes[headerName as keyof typeof player.attributes]));
        } else if (player.traits[headerName as keyof typeof player.traits] !== undefined) {
          row.push(String(player.traits[headerName as keyof typeof player.traits]));
        } else {
          row.push('0');
        }
      });

      rows.push(row);
    });

    // ASSERTION: Verify that columns were not deleted
    if (rows[0].length < 140) {
      alert(`CRITICAL ERROR: Columns were deleted! Preset only contains ${rows[0].length} columns instead of 140+.`);
      throw new Error(`CRITICAL ERROR: Columns were deleted! Column count: ${rows[0].length}`);
    }

    const csvContent = rows.map(r => 
      r.map(cell => {
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const filename = `madden_league_preset_${selectedTeam.name.toLowerCase()}_${roster.length}man.csv`;
      
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Success! Exported your ${roster.length}-player team as a league preset CSV. Share this file with your league manager!`);
  };



  return (
    <div id="export-popup-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div id="export-popup-box" className="bg-[#1a202c] border border-gray-800 rounded-xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Banner with team theme color overlay */}
        <div 
          className="h-2 w-full transition-all duration-300" 
          style={{ backgroundColor: selectedTeam.colors.primary }}
        ></div>

        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#111622]">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Export Customized Roster</h2>
              <p className="text-gray-400 text-xs mt-0.5">Insert custom drafted players into a Madden base roster file.</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded hover:bg-gray-800 text-gray-500 hover:text-gray-300 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Step 1: Team selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold tracking-wider text-indigo-400 uppercase">
              1. Select NFL Team to Replace
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  id="export-team-selector"
                  value={selectedTeamId}
                  onChange={e => setSelectedTeamId(parseInt(e.target.value))}
                  className="w-full bg-[#111622] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {TEAMS.filter(t => t.id !== 1099).map(team => (
                    <option key={team.id} value={team.id}>
                      {team.city} {team.name} (TGID: {team.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic team preview card */}
              <div 
                className="rounded p-2.5 flex items-center gap-3 border text-xs"
                style={{ 
                  backgroundColor: `${selectedTeam.colors.primary}15`, 
                  borderColor: `${selectedTeam.colors.primary}50` 
                }}
              >
                <div 
                  className="h-6 w-6 rounded flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ backgroundColor: selectedTeam.colors.primary, color: '#fff' }}
                >
                  {selectedTeam.name[0]}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white block truncate">{selectedTeam.city} {selectedTeam.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">Team ID: {selectedTeam.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Drafted Players Preview */}
          <div className="bg-[#111622] rounded-lg p-4 border border-gray-850 space-y-2.5">
            <h3 className="text-xs font-bold tracking-wider text-indigo-400 uppercase">
              2. Drafted Players to Inject ({roster.length} Players)
            </h3>
            
            {roster.length > 0 ? (
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px] custom-scrollbar">
                {roster.map(p => {
                  const posCode = POSITIONS.find(pos => pos.id === p.PPOS)?.code || 'N/A';
                  return (
                    <div key={p.id} className="flex justify-between items-center text-gray-300 bg-gray-900/50 p-1.5 rounded border border-gray-850">
                      <span>{posCode}: {p.PFNA} {p.PLNA}</span>
                      <span className="text-indigo-400 font-bold">OVR {p.POVR} → Replaces base {posCode}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-amber-400 bg-amber-950/20 border border-amber-900/40 p-2.5 rounded">
                You have not drafted any players yet. Exporting will just download a completely clean baseRoster template. We recommend drafting a few stars first!
              </p>
            )}
          </div>

          {/* Step 3: Core download action */}
          <div className="pt-2 space-y-3 border-t border-gray-800/60">
            <label className="block text-xs font-bold tracking-wider text-indigo-400 uppercase">
              3. Generate and Export File
            </label>
            <button
              id="btn-download-csv"
              type="button"
              onClick={handleExport}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 cursor-pointer transition-colors"
            >
              <Download className="h-5 w-5" />
              Generate & Download Custom Roster CSV
            </button>

            <button
              id="btn-download-league-preset"
              type="button"
              onClick={handleExportLeaguePreset}
              className="w-full bg-transparent hover:bg-indigo-950/20 text-indigo-400 hover:text-indigo-300 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 border border-indigo-900/40 cursor-pointer transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Export My Team for a League (League Preset)
            </button>

            <p className="text-center text-[10px] text-gray-500 mt-2 font-mono leading-normal">
              Downloads either the complete roster file or a portable team preset file.
            </p>
          </div>

        </div>

        {/* Footer info warning */}
        <div className="bg-[#111622] p-3 border-t border-gray-800 text-[10px] font-mono text-gray-400 flex items-center gap-2 justify-center">
          <span>Base roster injection complete. Ready for Madden import.</span>
        </div>

      </div>
    </div>
  );
}
