package com.wallet.clover.repository.lottospot

import com.wallet.clover.entity.lottospot.LottoSpotEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface LottoSpotJpaRepository : JpaRepository<LottoSpotEntity, Long> {
    // Custom query methods can be added here if needed
    // For example, to find spots within a certain radius,
    // but for now, we'll rely on the adaptor to handle the logic.
}
