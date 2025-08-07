# Guia de Contribuição

Obrigado por considerar contribuir para o Advanced Patch Generator! Este documento fornece diretrizes para contribuições.

## 🚀 Como Contribuir

### 1. Configuração do Ambiente

1. **Fork o repositório**
2. **Clone seu fork:**
   ```bash
   git clone https://github.com/seu-usuario/advanced-patch-generator.git
   cd advanced-patch-generator
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Instale o Xdelta3:**
   - **Windows:** `choco install xdelta3` ou `scoop install xdelta3`
   - **Linux:** `sudo apt-get install xdelta3`
   - **macOS:** `brew install xdelta3`

### 2. Desenvolvimento

1. **Crie uma branch para sua feature:**
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

2. **Faça suas alterações**

3. **Execute os testes:**
   ```bash
   npm test
   ```

4. **Verifique o linting:**
   ```bash
   npm run lint
   ```

5. **Commit suas mudanças:**
   ```bash
   git commit -m 'feat: adiciona nova funcionalidade'
   ```

6. **Push para sua branch:**
   ```bash
   git push origin feature/nova-funcionalidade
   ```

### 3. Pull Request

1. **Abra um Pull Request** no GitHub
2. **Descreva suas mudanças** claramente
3. **Inclua testes** se aplicável
4. **Atualize a documentação** se necessário

## 📋 Diretrizes de Código

### Convenções de Commit

Use o formato [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação de código
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de manutenção

### Padrões de Código

- **Indentação:** 2 espaços
- **Aspas:** Simples (`'`)
- **Ponto e vírgula:** Sempre
- **Comprimento de linha:** Máximo 80 caracteres
- **Nomes de variáveis:** camelCase
- **Nomes de classes:** PascalCase

### Documentação

- **JSDoc:** Use para documentar funções públicas
- **README:** Atualize quando adicionar novas funcionalidades
- **Exemplos:** Inclua exemplos de uso

### Testes

- **Cobertura:** Mantenha alta cobertura de testes
- **Casos de teste:** Inclua casos positivos e negativos
- **Testes de integração:** Para funcionalidades complexas

## 🐛 Reportando Bugs

### Antes de Reportar

1. **Verifique se já foi reportado**
2. **Teste com a versão mais recente**
3. **Reproduza o problema**

### Informações Necessárias

- **Versão do Node.js**
- **Sistema operacional**
- **Versão do Xdelta3**
- **Passos para reproduzir**
- **Comportamento esperado vs. atual**
- **Logs de erro** (se aplicável)

## 💡 Sugerindo Melhorias

### Antes de Sugerir

1. **Verifique se já foi sugerido**
2. **Pesquise alternativas existentes**
3. **Considere o impacto**

### Informações Necessárias

- **Descrição clara da melhoria**
- **Casos de uso**
- **Benefícios esperados**
- **Possíveis desvantagens**

## 🏷️ Versões

### Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR:** Mudanças incompatíveis
- **MINOR:** Novas funcionalidades compatíveis
- **PATCH:** Correções compatíveis

### Changelog

- **Mantenha o CHANGELOG.md atualizado**
- **Use o formato Keep a Changelog**
- **Inclua todas as mudanças relevantes**

## 🤝 Comunicação

### Canais

- **Issues:** Para bugs e melhorias
- **Discussions:** Para discussões gerais
- **Pull Requests:** Para contribuições

### Código de Conduta

- **Seja respeitoso**
- **Mantenha o foco no projeto**
- **Ajude outros contribuidores**

## 📚 Recursos Úteis

### Documentação

- [Node.js](https://nodejs.org/docs/)
- [Xdelta3](https://github.com/jmacd/xdelta)
- [ESLint](https://eslint.org/docs/)

### Ferramentas

- **ESLint:** Para linting
- **JSDoc:** Para documentação
- **GitHub Actions:** Para CI/CD

## 🎯 Áreas de Contribuição

### Prioridades

1. **Correções de bugs**
2. **Melhorias de performance**
3. **Novas funcionalidades**
4. **Documentação**
5. **Testes**

### Ideias de Melhorias

- **Suporte a mais formatos de patch**
- **Interface gráfica**
- **Integração com CI/CD**
- **Plugins para editores**
- **API REST**

## 📞 Suporte

Se você tiver dúvidas sobre contribuição:

- **Abra uma issue** para discussão
- **Use o template de issue** apropriado
- **Seja específico** sobre sua dúvida

## 🙏 Agradecimentos

Obrigado por contribuir para tornar o Advanced Patch Generator melhor para todos!
