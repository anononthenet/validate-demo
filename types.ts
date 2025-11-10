
export type EstadoSujeto = "Activo" | "Pendiente" | "Baja";
export type EstadoDocumento = "Aprobado" | "Pendiente de Revisión" | "Rechazado" | "Caducado";

export interface Sujeto {
  id: string;
  dni: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  centro: string;
  grupo_requisitos: string;
  estado: EstadoSujeto;
}

export interface Documento {
  id: string;
  dni: string;
  tipo: string;
  obra: string;
  fecha_carga: string;
  caducidad: string;
  estado: EstadoDocumento;
  nombreArchivo: string;
}

export interface CentroTrabajo {
  id: string;
  nombre: string;
}

export interface Log {
  id: string;
  ts: string;
  usuario: string;
  accion: string;
  detalle: string;
}

export interface GrupoRequisitos {
  nombre: string;
  documentos_requeridos: string[];
}

export type Pagina = 
  | "Dashboard"
  | "Alta de Sujeto"
  | "Documentos"
  | "Informes"
  | "Logs"
  | "FAQ"
  | "Ajustes";