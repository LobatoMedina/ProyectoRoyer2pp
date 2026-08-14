CREATE DATABASE IF NOT EXISTS bolsa_trabajo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bolsa_trabajo;

CREATE TABLE IF NOT EXISTS tbl_cat_TipoContacto (
  TipoContactoId INT AUTO_INCREMENT PRIMARY KEY,
  TipoContacto_TipoContacto VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_cat_Rol (
  RolId INT AUTO_INCREMENT PRIMARY KEY,
  Rol_Rol VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_cat_AspiranteTipo (
  AspiranteTipoId INT AUTO_INCREMENT PRIMARY KEY,
  AspiranteTipo_AspiranteTipo VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_cat_Carrera (
  CarreraId INT AUTO_INCREMENT PRIMARY KEY,
  Carrera_Carrera VARCHAR(150) NOT NULL UNIQUE,
  Carrera_Activa TINYINT(1) NOT NULL DEFAULT 1,
  Carrera_CuatrimestreDuracion INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_cat_TipoEmpresa (
  TipoEmpresaid INT AUTO_INCREMENT PRIMARY KEY,
  TipoEmpresa_TipoEmpresa VARCHAR(150) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_cat_Sexo (
  SexoId INT AUTO_INCREMENT PRIMARY KEY,
  Sexo_Sexo VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_cat_Turno (
  TurnoId INT AUTO_INCREMENT PRIMARY KEY,
  Turno_turno VARCHAR(100) NOT NULL,
  Turno_letra CHAR(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_cat_CicloEscolar (
  CicloEscolarId INT AUTO_INCREMENT PRIMARY KEY,
  CicloEscolar_CicloEscolar VARCHAR(100) NOT NULL,
  CicloEscolar_Activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_cat_VacanteTipo (
  VacanteTipoId INT AUTO_INCREMENT PRIMARY KEY,
  VacanteTipo_VacanteTipo VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_cat_DuracionTipo (
  DuracionTipoId INT AUTO_INCREMENT PRIMARY KEY,
  DuracionTipo_DuracionTipo VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_cat_Resolucion (
  ResolucionId INT AUTO_INCREMENT PRIMARY KEY,
  Resolucion_Resolucion VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================
-- TABLAS OPERATIVAS (tbl_ope_*)
-- ====================================================

CREATE TABLE IF NOT EXISTS tbl_ope_Usuario (
  UsuarioId INT AUTO_INCREMENT PRIMARY KEY,
  Usuario_Usuario VARCHAR(100) NOT NULL UNIQUE,
  Usuario_Contraseña VARCHAR(255) NOT NULL,
  Usuario_Activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_ope_Persona (
  PersonaId INT AUTO_INCREMENT PRIMARY KEY,
  Persona_Nombre VARCHAR(100) NOT NULL,
  Persona_ApellidoPaterno VARCHAR(100) NOT NULL,
  Persona_ApellidoMaterno VARCHAR(100) NULL,
  Persona_UsuarioId INT NULL,
  Persona_CURP VARCHAR(18) NOT NULL UNIQUE,
  Persona_SexoId INT NOT NULL,
  Persona_edad INT NOT NULL,
  CONSTRAINT FK_Persona_Usuario FOREIGN KEY (Persona_UsuarioId) 
    REFERENCES tbl_ope_Usuario(UsuarioId) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT FK_Persona_Sexo FOREIGN KEY (Persona_SexoId) 
    REFERENCES tbl_cat_Sexo(SexoId) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_ope_Contacto (
  ContactoId INT AUTO_INCREMENT PRIMARY KEY,
  Contacto_Contacto VARCHAR(255) NOT NULL,
  Contacto_TipoContacto INT NOT NULL,
  CONSTRAINT FK_Contacto_TipoContacto FOREIGN KEY (Contacto_TipoContacto) 
    REFERENCES tbl_cat_TipoContacto(TipoContactoId) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_ope_Aspirante (
  AspiranteId INT AUTO_INCREMENT PRIMARY KEY,
  Aspirante_PersonaId INT NOT NULL,
  Aspirante_TipoAspiranteId INT NOT NULL,
  Aspirante_CarreraId INT NOT NULL,
  Aspirante_TurnoId INT NOT NULL,
  Aspirante_CicloEscolarInicioId INT NOT NULL,
  CONSTRAINT FK_Aspirante_Persona FOREIGN KEY (Aspirante_PersonaId) 
    REFERENCES tbl_ope_Persona(PersonaId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT FK_Aspirante_Tipo FOREIGN KEY (Aspirante_TipoAspiranteId) 
    REFERENCES tbl_cat_AspiranteTipo(AspiranteTipoId) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT FK_Aspirante_Carrera FOREIGN KEY (Aspirante_CarreraId) 
    REFERENCES tbl_cat_Carrera(CarreraId) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT FK_Aspirante_Turno FOREIGN KEY (Aspirante_TurnoId) 
    REFERENCES tbl_cat_Turno(TurnoId) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT FK_Aspirante_Ciclo FOREIGN KEY (Aspirante_CicloEscolarInicioId) 
    REFERENCES tbl_cat_CicloEscolar(CicloEscolarId) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_ope_Empresa (
  Empresaid INT AUTO_INCREMENT PRIMARY KEY,
  Empresa_TipoEmpresaid INT NOT NULL,
  Empresa_Empresa VARCHAR(150) NOT NULL,
  Empresa_Direccion VARCHAR(255) NOT NULL,
  Empresa_RazonSocial VARCHAR(255) NOT NULL,
  UsuarioId INT NOT NULL,
  Empresa_rfc VARCHAR(13) NOT NULL UNIQUE,
  CONSTRAINT FK_Empresa_Tipo FOREIGN KEY (Empresa_TipoEmpresaid) 
    REFERENCES tbl_cat_TipoEmpresa(TipoEmpresaid) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT FK_Empresa_Usuario FOREIGN KEY (UsuarioId) 
    REFERENCES tbl_ope_Usuario(UsuarioId) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_ope_Vacante (
  VacanteId INT AUTO_INCREMENT PRIMARY KEY,
  Vacante_Vacante VARCHAR(150) NOT NULL,
  Vacante_Vacantes INT NOT NULL,
  Vacante_TurnoId INT NOT NULL,
  Vacante_Salario DECIMAL(10,2) NOT NULL,
  Vacante_TipoVacanteId INT NOT NULL,
  Vacante_DuracionTipoId INT NOT NULL,
  Vacante_Observaciones TEXT NULL,
  Vacante_Activa TINYINT(1) NOT NULL DEFAULT 1,
  Vacante_CarreraTargetId INT NOT NULL,
  CONSTRAINT FK_Vacante_Turno FOREIGN KEY (Vacante_TurnoId) 
    REFERENCES tbl_cat_Turno(TurnoId) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT FK_Vacante_Tipo FOREIGN KEY (Vacante_TipoVacanteId) 
    REFERENCES tbl_cat_VacanteTipo(VacanteTipoId) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT FK_Vacante_Duracion FOREIGN KEY (Vacante_DuracionTipoId) 
    REFERENCES tbl_cat_DuracionTipo(DuracionTipoId) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT FK_Vacante_Carrera FOREIGN KEY (Vacante_CarreraTargetId) 
    REFERENCES tbl_cat_Carrera(CarreraId) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_rel_VacanteEmpresa (
  VacanteEmpresaid INT AUTO_INCREMENT PRIMARY KEY,
  VacanteEmpresa_EmpresaId INT NOT NULL,
  VacanteEmpresa_VacanteId INT NOT NULL,
  CONSTRAINT FK_VacanteEmpresa_Empresa FOREIGN KEY (VacanteEmpresa_EmpresaId) 
    REFERENCES tbl_ope_Empresa(Empresaid) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT UQ_VacanteEmpresa UNIQUE (VacanteEmpresa_EmpresaId, VacanteEmpresa_VacanteId),
  CONSTRAINT FK_VacanteEmpresa_Vacante FOREIGN KEY (VacanteEmpresa_VacanteId) 
    REFERENCES tbl_ope_Vacante(VacanteId) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_ope_Postulacion (
  PostulacionId INT AUTO_INCREMENT PRIMARY KEY,
  Postulacion_VacanteEmpresaid INT NOT NULL,
  Postulacion_AspiranteId INT NOT NULL,
  Postulacion_FechaPostulacion DATE NOT NULL,
  Postulacion_Activa TINYINT(1) NOT NULL DEFAULT 1,
  Postulacion_ResoulcionId INT NOT NULL,
  CONSTRAINT FK_Postulacion_VacanteEmpresa FOREIGN KEY (Postulacion_VacanteEmpresaid) 
    REFERENCES tbl_rel_VacanteEmpresa(VacanteEmpresaid) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT FK_Postulacion_Aspirante FOREIGN KEY (Postulacion_AspiranteId) 
    REFERENCES tbl_ope_Aspirante(AspiranteId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT FK_Postulacion_Resolucion FOREIGN KEY (Postulacion_ResoulcionId) 
    REFERENCES tbl_cat_Resolucion(ResolucionId) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================
-- TABLAS RELACIONALES (tbl_rel_*)
-- ====================================================

CREATE TABLE IF NOT EXISTS tbl_rel_RolUsuario (
  RolUsuarioId INT AUTO_INCREMENT PRIMARY KEY,
  RolUsuario_UsuarioId INT NOT NULL,
  RolUsuario_RolId INT NOT NULL,
  CONSTRAINT FK_RolUsuario_Usuario FOREIGN KEY (RolUsuario_UsuarioId) 
    REFERENCES tbl_ope_Usuario(UsuarioId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT UQ_RolUsuario UNIQUE (RolUsuario_UsuarioId, RolUsuario_RolId),
  CONSTRAINT FK_RolUsuario_Rol FOREIGN KEY (RolUsuario_RolId) 
    REFERENCES tbl_cat_Rol(RolId) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_rel_PersonaContacto (
  PersonaContactoId INT AUTO_INCREMENT PRIMARY KEY,
  PersonaContacto_PersonaId INT NOT NULL,
  PersonaContacto_ContactoId INT NOT NULL,
  CONSTRAINT FK_PersonaContacto_Persona FOREIGN KEY (PersonaContacto_PersonaId) 
    REFERENCES tbl_ope_Persona(PersonaId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT UQ_PersonaContacto UNIQUE (PersonaContacto_PersonaId, PersonaContacto_ContactoId),
  CONSTRAINT FK_PersonaContacto_Contacto FOREIGN KEY (PersonaContacto_ContactoId) 
    REFERENCES tbl_ope_Contacto(ContactoId) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tbl_rel_EmpresaContacto (
  EmpresaContactoId INT AUTO_INCREMENT PRIMARY KEY,
  EmpresaContacto_EmpresaId INT NOT NULL,
  EmpresaContacto_ContactoId INT NOT NULL,
  CONSTRAINT FK_EmpresaContacto_Empresa FOREIGN KEY (EmpresaContacto_EmpresaId) 
    REFERENCES tbl_ope_Empresa(Empresaid) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT UQ_EmpresaContacto UNIQUE (EmpresaContacto_EmpresaId, EmpresaContacto_ContactoId),
  CONSTRAINT FK_EmpresaContacto_Contacto FOREIGN KEY (EmpresaContacto_ContactoId) 
    REFERENCES tbl_ope_Contacto(ContactoId) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
