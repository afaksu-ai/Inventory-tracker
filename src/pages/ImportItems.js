import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import * as XLSX from 'xlsx'

export default function ImportItems() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [preview, setPreview] = useState([])
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  const handleFile = (e) => {
    setError('')
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target.result, { type: 'binary' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
        setPreview(rows.slice(0, 100))
      } catch (err) {
        setError('Could not read file. Make sure it is a valid .xlsx or .csv file.')
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleImport = async () => {
    if (!preview.length) return
    setImporting(true)
    const { data: { user } } = await supabase.auth.getUser()
    const items = preview.map(row => ({
      user_id: user.id,
      name: row['Name'] || row['Namn'] || row['name'] || '',
      brand: row['Brand'] || row['Märke'] || row['brand'] || null,
      size: row['Size'] || row['Storlek'] || row['size'] || null,
      purchase_price: parseFloat(row['Purchase Price'] || row['Inköpspris'] || row['purchase_price']) || null,
      listing_price: parseFloat(row['Listing Price'] || row['Utropspris'] || row['listing_price']) || null,
      platform: row['Platform'] || row['Plattform'] || row['platform'] || null,
      notes: row['Notes'] || row['Anteckningar'] || row['notes'] || null,
      date_purchased: row['Date Purchased'] || row['Inköpsdatum'] || row['date_purchased'] || null,
      status: row['Status'] || 'listed',
    })).filter(i => i.name)
    const { error } = await supabase.from('items').insert(items)
    if (error) {
      setError('Import failed: ' + error.message)
    } else {
      navigate('/inventory')
    }
    setImporting(false)
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#e91e8c' }}>
        📂 {t.lang === 'sv' ? 'Importera från Excel' : 'Import from Excel'}
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {t.lang === 'sv'
          ? 'Ladda upp en .xlsx eller .csv fil. Kolumnerna ska heta: Name, Brand, Size, Purchase Price, Listing Price, Platform, Notes, Date Purchased'
          : 'Upload a .xlsx or .csv file. Columns should be named: Name, Brand, Size, Purchase Price, Listing Price, Platform, Notes, Date Purchased'}
      </p>

      {/* Download template */}
      <button
        onClick={() => {
          const ws = XLSX.utils.aoa_to_sheet([['Name','Brand','Size','Purchase Price','Listing Price','Platform','Notes','Date Purchased']])
          const wb = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(wb, ws, 'Items')
          XLSX.writeFile(wb, 'reselltracker-template.xlsx')
        }}
        className="mb-6 text-sm px-4 py-2 rounded-lg border-2 font-medium"
        style={{ borderColor: '#e91e8c', color: '#e91e8c' }}>
        ⬇ {t.lang === 'sv' ? 'Ladda ner mall' : 'Download template'}
      </button>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.lang === 'sv' ? 'Välj fil' : 'Choose file'}
        </label>
        <input type="file" accept=".xlsx,.csv,.xls" onChange={handleFile}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:text-white cursor-pointer"
          style={{ '--tw-file-bg': '#e91e8c' }} />
        {fileName && <p className="text-sm text-gray-400 mt-2">📄 {fileName}</p>}
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {preview.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <p className="font-medium" style={{ color: '#e91e8c' }}>
              {preview.length} {t.lang === 'sv' ? 'varor hittades' : 'items found'}
            </p>
            <button onClick={handleImport} disabled={importing}
              className="text-sm text-white px-4 py-2 rounded-lg font-medium"
              style={{ backgroundColor: '#e91e8c' }}>
              {importing
                ? (t.lang === 'sv' ? 'Importerar...' : 'Importing...')
                : (t.lang === 'sv' ? '✓ Importera alla' : '✓ Import all')}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  {Object.keys(preview[0]).map(key => (
                    <th key={key} className="px-4 py-3 text-left">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-4 py-3">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && (
              <p className="text-center text-gray-400 text-sm py-3">
                {t.lang === 'sv' ? `... och ${preview.length - 10} till` : `... and ${preview.length - 10} more`}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
