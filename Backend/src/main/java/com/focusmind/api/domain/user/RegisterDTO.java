package com.focusmind.api.domain.user;

import java.time.LocalDate;

public record RegisterDTO(
    String name,
    String email,
    String password,
    String materiaEstudo,
    Integer horasDiaDisponiveis,
    LocalDate dataLimiteEstudo,
    Integer tempoTotalEstudoHoras
) {}
