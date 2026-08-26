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

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
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

    public String gerarRespostaComRAG(String mensagemUsuario, Long userId, Long sessionId, boolean salvarNoHistorico) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("INSIRA_SUA_CHAVE_AQUI")) {
            return "Erro: A chave da API do Gemini (GEMINI_API_KEY) não foi configurada. Por favor, adicione sua chave em application-secret.properties.";
        }

        try {
            // Salvar mensagem do usuário no histórico
            User user = null;
            com.focusmind.api.domain.chat.ChatSession session = null;
            if (userId != null) {
                user = userRepository.findById(userId).orElse(null);
                if (sessionId != null) {
                    session = chatSessionRepository.findById(sessionId).orElse(null);
                }
                
                if (user != null && salvarNoHistorico && session != null) {
                    MensagemChat userMsg = new MensagemChat();
                    userMsg.setUser(user);
                    userMsg.setSession(session);
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
            if (session != null) {
                List<MensagemChat> history = mensagemChatRepository.findBySessionIdOrderByDataHoraAsc(session.getId());
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
            if (user != null && salvarNoHistorico && session != null) {
                MensagemChat aiMsg = new MensagemChat();
                aiMsg.setUser(user);
                aiMsg.setSession(session);
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

    public String gerarSubTopicos(String materia, int horasDia, java.time.LocalDate dataLimite, int totalHoras) throws Exception {
        long diasRestantes = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), dataLimite);

        String prompt = String.format(
                "Você é um especialista em currículo e planejamento de estudos. Um estudante precisa aprender '%s'.\n\n" +
                "Contexto do estudante:\n" +
                "- Horas disponíveis por dia: %d horas\n" +
                "- Data limite para concluir: %s (%d dias restantes)\n" +
                "- Total de horas planejadas para estudar: %d horas\n\n" +
                "Sua tarefa: Gere uma lista de sub-tópicos essenciais e ordenados logicamente para o estudante dominar '%s' dentro do prazo.\n\n" +
                "REGRAS IMPORTANTES:\n" +
                "1. Retorne APENAS um JSON válido, sem nenhum texto antes ou depois.\n" +
                "2. O JSON deve ser um array de objetos com esta estrutura exata:\n" +
                "[{\"titulo\": \"Nome do sub-tópico\", \"descricao\": \"Uma frase curta explicando o que é\", \"tempoEstimadoHoras\": 2, \"ordem\": 1}, ...]\n" +
                "3. Gere entre 6 e 12 sub-tópicos, adequados ao tempo disponível.\n" +
                "4. A soma de 'tempoEstimadoHoras' deve ser aproximadamente %d horas.\n" +
                "5. Ordene do mais básico/fundamental ao mais avançado.\n" +
                "6. Seja específico para '%s', não genérico.",
                materia, horasDia, dataLimite.toString(), diasRestantes, totalHoras,
                materia, totalHoras, materia
        );

        List<Map<String, Object>> contents = List.of(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", prompt))
        ));

        String resposta = chamarGeminiChat(contents);

        // Limpar possível markdown (```json ... ```) da resposta
        resposta = resposta.trim();
        if (resposta.startsWith("```")) {
            resposta = resposta.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
        }

        return resposta;
    }

    public String gerarMensagemMotivaional(String nomeEstudante, String materia, int diasRestantes, int horasDia) throws Exception {
        String prompt = String.format(
                "Gere uma mensagem motivacional CURTA (máximo 3 frases) e muito acolhedora para %s, que está estudando '%s'.\n" +
                "Ele tem %d dias até o prazo final e estuda %d horas por dia.\n" +
                "A mensagem deve ser calorosa, específica para a situação dele, encorajadora e terminar com um incentivo de ação para hoje.\n" +
                "NÃO use emojis em excesso. Seja autêntico e humano.",
                nomeEstudante, materia, diasRestantes, horasDia
        );

        List<Map<String, Object>> contents = List.of(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", prompt))
        ));

        return chamarGeminiChat(contents);
    }

    public String gerarQuiz(String materia) throws Exception {
        String prompt = String.format(
                "Você é um professor especializado na matéria de '%s'. Crie um quiz rápido de retenção de conhecimento com 3 perguntas de múltipla escolha adequadas para um estudante.\n\n" +
                "REGRAS IMPORTANTES:\n" +
                "1. Retorne APENAS um JSON válido, sem nenhum texto antes ou depois (sem markdown como ```json).\n" +
                "2. O JSON deve ser um array com a seguinte estrutura exata:\n" +
                "[\n" +
                "  {\n" +
                "    \"pergunta\": \"texto da pergunta\",\n" +
                "    \"opcoes\": [\"opcao 1\", \"opcao 2\", \"opcao 3\", \"opcao 4\"],\n" +
                "    \"respostaCorreta\": 2,\n" +
                "    \"explicacao\": \"Breve explicação do porquê a resposta 2 está correta.\"\n" +
                "  }\n" +
                "]\n" +
                "3. O campo 'respostaCorreta' deve ser o índice (0 a 3) da opção correta.",
                materia
        );

        List<Map<String, Object>> contents = List.of(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", prompt))
        ));

        String resposta = chamarGeminiChat(contents);
        
        // Limpar possível markdown (```json ... ```) da resposta
        resposta = resposta.trim();
        if (resposta.startsWith("```")) {
            resposta = resposta.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
        }

        return resposta;
    }

    public String gerarQuizMeta(String descricaoMeta) throws Exception {
        String prompt = String.format(
                "O estudante está prestes a concluir uma meta de estudo sobre o seguinte tópico: '%s'.\n" +
                "Crie um quiz rápido com 5 perguntas de múltipla escolha para validar o conhecimento dele sobre isso.\n\n" +
                "REGRAS IMPORTANTES:\n" +
                "1. Retorne APENAS um JSON válido, sem nenhum texto antes ou depois (sem markdown como ```json).\n" +
                "2. O JSON deve ser um array com a seguinte estrutura exata:\n" +
                "[\n" +
                "  {\n" +
                "    \"pergunta\": \"texto da pergunta\",\n" +
                "    \"opcoes\": [\"opcao 1\", \"opcao 2\", \"opcao 3\", \"opcao 4\"],\n" +
                "    \"respostaCorreta\": 2,\n" +
                "    \"explicacao\": \"Breve explicação do porquê a resposta 2 está correta.\"\n" +
                "  }\n" +
                "]\n" +
                "3. O campo 'respostaCorreta' deve ser o índice (0 a 3) da opção correta.\n" +
                "4. Gere exatamente 5 perguntas.",
                descricaoMeta
        );

        List<Map<String, Object>> contents = List.of(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", prompt))
        ));

        String resposta = chamarGeminiChat(contents);
        
        // Limpar possível markdown (```json ... ```) da resposta
        resposta = resposta.trim();
        if (resposta.startsWith("```")) {
            resposta = resposta.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
        }

        return resposta;
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

        // Configuração de geração: desativa o "thinking" do Gemini 2.5 Flash
        // (que é lento por padrão) para respostas mais rápidas no chat
        Map<String, Object> generationConfig = Map.of(
                "thinkingConfig", Map.of("thinkingBudget", 0)
        );

        Map<String, Object> requestBody = Map.of(
                "contents", contents,
                "systemInstruction", systemInstruction,
                "generationConfig", generationConfig
        );

        String requestBodyJson = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(60))
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
