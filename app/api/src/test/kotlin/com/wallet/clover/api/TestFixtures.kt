package com.wallet.clover.api

import com.wallet.clover.api.domain.extraction.ExtractionMethod
import com.wallet.clover.api.entity.community.CommentEntity
import com.wallet.clover.api.entity.community.PostEntity
import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.entity.lottospot.LottoSpotEntity
import com.wallet.clover.api.entity.ticket.LottoTicketEntity
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import com.wallet.clover.api.entity.user.UserEntity
import com.wallet.clover.api.entity.winning.WinningInfoEntity
import java.time.LocalDate
import java.time.LocalDateTime

object TestFixtures {
    fun createUser(
        id: Long = 1L,
        ssoQualifier: String = "test-sso",
        locale: String = "en",
        age: Int = 30,
        fcmToken: String? = null
    ) = UserEntity(
        id = id,
        ssoQualifier = ssoQualifier,
        locale = locale,
        age = age,
        fcmToken = fcmToken,
        createdAt = LocalDateTime.now().withNano(0),
        updatedAt = LocalDateTime.now().withNano(0)
    )

    fun createPost(
        id: Long = 1L,
        userId: Long = 1L,
        content: String = "Test Content",
        viewCount: Int = 0,
        likeCount: Int = 0
    ) = PostEntity(
        id = id,
        userId = userId,
        content = content,
        viewCount = viewCount,
        likeCount = likeCount,
        createdAt = LocalDateTime.now().withNano(0),
        updatedAt = LocalDateTime.now().withNano(0)
    )

    fun createComment(
        id: Long = 1L,
        postId: Long = 1L,
        userId: Long = 1L,
        content: String = "Test Comment"
    ) = CommentEntity(
        id = id,
        postId = postId,
        userId = userId,
        content = content,
        createdAt = LocalDateTime.now().withNano(0),
        updatedAt = LocalDateTime.now().withNano(0)
    )

    fun createLottoSpot(
        id: Long = 1L,
        name: String = "Test Spot",
        address: String = "Test Address",
        latitude: Double = 37.0,
        longitude: Double = 127.0
    ) = LottoSpotEntity(
        id = id,
        name = name,
        address = address,
        latitude = latitude,
        longitude = longitude,
        createdAt = LocalDateTime.now().withNano(0),
        updatedAt = LocalDateTime.now().withNano(0)
    )

    fun createWinningInfo(
        id: Long = 1L,
        round: Int = 1000,
        drawDate: LocalDate = LocalDate.now(),
        number1: Int = 1,
        number2: Int = 2,
        number3: Int = 3,
        number4: Int = 4,
        number5: Int = 5,
        number6: Int = 6,
        bonusNumber: Int = 7,
        firstPrizeAmount: Long = 1000000000,
        secondPrizeAmount: Long = 50000000,
        thirdPrizeAmount: Long = 1500000,
        fourthPrizeAmount: Long = 50000,
        fifthPrizeAmount: Long = 5000
    ) = WinningInfoEntity(
        id = id,
        round = round,
        drawDate = drawDate,
        number1 = number1,
        number2 = number2,
        number3 = number3,
        number4 = number4,
        number5 = number5,
        number6 = number6,
        bonusNumber = bonusNumber,
        firstPrizeAmount = firstPrizeAmount,
        secondPrizeAmount = secondPrizeAmount,
        thirdPrizeAmount = thirdPrizeAmount,
        fourthPrizeAmount = fourthPrizeAmount,
        fifthPrizeAmount = fifthPrizeAmount
    )

    fun createLottoTicket(
        id: Long = 1L,
        userId: Long = 1L,
        url: String = "http://example.com/ticket.jpg",
        ordinal: Int = 1000,
        status: LottoTicketStatus = LottoTicketStatus.STASHED
    ) = LottoTicketEntity(
        id = id,
        userId = userId,
        url = url,
        ordinal = ordinal,
        status = status,
        createdAt = LocalDateTime.now().withNano(0),
        updatedAt = LocalDateTime.now().withNano(0)
    )

    fun createLottoGame(
        id: Long = 1L,
        userId: Long = 1L,
        ticketId: Long = 1L,
        status: LottoGameStatus = LottoGameStatus.LOSING,
        number1: Int = 1,
        number2: Int = 2,
        number3: Int = 3,
        number4: Int = 4,
        number5: Int = 5,
        number6: Int = 6,
        extractionMethod: ExtractionMethod? = null,
        prizeAmount: Long = 0
    ) = LottoGameEntity(
        id = id,
        userId = userId,
        ticketId = ticketId,
        status = status,
        number1 = number1,
        number2 = number2,
        number3 = number3,
        number4 = number4,
        number5 = number5,
        number6 = number6,
        extractionMethod = extractionMethod,
        prizeAmount = prizeAmount,
        createdAt = LocalDateTime.now().withNano(0),
        updatedAt = LocalDateTime.now().withNano(0)
    )
}
