import { loginRequest } from './api';
import { User } from '../types';

interface SignInResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

export async function signInRequest(
  login: string,
  password: string
): Promise<SignInResponse> {
  try {
    const response = await loginRequest(login, password);

    return {
      success: true,
      token: response.token,
      user: {
        id: response.usuario.id,
        name: response.usuario.nome,
        email: response.usuario.email,
        profile: response.usuario.perfil,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Não foi possível autenticar no backend.',
    };
  }
}
