import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { departments, departmentList } from '../data/colombia';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [department, setDepartment] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cities = department ? departments[department] ?? [] : [];

  function handleDepartmentChange(dept: string) {
    setDepartment(dept);
    setCity('');
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');
    if (!firstName.trim() || !lastName.trim()) {
      setError('El nombre y apellido son obligatorios.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const hasAddress = address || city || department;
      await authService.register(
        email, password, firstName, lastName,
        hasAddress ? { street: address || undefined, city: city || undefined, department: department || undefined } : undefined,
        phone || undefined,
      );
      navigate('/login');
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      setError(msg ?? 'No se pudo crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.icon}>✨</span>
          <h1 className={styles.title}>Crear cuenta</h1>
          <p className={styles.subtitle}>Empieza a hacer pedidos</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="firstName" className={styles.label}>Nombre</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Tu nombre"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="lastName" className={styles.label}>Apellido</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Tu apellido"
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className={styles.input}
            />
          </div>

          <fieldset className={styles.fieldset}>
            <legend className={styles.fieldsetLegend}>Dirección <span className={styles.optional}>(opcional)</span></legend>

            <div className={styles.field}>
              <label htmlFor="address" className={styles.label}>Dirección</label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, número, barrio"
                className={styles.input}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="department" className={styles.label}>Departamento</label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className={styles.input}
                >
                  <option value="">Seleccionar...</option>
                  {departmentList.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="city" className={styles.label}>Ciudad</label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={styles.input}
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
            <label htmlFor="phone" className={styles.label}>Teléfono <span className={styles.optional}>(opcional)</span></label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 300 123 4567"
              className={styles.input}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className={styles.switchText}>
          ¿Ya tienes cuenta?{' '}
          <button className={styles.switchLink} onClick={() => navigate('/login')}>
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
