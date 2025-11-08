package com.wallet.clover.repository.game

import com.wallet.clover.domain.game.LottoGame
import com.wallet.clover.entity.game.toDomain
import com.wallet.clover.entity.game.toEntity
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component

@Component
class LottoGameRdbAdaptor(
    private val repository: LottoGameRepository,
) {
    fun byId(id: Long): LottoGame {
        return repository.findByIdOrNull(id)?.toDomain() ?: throw RuntimeException("잘못된 게임 ID 값입니다.")
    }

    fun byUserId(userId: Long): List<LottoGame> {
        return repository.findAllByUserId(userId).map { it.toDomain() }
    }

    fun byTicketId(ticketId: Long): List<LottoGame> {
        return repository.findAllByTicketId(ticketId).map { it.toDomain() }
    }

    fun save(domain: LottoGame) {
        repository.save(domain.toEntity())
    }

    fun saveAll(domains: List<LottoGame>) {
        repository.saveAll(domains.map { it.toEntity() })
    }
}
