package com.focusmind.api.domain.user;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Table(name = "\"USUARIOS\"")
@Entity(name = "USUARIOS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"ID_USUARIO\"")
    private Long id;

    @Column(name = "\"NOME\"", nullable = false)
    private String name;

    @Column(name = "\"EMAIL\"", nullable = false, unique = true)
    private String email;

    @Column(name = "\"SENHA\"", nullable = false)
    private String password;

    @Column(name = "\"DT_CADASTRO\"")
    private LocalDateTime dtCadastro = LocalDateTime.now();

    @Column(name = "\"NIVEL\"")
    private Long nivel = 1L;

    @Column(name = "\"PONTOS\"")
    private Integer pontos = 0;

    @Column(name = "\"STREAK_DIAS\"")
    private Integer streakDias = 0;

    @Column(name = "\"OBJ_PRINCIPAL\"")
    private String objPrincipal;

    // ── Perfil de Estudo ──
    @Column(name = "\"MATERIA_ESTUDO\"")
    private String materiaEstudo;

    @Column(name = "\"HORAS_DIA_DISPONIVEIS\"")
    private Integer horasDiaDisponiveis;

    @Column(name = "\"DATA_LIMITE_ESTUDO\"")
    private LocalDate dataLimiteEstudo;

    @Column(name = "\"TEMPO_TOTAL_ESTUDO_HORAS\"")
    private Integer tempoTotalEstudoHoras;

    @Column(name = "\"ALERTAS_EMAIL_ATIVO\"")
    private Boolean alertasEmailAtivo = true;

    // ── Gamificação (Fase 1) ──
    @Column(name = "\"ULTIMO_ACESSO\"")
    private LocalDate ultimoAcesso;

    @Column(name = "\"BAUS_DISPONIVEIS\"")
    private Integer bausDisponiveis = 0;
}

