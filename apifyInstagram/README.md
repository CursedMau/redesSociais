# Instagram Apify Google Sheets

Script em Google Apps Script para automatizar a coleta de dados de perfis do Instagram usando Apify e preencher uma planilha Google Sheets.

## O que o script faz

- Lê perfis do Instagram informados na planilha por `@usuario` ou link.
- Busca dados do perfil pela Apify.
- Preenche foto, nome, e-mail da bio, tier, link do perfil, seguidores, engajamento e média de views dos últimos 5 Reels.
- Ignora publicações fixadas no cálculo quando o dado estiver disponível.
- Cria menu personalizado `Instagram` na planilha.
- Permite configurar token da Apify, preparar cabeçalho e criar gatilho automático.

## Colunas configuradas

O script começa na linha `11` e usa as seguintes colunas por padrão:

| Campo | Coluna |
|---|---|
| Foto | C |
| Nome | D |
| E-mail Bio | F |
| Tier | K |
| Link do Perfil | N |
| Seguidores | O |
| Engajamento | P |
| Média Views 5 Reels | Q |

A coluna de entrada do Instagram é detectada pelo cabeçalho. Caso não encontre, usa a coluna `M`.

## Como usar no Google Sheets

1. Abra sua planilha no Google Sheets.
2. Vá em **Extensões > Apps Script**.
3. Cole o conteúdo do arquivo `instagram-apify-google-sheets.js`.
4. Salve o projeto.
5. Recarregue a planilha.
6. No menu `Instagram`, clique em **Configurar token Apify**.
7. Depois clique em **Preparar cabeçalho**.
8. Para automatizar ao editar, clique em **Criar gatilho automático**.

## Actors usados na Apify

- `apify~instagram-profile-scraper`
- `apify~instagram-reel-scraper`

## Observação

Este script depende de um token válido da Apify salvo nas propriedades do projeto pelo menu `Configurar token Apify`.
