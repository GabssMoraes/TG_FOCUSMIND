package com.focusmind.api.domain.baseconhecimento;

import jakarta.persistence.*;
import lombok.*;

@Table(name = "base_conhecimento")
@Entity(name = "BaseConhecimento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class BaseConhecimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "titulo")
    private String titulo;

    @Column(name = "conteudo", columnDefinition = "TEXT")
    private String conteudo;
}
