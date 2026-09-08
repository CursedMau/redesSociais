# Automação de curadoria de influenciadores

Projeto em JavaScript e Google Apps Script para consultar dados do Instagram com a Apify e organizar os resultados no Google Sheets.

A proposta é reduzir a coleta manual de informações usadas na seleção de creators e padronizar o preenchimento da planilha.

## Módulo disponível

| Módulo | Recursos | Acesso |
| --- | --- | --- |
| Instagram | Dados de perfil, foto na célula, seguidores, tier, engajamento estimado e média de visualizações de até 5 Reels elegíveis | [Documentação](apifyInstagram/README.md) · [Código](apifyInstagram/instagram-apify-google-sheets.js) |

## Competências demonstradas

- Consumo de APIs HTTP com autenticação e leitura de JSON.
- Normalização de nomes, usuários e campos retornados pela API.
- Cálculo de métricas e classificação de perfis.
- Automação de planilhas com menu e gatilho de edição.
- Tratamento de entradas inválidas, ausência de dados e falhas de requisição.

## Como começar

Abra o [guia de instalação do Instagram](apifyInstagram/README.md). Ele apresenta os requisitos, as colunas utilizadas e as regras dos cálculos.

## Escopo atual

O código disponível é executado no Google Apps Script, vinculado a uma planilha. A coleta depende do retorno da Apify e da configuração feita por quem utiliza o projeto.

A atualização em lote preenche linhas com os campos de saída vazios; ela não força a renovação de linhas já preenchidas.

## Evolução proposta

- Permitir escolher entre preencher campos vazios e atualizar dados existentes.
- Adicionar atualização manual das linhas selecionadas.
- Criar exemplos de entrada e saída com dados fictícios.
- Separar regras de cálculo para facilitar testes.
- Adicionar módulos de outras redes sociais quando houver implementação.

Os itens acima são próximos passos, ainda não implementados neste repositório.
