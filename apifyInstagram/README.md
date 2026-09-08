# Instagram, Apify e Google Sheets

Automação em Google Apps Script para transformar um usuário ou link de perfil do Instagram em uma linha de dados para curadoria de influenciadores.

## Funcionalidades implementadas

- Leitura de `@usuario`, nome de usuário ou link do perfil.
- Detecção da coluna de entrada pelo cabeçalho, com a coluna M como alternativa.
- Consulta de dados do perfil e Reels usando dois actors da Apify.
- Preenchimento de foto dentro da célula, nome, e-mail encontrado na bio, tier, link, seguidores e métricas.
- Menu `Instagram` para configurar token, preparar cabeçalho, criar gatilho, atualizar a linha inicial e preencher linhas vazias em lote.
- Gatilho instalável para processar edições, inclusive intervalos com mais de uma linha.
- Registro da data na coluna H quando um status é alterado na coluna G, a partir da linha inicial.
- Indicação de entrada inválida, falta de dados, erro de API ou ausência de foto.

## Tecnologias

JavaScript, Google Apps Script, Google Sheets, Apify, HTTP e JSON.

## Requisitos

- Uma planilha Google Sheets com projeto Apps Script vinculado.
- Token válido da Apify e condições de uso dos actors na conta utilizada.
- Autorização das permissões solicitadas pelo Apps Script.

## Configuração da planilha

A configuração inicial usa o cabeçalho na **linha 10** e os perfis a partir da **linha 11**. Ajuste `CONFIG.startRow` se necessário.

| Campo | Coluna padrão |
| --- | --- |
| Foto | C |
| Nome | D |
| E-mail da bio | F |
| Status — entrada manual | G |
| Data do status | H |
| Tier | K |
| Instagram — entrada detectada pelo cabeçalho | M, se não houver correspondência |
| Link do perfil | N |
| Seguidores | O |
| Engajamento estimado | P |
| Média de visualizações de até 5 Reels elegíveis | Q |

A detecção por cabeçalho é aplicada à coluna de entrada do Instagram. As colunas de saída seguem `CONFIG.cols`; status e data estão definidos na função `onEdit`.

## Instalação e primeira execução

1. Abra uma planilha de demonstração e acesse **Extensões > Apps Script**.
2. Cole o conteúdo de [instagram-apify-google-sheets.js](instagram-apify-google-sheets.js) no editor e salve.
3. Recarregue a planilha para exibir o menu **Instagram**.
4. Selecione **Configurar token Apify** e informe seu token.
5. Selecione **Preparar cabeçalho**. Essa ação escreve os títulos nas colunas configuradas e aplica a formatação de tier.
6. Preencha a linha 11 na coluna de entrada com um perfil válido que você queira consultar.
7. Execute **Atualizar linha inicial** e conceda as autorizações solicitadas.
8. Confira os dados. Para processar futuras edições, execute **Criar gatilho automático**.

**Atualizar tudo** percorre as linhas a partir de `CONFIG.startRow`, mas pula uma linha se encontrar qualquer valor em um dos campos de saída. Para atualizar a linha inicial mesmo preenchida, use **Atualizar linha inicial**. Uma edição da entrada também solicita a consulta quando o gatilho está instalado.

## Como as métricas são calculadas

### Engajamento

`(média de curtidas + média de comentários) / seguidores`

O valor é exibido como percentual. A amostra vem das publicações retornadas no objeto do perfil. Publicações marcadas como fixadas são excluídas quando essa informação está presente. Sem seguidores ou sem publicações elegíveis, o resultado fica vazio.

É uma estimativa sobre a amostra retornada; não equivale aos dados privados de alcance ou engajamento do Instagram Insights.

### Visualizações

O actor de Reels é solicitado com `resultsLimit: 5` e `skipPinnedPosts: true`. O processamento local remove itens identificados como fixados e itens sem visualizações positivas, ordena pela data disponível e calcula a média de até 5 itens. O resultado é arredondado para baixo.

A amostra pode conter menos de 5 itens. O código admite diferentes nomes de campos e aplica heurísticas para identificar vídeos; por isso, a classificação e a cobertura dependem da resposta do actor.

### Tier

| Seguidores | Classificação automática |
| --- | --- |
| 1 a 10.000 | NANO |
| 10.001 a 99.999 | MICRO |
| 100.000 a 999.999 | MEZZO |
| 1.000.000 a 4.999.999 | MACRO |
| A partir de 5.000.000 | MEGA |

`CELEBRITY` também está disponível no menu suspenso, mas não é atribuída automaticamente pela função `calcularTier`.

## Integração e configuração do token

Actors configurados:

- `apify~instagram-profile-scraper` — dados de perfil.
- `apify~instagram-reel-scraper` — dados dos vídeos.

O token é armazenado em `Script Properties`, na chave `APIFY_TOKEN`, e enviado no cabeçalho `Authorization: Bearer`. Essa configuração pertence ao projeto Apps Script; não é uma configuração individual por usuário.

Uma consulta de perfil bem-sucedida é seguida de uma consulta de Reels. O consumo e os resultados dependem dos actors e da conta Apify. O código inclui um intervalo de 1 segundo entre linhas, além do tempo das requisições.

## Diagnóstico

| Indicação | O que conferir |
| --- | --- |
| INVÁLIDO | Formato da entrada; links de posts ou Reels não são entradas de perfil aceitas. |
| SEM DADOS | O actor de perfil não retornou um objeto de dados utilizável. |
| ERRO API | Token, resposta da Apify e detalhes nas execuções do Apps Script. |
| SEM FOTO | Ausência da URL de imagem ou falha ao inserir a foto na célula. |
| Linha ignorada em Atualizar tudo | Existência de algum valor nos campos de saída. |

## Limites atuais e validação

A documentação foi conferida contra o código do repositório. A execução integrada requer uma planilha autorizada e uma conta Apify; não foi realizada uma nova coleta ao preparar esta documentação.

A versão atual ainda não possui testes automatizados, cache, retentativas com espera progressiva ou seleção de token por usuário. Atualizações grandes também dependem dos limites de execução do Apps Script.

[Voltar à apresentação do repositório](../README.md)
