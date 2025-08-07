# 🔧 Guia de Resolução de Problemas

Este guia ajuda a resolver problemas comuns encontrados ao usar o Advanced Patch Generator.

## ❌ Erro: "Xdelta3 não encontrado no sistema"

### Problema
```
❌ Xdelta3 não encontrado no sistema.
```

### Causa
O Xdelta3 não está instalado ou não está no PATH do sistema.

### Solução

#### 1. Instalação Automática (Recomendado)
```bash
npm run install:xdelta3
```

#### 2. Instalação Manual

**Windows:**
```bash
# Usando Chocolatey
choco install xdelta3

# Usando Scoop
scoop install xdelta3

# Usando Winget
winget install xdelta3
```

**Linux:**
```bash
sudo apt-get install xdelta3
# ou
sudo yum install xdelta3
```

**macOS:**
```bash
brew install xdelta3
```

#### 3. Download Manual
1. Acesse: https://github.com/jmacd/xdelta/releases
2. Baixe a versão mais recente para seu sistema
3. Extraia o arquivo `xdelta3.exe` (Windows) ou `xdelta3` (Linux/macOS)
4. Coloque em uma pasta no PATH do sistema

### Verificação
Após a instalação, execute:
```bash
xdelta3.exe -h  # Windows
xdelta3 -h       # Linux/macOS
```

## ❌ Erro: "Arquivo não encontrado"

### Problema
```
❌ Arquivo não encontrado: files/old/exemplo.txt
```

### Causa
Os arquivos de teste não existem nos diretórios esperados.

### Solução
1. Crie os diretórios necessários:
   ```bash
   mkdir -p files/old files/new files/patches files/applyPatches
   ```

2. Coloque arquivos para teste:
   - Arquivo original em `files/old/`
   - Arquivo atualizado em `files/new/`

3. Execute o teste novamente:
   ```bash
   npm test
   ```

## ❌ Erro: "Permissão negada"

### Problema
```
❌ Erro: EACCES: permission denied
```

### Causa
Falta de permissões para ler/escrever arquivos.

### Solução

**Windows:**
- Execute o PowerShell como administrador
- Verifique as permissões da pasta

**Linux/macOS:**
```bash
sudo chmod +x xdelta3
sudo chown $USER:$USER files/
```

## ❌ Erro: "Comando não reconhecido"

### Problema
```
❌ 'xdelta3' não é reconhecido como um comando interno ou externo
```

### Causa
O Xdelta3 não está no PATH do sistema.

### Solução

**Windows:**
1. Abra as Configurações do Sistema
2. Variáveis de Ambiente
3. Edite a variável PATH
4. Adicione o caminho da pasta onde está o `xdelta3.exe`

**Linux/macOS:**
```bash
export PATH=$PATH:/caminho/para/xdelta3
```

## ❌ Erro: "Falha na verificação de integridade"

### Problema
```
❌ Patch é inválido!
```

### Causa
- Arquivos corrompidos
- Problemas na criação do patch
- Arquivos muito diferentes

### Solução
1. Verifique se os arquivos não estão corrompidos
2. Tente com arquivos menores
3. Verifique se os arquivos são realmente diferentes
4. Use um nível de compressão menor

## ❌ Erro: "Memória insuficiente"

### Problema
```
❌ Erro: JavaScript heap out of memory
```

### Causa
Arquivos muito grandes para a memória disponível.

### Solução
1. Aumente a memória do Node.js:
   ```bash
   node --max-old-space-size=4096 test.js
   ```

2. Processe arquivos menores
3. Use processamento em lote para arquivos grandes

## ❌ Erro: "Timeout na execução"

### Problema
```
❌ Erro: Command timed out
```

### Causa
Arquivos muito grandes ou sistema lento.

### Solução
1. Aumente o timeout:
   ```javascript
   const patchGen = new AdvancedPatchGenerator({
     timeout: 300000 // 5 minutos
   });
   ```

2. Use arquivos menores para teste
3. Verifique a performance do sistema

## 🔍 Diagnóstico

### Verificar Instalação
```bash
# Verificar se o Xdelta3 está instalado
xdelta3.exe -h  # Windows
xdelta3 -h       # Linux/macOS

# Verificar versão do Node.js
node --version

# Verificar dependências
npm list
```

### Verificar Estrutura do Projeto
```bash
# Verificar se todos os arquivos estão presentes
ls -la src/
ls -la files/
```

### Logs Detalhados
Para obter mais informações sobre erros, execute:
```bash
DEBUG=* npm test
```

## 📞 Suporte

Se você ainda estiver enfrentando problemas:

1. **Verifique a documentação**: Leia o README.md completo
2. **Consulte os exemplos**: Veja `examples/usage-examples.js`
3. **Abra uma issue**: Descreva o problema detalhadamente
4. **Forneça logs**: Inclua mensagens de erro completas

### Informações Úteis para Issues
- Sistema operacional e versão
- Versão do Node.js
- Versão do Xdelta3
- Comando executado
- Log de erro completo
- Passos para reproduzir o problema
