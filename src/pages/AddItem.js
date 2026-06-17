import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function AddItem() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', brand: '', size: '', purchase_price: '', listing_price: '',
    platform: 'Plick', notes: '', date_purchased: ''
  })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handlePhoto = e => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!form.name) return alert(t.itemNameRequired)
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    let photo_url = null
    if (photo) {
      const ext = photo.name.split('.').pop()
      const filename = `${user.id}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('item-photos').upload(filename, photo)
      if (!error) {
        const { data } = supabase.storage.from('item-photos').getPublicUrl(filename)
        photo_url = data.publicUrl
      }
    }
    const data = {
      user_id: user.id,
      name: form.name,
      brand: form.brand || null,
      size: form.size || null,
      purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
      listing_price: form.listing_price ? parseFloat(form.listing_price) : null,
      platform: form.platform || null,
      notes: form.notes || null,
      date_purchased: form.date_purchased || null,
      photo_url,
      status: 'listed'
    }
    const { error: insertError } = await supabase.from('items').insert([data])
    if (insertError) {
      alert('Error saving item: ' + insertError.message)
      setUploading(false)
      return
    }
    setUploading(false)
    navigate('/inventory')
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#e91e8c' }}>{t.addNewItem}</h1>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.itemName}</label>
          <input name="name" placeholder={t.itemNamePlaceholder} value={form.name} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.brand}</label>
          <input name="brand" placeholder={t.brandPlaceholder} value={form.brand} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.size}</label>
          <input name="size" placeholder={t.sizePlaceholder} value={form.size} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.purchasePrice}</label>
          <input name="purchase_price" type="number" placeholder="0" value={form.purchase_price} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.listingPrice}</label>
          <input name="listing_price" type="number" placeholder="0" value={form.listing_price} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.platform}</label>
          <select name="platform" value={form.platform} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400">
            {['Plick','Vinted','Depop','eBay','Instagram','Other/Annat'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.datePurchased}</label>
          <input name="date_purchased" type="date" value={form.date_purchased} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.notes}</label>
          <input name="notes" placeholder={t.notesPlaceholder} value={form.notes} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.photoOptional}</label>
          <input type="file" accept="image/*" onChange={handlePhoto}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:text-white cursor-pointer" />
          {preview && <img src={preview} alt="preview" className="mt-3 rounded-lg w-full max-h-48 object-cover" />}
        </div>
        <button onClick={handleSubmit} disabled={uploading}
          className="text-white rounded-lg py-2 font-medium transition"
          style={{ backgroundColor: '#e91e8c' }}>
          {uploading ? t.saving : t.saveItem}
        </button>
      </div>
    </div>
  )
}
