/**
 * Serviço mockado de CEP.
 * Como ainda não temos integração externa,
 * usamos um pequeno mapa local de CEPs simulados.
 */

interface AddressResponse {
  address: string;
  city: string;
  state: string;
}

const mockCepDatabase: Record<string, AddressResponse> = {
  '12246000': {
    address: 'Av. São João, 1000',
    city: 'São José dos Campos',
    state: 'SP',
  },
  '12300000': {
    address: 'Rua das Palmeiras, 250',
    city: 'Jacareí',
    state: 'SP',
  },
  '01001000': {
    address: 'Praça da Sé',
    city: 'São Paulo',
    state: 'SP',
  },
};

export async function getAddressByCep(
  cep: string
): Promise<AddressResponse | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return mockCepDatabase[cep] || null;
}