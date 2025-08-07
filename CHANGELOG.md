# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- Configuração completa para publicação no NPM
- GitHub Actions para CI/CD
- ESLint para qualidade de código
- Documentação completa da API
- Guia de contribuição
- Arquivo CHANGELOG

### Changed
- Melhorado o README com documentação mais completa
- Adicionadas badges do NPM e GitHub Actions
- Estruturado o projeto para publicação

## [1.0.0] - 2024-01-01

### Added
- Criação de patches usando Xdelta3
- Aplicação de patches com verificação
- Processamento em lote de arquivos
- Métricas detalhadas de compressão
- Verificação de integridade de patches
- Suporte multiplataforma (Windows, Linux, macOS)
- Interface simples e intuitiva
- Documentação básica

### Features
- `createPatch()` - Cria patches entre arquivos
- `applyPatch()` - Aplica patches a arquivos
- `verifyPatch()` - Verifica integridade de patches
- `createBatchPatches()` - Cria patches em lote
- `applyBatchPatches()` - Aplica patches em lote
- `checkXdelta()` - Verifica disponibilidade do Xdelta3

### Technical
- Suporte a ES modules
- Dependência fs-extra para operações de arquivo
- Tratamento de erros robusto
- Progresso em tempo real
- Configurações personalizáveis
