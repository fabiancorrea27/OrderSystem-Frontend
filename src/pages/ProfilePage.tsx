import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { User } from '../types';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getProfile()
      .then(setProfile)
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

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
        </div>

        <button className={styles.backBtn} onClick={() => navigate('/catalog')}>
          Volver al catálogo
        </button>
      </div>
    </div>
  );
}
