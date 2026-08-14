import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const roles = [
  { id: 1, nombre: 'Aspirante' },
  { id: 2, nombre: 'Empresa' },
  { id: 3, nombre: 'Vinculacion' },
  { id: 4, nombre: 'Control Escolar' },
];

const sexos = [
  { id: 1, nombre: 'Masculino' },
  { id: 2, nombre: 'Femenino' },
  { id: 3, nombre: 'Otro' },
];

const turnos = [
  { id: 1, nombre: 'Matutino', letra: 'M' },
  { id: 2, nombre: 'Vespertino', letra: 'V' },
  { id: 3, nombre: 'Mixto', letra: 'X' },
];

const tiposContacto = [
  { id: 1, nombre: 'Teléfono' },
  { id: 2, nombre: 'Correo Electrónico' },
  { id: 3, nombre: 'LinkedIn' },
];

const resoluciones = [
  { id: 1, nombre: 'En revisión' },
  { id: 2, nombre: 'Canalizado a Empresa' },
  { id: 3, nombre: 'Apto para entrevista' },
  { id: 4, nombre: 'Pruebas técnicas' },
  { id: 5, nombre: 'Descartado' },
  { id: 6, nombre: 'Contratado' },
];

const tiposAspirante = [
  { id: 1, nombre: 'Estudiante' },
  { id: 2, nombre: 'Egresado' },
];

const carreras = [
  'Administración de Empresas',
  'Administración de Empresas Turísticas',
  'Relaciones Internacionales',
  'Contaduría Pública y Finanzas',
  'Derecho',
  'Mercadotecnia y Publicidad',
  'Gastronomía',
  'Periodismo y Ciencias de la Comunicación',
  'Diseño de Modas',
  'Pedagogía',
  'Cultura Física y Educación del Deporte',
  'Idiomas (Inglés y Francés)',
  'Psicología',
  'Diseño de Interiores',
  'Diseño Gráfico',
  'Ingeniería en Logística y Transporte',
  'Ingeniero Arquitecto',
  'Informática Administrativa y Fiscal',
  'Ingeniería en Sistemas Computacionales',
  'Ingeniería Mecánica Automotriz',
];

const tiposEmpresa = [
  { id: 1, nombre: 'Privada' },
  { id: 2, nombre: 'Pública' },
  { id: 3, nombre: 'Organización civil' },
];

/**
 * Los ciclos escolares se manejan como generaciones de cuatro años
 * (2023-2027, 2024-2028, ...). Se genera el rango completo para que los
 * egresados también puedan seleccionar la generación en la que ingresaron.
 */
const CICLO_PRIMER_ANIO = 2018;
const CICLO_DURACION_ANIOS = 4;

function buildCiclosEscolares(
  primerAnio = CICLO_PRIMER_ANIO,
  ultimoAnio = new Date().getFullYear() + 1
) {
  const generaciones: { id: number; nombre: string }[] = [];

  for (let anio = primerAnio; anio <= ultimoAnio; anio += 1) {
    generaciones.push({
      id: generaciones.length + 1,
      nombre: `${anio}-${anio + CICLO_DURACION_ANIOS}`,
    });
  }

  return generaciones;
}

const ciclos = buildCiclosEscolares();

const tiposVacante = [
  { id: 1, nombre: 'Prácticas profesionales' },
  { id: 2, nombre: 'Servicio social' },
  { id: 3, nombre: 'Residencia profesional' },
  { id: 4, nombre: 'Empleo para egresados' },
];

const tiposDuracion = [
  { id: 1, nombre: 'Indefinido' },
  { id: 2, nombre: 'Temporal (3 meses)' },
  { id: 3, nombre: 'Temporal (6 meses)' },
  { id: 4, nombre: 'Temporal (12 meses)' },
];

