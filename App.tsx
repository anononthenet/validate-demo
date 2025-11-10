import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { ToastProvider, useToast } from './hooks/useToast';
import { apiClient } from './services/apiClient';
import type { Sujeto, Documento, CentroTrabajo, Log, Pagina } from './types';
import { Button, Input, Select, Label, Card, StatusBadge, Modal, FileDropzone, DataTable, EmptyState } from './components/ui';
import Chatbot from './components/Chatbot';

// --- Iconos ---
const icons: Record<string, ReactNode> = {
    Dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    "Alta de Sujeto": <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
    Documentos: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Informes: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Logs: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>,
    FAQ: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Ajustes: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Logout: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    Menu: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
};

// --- Páginas ---
const DashboardPage = () => {
    const [stats, setStats] = useState({ tramites: 0, caducidades: 0, activos: 0, pendientes: 0 });

    useEffect(() => {
        const sujetos = apiClient.getSujetos();
        const documentos = apiClient.getDocumentos();
        const hoy = new Date();
        const proximoMes = new Date();
        proximoMes.setMonth(hoy.getMonth() + 1);

        setStats({
            tramites: sujetos.length,
            caducidades: documentos.filter(d => new Date(d.caducidad) > hoy && new Date(d.caducidad) < proximoMes).length,
            activos: sujetos.filter(s => s.estado === 'Activo').length,
            pendientes: sujetos.filter(s => s.estado === 'Pendiente').length
        });
    }, []);

    const kpis = [
        { title: "Sujetos Totales", value: stats.tramites, color: "sky" },
        { title: "Sujetos Activos", value: stats.activos, color: "green" },
        { title: "Sujetos Pendientes", value: stats.pendientes, color: "yellow" },
        { title: "Próximas Caducidades (30d)", value: stats.caducidades, color: "orange" },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map(kpi => (
                    <Card key={kpi.title} className={`border-l-4 border-${kpi.color}-500`}>
                        <h4 className="text-slate-500 uppercase text-sm">{kpi.title}</h4>
                        <p className="text-4xl font-bold mt-2">{kpi.value}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const AltaSujetoPage = () => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Omit<Sujeto, 'id'>>({
        dni: '', nombre: '', apellido1: '', apellido2: '', centro: '', grupo_requisitos: '', estado: 'Pendiente'
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [centros, setCentros] = useState<CentroTrabajo[]>([]);
    const [gruposRequisitos, setGruposRequisitos] = useState<string[]>([]);

    useEffect(() => { 
        setCentros(apiClient.getCentrosTrabajo()); 
        const sujetos = apiClient.getSujetos();
        const grupos = [...new Set(sujetos.map(s => s.grupo_requisitos))].sort();
        setGruposRequisitos(grupos);
    }, []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const dniRegex = /^[XYZ]?\d{7,8}[A-Z]$|^[A-H-NP-S]\d{7}[0-9A-J]$/;
        if (!formData.dni || !formData.nombre || !formData.centro || !formData.grupo_requisitos) {
            addToast('Todos los campos son obligatorios.', 'error');
            return false;
        }
        if (!dniRegex.test(formData.dni.toUpperCase())) {
            addToast('El formato del DNI/CIF/NIE no es válido.', 'error');
            return false;
        }
        return true;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setIsModalOpen(true);
        }
    };

    const handleConfirmSubmit = () => {
        try {
            apiClient.addSujeto(formData);
            apiClient.addLog({
                usuario: 'guillermo@validate.es',
                accion: 'Alta sujeto',
                detalle: `DNI ${formData.dni} - ${formData.nombre}`
            });
            addToast('Sujeto dado de alta correctamente', 'success');
            setFormData({ dni: '', nombre: '', apellido1: '', apellido2: '', centro: '', grupo_requisitos: '', estado: 'Pendiente' });
            setDataKey(Date.now()); // Actualiza la clave para refrescar la tabla
        } catch (error) {
            addToast('Error al dar de alta el sujeto', 'error');
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleDelete = (id: string) => {
        try {
            apiClient.deleteSujeto(id);
            apiClient.addLog({
                usuario: 'guillermo@validate.es',
                accion: 'Baja sujeto',
                detalle: `DNI ${id}`
            });
            addToast('Sujeto dado de baja (estado cambiado)', 'success');
            setDataKey(Date.now());
        } catch(error) {
            addToast('Error al dar de baja el sujeto', 'error');
        }
    }
    
    const columns = [
        { header: 'DNI/CIF', accessor: 'dni' as keyof Sujeto },
        { header: 'Nombre', accessor: 'nombre' as keyof Sujeto, render: (s: Sujeto) => `${s.nombre} ${s.apellido1} ${s.apellido2}`.trim() },
        { header: 'Centro', accessor: 'centro' as keyof Sujeto },
        { header: 'Estado', accessor: 'estado' as keyof Sujeto, render: (s: Sujeto) => <StatusBadge status={s.estado} /> },
        { header: 'Acciones', accessor: 'id' as keyof Sujeto, render: (s: Sujeto) => (
          s.estado !== 'Baja' ? <Button variant="danger" className="py-1 px-2 text-xs" onClick={() => handleDelete(s.id)}>Dar de Baja</Button> : null
        )}
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Sujetos</h1>
            <Card title="Alta de Nuevo Sujeto">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div><Label htmlFor="dni">DNI/CIF/NIE</Label><Input type="text" name="dni" id="dni" value={formData.dni} onChange={handleInputChange} required /></div>
                    <div><Label htmlFor="nombre">Nombre / Razón Social</Label><Input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleInputChange} required /></div>
                    <div><Label htmlFor="apellido1">Primer Apellido</Label><Input type="text" name="apellido1" id="apellido1" value={formData.apellido1} onChange={handleInputChange} /></div>
                    <div><Label htmlFor="apellido2">Segundo Apellido</Label><Input type="text" name="apellido2" id="apellido2" value={formData.apellido2} onChange={handleInputChange} /></div>
                    <div><Label htmlFor="centro">Centro de Trabajo</Label>
                        <Select name="centro" id="centro" value={formData.centro} onChange={handleInputChange} required>
                            <option value="">Seleccionar centro...</option>
                            {centros.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                        </Select>
                    </div>
                    <div><Label htmlFor="grupo_requisitos">Grupo de Requisitos</Label>
                        <Select name="grupo_requisitos" id="grupo_requisitos" value={formData.grupo_requisitos} onChange={handleInputChange} required>
                            <option value="">Seleccionar grupo...</option>
                            {gruposRequisitos.map(g => <option key={g} value={g}>{g}</option>)}
                        </Select>
                    </div>
                    <div className="md:col-span-2 lg:col-span-4 flex justify-end items-end">
                        <Button type="submit">Crear Alta</Button>
                    </div>
                </form>
            </Card>

            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Listado de Sujetos</h2>
                <DataTable columns={columns} data={apiClient.getSujetos()} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirmar Alta">
                <div>
                    <p className="mb-4">Por favor, revisa los datos antes de confirmar el alta:</p>
                    <pre className="bg-slate-100 p-4 rounded-md text-sm whitespace-pre-wrap">
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                    <div className="mt-6 flex justify-end space-x-2">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button variant="primary" onClick={handleConfirmSubmit}>Confirmar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const DocumentosPage = () => {
    const { addToast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [sujeto, setSujeto] = useState('');
    const [tipoDoc, setTipoDoc] = useState('DNI');

    const [sujetos, setSujetos] = useState<Sujeto[]>([]);
    useEffect(() => { 
        setSujetos(apiClient.getSujetos().filter(s => s.estado !== 'Baja')); 
    }, []);

    const handleFileDrop = (droppedFile: File) => {
        setFile(droppedFile);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !sujeto) {
            addToast('Debe seleccionar un archivo y un sujeto.', 'error');
            return;
        }

        const selectedSujeto = sujetos.find(s => s.dni === sujeto);
        if (!selectedSujeto) {
            addToast('Sujeto no válido.', 'error');
            return;
        }

        const newDocumento: Omit<Documento, 'id'> = {
            dni: sujeto,
            tipo: tipoDoc,
            obra: selectedSujeto.centro,
            fecha_carga: new Date().toISOString().split('T')[0],
            caducidad: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // Caducidad simulada a 1 año
            estado: 'Pendiente de Revisión',
            nombreArchivo: file.name
        };

        apiClient.addDocumento(newDocumento);
        apiClient.addLog({
            usuario: 'guillermo@naxia.es',
            accion: 'Subida de documento',
            detalle: `Archivo ${file.name} para DNI ${sujeto}`
        });
        addToast('Documento subido para revisión.', 'success');
        setFile(null);
        setSujeto('');
        setTipoDoc('DNI');
        setDataKey(Date.now());
    };
    
    const columns = [
        { header: 'Sujeto (DNI)', accessor: 'dni' as keyof Documento },
        { header: 'Tipo Documento', accessor: 'tipo' as keyof Documento },
        { header: 'Archivo', accessor: 'nombreArchivo' as keyof Documento },
        { header: 'Estado', accessor: 'estado' as keyof Documento, render: (d: Documento) => <StatusBadge status={d.estado} /> },
        { header: 'Caducidad', accessor: 'caducidad' as keyof Documento },
    ];

    const documentosRecientes = apiClient.getDocumentos().sort((a, b) => new Date(b.fecha_carga).getTime() - new Date(a.fecha_carga).getTime());

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Subida Guiada de Documentos</h1>
            <Card>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label>1. Selecciona el Sujeto</Label>
                             <Select value={sujeto} onChange={e => setSujeto(e.target.value)} required>
                                <option value="">Seleccionar sujeto...</option>
                                {sujetos.map(s => <option key={s.id} value={s.dni}>{s.nombre} {s.apellido1} ({s.dni})</option>)}
                            </Select>
                            
                            <div className="mt-4">
                                <Label>2. Selecciona el Tipo de Documento</Label>
                                <Select value={tipoDoc} onChange={e => setTipoDoc(e.target.value)} required>
                                    <option>DNI</option>
                                    <option>Certificado Formación PRL</option>
                                    <option>Certificado Corriente de Pago SS</option>
                                    <option>TC2</option>
                                    <option>Contrato</option>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>3. Adjunta el Archivo</Label>
                            <FileDropzone onFileDrop={handleFileDrop} />
                            {file && (
                                <div className="mt-2 p-2 bg-slate-100 rounded text-sm">
                                    <p><strong>Archivo seleccionado:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={!file || !sujeto}>Subir Documento</Button>
                    </div>
                </form>
            </Card>
            
            <div className="mt-8">
                 <h2 className="text-2xl font-bold mb-4">Documentos Recientes</h2>
                <DataTable columns={columns} data={documentosRecientes} />
            </div>
        </div>
    );
};

const ReportsPage = () => {
    const { addToast } = useToast();
    const [filters, setFilters] = useState({ centro: '', estado: '', fechaDesde: '', fechaHasta: '' });
    const [centros, setCentros] = useState<CentroTrabajo[]>([]);
    
    useEffect(() => { setCentros(apiClient.getCentrosTrabajo()); }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const generateReport = () => {
        let data = apiClient.getSujetos();

        if (filters.centro) data = data.filter(s => s.centro === filters.centro);
        if (filters.estado) data = data.filter(s => s.estado === filters.estado);
        // La filtración por fecha no aplica a sujetos, es un ejemplo.
        
        if(data.length === 0) {
            addToast('No hay datos que coincidan con los filtros para generar el informe.', 'info');
            return;
        }

        // Convertir a CSV
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => JSON.stringify(row[header as keyof Sujeto])).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `informe_cae_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            addToast('Informe generado y descargado.', 'success');
            apiClient.addLog({ usuario: 'guillermo@naxia.es', accion: 'Generación de informe', detalle: `Filtros: ${JSON.stringify(filters)}` });
        }
    };

    return (
         <div>
            <h1 className="text-3xl font-bold mb-6">Generación de Informes</h1>
            <Card title="Filtros del Informe de Sujetos">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div><Label htmlFor="centro">Centro de Trabajo</Label>
                        <Select name="centro" value={filters.centro} onChange={handleFilterChange}>
                            <option value="">Todos</option>
                            {centros.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                        </Select>
                    </div>
                    <div><Label htmlFor="estado">Estado del Sujeto</Label>
                        <Select name="estado" value={filters.estado} onChange={handleFilterChange}>
                            <option value="">Todos</option>
                            <option value="Activo">Activo</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Baja">Baja</option>
                        </Select>
                    </div>
                     <div><Label htmlFor="fechaDesde">Fecha Desde (simulado)</Label><Input type="date" name="fechaDesde" value={filters.fechaDesde} onChange={handleFilterChange} /></div>
                    <div><Label htmlFor="fechaHasta">Fecha Hasta (simulado)</Label><Input type="date" name="fechaHasta" value={filters.fechaHasta} onChange={handleFilterChange} /></div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={generateReport}>Generar Informe (CSV)</Button>
                </div>
            </Card>
             <div className="mt-8">
                <EmptyState 
                    title="Informes a Medida"
                    message="Utiliza los filtros para acotar los datos y genera un informe en formato CSV para su análisis."
                />
            </div>
        </div>
    );
};

const LogsPage = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    
    useEffect(() => {
        setLogs(apiClient.getLogs());
    }, []);

    const columns = [
        { header: 'Fecha y Hora', accessor: 'ts' as keyof Log, render: (l: Log) => new Date(l.ts).toLocaleString('es-ES') },
        { header: 'Usuario', accessor: 'usuario' as keyof Log },
        { header: 'Acción', accessor: 'accion' as keyof Log },
        { header: 'Detalle', accessor: 'detalle' as keyof Log },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Registro de Actividad (Logs)</h1>
            <DataTable columns={columns} data={logs} />
        </div>
    );
};

const FaqPage = () => (
    <div>
        <h1 className="text-3xl font-bold mb-6">Preguntas Frecuentes (FAQ)</h1>
        <div className="space-y-6">
            <Card title="¿Cómo doy de alta un nuevo trabajador?">
                <p>Ve a la sección "Gestión de Sujetos", rellena el formulario con los datos del trabajador y haz clic en "Crear Alta". Asegúrate de que el DNI sea correcto, ya que se usa como identificador único.</p>
            </Card>
            <Card title="¿Qué significa el estado 'Pendiente'?">
                <p>El estado 'Pendiente' indica que el sujeto ha sido creado en el sistema, pero aún no se ha subido y aprobado toda la documentación necesaria. No podrá acceder al centro de trabajo hasta que su estado sea 'Activo'.</p>
            </Card>
            <Card title="¿Cómo subo un documento?">
                <p>En la página de "Documentos", selecciona primero el sujeto al que pertenece el documento, luego el tipo de documento y finalmente arrastra el archivo a la zona indicada o haz clic para seleccionarlo de tu ordenador.</p>
            </Card>
        </div>
    </div>
);

const SettingsPage = () => (
    <div>
        <h1 className="text-3xl font-bold mb-6">Ajustes</h1>
        <Card title="Configuración de la Cuenta">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Activar notificaciones por email</Label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="notifications" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                        <label htmlFor="notifications" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="darkmode">Activar modo oscuro</Label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="darkmode" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                        <label htmlFor="darkmode" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                </div>
                 <div>
                    <Label htmlFor="language">Idioma</Label>
                    <Select id="language" defaultValue="es">
                        <option value="es">Español</option>
                        <option value="en" disabled>Inglés (no disponible)</option>
                    </Select>
                </div>
            </div>
            <style>{`.toggle-checkbox:checked { right: 0; border-color: #ea580c; } .toggle-checkbox:checked + .toggle-label { background-color: #ea580c; }`}</style>
        </Card>
    </div>
);


// --- Layout y App Principal ---
const LoginPage = ({ onLogin }: { onLogin: (email: string) => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // For development and production
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || 'admin@validate.es';
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'ValidateNaxia1357';
        
        console.log('Login attempt with:', { email, adminEmail });
        
        if (email === adminEmail && password === adminPassword) {
            onLogin(email);
        } else {
            setError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
            console.error('Login failed - Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
            <Card className="w-full max-w-md">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <img src="/valida.png" alt="VALIDATE CAE" className="h-16 w-auto" />
                    </div>
                    <h2 className="text-2xl font-bold mt-4">Bienvenido</h2>
                    <p className="text-slate-500 mt-2">Introduce tus credenciales</p>
                </div>
                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="username"
                            required 
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Contraseña</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required 
                        />
                    </div>
                    <Button type="submit" className="w-full">Iniciar Sesión</Button>
                </form>
            </Card>
        </div>
    );
};

// FIX: Correctly type MainLayout props using React.PropsWithChildren to resolve missing 'children' prop error.
type MainLayoutProps = {
    currentPage: Pagina;
    onNavigate: (page: Pagina) => void;
    onLogout: () => void;
};
const MainLayout = ({ children, currentPage, onNavigate, onLogout }: React.PropsWithChildren<MainLayoutProps>) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navItems: Pagina[] = ["Dashboard", "Alta de Sujeto", "Documentos", "Informes", "Logs", "FAQ", "Ajustes"];

    // FIX: Changed to React.FC to correctly handle the 'key' prop provided in lists.
    const NavLink: React.FC<{ page: Pagina, isMobile?: boolean }> = ({ page, isMobile = false }) => (
        <button
            onClick={() => {
                onNavigate(page);
                if (isMobile) setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                currentPage === page ? 'bg-orange-600 text-white' : 'text-slate-200 hover:bg-slate-700'
            }`}
        >
            {icons[page]}
            <span className="font-medium">{page}</span>
        </button>
    );

    const SidebarContent = () => (
        <div className="bg-slate-800 text-white h-full flex flex-col p-4">
            <div className="flex justify-center mb-8">
                <img src="/valida.png" alt="VALIDATE CAE" className="h-12 w-auto" />
            </div>
            <nav className="flex-1 space-y-2">
                {navItems.map(page => <NavLink key={page} page={page} isMobile />)}
            </nav>
            <div className="mt-auto">
                 <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors text-slate-200 hover:bg-slate-700">
                    {icons['Logout']}
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
    
    return (
        <div className="flex h-screen bg-slate-100">
            {/* Sidebar para móvil (drawer) */}
            <div className={`fixed inset-0 z-40 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`} >
                <SidebarContent />
            </div>
             {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

            {/* Sidebar para escritorio */}
            <aside className="hidden md:block w-64 flex-shrink-0">
                 <SidebarContent />
            </aside>
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center md:justify-end">
                    <button className="md:hidden text-slate-500" onClick={() => setIsSidebarOpen(true)}>{icons['Menu']}</button>
                    <div className="text-right">
                        <p className="font-semibold">Usuario</p>
                        <p className="text-sm text-slate-500">guillermo@validate.es</p>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState<Pagina>('Dashboard');
    const [loggedInUserEmail, setLoggedInUserEmail] = useState('');

    useEffect(() => {
        // Limpia el almacenamiento local al iniciar para cargar datos frescos de la demo.
        // Esto soluciona el problema de caché que impedía ver los datos actualizados.
        localStorage.clear();
        apiClient.init().then(() => setIsLoading(false));
    }, []);

    const handleLogin = (email: string) => {
        apiClient.addLog({ usuario: email, accion: 'Inicio de sesión', detalle: 'Acceso a la plataforma' });
        setIsLoggedIn(true);
        setLoggedInUserEmail(email);
        setCurrentPage('Dashboard');
    };

    const handleLogout = (email: string) => {
        apiClient.addLog({ usuario: email, accion: 'Cierre de sesión', detalle: 'Salida de la plataforma' });
        setIsLoggedIn(false);
        setLoggedInUserEmail('');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'Dashboard': return <DashboardPage />;
            case 'Alta de Sujeto': return <AltaSujetoPage />;
            case 'Documentos': return <DocumentosPage />;
            case 'Informes': return <ReportsPage />;
            case 'Logs': return <LogsPage />;
            case 'FAQ': return <FaqPage />;
            case 'Ajustes': return <SettingsPage />;
            default: return <DashboardPage />;
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando plataforma...</div>;
    }
    
    if (!isLoggedIn) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <>
            <MainLayout currentPage={currentPage} onNavigate={setCurrentPage} onLogout={() => handleLogout(loggedInUserEmail)}>
                {renderPage()}
            </MainLayout>
            <Chatbot />
        </>
    );
}


export default function AppWrapper() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  )
}