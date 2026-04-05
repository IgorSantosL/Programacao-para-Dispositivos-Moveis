import { User } from '../types';

interface SignInResponse {
  success: boolean;
  message?: string;
  user?: User;
}

/**
 * Serviço simulado de autenticação.
 * Aqui não existe API real ainda.
 * Estamos apenas fingindo um login válido.
 */
export async function fakeSignIn(
  login: string,
  password: string
): Promise<SignInResponse> {
  // Simula um pequeno delay, como se fosse uma chamada real de rede
  await new Promise((resolve) => setTimeout(resolve, 800));

  const validUsers = [
    {
      id: 1,
      name: 'Administrador Scholar',
      email: 'admin@appscholar.com',
      password: '123456',
    },
    {
      id: 2,
      name: 'Aluno Teste',
      email: 'aluno@appscholar.com',
      password: '123456',
    },
  ];

  const foundUser = validUsers.find(
    (user) =>
      (user.email.toLowerCase() === login.toLowerCase() ||
        user.name.toLowerCase() === login.toLowerCase()) &&
      user.password === password
  );

  if (!foundUser) {
    return {
      success: false,
      message: 'Login ou senha inválidos.',
    };
  }

  return {
    success: true,
    user: {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
    },
  };
}