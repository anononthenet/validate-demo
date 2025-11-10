
import type { Sujeto, Documento, CentroTrabajo, Log, GrupoRequisitos } from '../types';

const KEYS = {
  SUBJECTS: 'cae_subjects',
  DOCUMENTS: 'cae_documents',
  WORKSITES: 'cae_worksites',
  LOGS: 'cae_logs',
  REQUIREMENT_GROUPS: 'cae_requirement_groups',
};

type DataType = Sujeto[] | Documento[] | CentroTrabajo[] | Log[];

class ApiClient {
  private isInitialized = false;

  private async initializeData<T>(key: string, filePath: string): Promise<T[]> {
    try {
      const localData = localStorage.getItem(key);
      if (localData) {
        return JSON.parse(localData) as T[];
      }
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Error al cargar ${filePath}: ${response.statusText}`);
      }
      const data = await response.json() as T[];
      localStorage.setItem(key, JSON.stringify(data));
      return data;
    } catch (error) {
      console.error(`No se pudieron inicializar los datos para ${key}:`, error);
      return [];
    }
  }
  
  async init(): Promise<void> {
    if (this.isInitialized) return;

    await Promise.all([
      this.initializeData<Sujeto>(KEYS.SUBJECTS, '/data/subjects.json'),
      this.initializeData<Documento>(KEYS.DOCUMENTS, '/data/documents.json'),
      this.initializeData<CentroTrabajo>(KEYS.WORKSITES, '/data/worksites.json'),
      this.initializeData<Log>(KEYS.LOGS, '/data/logs.json'),
      this.initializeData<GrupoRequisitos>(KEYS.REQUIREMENT_GROUPS, '/data/requirement_groups.json'),
    ]);

    this.isInitialized = true;
  }

  private getData<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveData<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Sujetos
  getSujetos = (): Sujeto[] => this.getData<Sujeto>(KEYS.SUBJECTS);
  addSujeto = (sujeto: Omit<Sujeto, 'id'>): Sujeto => {
    const sujetos = this.getSujetos();
    const newSujeto: Sujeto = { ...sujeto, id: sujeto.dni };
    this.saveData<Sujeto>(KEYS.SUBJECTS, [...sujetos, newSujeto]);
    return newSujeto;
  };
  deleteSujeto = (id: string): void => {
      const sujetos = this.getSujetos();
      const updatedSujetos = sujetos.map(s => s.id === id ? { ...s, estado: 'Baja' as const } : s);
      this.saveData<Sujeto>(KEYS.SUBJECTS, updatedSujetos);
  }

  // Documentos
  getDocumentos = (): Documento[] => this.getData<Documento>(KEYS.DOCUMENTS);
  addDocumento = (doc: Omit<Documento, 'id'>): Documento => {
    const documentos = this.getDocumentos();
    const newDocumento: Documento = { ...doc, id: `doc-${Date.now()}` };
    this.saveData<Documento>(KEYS.DOCUMENTS, [...documentos, newDocumento]);
    return newDocumento;
  }

  // Centros de Trabajo
  getCentrosTrabajo = (): CentroTrabajo[] => this.getData<CentroTrabajo>(KEYS.WORKSITES);
  
  // Grupos de Requisitos
  getGruposRequisitosDetallados = (): GrupoRequisitos[] => this.getData<GrupoRequisitos>(KEYS.REQUIREMENT_GROUPS);


  // Logs
  getLogs = (): Log[] => this.getData<Log>(KEYS.LOGS).sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  addLog = (log: Omit<Log, 'id' | 'ts'>): Log => {
    const logs = this.getLogs();
    const newLog: Log = {
      ...log,
      id: `log-${Date.now()}`,
      ts: new Date().toISOString(),
    };
    this.saveData<Log>(KEYS.LOGS, [newLog, ...logs]);
    return newLog;
  };
}

export const apiClient = new ApiClient();