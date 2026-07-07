const CONFIG = {
  startRow: 11,

  // Caso o cabeçalho ainda não exista, ele usa M como coluna padrão de Instagram
  inputColFallback: 13, // M

  cols: {
    foto: 3,         // C
    nome: 4,         // D
    emailBio: 6,     // F
    tier: 11,        // K
    linkPerfil: 14,  // N
    seguidores: 15,  // O
    engajamento: 16, // P
    mediaViews: 17   // Q
  },

  actorId: "apify~instagram-profile-scraper",
  reelsActorId: "apify~instagram-reel-scraper",
  requestDelayMs: 1000
};

/**
 * Menu da planilha.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Instagram")
    .addItem("Configurar token Apify", "configurarTokenApify")
    .addItem("Preparar cabeçalho", "prepararCabecalho")
    .addItem("Criar gatilho automático", "criarGatilhoAoEditar")
    .addSeparator()
    .addItem("Atualizar linha inicial", "testarLinhaInicial")
    .addItem("Atualizar tudo", "atualizarTudoInstagram")
    .addToUi();
}

/**
 * Salva o token da Apify.
 */
function configurarTokenApify() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.prompt(
    "Token da Apify",
    "Cole seu token da Apify aqui:",
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const token = response.getResponseText().trim();

  if (!token) {
    ui.alert("Token vazio. Nada foi salvo.");
    return;
  }

  PropertiesService.getScriptProperties().setProperty("APIFY_TOKEN", token);
  ui.alert("Token salvo com sucesso.");
}

/**
 * Atualiza data/hora quando muda o status na coluna G.
 */
function onEdit(e) {
  if (!e || !e.range) return;

  const aba = e.source.getActiveSheet();
  const linha = e.range.getRow();
  const coluna = e.range.getColumn();

  const COL_STATUS = 7; // G
  const COL_DATA = 8;   // H
  const TIMEZONE = "America/Sao_Paulo";

  if (linha < CONFIG.startRow) return;
  if (coluna !== COL_STATUS) return;

  const novoValor = e.range.getValue();
  const celulaData = aba.getRange(linha, COL_DATA);

  if (novoValor !== "") {
    const agora = Utilities.formatDate(new Date(), TIMEZONE, "dd/MM/yy");
    celulaData.setValue(agora);
  } else {
    celulaData.clearContent();
  }
}

/**
 * Prepara cabeçalho e menu suspenso do Tier.
 */
function prepararCabecalho() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headerRow = CONFIG.startRow - 1;
  const inputCol = detectarColunaInstagram(sheet);

  sheet.getRange(headerRow, CONFIG.cols.foto).setValue("FOTO");
  sheet.getRange(headerRow, CONFIG.cols.nome).setValue("NOME");
  sheet.getRange(headerRow, CONFIG.cols.emailBio).setValue("E-MAIL BIO");
  sheet.getRange(headerRow, CONFIG.cols.tier).setValue("TIER");
  sheet.getRange(headerRow, inputCol).setValue("INSTAGRAM / @");
  sheet.getRange(headerRow, CONFIG.cols.linkPerfil).setValue("LINK DO PERFIL");
  sheet.getRange(headerRow, CONFIG.cols.seguidores).setValue("SEGUIDORES");
  sheet.getRange(headerRow, CONFIG.cols.engajamento).setValue("ENGAJAMENTO");
  sheet.getRange(headerRow, CONFIG.cols.mediaViews).setValue("MÉDIA VIEWS 5 REELS");

  sheet.getRange(headerRow, 3, 1, 15)
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  sheet.setFrozenRows(headerRow);

  criarDropdownTier(sheet);
  aplicarCoresTier(sheet);

  SpreadsheetApp.getUi().alert("Cabeçalho e menu suspenso de Tier preparados.");
}

/**
 * Detecta automaticamente a coluna de Instagram pelo cabeçalho.
 */
