import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

// Читає/пише users/{uid}/{name}. Реальний час + офлайн-кеш працюють автоматично
// завдяки persistentLocalCache, налаштованому в firebase.js.
// Видалення — м'яке (позначка deleted: true), щоб записи можна було відновити з кошика.
export function useCollection(name, orderField = 'createdAt') {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [trashed, setTrashed] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'users', user.uid, name), orderBy(orderField, 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setItems(all.filter((it) => !it.deleted))
        setTrashed(all.filter((it) => it.deleted))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [user, name, orderField])

  const add = (data) =>
    addDoc(collection(db, 'users', user.uid, name), { ...data, createdAt: serverTimestamp() })

  const update = (id, data) => updateDoc(doc(db, 'users', user.uid, name, id), data)

  const remove = (id) =>
    updateDoc(doc(db, 'users', user.uid, name, id), { deleted: true, deletedAt: serverTimestamp() })

  const restore = (id) =>
    updateDoc(doc(db, 'users', user.uid, name, id), { deleted: false, deletedAt: null })

  // Остаточне видалення — тільки з кошика, назавжди.
  const destroy = (id) => deleteDoc(doc(db, 'users', user.uid, name, id))

  return { items, trashed, loading, add, update, remove, restore, destroy }
}
