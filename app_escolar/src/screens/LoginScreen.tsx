import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../styles/colors';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    login: '',
    password: '',
  });

  async function handleLogin() {
    const errors = {
      login: '',
      password: '',
    };

    let hasError = false;

    if (!login.trim()) {
      errors.login = 'Informe o login ou email.';
      hasError = true;
    }

    if (!password.trim()) {
      errors.password = 'Informe a senha.';
      hasError = true;
    }

    setFieldErrors(errors);
    setGeneralError('');

    if (hasError) {
      setGeneralError('Preencha os campos obrigatórios.');
      return;
    }

    const response = await signIn(login.trim(), password);

    if (!response.success) {
      setGeneralError(response.message || 'Falha no login.');
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.topSpace} />

      <SectionTitle
        title="App Scholar"
        subtitle="Gerenciamento acadêmico mobile com login, cadastros e consulta de boletim."
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Entrar</Text>

        <AppInput
          label="Login ou Email"
          placeholder="Digite seu login ou email"
          value={login}
          onChangeText={(text) => {
            setLogin(text);
            if (fieldErrors.login) {
              setFieldErrors((prev) => ({ ...prev, login: '' }));
            }
          }}
          error={fieldErrors.login}
          autoCapitalize="none"
        />

        <AppInput
          label="Senha"
          placeholder="Digite sua senha"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: '' }));
            }
          }}
          error={fieldErrors.password}
          secureTextEntry
          autoCapitalize="none"
        />

        {generalError ? <Text style={styles.error}>{generalError}</Text> : null}

        <AppButton
          title="Entrar"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.button}
        />

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Credenciais simuladas</Text>
          <Text style={styles.demoText}>Email: admin@appscholar.com</Text>
          <Text style={styles.demoText}>Senha: 123456</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topSpace: {
    height: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 18,
  },
  button: {
    marginTop: 8,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  demoBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  demoTitle: {
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 6,
  },
  demoText: {
    color: colors.textLight,
  },
});