package com.wallet.clover.api.repository.notification

import com.wallet.clover.api.entity.notification.NotificationEntity
import kotlinx.coroutines.flow.Flow
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface NotificationRepository : CoroutineCrudRepository<NotificationEntity, Long> {
    fun findByUserIdOrderByCreatedAtDesc(userId: Long, pageable: Pageable): Flow<NotificationEntity>
    suspend fun countByUserId(userId: Long): Long
    suspend fun countByUserIdAndIsReadFalse(userId: Long): Long
}
