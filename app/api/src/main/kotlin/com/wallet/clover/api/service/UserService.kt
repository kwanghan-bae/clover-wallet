package com.wallet.clover.api.service

import com.wallet.clover.api.dto.UpdateUser
import com.wallet.clover.api.dto.User
import com.wallet.clover.api.dto.toResponse
import com.wallet.clover.api.exception.UserNotFoundException
import com.wallet.clover.api.repository.community.CommentRepository
import com.wallet.clover.api.repository.community.PostRepository
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import com.wallet.clover.api.repository.user.UserRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.mapNotNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class UserService(
    private val userRepository: UserRepository,
    private val commentRepository: CommentRepository,
    private val postRepository: PostRepository,
    private val lottoGameRepository: LottoGameRepository,
    private val lottoTicketRepository: LottoTicketRepository,
) {

    fun getAllFcmTokens(): Flow<String> {
        return userRepository.findAll()
            .mapNotNull { it.fcmToken }
            .filter { it.isNotBlank() }
    }

    suspend fun findUser(id: Long): User.Response? {
        return userRepository.findById(id)?.toResponse()
    }

    @Transactional
    suspend fun updateUser(id: Long, request: UpdateUser.Request): User.Response {
        val existingUser = userRepository.findById(id) ?: throw UserNotFoundException("User with id $id not found")
        val updatedUser = existingUser.copy(
            locale = request.locale ?: existingUser.locale,
            age = request.age ?: existingUser.age
        )
        return userRepository.save(updatedUser).toResponse()
    }
    @Transactional
    suspend fun deleteUserAccount(id: Long) {
        // 1. 댓글 삭제
        commentRepository.deleteByUserId(id)

        // 2. 게시글 삭제
        postRepository.deleteByUserId(id)

        // 3. 로또 게임 삭제
        lottoGameRepository.deleteByUserId(id)

        // 4. 로또 티켓 삭제
        lottoTicketRepository.deleteByUserId(id)

        // 5. 사용자 계정 삭제
        userRepository.deleteById(id)
    }
}
