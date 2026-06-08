import React, { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../styles/colors';
import { getApiBaseUrl } from '../services/api';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ login: '', password: '' });

  async function handleLogin() {
    const errors = { login: '', password: '' };
    let hasError = false;
    if (!login.trim()) { errors.login = 'Informe o login ou email.'; hasError = true; }
    if (!password.trim()) { errors.password = 'Informe a senha.'; hasError = true; }
    setFieldErrors(errors);
    setGeneralError('');
    if (hasError) {
      setGeneralError('Preencha os campos obrigatórios.');
      return;
    }
    const response = await signIn(login.trim(), password.trim());
    if (!response.success) {
      setGeneralError(`${response.message || 'Falha no login.'} Verifique também a URL da API.`);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.badge}>FATEC • App Scholar</Text>
        <Text style={styles.heroTitle}>Gestão acadêmica completa no celular</Text>
        <Text style={styles.heroSubtitle}>Administrador, professor e aluno acessam o sistema com perfis diferentes e permissões específicas.</Text>
      </View>

      <View style={styles.card}>
        <SectionTitle title="Entrar" subtitle="O administrador cria o acesso de professores e alunos durante o cadastro." />

        <AppInput label="Login ou Email" placeholder="Ex.: admin@appscholar.com" value={login} onChangeText={(text) => { setLogin(text); if (fieldErrors.login) setFieldErrors((prev) => ({ ...prev, login: '' })); }} error={fieldErrors.login} autoCapitalize="none" />
        <AppInput label="Senha" placeholder="Digite sua senha" value={password} onChangeText={(text) => { setPassword(text); if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' })); }} error={fieldErrors.password} secureTextEntry autoCapitalize="none" />
        {generalError ? <Text style={styles.error}>{generalError}</Text> : null}
        <AppButton title="Entrar no sistema" onPress={handleLogin} loading={isLoading} />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Usuários padrão do seed</Text>
          <Text style={styles.infoText}>Admin: admin@appscholar.com / 123456</Text>
          <Text style={styles.infoText}>Professor: prof.mobile@appscholar.com / 123456</Text>
          <Text style={styles.infoText}>Aluno: maria.souza@appscholar.com / 123456</Text>
        </View>

        <View style={styles.apiBox}>
          <Text style={styles.apiTitle}>URL atual da API</Text>
          <Text style={styles.apiText}>{getApiBaseUrl()}</Text>
          <Text style={styles.apiHint} onPress={() => Linking.openURL('https://docs.expo.dev/guides/environment-variables/')}>Se estiver no celular, configure EXPO_PUBLIC_API_URL com o IP do seu computador.</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.primary, borderRadius: 26, padding: 24, marginBottom: 18 },
  badge: { color: '#FFEAEA', fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  heroTitle: { color: '#FFFFFF', fontSize: 30, lineHeight: 36, fontWeight: '900', marginBottom: 10 },
  heroSubtitle: { color: '#FFEAEA', fontSize: 15, lineHeight: 22 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: colors.border },
  error: { color: colors.danger, marginBottom: 12, fontSize: 14, fontWeight: '700' },
  infoBox: { marginTop: 16, padding: 14, borderRadius: 16, backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#F3C1C1' },
  infoTitle: { color: colors.primaryDark, fontWeight: '800', marginBottom: 6 },
  infoText: { color: colors.textLight, marginBottom: 2 },
  apiBox: { marginTop: 16, padding: 14, borderRadius: 16, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
  apiTitle: { fontWeight: '800', color: colors.text, marginBottom: 6 },
  apiText: { color: colors.primaryDark, fontSize: 13, marginBottom: 6 },
  apiHint: { color: colors.textLight, fontSize: 12, lineHeight: 18 },
});
