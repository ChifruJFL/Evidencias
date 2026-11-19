// Pruebas automatizadas de CultivaUP (sin dependencias).
// Uso: node pruebas.js index.html
// Carga el JavaScript de la página en un entorno simulado (sin navegador) y ejecuta los casos.
const fs = require('fs'), vm = require('vm');
const archivo = process.argv[2] || 'index.html';
const html = fs.readFileSync(archivo, 'utf8');

function cargar() {
  const js = html.match(/<script>([\s\S]*)<\/script>/)[1];
  const store = {}, els = {}, L = {}, avisos = [];
  const el = () => ({ innerHTML: '', textContent: '', dataset: {}, value: '', hidden: false, checked: false,
    addEventListener(t, f) { (this.l = this.l || {})[t] = f; }, showModal() {}, close() {} });
  const ctx = {
    console, localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
    document: { querySelector: s => els[s] || (els[s] = el()), querySelectorAll: () => [],
      addEventListener: (t, f) => { L[t] = f; }, createElement: () => ({ click() {} }) },
    setInterval: f => { ctx.__tick = f; return 1; }, alert: m => avisos.push(m), confirm: () => true,
    FormData: class { constructor() { this.f = ctx.__form; } get(k) { return this.f[k]; } },
    URL: { createObjectURL: () => '' }, Blob: class {}
  };
  vm.createContext(ctx);
  vm.runInContext(js, ctx);
  const ev = c => vm.runInContext(c, ctx);
  const clic = d => L.click({ target: { dataset: d } });
  const enviar = (c, id, datos) => { ctx.__form = datos; q('#frm').l.submit({ preventDefault() {}, target: { dataset: { c, id: id || '' } } }); };
  const q = s => els[s] || (els[s] = el());
  const entrar = (correo, pass) => { q('#lc').value = correo; q('#lp').value = pass; clic({ login: '' }); };
  return { ev, clic, enviar, entrar, els, q, avisos, store, ctx };
}

const casos = [];
const T = (id, nombre, f) => casos.push({ id, nombre, f });
const PASS = 'Cultiva2026!';

T('T-01', 'Datos iniciales con 3 usuarios y sus roles', a =>
  JSON.stringify(a.ev('db.usuarios.map(u=>u.rol)')) === JSON.stringify(['Administrador', 'Encargado', 'Consulta']));
