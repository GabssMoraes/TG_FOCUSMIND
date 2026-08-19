package com.focusmind.api.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    public void enviarEmail(String para, String assunto, String corpoHtml) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(para);
            helper.setSubject(assunto);
            helper.setText(corpoHtml, true);
            mailSender.send(message);
            System.out.println("[EmailService] E-mail enviado para: " + para);
        } catch (Exception e) {
            System.err.println("[EmailService] Erro ao enviar e-mail para " + para + ": " + e.getMessage());
        }
    }

    public void enviarLembrete(String email, String nome, String materia, String mensagemMotivacional) {
        String html = String.format("""
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8">
                  <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f0f1a; margin: 0; padding: 20px; }
                    .wrapper { max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #7c6cfa, #4ecdc4); padding: 32px; text-align: center; }
                    .logo { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
                    .body { padding: 32px; color: #e0e0f0; }
                    .greeting { font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #ffffff; }
                    .subject-badge { display: inline-block; background: rgba(124,108,250,0.2); border: 1px solid rgba(124,108,250,0.4); color: #a89cf7; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
                    .motivation-box { background: rgba(78,205,196,0.08); border-left: 4px solid #4ecdc4; border-radius: 0 12px 12px 0; padding: 18px 20px; margin: 20px 0; font-size: 15px; line-height: 1.6; color: #c8f8f4; font-style: italic; }
                    .cta-btn { display: block; width: fit-content; margin: 24px auto 0; background: linear-gradient(135deg, #7c6cfa, #4ecdc4); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-weight: 700; font-size: 16px; }
                    .footer { padding: 20px 32px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid rgba(255,255,255,0.06); }
                    .tip { background: rgba(247,213,65,0.08); border-radius: 10px; padding: 14px; margin-top: 20px; font-size: 13px; color: #f7d88a; }
                  </style>
                </head>
                <body>
                  <div class="wrapper">
                    <div class="header">
                      <div class="logo">&#9679; FocusMind</div>
                      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Seu companheiro de estudos</p>
                    </div>
                    <div class="body">
                      <div class="greeting">Ola, %s!</div>
                      <p style="color:#aaa;margin:4px 0 16px;">Hora de continuar sua jornada em:</p>
                      <span class="subject-badge">%s</span>
                      <div class="motivation-box">"%s"</div>
                      <div class="tip">
                        <strong>Dica do dia:</strong> Comece com apenas 10 minutos de foco. Uma vez em movimento, fica mais facil continuar!
                      </div>
                      <a href="http://localhost:5173/dashboard" class="cta-btn">Abrir FocusMind &rarr;</a>
                    </div>
                    <div class="footer">
                      Voce recebeu este e-mail porque esta inscrito nos lembretes do FocusMind.<br>
                      Para parar de receber, acesse seu perfil e desative os alertas.
                    </div>
                  </div>
                </body>
                </html>
                """, nome, materia, mensagemMotivacional);

        enviarEmail(email, "FocusMind - Hora de estudar " + materia + "!", html);
    }
}
