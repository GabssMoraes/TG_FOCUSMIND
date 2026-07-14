package com.focusmind.api.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.focusmind.api.domain.chat.MensagemChat;
import com.focusmind.api.domain.user.User;
import com.focusmind.api.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.chat-url}")
    private String chatUrl;

    @Value("${gemini.api.embedding-url}")
    private String embeddingUrl;

    @Autowired
    private BaseConhecimentoRepository baseConhecimentoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MetaRepository metaRepository;

    @Autowired
    private SessaoEstudoRepository sessaoEstudoRepository;

    @Autowired
    private RevisaoSemanalRepository revisaoSemanalRepository;

    @Autowired
    private MensagemChatRepository mensagemChatRepository;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = 
            "Você é o FocusBot, um psicopedagogo clínico especializado em TDAH e técnicas de aprendizagem para pessoas neurodivergentes, mas você nunca fala para o usuário que é um psicopedagogo e sim é um companheiro de estudos virtual projetado para ajudar estudantes a manterem o foco e organizarem suas rotinas de forma realista, sem julgamentos e com muita empatia. " +
            "Seu papel é atuar como um assistente de suporte e parceiro motivacional, aplicando conceitos de psicopedagogia e técnicas de aprendizagem ativa voltados para pessoas com dificuldade de atenção (como TDAH).\n\n" +
            "Importante: Apresente-se e comporte-se sempre como um companheiro virtual de foco e organização nos estudos, deixando claro de forma amigável (se questionado sobre sua natureza profissional) que você é uma ferramenta de suporte e não substitui o acompanhamento de um psicopedagogo clínico ou terapeuta real.\n\n" +
            "Diretrizes de Comunicação:\n" +
            "1. Respostas Curtas e Escaneáveis: Use parágrafos curtos. Pessoas com TDAH perdem o foco em blocos grandes de texto.\n" +
            "2. Formatação Visual: Use negrito para destacar palavras-chave importantes. Use listas com bullet points (•) ou números.\n" +
            "3. Micro-passos (Atômicos): Nunca sugira \"Estude por 2 horas\". Em vez disso, sugira: \"Abra o livro na página 10 e leia apenas 1 parágrafo\". Quebre objetivos em passos muito fáceis para vencer a barreira inicial da procrastinação.\n" +
            "4. Tom de Voz: Extremamente acolhedor, motivador, sem tons de cobrança ou culpa.\n" +
            "5. Foco em Ação: Sempre encerre a resposta com uma única pergunta simples ou um convite para ação imediata.\n" +
            "6. Métodos Recomendados: Sugira Pomodoro modificado (ex: 15min foco / 5min pausa), mapas mentais, flashcards, estudos intercalados e recompensas imediatas.";

    public String gerarRespostaComRAG(String mensagemUsuario, Long userId) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("INSIRA_SUA_CHAVE_AQUI")) {
            return "Erro: A chave da API do Gemini (GEMINI_API_KEY) não foi configurada. Por favor, adicione sua chave em application-secret.properties.";
        }

        try {
            // Salvar mensagem do usuário no histórico
            User user = null;
            if (userId != null) {
                user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    MensagemChat userMsg = new MensagemChat();
                    userMsg.setUser(user);
                    userMsg.setSender("user");
                    userMsg.setTexto(mensagemUsuario);
                    mensagemChatRepository.save(userMsg);
                }
            }

            // 1. RAG de Base de Conhecimento (Busca semântica por embeddings)
            List<Double> embedding = obterEmbedding(mensagemUsuario);
            String context = "";
            if (embedding != null && !embedding.isEmpty()) {
                String vectorString = embedding.toString(); 
                List<Object[]> similarContents = baseConhecimentoRepository.findSimilarContent(vectorString, 3);
                
                if (!similarContents.isEmpty()) {
                    StringBuilder contextBuilder = new StringBuilder();
                    contextBuilder.append("Aqui está o contexto relevante recuperado da base de conhecimento do FocusMind:\n");
                    for (Object[] row : similarContents) {
                        String titulo = (String) row[1];
                        String conteudo = (String) row[2];
                        contextBuilder.append(String.format("--- \nTítulo: %s\nConteúdo: %s\n", titulo, conteudo));
                    }
                    contextBuilder.append("---\n\n");
                    context = contextBuilder.toString();
                }
            }

            // 2. RAG de Dados do Usuário (Tarefas, Estatísticas, Revisões)
            StringBuilder userContext = new StringBuilder();
            if (user != null) {
                userContext.append("=== DADOS DO USUÁRIO ===\n");
                userContext.append(String.format("Nome do estudante: %s\nPontos/Moedas acumuladas: %d\nSequência de dias ativos (streak): %d dias\n",
                        user.getName(), user.getPontos(), user.getStreakDias()));

                // Metas ativas
                List<com.focusmind.api.domain.meta.Meta> activeMetas = metaRepository.findByUserIdAndStatus(userId, "A");
                if (!activeMetas.isEmpty()) {
                    userContext.append("Metas e tarefas pendentes hoje:\n");
                    for (var meta : activeMetas) {
                        userContext.append(String.format("- [PENDENTE] %s\n", meta.getDescricao()));
                    }
                }

                // Pomodoros hoje
                List<com.focusmind.api.domain.sessao.SessaoEstudo> sessoes = sessaoEstudoRepository.findByUserId(userId);
                long sessoesHoje = sessoes.stream()
                        .filter(s -> Boolean.TRUE.equals(s.getFoiConcluida()) && s.getData().toLocalDate().equals(LocalDate.now()))
                        .count();
                userContext.append(String.format("Sessões de foco Pomodoro concluídas hoje: %d\n", sessoesHoje));

                // Última revisão semanal
                List<com.focusmind.api.domain.revisao.RevisaoSemanal> revisoes = revisaoSemanalRepository.findByUserIdOrderByDataRegistroDesc(userId);
                if (!revisoes.isEmpty()) {
                    var rev = revisoes.get(0);
                    userContext.append(String.format("Última revisão de rotina:\n  - Correu bem: %s\n  - Não planejado: %s\n  - Ajustes pretendidos: %s\n",
                            rev.getOQueFoiBem(), rev.getOQueNaoSaiuComoPlanejado(), rev.getOQueAjustar()));
                }
                userContext.append("========================\n\n");
            }

            // 3. Montar Histórico de Conversas (Gemini contents)
            List<Map<String, Object>> contents = new ArrayList<>();
            if (userId != null) {
                List<MensagemChat> history = mensagemChatRepository.findByUserIdOrderByDataHoraAsc(userId);
                // Pegar as últimas 10 mensagens (menos a que acabamos de salvar)
                int start = Math.max(0, history.size() - 11);
                int limit = Math.min(history.size() - 1, start + 10);
                for (int i = start; i < limit; i++) {
                    MensagemChat msg = history.get(i);
                    String role = "user".equals(msg.getSender()) ? "user" : "model";
                    contents.add(Map.of(
                            "role", role,
                            "parts", List.of(Map.of("text", msg.getTexto()))
                    ));
                }
            }

            // Injetar o prompt final com o contexto semântico e dados do usuário
            String promptFinal = String.format(
                    "%s%sCom base no contexto e nos dados do estudante descritos acima, responda de forma personalizada à seguinte mensagem:\n%s",
                    context, userContext.toString(), mensagemUsuario
            );

            contents.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", promptFinal))
            ));

            String respostaIA = chamarGeminiChat(contents);

            // Salvar resposta da IA no histórico
            if (user != null) {
                MensagemChat aiMsg = new MensagemChat();
                aiMsg.setUser(user);
                aiMsg.setSender("ai");
                aiMsg.setTexto(respostaIA);
                mensagemChatRepository.save(aiMsg);
            }

            return respostaIA;

        } catch (Exception e) {
            e.printStackTrace();
            return "Ocorreu um erro ao processar sua solicitação com a IA: " + e.getMessage();
        }
    }

    public String gerarResumoRevisaoSemanal(String oQueFoiBem, String oQueNaoSaiu, String oQueAjustar) throws Exception {
        String prompt = String.format(
                "O usuário acabou de fazer a sua Revisão Semanal de Estudos e respondeu a três perguntas reflexivas:\n\n" +
                "1. O que foi bem esta semana:\n%s\n\n" +
                "2. O que não saiu como planejado:\n%s\n\n" +
                "3. O que pretende ajustar para a próxima semana:\n%s\n\n" +
                "Como FocusBot, analise de forma extremamente empática, acolhedora e sem julgamentos as respostas do estudante. " +
                "Destaque o que correu bem (reforço positivo), ajude a relativizar o que falhou com soluções realistas para procrastinação, " +
                "e valide as ideias de ajuste para a próxima semana sugerindo 1 a 2 micro-passos acionáveis para neurodiversidade/TDAH.",
                oQueFoiBem, oQueNaoSaiu, oQueAjustar
        );

        List<Map<String, Object>> contents = List.of(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", prompt))
        ));

        return chamarGeminiChat(contents);
    }

    public String sugerirGradeTimeBlocking(String tarefasPendentes) throws Exception {
        String prompt = String.format(
                "O usuário solicitou uma sugestão para a sua grade horária diária de estudos (Time Blocking) com base nas seguintes tarefas pendentes:\n%s\n\n" +
                "Como FocusBot, distribua essas tarefas ao longo de blocos de estudo estruturados e realistas de forma a reduzir a sobrecarga cognitiva do estudante. " +
                "Recomende intervalos apropriados (ex: técnica Pomodoro integrada), dividindo os blocos de forma balanceada. " +
                "Retorne a grade sugerida com horários aproximados e dicas práticas de organização de forma curta, clara e formatada com bullet points.",
                tarefasPendentes
        );

        List<Map<String, Object>> contents = List.of(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", prompt))
        ));

        return chamarGeminiChat(contents);
    }

    private List<Double> obterEmbedding(String texto) {
        try {
            String url = embeddingUrl + "?key=" + apiKey;

            Map<String, Object> textPart = Map.of("text", texto);
            Map<String, Object> partsNode = Map.of("parts", List.of(textPart));
            Map<String, Object> requestBody = Map.of(
                    "model", "models/gemini-embedding-001",
                    "content", partsNode
            );

            String requestBodyJson = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode rootNode = objectMapper.readTree(response.body());
                JsonNode valuesNode = rootNode.path("embedding").path("values");
                List<Double> embeddingList = new ArrayList<>();
                if (valuesNode.isArray()) {
                    for (JsonNode val : valuesNode) {
                        embeddingList.add(val.asDouble());
                    }
                }
                return embeddingList;
            }
        } catch (Exception e) {
            System.err.println("Erro ao gerar embedding: " + e.getMessage());
        }
        return null;
    }

    private String chamarGeminiChat(List<Map<String, Object>> contents) throws Exception {
        String url = chatUrl + "?key=" + apiKey;

        Map<String, Object> systemInstruction = Map.of(
                "parts", List.of(Map.of("text", SYSTEM_PROMPT))
        );

        Map<String, Object> requestBody = Map.of(
                "contents", contents,
                "systemInstruction", systemInstruction
        );

        String requestBodyJson = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode candidates = rootNode.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                return candidates.get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText();
            }
            return "Não foi possível gerar uma resposta do assistente.";
        } else {
            throw new RuntimeException("Erro da API do Gemini. Status: " + response.statusCode() + ", Resposta: " + response.body());
        }
    }
}