T('T-02', 'Inicio de sesión: acepta credenciales válidas y rechaza las incorrectas', a => {
  a.entrar('luis@cultivaup.demo', 'incorrecta');
  const rechazo = a.ev('user') === null && /incorrectos/.test(a.q('#le').textContent);
  a.entrar('luis@cultivaup.demo', PASS);
  return rechazo && a.ev('user.rol') === 'Administrador';
});
T('T-03', 'Permisos por rol (Administrador, Encargado, Consulta)', a => {
  const p = r => { a.ev(`user=db.usuarios.find(u=>u.rol=='${r}')`); return [a.ev("can('cultivos')"), a.ev("can('usuarios')")]; };
  return JSON.stringify([p('Administrador'), p('Encargado'), p('Consulta')]) === JSON.stringify([[true, true], [true, false], [false, false]]);
});
T('T-04', 'Alerta de humedad al registrar una lectura bajo el umbral', a => {
  const antes = a.ev('db.alertas.length');
  a.ev("evalL({sensor:db.sensores.find(s=>s.cultivo==11&&s.tipo=='Humedad').id,fecha:today(),valor:10})");
  return a.ev('db.alertas.length') === antes + 1 && a.ev("db.alertas.some(x=>x.cultivo==11&&/Humedad baja/.test(x.msg))");
});
T('T-05', 'Alerta por falta de riego', a => {
  a.ev("db.alertas=[];db.riegos=db.riegos.filter(r=>r.cultivo!=11);db.riegos.push({id:9001,cultivo:11,fecha:ago(10),litros:5,resp:1,obs:''});chkRiego()");
  return a.ev("db.alertas.some(x=>x.cultivo==11&&x.tipo=='Riego')");
});
T('T-06', 'Alerta de inventario cuando la existencia llega al mínimo', a => {
  a.ev('db.alertas=[];chkRiego()');
  return a.ev("db.alertas.some(x=>x.tipo=='Inventario')");
});
T('T-07', 'No se duplican alertas pendientes del mismo tipo y cultivo', a => {
  a.ev("db.alertas=[];addAl(10,'Humedad','Humedad baja (20%)',today());addAl(10,'Humedad','Humedad baja (19%)',today())");
  return a.ev('db.alertas.length') === 1;
});
T('T-08', 'Folio de solicitud no se repite después de borrar una', a => {
  a.entrar('luis@cultivaup.demo', PASS);
  const id = a.ev("db.solicitudes.find(s=>s.folio=='SC-0002').id");
  a.clic({ del: 'solicitudes:' + id });
  a.enviar('solicitudes', '', { folio: '', titulo: 'Prueba', tipo: 'Correctivo', prioridad: 'Baja', estado: 'Recibida', resp: '1', fecha: '2026-11-18', version: '' });
  const folios = a.ev('db.solicitudes.map(s=>s.folio)');
  return new Set(folios).size === folios.length;
});
T('T-09', 'El historial de lecturas se conserva tras 15 min de monitoreo en vivo (300 ciclos)', a => {
  a.entrar('luis@cultivaup.demo', PASS);
  const viejas = () => a.ev('db.lecturas.filter(l=>l.ts<Date.now()-3600000).length');
  const antes = viejas();
  for (let i = 0; i < 300; i++) a.ctx.__tick();
  a.resultado = `${viejas()} de ${antes} lecturas anteriores a 1 h conservadas`;
  return viejas() === antes;
});
T('T-10', 'Validación: un riego con 0 litros se rechaza', a => {
  a.entrar('luis@cultivaup.demo', PASS);
  const antes = a.ev('db.riegos.length');
  a.enviar('riegos', '', { cultivo: '10', fecha: '2026-11-18', litros: '0', resp: '1', obs: '' });
  return a.ev('db.riegos.length') === antes && a.avisos.length > 0;
});
T('T-11', 'Persistencia: un registro nuevo queda guardado en el almacenamiento', a => {
  a.entrar('luis@cultivaup.demo', PASS);
  a.enviar('cultivos', '', { nombre: 'Cultivo de prueba', tipo: 'Hortaliza', siembra: '2026-11-01', cosecha_est: '2026-12-01', estado: 'Activo', parcela: 'Z9', resp: '1' });
  return Object.values(a.store).some(v => v.includes('Cultivo de prueba'));
});
T('T-12', 'La pantalla de inicio de sesión no muestra credenciales', a =>
  !/Cultiva2026!|@cultivaup\.demo/.test(a.els['#app'].innerHTML) && /Entrar/.test(a.els['#app'].innerHTML));
T('T-13', 'Todas las secciones se muestran sin errores (Administrador)', a => {
  a.entrar('luis@cultivaup.demo', PASS);
  const tabs = ['panel', 'monitoreo', 'calendario', 'tareas', 'insumos', 'solicitudes', 'reporte', 'cultivos', 'riegos', 'cosechas',
    'observaciones', 'sensores', 'lecturas', 'alertas', 'usuarios', 'sistema', 'bitacora'];
  tabs.forEach(t => { a.clic({ tab: t }); if (!a.els['#app'].innerHTML.includes('<main>')) throw new Error('sin contenido: ' + t); });
  return true;
});
T('T-14', 'Sin código muerto (manejador "reset" sin botón y expresión vacía)', () =>
  !html.includes("'reset'in d") && !html.includes("?'':''"));
T('T-15', 'El sistema enlaza la documentación (diagrama ER y Plan de Mantenimiento)', a => {
  a.entrar('luis@cultivaup.demo', PASS);
  const h = a.els['#app'].innerHTML;
  return /ER_CultivaUP/.test(h) && /Plan_Mantenimiento/.test(h);
});
T('T-16', 'La clave de almacenamiento está versionada (cultivaup_v4)', a => a.ev('KEY') === 'cultivaup_v4');

let ok = 0;
console.log('Archivo evaluado: ' + archivo + '\n');
casos.forEach(c => {
  const a = cargar();
  let r; try { r = !!c.f(a); } catch (e) { r = false; a.resultado = 'error: ' + e.message; }
  if (r) ok++;
  console.log(`${c.id}  ${r ? 'APROBADO' : 'FALLO   '}  ${c.nombre}${a.resultado ? '  [' + a.resultado + ']' : ''}`);
});
console.log(`\nResultado: ${ok} de ${casos.length} casos aprobados (${(ok / casos.length * 100).toFixed(1)} %)`);