function detectarColunaInstagram(sheet) {
  const headerRow = CONFIG.startRow - 1;
  const lastCol = Math.max(sheet.getLastColumn(), CONFIG.inputColFallback);
  const headers = sheet.getRange(headerRow, 1, 1, lastCol).getDisplayValues()[0];

  const candidatos = [
    "INSTAGRAM",
    "INSTAGRAM @",
    "INSTAGRAM LINK",
    "LINK INSTAGRAM",
    "LINK DO INSTAGRAM",
    "PERFIL",
    "PERFIL @",
    "PERFIL INSTAGRAM",
    "USUARIO INSTAGRAM",
    "USERNAME INSTAGRAM"
  ];

  for (let i = 0; i < headers.length; i++) {
    const header = normalizarTexto(headers[i]);

    if (candidatos.includes(header)) {
      return i + 1;
    }
  }

  return CONFIG.inputColFallback;
}

/**
 * Cria menu suspenso do Tier na coluna K.
 */
function criarDropdownTier(sheet) {
  const numRows = Math.max(sheet.getMaxRows() - CONFIG.startRow + 1, 1);

  const tierRange = sheet.getRange(
    CONFIG.startRow,
    CONFIG.cols.tier,
    numRows,
    1
  );

  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["NANO", "MICRO", "MEZZO", "MACRO", "MEGA", "CELEBRITY"], true)
    .setAllowInvalid(false)
    .build();

  tierRange.setDataValidation(rule);
}

/**
 * Aplica cores ao Tier.
 */
function aplicarCoresTier(sheet) {
  const numRows = Math.max(sheet.getMaxRows() - CONFIG.startRow + 1, 1);

  const range = sheet.getRange(
    CONFIG.startRow,
    CONFIG.cols.tier,
    numRows,
    1
  );

  const rules = sheet.getConditionalFormatRules();

  const novasRegras = [
    criarRegraCorTier(range, "NANO", "#F4CCCC"),
    criarRegraCorTier(range, "MICRO", "#FCE5CD"),
    criarRegraCorTier(range, "MEZZO", "#D9EAD3"),
    criarRegraCorTier(range, "MACRO", "#CFE2F3"),
    criarRegraCorTier(range, "MEGA", "#D9D2E9"),
    criarRegraCorTier(range, "CELEBRITY", "#FFF2CC")
  ];

  sheet.setConditionalFormatRules(rules.concat(novasRegras));
}

/**
 * Cria regra de cor para Tier.
 */
function criarRegraCorTier(range, texto, cor) {
  return SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(texto)
    .setBackground(cor)
    .setRanges([range])
    .build();
}

/**
 * Cria gatilho automático ao editar.
 */
function criarGatilhoAoEditar() {
  const triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === "aoEditarInstagram") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("aoEditarInstagram")
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();

  SpreadsheetApp.getUi().alert("Gatilho automático criado com sucesso.");
}

/**
 * Executa automaticamente ao editar a coluna detectada como Instagram.
 */
function aoEditarInstagram(e) {
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  const range = e.range;

  const firstRow = range.getRow();
  const lastRow = range.getLastRow();
  const firstCol = range.getColumn();
  const lastCol = range.getLastColumn();

  if (lastRow < CONFIG.startRow) return;

  const inputCol = detectarColunaInstagram(sheet);
  const editouColunaInstagram = firstCol <= inputCol && lastCol >= inputCol;

  if (!editouColunaInstagram) {
    const textoEditado = range.getDisplayValues().flat().join(" ");
    if (!contemLinkInstagram(textoEditado)) return;
  }

  const colParaUsar = editouColunaInstagram ? inputCol : firstCol;

  for (let row = Math.max(firstRow, CONFIG.startRow); row <= lastRow; row++) {
    atualizarLinhaInstagram(row, false, colParaUsar);
    Utilities.sleep(CONFIG.requestDelayMs);
  }
}

/**
 * Atualiza todas as linhas até a última linha preenchida da planilha.
 */
function atualizarTudoInstagram() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const inputCol = detectarColunaInstagram(sheet);

  if (lastRow < CONFIG.startRow) return;

  for (let row = CONFIG.startRow; row <= lastRow; row++) {
    const perfil = getCellValueAsText(sheet, row, inputCol);

    if (!perfil) {
      limparResultado(sheet, row);
      continue;
    }

    if (linhaJaPreenchida(sheet, row)) {
      continue;
    }

    atualizarLinhaInstagram(row, true, inputCol);
    Utilities.sleep(CONFIG.requestDelayMs);
  }
}

/**
 * Atualiza uma linha.
 */
