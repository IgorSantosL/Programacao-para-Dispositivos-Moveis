import { ExternalState } from '../types';
import { apiRequest } from './api';

interface AddressResponse {
  address: string;
  city: string;
  state: string;
}

export async function getAddressByCep(cep: string): Promise<AddressResponse | null> {
  try {
    const response = await apiRequest<{
      cep: string;
      endereco: string;
      cidade: string;
      estado: string;
    }>(`/external/cep/${cep}`);

    return {
      address: response.endereco,
      city: response.cidade,
      state: response.estado,
    };
  } catch {
    return null;
  }
}

export async function getStates() {
  return apiRequest<ExternalState[]>('/external/estados');
}

export async function getCitiesByState(uf: string) {
  return apiRequest<string[]>(`/external/cidades/${uf}`);
}
