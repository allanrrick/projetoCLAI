package com.projetoCLAI.pei.repository;

import com.projetoCLAI.pei.Afinidades;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AfinidadesRepository extends JpaRepository<Afinidades, Long> {
}