async function seedCatalogs() {
  for (const item of roles) {
    await prisma.rol.upsert({
      where: { RolId: item.id },
      update: { Rol_Rol: item.nombre },
      create: { RolId: item.id, Rol_Rol: item.nombre },
    });
  }

  for (const item of sexos) {
    await prisma.sexo.upsert({
      where: { SexoId: item.id },
      update: { Sexo_Sexo: item.nombre },
      create: { SexoId: item.id, Sexo_Sexo: item.nombre },
    });
  }

  for (const item of turnos) {
    await prisma.turno.upsert({
      where: { TurnoId: item.id },
      update: { Turno_turno: item.nombre, Turno_letra: item.letra },
      create: { TurnoId: item.id, Turno_turno: item.nombre, Turno_letra: item.letra },
    });
  }

  for (const item of tiposContacto) {
    await prisma.tipoContacto.upsert({
      where: { TipoContactoId: item.id },
      update: { TipoContacto_TipoContacto: item.nombre },
      create: { TipoContactoId: item.id, TipoContacto_TipoContacto: item.nombre },
    });
  }

  for (const item of resoluciones) {
    await prisma.resolucion.upsert({
      where: { ResolucionId: item.id },
      update: { Resolucion_Resolucion: item.nombre },
      create: { ResolucionId: item.id, Resolucion_Resolucion: item.nombre },
    });
  }

  for (const item of tiposAspirante) {
    await prisma.aspiranteTipo.upsert({
      where: { AspiranteTipoId: item.id },
      update: { AspiranteTipo_AspiranteTipo: item.nombre },
      create: { AspiranteTipoId: item.id, AspiranteTipo_AspiranteTipo: item.nombre },
    });
  }

  for (let index = 0; index < carreras.length; index += 1) {
    const carreraId = index + 1;
    const nombre = carreras[index] as string;

    await prisma.carrera.upsert({
      where: { CarreraId: carreraId },
      update: { Carrera_Carrera: nombre, Carrera_Activa: true },
      create: {
        CarreraId: carreraId,
        Carrera_Carrera: nombre,
        Carrera_Activa: true,
        Carrera_CuatrimestreDuracion: 9,
      },
    });
  }

  for (const item of tiposEmpresa) {
    await prisma.tipoEmpresa.upsert({
      where: { TipoEmpresaId: item.id },
      update: { TipoEmpresa_TipoEmpresa: item.nombre },
      create: { TipoEmpresaId: item.id, TipoEmpresa_TipoEmpresa: item.nombre },
    });
  }

  for (const item of ciclos) {
    await prisma.cicloEscolar.upsert({
      where: { CicloEscolarId: item.id },
      update: { CicloEscolar_CicloEscolar: item.nombre },
      create: {
        CicloEscolarId: item.id,
        CicloEscolar_CicloEscolar: item.nombre,
        CicloEscolar_Activo: true,
      },
    });
  }

  for (const item of tiposVacante) {
    await prisma.vacanteTipo.upsert({
      where: { VacanteTipoId: item.id },
      update: { VacanteTipo_VacanteTipo: item.nombre },
      create: { VacanteTipoId: item.id, VacanteTipo_VacanteTipo: item.nombre },
    });
  }

  for (const item of tiposDuracion) {
    await prisma.duracionTipo.upsert({
      where: { DuracionTipoId: item.id },
      update: { DuracionTipo_DuracionTipo: item.nombre },
      create: { DuracionTipoId: item.id, DuracionTipo_DuracionTipo: item.nombre },
    });
  }
}

async function upsertUser(username: string, password: string, rolId: number, activo: boolean) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuario.upsert({
    where: { Usuario_Usuario: username },
    update: { Usuario_Contraseña: hashedPassword, Usuario_Activo: activo },
    create: {
      Usuario_Usuario: username,
      Usuario_Contraseña: hashedPassword,
      Usuario_Activo: activo,
    },
  });

  const link = await prisma.rolUsuario.findFirst({
    where: { RolUsuario_UsuarioId: usuario.UsuarioId, RolUsuario_RolId: rolId },
  });

  if (!link) {
    await prisma.rolUsuario.create({
      data: { RolUsuario_UsuarioId: usuario.UsuarioId, RolUsuario_RolId: rolId },
    });
  }

  return usuario;
}