function atualizarLinhaInstagram(row, skipIfFilled = false, inputColOpcional = null) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (row < CONFIG.startRow) return;

  if (skipIfFilled && linhaJaPreenchida(sheet, row)) {
    return;
  }

  const inputCol = inputColOpcional || detectarColunaInstagram(sheet);
  const perfilDigitado = getCellValueAsText(sheet, row, inputCol);

  if (!perfilDigitado) {
    limparResultado(sheet, row);
    return;
  }

  const usernameEntrada = extrairUsernameInstagram(perfilDigitado);

  if (!usernameEntrada) {
    preencherErroNaLinha(sheet, row, "INVÁLIDO");
    return;
  }

  try {
    const profile = buscarPerfilApify(usernameEntrada);

    if (!profile || Object.keys(profile).length === 0) {
      preencherErroNaLinha(sheet, row, "SEM DADOS");
      return;
    }

    const dados = montarDadosPerfil(profile, usernameEntrada);
    preencherDados(sheet, row, dados);

  } catch (error) {
    preencherErroNaLinha(sheet, row, "ERRO API");
    Logger.log("Erro linha " + row + ": " + error);
  }
}

/**
 * Busca dados gerais do perfil.
 */
function buscarPerfilApify(username) {
  const token = PropertiesService.getScriptProperties().getProperty("APIFY_TOKEN");

  if (!token) {
    throw new Error("Token da Apify não configurado.");
  }

  const url = `https://api.apify.com/v2/acts/${CONFIG.actorId}/run-sync-get-dataset-items`;

  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + token
    },
    payload: JSON.stringify({
      usernames: [username]
    }),
    muteHttpExceptions: true
  });

  const statusCode = response.getResponseCode();
  const body = response.getContentText();

  Logger.log("Status Profile Apify: " + statusCode);
  Logger.log("Resposta Profile Apify: " + body.substring(0, 1000));

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error("API PROFILE " + statusCode + " - " + body);
  }

  const data = JSON.parse(body);

  if (!Array.isArray(data) || data.length === 0) {
    return {};
  }

  return data[0] || {};
}

/**
 * Busca Reels.
 */
function buscarReelsApify(username) {
  const token = PropertiesService.getScriptProperties().getProperty("APIFY_TOKEN");

  if (!token) {
    throw new Error("Token da Apify não configurado.");
  }

  const usernameLimpo = extrairUsernameInstagram(username);

  if (!usernameLimpo) {
    return [];
  }

  return executarBuscaReelsApify(usernameLimpo, token);
}

/**
 * Executa busca de Reels na Apify.
 */
function executarBuscaReelsApify(entrada, token) {
  const url = `https://api.apify.com/v2/acts/${CONFIG.reelsActorId}/run-sync-get-dataset-items`;

  const usernameLimpo = extrairUsernameInstagram(entrada);

  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + token
    },
    payload: JSON.stringify({
      username: [usernameLimpo],
      resultsLimit: 5,
      skipPinnedPosts: true,
      includeSharesCount: false,
      includeTranscript: false,
      includeDownloadedVideo: false
    }),
    muteHttpExceptions: true
  });

  const statusCode = response.getResponseCode();
  const body = response.getContentText();

  Logger.log("Status Reels Apify: " + statusCode);
  Logger.log("Resposta Reels Apify: " + body.substring(0, 3000));

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error("API REELS " + statusCode + " - " + body);
  }

  const data = JSON.parse(body);

  if (!Array.isArray(data)) {
    return [];
  }

  return data;
}

/**
 * Pontua resultado de Reels.
 */
function pontuarResultadoReels(reels) {
  if (!Array.isArray(reels) || reels.length === 0) return 0;

  let comViews = 0;
  let reelsReais = 0;

  reels.forEach(item => {
    const views = extrairViewsDoPost(item);

    if (views > 0) comViews++;
    if (reelEhReel(item)) reelsReais++;
  });

  return (reelsReais * 1000) + comViews;
}

/**
 * Organiza dados.
 */
