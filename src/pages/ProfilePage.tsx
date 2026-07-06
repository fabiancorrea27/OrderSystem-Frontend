import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { departments, departmentList } from '../data/colombia';
import type { Address, User } from '../types';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [addressDraft, setAddressDraft] = useState<Address>({});
  const [addressMode, setAddressMode] = useState<'new' | 'edit'>('new');
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);

  const cities = addressDraft.department ? departments[addressDraft.department] ?? [] : [];

  useEffect(() => {
    authService
      .getProfile()
      .then((p) => {
        setProfile(p);
        setFirstName(p.firstName);
        setLastName(p.lastName);
        setEmail(p.email);
        setPhone(p.phone ?? '');
        setSavedAddresses(p.addresses ?? []);
        setAddressDraft({});
        setAddressMode('new');
        setEditingAddressIndex(null);
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  function handleEdit() {
    setEditing(true);
    setError('');
  }

  function handleCancel() {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setEmail(profile.email);
    setPhone(profile.phone ?? '');
    setSavedAddresses(profile.addresses ?? []);
    setAddressDraft({});
    setAddressMode('new');
    setEditingAddressIndex(null);
    setEditing(false);
    setError('');
  }

  async function handleSave() {
    setError('');
    if (!firstName.trim() || !lastName.trim()) {
      setError('El nombre y apellido son obligatorios.');
      return;
    }
    if (!email.trim()) {
      setError('El correo electrónico es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      const addressesPayload = savedAddresses.filter((item) => item.street || item.city || item.department);
      const updated = await authService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        addresses: addressesPayload,
        phone: phone || undefined,
      });
      setProfile(updated);
      updateUser({ firstName: updated.firstName, lastName: updated.lastName, email: updated.email });
      setSavedAddresses(updated.addresses ?? []);
      setEditing(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      setError(msg ?? 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  }

  function handleAddressSubmit() {
    if (!addressDraft.street?.trim() && !addressDraft.city?.trim() && !addressDraft.department?.trim()) {
      setError('Agrega al menos una parte de la dirección.');
      return;
    }

    const normalized = {
      street: addressDraft.street?.trim() || undefined,
      city: addressDraft.city?.trim() || undefined,
      department: addressDraft.department?.trim() || undefined,
    };

    if (addressMode === 'edit' && editingAddressIndex !== null) {
      setSavedAddresses((prev) => prev.map((item, index) => (index === editingAddressIndex ? normalized : item)));
    } else {
      setSavedAddresses((prev) => [...prev, normalized]);
    }

    setAddressDraft({});
    setAddressMode('new');
    setEditingAddressIndex(null);
    setError('');
  }

  function handleEditAddress(index: number) {
    const selected = savedAddresses[index];
    setAddressDraft(selected);
    setAddressMode('edit');
    setEditingAddressIndex(index);
    setError('');
  }

  function handleRemoveAddress(index: number) {
    setSavedAddresses((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    if (editingAddressIndex === index) {
      setAddressDraft({});
      setAddressMode('new');
      setEditingAddressIndex(null);
    }
  }

  if (loading) return <div className={styles.wrapper}><p className={styles.loading}>Cargando...</p></div>;
  if (!profile) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.avatar}>👤</span>
          <h1 className={styles.title}>Mi Perfil</h1>
        </div>

        <div className={styles.infoGrid}>
          {editing ? (
            <>
              <div className={styles.sectionCard}>
                <div className={styles.rowFields}>
                  <div className={styles.field}>
                    <label htmlFor="edit-firstName" className={styles.label}>Nombre</label>
                    <input
                      id="edit-firstName"
                      className={styles.input}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="edit-lastName" className={styles.label}>Apellido</label>
                    <input
                      id="edit-lastName"
                      className={styles.input}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.rowFields}>
                  <div className={styles.field}>
                    <label htmlFor="edit-email" className={styles.label}>Correo electrónico</label>
                    <input
                      id="edit-email"
                      type="email"
                      className={styles.input}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="edit-phone" className={styles.label}>Teléfono <span className={styles.optional}>(opcional)</span></label>
                    <input
                      id="edit-phone"
                      type="tel"
                      className={styles.input}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                </div>
              </div>

              <fieldset className={styles.fieldset}>
                <legend className={styles.fieldsetLegend}>Direcciones guardadas</legend>

                <div className={styles.addressEditorBlock}>
                  <div className={styles.field}>
                    <label htmlFor="edit-street" className={styles.label}>Dirección</label>
                    <input
                      id="edit-street"
                      className={styles.input}
                      value={addressDraft.street ?? ''}
                      onChange={(e) => setAddressDraft((prev) => ({ ...prev, street: e.target.value }))}
                      placeholder="Calle, número, barrio"
                    />
                  </div>

                  <div className={styles.rowFields}>
                    <div className={styles.field}>
                      <label htmlFor="edit-department" className={styles.label}>Departamento</label>
                      <select
                        id="edit-department"
                        className={styles.input}
                        value={addressDraft.department ?? ''}
                        onChange={(e) => setAddressDraft((prev) => ({ ...prev, department: e.target.value, city: '' }))}
                      >
                        <option value="">Seleccionar...</option>
                        {departmentList.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="edit-city" className={styles.label}>Ciudad</label>
                      <select
                        id="edit-city"
                        className={styles.input}
                        value={addressDraft.city ?? ''}
                        onChange={(e) => setAddressDraft((prev) => ({ ...prev, city: e.target.value }))}
                        disabled={!addressDraft.department}
                      >
                        <option value="">Seleccionar...</option>
                        {cities.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.addressActionsRow}>
                    <button type="button" className={styles.secondaryBtn} onClick={handleAddressSubmit}>
                      {addressMode === 'edit' ? 'Guardar dirección' : 'Agregar dirección'}
                    </button>
                    {addressMode === 'edit' && (
                      <button type="button" className={styles.ghostBtn} onClick={() => { setAddressDraft({}); setAddressMode('new'); setEditingAddressIndex(null); }}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                {savedAddresses.length > 0 && (
                  <div className={styles.addressListEditor}>
                    {savedAddresses.map((address, index) => (
                      <div key={`${address.street}-${index}`} className={styles.addressItem}>
                        <div>
                          <strong>{address.street || 'Sin calle'}</strong>
                          <div className={styles.addressMeta}>{address.city || 'Sin ciudad'} · {address.department || 'Sin departamento'}</div>
                        </div>
                        <div className={styles.addressItemActions}>
                          <button type="button" className={styles.linkBtn} onClick={() => handleEditAddress(index)}>Editar</button>
                          <button type="button" className={styles.linkBtnDanger} onClick={() => handleRemoveAddress(index)}>Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </fieldset>
            </>
          ) : (
            <>
              <div className={styles.sectionCard}>
                <div className={styles.field}>
                  <span className={styles.label}>Nombre</span>
                  <span className={styles.value}>{profile.firstName} {profile.lastName}</span>
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>Correo electrónico</span>
                  <span className={styles.value}>{profile.email}</span>
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>Teléfono</span>
                  <span className={`${styles.value} ${!profile.phone ? styles.muted : ''}`}>
                    {profile.phone || 'No registrado'}
                  </span>
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>Rol</span>
                  <span className={styles.value}>{profile.role === 'Admin' ? 'Administrador' : 'Cliente'}</span>
                </div>
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.field}>
                  <span className={styles.label}>Direcciones guardadas</span>
                  {profile.addresses && profile.addresses.length > 0 ? (
                    <div className={styles.addressList}>
                      {profile.addresses.map((address, index) => (
                        <span key={`${address.street}-${index}`} className={styles.addressChip}>
                          {address.street || 'Sin calle'} · {address.city || 'Sin ciudad'} · {address.department || 'Sin departamento'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className={`${styles.value} ${styles.muted}`}>Sin direcciones guardadas</span>
                  )}
                </div>
              </div>

            </>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          {editing ? (
            <>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button className={styles.editBtn} onClick={handleEdit}>
                Editar perfil
              </button>
              <button className={styles.backBtn} onClick={() => navigate('/catalog')}>
                Volver al catálogo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
