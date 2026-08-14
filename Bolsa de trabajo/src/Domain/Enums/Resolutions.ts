export enum ResolutionName {
  UNDER_REVIEW = 'En revisión',
  ROUTED = 'Canalizado a Empresa',
  INTERVIEW = 'Apto para entrevista',
  TECHNICAL_TEST = 'Pruebas técnicas',
  REJECTED = 'Descartado',
  HIRED = 'Contratado',
}

export const FINAL_RESOLUTIONS: string[] = [ResolutionName.REJECTED, ResolutionName.HIRED];