function montarDadosPerfil(profile, usernameEntrada) {
  const username = pick(profile, [
    "username",
    "userName",
    "handle"
  ], usernameEntrada);

  const nomeOriginal = pick(profile, [
    "fullName",
    "name",
    "profileName"
  ], username);

  const nomeLimpo = limparNomePerfil(nomeOriginal);

  const bio = pick(profile, [
    "biography",
    "bio",
    "description"
  ], "");

  const emailBio = extrairEmailDaBio(bio);

  const foto = pick(profile, [
    "profilePicUrlHD",
    "profilePicUrl",
    "profilePictureUrl"
  ], "");

  const linkPerfil = pick(profile, [
    "url",
    "profileUrl"
  ], `https://www.instagram.com/${username}/`);

  const seguidores = toNumber(pick(profile, [
    "followersCount",
    "followers",
    "followedByCount"
  ], 0));

  const posts = extrairPosts(profile);
  const engajamento = calcularEngajamento(posts, seguidores);

  const reels = buscarReelsApify(username);
  const mediaViews = calcularMediaViewsReels(reels);

  const tier = calcularTier(seguidores);

  return {
    foto,
    nomeLimpo,
    emailBio,
    username,
    linkPerfil,
    seguidores,
    engajamento,
    mediaViews,
    tier
  };
}

/**
 * Preenche dados na planilha.
 */
function preencherDados(sheet, row, dados) {
 if (dados.foto) {
  inserirFotoDentroDaCelula(sheet, row, CONFIG.cols.foto, dados.foto);
} else {
  sheet.getRange(row, CONFIG.cols.foto).clearContent();
  sheet.getRange(row, CONFIG.cols.foto).setValue("SEM FOTO");
}

  sheet.getRange(row, CONFIG.cols.nome).setValue(dados.nomeLimpo || "");
  sheet.getRange(row, CONFIG.cols.emailBio).setValue(dados.emailBio || "");
  sheet.getRange(row, CONFIG.cols.tier).setValue(dados.tier || "");

  preencherLinkClicavel(sheet, row, dados.linkPerfil, dados.username);

  sheet.getRange(row, CONFIG.cols.seguidores).setValue(dados.seguidores || "");

  sheet.getRange(row, CONFIG.cols.engajamento)
    .setValue(dados.engajamento === "" ? "" : dados.engajamento);

  sheet.getRange(row, CONFIG.cols.mediaViews)
    .setValue(dados.mediaViews || "")
    .setFontColor("#000000")
    .setFontWeight("normal")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  formatarLinha(sheet, row);
}

/**
 * Cria link clicável.
 */
function preencherLinkClicavel(sheet, row, url, username) {
  const texto = username ? `@${username}` : url;

  const richText = SpreadsheetApp.newRichTextValue()
    .setText(texto)
    .setLinkUrl(url)
    .build();

  sheet.getRange(row, CONFIG.cols.linkPerfil).setRichTextValue(richText);
}

/**
 * Limpa nome.
 */
