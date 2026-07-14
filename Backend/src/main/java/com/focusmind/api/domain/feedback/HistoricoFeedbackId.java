package com.focusmind.api.domain.feedback;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class HistoricoFeedbackId implements Serializable {
    private Long idFeedback;
    private Long user;
    private Long sessaoEstudo;
}
