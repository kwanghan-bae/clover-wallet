package com.wallet.clover.api

import com.wallet.clover.api.entity.community.CommentEntity
import com.wallet.clover.api.entity.community.PostEntity
import com.wallet.clover.api.entity.lottospot.LottoSpotEntity
import com.wallet.clover.api.entity.user.UserEntity
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
}