function limparNomePerfil(nome) {
  if (!nome) return "";

  return String(nome)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calcula Tier.
 */
function calcularTier(followers) {
  followers = Number(followers || 0);

  if (followers <= 0) return "";
  if (followers <= 10000) return "NANO";
  if (followers <= 99999) return "MICRO";
  if (followers <= 999999) return "MEZZO";
  if (followers < 5000000) return "MACRO";

  return "MEGA";
}

/**
 * Calcula engajamento estimado removendo publicações fixadas.
 */
function calcularEngajamento(posts, seguidores) {
  if (!seguidores || seguidores <= 0) return "";
  if (!Array.isArray(posts) || posts.length === 0) return "";

  let totalLikes = 0;
  let totalComments = 0;
  let totalPosts = 0;

  posts.forEach(post => {
    // Ignora publicações fixadas
    if (postEstaFixado(post)) {
      return;
    }

    const likes = toNumber(pick(post, [
      "likesCount",
      "likes",
      "likeCount"
    ], 0));

    const comments = toNumber(pick(post, [
      "commentsCount",
      "comments",
      "commentCount"
    ], 0));

    totalLikes += likes;
    totalComments += comments;
    totalPosts++;
  });

  if (totalPosts === 0) return "";

  const mediaLikes = totalLikes / totalPosts;
  const mediaComentarios = totalComments / totalPosts;

  return (mediaLikes + mediaComentarios) / seguidores;
}

/**
 * Calcula média de views dos 10 últimos Reels.
 */
function calcularMediaViewsReels(reels) {
  if (!Array.isArray(reels) || reels.length === 0) return "";

  const todosComViews = reels
    .map((reel, index) => {
      return {
        views: extrairViewsDoPost(reel),
        data: extrairDataDoPost(reel),
        url: String(reel.url || reel.inputUrl || ""),
        index: index,
        fixado: postEstaFixado(reel),
        ehReel: reelEhReel(reel)
      };
    })
    .filter(item => item.fixado === false)
    .filter(item => item.views > 0);

  const apenasReels = todosComViews.filter(item => item.ehReel === true);
  const baseCalculo = apenasReels.length > 0 ? apenasReels : todosComViews;

  const videos = baseCalculo
    .sort((a, b) => {
      const dataA = a.data || 0;
      const dataB = b.data || 0;

      if (dataA !== dataB) {
        return dataB - dataA;
      }

      return a.index - b.index;
    })
    .slice(0, 5);

  Logger.log("ITENS usados no cálculo da média: " + JSON.stringify(videos));

  if (videos.length === 0) return "";

  const totalViews = videos.reduce((soma, item) => soma + item.views, 0);

  return Math.floor(totalViews / videos.length);
}

/**
 * Identifica se é Reel.
 */
function reelEhReel(post) {
  const url = String(post.url || post.inputUrl || "").toLowerCase();

  if (url.includes("/reel/") || url.includes("/reels/")) {
    return true;
  }

  const type = String(
    post.type ||
    post.mediaType ||
    post.productType ||
    post.product_type ||
    post.__typename ||
    post.mediaProductType ||
    post.media_product_type ||
    ""
  ).toLowerCase();

  if (type.includes("reel")) return true;
  if (type.includes("clips")) return true;
  if (type.includes("video")) return true;

  const views = extrairViewsDoPost(post);

  return views > 0;
}

/**
 * Verifica fixado.
 */
function postEstaFixado(post) {
  const camposFixado = [
    "isPinned",
    "pinned",
    "isTopPost",
    "isPinnedPost",
    "is_pinned",
    "pinnedForUsers",
    "timelinePinnedUserIds"
  ];

  for (let i = 0; i < camposFixado.length; i++) {
    const valor = getValorPorCaminho(post, camposFixado[i]);

    if (valor === true) return true;
    if (Array.isArray(valor) && valor.length > 0) return true;
    if (String(valor).toLowerCase() === "true") return true;
  }

  return false;
}

/**
 * Extrai views.
 */
function extrairViewsDoPost(post) {
  const camposPossiveis = [
    "videoPlayCount",
    "videoViewCount",
    "igPlayCount",
    "playCount",
    "plays",
    "views",
    "viewCount",
    "viewsCount",
    "clipsPlayCount",
    "reelPlayCount",
    "video_play_count",
    "video_view_count",
    "ig_play_count",
    "play_count",
    "view_count",
    "views_count",
    "metrics.plays",
    "metrics.views",
    "metrics.playCount",
    "metrics.viewCount",
    "statistics.plays",
    "statistics.views",
    "statistics.playCount",
    "statistics.viewCount",
    "video.statistics.plays",
    "video.statistics.views",
    "video.statistics.playCount",
    "video.statistics.viewCount",
    "clipsMetadata.playCount",
    "clipsMetadata.viewCount",
    "clips_metadata.play_count",
    "clips_metadata.view_count"
  ];

  const encontrados = [];

  camposPossiveis.forEach(campo => {
    const valor = getValorPorCaminho(post, campo);
    const numero = toNumber(valor);

    if (numero > 0) {
      encontrados.push(numero);
    }
  });

  if (encontrados.length === 0) return 0;

  return Math.max.apply(null, encontrados);
}

/**
 * Extrai data.
 */
function extrairDataDoPost(post) {
  const camposData = [
    "timestamp",
    "takenAtTimestamp",
    "takenAt",
    "date",
    "createdAt",
    "created_at",
    "publishedAt",
    "published_at",
    "shortCodeDate"
  ];

  for (let i = 0; i < camposData.length; i++) {
    const valor = getValorPorCaminho(post, camposData[i]);

    if (!valor) continue;

    if (typeof valor === "number") {
      return valor < 9999999999 ? valor * 1000 : valor;
    }

    const data = new Date(valor).getTime();

    if (!isNaN(data)) {
      return data;
    }
  }

  return 0;
}

/**
 * Extrai posts para engajamento.
 */
function extrairPosts(profile) {
  if (Array.isArray(profile.latestPosts)) return profile.latestPosts;
  if (Array.isArray(profile.posts)) return profile.posts;
  if (Array.isArray(profile.latestIgtvVideos)) return profile.latestIgtvVideos;
  if (Array.isArray(profile.latestReels)) return profile.latestReels;
  if (Array.isArray(profile.reels)) return profile.reels;

  return [];
}

/**
 * Extrai username Instagram.
 */
function extrairUsernameInstagram(valor) {
  const v = String(valor || "")
    .trim()
    .replace(/\/+$/, "");

  if (!v) return "";

  let match = v.match(/instagram\.com\/([^/?#]+)/i);

  if (match) {
    const username = match[1].trim();

    const bloqueados = [
      "p",
      "reel",
      "reels",
      "stories",
      "explore",
      "accounts"
    ];

    if (bloqueados.includes(username.toLowerCase())) {
      return "";
    }

    return username;
  }

  match = v.match(/^@?([a-zA-Z0-9._]+)$/);

  if (match) return match[1];

  return "";
}

/**
 * Formata números.
 */
function formatarLinha(sheet, row) {
  sheet.getRange(row, CONFIG.cols.seguidores).setNumberFormat("#,##0");
  sheet.getRange(row, CONFIG.cols.engajamento).setNumberFormat("0.00%");

  sheet.getRange(row, CONFIG.cols.mediaViews)
    .setNumberFormat("#,##0")
    .setFontColor("#000000")
    .setFontWeight("normal")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
}

/**
 * Limpa resultado.
 */
function limparResultado(sheet, row) {
  sheet.getRange(row, CONFIG.cols.foto).clearContent();
  sheet.getRange(row, CONFIG.cols.nome).clearContent();
  sheet.getRange(row, CONFIG.cols.emailBio).clearContent();
  sheet.getRange(row, CONFIG.cols.tier).clearContent();
  sheet.getRange(row, CONFIG.cols.linkPerfil).clearContent();
  sheet.getRange(row, CONFIG.cols.seguidores).clearContent();
  sheet.getRange(row, CONFIG.cols.engajamento).clearContent();

  sheet.getRange(row, CONFIG.cols.mediaViews)
    .clearContent()
    .setFontColor("#000000")
    .setFontWeight("normal");
}

/**
 * Preenche erro.
 */
function preencherErroNaLinha(sheet, row, mensagem) {
  sheet.getRange(row, CONFIG.cols.foto).setValue(mensagem);
  sheet.getRange(row, CONFIG.cols.nome).clearContent();
  sheet.getRange(row, CONFIG.cols.emailBio).clearContent();
  sheet.getRange(row, CONFIG.cols.tier).clearContent();
  sheet.getRange(row, CONFIG.cols.linkPerfil).clearContent();
  sheet.getRange(row, CONFIG.cols.seguidores).clearContent();
  sheet.getRange(row, CONFIG.cols.engajamento).clearContent();

  sheet.getRange(row, CONFIG.cols.mediaViews)
    .clearContent()
    .setFontColor("#000000")
    .setFontWeight("normal");
}

/**
 * Valor da célula como texto.
 */
function getCellValueAsText(sheet, row, col) {
  return String(sheet.getRange(row, col).getValue() || "").trim();
}

/**
 * Primeiro campo existente.
 */
function pick(obj, keys, fallback) {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (
      obj &&
      Object.prototype.hasOwnProperty.call(obj, key) &&
      obj[key] !== null &&
      obj[key] !== undefined &&
      obj[key] !== ""
    ) {
      return obj[key];
    }
  }

  return fallback;
}

/**
 * Lê campo simples ou aninhado.
 */
function getValorPorCaminho(obj, caminho) {
  if (!obj || !caminho) return "";

  const partes = caminho.split(".");
  let atual = obj;

  for (let i = 0; i < partes.length; i++) {
    if (
      atual === null ||
      atual === undefined ||
      !Object.prototype.hasOwnProperty.call(atual, partes[i])
    ) {
      return "";
    }

    atual = atual[partes[i]];
  }

  return atual;
}

/**
 * Converte para número.
 */
function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") return value;

  const clean = String(value)
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  return Number(clean) || 0;
}

/**
 * Protege aspas na fórmula IMAGE.
 */
function escapeFormulaText(text) {
  return String(text || "").replace(/"/g, '""');
}

/**
 * Extrai e-mail da bio.
 */
function extrairEmailDaBio(texto) {
  if (!texto) return "";

  const textoLimpo = String(texto)
    .replace(/\s+/g, " ")
    .trim();

  const match = textoLimpo.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  if (!match) return "";

  return match[0].trim();
}

/**
 * Verifica se linha já está preenchida.
 */
function linhaJaPreenchida(sheet, row) {
  const campos = [
    CONFIG.cols.foto,
    CONFIG.cols.nome,
    CONFIG.cols.emailBio,
    CONFIG.cols.tier,
    CONFIG.cols.linkPerfil,
    CONFIG.cols.seguidores,
    CONFIG.cols.engajamento,
    CONFIG.cols.mediaViews
  ];

  return campos.some(col => {
    const valor = sheet.getRange(row, col).getDisplayValue();
    return String(valor || "").trim() !== "";
  });
}

/**
 * Detecta se texto tem link do Instagram.
 */
function contemLinkInstagram(texto) {
  return /instagram\.com/i.test(String(texto || ""));
}

/**
 * Normaliza texto.
 */
function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}
/**
 * Insere a foto DENTRO DA CÉLULA, sem usar fórmula =IMAGE().
 */
function inserirFotoDentroDaCelula(sheet, row, col, url) {
  try {
    const cell = sheet.getRange(row, col);

    // Limpa fórmula ou texto antigo
    cell.clearContent();

    // Remove possíveis imagens antigas que ficaram sobre a célula
    removerImagemSobreCelula(sheet, row, col);

    const imagemCelula = SpreadsheetApp
      .newCellImage()
      .setSourceUrl(url)
      .setAltTextTitle("Foto do perfil")
      .setAltTextDescription("Foto importada do Instagram")
      .build();

    // Aqui a imagem entra como valor da célula
    cell.setValue(imagemCelula);

    // Ajusta tamanho visual da célula
    sheet.setRowHeight(row, 100);
    sheet.setColumnWidth(col, 100);

  } catch (erro) {
    Logger.log("Erro ao inserir imagem dentro da célula na linha " + row + ": " + erro);
    sheet.getRange(row, col).setValue("SEM FOTO");
  }
}

/**
 * Remove imagens que ficaram SOBRE a célula, caso tenha testado insertImage antes.
 */
function removerImagemSobreCelula(sheet, row, col) {
  const imagens = sheet.getImages();

  imagens.forEach(function(img) {
    const celula = img.getAnchorCell();

    if (
      celula.getRow() === row &&
      celula.getColumn() === col
    ) {
      img.remove();
    }
  });
}

/**
 * Converte fotos antigas que estão com =IMAGE() para imagem dentro da célula.
 * Rode esta função uma vez depois de salvar o script.
 */
function converterFotosImageParaDentroDaCelula() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  const startRow = CONFIG.startRow;
  const fotoCol = CONFIG.cols.foto;
  const lastRow = sheet.getLastRow();

  for (let row = startRow; row <= lastRow; row++) {
    const cell = sheet.getRange(row, fotoCol);
    const formula = cell.getFormula();

    if (!formula) continue;

    const url = extrairUrlDaFormulaImage(formula);

    if (!url) continue;

    inserirFotoDentroDaCelula(sheet, row, fotoCol, url);

    Utilities.sleep(300);
  }
}

/**
 * Extrai URL de fórmulas tipo =IMAGE("link")
 */
function extrairUrlDaFormulaImage(formula) {
  if (!formula) return "";

  const match = String(formula).match(/IMAGE\(["']([^"']+)["']/i);

  if (!match) return "";

  return match[1];
}
/**
 * Teste rápido na linha inicial.
 */
function testarLinhaInicial() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const inputCol = detectarColunaInstagram(sheet);
  atualizarLinhaInstagram(CONFIG.startRow, false, inputCol);
}