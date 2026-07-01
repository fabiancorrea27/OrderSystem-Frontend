import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { departments, departmentList } from '../data/colombia';
import type { User } from '../types';
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
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');

  const cities = department ? departments[department] ?? [] : [];

  useEffect(() => {
    authService
      .getProfile()
      .then((p) => {
        setProfile(p);
        setFirstName(p.firstName);
        setLastName(p.lastName);
        setEmail(p.email);
        setStreet(p.address?.street ?? '');
        setCity(p.address?.city ?? '');
        setDepartment(p.address?.department ?? '');
        setPhone(p.phone ?? '');
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
    setStreet(profile.address?.street ?? '');
    setCity(profile.address?.city ?? '');
    setDepartment(profile.address?.department ?? '');
    setPhone(profile.phone ?? '');
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
      const hasAddress = street || city || department;
      const updated = await authService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        address: hasAddress ? { street: street || undefined, city: city || undefined, department: department || undefined } : undefined,
        phone: phone || undefined,
      });
      setProfile(updated);
      updateUser({ firstName: updated.firstName, lastName: updated.lastName, email: updated.email });
      setEditing(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      setError(msg ?? 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
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

              <fieldset className={styles.fieldset}>
                <legend className={styles.fieldsetLegend}>Dirección <span className={styles.optional}>(opcional)</span></legend>

                <div className={styles.field}>
                  <label htmlFor="edit-street" className={styles.label}>Dirección</label>
                  <input
                    id="edit-street"
                    className={styles.input}
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Calle, número, barrio"
                  />
                </div>

                <div className={styles.rowFields}>
                  <div className={styles.field}>
                    <label htmlFor="edit-department" className={styles.label}>Departamento</label>
                    <select
                      id="edit-department"
                      className={styles.input}
                      value={department}
                      onChange={(e) => { setDepartment(e.target.value); setCity(''); }}
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
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={!department}
                    >
                      <option value="">Seleccionar...</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>

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
            </>
          ) : (
            <>
              <div className={styles.field}>
                <span className={styles.label}>Nombre</span>
                <span className={styles.value}>{profile.firstName} {profile.lastName}</span>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Correo electrónico</span>
                <span className={styles.value}>{profile.email}</span>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Rol</span>
                <span className={styles.value}>{profile.role === 'Admin' ? 'Administrador' : 'Cliente'}</span>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Dirección</span>
                <span className={`${styles.value} ${!profile.address?.street ? styles.muted : ''}`}>
                  {profile.address?.street || 'No registrada'}
                </span>
              </div>

              <div className={styles.rowFields}>
                <div className={styles.field}>
                  <span className={styles.label}>Ciudad</span>
                  <span className={`${styles.value} ${!profile.address?.city ? styles.muted : ''}`}>
                    {profile.address?.city || 'No registrada'}
                  </span>
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>Departamento</span>
                  <span className={`${styles.value} ${!profile.address?.department ? styles.muted : ''}`}>
                    {profile.address?.department || 'No registrado'}
                  </span>
                </div>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Teléfono</span>
                <span className={`${styles.value} ${!profile.phone ? styles.muted : ''}`}>
                  {profile.phone || 'No registrado'}
                </span>
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