async function seedAdmin() {
  const adminUser = process.env.SEED_ADMIN_USER || 'admin';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Tijuana123?';

  await upsertUser(adminUser, adminPassword, 3, true);

  return adminUser;
}

async function seedDemoData() {
  const demoPassword = process.env.SEED_DEMO_PASSWORD || 'Demo1234';
  // Generación que corresponde a un estudiante que sigue inscrito.
  const cicloVigenteId = ciclos[Math.max(ciclos.length - 3, 0)]!.id;

  if (process.env.SEED_DEMO_DATA === 'false') return;

  const empresaUser = await upsertUser('tech_corp', demoPassword, 2, true);

  const empresa = await prisma.empresa.upsert({
    where: { Empresa_rfc: 'TCO120405AB1' },
    update: {},
    create: {
      Empresa_Empresa: 'Tech Corp',
      Empresa_Direccion: 'Av. Principal 100, Ciudad de México',
      Empresa_RazonSocial: 'Tech Corp S.A. de C.V.',
      Empresa_rfc: 'TCO120405AB1',
      Empresa_TipoEmpresaId: 1,
      UsuarioId: empresaUser.UsuarioId,
    },
  });

  // Personal de Control Escolar: consulta expedientes y reportes.
  const controlEscolarUser = await upsertUser('control_escolar', demoPassword, 4, true);

  await prisma.persona.upsert({
    where: { Persona_CURP: 'LORA900101MDFPMN05' },
    update: {},
    create: {
      Persona_Nombre: 'Ana',
      Persona_ApellidoPaterno: 'López',
      Persona_ApellidoMaterno: 'Ramírez',
      Persona_CURP: 'LORA900101MDFPMN05',
      Persona_SexoId: 2,
      Persona_edad: 34,
      Persona_UsuarioId: controlEscolarUser.UsuarioId,
    },
  });

  const aspiranteUser = await upsertUser('juan_perez', demoPassword, 1, true);

  const persona = await prisma.persona.upsert({
    where: { Persona_CURP: 'PEGA900101HDFRRR01' },
    update: {},
    create: {
      Persona_Nombre: 'Juan',
      Persona_ApellidoPaterno: 'Pérez',
      Persona_ApellidoMaterno: 'García',
      Persona_CURP: 'PEGA900101HDFRRR01',
      Persona_SexoId: 1,
      Persona_edad: 22,
      Persona_UsuarioId: aspiranteUser.UsuarioId,
    },
  });

  const existingAspirante = await prisma.aspirante.findFirst({
    where: { Aspirante_PersonaId: persona.PersonaId },
  });

  if (!existingAspirante) {
    await prisma.aspirante.create({
      data: {
        Aspirante_PersonaId: persona.PersonaId,
        Aspirante_TipoAspiranteId: 1,
        Aspirante_CarreraId: 19,
        Aspirante_TurnoId: 1,
        Aspirante_CicloEscolarInicioId: cicloVigenteId,
      },
    });
  }

  const existingVacante = await prisma.vacante.findFirst({
    where: { Vacante_Vacante: 'Desarrollador Full Stack Junior' },
  });

  if (!existingVacante) {
    const vacante = await prisma.vacante.create({
      data: {
        Vacante_Vacante: 'Desarrollador Full Stack Junior',
        Vacante_Vacantes: 2,
        Vacante_TurnoId: 1,
        Vacante_Salario: 12000,
        Vacante_TipoVacanteId: 1,
        Vacante_DuracionTipoId: 3,
        Vacante_CarreraTargetId: 19,
        Vacante_Observaciones:
          'Prácticas profesionales. Requisitos: TypeScript, React y bases de datos relacionales. Horario matutino con apoyo económico.',
        Vacante_Activa: true,
      },
    });

    await prisma.vacanteEmpresa.create({
      data: {
        VacanteEmpresa_EmpresaId: empresa.EmpresaId,
        VacanteEmpresa_VacanteId: vacante.VacanteId,
      },
    });
  }
}

async function main() {
  await seedCatalogs();
  const adminUser = await seedAdmin();
  await seedDemoData();
  console.log(`Seed completado correctamente. Usuario administrador: ${adminUser}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
