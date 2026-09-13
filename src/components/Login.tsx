import React, { useState } from 'react';
import { User, UserRole, SalesBox, DispatchStation } from '../types';
import { ShoppingCart, ScanLine, ShieldCheck, Lock, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';
import { ApsLogo } from './ApsLogo';
import { verifyAdminPassword } from '../utils/auth';
import { ChangePasswordModal } from './ChangePasswordModal';

interface LoginProps {
  onLogin: (user: User) => void;
  salesBoxes?: SalesBox[];
  dispatchStations?: DispatchStation[];
}

export function Login({ onLogin, salesBoxes, dispatchStations }: LoginProps) {
  const [loginType, setLoginType] = useState<UserRole>('cajero');
  
  const boxes = salesBoxes && salesBoxes.length > 0 ? salesBoxes : [
    { id: 'box-1', name: 'CAJA-01', description: 'Entrada Principal' },
    { id: 'box-2', name: 'CAJA-02', description: 'Mostrador Central' },
    { id: 'box-3', name: 'CAJA-03', description: 'Sector VIP' },
    { id: 'box-4', name: 'CAJA-04', description: 'Puesto Lateral' }
  ];

  const stations = dispatchStations && dispatchStations.length > 0 ? dispatchStations : [
    { id: 'disp-1', name: 'Barra Principal', description: 'Bebidas y tragos' },
    { id: 'disp-2', name: 'Cocina y Minutas', description: 'Platos calientes' },
    { id: 'disp-3', name: 'Parrilla y Buffet', description: 'Entregas rápidas' }
  ];

  // Datos para Caja de Ventas
  const [cashierName, setCashierName] = useState('');
  const [selectedBox, setSelectedBox] = useState(() => boxes[0]?.name || 'CAJA-01');
  const [customBox, setCustomBox] = useState('');
  const [isCustomBox, setIsCustomBox] = useState(false);

  // Datos para Despacho
  const [selectedStation, setSelectedStation] = useState(() => stations[0]?.name || 'Barra Principal');
  const [despachoName, setDespachoName] = useState('');
  const [isCustomStation, setIsCustomStation] = useState(false);

  // Datos para Administrador
  const [adminPin, setAdminPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (loginType === 'cajero') {
      if (!cashierName.trim()) {
        setError('Por favor, ingrese el nombre del cajero u operador.');
        return;
      }
      const boxId = isCustomBox ? (customBox.trim() || 'CAJA-01') : selectedBox;
      onLogin({
        id: `CAJ-${Math.floor(1000 + Math.random() * 9000)}`,
        name: cashierName.trim(),
        role: 'cajero',
        boxId: boxId.toUpperCase()
      });
    } else if (loginType === 'despacho') {
      const stationName = isCustomStation ? (despachoName.trim() || 'Puesto de Entrega') : selectedStation;
      onLogin({
        id: `DSP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: stationName,
        role: 'despacho'
      });
    } else {
      // Validar contraseña de Admin contra almacenamiento local
      if (!adminPin.trim()) {
        setError('Por favor, ingrese la contraseña de administrador.');
        return;
      }
      if (!verifyAdminPassword(adminPin)) {
        setError('Contraseña incorrecta. (Clave inicial: 1234)');
        return;
      }
      onLogin({
        id: 'ADMIN',
        name: 'Administrador General',
        role: 'admin',
        boxId: 'CAJA-ADMIN'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-7 sm:p-9 rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg flex flex-col items-center text-center"
      >
        <div className="mb-4 drop-shadow-md">
          <ApsLogo className="w-20 h-20" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 tracking-tight">APS POS</h1>
        <p className="text-slate-500 mb-6 font-medium text-xs sm:text-sm">
          Seleccione el perfil de acceso para comenzar
        </p>

        {/* Selector de Perfiles (3 perfiles independientes) */}
        <div className="grid grid-cols-3 gap-1.5 w-full bg-slate-100 p-1.5 rounded-2xl mb-7 border border-slate-200/80">
          {/* Perfil 1: Caja de Ventas */}
          <button
            type="button"
            id="login-tab-cajero"
            onClick={() => { setLoginType('cajero'); setError(''); }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl font-bold text-xs transition-all ${
              loginType === 'cajero' 
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
            }`}
          >
            <ShoppingCart className="w-4 h-4 mb-1" />
            <span>Caja de Ventas</span>
          </button>

          {/* Perfil 2: Zona de Entregas */}
          <button
            type="button"
            id="login-tab-despacho"
            onClick={() => { setLoginType('despacho'); setError(''); }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl font-bold text-xs transition-all ${
              loginType === 'despacho' 
                ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
            }`}
          >
            <ScanLine className="w-4 h-4 mb-1" />
            <span>Entregas</span>
          </button>

          {/* Perfil 3: Administrador */}
          <button
            type="button"
            id="login-tab-admin"
            onClick={() => { setLoginType('admin'); setError(''); }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl font-bold text-xs transition-all ${
              loginType === 'admin' 
                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mb-1" />
            <span>Admin</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-5">
          {/* FORMULARIO PERFIL: CAJA DE VENTAS */}
          {loginType === 'cajero' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-left"
            >
              <div>
                <label htmlFor="cashierName" className="block font-bold text-slate-700 text-xs uppercase tracking-wider mb-1.5">
                  Nombre del Cajero / Operador
                </label>
                <input
                  id="cashierName"
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 rounded-xl px-4 py-3.5 font-bold text-base focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:font-normal"
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Terminal / Caja Asignada
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {boxes.length} disponibles
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {boxes.map((box) => (
                    <button
                      key={box.id}
                      type="button"
                      onClick={() => { setSelectedBox(box.name); setIsCustomBox(false); }}
                      className={`p-2 text-left rounded-xl border transition-all ${
                        !isCustomBox && selectedBox === box.name
                          ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <p className="font-black font-mono text-xs">{box.name}</p>
                      {box.description && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{box.description}</p>
                      )}
                    </button>
                  ))}
                </div>

                {isCustomBox ? (
                  <input
                    type="text"
                    value={customBox}
                    onChange={(e) => setCustomBox(e.target.value)}
                    placeholder="Ej: CAJA-BARRA-01"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-blue-600"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCustomBox(true)}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    + Personalizar identificador de caja
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* FORMULARIO PERFIL: ZONA DE ENTREGAS */}
          {loginType === 'despacho' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-left"
            >
              <div>
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider mb-1.5">
                  Seleccione el Puesto de Entrega / Despacho
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  {stations.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => { setSelectedStation(st.name); setIsCustomStation(false); }}
                      className={`p-2.5 text-left rounded-xl border transition-all ${
                        !isCustomStation && selectedStation === st.name
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <p className="font-bold text-xs">{st.name}</p>
                      {st.description && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{st.description}</p>
                      )}
                    </button>
                  ))}
                </div>

                {isCustomStation ? (
                  <input
                    type="text"
                    value={despachoName}
                    onChange={(e) => setDespachoName(e.target.value)}
                    placeholder="Ej: Barra Terraza 2"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-600"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCustomStation(true)}
                    className="text-[11px] text-emerald-600 hover:underline font-semibold"
                  >
                    + Personalizar nombre de puesto
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-500 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                Este perfil valida y despacha los comprobantes impresos o códigos QR en barra.
              </p>
            </motion.div>
          )}

          {/* FORMULARIO PERFIL: ADMINISTRADOR */}
          {loginType === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-left"
            >
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="adminPin" className="block font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    Contraseña de Administrador
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline"
                  >
                    <KeyRound className="w-3 h-3" />
                    Cambiar contraseña
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    id="adminPin"
                    type={showPassword ? 'text' : 'password'}
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 rounded-xl px-4 py-3.5 font-black text-xl tracking-widest text-center focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder:tracking-normal placeholder:font-normal pr-12"
                    autoComplete="off"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 font-bold text-xs bg-red-50 py-2.5 px-3.5 rounded-xl border border-red-200 text-left"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            id="btn-login-submit"
            className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md ${
              loginType === 'cajero'
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
                : loginType === 'despacho'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
            }`}
          >
            {loginType === 'cajero' && 'Abrir Caja de Ventas'}
            {loginType === 'despacho' && 'Ingresar a Zona de Entregas'}
            {loginType === 'admin' && 'Ingresar al Panel de Admin'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </motion.div>

      {/* Modal para Cambiar Contraseña de Administrador */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
