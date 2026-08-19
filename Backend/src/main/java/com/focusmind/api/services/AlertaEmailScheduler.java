package com.focusmind.api.services;

import com.focusmind.api.domain.user.User;
import com.focusmind.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class AlertaEmailScheduler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private GeminiService geminiService;

    // Dispara todo dia às 08:00
    @Scheduled(cron = "0 0 8 * * *")
    public void enviarLembretesManha() {
        System.out.println("[AlertaEmailScheduler] Disparando lembretes da manhã...");
        enviarLembretes("Bom dia");
    }

    // Dispara todo dia às 18:00
    @Scheduled(cron = "0 0 18 * * *")
    public void enviarLembretesTarde() {
        System.out.println("[AlertaEmailScheduler] Disparando lembretes da tarde...");
        enviarLembretes("Boa tarde");
    }

    private void enviarLembretes(String saudacao) {
        List<User> usuarios = userRepository.findAll();

        for (User user : usuarios) {
            // Só envia se tiver matéria cadastrada, e-mail e alertas ativos
            if (user.getMateriaEstudo() == null || user.getMateriaEstudo().isBlank()) continue;
            if (user.getEmail() == null || user.getEmail().isBlank()) continue;
            if (Boolean.FALSE.equals(user.getAlertasEmailAtivo())) continue;

            try {
                int diasRestantes = 30;
                if (user.getDataLimiteEstudo() != null) {
                    diasRestantes = (int) ChronoUnit.DAYS.between(LocalDate.now(), user.getDataLimiteEstudo());
                    if (diasRestantes < 0) continue; // Prazo já passou, não envia
                }

                int horasDia = user.getHorasDiaDisponiveis() != null ? user.getHorasDiaDisponiveis() : 2;

                String mensagemMotivacional = geminiService.gerarMensagemMotivaional(
                    user.getName(),
                    user.getMateriaEstudo(),
                    diasRestantes,
                    horasDia
                );

                emailService.enviarLembrete(
                    user.getEmail(),
                    user.getName(),
                    user.getMateriaEstudo(),
                    mensagemMotivacional
                );

                // Pequena pausa para não sobrecarregar a API do Gemini
                Thread.sleep(2000);

            } catch (Exception e) {
                System.err.println("[AlertaEmailScheduler] Erro ao processar usuario " + user.getId() + ": " + e.getMessage());
            }
        }

        System.out.println("[AlertaEmailScheduler] Lembretes enviados com sucesso!");
    }
}
